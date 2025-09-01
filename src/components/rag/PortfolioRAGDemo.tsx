import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Target
} from 'lucide-react';

export function PortfolioRAGDemo() {
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    {
      title: "Platform RAG Knowledge",
      description: "PCAF methodology, regulations, and best practices",
      icon: Database,
      color: "bg-blue-500",
      content: [
        "PCAF Global Standard documents",
        "Motor Vehicle Methodology",
        "Data Quality Assessment guides",
        "TCFD compliance requirements",
        "Emission factor databases"
      ]
    },
    {
      title: "Client RAG Knowledge", 
      description: "Your portfolio data and loan records",
      icon: Users,
      color: "bg-green-500",
      content: [
        "2,847 loan records uploaded",
        "Vehicle specifications for 1,892 loans",
        "Average data quality score: 2.8",
        "Total portfolio value: $156M",
        "423 loans need data improvements"
      ]
    },
    {
      title: "Contextual AI Analysis",
      description: "Combined insights from both knowledge bases",
      icon: Brain,
      color: "bg-purple-500",
      content: [
        "Cross-references your data with PCAF standards",
        "Identifies specific improvement opportunities",
        "Provides portfolio-specific recommendations",
        "Explains methodology in your context",
        "Prioritizes actions based on your loans"
      ]
    }
  ];

  const exampleQueries = [
    {
      query: "How can I improve my portfolio data quality?",
      response: "Based on your portfolio of 2,847 loans with average PCAF score 2.8:\n\n**Your Current Status:** ✅ Compliant (score ≤ 3.0)\n\n**Improvement Opportunities:**\n• 423 loans could move from Option 5→4 by adding vehicle specifications\n• Focus on your 156 highest-value loans first for maximum impact\n• Collecting make/model/year data would improve 67% of your portfolio\n\n**PCAF Methodology:** Data quality improves by moving up the hierarchy: Option 5 (asset class average) → Option 4 (vehicle type) → Option 3 (vehicle specs) → Option 2 (mileage data) → Option 1 (real consumption)",
      sources: ["Your Portfolio Analysis", "PCAF Data Quality Guide", "Motor Vehicle Methodology"]
    },
    {
      query: "What are attribution factors?",
      response: "**Attribution Factors in PCAF:**\nAttribution Factor = Outstanding Amount ÷ Asset Value\n\n**In Your Portfolio:**\n• Average attribution factor: 0.73\n• 234 loans have attribution factors > 0.9 (high exposure)\n• 89 loans missing asset values (using loan amount as proxy)\n\n**Example from your data:**\nLoan #LN-2024-1567: $28,000 outstanding on $35,000 vehicle\nAttribution Factor = $28,000 ÷ $35,000 = 0.8 (80%)\n\n**Next Steps:** Collect missing asset values for more accurate attribution calculations.",
      sources: ["PCAF Attribution Guide", "Your Loan Data", "Calculation Examples"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Demo Steps */}
      <div className="grid gap-4 md:grid-cols-3">
        {demoSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === demoStep;
          
          return (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 ${
                isActive ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md'
              }`}
              onClick={() => setDemoStep(index)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${step.color}/10`}>
                    <Icon className={`w-5 h-5 ${step.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{step.title}</CardTitle>
                    <CardDescription className="text-xs">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {isActive && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {step.content.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Example Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Contextual RAG Examples
          </CardTitle>
          <CardDescription>
            See how the AI combines platform knowledge with your portfolio data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {exampleQueries.map((example, index) => (
            <div key={index} className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">User Question:</span>
                </div>
                <p className="text-sm italic">"{example.query}"</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Contextual AI Response:</span>
                </div>
                <div className="text-sm whitespace-pre-line mb-3">
                  {example.response}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {example.sources.map((source, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Benefits */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Key Benefits:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• <strong>Portfolio-Aware:</strong> AI understands your specific loan data and characteristics</li>
            <li>• <strong>Methodology Grounded:</strong> All advice follows official PCAF standards</li>
            <li>• <strong>Actionable Insights:</strong> Specific recommendations based on your actual data</li>
            <li>• <strong>Contextual Examples:</strong> Uses real examples from your portfolio</li>
            <li>• <strong>Prioritized Actions:</strong> Focuses on highest-impact improvements first</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}