import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Car,
  Truck,
  Bus,
  Bike,
  Fuel,
  MapPin,
  FileText,
  Link,
  Save,
  Check,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssumptionRow {
  id: string;
  vehicleType: string;
  activityBasis: 'distance' | 'fuel';
  annualDistance: number;
  fuelConsumption: number;
  region: string;
  sourceLabel: string;
  evidenceUrl: string;
}

interface AssumptionsBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (assumptions: AssumptionRow[]) => void;
  initialAssumptions?: AssumptionRow[];
}

const defaultVehicleTypes = [
  { value: 'passenger_car', label: 'Passenger Car', icon: Car },
  { value: 'suv', label: 'SUV', icon: Car },
  { value: 'light_truck', label: 'Light Truck', icon: Truck },
  { value: 'motorcycle', label: 'Motorcycle', icon: Bike },
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'heavy_truck', label: 'Heavy Truck', icon: Truck }
];

const regions = [
  'Global',
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'China',
  'India',
  'Australia',
  'Brazil'
];

const defaultAssumptions: AssumptionRow[] = [
  {
    id: '1',
    vehicleType: 'passenger_car',
    activityBasis: 'distance',
    annualDistance: 15000,
    fuelConsumption: 8.5,
    region: 'Global',
    sourceLabel: 'IEA Transport Statistics',
    evidenceUrl: 'https://www.iea.org/data-and-statistics'
  },
  {
    id: '2',
    vehicleType: 'suv',
    activityBasis: 'distance',
    annualDistance: 15000,
    fuelConsumption: 10.2,
    region: 'Global',
    sourceLabel: 'IEA Transport Statistics',
    evidenceUrl: 'https://www.iea.org/data-and-statistics'
  },
  {
    id: '3',
    vehicleType: 'light_truck',
    activityBasis: 'distance',
    annualDistance: 15000,
    fuelConsumption: 11.8,
    region: 'Global',
    sourceLabel: 'IEA Transport Statistics',
    evidenceUrl: 'https://www.iea.org/data-and-statistics'
  },
  {
    id: '4',
    vehicleType: 'motorcycle',
    activityBasis: 'distance',
    annualDistance: 8000,
    fuelConsumption: 4.2,
    region: 'Global',
    sourceLabel: 'IEA Transport Statistics',
    evidenceUrl: 'https://www.iea.org/data-and-statistics'
  },
  {
    id: '5',
    vehicleType: 'bus',
    activityBasis: 'distance',
    annualDistance: 50000,
    fuelConsumption: 35.0,
    region: 'Global',
    sourceLabel: 'IEA Transport Statistics',
    evidenceUrl: 'https://www.iea.org/data-and-statistics'
  },
  {
    id: '6',
    vehicleType: 'heavy_truck',
    activityBasis: 'distance',
    annualDistance: 80000,
    fuelConsumption: 38.5,
    region: 'Global',
    sourceLabel: 'IEA Transport Statistics',
    evidenceUrl: 'https://www.iea.org/data-and-statistics'
  }
];

