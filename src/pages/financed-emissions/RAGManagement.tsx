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
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'RAG Management — Financed Emissions';
    fetchCollections();
  }, []);

  const testConnection = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/health`);

      if (response.ok) {
        toast({
          title: 'Connection Successful',
          description: '✅ Backend connection successful!',
        });
        fetchCollections();
      } else {
        toast({
          title: 'Connection Failed',
          description: `❌ Backend connection failed: ${response.status}`,
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Connection Error',
        description: `❌ Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/rag/collections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCollections(data.data?.collections || []);
      } else {
        throw new Error(data.error || 'Failed to fetch collections');
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setCollections([]);
      toast({
        title: 'Error',
        description: 'Failed to load RAG collections',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();

      Array.from(files).forEach(file => {
        formData.append('documents', file);
      });

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/rag/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      toast({
        title: 'Upload Successful',
        description: `Processed ${data.data.processed} documents`,
      });

      // Refresh collections
      await fetchCollections();

      // Clear file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload and process documents',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          query: searchQuery,
          collectionType: selectedCollection,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.data.results);

      toast({
        title: 'Search Complete',
        description: `Found ${data.data.results.length} relevant documents`,
      });
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Failed',
        description: 'Failed to search documents',
        variant: 'destructive'
      });
    } finally {
      setSearching(false);
    }
  };

  const getCollectionIcon = (name: string) => {
    if (!name) return <Database className="h-5 w-5 text-gray-600" />;
    if (name.includes('methodology')) return <BookOpen className="h-5 w-5 text-blue-600" />;
    if (name.includes('regulation')) return <Shield className="h-5 w-5 text-red-600" />;
    if (name.includes('calculation')) return <Calculator className="h-5 w-5 text-green-600" />;
    return <Database className="h-5 w-5 text-gray-600" />;
  };

  const getCollectionColor = (name: string) => {
    if (!name) return 'border-gray-200 bg-gray-50';
    if (name.includes('methodology')) return 'border-blue-200 bg-blue-50';
    if (name.includes('regulation')) return 'border-red-200 bg-red-50';
    if (name.includes('calculation')) return 'border-green-200 bg-green-50';
    return 'border-gray-200 bg-gray-50';
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
              <Button onClick={testConnection} variant="outline">
                Test Connection
              </Button>
              <Button onClick={fetchCollections} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
              Make sure your backend is running at: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}
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
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Drop files here or click to browse</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, TXT, and MD files (max 50MB each)
                  </p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-4 cursor-pointer"
                />
                {uploading && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing documents...</span>
                  </div>
                )}
              </div>

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
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
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
                    Upload some documents to create your first knowledge base collection
                  </p>
                  <Button onClick={() => (document.querySelector('[value="upload"]') as HTMLElement)?.click()}>
                    Upload Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}