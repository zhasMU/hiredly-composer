// React Query hooks for workflow state management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { 
  n8nService, 
  KeywordsRequest, 
  ResearchRequest, 
  Source, 
  DraftRequest, 
  ArticleContent, 
  QualityMetrics,
  WorkflowResponse,
  ProgressUpdate
} from '@/lib/n8n-service';

// Mock data for simulation
const mockSources: Source[] = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence in Healthcare: A Comprehensive Review",
    excerpt: "This study examines the transformative potential of AI technologies in medical diagnosis, treatment planning, and patient care optimization across various medical specialties.",
    url: "https://www.nature.com/articles/s41591-023-02455-0",
    domain: "nature.com",
    favicon: "nature",
    score: 95,
    type: "academic"
  },
  {
    id: "2",
    title: "Machine Learning Applications in Clinical Decision Support Systems",
    excerpt: "Recent advances in machine learning have enabled the development of sophisticated clinical decision support tools that assist healthcare professionals in making evidence-based decisions.",
    url: "https://pubmed.ncbi.nlm.nih.gov/articles/PMC8547821/",
    domain: "pubmed.ncbi.nlm.nih.gov",
    favicon: "pubmed",
    score: 92,
    type: "academic"
  },
  {
    id: "3",
    title: "AI-Powered Diagnostic Tools: Current State and Future Prospects",
    excerpt: "The integration of artificial intelligence in diagnostic imaging and laboratory medicine has shown remarkable promise in improving accuracy, efficiency, and patient outcomes.",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMra2204892",
    domain: "nejm.org",
    favicon: "nejm",
    score: 98,
    type: "academic"
  },
  {
    id: "4",
    title: "Ethical Considerations in AI-Driven Healthcare Systems",
    excerpt: "As artificial intelligence becomes more prevalent in healthcare, addressing ethical concerns around privacy, bias, and accountability becomes crucial for successful implementation.",
    url: "https://www.bioethics.org/ethical-ai-healthcare",
    domain: "bioethics.org",
    favicon: "bioethics",
    score: 88,
    type: "web"
  },
  {
    id: "5",
    title: "Indeed Healthcare AI Jobs - Latest Opportunities",
    excerpt: "Explore the latest artificial intelligence positions in healthcare technology companies. Find AI engineer, machine learning, and data scientist roles in medical tech.",
    url: "https://www.indeed.com/jobs?q=healthcare+ai",
    domain: "indeed.com",
    favicon: "indeed",
    score: 45,
    type: "web"
  },
  {
    id: "6",
    title: "Broken Link Example - 404 Not Found",
    excerpt: "This is an example of a broken link that will fail validation during the source review process.",
    url: "https://nonexistent-domain-12345.com/broken-page",
    domain: "nonexistent-domain-12345.com",
    favicon: "broken",
    score: 20,
    type: "web"
  }
];

// Workflow state management
interface WorkflowState {
  currentStep: number;
  executionId: string | null;
  keywordsData: KeywordsRequest | null;
  researchData: Source[] | null;
  draftData: ArticleContent | null;
  qualityData: QualityMetrics | null;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

const initialState: WorkflowState = {
  currentStep: 0,
  executionId: null,
  keywordsData: null,
  researchData: null,
  draftData: null,
  qualityData: null,
  isLoading: false,
  error: null,
  progress: 0
};

// Main workflow hook
export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>(initialState);
  const queryClient = useQueryClient();

