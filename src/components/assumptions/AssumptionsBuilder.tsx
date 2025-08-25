import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssumptions, type CategoryAssumption } from '@/contexts/AssumptionsContext';
import { cn } from '@/lib/utils';

const DEFAULT_TYPES = [
  'passenger_car',
  'suv',
  'light_truck',
  'motorcycle',
  'bus',
  'heavy_truck',
];

export function AssumptionsBuilder() {
  const { assumptions, saveCategory, approveVersion } = useAssumptions();

  const categories = assumptions.categories || {};

  const allTypes = Array.from(new Set([...DEFAULT_TYPES, ...Object.keys(categories)]));

  const onBasisChange = (type: string, basis: CategoryAssumption['basis']) => {
    saveCategory(type, { basis });
  };

  const onAnnualKmChange = (type: string, value: string) => {
    const n = Number(value.replace(/[^0-9.]/g, ''));
    if (!isNaN(n)) saveCategory(type, { annual_km: n });
  };

  const onRegionChange = (type: string, region: NonNullable<CategoryAssumption['region']>) => {
    saveCategory(type, { region });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Assumptions Builder</CardTitle>
            <CardDescription>
              Configure per-vehicle-type activity basis and statistical sources used when Option 1 data isn’t available.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={assumptions.active_version ? 'default' : 'secondary'}>
              {assumptions.active_version ? `Active version: ${new Date(assumptions.active_version).toLocaleString()}` : 'Draft'}
            </Badge>
            <Button onClick={() => approveVersion('Approved via Methodology page')}>Approve & Version</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Vehicle Type</TableHead>
                <TableHead>Activity Basis</TableHead>
                <TableHead>Annual Distance (km)</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Source Label</TableHead>
                <TableHead>Evidence URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTypes.map((type) => {
                const row = categories[type] || ({} as CategoryAssumption);
                return (
                  <TableRow key={type}>
                    <TableCell className="capitalize">{type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant={row.basis === 'distance' ? 'default' : 'outline'} onClick={() => onBasisChange(type, 'distance')}>
                          Distance (km)
                        </Button>
                        <Button size="sm" variant={row.basis === 'fuel' ? 'default' : 'outline'} onClick={() => onBasisChange(type, 'fuel')}>
                          Fuel (L)
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g., 15000"
                        value={row.annual_km ?? ''}
                        onChange={(e) => onAnnualKmChange(type, e.target.value)}
                        disabled={row.basis === 'fuel'}
                        className={cn('w-36', row.basis === 'fuel' && 'opacity-60')}
                        aria-label={`Annual distance for ${type}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={row.region} onValueChange={(v) => onRegionChange(type, v as NonNullable<CategoryAssumption['region']>)}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="e.g., Nairobi transport survey 2022"
                        value={row.source_label ?? ''}
                        onChange={(e) => saveCategory(type, { source_label: e.target.value })}
                        aria-label={`Source label for ${type}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="https://..."
                        value={row.evidence_url ?? ''}
                        onChange={(e) => saveCategory(type, { evidence_url: e.target.value })}
                        aria-label={`Evidence URL for ${type}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Tip: Choose Fuel basis when you have measured consumption (Option 1a). Choose Distance when using statistical mileage (Options 2a/2b).
        </p>
      </CardContent>
    </Card>
  );
}
