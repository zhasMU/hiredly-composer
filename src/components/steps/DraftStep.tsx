import { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle,
    GripVertical,
    FileText,
    Plus,
    RotateCcw,
    Save,
    X,
    HelpCircle,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Source,
    DraftRequest,
    ArticleContent,
    OutlineItem,
    Citation,
    QualityMetrics,
    DeepResearchFact,
} from '@/lib/n8n-service';

interface DraftStepProps {
    workflowManager: any; // We'll properly type this later
}

interface MetricScore {
    id: string;
    name: string;
    score: number;
    maxScore: number;
    description: string;
    tooltip: string;
}

const mockMetrics: MetricScore[] = [
    {
        id: 'conciseness',
        name: 'Conciseness',
        score: 4,
        maxScore: 5,
        description: 'Content clarity and brevity',
        tooltip:
            'Measures how well the article conveys information without unnecessary words',
    },
    {
        id: 'coherence',
        name: 'Coherence',
        score: 4.5,
        maxScore: 5,
        description: 'Logical flow and structure',
        tooltip:
            'Evaluates the logical progression of ideas and overall article structure',
    },
    {
        id: 'readability',
        name: 'Readability',
        score: 3.5,
        maxScore: 5,
        description: 'Ease of understanding',
        tooltip:
            'Assesses vocabulary complexity and sentence structure for target audience',
    },
    {
        id: 'toneCompliance',
        name: 'Tone Compliance',
        score: 4,
        maxScore: 5,
        description: 'Professional academic tone',
        tooltip:
            'Checks adherence to academic writing standards and professional tone',
    },
];

const initialOutline: OutlineItem[] = [
    { id: '1', title: 'Introduction to AI in Healthcare', order: 1 },
    { id: '2', title: 'Current Applications and Technologies', order: 2 },
    { id: '3', title: 'Benefits and Efficiency Gains', order: 3 },
    { id: '4', title: 'Challenges and Limitations', order: 4 },
    { id: '5', title: 'Future Prospects and Developments', order: 5 },
    { id: '6', title: 'Conclusion and Recommendations', order: 6 },
];