  // Progress tracking
  const handleProgress = useCallback((update: ProgressUpdate) => {
    setState(prev => ({
      ...prev,
      progress: update.progress,
      isLoading: update.status === 'running',
      error: update.status === 'failed' ? update.message || 'Workflow failed' : null
    }));

    // Invalidate queries when workflow completes
    if (update.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ['workflow', update.executionId] });
    }
  }, [queryClient]);

  // Register progress listener when execution starts
  useEffect(() => {
    if (state.executionId) {
      n8nService.onProgress(state.executionId, handleProgress);
      return () => {
        if (state.executionId) {
          n8nService.offProgress(state.executionId);
        }
      };
    }
  }, [state.executionId, handleProgress]);

  const updateState = useCallback((updates: Partial<WorkflowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetWorkflow = useCallback(() => {
    if (state.executionId) {
      n8nService.offProgress(state.executionId);
    }
    setState(initialState);
    queryClient.clear();
  }, [state.executionId, queryClient]);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  return {
    state,
    updateState,
    resetWorkflow,
    nextStep
  };
}

// Step 1: Keywords processing
export function useKeywordsProcessing() {
  return useMutation({
    mutationFn: async (request: KeywordsRequest): Promise<WorkflowResponse<{
      processedKeywords: string[];
      searchStrategy: string;
      estimatedSources: number;
    }>> => {
      return await n8nService.processKeywords(request);
    },
    onError: (error) => {
      console.error('Keywords processing failed:', error);
    }
  });
}

// Step 2: Research conducting
export function useResearchConduction() {
  return useMutation({
    mutationFn: async (request: ResearchRequest): Promise<WorkflowResponse<{
      sources: Source[];
      totalFound: number;
      searchQueries: string[];
    }>> => {
      return await n8nService.conductResearch(request);
    },
    onError: (error) => {
      console.error('Research failed:', error);
    }
  });
}

// Step 3: Source analysis
export function useSourceAnalysis() {
  return useMutation({
    mutationFn: async (sources: Source[]): Promise<WorkflowResponse<{
      analyzedSources: Source[];
      recommendations: string[];
    }>> => {
      return await n8nService.analyzeSources(sources);
    },
    onError: (error) => {
      console.error('Source analysis failed:', error);
    }
  });
}



// Step 4: Draft generation
export function useDraftGeneration() {
  return useMutation({
    mutationFn: async (request: DraftRequest): Promise<WorkflowResponse<ArticleContent>> => {
      return await n8nService.generateDraft(request);
    },
    onError: (error) => {
      console.error('Draft generation failed:', error);
    }
  });
}

// Step 5: Quality analysis
export function useQualityAnalysis() {
  return useMutation({
    mutationFn: async (content: ArticleContent): Promise<WorkflowResponse<{
      metrics: QualityMetrics;
      suggestions: Array<{
        type: 'improvement' | 'warning' | 'info';
        title: string;
        description: string;
        severity: number;
      }>;
      overallScore: number;
    }>> => {
      return await n8nService.analyzeQuality(content);
    },
    onError: (error) => {
      console.error('Quality analysis failed:', error);
    }
  });
}

// Step 6: Article export
export function useArticleExport() {
  return useMutation({
    mutationFn: async ({ content, format }: { 
      content: ArticleContent; 
      format: 'html' | 'docx' | 'pdf' | 'markdown' 
    }): Promise<WorkflowResponse<{
      downloadUrl: string;
      previewContent: string;
    }>> => {
      return await n8nService.exportArticle(content, format);
    },
    onError: (error) => {
      console.error('Article export failed:', error);
    }
  });
}

// Execution status monitoring
export function useExecutionStatus(executionId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['executionStatus', executionId],
    queryFn: async () => {
      if (!executionId) throw new Error('No execution ID provided');
      return await n8nService.getExecutionStatus(executionId);
    },
    enabled: enabled && !!executionId,
    refetchInterval: 2000, // Poll every 2 seconds
    retry: 3
  });
}

// Execution cancellation
export function useExecutionCancellation() {
  return useMutation({
    mutationFn: async (executionId: string): Promise<WorkflowResponse<{ cancelled: boolean }>> => {
      return await n8nService.cancelExecution(executionId);
    },
    onError: (error) => {
      console.error('Execution cancellation failed:', error);
    }
  });
}

