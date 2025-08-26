import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Globe, Users, Zap } from 'lucide-react';

// SDG Data with actual UN colors and impact scores
const sdgData = [
  { goal: 1, name: "No Poverty", score: 78, color: "#E5243B", projects: 12 },
  { goal: 2, name: "Zero Hunger", score: 65, color: "#DDA63A", projects: 8 },
  { goal: 3, name: "Good Health", score: 92, color: "#4C9F38", projects: 23 },
  { goal: 4, name: "Quality Education", score: 88, color: "#C5192D", projects: 34 },
  { goal: 5, name: "Gender Equality", score: 71, color: "#FF3A21", projects: 18 },
  { goal: 6, name: "Clean Water", score: 83, color: "#26BDE2", projects: 15 },
  { goal: 7, name: "Affordable Energy", score: 94, color: "#FCC30B", projects: 45 },
  { goal: 8, name: "Decent Work", score: 76, color: "#A21942", projects: 19 },
  { goal: 9, name: "Innovation", score: 69, color: "#FD6925", projects: 11 },
  { goal: 10, name: "Reduced Inequalities", score: 73, color: "#DD1367", projects: 16 },
  { goal: 11, name: "Sustainable Cities", score: 80, color: "#FD9D24", projects: 22 },
  { goal: 12, name: "Responsible Production", score: 77, color: "#BF8B2E", projects: 14 },
  { goal: 13, name: "Climate Action", score: 96, color: "#3F7E44", projects: 52 },
  { goal: 14, name: "Life Below Water", score: 58, color: "#0A97D9", projects: 7 },
  { goal: 15, name: "Life on Land", score: 84, color: "#56C02B", projects: 28 },
  { goal: 16, name: "Peace & Justice", score: 67, color: "#00689D", projects: 9 },
  { goal: 17, name: "Partnerships", score: 91, color: "#19486A", projects: 38 }
];

// Primary SDGs with highest impact scores
const primarySDGs = sdgData.filter(sdg => sdg.score >= 85).slice(0, 5);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-sm p-3 shadow-lg">
        <p className="font-medium text-foreground">SDG {data.goal}: {data.name}</p>
        <p className="text-sm text-muted-foreground">Impact Score: {data.score}%</p>
        <p className="text-sm text-muted-foreground">{data.projects} active projects</p>
      </div>
    );
  }
  return null;
};

export function SDGWheel() {
  return (
    <div className="space-y-6">
      {/* SDG Impact Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            UN SDG Impact Alignment
          </CardTitle>
          <CardDescription>
            Portfolio contribution to the 17 Sustainable Development Goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SDG Wheel Visualization */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Impact Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sdgData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="score"
                    label={({ goal }) => `${goal}`}
                    labelLine={false}
                  >
                    {sdgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Primary SDG Impact Areas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Primary Impact Areas</h3>
              <div className="space-y-3">
                {primarySDGs.map((sdg) => (
                  <div key={sdg.goal} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: sdg.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">SDG {sdg.goal}: {sdg.name}</span>
                        <Badge variant="outline" className="bg-success/10 text-success">
                          {sdg.score}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-success transition-all"
                            style={{ width: `${sdg.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{sdg.projects} projects</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SDG Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Total SDG Coverage</p>
                <p className="metric-value mt-2">17/17</p>
                <p className="text-sm text-muted-foreground mt-1">All goals addressed</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Globe className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-success">100%</span>
              <span className="text-sm text-muted-foreground">comprehensive coverage</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">High Impact SDGs</p>
                <p className="metric-value mt-2">5</p>
                <p className="text-sm text-muted-foreground mt-1">Score ≥ 85%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-success">+2</span>
              <span className="text-sm text-muted-foreground">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="metric-label">Beneficiaries Reached</p>
                <p className="metric-value mt-2">89.4K</p>
                <p className="text-sm text-muted-foreground mt-1">Across all SDGs</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-success">+23%</span>
              <span className="text-sm text-muted-foreground">vs target</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}