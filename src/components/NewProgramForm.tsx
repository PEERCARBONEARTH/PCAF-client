import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Users, 
  MapPin, 
  TrendingUp,
  FileText,
  Zap,
  Shield,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface NewProgramFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const disbursementModels = [
  { id: "rbf", label: "Results-Based (RBF)", description: "Release funds based on verified outcomes" },
  { id: "payc", label: "Pay-As-You-Cook (PAYC)", description: "Continuous micro-disbursements per usage" },
  { id: "blended", label: "Blended (Hybrid)", description: "Combination of upfront and results-based" },
  { id: "custom", label: "Other / Custom", description: "Define custom disbursement logic" }
];

const trancheTemplates = [
  {
    id: "usage",
    name: "Usage-Based",
    description: "Release funds based on cooking hours or steam output",
    triggers: ["Cooking Hours", "Steam Output", "Daily Usage"],
    icon: Zap,
    complexity: "Simple"
  },
  {
    id: "carbon",
    name: "Carbon Milestone",
    description: "Disbursement triggered by verified CO₂ reduction",
    triggers: ["tCO₂ Verified", "Carbon Credits", "Emission Reduction"],
    icon: BarChart3,
    complexity: "Medium"
  },
  {
    id: "compliance",
    name: "Compliance Trigger",
    description: "Release upon audit completion and compliance approval",
    triggers: ["Audit Approved", "Baseline Complete", "Field Verification"],
    icon: Shield,
    complexity: "Simple"
  },
  {
    id: "hybrid",
    name: "Hybrid Logic",
    description: "Multi-criteria disbursement combining multiple conditions",
    triggers: ["Multi-Criteria", "Weighted Scoring", "Performance Index"],
    icon: TrendingUp,
    complexity: "Advanced"
  }
];

const regions = [
  "Kenya",
  "Tanzania", 
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "Ghana",
  "Nigeria",
  "Other"
];

const fundingPartners = [
  "GreenMax Capital",
  "Acumen Fund",
  "European DFI",
  "USAID",
  "World Bank",
  "IFC",
  "AfDB",
  "Other"
];

const mrvSources = [
  "Saastain IoT",
  "Manual Upload",
  "Third-party Verifier",
  "Automated Sensors",
  "Mobile App Reporting"
];

const verificationFrequencies = [
  "Monthly",
  "Quarterly", 
  "Bi-annually",
  "Annually",
  "Custom"
];

export function NewProgramForm({ onSubmit, onCancel }: NewProgramFormProps) {
  const [formData, setFormData] = useState({
    programName: "",
    description: "",
    region: "",
    targetBeneficiaries: "",
    totalCapital: "",
    fundingPartner: "",
    disbursementModel: "",
    trancheTemplate: "",
    mrvSource: "",
    verificationFrequency: ""
  });

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = trancheTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    setFormData(prev => ({ ...prev, trancheTemplate: templateId }));
    setShowPreview(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto pr-2">
      {/* Section 1: Program Basics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Program Basics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="programName">Program Name *</Label>
            <Input
              id="programName"
              placeholder="e.g., Western Kenya Schools Clean Cooking Program"
              value={formData.programName}
              onChange={(e) => handleInputChange("programName", e.target.value)}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="description">Program Description</Label>
            <Textarea
              id="description"
              placeholder="Optional short summary of objective, coverage, or focus"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="region">Region/Country *</Label>
            <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {region}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="targetBeneficiaries">Target Beneficiaries</Label>
            <Input
              id="targetBeneficiaries"
              type="number"
              placeholder="e.g., 10,000 students"
              value={formData.targetBeneficiaries}
              onChange={(e) => handleInputChange("targetBeneficiaries", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 2: Financial Setup */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-foreground">Financial Setup</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalCapital">Total Capital Committed *</Label>
            <Input
              id="totalCapital"
              placeholder="e.g., $250,000"
              value={formData.totalCapital}
              onChange={(e) => handleInputChange("totalCapital", e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fundingPartner">Funding Partner(s)</Label>
            <Select value={formData.fundingPartner} onValueChange={(value) => handleInputChange("fundingPartner", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select funding partner" />
              </SelectTrigger>
              <SelectContent>
                {fundingPartners.map((partner) => (
                  <SelectItem key={partner} value={partner}>
                    {partner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            <Label>Disbursement Model *</Label>
            <RadioGroup 
              value={formData.disbursementModel} 
              onValueChange={(value) => handleInputChange("disbursementModel", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
            >
              {disbursementModels.map((model) => (
                <div key={model.id} className="flex items-start space-x-3 p-3 border border-border rounded-sm hover:bg-accent/50">
                  <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor={model.id} className="font-medium cursor-pointer">
                      {model.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>

      <Separator />

      {/* Section 3: Performance Logic Template */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-foreground">Performance Logic Template</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Select Tranche Logic Template *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {trancheTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = formData.trancheTemplate === template.id;
                
                return (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Icon className="h-6 w-6 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {template.complexity}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.triggers.slice(0, 2).map((trigger, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                        {template.triggers.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.triggers.length - 2}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {/* Preview Trigger Settings */}
          {selectedTemplate && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <CardTitle className="text-sm">Preview Trigger Settings</CardTitle>
                  {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {showPreview && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Selected template: <span className="font-medium">{selectedTemplate.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.triggers.map((trigger: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Settings can be customized in the next step
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </div>

      <Separator />

      {/* Section 4: MRV & Verification Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-foreground">MRV & Verification Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mrvSource">MRV Source *</Label>
            <Select value={formData.mrvSource} onValueChange={(value) => handleInputChange("mrvSource", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select MRV source" />
              </SelectTrigger>
              <SelectContent>
                {mrvSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="verificationFrequency">Verification Frequency *</Label>
            <Select value={formData.verificationFrequency} onValueChange={(value) => handleInputChange("verificationFrequency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {verificationFrequencies.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="min-w-[120px]">
          Create Program
        </Button>
      </div>
    </form>
  );
}