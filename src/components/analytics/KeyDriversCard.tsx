import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LoanPortfolioItem } from "@/lib/db";

function topBy(records: Record<string, number>, total: number, limit = 3) {
  return (Object.entries(records) as [string, number][]) 
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => ({ key: k, value: v, pct: total ? (v / total) * 100 : 0 }));
}

export function KeyDriversCard({ loans, onDriverClick }: { loans: LoanPortfolioItem[]; onDriverClick?: (payload: { group: 'fuel' | 'category' | 'region'; key: string; pct: number; value: number }) => void; }) {
  const totalEmissions = loans.reduce((s, l) => s + l.financed_emissions, 0);

  const byFuel: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byRegion: Record<string, number> = {};

  for (const l of loans) {
    const fuel = l.fuel_type ?? "unknown";
    const cat = l.vehicle_category ?? "unknown";
    const region = l.region ?? "unknown";
    byFuel[fuel] = (byFuel[fuel] || 0) + l.financed_emissions;
    byCategory[cat] = (byCategory[cat] || 0) + l.financed_emissions;
    byRegion[region] = (byRegion[region] || 0) + l.financed_emissions;
  }

  const topFuel = topBy(byFuel, totalEmissions);
  const topCat = topBy(byCategory, totalEmissions);
  const topReg = topBy(byRegion, totalEmissions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Emission Drivers</CardTitle>
        <CardDescription>Top portfolio contributors by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-semibold mb-2">By fuel type</div>
            <ul className="space-y-2">
              {topFuel.map((x) => (
                <li
                  key={x.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => onDriverClick?.({ group: 'fuel', key: x.key, pct: x.pct, value: x.value })}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDriverClick?.({ group: 'fuel', key: x.key, pct: x.pct, value: x.value })}
                  className="flex justify-between text-sm cursor-pointer rounded-md px-2 py-1 -mx-2 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <span className="capitalize text-muted-foreground">{x.key.replace(/_/g, " ")}</span>
                  <span className="font-medium">{x.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">By vehicle category</div>
            <ul className="space-y-2">
              {topCat.map((x) => (
                <li
                  key={x.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => onDriverClick?.({ group: 'category', key: x.key, pct: x.pct, value: x.value })}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDriverClick?.({ group: 'category', key: x.key, pct: x.pct, value: x.value })}
                  className="flex justify-between text-sm cursor-pointer rounded-md px-2 py-1 -mx-2 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <span className="capitalize text-muted-foreground">{x.key.replace(/_/g, " ")}</span>
                  <span className="font-medium">{x.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">By region</div>
            <ul className="space-y-2">
              {topReg.map((x) => (
                <li
                  key={x.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => onDriverClick?.({ group: 'region', key: x.key, pct: x.pct, value: x.value })}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDriverClick?.({ group: 'region', key: x.key, pct: x.pct, value: x.value })}
                  className="flex justify-between text-sm cursor-pointer rounded-md px-2 py-1 -mx-2 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <span className="capitalize text-muted-foreground">{x.key.replace(/_/g, " ")}</span>
                  <span className="font-medium">{x.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
