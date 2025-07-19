// React Query hooks for workflow state management
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import type {
    KeywordsRequest,
    ResearchRequest,
    Source,
    DraftRequest,
    ArticleContent,
    QualityMetrics,
    WorkflowResponse,
    ProgressUpdate,
    DeepResearchRequest,
    DeepResearchFact,
} from '@/lib/n8n-service';
import { n8nService } from '@/lib/n8n-service';

// Mock data for simulation
const mockSources: Source[] = [
    {
        id: '1',
        title: 'The Future of Artificial Intelligence in Healthcare: A Comprehensive Review',
        excerpt:
            'This study examines the transformative potential of AI technologies in medical diagnosis, treatment planning, and patient care optimization across various medical specialties.',
        url: 'https://www.nature.com/articles/s41591-023-02455-0',
        domain: 'nature.com',
        favicon: 'nature',
        score: 95,
        type: 'academic',
    },
    {
        id: '2',
        title: 'Machine Learning Applications in Clinical Decision Support Systems',
        excerpt:
            'Recent advances in machine learning have enabled the development of sophisticated clinical decision support tools that assist healthcare professionals in making evidence-based decisions.',
        url: 'https://pubmed.ncbi.nlm.nih.gov/articles/PMC8547821/',
        domain: 'pubmed.ncbi.nlm.nih.gov',
        favicon: 'pubmed',
        score: 92,
        type: 'academic',
    },
    {
        id: '3',
        title: 'AI-Powered Diagnostic Tools: Current State and Future Prospects',
        excerpt:
            'The integration of artificial intelligence in diagnostic imaging and laboratory medicine has shown remarkable promise in improving accuracy, efficiency, and patient outcomes.',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMra2204892',
        domain: 'nejm.org',
        favicon: 'nejm',
        score: 98,
        type: 'academic',
    },
    {
        id: '4',
        title: 'Ethical Considerations in AI-Driven Healthcare Systems',
        excerpt:
            'As artificial intelligence becomes more prevalent in healthcare, addressing ethical concerns around privacy, bias, and accountability becomes crucial for successful implementation.',
        url: 'https://www.bioethics.org/ethical-ai-healthcare',
        domain: 'bioethics.org',
        favicon: 'bioethics',
        score: 88,
        type: 'web',
    },
    {
        id: '5',
        title: 'Indeed Healthcare AI Jobs - Latest Opportunities',
        excerpt:
            'Explore the latest artificial intelligence positions in healthcare technology companies. Find AI engineer, machine learning, and data scientist roles in medical tech.',
        url: 'https://www.indeed.com/jobs?q=healthcare+ai',
        domain: 'indeed.com',
        favicon: 'indeed',
        score: 45,
        type: 'web',
    },
    {
        id: '6',
        title: 'Broken Link Example - 404 Not Found',
        excerpt:
            'This is an example of a broken link that will fail validation during the source review process.',
        url: 'https://nonexistent-domain-12345.com/broken-page',
        domain: 'nonexistent-domain-12345.com',
        favicon: 'broken',
        score: 20,
        type: 'web',
    },
];

// Workflow state management
interface WorkflowState {
    currentStep: number;
    executionId: string | null;
    keywordsData: KeywordsRequest | null;
    researchData: Source[] | null;
    deepResearchData: DeepResearchFact[] | null;
    draftData: ArticleContent | null;
    qualityData: QualityMetrics | null;
    feedback: string | null;
    isLoading: boolean;
    error: string | null;
    progress: number;
}

const initialState: WorkflowState = {
    currentStep: 0,
    executionId: null,
    keywordsData: null,
    researchData: null,
    deepResearchData: null,
    draftData: null,
    qualityData: null,
    feedback: null,
    isLoading: false,
    error: null,
    progress: 0,
};

