
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RotateCcw, FolderOpen, Target, Building2 } from "lucide-react";
import { TrancheFilters as FilterType } from "@/api/tranches";

interface TrancheFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function TrancheFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  loading = false 
}: TrancheFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const updateFilter = (key: keyof FilterType, value: string | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools, regions, or tranche IDs..."
            value={localFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Project Filter - Always Visible */}
        <div>
          <label className="text-sm font-medium mb-2 block">Project View</label>
          <Select
            value={localFilters.projectFilter || 'all'}
            onValueChange={(value) => updateFilter('projectFilter', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  All Projects
                </div>
              </SelectItem>
              <SelectItem value="pipeline">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Deal Pipeline Only
                  <Badge variant="outline" className="ml-1 text-xs">Pipeline</Badge>
                </div>
              </SelectItem>
              <SelectItem value="portfolio">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Portfolio Only
                  <Badge variant="secondary" className="ml-1 text-xs">Portfolio</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Ready to Disburse">Ready to Disburse</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Disbursed">Disbursed</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select
                value={localFilters.country || ''}
                onValueChange={(value) => updateFilter('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All countries</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Milestone</label>
              <Select
                value={localFilters.milestone || ''}
                onValueChange={(value) => updateFilter('milestone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All milestones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All milestones</SelectItem>
                  <SelectItem value="Initial Installation">Initial Installation</SelectItem>
                  <SelectItem value="Performance Milestone">Performance Milestone</SelectItem>
                  <SelectItem value="Scale-up Phase">Scale-up Phase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Input
                placeholder="Filter by region..."
                value={localFilters.region || ''}
                onChange={(e) => updateFilter('region', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Apply/Reset Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleApplyFilters}
            disabled={loading}
            className="flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
