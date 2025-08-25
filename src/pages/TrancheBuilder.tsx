
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogicBuilderPanel } from "@/components/LogicBuilderPanel";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

// New enhanced components
import { ProjectContextProvider, useProjectContext } from "@/components/tranche-builder/ProjectContextProvider";
import { PhaseProgressIndicator } from "@/components/tranche-builder/PhaseProgressIndicator";
import { SmartTemplateSelector } from "@/components/tranche-builder/SmartTemplateSelector";
import { ScenarioSimulator } from "@/components/tranche-builder/ScenarioSimulator";
import { ValidationDashboard } from "@/components/tranche-builder/ValidationDashboard";

interface TemplateData {
  id: number;
  title: string;
  description: string;
  triggers: string[];
  complexity: string;
}

function TrancheBuilderContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'PRJ-001';
  
  const { currentPhase, setCurrentPhase } = useProjectContext();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [conditions, setConditions] = useState<Array<{
    type: string;
    threshold: string;
    rollingPeriod: string;
  }>>([]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCurrentPhase(2);
  };

  const handleLogicComplete = (configuredConditions: any[]) => {
    setConditions(configuredConditions);
    setCurrentPhase(3);
  };

  const handleAdvancedComplete = () => {
    setCurrentPhase(4);
  };

  const handleValidationComplete = () => {
    setCurrentPhase(5);
    // Navigate to deployment success or back to project
    navigate(`/green-finance/projects/${projectId}?tranche_created=true`);
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 1:
        return <SmartTemplateSelector onTemplateSelect={handleTemplateSelect} />;
      
      case 2:
        return selectedTemplate ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configure Disbursement Logic</CardTitle>
                <CardDescription>
                  Set up triggers and conditions for {selectedTemplate.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogicBuilderPanel
                  templateTitle={selectedTemplate.title}
                  onClose={() => setCurrentPhase(1)}
                  onComplete={handleLogicComplete}
                />
              </CardContent>
            </Card>
          </div>
        ) : null;
      
      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  Set up approval workflows, risk management, and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ScenarioSimulator conditions={conditions} />
                  <div className="flex gap-3">
                    <Button onClick={() => setCurrentPhase(2)} variant="outline">
                      Back to Logic
                    </Button>
                    <Button onClick={handleAdvancedComplete}>
                      Continue to Validation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation & Testing</CardTitle>
                <CardDescription>
                  Validate configuration and run sandbox tests before deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValidationDashboard onValidationComplete={handleValidationComplete} />
              </CardContent>
            </Card>
          </div>
        );
      
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Deployment Successful</CardTitle>
              <CardDescription>
                Your tranche has been successfully deployed and is now active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg font-semibold mb-2">Tranche Successfully Deployed!</p>
                <p className="text-muted-foreground mb-6">
                  Your disbursement logic is now active and monitoring for trigger conditions.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/tranches')}>
                    View All Tranches
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/green-finance/projects/${projectId}`)}
                  >
                    Back to Project
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return <SmartTemplateSelector onTemplateSelect={handleTemplateSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/green-finance/projects/${projectId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tranche Builder</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Design Results-Based Finance Rules with Precision
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <PhaseProgressIndicator />
        {renderCurrentPhase()}
      </div>
    </div>
  );
}

export default function TrancheBuilder() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || 'PRJ-001';

  return (
    <ProjectContextProvider projectId={projectId}>
      <TrancheBuilderContent />
    </ProjectContextProvider>
  );
}
