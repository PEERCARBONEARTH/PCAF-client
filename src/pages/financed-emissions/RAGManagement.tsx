import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Search,
  Database,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Download,
  Brain,
  BookOpen,
  Shield,
  Calculator
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Collection {
  name: string;
  documentCount: number;
  lastUpdated: string;
  error?: string;
}

interface SearchResult {
  content: string;
  metadata: any;
  similarity: number;
}

export default function RAGManagementPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('methodology');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'RAG Management — Financed Emissions';
    fetchCollections();
  }, []);

  const [testingConnection, setTestingConnection] = useState(false);

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

      // Test multiple endpoints to ensure RAG service is fully operational
      const healthResponse = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }

      // Test RAG-specific endpoint
      const ragResponse = await fetch(`${apiUrl}/api/v1/rag/collections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (ragResponse.ok) {
        toast({
          title: 'Connection Successful',
          description: '✅ Backend and RAG service are operational!',
        });
        fetchCollections();
      } else if (ragResponse.status === 401) {
        toast({
          title: 'Authentication Required',
          description: '🔐 Please sign in to access RAG features',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'RAG Service Issue',
          description: `⚠️ RAG service not available: ${ragResponse.status}`,
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      toast({
        title: 'Connection Error',
        description: `❌ ${err instanceof Error ? err.message : 'Network connection failed'}`,
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      console.log('Fetching collections from:', `${apiUrl}/api/v1/rag/collections`);

      const response = await fetch(`${apiUrl}/api/v1/rag/collections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include',
      });

      console.log('Collections response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Collections API error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Collections API response:', data);

      // Handle different possible response formats
      let collections = [];

      if (data.success && data.data?.collections) {
        collections = data.data.collections;
      } else if (data.collections) {
        collections = data.collections;
      } else if (Array.isArray(data)) {
        collections = data;
      } else if (data.success === false) {
        throw new Error(data.error || data.message || 'Failed to fetch collections');
      } else {
        // Try to extract collections from any nested structure
        const possibleCollections = data.data || data.result || data;
        if (Array.isArray(possibleCollections)) {
          collections = possibleCollections;
        }
      }

      console.log('Processed collections:', collections);

      // Ensure collections have required properties
      const processedCollections = collections.map((collection: any) => ({
        name: collection.name || collection.collection_name || collection.id || 'Unknown',
        documentCount: collection.documentCount || collection.document_count || collection.count || 0,
        lastUpdated: collection.lastUpdated || collection.last_updated || collection.updated_at || new Date().toISOString(),
        error: collection.error || null
      }));

      setCollections(processedCollections);

      if (processedCollections.length === 0) {
        console.log('No collections found in response');
        toast({
          title: 'No Collections',
          description: 'No document collections found. Upload some documents to get started.',
        });
      } else {
        console.log(`Found ${processedCollections.length} collections`);
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setCollections([]);
      toast({
        title: 'Error',
        description: 'Failed to load RAG collections. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateFiles = (files: FileList): { valid: File[], invalid: { file: File, reason: string }[] } => {
    const valid: File[] = [];
    const invalid: { file: File, reason: string }[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        invalid.push({ file, reason: `File size exceeds 50MB limit (${Math.round(file.size / 1024 / 1024)}MB)` });
      } else if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        invalid.push({ file, reason: 'Unsupported file type. Please use PDF, DOCX, TXT, or MD files.' });
      } else {
        valid.push(file);
      }
    });

    return { valid, invalid };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate files first
    const { valid, invalid } = validateFiles(files);

    // Show validation errors
    if (invalid.length > 0) {
      invalid.forEach(({ file, reason }) => {
        toast({
          title: 'File Validation Error',
          description: `${file.name}: ${reason}`,
          variant: 'destructive'
        });
      });
    }

    // If no valid files, return early
    if (valid.length === 0) {
      event.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Show upload progress
      toast({
        title: 'Upload Started',
        description: `Uploading ${valid.length} file(s)...`,
      });

      const formData = new FormData();
      valid.forEach(file => {
        formData.append('documents', file);
      });

      // Add metadata
      formData.append('metadata', JSON.stringify({
        uploadedAt: new Date().toISOString(),
        source: 'rag-management-ui',
        fileCount: valid.length
      }));

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

      // Use AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch(`${apiUrl}/api/v1/rag/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload processing failed');
      }

      const processedCount = data.data?.processed || valid.length;
      const failedCount = data.data?.failed || 0;

      toast({
        title: 'Upload Successful',
        description: `Successfully processed ${processedCount} document(s)${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      });

      // Show detailed results if available
      if (data.data?.results) {
        console.log('Upload results:', data.data.results);
      }

      // Refresh collections
      await fetchCollections();

      // Clear file input and selected files
      event.target.value = '';
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);

      let errorMessage = 'Failed to upload and process documents';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Upload timed out. Please try with smaller files or fewer documents.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search Query Required',
        description: 'Please enter a search query',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSearching(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${apiUrl}/api/v1/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          collectionType: selectedCollection,
          limit: 10,
          includeMetadata: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Search failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Search processing failed');
      }

      const results = data.data?.results || [];
      setSearchResults(results);

      toast({
        title: 'Search Complete',
        description: `Found ${results.length} relevant document${results.length !== 1 ? 's' : ''}`,
      });

      if (results.length === 0) {
        toast({
          title: 'No Results Found',
          description: 'Try different keywords or check if documents are uploaded',
        });
      }
    } catch (error) {
      console.error('Search failed:', error);

      let errorMessage = 'Failed to search documents';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Search timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast({
        title: 'Search Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSearching(false);
    }
  };

  const getCollectionIcon = (name: string) => {
    if (!name) return <Database className="h-5 w-5 text-gray-700" />;
    if (name.includes('methodology')) return <BookOpen className="h-5 w-5 text-blue-700" />;
    if (name.includes('regulation')) return <Shield className="h-5 w-5 text-red-700" />;
    if (name.includes('calculation')) return <Calculator className="h-5 w-5 text-green-700" />;
    return <Database className="h-5 w-5 text-gray-700" />;
  };

  const getCollectionColor = (name: string) => {
    if (!name) return 'border-gray-300 bg-gray-100 text-gray-900';
    if (name.includes('methodology')) return 'border-blue-300 bg-blue-100 text-blue-900';
    if (name.includes('regulation')) return 'border-red-300 bg-red-100 text-red-900';
    if (name.includes('calculation')) return 'border-green-300 bg-green-100 text-green-900';
    return 'border-gray-300 bg-gray-100 text-gray-900';
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">RAG Knowledge Base Management</CardTitle>
                <CardDescription>
                  Upload and manage documents for AI-powered insights and recommendations
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={testConnection} variant="outline" disabled={testingConnection}>
                {testingConnection ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Button onClick={fetchCollections} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Collections
              </Button>
              <Button
                onClick={async () => {
                  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
                  try {
                    const response = await fetch(`${apiUrl}/api/v1/rag/collections`);
                    const data = await response.json();
                    console.log('Raw API Response:', data);
                    alert(`Raw API Response (check console): ${JSON.stringify(data, null, 2)}`);
                  } catch (err) {
                    console.error('Debug API call failed:', err);
                    alert(`API Error: ${err}`);
                  }
                }}
                variant="ghost"
                size="sm"
              >
                Debug API
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>Connection Error:</strong> {error}
            <br />
            <small>
              Make sure your backend is running at: {':42069'}
            </small>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="search">Search Knowledge Base</TabsTrigger>
          <TabsTrigger value="collections">Manage Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload PCAF methodology, regulations, and best practice documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${uploading
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-primary', 'bg-primary/10');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const event = { target: { files, value: '' } } as React.ChangeEvent<HTMLInputElement>;
                    handleFileUpload(event);
                  }
                }}
              >
                {uploading ? (
                  <div className="space-y-4">
                    <RefreshCw className="h-12 w-12 mx-auto animate-spin text-primary" />
                    <div>
                      <h3 className="text-lg font-medium">Processing Documents</h3>
                      <p className="text-sm text-muted-foreground">
                        Please wait while we analyze and index your documents...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Drop files here or click to browse</h3>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, DOCX, DOC, TXT, and MD files (max 50MB each)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Multiple files supported • Automatic content categorization
                      </p>
                    </div>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.docx,.doc,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files));
                        }
                        handleFileUpload(e);
                      }}
                      disabled={uploading}
                      className="mt-4 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </>
                )}
              </div>

              {selectedFiles.length > 0 && !uploading && (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Selected Files ({selectedFiles.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(file.size / 1024)}KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Document Categories:</strong> Files are automatically categorized based on content.
                  PCAF documents, TCFD guidance, NGFS scenarios, and regulations are detected automatically.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Supported Document Types */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Document Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium">PCAF Methodology</h4>
                  <p className="text-sm text-muted-foreground">
                    Official PCAF standards and calculation guides
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-red-600 mb-2" />
                  <h4 className="font-medium">Regulations</h4>
                  <p className="text-sm text-muted-foreground">
                    TCFD, EU Taxonomy, and central bank guidance
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Calculator className="h-8 w-8 text-green-600 mb-2" />
                  <h4 className="font-medium">Calculations</h4>
                  <p className="text-sm text-muted-foreground">
                    Emission factors and calculation methodologies
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium">Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Industry guidelines and implementation guides
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Knowledge Base
              </CardTitle>
              <CardDescription>
                Search across all uploaded documents using semantic similarity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search-query">Search Query</Label>
                  <Input
                    id="search-query"
                    placeholder="e.g., How to calculate PCAF data quality score?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="w-48">
                  <Label htmlFor="collection-select">Collection</Label>
                  <select
                    id="collection-select"
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="methodology">Methodology</option>
                    <option value="regulation">Regulations</option>
                    <option value="calculation">Calculations</option>
                    <option value="best_practice">Best Practices</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                    {searching ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Search Results</h3>
                  {searchResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {Math.round((result.similarity || 0) * 100)}% match
                            </Badge>
                            <Badge variant="secondary">
                              {result.metadata?.category || 'Unknown'}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {result.metadata?.filename || 'Unknown file'}
                          </span>
                        </div>
                        <p className="text-sm">{result.content || 'No content available'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Source: {result.metadata?.authority || 'Unknown'}</span>
                          <span>•</span>
                          <span>Type: {result.metadata?.type || 'Unknown'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          {/* Collections Management */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Knowledge Base Collections</h2>
            <Button onClick={fetchCollections} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading collections...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.filter(collection => collection && collection.name).map((collection) => (
                <Card key={collection.name || 'unknown'} className={getCollectionColor(collection.name)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCollectionIcon(collection.name)}
                        <CardTitle className="text-base">{collection.name || 'Unknown Collection'}</CardTitle>
                      </div>
                      {collection.error ? (
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-700" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Documents:</span>
                        <span className="font-medium">{(collection.documentCount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Updated:</span>
                        <span className="text-muted-foreground">
                          {collection.lastUpdated ? new Date(collection.lastUpdated).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      {collection.error && (
                        <div className="text-xs text-red-600 mt-2">
                          Error: {collection.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {collections.length === 0 && !loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {error
                      ? 'There was an error loading collections. Check the API connection.'
                      : 'Upload some documents to create your first knowledge base collection'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => (document.querySelector('[value="upload"]') as HTMLElement)?.click()}>
                      Upload Documents
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        // Try alternative endpoints that might exist
                        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
                        const endpoints = [
                          '/api/v1/rag/collections',
                          '/api/rag/collections',
                          '/rag/collections',
                          '/collections',
                          '/api/v1/collections'
                        ];

                        for (const endpoint of endpoints) {
                          try {
                            console.log(`Trying endpoint: ${apiUrl}${endpoint}`);
                            const response = await fetch(`${apiUrl}${endpoint}`);
                            if (response.ok) {
                              const data = await response.json();
                              console.log(`Success with ${endpoint}:`, data);
                              toast({
                                title: 'Found Working Endpoint',
                                description: `${endpoint} returned data. Check console.`,
                              });
                              break;
                            }
                          } catch (err) {
                            console.log(`Failed ${endpoint}:`, err);
                          }
                        }
                      }}
                    >
                      Test Endpoints
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}