// n8n Service Layer for Hiredly Composer
// Handles all communication with n8n workflows

interface N8nConfig {
    baseUrl: string;
    apiKey?: string;
    timeout: number;
}

interface WorkflowResponse<T = any> {
    success: boolean;
    data: T;
    executionId: string;
    error?: string;
}

interface ProgressUpdate {
    executionId: string;
    step: string;
    progress: number;
    status: 'running' | 'completed' | 'failed';
    message?: string;
    data?: any;
}

// Workflow Data Types
export interface KeywordsRequest {
    query: string;
    tags: string[];
    language: string;
    depth: number;
    explodedResults: boolean;
}

export interface ResearchRequest {
    keywords: KeywordsRequest;
    maxSources: number;
    sourceTypes: string[];
}

export interface Source {
    id: string;
    title: string;
    excerpt: string;
    domain: string;
    url: string;
    favicon: string;
    score: number;
    type: 'academic' | 'web' | 'news' | 'report';
}

export interface DraftRequest {
    sources: Source[];
    outline: OutlineItem[];
    template: string;
    tone: string;
    targetLength: number;
}

export interface OutlineItem {
    id: string;
    title: string;
    order: number;
}

export interface QualityMetrics {
    conciseness: number;
    coherence: number;
}

export interface ArticleContent {
    title: string;
    content: string;
    citations: Citation[];
    outline: OutlineItem[];
    metrics?: QualityMetrics;
}

export interface Citation {
    id: string;
    number: number;
    title: string;
    source: string;
    url: string;
}

class N8nService {
    private config: N8nConfig;
    private progressCallbacks: Map<string, (update: ProgressUpdate) => void> =
        new Map();

    constructor(config: N8nConfig) {
        this.config = config;
        this.setupProgressListener();
    }

    private async makeRequest<T>(
        endpoint: string,
        data: any,
        options: { timeout?: number } = {}
    ): Promise<WorkflowResponse<T>> {
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            options.timeout || this.config.timeout
        );

        try {
            const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && {
                        Authorization: `Bearer ${this.config.apiKey}`,
                    }),
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`N8n request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Setup WebSocket or Server-Sent Events for progress updates
    private setupProgressListener() {
        // This would typically connect to an n8n webhook or SSE endpoint
        // For now, we'll use a placeholder for the WebSocket connection
        if ('WebSocket' in window) {
            try {
                const ws = new WebSocket(
                    `${this.config.baseUrl.replace('http', 'ws')}/progress`
                );

                ws.onmessage = (event) => {
                    try {
                        const update: ProgressUpdate = JSON.parse(event.data);
                        const callback = this.progressCallbacks.get(
                            update.executionId
                        );
                        if (callback) {
                            callback(update);
                        }
                    } catch (error) {
                        console.error(
                            'Failed to parse progress update:',
                            error
                        );
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };
            } catch (error) {
                console.warn(
                    'WebSocket connection failed, falling back to polling'
                );
            }
        }
    }

    // Register a progress callback for a specific execution
    onProgress(
        executionId: string,
        callback: (update: ProgressUpdate) => void
    ) {
        this.progressCallbacks.set(executionId, callback);
    }

    // Remove progress callback
    offProgress(executionId: string) {
        this.progressCallbacks.delete(executionId);
    }

    // Step 1: Keywords Analysis
    async processKeywords(request: KeywordsRequest): Promise<
        WorkflowResponse<{
            processedKeywords: string[];
            searchStrategy: string;
            estimatedSources: number;
        }>
    > {
        return this.makeRequest('/webhook/keywords-analysis', request);
    }

    // Step 2: Research & Source Discovery
    async conductResearch(request: ResearchRequest): Promise<
        WorkflowResponse<{
            sources: Source[];
            totalFound: number;
            searchQueries: string[];
        }>
    > {
        return this.makeRequest('/webhook/research', request, {
            timeout: 60000,
        }); // 60 second timeout for research
    }

    // Step 3: Source Analysis & Scoring
    async analyzeSources(sources: Source[]): Promise<
        WorkflowResponse<{
            analyzedSources: Source[];
            recommendations: string[];
        }>
    > {
        return this.makeRequest('/webhook/source-analysis', { sources });
    }

    // Step 4: Draft Generation
    async generateDraft(
        request: DraftRequest
    ): Promise<WorkflowResponse<ArticleContent>> {
        return this.makeRequest('/webhook/generate-draft', request, {
            timeout: 120000,
        }); // 2 minute timeout
    }

    // Step 5: Quality Analysis & Scoring
    async analyzeQuality(
        articleContent: ArticleContent
    ): Promise<WorkflowResponse<QualityMetrics>> {
        return this.makeRequest('/webhook/score-article', {
            article: articleContent.content,
        });
    }

    // Step 6: Export & Formatting
    async exportArticle(
        content: ArticleContent,
        format: 'html' | 'docx' | 'pdf' | 'markdown'
    ): Promise<
        WorkflowResponse<{
            downloadUrl: string;
            previewContent: string;
        }>
    > {
        return this.makeRequest('/webhook/export', { content, format });
    }

    // Utility: Check workflow status
    async getExecutionStatus(executionId: string): Promise<
        WorkflowResponse<{
            status: 'running' | 'completed' | 'failed';
            progress: number;
            currentStep: string;
            startTime: string;
            endTime?: string;
        }>
    > {
        return this.makeRequest('/webhook/execution-status', { executionId });
    }

    // Utility: Cancel workflow execution
    async cancelExecution(
        executionId: string
    ): Promise<WorkflowResponse<{ cancelled: boolean }>> {
        return this.makeRequest('/webhook/cancel-execution', { executionId });
    }
}

// Create singleton instance
const defaultConfig: N8nConfig = {
    baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
    apiKey: import.meta.env.VITE_N8N_API_KEY,
    timeout: 120000, // 120 seconds default timeout
};

export const n8nService = new N8nService(defaultConfig);

// Export types for use in components
export type { WorkflowResponse, ProgressUpdate, N8nConfig };
