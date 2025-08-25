import { useParams, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, DollarSign, Calendar, MapPin, Users, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TrancheReview() {
  const { trancheId } = useParams();
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  const { toast } = useToast();
  const [comments, setComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    const dashboardPath = currentPlatform ? `/${currentPlatform}` : "/";
    navigate(dashboardPath);
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Tranche Approved",
      description: "The tranche has been approved and funds will be disbursed.",
    });
    setIsProcessing(false);
    handleBack();
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast({
        title: "Comments Required",
        description: "Please provide comments for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Tranche Rejected",
      description: "The tranche has been rejected with comments.",
    });
    setIsProcessing(false);
    handleBack();
  };

  // Mock tranche data
  const trancheData = {
    id: trancheId,
    schoolName: "Green Valley Elementary",
    region: "Eastern Province",
    milestoneTitle: "Solar Panel Installation Complete",
    amount: "$45,000",
    progress: 85,
    submissionDate: "2024-01-15",
    documents: [
      { name: "Installation Report.pdf", status: "verified" },
      { name: "Energy Output Data.xlsx", status: "verified" },
      { name: "Site Photos.zip", status: "pending" },
    ],
    milestoneDetails: {
      description: "Installation of 50kW solar panel system on school rooftop",
      expectedOutput: "65,000 kWh annually",
      co2Reduction: "32.5 tons annually",
      beneficiaries: 450,
    }
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
            <h1 className="text-2xl font-bold">Tranche Review</h1>
            <p className="text-muted-foreground">Review and approve milestone completion</p>
          </div>
        </div>
        <Badge variant="outline" className="text-yellow-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          PENDING REVIEW
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Milestone Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">School</span>
                  <p className="font-medium">{trancheData.schoolName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Region</span>
                  <p className="font-medium">{trancheData.region}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                  <p className="font-medium text-2xl text-green-600">{trancheData.amount}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Submitted</span>
                  <p className="font-medium">{trancheData.submissionDate}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Milestone</span>
                <p className="font-medium">{trancheData.milestoneTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">{trancheData.milestoneDetails.description}</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Completion Progress</span>
                  <span className="text-sm text-muted-foreground">{trancheData.progress}%</span>
                </div>
                <Progress value={trancheData.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{trancheData.milestoneDetails.expectedOutput}</div>
                  <div className="text-sm text-muted-foreground">Annual Energy Output</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{trancheData.milestoneDetails.beneficiaries}</div>
                  <div className="text-sm text-muted-foreground">Students Benefited</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{trancheData.milestoneDetails.co2Reduction}</div>
                  <div className="text-sm text-muted-foreground">CO₂ Reduction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Review submitted documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {trancheData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                  </div>
                  <Badge variant={doc.status === "verified" ? "default" : "secondary"}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
              <CardDescription>Add comments for this review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add your review comments here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Approve Tranche"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  Reject with Comments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}