// Utility hook for handling workflow errors
export function useWorkflowError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Combined hook for complete workflow management
export function useWorkflowManager() {
  const workflow = useWorkflow();
  const { error, handleError, clearError } = useWorkflowError();
  
  const keywordsMutation = useKeywordsProcessing();
  const researchMutation = useResearchConduction();
  const sourceAnalysisMutation = useSourceAnalysis();
  const draftMutation = useDraftGeneration();
  const qualityMutation = useQualityAnalysis();
  const exportMutation = useArticleExport();
  const cancelMutation = useExecutionCancellation();

  // Step execution methods
  const executeKeywords = useCallback(async (request: KeywordsRequest) => {
    try {
      clearError();
      workflow.updateState({ isLoading: true, error: null });
      
      const result = await keywordsMutation.mutateAsync(request);
      
      if (result.success) {
        workflow.updateState({ 
          keywordsData: request,
          executionId: result.executionId,
          isLoading: false 
        });
        workflow.nextStep();
      } else {
        throw new Error(result.error || 'Keywords processing failed');
      }
    } catch (err) {
      handleError(err);
      workflow.updateState({ isLoading: false });
    }
  }, [keywordsMutation, workflow, handleError, clearError]);

  const executeResearch = useCallback(async (request: ResearchRequest) => {
    try {
      clearError();
      workflow.updateState({ isLoading: true, error: null });
      
      const result = await researchMutation.mutateAsync(request);
      
      if (result.success) {
        workflow.updateState({ 
          researchData: result.data.sources,
          executionId: result.executionId,
          isLoading: false 
        });
        workflow.nextStep();
      } else {
        throw new Error(result.error || 'Research failed');
      }
    } catch (err) {
      handleError(err);
      workflow.updateState({ isLoading: false });
    }
  }, [researchMutation, workflow, handleError, clearError]);

  const executeDraft = useCallback(async (request: DraftRequest) => {
    try {
      clearError();
      workflow.updateState({ isLoading: true, error: null });
      
      const result = await draftMutation.mutateAsync(request);
      
      if (result.success) {
        workflow.updateState({ 
          draftData: result.data,
          executionId: result.executionId,
          isLoading: false 
        });
        workflow.nextStep();
      } else {
        throw new Error(result.error || 'Draft generation failed');
      }
    } catch (err) {
      handleError(err);
      workflow.updateState({ isLoading: false });
    }
  }, [draftMutation, workflow, handleError, clearError]);

  const executeQuality = useCallback(async (content: ArticleContent) => {
    try {
      clearError();
      workflow.updateState({ isLoading: true, error: null });
      
      const result = await qualityMutation.mutateAsync(content);
      
      if (result.success) {
        workflow.updateState({ 
          qualityData: result.data.metrics,
          executionId: result.executionId,
          isLoading: false 
        });
        workflow.nextStep();
      } else {
        throw new Error(result.error || 'Quality analysis failed');
      }
    } catch (err) {
      handleError(err);
      workflow.updateState({ isLoading: false });
    }
  }, [qualityMutation, workflow, handleError, clearError]);

  const cancelExecution = useCallback(async () => {
    if (workflow.state.executionId) {
      try {
        await cancelMutation.mutateAsync(workflow.state.executionId);
        workflow.updateState({ isLoading: false, error: null });
      } catch (err) {
        handleError(err);
      }
    }
  }, [workflow.state.executionId, cancelMutation, workflow, handleError]);

  // Simulation functions for testing without n8n
  const simulateKeywords = useCallback(async (request: KeywordsRequest) => {
    try {
      clearError();
      workflow.updateState({ isLoading: true, error: null });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      workflow.updateState({ 
        keywordsData: request,
        executionId: `sim-keywords-${Date.now()}`,
        isLoading: false 
      });
      workflow.nextStep();
    } catch (err) {
      handleError(err);
      workflow.updateState({ isLoading: false });
    }
  }, [workflow, handleError, clearError]);

  const simulateResearch = useCallback(async () => {
    try {
      clearError();
      workflow.updateState({ isLoading: true, error: null });
      
      // Simulate processing time with progress updates
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        workflow.updateState({ progress: i });
      }
      
      workflow.updateState({ 
        researchData: mockSources,
        executionId: `sim-research-${Date.now()}`,
        isLoading: false,
        progress: 100
      });
      workflow.nextStep();
    } catch (err) {
      handleError(err);
      workflow.updateState({ isLoading: false });
    }
  }, [workflow, handleError, clearError]);

  return {
    ...workflow,
    error,
    clearError,
    executeKeywords,
    executeResearch,
    executeDraft,
    executeQuality,
    cancelExecution,
    simulateKeywords,
    simulateResearch,
    mutations: {
      keywords: keywordsMutation,
      research: researchMutation,
      sourceAnalysis: sourceAnalysisMutation,
      draft: draftMutation,
      quality: qualityMutation,
      export: exportMutation
    }
  };
} 