import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WhiteModalTestProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mentions: any[];
}

export function WhiteModalTest({ isOpen, onClose, title, mentions }: WhiteModalTestProps) {
  console.log("🔴 WHITE MODAL TEST - isOpen:", isOpen, "title:", title);
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-xl"
        style={{ 
          backgroundColor: '#ff0000 !important',
          border: '1px solid #e5e7eb',
          background: 'red'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ 
            backgroundColor: '#ffffff',
            borderBottomColor: '#e5e7eb'
          }}
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              RED TEST MODAL - {title}
            </h2>
            <Badge variant="secondary">{mentions.length} mentions</Badge>
            <Badge variant="outline" className="bg-gray-100">webview</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              ← View Full Analysis
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-6 overflow-y-auto max-h-[60vh]"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">TEST WHITE MODAL</h3>
            <p className="text-gray-600">This is a test to confirm white modal styling works.</p>
            <p className="text-gray-600 mt-2">Found {mentions.length} contextual mentions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}