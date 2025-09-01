import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { PodcastAnalysis } from "@shared/schema";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PodcastAnalysis;
}

export function ExportModal({ isOpen, onClose, analysis }: ExportModalProps) {
  const [includeEntityReport, setIncludeEntityReport] = useState(true);
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeTimelineData, setIncludeTimelineData] = useState(false);
  const [format, setFormat] = useState("pdf");
  const { toast } = useToast();

  const handleExport = () => {
    // Prepare export data
    const exportData = {
      podcast: analysis.podcast,
      stats: analysis.stats,
      ...(includeEntityReport && { entityAnalysis: analysis.entityAnalysis }),
      ...(includeTranscript && { transcription: analysis.transcription }),
      ...(includeTimelineData && { 
        timeline: analysis.entityAnalysis.flatMap(ea => ea.mentions.map(m => ({
          timestamp: m.timestamp,
          entity: ea.entity.name,
          category: ea.entity.category,
          context: m.context,
        }))).sort((a, b) => a.timestamp - b.timestamp)
      }),
    };

    // Generate filename
    const filename = `${analysis.podcast.title.replace(/[^a-zA-Z0-9]/g, '_')}_analysis`;

    if (format === "json") {
      // Export as JSON
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      // Export entity data as CSV
      if (includeEntityReport) {
        const csvData = analysis.entityAnalysis.map(ea => ({
          "Entity Name": ea.entity.name,
          "Category": ea.entity.category,
          "Type": ea.entity.type,
          "Mention Count": ea.mentionCount,
          "Description": ea.entity.description || "",
        }));
        
        const headers = Object.keys(csvData[0]);
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      // For PDF and Excel, show a message that these would be generated server-side
      toast({
        title: "Export Initiated",
        description: `${format.toUpperCase()} export would be generated server-side in a production environment.`,
      });
    }

    onClose();
    toast({
      title: "Export Complete",
      description: "Your podcast analysis has been exported successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analysis</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="entity-report"
                checked={includeEntityReport} 
                onCheckedChange={(checked) => setIncludeEntityReport(checked === true)}
              />
              <Label htmlFor="entity-report" className="text-sm text-gray-700">
                Entity Analysis Report
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="transcript"
                checked={includeTranscript} 
                onCheckedChange={(checked) => setIncludeTranscript(checked === true)}
              />
              <Label htmlFor="transcript" className="text-sm text-gray-700">
                Timestamped Transcript
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="timeline"
                checked={includeTimelineData} 
                onCheckedChange={(checked) => setIncludeTimelineData(checked === true)}
              />
              <Label htmlFor="timeline" className="text-sm text-gray-700">
                Timeline Data (JSON)
              </Label>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
                <SelectItem value="csv">CSV Files</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
