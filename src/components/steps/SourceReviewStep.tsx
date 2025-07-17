import { useState, useEffect } from "react";
import { Search, Filter, AlertCircle, ExternalLink, CheckCircle, X, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Source } from "@/lib/n8n-service";
import { validateLinks } from "@/lib/link-validator";

interface SourceReviewStepProps {
  workflowManager: any; // We'll properly type this later
}

interface EnhancedSource extends Source {
  isSelected: boolean;
  validationStatus: 'pending' | 'valid' | 'invalid' | 'competitor' | 'error';
  validationMessage?: string;
}

// Sample test data for testing validation
const SAMPLE_TEST_SOURCES: EnhancedSource[] = [
  {
    id: "test-1",
    title: "Valid Research Paper - Nature",
    excerpt: "A comprehensive study on AI applications in healthcare...",
    domain: "nature.com",
    url: "https://www.nature.com/articles/s41586-019-1390-1",
    favicon: "N",
    score: 0.95,
    type: "academic",
    isSelected: true,
    validationStatus: 'pending'
  },
  {
    id: "test-2", 
    title: "PubMed Research Article",
    excerpt: "Clinical trials and medical research findings...",
    domain: "pubmed.ncbi.nlm.nih.gov",
    url: "https://pubmed.ncbi.nlm.nih.gov/31000000",
    favicon: "P",
    score: 0.90,
    type: "academic",
    isSelected: true,
    validationStatus: 'pending'
  },
  {
    id: "test-3",
    title: "Competitor Job Listing - Indeed",
    excerpt: "Software Engineer position at Tech Company...",
    domain: "indeed.com",
    url: "https://www.indeed.com/viewjob?jk=12345",
    favicon: "I",
    score: 0.70,
    type: "web",
    isSelected: true,
    validationStatus: 'pending'
  },
  {
    id: "test-4",
    title: "LinkedIn Job Post",
    excerpt: "Data Scientist role at innovative startup...",
    domain: "linkedin.com", 
    url: "https://www.linkedin.com/jobs/view/123456789",
    favicon: "L",
    score: 0.65,
    type: "web",
    isSelected: true,
    validationStatus: 'pending'
  },
  {
    id: "test-5",
    title: "Broken Link Example",
    excerpt: "This link should fail validation...",
    domain: "nonexistent-domain-12345.com",
    url: "https://nonexistent-domain-12345.com/article",
    favicon: "X",
    score: 0.30,
    type: "web",
    isSelected: true,
    validationStatus: 'pending'
  },
  {
    id: "test-6",
    title: "GitHub Repository",
    excerpt: "Open source project documentation...",
    domain: "github.com",
    url: "https://github.com/microsoft/vscode",
    favicon: "G",
    score: 0.85,
    type: "web",
    isSelected: true,
    validationStatus: 'pending'
  }
];

