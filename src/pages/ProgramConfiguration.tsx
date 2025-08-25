import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  title: string;
  description: string;
  percentage: number;
  amount: string;
}

export default function ProgramConfiguration() {
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  const { toast } = useToast();
  
  const [programData, setProgramData] = useState({
    name: "",
    description: "",
    totalBudget: "",
    currency: "USD",
    duration: "",
    region: "",
    category: "",
    autoApproval: false,
    requireDocuments: true,
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "1",
      title: "Project Initiation",
      description: "Site assessment and planning",
      percentage: 20,
      amount: "",
    },
    {
      id: "2",
      title: "Implementation Phase 1",
      description: "Equipment procurement and delivery",
      percentage: 40,
      amount: "",
    },
    {
      id: "3",
      title: "Implementation Phase 2", 
      description: "Installation and testing",
      percentage: 30,
      amount: "",
    },
    {
      id: "4",
      title: "Project Completion",
      description: "Final verification and handover",
      percentage: 10,
      amount: "",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    const dashboardPath = currentPlatform ? `/${currentPlatform}` : "/";
    navigate(dashboardPath);
  };

  const handleSave = async () => {
    if (!programData.name || !programData.totalBudget) {
      toast({
        title: "Missing Information",
        description: "Please fill in program name and total budget.",
        variant: "destructive",
      });
      return;
    }

    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercentage !== 100) {
      toast({
        title: "Invalid Milestones",
        description: "Milestone percentages must total 100%.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Program Configured",
      description: "Your program has been successfully configured and is ready for deployment.",
    });
    
    setIsLoading(false);
    handleBack();
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: `Milestone ${milestones.length + 1}`,
      description: "",
      percentage: 0,
      amount: "",
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const calculateMilestoneAmount = (percentage: number) => {
    const budget = parseFloat(programData.totalBudget) || 0;
    return ((budget * percentage) / 100).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-7 w-7" />
              Program Configuration
            </h1>
            <p className="text-muted-foreground">Set up your green finance program parameters</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>Basic information about your program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={programData.name}
                  onChange={(e) => setProgramData({...programData, name: e.target.value})}
                  placeholder="e.g., Solar Schools Initiative"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={programData.description}
                  onChange={(e) => setProgramData({...programData, description: e.target.value})}
                  placeholder="Describe the program objectives and scope"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={programData.totalBudget}
                    onChange={(e) => setProgramData({...programData, totalBudget: e.target.value})}
                    placeholder="1000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={programData.currency} onValueChange={(value) => setProgramData({...programData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={programData.duration}
                    onChange={(e) => setProgramData({...programData, duration: e.target.value})}
                    placeholder="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Target Region</Label>
                  <Select value={programData.region} onValueChange={(value) => setProgramData({...programData, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eastern">Eastern Province</SelectItem>
                      <SelectItem value="western">Western Province</SelectItem>
                      <SelectItem value="central">Central Province</SelectItem>
                      <SelectItem value="northern">Northern Province</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>Configure approval and documentation requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approval for milestones</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve completed milestones</p>
                </div>
                <Switch
                  checked={programData.autoApproval}
                  onCheckedChange={(checked) => setProgramData({...programData, autoApproval: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require documentation</Label>
                  <p className="text-sm text-muted-foreground">Require document upload for milestone completion</p>
                </div>
                <Switch
                  checked={programData.requireDocuments}
                  onCheckedChange={(checked) => setProgramData({...programData, requireDocuments: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Milestone Structure</CardTitle>
                <CardDescription>Define payment milestones and percentages</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Milestone {index + 1}</span>
                  {milestones.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Input
                    value={milestone.title}
                    onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                    placeholder="Milestone title"
                  />
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                    placeholder="Milestone description"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Percentage</Label>
                      <Input
                        type="number"
                        value={milestone.percentage}
                        onChange={(e) => updateMilestone(milestone.id, "percentage", parseInt(e.target.value) || 0)}
                        placeholder="20"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Amount</Label>
                      <Input
                        value={calculateMilestoneAmount(milestone.percentage)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Percentage:</span>
                <span className={`font-medium ${milestones.reduce((sum, m) => sum + m.percentage, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {milestones.reduce((sum, m) => sum + m.percentage, 0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}