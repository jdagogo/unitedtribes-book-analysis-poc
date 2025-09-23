// Authentic data sources for UnitedTribes contextual navigation engine
export const dataSourcesConfig = {
  // Taste & Cultural Signal Sources
  tasteAndCultural: [
    {
      name: "Official Charts",
      description: "Chart databases and industry stats provide a measure of an artist's popular impact",
      baseUrl: "https://www.officialcharts.com/",
      apiUrl: null,
      category: "charts",
      example: "Sabrina Carpenter's breakthrough in the UK, including her first Number 1 single 'Espresso'",
      navigationTriggers: ["chart positions", "breakthrough moments", "commercial success", "UK market", "number 1 singles"]
    },
    {
      name: "Last.fm",
      description: "Platforms that track listening habits and fan communities reveal taste correlations and popularity metrics",
      baseUrl: "https://www.last.fm/",
      apiUrl: "https://www.last.fm/api",
      category: "listening_data",
      example: "Sabrina Carpenter ranks in global Top Artists with 2.5M+ listeners and 367M scrobbles. Similar Artists: Olivia Rodrigo, Gracie Abrams, Tate McRae",
      navigationTriggers: ["listening habits", "fan communities", "similar artists", "scrobble data", "taste correlations", "discovery patterns"]
    },
    {
      name: "TikTok",
      description: "The primary viral music discovery platform with over 1 billion users",
      baseUrl: "https://www.tiktok.com/",
      apiUrl: "https://developers.tiktok.com/",
      category: "viral_discovery",
      example: "#sabrinacarpenter has 38.2 billion views, 35M followers with highly engaged comments (10k-70k per post)",
      navigationTriggers: ["viral discovery", "social media trends", "user-generated content", "music virality", "cultural moments", "dance trends", "memes"]
    },
    {
      name: "Reddit",
      description: "Provides in-depth fan analysis and taste-making discussions in communities like r/popheads and r/Music",
      baseUrl: "https://www.reddit.com/",
      apiUrl: "https://www.reddit.com/dev/api/",
      category: "fan_analysis",
      example: "Album release threads and daily discussions about Sabrina Carpenter on r/popheads and r/SabrinaCarpenter",
      navigationTriggers: ["fan analysis", "deep discussions", "taste-making", "community insights", "album analysis", "cultural commentary"]
    },
    {
      name: "Billboard",
      description: "Music industry publication providing chart data, news, and year-end lists",
      baseUrl: "https://www.billboard.com/",
      apiUrl: null,
      category: "industry_data",
      example: "'Espresso' ranked #5 on the 2024 Hot 100 Songs year-end chart",
      navigationTriggers: ["industry recognition", "chart performance", "year-end lists", "commercial impact", "industry trends"]
    },
    {
      name: "Rate Your Music",
      description: "Sophisticated music rating platform with detailed user rating data and genre classifications",
      baseUrl: "https://rateyourmusic.com/",
      apiUrl: null,
      category: "critical_analysis",
      example: "Sabrina Carpenter page includes genre votes, user lists, and rating distributions",
      navigationTriggers: ["critical reception", "genre classification", "user ratings", "music criticism", "detailed analysis", "rating distributions"]
    }
  ]
};