export const SourceReviewStep = ({ workflowManager }: SourceReviewStepProps) => {
  const [sources, setSources] = useState<EnhancedSource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "valid" | "flagged" | "pending">("all");
  const [selectedSource, setSelectedSource] = useState<EnhancedSource | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentValidatingUrl, setCurrentValidatingUrl] = useState<string>('');
  const { toast } = useToast();

  // Initialize sources from workflow state
  useEffect(() => {
    if (workflowManager.state.researchData) {
      const enhancedSources: EnhancedSource[] = workflowManager.state.researchData.map((source: Source) => ({
        ...source,
        isSelected: true, // Default to selected
        validationStatus: 'pending' as const
      }));
      setSources(enhancedSources);
    }
  }, [workflowManager.state.researchData]);

  // Load sample test data for testing
  const loadTestData = () => {
    setSources(SAMPLE_TEST_SOURCES);
    toast({
      title: "Test Data Loaded",
      description: "Sample sources loaded for testing validation feature.",
    });
  };

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "valid") return matchesSearch && source.validationStatus === 'valid';
    if (filter === "flagged") return matchesSearch && (source.validationStatus === 'invalid' || source.validationStatus === 'competitor');
    if (filter === "pending") return matchesSearch && source.validationStatus === 'pending';
    return matchesSearch;
  });

  const toggleSourceSelection = (id: string) => {
    setSources(sources.map(source => 
      source.id === id ? { ...source, isSelected: !source.isSelected } : source
    ));
  };

  const markInvalid = (id: string) => {
    setSources(sources.map(source => 
      source.id === id ? { 
        ...source, 
        validationStatus: 'invalid' as const, 
        isSelected: false,
        validationMessage: 'Manually marked as invalid'
      } : source
    ));
  };

  const validateAllLinks = async () => {
    setIsValidating(true);
    setValidationProgress(0);
    setCurrentValidatingUrl('');
    
    try {
      // Extract all URLs from sources
      const urls = sources.map(source => source.url);
      
      // Call client-side validation with progress tracking
      const result = await validateLinks(
        urls, 
        (progress, currentUrl) => {
          setValidationProgress(progress);
          setCurrentValidatingUrl(currentUrl);
        },
        true // Use HTTP checking (set to false for faster basic validation)
      );
      
      const { validLinks, invalidLinks, competitorLinks } = result;
      
      // Update sources based on validation results
      setSources(prevSources => prevSources.map(source => {
        if (validLinks.includes(source.url)) {
          return {
            ...source,
            validationStatus: 'valid' as const,
            validationMessage: 'Link validated successfully'
          };
        } else if (invalidLinks.includes(source.url)) {
          return {
            ...source,
            validationStatus: 'invalid' as const,
            validationMessage: 'Link is broken or inaccessible',
            isSelected: false
          };
        } else if (competitorLinks.includes(source.url)) {
          return {
            ...source,
            validationStatus: 'competitor' as const,
            validationMessage: 'Identified as competitor content',
            isSelected: false
          };
        } else {
          return {
            ...source,
            validationStatus: 'error' as const,
            validationMessage: 'Validation failed'
          };
        }
      }));

      toast({
        title: "Validation Complete",
        description: `${validLinks.length} valid, ${invalidLinks.length} invalid, ${competitorLinks.length} competitor links found.`,
      });
      
    } catch (error) {
      console.error('Link validation failed:', error);
      toast({
        title: "Validation Failed",
        description: "Unable to validate links. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
      setValidationProgress(0);
      setCurrentValidatingUrl('');
    }
  };

  const handleProceedToDraft = () => {
    // Update workflow state with selected sources
    const selectedSources = sources.filter(source => source.isSelected);
    workflowManager.updateState({ 
      researchData: selectedSources 
    });
    workflowManager.nextStep();
  };

  const selectedCount = sources.filter(s => s.isSelected).length;
  const validCount = sources.filter(s => s.validationStatus === 'valid').length;
  const invalidCount = sources.filter(s => s.validationStatus === 'invalid' || s.validationStatus === 'competitor').length;
  const pendingCount = sources.filter(s => s.validationStatus === 'pending').length;

  const getValidationBadge = (source: EnhancedSource) => {
    switch (source.validationStatus) {
      case 'valid':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive" className="text-xs">Invalid</Badge>;
      case 'competitor':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Competitor</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  if (!sources.length) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Sources Found</h2>
        <p className="text-muted-foreground mb-4">
          No research data available. You can go back to research or load test data to try the validation feature.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => workflowManager.updateState({ currentStep: 1 })}>
            Back to Research
          </Button>
          <Button variant="outline" onClick={loadTestData}>
            Load Test Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Source Review & Validation</h1>
        <p className="text-muted-foreground">
          Review and validate the sources found during research
        </p>
        {/* Test Data Button for Development */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={loadTestData}>
            Load Test Data
          </Button>
        </div>
      </div>

      {/* Validation Status Alert */}
      {(pendingCount > 0 || isValidating) && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {isValidating ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Validating links... ({validationProgress}%)</span>
                  <span className="text-sm text-muted-foreground">
                    {currentValidatingUrl ? new URL(currentValidatingUrl).hostname : ''}
                  </span>
                </div>
                <Progress value={validationProgress} className="w-full" />
                {currentValidatingUrl && (
                  <p className="text-xs text-muted-foreground truncate">
                    Checking: {currentValidatingUrl}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>{pendingCount} sources pending validation</span>
                <Button 
                  size="sm" 
                  onClick={validateAllLinks}
                  disabled={isValidating}
                  className="ml-4"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Validate All Links
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({sources.length})
          </Button>
          <Button
            variant={filter === "valid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("valid")}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Valid ({validCount})
          </Button>
          <Button
            variant={filter === "flagged" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("flagged")}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Flagged ({invalidCount})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Pending ({pendingCount})
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Sources Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Select</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Evidence</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((source) => (
                  <tr key={source.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <Checkbox
                        checked={source.isSelected}
                        onCheckedChange={() => toggleSourceSelection(source.id)}
                        disabled={source.validationStatus === 'invalid' || source.validationStatus === 'competitor'}
                      />
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button 
                              className="text-sm font-medium text-left hover:text-primary transition-colors line-clamp-2"
                              onClick={() => setSelectedSource(source)}
                            >
                              {source.title}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-left">{source.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Excerpt</h4>
                                <p className="text-sm text-muted-foreground">{source.excerpt}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Source Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Domain:</strong> {source.domain}</p>
                                  <p><strong>URL:</strong> {source.url}</p>
                                  <p><strong>Type:</strong> {source.type}</p>
                                  {source.validationMessage && (
                                    <p><strong>Validation:</strong> {source.validationMessage}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {source.domain}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {source.type}
                            </Badge>
                          {getValidationBadge(source)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                        {source.excerpt}
                      </p>
                    </td>
                    <td className="p-4">
                      {getValidationBadge(source)}
                      {source.validationMessage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {source.validationMessage}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {(source.validationStatus === 'valid' || source.validationStatus === 'pending') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markInvalid(source.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Decision Banner */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Ready to proceed?</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCount} sources selected | {invalidCount} sources flagged | {pendingCount} pending validation
              </p>
              {pendingCount > 0 && (
                <p className="text-sm text-orange-600">
                  Consider validating pending sources before proceeding.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {pendingCount > 0 && !isValidating && (
                <Button 
                  variant="outline" 
                  onClick={validateAllLinks}
                  disabled={isValidating}
                >
                  Validate Links
                </Button>
              )}
              <Button 
                onClick={handleProceedToDraft} 
                disabled={selectedCount === 0 || workflowManager.state.isLoading}
              >
                {workflowManager.state.isLoading ? "Processing..." : "Generate Draft"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};