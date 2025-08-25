
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Zap, 
  FileCheck, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Target,
  AlertTriangle
} from "lucide-react";
import { useProjectContext } from './ProjectContextProvider';

interface TemplateWithProjection {
  id: number;
  title: string;
  description: string;
  triggers: string[];
  complexity: string;
  icon: any;
  color: string;
  recommended: boolean;
  projectedDisbursements: {
    tranche1: { amount: number; timeframe: string; probability: number };
    tranche2: { amount: number; timeframe: string; probability: number };
    tranche3: { amount: number; timeframe: string; probability: number };
  };
  riskLevel: 'low' | 'medium' | 'high';
  complianceRequirements: string[];
}

const enhancedTemplates: TemplateWithProjection[] = [
  {
    id: 1,
    title: "Usage-Based Disbursement",
    description: "Release funds based on verified cooking hours and usage data",
    triggers: ["Cooking Hours", "Steam Output", "Fuel Savings"],
    complexity: "Simple",
    icon: Clock,
    color: "success",
    recommended: true,
    projectedDisbursements: {
      tranche1: { amount: 15000, timeframe: "Month 3", probability: 95 },
      tranche2: { amount: 15000, timeframe: "Month 6", probability: 88 },
      tranche3: { amount: 15000, timeframe: "Month 12", probability: 82 }
    },
    riskLevel: 'low',
    complianceRequirements: ["MRV Verification", "Usage Reports"]
  },
  {
    id: 2,
    title: "Carbon Credit Milestone",
    description: "Disburse tranches when verified carbon credits are issued",
    triggers: ["CO₂ Reduction", "Verra Certification", "Gold Standard"],
    complexity: "Medium",
    icon: Zap,
    color: "finance",
    recommended: false,
    projectedDisbursements: {
      tranche1: { amount: 12000, timeframe: "Month 6", probability: 75 },
      tranche2: { amount: 18000, timeframe: "Month 12", probability: 70 },
      tranche3: { amount: 15000, timeframe: "Month 18", probability: 65 }
    },
    riskLevel: 'medium',
    complianceRequirements: ["Carbon Registry", "Third-party Verification", "Baseline Study"]
  },
  {
    id: 3,
    title: "Performance Hybrid",
    description: "Multi-trigger disbursement combining usage, carbon, and compliance",
    triggers: ["Multi-Criteria", "Weighted Scoring", "Performance Index"],
    complexity: "Advanced",
    icon: TrendingUp,
    color: "primary",
    recommended: false,
    projectedDisbursements: {
      tranche1: { amount: 10000, timeframe: "Month 4", probability: 90 },
      tranche2: { amount: 20000, timeframe: "Month 8", probability: 78 },
      tranche3: { amount: 15000, timeframe: "Month 15", probability: 72 }
    },
    riskLevel: 'high',
    complianceRequirements: ["Comprehensive MRV", "Multi-stakeholder Verification", "Performance Metrics"]
  }
];

interface SmartTemplateSelectorProps {
  onTemplateSelect: (template: TemplateWithProjection) => void;
}

export function SmartTemplateSelector({ onTemplateSelect }: SmartTemplateSelectorProps) {
  const { schoolName, assetType, expectedRevenue } = useProjectContext();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithProjection | null>(null);

  const handleTemplateSelect = (template: TemplateWithProjection) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  return (
    <div className="space-y-6">
      {/* Project Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Project Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">School</p>
              <p className="font-semibold">{schoolName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asset Type</p>
              <p className="font-semibold">{assetType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expected Annual Revenue</p>
              <p className="font-semibold">${(expectedRevenue.payAsYouCook + expectedRevenue.carbonCredits + expectedRevenue.fuelSavings).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {enhancedTemplates.map((template) => {
          const IconComponent = template.icon;
          const totalProjected = Object.values(template.projectedDisbursements).reduce((sum, t) => sum + t.amount, 0);
          
          return (
            <Card 
              key={template.id} 
              className={`border-2 transition-all cursor-pointer group ${
                selectedTemplate?.id === template.id 
                  ? 'border-primary shadow-lg' 
                  : 'hover:border-primary/50'
              } ${template.recommended ? 'ring-2 ring-success/20' : ''}`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${template.color}/10 text-${template.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {template.title}
                        </CardTitle>
                        {template.recommended && (
                          <Badge variant="default" className="bg-success text-success-foreground">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`status-${template.complexity.toLowerCase()}`}>
                          {template.complexity}
                        </Badge>
                        <Badge variant="outline" className={`status-${template.riskLevel}`}>
                          {template.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Projected Disbursements */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">Projected Disbursements</p>
                      <p className="text-sm font-semibold">${totalProjected.toLocaleString()} total</p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(template.projectedDisbursements).map(([key, disbursement]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span>${disbursement.amount.toLocaleString()}</span>
                            <Calendar className="h-3 w-3 text-muted-foreground ml-2" />
                            <span className="text-muted-foreground">{disbursement.timeframe}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={disbursement.probability} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">{disbursement.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Triggers */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Trigger Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.triggers.map((trigger, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Requirements */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Compliance Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.complianceRequirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  {template.riskLevel === 'high' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-warning">High Complexity Template</p>
                        <p className="text-muted-foreground">Requires additional verification steps and longer setup time</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