export const DraftStep = ({ workflowManager }: DraftStepProps) => {
    const [outline, setOutline] = useState<OutlineItem[]>(initialOutline);
    const [template, setTemplate] = useState('academic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [content, setContent] = useState('Click Generate Draft to start');

    // Generate citations based on selected sources
    const citations: Citation[] =
        workflowManager.state.researchData?.map(
            (source: any, index: number) => ({
                id: source.id,
                number: index + 1,
                title: source.title,
                source: source.domain,
                url: source.url,
            })
        ) || [];

    const handleSimulateGenerateDraft = async () => {
        const selectedSources = workflowManager.state.researchData || [];

        const draftRequest: DraftRequest = {
            query: workflowManager.state.keywordsData?.query || '',
            facts: selectedSources,
        };

        // For now, simulate draft generation
        (await workflowManager.simulateDraft?.(draftRequest)) ||
            simulateDraftGeneration();
    };

    const handleGenerateDraft = async () => {
        // Check if we have any research data
        if (!workflowManager.state.researchData) {
            console.error('No research data available for draft generation');
            return;
        }

        // Check if we have keywords data for the original query
        if (!workflowManager.state.keywordsData?.query) {
            console.error('No original query available for draft generation');
            return;
        }

        const deepResearchFacts = workflowManager.state.deepResearchData || [];
        const sourceTitles = workflowManager.state.researchData.map(
            (item: Source) => item.title
        );
        const selectedFacts = deepResearchFacts.filter(
            (item: DeepResearchFact) => sourceTitles.includes(item.heading)
        );

        console.log(sourceTitles);
        console.log(deepResearchFacts);

        const draftRequest: DraftRequest = {
            query: workflowManager.state.keywordsData.query,
            facts: selectedFacts,
        };

        try {
            setIsGenerating(true);
            await workflowManager.executeDraft(draftRequest);
        } catch (error) {
            console.error('Draft generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const simulateDraftGeneration = async () => {
        // Simulate draft generation with progress
        workflowManager.updateState({ isLoading: true });

        for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            workflowManager.updateState({ progress: i });
        }

        const mockArticleContent: ArticleContent = {
            title: 'The Transformative Impact of Artificial Intelligence in Healthcare',
            content: content,
            citations: citations,
            outline: outline,
        };

        workflowManager.updateState({
            draftData: mockArticleContent,
            isLoading: false,
            progress: 100,
        });
    };

    const handleProceedToScoring = () => {
        // Save current content to workflow state
        const articleContent: ArticleContent = {
            title: 'The Transformative Impact of Artificial Intelligence in Healthcare',
            content: content,
            citations: citations,
            outline: outline,
        };

        workflowManager.updateState({ draftData: articleContent });
        workflowManager.nextStep();
    };

    // Remove the mockMetrics constant and replace it with this:
    const getQualityMetrics = (): MetricScore[] => {
        const qualityData = workflowManager.state.qualityData;

        // If no quality data available, return empty array or default values
        if (!qualityData) {
            return [];
        }

        // Transform QualityMetrics object into MetricScore array format
        return [
            {
                id: 'conciseness',
                name: 'Conciseness',
                score: qualityData.conciseness || 0,
                maxScore: 5,
                description: 'Content clarity and brevity',
                tooltip:
                    'Measures how well the article conveys information without unnecessary words',
            },
            {
                id: 'coherence',
                name: 'Coherence',
                score: qualityData.coherence || 0,
                maxScore: 5,
                description: 'Logical flow and structure',
                tooltip:
                    'Evaluates the logical progression of ideas and overall article structure',
            },
        ];
    };

    const metrics = useMemo(
        () => getQualityMetrics(),
        [workflowManager.state.qualityData]
    );

    const handleRefineDraft = async () => {
        // Check if we have draft data to analyze
        if (!workflowManager.state.draftData) {
            console.error('No draft data available to be refined!');
            return;
        }

        try {
            setIsRefining(true);
            await workflowManager.executeRefine(
                workflowManager.state.draftData,
                feedback
            );

            // Update local feedback state with the new feedback from workflow state
            // setFeedback(workflowManager.state.qualityData?.feedback || '');

            setIsRefining(false);
        } catch (error) {
            console.error('Draft refinement failed:', error);
        } finally {
            setIsRefining(false);
        }
    };

    const handleSimulateAnalyzeQuality = async () => {
        setIsAnalyzing(true);

        // Simulate quality analysis
        for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            workflowManager.updateState({ progress: i });
        }

        // Mock quality metrics
        const qualityMetrics: QualityMetrics = {
            conciseness: 3,
            coherence: 4,
            feedback: 'Looks good to me',
        };

        workflowManager.updateState({
            qualityData: qualityMetrics,
            progress: 100,
        });

        setFeedback(qualityMetrics.feedback || '');

        setIsAnalyzing(false);
    };

    const handleAnalyzeQuality = async () => {
        // Check if we have draft data to analyze
        if (!workflowManager.state.draftData) {
            console.error('No draft data available for quality analysis');
            return;
        }

        try {
            setIsAnalyzing(true);

            // Call the real quality analysis method
            await workflowManager.executeQuality(
                workflowManager.state.draftData
            );

            // The workflowManager.executeQuality will:
            // 1. Set loading states automatically
            // 2. Make the API call to n8n service
            // 3. Update qualityData in the workflow state
            // 4. Handle progress updates via the progress listener
            // 5. Advance to next step automatically on success
        } catch (error) {
            console.error('Quality analysis failed:', error);
            // Error handling is already done in executeQuality
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Sync local feedback with workflow state
    useEffect(() => {
        if (workflowManager.state.qualityData?.feedback) {
            setFeedback(workflowManager.state.qualityData.feedback);
        }
    }, [workflowManager.state.qualityData?.feedback]);

    // Sync local content with workflow state
    useEffect(() => {
        if (workflowManager.state.draftData?.content) {
            setContent(workflowManager.state.draftData.content);
        }
    }, [workflowManager.state.draftData?.content]);

    const handleProceedToFinal = () => {
        // Update workflow state with current data
        workflowManager.updateState({
            qualityData: {
                conciseness: 85,
                coherence: 92,
                readability: 78,
                toneCompliance: 88,
                appliedSuggestions: [],
            },
        });
        workflowManager.nextStep();
    };

    const addOutlineItem = () => {
        const newItem: OutlineItem = {
            id: Date.now().toString(),
            title: 'New Section',
            order: outline.length + 1,
        };
        setOutline([...outline, newItem]);
    };

    const updateOutlineItem = (id: string, title: string) => {
        setOutline(
            outline.map((item) => (item.id === id ? { ...item, title } : item))
        );
    };

    const removeOutlineItem = (id: string) => {
        setOutline(outline.filter((item) => item.id !== id));
    };

    const handleRegenerateDraft = () => {
        handleGenerateDraft();
    };

    // Show waiting state if no sources available
    if (!workflowManager.state.researchData) {
        return (
            <div className="max-w-4xl mx-auto p-8 space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Draft Generation</h1>
                    <p className="text-muted-foreground">
                        Waiting for sources to be reviewed...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-6">
            <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                {/* Left Panel - Citations */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Citations ({citations.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 overflow-y-auto">
                            {citations.map((citation) => (
                                <div
                                    key={citation.id}
                                    className="text-xs text-muted-foreground p-2 bg-muted/50 rounded"
                                >
                                    <span className="font-medium">
                                        [{citation.number}]
                                    </span>{' '}
                                    {citation.title}
                                    <div className="text-xs opacity-75 mt-1">
                                        {citation.source}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Center Panel - Article Content */}
                <div className="lg:col-span-2 space-y-4 flex flex-col">
                    {/* Content Editor */}
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle>Article Content</CardTitle>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>
                                            {content.split(' ').length} words
                                        </span>
                                        <span>
                                            {Math.ceil(
                                                content.split(' ').length / 200
                                            )}{' '}
                                            min read
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleGenerateDraft}
                                            disabled={workflowManager.state.isLoading}
                                            size="sm"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            {workflowManager.state.isLoading
                                                ? 'Generating...'
                                                : 'Generate'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleRegenerateDraft}
                                            disabled={workflowManager.state.isLoading}
                                            size="sm"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 font-mono text-sm resize-none min-h-[600px]"
                                placeholder="Your article content will appear here..."
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel - Quality & Feedback */}
                <div className="lg:col-span-1 space-y-4 flex flex-col">
                    {/* Quality Metrics */}
                    <Card className="flex-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Quality Metrics</CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={handleAnalyzeQuality}
                                    disabled={
                                        isAnalyzing || workflowManager.state.isLoading
                                    }
                                    size="sm"
                                >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-y-auto">
                            {metrics.length === 0 ? (
                                <div className="text-center p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Run quality analysis to see metrics
                                    </p>
                                </div>
                            ) : (
                                getQualityMetrics().map((metric) => (
                                    <div key={metric.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <h3 className="text-xs font-medium">
                                                    {metric.name}
                                                </h3>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs text-xs">
                                                                {metric.tooltip}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-bold">
                                                    {metric.score}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    /{metric.maxScore}
                                                </span>
                                            </div>
                                        </div>
                                        <Progress
                                            value={(metric.score / metric.maxScore) * 100}
                                            className="h-2"
                                        />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Feedback Section */}
                    <Card className="flex-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">AI Feedback</CardTitle>
                                <Button
                                    onClick={handleRefineDraft}
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        isRefining ||
                                        workflowManager.state.isLoading ||
                                        !feedback.trim()
                                    }
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Refine
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="flex-1 text-xs resize-none min-h-[200px]"
                                placeholder="AI feedback will appear here after quality analysis..."
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center gap-4 pt-4 border-t">
                <Button
                    onClick={handleProceedToScoring}
                    size="lg"
                    className="px-8"
                    disabled={workflowManager.state.isLoading}
                >
                    {workflowManager.state.isLoading
                        ? 'Processing...'
                        : 'Finalize Article'}
                </Button>
            </div>
        </div>
    );
};
