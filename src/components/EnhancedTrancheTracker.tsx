import { useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, CheckCircle, Clock, AlertCircle, Play } from "lucide-react";
import { useState } from "react";

interface Tranche {
  id: string;
  schoolName: string;
  region: string;
  milestoneTitle: string;
  milestoneProgress: number;
  amount: string;
  status: "in-progress" | "review" | "completed" | "pending";
  lastUpdate: string;
  nextMilestone: string;
  co2Impact: string;
}

export const EnhancedTrancheTracker = () => {
  const navigate = useNavigate();
  const { currentPlatform } = usePlatform();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const tranches: Tranche[] = [
    {
      id: "TRN-001",
      schoolName: "Kibera Primary School",
      region: "Nairobi, Kenya",
      milestoneTitle: "200 verified cooking hours",
      milestoneProgress: 87,
      amount: "$15,000",
      status: "review",
      lastUpdate: "2 hours ago",
      nextMilestone: "MRV audit completion",
      co2Impact: "12.5 tCO₂e"
    },
    {
      id: "TRN-002",
      schoolName: "Mwanza Secondary School",
      region: "Mwanza, Tanzania",
      milestoneTitle: "150 verified cooking hours",
      milestoneProgress: 45,
      amount: "$12,500",
      status: "in-progress",
      lastUpdate: "1 day ago",
      nextMilestone: "Baseline verification",
      co2Impact: "8.3 tCO₂e"
    },
    {
      id: "TRN-003",
      schoolName: "Kampala Girls School",
      region: "Kampala, Uganda",
      milestoneTitle: "300 verified cooking hours",
      milestoneProgress: 100,
      amount: "$18,000",
      status: "completed",
      lastUpdate: "3 days ago",
      nextMilestone: "Next tranche planning",
      co2Impact: "15.8 tCO₂e"
    },
    {
      id: "TRN-004",
      schoolName: "Dar es Salaam Tech",
      region: "Dar es Salaam, Tanzania",
      milestoneTitle: "Baseline audit completion",
      milestoneProgress: 25,
      amount: "$8,500",
      status: "pending",
      lastUpdate: "1 week ago",
      nextMilestone: "Equipment installation",
      co2Impact: "5.2 tCO₂e"
    },
    {
      id: "TRN-005",
      schoolName: "Kigali International School",
      region: "Kigali, Rwanda",
      milestoneTitle: "250 verified cooking hours",
      milestoneProgress: 78,
      amount: "$16,500",
      status: "in-progress",
      lastUpdate: "5 hours ago",
      nextMilestone: "Impact verification",
      co2Impact: "11.2 tCO₂e"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      case "review": return <Eye className="h-4 w-4 text-warning" />;
      case "in-progress": return <Clock className="h-4 w-4 text-primary" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success border-success/20";
      case "review": return "bg-warning/10 text-warning border-warning/20";
      case "in-progress": return "bg-primary/10 text-primary border-primary/20";
      case "pending": return "bg-muted/10 text-muted-foreground border-muted/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const filteredTranches = tranches.filter(tranche => {
    const matchesSearch = tranche.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tranche.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tranche.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || tranche.status === statusFilter;
    const matchesRegion = regionFilter === "all" || tranche.region.includes(regionFilter);
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getActionButton = (tranche: Tranche) => {
    const handleAction = () => {
      const basePath = currentPlatform ? `/${currentPlatform}` : "";
      switch (tranche.status) {
        case "review":
          navigate(`${basePath}/tranches/${tranche.id}/review`);
          break;
        case "in-progress":
          navigate(`${basePath}/projects/PRJ-001`);
          break;
        case "completed":
          navigate(`${basePath}/reporting`);
          break;
        default:
          break;
      }
    };

    switch (tranche.status) {
      case "review":
        return (
          <Button size="sm" variant="outline" className="text-warning border-warning/20 hover:bg-warning/10" onClick={handleAction}>
            Review & Approve
          </Button>
        );
      case "in-progress":
        return (
          <Button size="sm" variant="ghost" className="text-primary" onClick={handleAction}>
            View Progress
          </Button>
        );
      case "completed":
        return (
          <Button size="sm" variant="ghost" className="text-success" onClick={handleAction}>
            View Report
          </Button>
        );
      case "pending":
        return (
          <Button size="sm" variant="outline" className="text-muted-foreground" disabled>
            Initiate
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Live Tranche Tracker
            </CardTitle>
            <CardDescription>
              Real-time monitoring of disbursement milestones and progress
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="btn-glass">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm" className="btn-glass">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools, regions, or tranche IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="Tanzania">Tanzania</SelectItem>
              <SelectItem value="Uganda">Uganda</SelectItem>
              <SelectItem value="Rwanda">Rwanda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Tranche ID</TableHead>
                <TableHead>School & Region</TableHead>
                <TableHead className="hidden md:table-cell">Milestone Trigger</TableHead>
                <TableHead className="hidden lg:table-cell">Progress</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden xl:table-cell">CO₂ Impact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranches.map((tranche) => (
                <TableRow key={tranche.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">{tranche.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tranche.schoolName}</p>
                      <p className="text-sm text-muted-foreground">{tranche.region}</p>
                      <p className="text-xs text-muted-foreground">{tranche.lastUpdate}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div>
                      <p className="text-sm">{tranche.milestoneTitle}</p>
                      <p className="text-xs text-muted-foreground">Next: {tranche.nextMilestone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={tranche.milestoneProgress} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-8">{tranche.milestoneProgress}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-finance">{tranche.amount}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {tranche.co2Impact}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(tranche.status)}>
                      <span className="mr-1">{getStatusIcon(tranche.status)}</span>
                      {tranche.status === "in-progress" ? "In Progress" : 
                       tranche.status === "review" ? "Review" : 
                       tranche.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {getActionButton(tranche)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Tranches</p>
            <p className="text-lg font-semibold text-foreground">{filteredTranches.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">In Review</p>
            <p className="text-lg font-semibold text-warning">{filteredTranches.filter(t => t.status === "review").length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-lg font-semibold text-primary">{filteredTranches.filter(t => t.status === "in-progress").length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-lg font-semibold text-success">{filteredTranches.filter(t => t.status === "completed").length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};