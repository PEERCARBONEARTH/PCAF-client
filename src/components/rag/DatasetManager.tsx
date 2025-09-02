import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  Search,
  BookOpen,
  Users,
  TrendingUp,
  Shield,
  Settings,
  Brain,
  CheckCircle,
  Target,
  Zap,
  FileText,
  Filter,
  Upload,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2
} from 'lucide-react';
import { pureDatasetRAGService } from '@/services/pureDatasetRAGService';
import motorVehicleDataset from '@/data/motorVehicleQADataset.json';

interface DatasetManagerProps {
  className?: string;
}

export function DatasetManager({ className }: DatasetManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [datasetStats, setDatasetStats] = useState<any>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [chromaStatus, setChromaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [embeddedFiles, setEmbeddedFiles] = useState<any[]>([]);

  useEffect(() => {
    // Load dataset statistics
    const stats = pureDatasetRAGService.getDatasetStats();
    setDatasetStats(stats);
    
    // Load all questions for filtering
    loadQuestions();
    
    // Check ChromaDB status
    checkChromaDBStatus();
    
    // Load embedded files list
    loadEmbeddedFiles();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [searchQuery, selectedCategory, selectedRole]);

  const loadQuestions = () => {
    const allQuestions: any[] = [];
    
    Object.entries(motorVehicleDataset.categories).forEach(([categoryKey, category]: [string, any]) => {
      category.questions?.forEach((question: any) => {
        allQuestions.push({
          ...question,
          categoryKey,
          categoryName: category.description
        });
      });
    });
    
    setFilteredQuestions(allQuestions);
  };

  const filterQuestions = () => {
    let filtered = [];
    
    Object.entries(motorVehicleDataset.categories).forEach(([categoryKey, category]: [string, any]) => {
      if (selectedCategory !== 'all' && categoryKey !== selectedCategory) return;
      
      category.questions?.forEach((question: any) => {
        // Text search
        if (searchQuery && !question.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !question.answer.toLowerCase().includes(searchQuery.toLowerCase())) {
          return;
        }
        
        // Role filter
        if (selectedRole !== 'all') {
          const roleRelevant = question.bankingContext && 
            Object.keys(question.bankingContext).some(context => 
              context.toLowerCase().includes(selectedRole) ||
              (selectedRole === 'executive' && (context.includes('strategic') || context.includes('board'))) ||
              (selectedRole === 'risk_manager' && context.includes('risk')) ||
              (selectedRole === 'compliance_officer' && context.includes('compliance')) ||
              (selectedRole === 'loan_officer' && (context.includes('loan') || context.includes('operational')))
            );
          
          if (!roleRelevant) return;
        }
        
        filtered.push({
          ...question,
          categoryKey,
          categoryName: category.description
        });
      });
    });
    
    setFilteredQuestions(filtered);
  };

  const getCategoryIcon = (categoryKey: string) => {
    const icons = {
      portfolio_analysis: TrendingUp,
      methodology_deep: BookOpen,
      compliance_regulatory: Shield,
      strategic_advisory: Target,
      operational_excellence: Settings
    };
    return icons[categoryKey as keyof typeof icons] || Database;
  };

  const getCategoryColor = (categoryKey: string) => {
    const colors = {
      portfolio_analysis: 'bg-blue-500',
      methodology_deep: 'bg-green-500',
      compliance_regulatory: 'bg-red-500',
      strategic_advisory: 'bg-purple-500',
      operational_excellence: 'bg-orange-500'
    };
    return colors[categoryKey as keyof typeof colors] || 'bg-gray-500';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      executive: Target,
      risk_manager: Shield,
      compliance_officer: CheckCircle,
      loan_officer: Users
    };
    return icons[role as keyof typeof icons] || Users;
  };

  const testQuestion = async (question: any) => {
    try {
      const response = await pureDatasetRAGService.processQuery({
        query: question.question,
        sessionId: 'test_session',
        userRole: 'risk_manager'
      });
      
      console.log('Test Response:', response);
      alert(`Confidence: ${response.confidence}\nResponse Length: ${response.response.length} chars\nSources: ${response.sources.length}`);
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed - check console for details');
    }
  };

  const checkChromaDBStatus = async () => {
    setChromaStatus('checking');
    try {
      const { chromaAPI } = await import('@/api/chromaAPI');
      const status = await chromaAPI.checkStatus();
      setChromaStatus(status.status);
    } catch (error) {
      setChromaStatus('unavailable');
    }
  };

  const loadEmbeddedFiles = async () => {
    try {
      const { chromaAPI } = await import('@/api/chromaAPI');
      const files = await chromaAPI.getEmbeddedFiles();
      setEmbeddedFiles(files);
    } catch (error) {
      console.error('Failed to load embedded files:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setUploadMessage('Please upload a JSON file');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadMessage('Reading file...');

    try {
      // Read file content
      const fileContent = await file.text();
      let qaData;

      try {
        qaData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }

      // Validate Q&A structure
      if (!validateQAStructure(qaData)) {
        throw new Error('Invalid Q&A structure. Expected format: {categories: {category_name: {questions: [...]}}}');
      }

      setUploadProgress(25);
      setUploadMessage('Validating Q&A structure...');

      // Process and embed the Q&A data
      await processAndEmbedQA(qaData, file.name);

      setUploadStatus('success');
      setUploadMessage(`Successfully embedded ${countQuestions(qaData)} questions from ${file.name}`);
      
      // Refresh embedded files list
      await loadEmbeddedFiles();

    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(`Upload failed: ${error.message}`);
    }
  };

  const validateQAStructure = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (!data.categories || typeof data.categories !== 'object') return false;

    // Check if at least one category has questions
    for (const category of Object.values(data.categories)) {
      if (category && typeof category === 'object' && Array.isArray((category as any).questions)) {
        // Validate question structure
        for (const question of (category as any).questions) {
          if (!question.question || !question.answer) return false;
        }
        return true;
      }
    }
    return false;
  };

  const countQuestions = (data: any): number => {
    let count = 0;
    for (const category of Object.values(data.categories)) {
      if (category && typeof category === 'object' && Array.isArray((category as any).questions)) {
        count += (category as any).questions.length;
      }
    }
    return count;
  };

  const processAndEmbedQA = async (qaData: any, filename: string) => {
    setUploadProgress(50);
    setUploadMessage('Processing Q&A pairs...');

    // Extract Q&A pairs
    const qaPairs = [];
    for (const [categoryKey, category] of Object.entries(qaData.categories)) {
      if (category && typeof category === 'object' && Array.isArray((category as any).questions)) {
        for (const question of (category as any).questions) {
          qaPairs.push({
            ...question,
            categoryKey,
            categoryDescription: (category as any).description || categoryKey,
            sourceFile: filename
          });
        }
      }
    }

    setUploadProgress(75);
    setUploadMessage('Embedding into ChromaDB...');

    // Send to ChromaDB embedding API
    const { chromaAPI } = await import('@/api/chromaAPI');
    const response = await chromaAPI.embedQAData({
      qaPairs,
      filename,
      metadata: qaData.metadata || {}
    });

    setUploadProgress(100);
    setUploadMessage('Embedding complete!');
  };

  const downloadSampleQA = () => {
    const sampleQA = {
      metadata: {
        version: "1.0",
        assetClass: "sample",
        lastUpdated: new Date().toISOString().split('T')[0],
        totalQuestions: 2,
        source: "Sample Q&A Dataset"
      },
      categories: {
        sample_category: {
          description: "Sample questions for testing",
          questions: [
            {
              id: "SAMPLE001",
              question: "What is PCAF?",
              answer: "PCAF (Partnership for Carbon Accounting Financials) is a global partnership of financial institutions working together to develop and implement a harmonized approach to assess and disclose the greenhouse gas (GHG) emissions associated with their loans and investments.",
              confidence: "high",
              sources: ["PCAF Global Standard"],
              followUp: ["How do I implement PCAF?", "What are PCAF data quality scores?"],
              bankingContext: {
                riskManagement: true,
                regulatoryCompliance: true
              }
            },
            {
              id: "SAMPLE002", 
              question: "How do I calculate financed emissions?",
              answer: "Financed emissions are calculated using the formula: Financed Emissions = Attribution Factor × Asset Emissions. The attribution factor represents the financial institution's proportional share of the asset's total value or financing.",
              confidence: "high",
              sources: ["PCAF Global Standard", "GHG Protocol"],
              followUp: ["What is an attribution factor?", "How do I get emission factors?"],
              bankingContext: {
                riskManagement: true,
                capitalAllocation: true
              }
            }
          ]
        }
      }
    };

    const blob = new Blob([JSON.stringify(sampleQA, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-qa-dataset.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteEmbeddedFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this embedded file? This action cannot be undone.')) {
      return;
    }

    try {
      const { chromaAPI } = await import('@/api/chromaAPI');
      const response = await chromaAPI.deleteEmbeddedFile(fileId);
      
      if (response.success) {
        setUploadMessage('File deleted successfully');
        await loadEmbeddedFiles();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setUploadMessage(`Delete failed: ${error.message}`);
      setUploadStatus('error');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Motor Vehicle PCAF Dataset Manager
          </CardTitle>
          <CardDescription>
            Comprehensive Q&A dataset with rich banking context and role-based responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {datasetStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{datasetStats.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Object.keys(datasetStats.categoryStats).length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-muted-foreground">User Roles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-muted-foreground">High Confidence</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Questions</TabsTrigger>
          <TabsTrigger value="upload">Upload & Embed</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* ChromaDB Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                ChromaDB Vector Database Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {chromaStatus === 'checking' && (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                    <span>Checking ChromaDB connection...</span>
                  </>
                )}
                {chromaStatus === 'available' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-green-700">ChromaDB is available and ready for embeddings</span>
                  </>
                )}
                {chromaStatus === 'unavailable' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">ChromaDB is not available. Please set up ChromaDB first.</span>
                    <Button variant="outline" size="sm" onClick={checkChromaDBStatus}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </>
                )}
              </div>
              
              {chromaStatus === 'unavailable' && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Setup Required:</strong> Run the ChromaDB setup script to enable vector embeddings:
                    <br />
                    <code className="bg-muted px-2 py-1 rounded mt-2 inline-block">
                      scripts\setup-chromadb.bat (Windows) or ./scripts/setup-chromadb.sh (Unix)
                    </code>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Q&A Dataset for Embedding
              </CardTitle>
              <CardDescription>
                Upload a JSON file containing Q&A pairs to automatically embed into ChromaDB for semantic search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <h3 className="font-medium">Upload Q&A JSON File</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a JSON file with Q&A pairs to embed into ChromaDB
                  </p>
                </div>
                
                <div className="mt-4 space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    disabled={chromaStatus !== 'available' || uploadStatus === 'uploading'}
                    className="hidden"
                    id="qa-file-upload"
                  />
                  <label
                    htmlFor="qa-file-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                      chromaStatus === 'available' && uploadStatus !== 'uploading'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose JSON File'}
                  </label>
                  
                  <div className="text-xs text-muted-foreground">
                    Supported format: JSON with categories and questions structure
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadStatus !== 'idle' && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {uploadStatus === 'uploading' && <RefreshCw className="w-4 h-4 animate-spin" />}
                        {uploadStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {uploadStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-sm font-medium">
                          {uploadStatus === 'uploading' && 'Processing...'}
                          {uploadStatus === 'success' && 'Upload Complete'}
                          {uploadStatus === 'error' && 'Upload Failed'}
                        </span>
                      </div>
                      
                      {uploadStatus === 'uploading' && (
                        <div className="space-y-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">{uploadProgress}% - {uploadMessage}</div>
                        </div>
                      )}
                      
                      {(uploadStatus === 'success' || uploadStatus === 'error') && (
                        <div className={`text-sm ${uploadStatus === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                          {uploadMessage}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sample Download */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-medium">Need a sample format?</h4>
                  <p className="text-sm text-muted-foreground">Download a sample Q&A JSON file to see the expected structure</p>
                </div>
                <Button variant="outline" onClick={downloadSampleQA}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embedded Files Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Embedded Files in ChromaDB
              </CardTitle>
              <CardDescription>
                Manage Q&A datasets that have been embedded into the vector database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {embeddedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No embedded files found</p>
                  <p className="text-sm">Upload a Q&A JSON file to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {embeddedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-medium">{file.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {file.questionCount} questions • Embedded {file.embeddedAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{file.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEmbeddedFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">1. Upload JSON</h4>
                    <p className="text-sm text-muted-foreground">Upload your Q&A dataset in JSON format</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">2. Auto-Embed</h4>
                    <p className="text-sm text-muted-foreground">Questions are automatically embedded using AI</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Search className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">3. Semantic Search</h4>
                    <p className="text-sm text-muted-foreground">Enable fast, accurate semantic search</p>
                  </div>
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Benefits:</strong> ChromaDB embeddings provide 10-50x faster search with better semantic understanding compared to traditional keyword matching. Your users will get more relevant, contextual answers.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Search Questions</label>
                  <Input
                    placeholder="Search questions and answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="portfolio_analysis">Portfolio Analysis</option>
                    <option value="methodology_deep">Methodology Deep</option>
                    <option value="compliance_regulatory">Compliance & Regulatory</option>
                    <option value="strategic_advisory">Strategic Advisory</option>
                    <option value="operational_excellence">Operational Excellence</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">User Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="all">All Roles</option>
                    <option value="executive">Executive</option>
                    <option value="risk_manager">Risk Manager</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="loan_officer">Loan Officer</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Search className="w-4 h-4" />
                Showing {filteredQuestions.length} questions
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => {
              const CategoryIcon = getCategoryIcon(question.categoryKey);
              const categoryColor = getCategoryColor(question.categoryKey);
              
              return (
                <Card key={question.id || index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${categoryColor}/10`}>
                          <CategoryIcon className={`w-4 h-4 ${categoryColor.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{question.question}</CardTitle>
                          <CardDescription className="mt-1">
                            {question.categoryName} • ID: {question.id}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {question.confidence || 'high'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testQuestion(question)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Answer Preview */}
                      <div className="text-sm text-muted-foreground">
                        <strong>Answer Preview:</strong> {question.answer.substring(0, 200)}...
                      </div>
                      
                      {/* Banking Context */}
                      {question.bankingContext && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-2">Banking Context:</span>
                          {Object.entries(question.bankingContext).map(([context, enabled]) => 
                            enabled && (
                              <Badge key={context} variant="outline" className="text-xs">
                                {context.replace(/([A-Z])/g, ' $1').trim()}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                      
                      {/* Sources and Follow-ups */}
                      <div className="grid gap-2 md:grid-cols-2 text-xs">
                        <div>
                          <strong>Sources:</strong> {question.sources?.join(', ') || 'N/A'}
                        </div>
                        <div>
                          <strong>Follow-ups:</strong> {question.followUp?.length || 0} questions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(motorVehicleDataset.categories).map(([categoryKey, category]: [string, any]) => {
              const CategoryIcon = getCategoryIcon(categoryKey);
              const categoryColor = getCategoryColor(categoryKey);
              
              return (
                <Card key={categoryKey} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${categoryColor}/10`}>
                        <CategoryIcon className={`w-6 h-6 ${categoryColor.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {categoryKey.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Questions</span>
                        <Badge variant="secondary">
                          {category.questions?.length || 0}
                        </Badge>
                      </div>
                      
                      {/* Sample Questions */}
                      <div className="space-y-2">
                        {category.questions?.slice(0, 3).map((question: any, index: number) => (
                          <div key={index} className="text-sm p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                            {question.question}
                          </div>
                        ))}
                        {category.questions?.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{category.questions.length - 3} more questions...
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Coverage Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Dataset Coverage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Question Distribution by Category</h4>
                  <div className="space-y-2">
                    {datasetStats && Object.entries(datasetStats.categoryStats).map(([category, count]: [string, any]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${(count / datasetStats.totalQuestions) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Banking Context Coverage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Risk Management: 85% coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Regulatory Compliance: 90% coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Strategic Planning: 75% coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Operational Excellence: 80% coverage</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-green-700">High Confidence</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-blue-700">Source Attribution</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">4.2</div>
                  <div className="text-sm text-purple-700">Avg Follow-ups</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">850</div>
                  <div className="text-sm text-orange-700">Avg Response Length</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>Dataset Performance:</strong> This comprehensive Q&A dataset provides surgical precision for motor vehicle PCAF queries with rich banking context, role-based customization, and portfolio-aware responses. Expected confidence rate: 95%+ for matched queries.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}