// Main workflow hook
export function useWorkflow() {
    const [state, setState] = useState<WorkflowState>(initialState);
    const queryClient = useQueryClient();

    // Progress tracking
    const handleProgress = useCallback(
        (update: ProgressUpdate) => {
            setState((prev) => ({
                ...prev,
                progress: update.progress,
                isLoading: update.status === 'running',
                error:
                    update.status === 'failed'
                        ? update.message || 'Workflow failed'
                        : null,
            }));

            // Invalidate queries when workflow completes
            if (update.status === 'completed') {
                queryClient.invalidateQueries({
                    queryKey: ['workflow', update.executionId],
                });
            }
        },
        [queryClient]
    );

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
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetWorkflow = useCallback(() => {
        if (state.executionId) {
            n8nService.offProgress(state.executionId);
        }
        setState(initialState);
        queryClient.clear();
    }, [state.executionId, queryClient]);

    const nextStep = useCallback(() => {
        setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }, []);

    return {
        state,
        updateState,
        resetWorkflow,
        nextStep,
    };
}

// Step 1: Keywords processing
export function useKeywordsProcessing() {
    return useMutation({
        mutationFn: async (
            request: KeywordsRequest
        ): Promise<
            WorkflowResponse<{
                processedKeywords: string[];
                searchStrategy: string;
                estimatedSources: number;
            }>
        > => {
            return await n8nService.processKeywords(request);
        },
        onError: (error) => {
            console.error('Keywords processing failed:', error);
        },
    });
}

// Step 2: Research conducting
export function useResearchConduction() {
    return useMutation({
        mutationFn: async (
            request: ResearchRequest
        ): Promise<
            WorkflowResponse<{
                sources: Source[];
                totalFound: number;
                searchQueries: string[];
            }>
        > => {
            return await n8nService.conductResearch(request);
        },
        onError: (error) => {
            console.error('Research failed:', error);
        },
    });
}

// New mutation for Deep Research
export function useDeepResearch() {
    return useMutation({
        mutationFn: async (
            request: DeepResearchRequest
        ): Promise<WorkflowResponse<DeepResearchFact[]>> => {
            return await n8nService.executeDeepResearchWorkflow(request);
        },
        onError: (error) => {
            console.error('Deep research failed:', error);
        },
    });
}

// Step 3: Source analysis
export function useSourceAnalysis() {
    return useMutation({
        mutationFn: async (
            sources: Source[]
        ): Promise<
            WorkflowResponse<{
                analyzedSources: Source[];
                recommendations: string[];
            }>
        > => {
            return await n8nService.analyzeSources(sources);
        },
        onError: (error) => {
            console.error('Source analysis failed:', error);
        },
    });
}

// Step 4: Draft generation
export function useDraftGeneration() {
    return useMutation({
        mutationFn: async (
            request: DraftRequest
        ): Promise<WorkflowResponse<ArticleContent>> => {
            return await n8nService.generateDraft(request);
        },
        onError: (error) => {
            console.error('Draft generation failed:', error);
        },
    });
}

// Step 5: Quality analysis
export function useQualityAnalysis() {
    return useMutation({
        mutationFn: async (
            content: ArticleContent
        ): Promise<WorkflowResponse<QualityMetrics>> => {
            return await n8nService.analyzeQuality(content);
        },
        onError: (error) => {
            console.error('Quality analysis failed:', error);
        },
    });
}

// Step 5.1: Refine draft
export function useRefineDraft() {
    return useMutation({
        mutationFn: async ({
            content,
            feedback,
        }: {
            content: ArticleContent;
            feedback: string;
        }): Promise<
            WorkflowResponse<{
                evaluationResult: QualityMetrics;
                refinedArticle: string;
            }>
        > => {
            return await n8nService.refineDraft(content, feedback);
        },
        onError: (error) => {
            console.error('Draft refinement failed:', error);
        },
    });
}

// Step 6: Article export
export function useArticleExport() {
    return useMutation({
        mutationFn: async ({
            content,
            format,
        }: {
            content: ArticleContent;
            format: 'html' | 'docx' | 'pdf' | 'markdown';
        }): Promise<
            WorkflowResponse<{
                downloadUrl: string;
                previewContent: string;
            }>
        > => {
            return await n8nService.exportArticle(content, format);
        },
        onError: (error) => {
            console.error('Article export failed:', error);
        },
    });
}

