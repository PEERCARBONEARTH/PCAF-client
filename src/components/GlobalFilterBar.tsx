import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type PeriodOption = 'Q1' | 'Q2' | 'Q3' | 'Q4';

interface GlobalFilterBarProps {
  fuelTypes: string[];
  selectedFuelType: string;
  period: PeriodOption;
  onChange: (filters: { period: PeriodOption; fuelType: string }) => void;
}

export function GlobalFilterBar({ fuelTypes, selectedFuelType, period, onChange }: GlobalFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border rounded-sm p-3 bg-background/50">
      {/* Fuel type filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Fuel type</label>
        <Select value={selectedFuelType} onValueChange={(v) => onChange({ period, fuelType: v })}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {fuelTypes.map((ft) => (
              <SelectItem key={ft} value={ft}>{ft}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Period</label>
        <ToggleGroup type="single" value={period} onValueChange={(v) => v && onChange({ period: v as PeriodOption, fuelType: selectedFuelType })}>
          <ToggleGroupItem value="Q1">Q1</ToggleGroupItem>
          <ToggleGroupItem value="Q2">Q2</ToggleGroupItem>
          <ToggleGroupItem value="Q3">Q3</ToggleGroupItem>
          <ToggleGroupItem value="Q4">Q4</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
