import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Leaf, Target, Calendar } from "lucide-react";

export const ImpactPerformanceGraph = () => {
  const co2Data = [
    { month: 'Jan', expected: 80, actual: 65 },
    { month: 'Feb', expected: 160, actual: 145 },
    { month: 'Mar', expected: 240, actual: 235 },
    { month: 'Apr', expected: 320, actual: 310 },
    { month: 'May', expected: 400, actual: 390 },
    { month: 'Jun', expected: 480, actual: 485 },
    { month: 'Jul', expected: 560, actual: 575 },
    { month: 'Aug', expected: 640, actual: 650 },
    { month: 'Sep', expected: 720, actual: 710 },
    { month: 'Oct', expected: 800, actual: 825 },
    { month: 'Nov', expected: 880, actual: 890 },
    { month: 'Dec', expected: 960, actual: 975 }
  ];

  const cumulativeData = [
    { month: 'Jan', cumulative: 65, target: 80 },
    { month: 'Feb', cumulative: 210, target: 240 },
    { month: 'Mar', cumulative: 445, target: 480 },
    { month: 'Apr', cumulative: 755, target: 800 },
    { month: 'May', cumulative: 1145, target: 1200 },
    { month: 'Jun', cumulative: 1630, target: 1680 },
    { month: 'Jul', cumulative: 2205, target: 2240 },
    { month: 'Aug', cumulative: 2855, target: 2880 },
    { month: 'Sep', cumulative: 3565, target: 3600 },
    { month: 'Oct', cumulative: 4390, target: 4400 },
    { month: 'Nov', cumulative: 5280, target: 5280 },
    { month: 'Dec', cumulative: 6255, target: 6240 }
  ];

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-success" />
          Impact Performance
        </CardTitle>
        <CardDescription>
          CO₂ emissions reduction tracking vs. expected targets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="cumulative" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cumulative
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="mt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={co2Data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expected" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="cumulative" className="mt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    fill="hsl(var(--success))"
                    fillOpacity={0.2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Month</p>
            <p className="text-lg font-semibold text-success">+975 tCO₂e</p>
            <p className="text-xs text-muted-foreground">vs 960 expected</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Performance</p>
            <p className="text-lg font-semibold text-primary">101.6%</p>
            <p className="text-xs text-success">+1.6% above target</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Projection</p>
            <p className="text-lg font-semibold text-finance">6,255 tCO₂e</p>
            <p className="text-xs text-muted-foreground">by year end</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};