export default function AssumptionsBuilder({
  isOpen,
  onClose,
  onSave,
  initialAssumptions
}: AssumptionsBuilderProps) {
  const [assumptions, setAssumptions] = useState<AssumptionRow[]>(
    initialAssumptions || defaultAssumptions
  );
  const [isDraft, setIsDraft] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const { toast } = useToast();

  useEffect(() => {
    if (initialAssumptions) {
      setAssumptions(initialAssumptions);
    }
  }, [initialAssumptions]);

  const addNewAssumption = () => {
    const newAssumption: AssumptionRow = {
      id: Date.now().toString(),
      vehicleType: 'passenger_car',
      activityBasis: 'distance',
      annualDistance: 15000,
      fuelConsumption: 8.5,
      region: 'Global',
      sourceLabel: '',
      evidenceUrl: ''
    };
    setAssumptions([...assumptions, newAssumption]);
    setIsDraft(true);
  };

  const removeAssumption = (id: string) => {
    setAssumptions(assumptions.filter(a => a.id !== id));
    setIsDraft(true);
  };

  const updateAssumption = (id: string, field: keyof AssumptionRow, value: any) => {
    setAssumptions(assumptions.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
    setIsDraft(true);
  };

  const duplicateAssumption = (id: string) => {
    const original = assumptions.find(a => a.id === id);
    if (original) {
      const duplicate: AssumptionRow = {
        ...original,
        id: Date.now().toString(),
        vehicleType: original.vehicleType + '_copy'
      };
      setAssumptions([...assumptions, duplicate]);
      setIsDraft(true);
    }
  };

  const handleSave = () => {
    // Validate assumptions
    const invalidRows = assumptions.filter(a => 
      !a.vehicleType || !a.sourceLabel || a.annualDistance <= 0 || a.fuelConsumption <= 0
    );

    if (invalidRows.length > 0) {
      toast({
        title: 'Validation Error',
        description: `Please complete all required fields for ${invalidRows.length} row(s).`,
        variant: 'destructive'
      });
      return;
    }

    setIsDraft(false);
    onSave?.(assumptions);
    
    toast({
      title: 'Assumptions Saved',
      description: `Successfully saved ${assumptions.length} vehicle type assumptions.`,
    });
  };

  const handleApproveAndVersion = () => {
    handleSave();
    toast({
      title: 'Assumptions Approved',
      description: 'Assumptions have been approved and versioned for PCAF compliance.',
    });
    onClose();
  };

  const exportAssumptions = () => {
    const dataStr = JSON.stringify(assumptions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pcaf-assumptions-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getVehicleIcon = (vehicleType: string) => {
    const vehicleConfig = defaultVehicleTypes.find(v => v.value === vehicleType);
    return vehicleConfig?.icon || Car;
  };

  const getVehicleLabel = (vehicleType: string) => {
    const vehicleConfig = defaultVehicleTypes.find(v => v.value === vehicleType);
    return vehicleConfig?.label || vehicleType;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">Assumptions Builder</DialogTitle>
              <DialogDescription className="mt-1">
                Configure per-vehicle-type activity basis and statistical sources used when Option 1 data isn't available
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isDraft ? "secondary" : "default"}>
                {isDraft ? 'Draft' : 'Approved'}
              </Badge>
              <Button variant="outline" size="sm" onClick={exportAssumptions}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 py-2 border-b">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder" className="flex-1 p-0">
            <ScrollArea className="h-[60vh]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Vehicle Type Assumptions</h3>
                    <Badge variant="outline">{assumptions.length} types</Badge>
                  </div>
                  <Button onClick={addNewAssumption} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Vehicle Type
                  </Button>
                </div>

                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Choose Fuel basis when you have measured consumption (Option 1a). 
                    Choose Distance when using statistical mileage (Options 2a/2b).
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                    <div className="col-span-2">Vehicle Type</div>
                    <div className="col-span-1">Activity Basis</div>
                    <div className="col-span-1">Annual Distance (km)</div>
                    <div className="col-span-1">Fuel (L)</div>
                    <div className="col-span-1">Region</div>
                    <div className="col-span-2">Source Label</div>
                    <div className="col-span-2">Evidence URL</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Data Rows */}
                  {assumptions.map((assumption) => {
                    const VehicleIcon = getVehicleIcon(assumption.vehicleType);
                    
                    return (
                      <Card key={assumption.id} className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Vehicle Type */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <VehicleIcon className="h-4 w-4 text-primary" />
                              <Input
                                value={assumption.vehicleType}
                                onChange={(e) => updateAssumption(assumption.id, 'vehicleType', e.target.value)}
                                placeholder="Vehicle type"
                                className="h-8"
                              />
                            </div>
                          </div>

                          {/* Activity Basis */}
                          <div className="col-span-1">
                            <Select
                              value={assumption.activityBasis}
                              onValueChange={(value: 'distance' | 'fuel') => 
                                updateAssumption(assumption.id, 'activityBasis', value)
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="distance">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    Distance (km)
                                  </div>
                                </SelectItem>
                                <SelectItem value="fuel">
                                  <div className="flex items-center gap-2">
                                    <Fuel className="h-3 w-3" />
                                    Fuel (L)
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Annual Distance */}
                          <div className="col-span-1">
                            <Input
                              type="number"
                              value={assumption.annualDistance}
                              onChange={(e) => updateAssumption(assumption.id, 'annualDistance', Number(e.target.value))}
                              placeholder="15000"
                              className="h-8"
                            />
                          </div>

                          {/* Fuel Consumption */}
                          <div className="col-span-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={assumption.fuelConsumption}
                              onChange={(e) => updateAssumption(assumption.id, 'fuelConsumption', Number(e.target.value))}
                              placeholder="8.5"
                              className="h-8"
                            />
                          </div>

                          {/* Region */}
                          <div className="col-span-1">
                            <Select
                              value={assumption.region}
                              onValueChange={(value) => updateAssumption(assumption.id, 'region', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region} value={region}>
                                    {region}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Source Label */}
                          <div className="col-span-2">
                            <Input
                              value={assumption.sourceLabel}
                              onChange={(e) => updateAssumption(assumption.id, 'sourceLabel', e.target.value)}
                              placeholder="e.g., Nairobi transport survey"
                              className="h-8"
                            />
                          </div>

                          {/* Evidence URL */}
                          <div className="col-span-2">
                            <Input
                              value={assumption.evidenceUrl}
                              onChange={(e) => updateAssumption(assumption.id, 'evidenceUrl', e.target.value)}
                              placeholder="https://..."
                              className="h-8"
                            />
                          </div>

                          {/* Actions */}
                          <div className="col-span-2 flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateAssumption(assumption.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAssumption(assumption.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 p-0">
            <ScrollArea className="h-[60vh]">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Assumptions Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assumptions.map((assumption) => {
                    const VehicleIcon = getVehicleIcon(assumption.vehicleType);
                    
                    return (
                      <Card key={assumption.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <VehicleIcon className="h-4 w-4 text-primary" />
                            {getVehicleLabel(assumption.vehicleType)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Activity Basis:</span>
                            <Badge variant="outline" className="text-xs">
                              {assumption.activityBasis === 'distance' ? 'Distance (km)' : 'Fuel (L)'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Distance:</span>
                            <span className="font-medium">{assumption.annualDistance.toLocaleString()} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fuel Consumption:</span>
                            <span className="font-medium">{assumption.fuelConsumption} L/100km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Region:</span>
                            <span className="font-medium">{assumption.region}</span>
                          </div>
                          <Separator className="my-2" />
                          <div>
                            <div className="text-muted-foreground text-xs mb-1">Source:</div>
                            <div className="font-medium text-xs">{assumption.sourceLabel || 'No source specified'}</div>
                            {assumption.evidenceUrl && (
                              <div className="flex items-center gap-1 mt-1">
                                <Link className="h-3 w-3 text-primary" />
                                <a 
                                  href={assumption.evidenceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline truncate"
                                >
                                  Evidence URL
                                </a>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="validation" className="flex-1 p-0">
            <ScrollArea className="h-[60vh]">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Validation Results</h3>
                
                {/* Validation Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium">Complete Rows</div>
                          <div className="text-2xl font-bold text-green-600">
                            {assumptions.filter(a => a.vehicleType && a.sourceLabel && a.annualDistance > 0).length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="font-medium">Missing Data</div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {assumptions.filter(a => !a.vehicleType || !a.sourceLabel || a.annualDistance <= 0).length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Total Assumptions</div>
                          <div className="text-2xl font-bold text-blue-600">{assumptions.length}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Validation Details */}
                <div className="space-y-4">
                  {assumptions.map((assumption) => {
                    const issues = [];
                    if (!assumption.vehicleType) issues.push('Vehicle type is required');
                    if (!assumption.sourceLabel) issues.push('Source label is required');
                    if (assumption.annualDistance <= 0) issues.push('Annual distance must be greater than 0');
                    if (assumption.fuelConsumption <= 0) issues.push('Fuel consumption must be greater than 0');
                    if (!assumption.evidenceUrl) issues.push('Evidence URL is recommended');

                    const hasErrors = issues.filter(i => !i.includes('recommended')).length > 0;
                    const hasWarnings = issues.filter(i => i.includes('recommended')).length > 0;

                    return (
                      <Card key={assumption.id} className={hasErrors ? 'border-destructive/50' : hasWarnings ? 'border-yellow-500/50' : 'border-green-500/50'}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${hasErrors ? 'bg-destructive' : hasWarnings ? 'bg-yellow-500' : 'bg-green-500'}`} />
                              <span className="font-medium">{getVehicleLabel(assumption.vehicleType)}</span>
                            </div>
                            <Badge variant={hasErrors ? 'destructive' : hasWarnings ? 'secondary' : 'default'}>
                              {hasErrors ? 'Errors' : hasWarnings ? 'Warnings' : 'Valid'}
                            </Badge>
                          </div>
                          {issues.length > 0 && (
                            <ul className="text-sm space-y-1">
                              {issues.map((issue, index) => (
                                <li key={index} className={`flex items-center gap-2 ${issue.includes('recommended') ? 'text-yellow-600' : 'text-destructive'}`}>
                                  <div className="w-1 h-1 rounded-full bg-current" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {assumptions.length} vehicle type{assumptions.length !== 1 ? 's' : ''} configured
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!isDraft}>
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </Button>
              <Button onClick={handleApproveAndVersion} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-1" />
                Approve & Version
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}