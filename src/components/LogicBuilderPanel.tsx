
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Settings, Save } from "lucide-react";

interface Condition {
  id: string;
  type: string;
  threshold: string;
  rollingPeriod: string;
  verificationSource: string;
}

interface LogicBuilderPanelProps {
  templateTitle: string;
  onClose: () => void;
  onComplete?: (conditions: Condition[]) => void;
}

export function LogicBuilderPanel({ templateTitle, onClose, onComplete }: LogicBuilderPanelProps) {
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: "1",
      type: "",
      threshold: "",
      rollingPeriod: "30 days",
      verificationSource: "Saastain MRV feed"
    }
  ]);

  const conditionTypes = [
    "Cooking Hours",
    "Uptime",
    "CO₂ Reduction", 
    "Steam Output",
    "Fuel Savings",
    "Temperature Readings",
    "Usage Frequency"
  ];

  const rollingPeriods = [
    "7 days",
    "30 days", 
    "60 days",
    "90 days",
    "Custom"
  ];

  const verificationSources = [
    "Saastain MRV feed",
    "Verifier Upload",
    "Manual Entry",
    "Third-party API"
  ];

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      type: "",
      threshold: "",
      rollingPeriod: "30 days",
      verificationSource: "Saastain MRV feed"
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(condition => condition.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    setConditions(conditions.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  const getValidConditions = () => {
    return conditions.filter(c => c.type && c.threshold);
  };

  const handleSave = () => {
    const validConditions = getValidConditions();
    if (onComplete) {
      onComplete(validConditions);
    }
  };

  return (
    <div className="space-y-6">
      {/* Conditions Configuration */}
      <div className="space-y-6">
        {conditions.map((condition, index) => (
          <div key={condition.id} className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Condition {index + 1}</h4>
              {conditions.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`condition-type-${condition.id}`}>Condition Type</Label>
                <Select 
                  value={condition.type} 
                  onValueChange={(value) => updateCondition(condition.id, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`threshold-${condition.id}`}>Threshold</Label>
                <Input
                  id={`threshold-${condition.id}`}
                  type="number"
                  placeholder="Enter threshold value"
                  value={condition.threshold}
                  onChange={(e) => updateCondition(condition.id, "threshold", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`rolling-period-${condition.id}`}>Rolling Period</Label>
                <Select 
                  value={condition.rollingPeriod} 
                  onValueChange={(value) => updateCondition(condition.id, "rollingPeriod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rollingPeriods.map((period) => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`verification-source-${condition.id}`}>Verification Source</Label>
                <Select 
                  value={condition.verificationSource} 
                  onValueChange={(value) => updateCondition(condition.id, "verificationSource", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationSources.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addCondition} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Condition
        </Button>
      </div>

      {/* Logic Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Logic Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-accent/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              This tranche will trigger when <strong>all</strong> selected conditions are met:
            </p>
            {getValidConditions().length > 0 ? (
              <div className="space-y-2">
                {getValidConditions().map((condition, index) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {condition.type} ≥ {condition.threshold}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      over {condition.rollingPeriod} via {condition.verificationSource}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Add conditions above to see the logic summary
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose}>
          Back
        </Button>
        <Button onClick={handleSave} disabled={getValidConditions().length === 0}>
          <Save className="w-4 h-4 mr-2" />
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
