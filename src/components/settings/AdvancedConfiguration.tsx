import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Upload, FileText } from "lucide-react";
// Removed AIAgentDashboard - consolidated into main RAG chatbot

interface AdvancedConfigurationProps {
  activeSubsection?: string;
}

export function AdvancedConfiguration({ activeSubsection }: AdvancedConfigurationProps) {
  const renderAIAgentsSection = () => (
    <div className="p-6 text-center">
      <div className="mb-4">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">AI Assistant Consolidated</h3>
      <p className="text-muted-foreground mb-4">
        The AI Assistant has been streamlined and is now available in the RAG Management module 
        with enhanced modes for different user roles.
      </p>
      <Button onClick={() => window.location.href = '/financed-emissions/rag-management'}>
        <Brain className="h-4 w-4 mr-2" />
        Go to Enhanced AI Assistant
      </Button>
    </div>
  );

  const renderClientDocsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Client Documents Management
        </CardTitle>
        <CardDescription>
          Upload and manage client-specific documents and templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-sm flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload Client Documents</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <div className="space-y-2">
            <Input 
              type="file" 
              multiple 
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="max-w-sm mx-auto"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB each)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Uploaded Documents</h4>
            <Button variant="outline" size="sm">
              Refresh List
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Client_Template_Q4_2024.xlsx</p>
                  <p className="text-xs text-muted-foreground">Uploaded 2 days ago • 2.4 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Download</Button>
                <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium text-sm">Portfolio_Guidelines.pdf</p>
                  <p className="text-xs text-muted-foreground">Uploaded 1 week ago • 1.8 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Download</Button>
                <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm">PCAF_Methodology_Update.docx</p>
                  <p className="text-xs text-muted-foreground">Uploaded 2 weeks ago • 3.1 MB</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Download</Button>
                <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Clear All</Button>
          <Button>Process Documents</Button>
        </div>
      </CardContent>
    </Card>
  );

  if (activeSubsection === "client-docs") {
    return <div className="space-y-6">{renderClientDocsSection()}</div>;
  }

  // Default to AI agents or show all if no subsection
  if (activeSubsection === "ai-agents" || !activeSubsection) {
    return (
      <div className="space-y-6">
        {renderAIAgentsSection()}
        {!activeSubsection && renderClientDocsSection()}
      </div>
    );
  }

  return null;
}