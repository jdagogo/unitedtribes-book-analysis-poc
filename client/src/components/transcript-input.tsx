import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Upload } from "lucide-react";
import { ObjectUploader } from "./ObjectUploader";

interface TranscriptInputProps {
  onSubmit: (data: { title: string; showName: string; transcript: string; duration?: number }) => void;
  onPDFSubmit: (data: { pdfUrl: string; title?: string; showName?: string; duration?: number }) => void;
  isLoading: boolean;
}

export function TranscriptInput({ onSubmit, onPDFSubmit, isLoading }: TranscriptInputProps) {
  const [title, setTitle] = useState("");
  const [showName, setShowName] = useState("");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState("");
  
  // PDF upload state
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfShowName, setPdfShowName] = useState("");
  const [pdfDuration, setPdfDuration] = useState("");
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && showName.trim() && transcript.trim()) {
      onSubmit({
        title: title.trim(),
        showName: showName.trim(),
        transcript: transcript.trim(),
        duration: duration ? parseInt(duration) : undefined
      });
    }
  };

  const handlePDFSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedPdfUrl.trim()) {
      onPDFSubmit({
        pdfUrl: uploadedPdfUrl.trim(),
        // Optional metadata - will be auto-extracted from PDF if not provided
        title: pdfTitle.trim() || undefined,
        showName: pdfShowName.trim() || undefined,
        duration: pdfDuration ? parseInt(pdfDuration) : undefined
      });
    }
  };

  const handlePDFUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      console.log('PDF upload completed:', uploadedFile);
      // Use the upload URL directly - the backend will normalize it
      setUploadedPdfUrl(uploadedFile.uploadURL);
    }
  };

  const getUploadParameters = async () => {
    const response = await fetch('/api/objects/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const isValid = title.trim() && showName.trim() && transcript.trim() && transcript.length > 50;
  const isPDFValid = uploadedPdfUrl.trim(); // Only PDF URL is required

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Direct Transcript Analysis</CardTitle>
        <CardDescription>
          Paste your podcast transcript or upload a PDF to get immediate entity analysis and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Episode Title</label>
                  <Input
                    placeholder="Enter episode title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Show Name</label>
                  <Input
                    placeholder="Enter podcast show name..."
                    value={showName}
                    onChange={(e) => setShowName(e.target.value)}
                    disabled={isLoading}
                    className="text-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes, optional)</label>
                <Input
                  type="number"
                  placeholder="45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isLoading}
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transcript</label>
                <Textarea
                  placeholder="Paste the full podcast transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={isLoading}
                  rows={12}
                  className="resize-vertical"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {transcript.length} characters • Minimum 50 characters required
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isValid}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze Transcript
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="pdf">
            <form onSubmit={handlePDFSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Episode Title (optional)</label>
                  <Input
                    placeholder="Auto-extracted from PDF, or enter manually..."
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    disabled={isLoading}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Show Name (optional)</label>
                  <Input
                    placeholder="Auto-extracted from PDF, or enter manually..."
                    value={pdfShowName}
                    onChange={(e) => setPdfShowName(e.target.value)}
                    disabled={isLoading}
                    className="text-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes, optional)</label>
                <Input
                  type="number"
                  placeholder="45"
                  value={pdfDuration}
                  onChange={(e) => setPdfDuration(e.target.value)}
                  disabled={isLoading}
                  className="w-32"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Upload PDF Transcript</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  {uploadedPdfUrl ? (
                    <div className="space-y-2">
                      <div className="text-green-600 dark:text-green-400">
                        ✓ PDF uploaded successfully
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Ready for analysis - metadata will be auto-extracted from PDF
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedPdfUrl("")}
                      >
                        Upload Different PDF
                      </Button>
                    </div>
                  ) : (
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={52428800} // 50MB
                      allowedFileTypes={['application/pdf']}
                      onGetUploadParameters={getUploadParameters}
                      onComplete={handlePDFUploadComplete}
                      buttonClassName="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload PDF File
                    </ObjectUploader>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Maximum file size: 50MB • PDF files only
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isPDFValid}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing PDF...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Analyze PDF Transcript
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}