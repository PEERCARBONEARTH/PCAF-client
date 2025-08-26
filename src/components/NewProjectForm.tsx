import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface NewProjectFormProps {
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

export function NewProjectForm({ onClose, onProjectCreated }: NewProjectFormProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: '',
    location: '',
    funding: '',
    expectedBeneficiaries: '',
    duration: '',
    sector: '',
    objectives: '',
    risks: '',
    stakeholders: ''
  });

  const categoryOptions = ['Steam Clean Cooking', 'Electric Mobility & Fleet', 'Cold Storage', 'Solar PV Systems'];
  const sectorOptions = ['Clean Energy', 'Transportation', 'Agriculture', 'Healthcare', 'Education'];
  const locationOptions = ['Nairobi, Kenya', 'Kampala, Uganda', 'Lagos, Nigeria', 'Accra, Ghana', 'Custom Location'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.location || !formData.funding) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (Name, Category, Location, Funding)",
        variant: "destructive"
      });
      return;
    }

    // Create new project object
    const newProject = {
      id: `PRJ-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      name: formData.name,
      location: formData.location,
      status: "Planning",
      progress: 0,
      funding: formData.funding,
      beneficiaries: formData.expectedBeneficiaries || "0",
      category: formData.category,
      lastUpdated: "Just now",
      milestones: { completed: 0, total: 4 },
      description: formData.description,
      startDate: startDate,
      endDate: endDate,
      sector: formData.sector,
      objectives: formData.objectives,
      risks: formData.risks,
      stakeholders: formData.stakeholders
    };

    onProjectCreated(newProject);
    
    toast({
      title: "Project Created Successfully",
      description: `${formData.name} has been added to your portfolio`,
    });
    
    onClose();
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Add a new development project to your portfolio
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the project"
              rows={3}
            />
          </div>
        </div>

        {/* Location and Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location & Timeline</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
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
            
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectorOptions.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Financial Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funding">Total Funding *</Label>
              <Input
                id="funding"
                value={formData.funding}
                onChange={(e) => handleInputChange('funding', e.target.value)}
                placeholder="e.g., $850K"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="beneficiaries">Expected Beneficiaries</Label>
              <Input
                id="beneficiaries"
                value={formData.expectedBeneficiaries}
                onChange={(e) => handleInputChange('expectedBeneficiaries', e.target.value)}
                placeholder="e.g., 12,500"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Project Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="objectives">Key Objectives</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => handleInputChange('objectives', e.target.value)}
              placeholder="List main project objectives"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stakeholders">Key Stakeholders</Label>
            <Textarea
              id="stakeholders"
              value={formData.stakeholders}
              onChange={(e) => handleInputChange('stakeholders', e.target.value)}
              placeholder="List main stakeholders and partners"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="risks">Risk Assessment</Label>
            <Textarea
              id="risks"
              value={formData.risks}
              onChange={(e) => handleInputChange('risks', e.target.value)}
              placeholder="Identify potential risks and mitigation strategies"
              rows={3}
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Supporting Documents</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-sm p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload project documents, proposals, or supporting files
            </p>
            <Button variant="outline" size="sm" type="button">
              Choose Files
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Project
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}