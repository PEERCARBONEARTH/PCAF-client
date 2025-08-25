import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ProjectFiltersProps {
  onApplyFilters: (filters: any) => void;
  onClose: () => void;
}

export function ProjectFilters({ onApplyFilters, onClose }: ProjectFiltersProps) {
  const [filters, setFilters] = React.useState({
    status: '',
    category: '',
    location: '',
    fundingRange: [0, 2000000],
    beneficiariesRange: [0, 50000],
    progressRange: [0, 100],
    sectors: [] as string[],
    lastUpdated: ''
  });

  const statusOptions = ['Active', 'Planning', 'On Hold', 'Completed'];
  const categoryOptions = ['Steam Clean Cooking', 'Electric Mobility & Fleet', 'Cold Storage', 'Solar PV Systems'];
  const locationOptions = ['Nairobi, Kenya', 'Kampala, Uganda', 'Lagos, Nigeria', 'Accra, Ghana'];
  const sectorOptions = ['Clean Energy', 'Transportation', 'Agriculture', 'Healthcare', 'Education'];

  const handleSectorChange = (sector: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sectors: checked 
        ? [...prev.sectors, sector]
        : prev.sectors.filter(s => s !== sector)
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: '',
      category: '',
      location: '',
      fundingRange: [0, 2000000],
      beneficiariesRange: [0, 50000],
      progressRange: [0, 100],
      sectors: [],
      lastUpdated: ''
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Filter Projects</DialogTitle>
        <DialogDescription>
          Refine your project search with advanced filters
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Status and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Funding Range */}
        <div className="space-y-3">
          <Label>Funding Range</Label>
          <div className="px-2">
            <Slider
              value={filters.fundingRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, fundingRange: value }))}
              max={2000000}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>${(filters.fundingRange[0] / 1000).toFixed(0)}K</span>
              <span>${(filters.fundingRange[1] / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        {/* Beneficiaries Range */}
        <div className="space-y-3">
          <Label>Beneficiaries Reached</Label>
          <div className="px-2">
            <Slider
              value={filters.beneficiariesRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, beneficiariesRange: value }))}
              max={50000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{(filters.beneficiariesRange[0] / 1000).toFixed(0)}K</span>
              <span>{(filters.beneficiariesRange[1] / 1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        {/* Progress Range */}
        <div className="space-y-3">
          <Label>Project Progress</Label>
          <div className="px-2">
            <Slider
              value={filters.progressRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, progressRange: value }))}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{filters.progressRange[0]}%</span>
              <span>{filters.progressRange[1]}%</span>
            </div>
          </div>
        </div>

        {/* Sectors */}
        <div className="space-y-3">
          <Label>Sectors</Label>
          <div className="grid grid-cols-2 gap-3">
            {sectorOptions.map(sector => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={sector}
                  checked={filters.sectors.includes(sector)}
                  onCheckedChange={(checked) => handleSectorChange(sector, checked as boolean)}
                />
                <Label htmlFor={sector} className="text-sm font-normal">{sector}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status || filters.category || filters.location || filters.sectors.length > 0) && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.status && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, status: '' }))} />
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {filters.category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, category: '' }))} />
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {filters.location}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, location: '' }))} />
                </Badge>
              )}
              {filters.sectors.map(sector => (
                <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                  {sector}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleSectorChange(sector, false)} />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleReset}>
          Reset All
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}