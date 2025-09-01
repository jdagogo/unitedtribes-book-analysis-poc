import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { AudiobookProcessor } from "@/components/audiobook-processor";

export default function ProcessAudiobook() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/discover">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discover
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Process Authentic Book
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Upload Merle Haggard's "My House of Memories" text file to create timestamped chapters and entities
            </p>
          </div>
        </div>

        {/* Audiobook Processor */}
        <div className="max-w-6xl mx-auto">
          <AudiobookProcessor />
        </div>
      </div>
    </div>
  );
}