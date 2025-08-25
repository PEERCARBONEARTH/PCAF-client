import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    location: string;
    status: string;
    progress: number;
    funding: string;
    beneficiaries: string;
    category: string;
    lastUpdated: string;
    milestones: { completed: number; total: number };
  };
  onProjectUpdated: (updatedProject: any) => void;
}

const statusOptions = [
  { value: "Concept", label: "Concept" },
  { value: "Planning", label: "Planning" },
  { value: "Active", label: "Active" },
  { value: "On Hold", label: "On Hold" },
  { value: "Completed", label: "Completed" }
];

const categoryOptions = [
  { value: "Steam Clean Cooking", label: "Steam Clean Cooking" },
  { value: "Electric Mobility & Fleet", label: "Electric Mobility & Fleet" },
  { value: "Cold Storage", label: "Cold Storage" },
  { value: "Solar PV Systems", label: "Solar PV Systems" }
];

export function ProjectEditModal({ isOpen, onClose, project, onProjectUpdated }: ProjectEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: project.name,
    location: project.location,
    status: project.status,
    funding: project.funding,
    beneficiaries: project.beneficiaries,
    category: project.category,
    progress: project.progress.toString(),
    milestonesCompleted: project.milestones.completed.toString(),
    milestonesTotal: project.milestones.total.toString(),
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProject = {
        ...project,
        name: formData.name,
        location: formData.location,
        status: formData.status,
        funding: formData.funding,
        beneficiaries: formData.beneficiaries,
        category: formData.category,
        progress: parseInt(formData.progress),
        milestones: {
          completed: parseInt(formData.milestonesCompleted),
          total: parseInt(formData.milestonesTotal)
        },
        lastUpdated: "Just now"
      };

      onProjectUpdated(updatedProject);
      
      toast({
        title: "Project Updated",
        description: `${formData.name} has been successfully updated.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project: {project.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funding">Funding</Label>
              <Input
                id="funding"
                value={formData.funding}
                onChange={(e) => handleInputChange('funding', e.target.value)}
                placeholder="e.g., $850K"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaries">Beneficiaries</Label>
              <Input
                id="beneficiaries"
                value={formData.beneficiaries}
                onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                placeholder="e.g., 12,500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleInputChange('progress', e.target.value)}
                placeholder="0-100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Milestones</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={formData.milestonesCompleted}
                  onChange={(e) => handleInputChange('milestonesCompleted', e.target.value)}
                  placeholder="Completed"
                  className="flex-1"
                />
                <span className="flex items-center px-2">/</span>
                <Input
                  type="number"
                  min="1"
                  value={formData.milestonesTotal}
                  onChange={(e) => handleInputChange('milestonesTotal', e.target.value)}
                  placeholder="Total"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating..." : "Update Project"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}