// Cross-media navigation pathways using authentic data sources
export const navigationPathways = {
  // Example: "San Quentin" → Johnny Cash ecosystem
  "San Quentin": {
    primaryMedia: {
      type: "location",
      context: "California state prison mentioned in music"
    },
    crossMediaConnections: [
      {
        source: "Official Charts",
        connection: "Johnny Cash's 'At San Quentin' album chart history",
        navigationTrigger: "prison concert albums"
      },
      {
        source: "Last.fm",
        connection: "Similar artists to Johnny Cash who recorded live albums",
        navigationTrigger: "live recording artists"
      },
      {
        source: "Reddit",
        connection: "r/country discussions about prison concerts and outlaw country",
        navigationTrigger: "outlaw country discussions"
      },
      {
        source: "Rate Your Music",
        connection: "Live country albums rated by users, prison song compilations",
        navigationTrigger: "prison-themed music"
      }
    ]
  },

  // Example: "British Invasion" → multi-artist ecosystem
  "British Invasion": {
    primaryMedia: {
      type: "cultural_movement",
      context: "1960s British rock bands conquering American charts"
    },
    crossMediaConnections: [
      {
        source: "Official Charts",
        connection: "Beatles, Stones, Who - UK vs US chart performance comparison",
        navigationTrigger: "transatlantic success"
      },
      {
        source: "Last.fm",
        connection: "Similar artists: Beatles → Rolling Stones → The Who → Kinks pathway",
        navigationTrigger: "British rock lineage"
      },
      {
        source: "TikTok",
        connection: "Viral videos using British Invasion songs, modern covers",
        navigationTrigger: "classic rock on social media"
      },
      {
        source: "Reddit",
        connection: "r/beatles, r/rollingstones deep dives into cultural impact",
        navigationTrigger: "cultural movement analysis"
      }
    ]
  },

  // Example: "Hip-hop origins" → comprehensive ecosystem
  "hip-hop origins": {
    primaryMedia: {
      type: "cultural_movement",
      context: "1970s Bronx birth of hip-hop culture"
    },
    crossMediaConnections: [
      {
        source: "Last.fm",
        connection: "Grandmaster Flash → Afrika Bambaataa → DJ Kool Herc similar artist chains",
        navigationTrigger: "foundational hip-hop artists"
      },
      {
        source: "TikTok",
        connection: "Breakdancing videos, old school hip-hop samples going viral",
        navigationTrigger: "hip-hop culture on social media"
      },
      {
        source: "Reddit",
        connection: "r/hiphopheads discussions about hip-hop history and Questlove's analysis",
        navigationTrigger: "hip-hop historiography"
      },
      {
        source: "Rate Your Music",
        connection: "Essential hip-hop album lists, genre evolution tracking",
        navigationTrigger: "hip-hop canon formation"
      }
    ]
  }
};

// Enhanced partner integrations showing real cross-media discovery
export const partnerIntegrations = {
  // UMG Artists × HarperCollins Books Cross-Navigation
  crossMediaDiscovery: [
    {
      trigger: "Sabrina Carpenter",
      partnerBook: "Short 'n' Sweet Fanbook",
      dataSourceConnections: {
        "TikTok": "38.2B views, #sabrinacarpenter viral content, fan recreations",
        "Last.fm": "2.5M+ listeners, similar to Olivia Rodrigo, Gracie Abrams, Tate McRae",
        "Official Charts": "First UK #1 with 'Espresso', breakthrough moment tracking",
        "Reddit": "r/popheads discussions, album analysis, cultural impact threads"
      },
      navigationPathways: [
        "Espresso → coffee culture TikToks → café music playlists",
        "Disney transition → other Disney star careers → musical evolution",
        "Pop fanbook culture → other artist fanbooks → collector communities"
      ]
    },
    {
      trigger: "Johnny Cash",
      partnerBook: "Cash: The Autobiography",
      dataSourceConnections: {
        "Last.fm": "Prison concert recordings, outlaw country similar artists",
        "Reddit": "r/country discussions about authenticity, social justice themes",
        "Rate Your Music": "At San Quentin ratings, live album rankings"
      },
      navigationPathways: [
        "San Quentin → prison reform documentaries → social justice music",
        "Man in Black → protest fashion → political statements in music",
        "June Carter → country duets → musical partnerships"
      ]
    },
    {
      trigger: "Dave Grohl",
      partnerBook: "The Storyteller",
      dataSourceConnections: {
        "TikTok": "Drum technique videos, Foo Fighters covers, Nirvana tributes",
        "Last.fm": "Nirvana → Foo Fighters → Queens of the Stone Age pathways",
        "Reddit": "r/grunge discussions, rock memoir recommendations",
        "Rate Your Music": "Foo Fighters discography ratings, grunge canon debates"
      },
      navigationPathways: [
        "Nirvana → grunge revival → modern alternative rock",
        "Foo Fighters → arena rock → stadium anthems",
        "Drumming → technique videos → music education"
      ]
    }
  ],

  // Real API Integration Examples
  liveDataExamples: [
    {
      source: "Last.fm API",
      endpoint: "https://ws.audioscrobbler.com/2.0/",
      realTimeData: "Track artist similarities, listening trends, scrobble patterns",
      navigationValue: "Discover music through actual listening behavior patterns"
    },
    {
      source: "TikTok API", 
      endpoint: "https://developers.tiktok.com/",
      realTimeData: "Viral music trends, hashtag volumes, user-generated content",
      navigationValue: "Find music through social media cultural moments"
    },
    {
      source: "Reddit API",
      endpoint: "https://www.reddit.com/dev/api/",
      realTimeData: "Community discussions, taste-making threads, cultural analysis",
      navigationValue: "Navigate through fan communities and cultural commentary"
    }
  ]
};

export default dataSourcesConfig;