// Execution status monitoring
export function useExecutionStatus(
    executionId: string | null,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: ['executionStatus', executionId],
        queryFn: async () => {
            if (!executionId) throw new Error('No execution ID provided');
            return await n8nService.getExecutionStatus(executionId);
        },
        enabled: enabled && !!executionId,
        refetchInterval: 2000, // Poll every 2 seconds
        retry: 3,
    });
}

// Execution cancellation
export function useExecutionCancellation() {
    return useMutation({
        mutationFn: async (
            executionId: string
        ): Promise<WorkflowResponse<{ cancelled: boolean }>> => {
            return await n8nService.cancelExecution(executionId);
        },
        onError: (error) => {
            console.error('Execution cancellation failed:', error);
        },
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
    const deepResearchMutation = useDeepResearch();
    const sourceAnalysisMutation = useSourceAnalysis();
    const draftMutation = useDraftGeneration();
    const qualityMutation = useQualityAnalysis();
    const refineMutation = useRefineDraft();
    const exportMutation = useArticleExport();
    const cancelMutation = useExecutionCancellation();

    // Step execution methods
    const executeKeywords = useCallback(
        async (request: KeywordsRequest) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                const result = await keywordsMutation.mutateAsync(request);

                if (result.success) {
                    workflow.updateState({
                        keywordsData: request,
                        executionId: result.executionId,
                        isLoading: false,
                    });
                    workflow.nextStep();
                } else {
                    throw new Error(
                        result.error || 'Keywords processing failed'
                    );
                }
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [keywordsMutation, workflow, handleError, clearError]
    );

    const executeResearch = useCallback(
        async (request: ResearchRequest) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                const result = await researchMutation.mutateAsync(request);

                if (result.success) {
                    workflow.updateState({
                        researchData: result.data.sources,
                        executionId: result.executionId,
                        isLoading: false,
                    });
                    workflow.nextStep();
                } else {
                    throw new Error(result.error || 'Research failed');
                }
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [researchMutation, workflow, handleError, clearError]
    );

    const executeDeepResearch = useCallback(
        async (request: DeepResearchRequest) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                const rawResult = await deepResearchMutation.mutateAsync(request);

                // n8n webhook responses often wrap a single result in an array.
                // We handle this by taking the first element if it's an array.
                const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;

                if (result && result.success) {
                    // Ensure the data is an array before mapping. Even if n8n returns a single object,
                    // we wrap it in an array to make the rest of the logic consistent.
                    let factsArray = Array.isArray(result.data) ? result.data : [result.data];

                    console.log('Deep Research - Raw facts from n8n:', factsArray);

                    // Handle case where n8n returns stringified JSON instead of parsed objects
                    if (factsArray.length > 0 && typeof factsArray[0] === 'string') {
                        try {
                            // Parse the JSON string
                            factsArray = JSON.parse(factsArray[0]);
                            console.log('Deep Research - Parsed JSON string:', factsArray);
                        } catch (e) {
                            console.error('Failed to parse JSON string from n8n:', e);
                            throw new Error('Invalid JSON response from research workflow');
                        }
                    }

                    // We need to transform the DeepResearchFact[] to Source[]
                    const sources: Source[] = factsArray
                        // Filter out any invalid items from the LLM response to prevent crashes
                        .filter(fact => fact && typeof fact === 'object' && fact.heading && fact.source)
                        .map((fact) => {
                        let domain = '';
                        let url = '';

                        // The 'evidence' field often contains the real URL in markdown format.
                        // e.g., "...some text... ([google.com](https://google.com))"
                        const markdownLinkRegex = /\[.*?\]\((https?:\/\/[^\s)]+)\)/;
                        
                        // Safely check if fact.evidence exists and is a string before trying to match
                        if (typeof fact.evidence === 'string') {
                            const evidenceMatch = fact.evidence.match(markdownLinkRegex);
                            if (evidenceMatch && evidenceMatch[1]) {
                                url = evidenceMatch[1];
                            }
                        }

                        // As a fallback, check if the source itself is a URL and we haven't found a URL yet
                        if (!url && typeof fact.source === 'string' && fact.source.startsWith('http')) {
                            url = fact.source;
                        }

                        // Try to parse the domain from the extracted URL
                        try {
                            if (url) {
                                domain = new URL(url).hostname;
                            }
                        } catch (e) {
                            console.warn(`Could not parse domain from URL: "${url}"`);
                        }

                        const transformedSource = {
                            id: url || fact.source, // Use URL if available, otherwise fallback to source text
                            title: fact.heading,
                            excerpt: fact.evidence, // The UI component displays 'excerpt' in the 'Evidence' column.
                            url: url,
                            domain: domain,
                            favicon: '', // No favicon from this API
                            score: 0, // No score from this API
                            type: 'web' as const, // Assuming 'web' type
                        };

                        console.log('Deep Research - Transformed source:', transformedSource);
                        return transformedSource;
                    });

                    console.log('Deep Research - Final sources array:', sources);
                    console.log('Deep Research - Sources array length:', sources.length);

                    workflow.updateState({
                        deepResearchData: factsArray,
                        researchData: sources, // Overwrite researchData with transformed data
                        executionId: result.executionId,
                        isLoading: false,
                    });
                    workflow.nextStep();
                } else {
                    throw new Error(rawResult?.error || 'Deep research failed');
                }
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [deepResearchMutation, workflow, handleError, clearError]
    );

    const executeDraft = useCallback(
        async (request: DraftRequest) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                const result = await draftMutation.mutateAsync(request);

                if (result.success) {
                    workflow.updateState({
                        draftData: result.data,
                        executionId: result.executionId,
                        isLoading: false,
                    });
                    workflow.nextStep();
                } else {
                    throw new Error(result.error || 'Draft generation failed');
                }
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [draftMutation, workflow, handleError, clearError]
    );

    const executeQuality = useCallback(
        async (content: ArticleContent) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                const result = await qualityMutation.mutateAsync(content);

                if (result.success) {
                    workflow.updateState({
                        qualityData: result.data,
                        executionId: result.executionId,
                        isLoading: false,
                    });
                    // workflow.nextStep();
                } else {
                    throw new Error(result.error || 'Quality analysis failed');
                }
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [qualityMutation, workflow, handleError, clearError]
    );

    const executeRefine = useCallback(
        async (content: ArticleContent, feedback: string) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                const result = await refineMutation.mutateAsync({
                    content,
                    feedback,
                });

                if (result.success) {
                    workflow.updateState({
                        qualityData: result.data.evaluationResult,
                        executionId: result.executionId,
                        draftData: {
                            ...workflow.state.draftData!,
                            content: result.data.refinedArticle,
                        },
                        isLoading: false,
                    });
                } else {
                    console.error('Draft refinement failed:', result.error);
                    throw new Error(result.error || 'Draft refinement failed');
                }
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [refineMutation, workflow, handleError, clearError]
    );

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
    const simulateKeywords = useCallback(
        async (request: KeywordsRequest) => {
            try {
                clearError();
                workflow.updateState({ isLoading: true, error: null });

                // Simulate processing time
                await new Promise((resolve) => setTimeout(resolve, 2000));

                workflow.updateState({
                    keywordsData: request,
                    executionId: `sim-keywords-${Date.now()}`,
                    isLoading: false,
                });
                workflow.nextStep();
            } catch (err) {
                handleError(err);
                workflow.updateState({ isLoading: false });
            }
        },
        [workflow, handleError, clearError]
    );

    const simulateResearch = useCallback(async () => {
        try {
            clearError();
            workflow.updateState({ isLoading: true, error: null });

            // Simulate processing time with progress updates
            for (let i = 0; i <= 100; i += 20) {
                await new Promise((resolve) => setTimeout(resolve, 300));
                workflow.updateState({ progress: i });
            }

            workflow.updateState({
                researchData: mockSources,
                executionId: `sim-research-${Date.now()}`,
                isLoading: false,
                progress: 100,
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
        executeDeepResearch,
        executeDraft,
        executeQuality,
        executeRefine,
        cancelExecution,
        simulateKeywords,
        simulateResearch,
        mutations: {
            keywords: keywordsMutation,
            research: researchMutation,
            deepResearch: deepResearchMutation,
            sourceAnalysis: sourceAnalysisMutation,
            draft: draftMutation,
            quality: qualityMutation,
            export: exportMutation,
        },
    };
}
