
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";

interface ScenarioResult {
  scenario: string;
  probability: number;
  disbursementAmount: number;
  timeframe: string;
  riskFactors: string[];
}

interface ScenarioSimulatorProps {
  conditions: Array<{
    type: string;
    threshold: string;
    rollingPeriod: string;
  }>;
}

export function ScenarioSimulator({ conditions }: ScenarioSimulatorProps) {
  const [cookingHours, setCookingHours] = useState([180]);
  const [co2Reduction, setCo2Reduction] = useState([25]);
  const [uptimePercentage, setUptimePercentage] = useState([85]);

  const runSimulation = (): ScenarioResult[] => {
    return [
      {
        scenario: "Optimistic",
        probability: 85,
        disbursementAmount: 15000,
        timeframe: "Month 3",
        riskFactors: []
      },
      {
        scenario: "Realistic",
        probability: 72,
        disbursementAmount: 12000,
        timeframe: "Month 4",
        riskFactors: ["Weather dependency"]
      },
      {
        scenario: "Conservative",
        probability: 58,
        disbursementAmount: 8000,
        timeframe: "Month 6",
        riskFactors: ["Usage adoption", "Technical issues"]
      }
    ];
  };

  const scenarios = runSimulation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Scenario Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Monthly Cooking Hours</label>
            <div className="px-3">
              <Slider
                value={cookingHours}
                onValueChange={setCookingHours}
                max={300}
                min={50}
                step={10}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">{cookingHours[0]} hours</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CO₂ Reduction (%)</label>
            <div className="px-3">
              <Slider
                value={co2Reduction}
                onValueChange={setCo2Reduction}
                max={50}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">{co2Reduction[0]}% reduction</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System Uptime (%)</label>
            <div className="px-3">
              <Slider
                value={uptimePercentage}
                onValueChange={setUptimePercentage}
                max={100}
                min={60}
                step={5}
                className="w-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">{uptimePercentage[0]}% uptime</p>
          </div>
        </div>

        {/* Scenario Results */}
        <div className="space-y-4">
          <h4 className="font-medium">Disbursement Scenarios</h4>
          {scenarios.map((scenario, index) => (
            <div key={index} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    scenario.scenario === "Optimistic" ? "default" : 
                    scenario.scenario === "Realistic" ? "secondary" : "outline"
                  }>
                    {scenario.scenario}
                  </Badge>
                  {scenario.riskFactors.length === 0 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">${scenario.disbursementAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Success Probability</span>
                  <span>{scenario.probability}%</span>
                </div>
                <Progress value={scenario.probability} className="h-2" />
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Expected Timeframe</span>
                  <span>{scenario.timeframe}</span>
                </div>
                
                {scenario.riskFactors.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Risk Factors: </span>
                    <span className="text-warning">{scenario.riskFactors.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full">
          Export Scenario Analysis
        </Button>
      </CardContent>
    </Card>
  );
}
