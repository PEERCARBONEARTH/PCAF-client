import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type LoanPortfolioItem } from "@/lib/db";
import { BarChart3, ExternalLink } from "lucide-react";

interface CorrelationHeatmapProps {
  loans: LoanPortfolioItem[];
  onFactorClick?: (factor1: string, factor2: string, correlation: number, significance: number) => void;
}

interface CorrelationData {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
  pValue: number;
}

export function CorrelationHeatmap({ loans, onFactorClick }: CorrelationHeatmapProps) {
  const factors = [
    { key: 'loan_amount', label: 'Loan Amount' },
    { key: 'financed_emissions', label: 'Emissions' },
    { key: 'data_quality_score', label: 'Data Quality' },
    { key: 'attribution_factor', label: 'Attribution' },
    { key: 'vehicle_value', label: 'Vehicle Value' },
    { key: 'estimated_km_per_year', label: 'Estimated KM/Year' },
    { key: 'emission_factor_kg_co2_km', label: 'EF kgCO2/km' }
  ];

  // Calculate correlation matrix
  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    if (n === 0) return { correlation: 0, pValue: 1 };
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return { correlation: 0, pValue: 1 };
    
    const correlation = numerator / denominator;
    
    // Simplified p-value calculation (for display purposes)
    const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
    const pValue = Math.max(0.001, 1 - Math.abs(t) / 10); // Simplified approximation
    
    return { correlation, pValue };
  };

  const correlationMatrix: CorrelationData[] = [];
  
  for (let i = 0; i < factors.length; i++) {
    for (let j = i + 1; j < factors.length; j++) {
      const factor1 = factors[i];
      const factor2 = factors[j];
      
      const values1 = loans.map(loan => (loan as any)[factor1.key]).filter(v => v !== null && v !== undefined && !isNaN(v));
      const values2 = loans.map(loan => (loan as any)[factor2.key]).filter(v => v !== null && v !== undefined && !isNaN(v));
      
      if (values1.length > 2 && values2.length > 2) {
        const minLength = Math.min(values1.length, values2.length);
        const { correlation, pValue } = calculateCorrelation(
          values1.slice(0, minLength), 
          values2.slice(0, minLength)
        );
        
        correlationMatrix.push({
          factor1: factor1.label,
          factor2: factor2.label,
          correlation,
          significance: Math.abs(correlation),
          pValue
        });
      }
    }
  }

  const getCorrelationColor = (correlation: number, pValue: number) => {
    const alpha = pValue > 0.05 ? 0.3 : 1; // Fade if not significant
    const intensity = Math.abs(correlation);
    
    if (correlation > 0) {
      return `rgba(34, 197, 94, ${intensity * alpha})`; // Green for positive
    } else {
      return `rgba(239, 68, 68, ${intensity * alpha})`; // Red for negative
    }
  };

  const getSignificanceBadge = (pValue: number) => {
    if (pValue <= 0.001) return { text: "***", variant: "default" as const };
    if (pValue <= 0.01) return { text: "**", variant: "default" as const };
    if (pValue <= 0.05) return { text: "*", variant: "secondary" as const };
    return { text: "ns", variant: "outline" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Correlation Matrix</CardTitle>
          </div>
          <Badge variant="secondary">
            {correlationMatrix.length} correlations analyzed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Positive correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Negative correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Significance: *** p≤0.001, ** p≤0.01, * p≤0.05, ns p&gt;0.05</span>
            </div>
          </div>

          {/* Correlation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {correlationMatrix
              .sort((a, b) => b.significance - a.significance)
              .map((item, index) => {
                const significanceBadge = getSignificanceBadge(item.pValue);
                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto p-3 text-left justify-start"
                          style={{
                            backgroundColor: getCorrelationColor(item.correlation, item.pValue),
                            borderColor: item.pValue <= 0.05 ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                          }}
                          onClick={() => onFactorClick?.(
                            item.factor1, 
                            item.factor2, 
                            item.correlation, 
                            item.significance
                          )}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">
                                {item.factor1} × {item.factor2}
                              </div>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">
                                {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(3)}
                              </span>
                              <Badge variant={significanceBadge.variant} className="text-xs">
                                {significanceBadge.text}
                              </Badge>
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{item.factor1} vs {item.factor2}</p>
                          <p>Correlation: {item.correlation.toFixed(4)}</p>
                          <p>P-value: {item.pValue.toFixed(4)}</p>
                          <p>Significance: {item.pValue <= 0.05 ? 'Significant' : 'Not significant'}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}