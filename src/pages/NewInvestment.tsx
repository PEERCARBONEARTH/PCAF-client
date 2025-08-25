import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, MapPin, DollarSign, Leaf, Building2, Calendar, FileText, CheckCircle, AlertCircle, Users, Target } from "lucide-react";
const NewInvestment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    programName: '',
    description: '',
    investmentType: '',
    totalAmount: '',
    // Location & Impact
    region: '',
    targetSchools: '',
    expectedBeneficiaries: '',
    co2Target: '',
    // Financial Structure
    disbursementStructure: '',
    tranches: '',
    paymentSchedule: '',
    // Documentation
    documents: [] as File[]
  });
  const {
    toast
  } = useToast();
  const totalSteps = 4;
  const progress = currentStep / totalSteps * 100;
  const investmentTypes = [{
    value: 'clean-cooking',
    label: 'Clean Cooking Solutions'
  }, {
    value: 'solar-energy',
    label: 'Solar Energy Systems'
  }, {
    value: 'water-access',
    label: 'Clean Water Access'
  }, {
    value: 'waste-management',
    label: 'Waste Management'
  }, {
    value: 'agriculture',
    label: 'Sustainable Agriculture'
  }];
  const regions = [{
    value: 'kenya',
    label: 'Kenya'
  }, {
    value: 'tanzania',
    label: 'Tanzania'
  }, {
    value: 'uganda',
    label: 'Uganda'
  }, {
    value: 'rwanda',
    label: 'Rwanda'
  }, {
    value: 'ethiopia',
    label: 'Ethiopia'
  }];
  const disbursementOptions = [{
    value: 'milestone',
    label: 'Milestone-Based'
  }, {
    value: 'performance',
    label: 'Performance-Based'
  }, {
    value: 'time',
    label: 'Time-Based'
  }, {
    value: 'hybrid',
    label: 'Hybrid Approach'
  }];
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const handleSubmit = () => {
    toast({
      title: "Investment Program Created",
      description: `${formData.programName} has been successfully created and is now under review.`
    });
    // Reset form or redirect
  };
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.programName && formData.description && formData.investmentType && formData.totalAmount;
      case 2:
        return formData.region && formData.targetSchools && formData.expectedBeneficiaries && formData.co2Target;
      case 3:
        return formData.disbursementStructure && formData.tranches && formData.paymentSchedule;
      case 4:
        return true;
      // Documentation is optional
      default:
        return false;
    }
  };
  return <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Financed Project</h1>
        <p className="text-muted-foreground">
          Set up a new sustainable investment program with comprehensive impact tracking
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Setup Progress</h3>
          <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="mb-4" />
        <div className="flex justify-between text-sm">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 1 ? <CheckCircle className="w-3 h-3" /> : '1'}
            </div>
            Basic Info
          </div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 2 ? <CheckCircle className="w-3 h-3" /> : '2'}
            </div>
            Impact & Location
          </div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 3 ? <CheckCircle className="w-3 h-3" /> : '3'}
            </div>
            Financial Structure
          </div>
          <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {currentStep > 4 ? <CheckCircle className="w-3 h-3" /> : '4'}
            </div>
            Review & Submit
          </div>
        </div>
      </Card>

      {/* Form Steps */}
      <Card className="p-6">
        {currentStep === 1 && <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="programName">Program Name *</Label>
                <Input id="programName" placeholder="e.g., Kenya Clean Cooking Initiative" value={formData.programName} onChange={e => handleInputChange('programName', e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Describe the program objectives, target beneficiaries, and expected outcomes..." rows={4} value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
              </div>

              <div>
                <Label htmlFor="investmentType">Investment Type *</Label>
                <Select value={formData.investmentType} onValueChange={value => handleInputChange('investmentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map(type => <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Investment Amount (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="totalAmount" placeholder="150000" value={formData.totalAmount} onChange={e => handleInputChange('totalAmount', e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          </div>}

        {currentStep === 2 && <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Impact & Location</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Primary Region *</Label>
                <Select value={formData.region} onValueChange={value => handleInputChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetSchools">Target Schools/Institutions *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="targetSchools" placeholder="25" value={formData.targetSchools} onChange={e => handleInputChange('targetSchools', e.target.value)} className="pl-10" />
                </div>
              </div>

              <div>
                <Label htmlFor="expectedBeneficiaries">Expected Beneficiaries *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="expectedBeneficiaries" placeholder="5000" value={formData.expectedBeneficiaries} onChange={e => handleInputChange('expectedBeneficiaries', e.target.value)} className="pl-10" />
                </div>
              </div>

              <div>
                <Label htmlFor="co2Target">CO₂ Reduction Target (tCO₂e) *</Label>
                <div className="relative">
                  <Leaf className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="co2Target" placeholder="450" value={formData.co2Target} onChange={e => handleInputChange('co2Target', e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Impact Calculation
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cost per School:</span>
                  <p className="font-medium">
                    {formData.totalAmount && formData.targetSchools ? `$${(parseInt(formData.totalAmount) / parseInt(formData.targetSchools || '1')).toLocaleString()}` : '$0'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost per Beneficiary:</span>
                  <p className="font-medium">
                    {formData.totalAmount && formData.expectedBeneficiaries ? `$${(parseInt(formData.totalAmount) / parseInt(formData.expectedBeneficiaries || '1')).toFixed(2)}` : '$0'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cost per tCO₂e:</span>
                  <p className="font-medium">
                    {formData.totalAmount && formData.co2Target ? `$${(parseInt(formData.totalAmount) / parseInt(formData.co2Target || '1')).toFixed(2)}` : '$0'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Beneficiaries per School:</span>
                  <p className="font-medium">
                    {formData.expectedBeneficiaries && formData.targetSchools ? Math.round(parseInt(formData.expectedBeneficiaries) / parseInt(formData.targetSchools || '1')) : '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>}

        {currentStep === 3 && <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Financial Structure</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="disbursementStructure">Disbursement Structure *</Label>
                <Select value={formData.disbursementStructure} onValueChange={value => handleInputChange('disbursementStructure', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {disbursementOptions.map(option => <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tranches">Number of Tranches *</Label>
                <Select value={formData.tranches} onValueChange={value => handleInputChange('tranches', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Tranches</SelectItem>
                    <SelectItem value="3">3 Tranches</SelectItem>
                    <SelectItem value="4">4 Tranches</SelectItem>
                    <SelectItem value="5">5 Tranches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="paymentSchedule">Payment Schedule *</Label>
                <Select value={formData.paymentSchedule} onValueChange={value => handleInputChange('paymentSchedule', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="milestone">Milestone-Based</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Tranche Breakdown Preview</h4>
              <div className="grid gap-3">
                {Array.from({
              length: parseInt(formData.tranches) || 0
            }, (_, i) => <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Tranche {i + 1}</Badge>
                      <span className="text-sm">
                        {formData.disbursementStructure === 'milestone' ? `Milestone ${i + 1}` : formData.disbursementStructure === 'performance' ? `Performance Target ${i + 1}` : `Period ${i + 1}`}
                      </span>
                    </div>
                    <span className="font-medium">
                      {formData.totalAmount ? `$${(parseInt(formData.totalAmount) / parseInt(formData.tranches || '1')).toLocaleString()}` : '$0'}
                    </span>
                  </div>)}
              </div>
            </div>
          </div>}

        {currentStep === 4 && <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Review & Submit</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Program Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Program Name:</span>
                      <span className="font-medium">{formData.programName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Type:</span>
                      <span className="font-medium">
                        {investmentTypes.find(t => t.value === formData.investmentType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">${parseInt(formData.totalAmount || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Region:</span>
                      <span className="font-medium">
                        {regions.find(r => r.value === formData.region)?.label}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Impact Targets</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Target Schools:</span>
                      <span className="font-medium">{formData.targetSchools}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Beneficiaries:</span>
                      <span className="font-medium">{parseInt(formData.expectedBeneficiaries || '0').toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CO₂ Target:</span>
                      <span className="font-medium">{formData.co2Target} tCO₂e</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tranches:</span>
                      <span className="font-medium">{formData.tranches}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4 bg-muted/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Ready for Review</h4>
                    <p className="text-sm text-muted-foreground">
                      Your investment program will be submitted for review. You'll receive a notification 
                      once the review is complete and the program is approved for implementation.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < totalSteps ? <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
                Next Step
              </Button> : <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Program
              </Button>}
          </div>
        </div>
      </Card>
    </div>;
};
export default NewInvestment;