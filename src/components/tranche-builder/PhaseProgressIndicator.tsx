
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useProjectContext } from './ProjectContextProvider';

const phases = [
  { id: 1, title: "Template Selection", description: "Choose disbursement logic" },
  { id: 2, title: "Logic Configuration", description: "Set triggers and conditions" },
  { id: 3, title: "Advanced Setup", description: "Configure approvals and risks" },
  { id: 4, title: "Validation", description: "Test and validate setup" },
  { id: 5, title: "Deployment", description: "Activate tranche" }
];

export function PhaseProgressIndicator() {
  const { currentPhase } = useProjectContext();

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">Tranche Builder Progress</h3>
        <div className="flex items-center gap-2 overflow-x-auto">
          {phases.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <div className="flex items-center gap-3 min-w-fit">
                <div className="flex items-center gap-2">
                  {currentPhase > phase.id ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : currentPhase === phase.id ? (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-background" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${
                      currentPhase >= phase.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {phase.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
                <Badge variant={currentPhase > phase.id ? "default" : "outline"} className="text-xs">
                  {phase.id}
                </Badge>
              </div>
              {index < phases.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
