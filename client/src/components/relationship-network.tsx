import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PodcastAnalysis } from "@shared/schema";

interface RelationshipNetworkProps {
  analysis: PodcastAnalysis;
}

export function RelationshipNetwork({ analysis }: RelationshipNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !analysis.insights.entityNetwork) return;

    const svg = svgRef.current;
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const network = analysis.insights.entityNetwork as any;
    const nodes = network.nodes || [];
    const edges = network.edges || [];

    if (nodes.length === 0) {
      // Show message when no network data
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", centerX.toString());
      text.setAttribute("y", centerY.toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "fill-gray-500 text-sm");
      text.textContent = "No entity relationships found";
      svg.appendChild(text);
      return;
    }

    // Simple circle layout for nodes
    const radius = Math.min(width, height) * 0.3;
    const angleStep = (2 * Math.PI) / nodes.length;

    // Draw edges first (so they appear behind nodes)
    edges.forEach((edge: any) => {
      const sourceIndex = nodes.findIndex((n: any) => n.id === edge.source);
      const targetIndex = nodes.findIndex((n: any) => n.id === edge.target);
      
      if (sourceIndex >= 0 && targetIndex >= 0) {
        const sourceX = centerX + radius * Math.cos(sourceIndex * angleStep);
        const sourceY = centerY + radius * Math.sin(sourceIndex * angleStep);
        const targetX = centerX + radius * Math.cos(targetIndex * angleStep);
        const targetY = centerY + radius * Math.sin(targetIndex * angleStep);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", sourceX.toString());
        line.setAttribute("y1", sourceY.toString());
        line.setAttribute("x2", targetX.toString());
        line.setAttribute("y2", targetY.toString());
        line.setAttribute("stroke", "#e5e7eb");
        line.setAttribute("stroke-width", Math.max(1, (edge.weight || 1) / 2).toString());
        line.setAttribute("opacity", "0.6");
        svg.appendChild(line);
      }
    });

    // Draw nodes
    nodes.forEach((node: any, index: number) => {
      const x = centerX + radius * Math.cos(index * angleStep);
      const y = centerY + radius * Math.sin(index * angleStep);
      const importance = node.importance || 50;
      const nodeRadius = Math.max(8, importance / 10);

      // Node circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", nodeRadius.toString());
      circle.setAttribute("fill", "#3b82f6");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "2");
      circle.setAttribute("class", "cursor-pointer");
      svg.appendChild(circle);

      // Node label
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x.toString());
      text.setAttribute("y", (y + nodeRadius + 15).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "fill-gray-700 text-xs font-medium");
      text.textContent = node.id.length > 12 ? node.id.substring(0, 12) + "..." : node.id;
      svg.appendChild(text);
    });

  }, [analysis]);

  // Get relationship stats
  const relationships = analysis.entityAnalysis.flatMap(ea => ea.relationships || []);
  const relationshipTypes = Array.from(new Set(relationships.map(r => r.relationshipType)));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Entity Relationship Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <svg
              ref={svgRef}
              width={600}
              height={400}
              className="border rounded-lg bg-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total Entities:</span>
              <span className="ml-2">{analysis.stats.totalEntities}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Relationships:</span>
              <span className="ml-2">{analysis.insights?.entityNetwork?.edges?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Network Density:</span>
              <span className="ml-2">{analysis.stats.networkDensity}%</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Connection Types:</span>
              <span className="ml-2">{relationshipTypes.length}</span>
            </div>
          </div>

          {relationshipTypes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Relationship Types:</h4>
              <div className="flex flex-wrap gap-2">
                {relationshipTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}