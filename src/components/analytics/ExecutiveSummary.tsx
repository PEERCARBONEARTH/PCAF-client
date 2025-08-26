import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface KPIs {
  totalLoans: number;
  totalEmissions: number; // tCO2e
  avgDataQuality: number; // 1-5
  evPercentage: number; // 0-100
  intensity?: number; // kg CO2e / $1k
}

export function ExecutiveSummary({ kpis }: { kpis: KPIs }) {
  const items = [
    {
      label: "Total Loans",
      value: kpis.totalLoans.toLocaleString(),
      sub: "in portfolio",
    },
    {
      label: "Total Emissions",
      value: `${kpis.totalEmissions.toFixed(1)}`,
      sub: "tCO₂e financed",
    },
    {
      label: "Avg Data Quality",
      value: kpis.avgDataQuality.toFixed(2),
      sub: "PCAF score (1 best)",
    },
    {
      label: "EV Share",
      value: `${kpis.evPercentage.toFixed(1)}%`,
      sub: "of portfolio",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executive Summary</CardTitle>
        <CardDescription>Key KPIs for quick decision-making</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((it, idx) => (
            <div key={idx} className="rounded-sm border p-4">
              <div className="text-sm text-muted-foreground">{it.label}</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{it.value}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
