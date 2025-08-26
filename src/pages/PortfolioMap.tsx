import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map";
import { MapPin, Filter, Search, Download, Eye, TrendingUp, FileSpreadsheet, FileText, File } from "lucide-react";

const PortfolioMap = () => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [exportScope, setExportScope] = useState<string>('filtered');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    name: true,
    region: true,
    location: true,
    investment: true,
    status: true,
    co2Saved: true,
    coordinates: false
  });
  const { toast } = useToast();

  // Mock portfolio data
  const portfolioStats = {
    totalProjects: 89,
    totalInvestment: "$2.4M",
    activeRegions: 4,
    co2Saved: "1,247 tCO₂e"
  };

  const projects = [
    {
      id: 1,
      name: "Kibera Primary School",
      region: "Kenya",
      location: "Nairobi",
      investment: "$15,000",
      status: "Active",
      co2Saved: "45 tCO₂e",
      coordinates: [-1.2921, 36.8219]
    },
    {
      id: 2,
      name: "Mwanza Secondary",
      region: "Tanzania", 
      location: "Mwanza",
      investment: "$12,500",
      status: "Pending",
      co2Saved: "32 tCO₂e",
      coordinates: [-2.5164, 32.9175]
    },
    {
      id: 3,
      name: "Kampala Girls School",
      region: "Uganda",
      location: "Kampala", 
      investment: "$18,000",
      status: "Completed",
      co2Saved: "67 tCO₂e",
      coordinates: [0.3476, 32.5825]
    }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesRegion = selectedRegion === 'all' || project.region === selectedRegion;
    const matchesStatus = selectedStatus === 'all' || project.status.toLowerCase() === selectedStatus;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleFieldToggle = (field: string, checked: boolean) => {
    setSelectedFields(prev => ({ ...prev, [field]: checked }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Determine which data to export
    const dataToExport = exportScope === 'all' ? projects : filteredProjects;
    
    // Filter fields based on selection
    const exportData = dataToExport.map(project => {
      const row: any = {};
      if (selectedFields.name) row['Project Name'] = project.name;
      if (selectedFields.region) row['Region'] = project.region;
      if (selectedFields.location) row['Location'] = project.location;
      if (selectedFields.investment) row['Investment'] = project.investment;
      if (selectedFields.status) row['Status'] = project.status;
      if (selectedFields.co2Saved) row['CO₂ Saved'] = project.co2Saved;
      if (selectedFields.coordinates) row['Coordinates'] = `${project.coordinates[0]}, ${project.coordinates[1]}`;
      return row;
    });

    // Simulate export delay
    setTimeout(() => {
      if (exportFormat === 'csv') {
        downloadCSV(exportData, 'portfolio-export.csv');
      } else if (exportFormat === 'excel') {
        downloadExcel(exportData, 'portfolio-export.xlsx');
      } else if (exportFormat === 'pdf') {
        downloadPDF(exportData, 'portfolio-export.pdf');
      }
      
      setIsExporting(false);
      setExportDialogOpen(false);
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${exportData.length} projects as ${exportFormat.toUpperCase()}`,
      });
    }, 2000);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const downloadExcel = (data: any[], filename: string) => {
    // Simulate Excel export (would need xlsx library in real implementation)
    const csvContent = data.length > 0 ? [
      Object.keys(data[0]).join('\t'),
      ...data.map(row => Object.values(row).join('\t'))
    ].join('\n') : '';

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const downloadPDF = (data: any[], filename: string) => {
    // Simulate PDF export (would need jsPDF or similar in real implementation)
    const textContent = data.length > 0 ? [
      'Portfolio Export Report',
      '========================',
      '',
      ...data.map(project => 
        Object.entries(project).map(([key, value]) => `${key}: ${value}`).join('\n')
      ).join('\n\n')
    ].join('\n') : 'No data to export';

    const blob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Map</h1>
          <p className="text-muted-foreground">
            Geographic overview of all investment projects and their performance
          </p>
        </div>
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Portfolio Data</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Export Format</Label>
                <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 text-success" />
                      CSV File
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                      <File className="h-4 w-4 text-primary" />
                      Excel File
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-destructive" />
                      PDF Report
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Export Scope */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Data Scope</Label>
                <RadioGroup value={exportScope} onValueChange={setExportScope}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="filtered" id="filtered" />
                    <Label htmlFor="filtered" className="cursor-pointer">
                      Filtered Results ({filteredProjects.length} projects)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      All Projects ({projects.length} projects)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Field Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Include Fields</Label>
                <div className="space-y-2">
                  {Object.entries(selectedFields).map(([field, checked]) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={checked}
                        onCheckedChange={(checked) => handleFieldToggle(field, checked as boolean)}
                      />
                      <Label htmlFor={field} className="cursor-pointer capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting}
                  className="flex-1"
                >
                  {isExporting ? (
                    <>
                      <Download className="h-4 w-4 mr-2 animate-pulse" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setExportDialogOpen(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{portfolioStats.totalProjects}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-finance/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-finance" />
            </div>
            <div>
              <p className="text-2xl font-bold">{portfolioStats.totalInvestment}</p>
              <p className="text-sm text-muted-foreground">Total Investment</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Eye className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{portfolioStats.activeRegions}</p>
              <p className="text-sm text-muted-foreground">Active Regions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{portfolioStats.co2Saved}</p>
              <p className="text-sm text-muted-foreground">CO₂ Saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Projects</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by project name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label>Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40">
                <SelectValue />
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

          <div>
            <Label>Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Map and Project List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2 p-4">
          <div className="h-96">
            <Map 
              mapboxToken={mapboxToken} 
              onTokenSubmit={setMapboxToken}
            />
          </div>
        </Card>

        {/* Project List */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h3 className="font-semibold">Filtered Projects ({filteredProjects.length})</h3>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredProjects.map((project) => (
              <div key={project.id} className="p-3 border rounded-sm hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{project.name}</h4>
                  <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {project.location}, {project.region}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{project.investment}</span>
                  <span className="text-success">{project.co2Saved}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioMap;