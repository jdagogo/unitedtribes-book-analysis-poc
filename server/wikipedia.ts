import fetch from 'node-fetch';

export interface WikipediaPage {
  title: string;
  extract: string;
  url: string;
  links: string[];
  categories: string[];
  infobox?: Record<string, string>;
}

export interface WikipediaRelationship {
  sourceEntity: string;
  targetEntity: string;
  relationshipType: 'mentioned_in' | 'linked_to' | 'category_shared';
  context: string;
  confidence: number;
}

export class WikipediaService {
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1/page';
  private searchUrl = 'https://en.wikipedia.org/w/api.php';
  private cache = new Map<string, WikipediaPage>();
  
  // Rate limiting
  private lastRequest = 0;
  private minInterval = 100; // 100ms between requests

  private async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
    }
    this.lastRequest = Date.now();
  }

  async searchWikipediaPage(entityName: string, entityType: string): Promise<string | null> {
    await this.rateLimit();
    
    try {
      // Search for the most relevant Wikipedia page
      const searchQuery = entityType === 'musician' ? `${entityName} singer musician` : entityName;
      const searchParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: searchQuery,
        srlimit: '5'
      });

      const searchResponse = await fetch(`${this.searchUrl}?${searchParams}`);
      const searchData = await searchResponse.json() as any;
      
      if (searchData.query?.search?.length > 0) {
        // Return the most relevant title
        return searchData.query.search[0].title;
      }
      
      return null;
    } catch (error) {
      console.error(`Wikipedia search error for ${entityName}:`, error);
      return null;
    }
  }

  async getWikipediaPage(title: string): Promise<WikipediaPage | null> {
    if (this.cache.has(title)) {
      return this.cache.get(title)!;
    }

    await this.rateLimit();

    try {
      // Get page summary
      const summaryResponse = await fetch(`${this.baseUrl}/summary/${encodeURIComponent(title)}`);
      const summaryData = await summaryResponse.json() as any;

      if (summaryData.type === 'disambiguation') {
        return null; // Skip disambiguation pages
      }

      // Get page content with links
      const contentResponse = await fetch(`${this.baseUrl}/html/${encodeURIComponent(title)}`);
      const contentData = await contentResponse.text();

      // Extract links from content
      const links = this.extractWikipediaLinks(contentData);
      
      // Get categories
      const categoriesResponse = await fetch(`${this.searchUrl}?action=query&format=json&prop=categories&titles=${encodeURIComponent(title)}&cllimit=50`);
      const categoriesData = await categoriesResponse.json() as any;
      
      const pageId = Object.keys(categoriesData.query?.pages || {})[0];
      const categories = categoriesData.query?.pages?.[pageId]?.categories?.map((cat: any) => cat.title.replace('Category:', '')) || [];

      const page: WikipediaPage = {
        title: summaryData.title,
        extract: summaryData.extract || '',
        url: summaryData.content_urls?.desktop?.page || '',
        links,
        categories
      };

      this.cache.set(title, page);
      return page;
    } catch (error) {
      console.error(`Wikipedia fetch error for ${title}:`, error);
      return null;
    }
  }

  private extractWikipediaLinks(htmlContent: string): string[] {
    const linkRegex = /<a[^>]*href="\/wiki\/([^"#]*)"[^>]*>/g;
    const links = new Set<string>();
    let match;

    while ((match = linkRegex.exec(htmlContent)) !== null) {
      const link = decodeURIComponent(match[1]).replace(/_/g, ' ');
      // Filter out common Wikipedia namespace pages
      if (!link.includes(':') && !link.startsWith('File:') && !link.startsWith('Category:')) {
        links.add(link);
      }
    }

    return Array.from(links);
  }

  async findEntityRelationships(
    sourceEntity: { name: string; type: string; category: string },
    targetEntities: Array<{ name: string; type: string; category: string }>
  ): Promise<WikipediaRelationship[]> {
    const relationships: WikipediaRelationship[] = [];
    
    // Get Wikipedia page for source entity
    const wikipediaTitle = await this.searchWikipediaPage(sourceEntity.name, sourceEntity.category);
    if (!wikipediaTitle) return relationships;

    const wikipediaPage = await this.getWikipediaPage(wikipediaTitle);
    if (!wikipediaPage) return relationships;

    // Check for mentions of target entities
    for (const targetEntity of targetEntities) {
      // Check if target entity is linked in the Wikipedia page
      const isLinked = wikipediaPage.links.some(link => 
        this.entityMatchesWikipediaTitle(targetEntity.name, link)
      );

      if (isLinked) {
        relationships.push({
          sourceEntity: sourceEntity.name,
          targetEntity: targetEntity.name,
          relationshipType: 'linked_to',
          context: `${targetEntity.name} is referenced in ${sourceEntity.name}'s Wikipedia page`,
          confidence: 90
        });
      }

      // Check if mentioned in extract
      const mentionedInExtract = wikipediaPage.extract.toLowerCase().includes(targetEntity.name.toLowerCase());
      if (mentionedInExtract && !isLinked) {
        relationships.push({
          sourceEntity: sourceEntity.name,
          targetEntity: targetEntity.name,
          relationshipType: 'mentioned_in',
          context: `${targetEntity.name} is mentioned in ${sourceEntity.name}'s Wikipedia summary`,
          confidence: 75
        });
      }
    }

    return relationships;
  }

  private entityMatchesWikipediaTitle(entityName: string, wikipediaTitle: string): boolean {
    const normalizedEntity = entityName.toLowerCase().replace(/[^\w\s]/g, '');
    const normalizedTitle = wikipediaTitle.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Exact match
    if (normalizedEntity === normalizedTitle) return true;
    
    // Check if entity name is contained in title
    if (normalizedTitle.includes(normalizedEntity)) return true;
    
    // Check if title is contained in entity name
    if (normalizedEntity.includes(normalizedTitle)) return true;
    
    return false;
  }

  async getEntityWikipediaContext(entityName: string, entityCategory: string): Promise<{
    summary: string;
    url: string;
    relatedEntities: string[];
  } | null> {
    const wikipediaTitle = await this.searchWikipediaPage(entityName, entityCategory);
    if (!wikipediaTitle) return null;

    const wikipediaPage = await this.getWikipediaPage(wikipediaTitle);
    if (!wikipediaPage) return null;

    return {
      summary: wikipediaPage.extract,
      url: wikipediaPage.url,
      relatedEntities: wikipediaPage.links.slice(0, 20) // Top 20 related entities
    };
  }
}