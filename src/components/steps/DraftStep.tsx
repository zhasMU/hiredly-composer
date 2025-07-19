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
    DraftRequest,
    ArticleContent,
    OutlineItem,
    Citation,
    QualityMetrics,
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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [content, setContent] =
        useState(`# The Transformative Impact of Artificial Intelligence in Healthcare

## Introduction to AI in Healthcare

Artificial intelligence (AI) represents one of the most significant technological advances in modern healthcare, offering unprecedented opportunities to enhance patient care, streamline operations, and improve clinical outcomes [1]. The integration of AI technologies into healthcare systems has accelerated rapidly, driven by advances in machine learning, increased computational power, and the growing availability of healthcare data.

## Current Applications and Technologies

Today's healthcare AI applications span multiple domains, from diagnostic imaging to clinical decision support systems. Machine learning algorithms have demonstrated remarkable accuracy in medical imaging, achieving diagnostic performance that often matches or exceeds that of experienced clinicians [2]. These systems are particularly effective in radiology, pathology, and ophthalmology, where pattern recognition is crucial.

## Benefits and Efficiency Gains

The implementation of AI in healthcare has led to significant improvements in diagnostic accuracy, treatment efficiency, and patient outcomes. Clinical decision support systems powered by AI can analyze vast amounts of patient data to suggest optimal treatment plans, reducing medical errors and improving care quality [3]. Additionally, AI-driven automation has streamlined administrative tasks, allowing healthcare professionals to focus more on patient care.

## Challenges and Limitations  

Despite its promising applications, AI in healthcare faces several challenges. Data privacy and security concerns remain paramount, as healthcare AI systems require access to sensitive patient information. Furthermore, the "black box" nature of many AI algorithms raises questions about transparency and accountability in clinical decision-making [4]. Healthcare providers must also navigate regulatory frameworks and ensure AI systems are validated for clinical use.

## Future Prospects and Developments

The future of AI in healthcare holds immense potential, with emerging technologies like personalized medicine, predictive analytics, and robotic surgery on the horizon. As AI systems become more sophisticated and interpretable, we can expect broader adoption across healthcare settings. Integration with wearable devices and real-time monitoring systems will enable proactive healthcare management and early intervention strategies.

## Conclusion and Recommendations

Artificial intelligence represents a transformative force in healthcare, offering unprecedented opportunities to improve patient outcomes and operational efficiency. However, successful implementation requires careful consideration of ethical, regulatory, and technical challenges. Healthcare organizations should invest in robust data infrastructure, staff training, and collaborative partnerships to fully realize AI's potential while maintaining patient safety and trust.

## References

[1] Nature Medicine - The Future of Artificial Intelligence in Healthcare
[2] PubMed - Machine Learning Applications in Clinical Decision Support  
[3] Bioethics.org - Ethical Considerations in AI-Driven Healthcare Systems
[4] Health Economics - Cost-Effectiveness of AI Implementation`);

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

    const handleGenerateDraft = async () => {
        const selectedSources = workflowManager.state.researchData || [];

        const draftRequest: DraftRequest = {
            sources: selectedSources,
            outline: outline,
            template: template,
            tone: 'professional',
            targetLength: 2000,
        };

        // For now, simulate draft generation
        (await workflowManager.simulateDraft?.(draftRequest)) ||
            simulateDraftGeneration();
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
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Generate Draft</h1>
                <p className="text-muted-foreground">
                    Create your research article using the selected sources
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Panel - Outline & Settings */}
                <div className="space-y-6">
                    {/* Template Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Article Template
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={template}
                                onValueChange={setTemplate}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="academic">
                                        Academic Paper
                                    </SelectItem>
                                    <SelectItem value="blog">
                                        Blog Post
                                    </SelectItem>
                                    <SelectItem value="report">
                                        Research Report
                                    </SelectItem>
                                    <SelectItem value="summary">
                                        Executive Summary
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Outline Editor */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">
                                    Article Outline
                                </CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={addOutlineItem}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {outline.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 group"
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) =>
                                            updateOutlineItem(
                                                item.id,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            removeOutlineItem(item.id)
                                        }
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Citations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Citations ({citations.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {citations.map((citation) => (
                                <div
                                    key={citation.id}
                                    className="text-xs text-muted-foreground"
                                >
                                    <span className="font-medium">
                                        [{citation.number}]
                                    </span>{' '}
                                    {citation.title}
                                    <div className="text-xs opacity-75">
                                        {citation.source}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Draft Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleGenerateDraft}
                            disabled={workflowManager.state.isLoading}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            {workflowManager.state.isLoading
                                ? 'Generating...'
                                : 'Generate Draft'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleRegenerateDraft}
                            disabled={workflowManager.state.isLoading}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Regenerate
                        </Button>
                    </div>

                    {/* Content Editor */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle>Article Content</CardTitle>
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
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="min-h-[1000px] font-mono text-sm resize-none"
                                placeholder="Your article content will appear here..."
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-center gap-4 pt-8">
                        <Button
                            variant="outline"
                            onClick={handleSimulateAnalyzeQuality}
                            disabled={
                                isAnalyzing || workflowManager.state.isLoading
                            }
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isAnalyzing
                                ? 'Analyzing...'
                                : 'SimulateAnalyze Quality'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleAnalyzeQuality}
                            disabled={
                                isAnalyzing || workflowManager.state.isLoading
                            }
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Quality'}
                        </Button>
                    </div>

                    {/* Quality Metrics */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Quality Metrics
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {metrics.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <p className="text-muted-foreground">
                                            No quality analysis available. Click
                                            "Analyze Quality" to get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                getQualityMetrics().map((metric) => (
                                    <Card key={metric.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">
                                                        {metric.name}
                                                    </h3>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="max-w-xs">
                                                                    {
                                                                        metric.tooltip
                                                                    }
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">
                                                        {metric.score}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        /{metric.maxScore}
                                                    </span>
                                                </div>
                                            </div>
                                            <Progress
                                                value={metric.score}
                                                className="mb-2"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                {metric.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Feedback</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>
                                                {feedback.split(' ').length}{' '}
                                                words
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={feedback}
                                        onChange={(e) =>
                                            setFeedback(e.target.value)
                                        }
                                        className="min-h-[300px] font-mono text-sm resize-none"
                                        placeholder="Enter your feedback here..."
                                    />
                                </CardContent>
                            </Card>
                            <Button
                                onClick={handleRefineDraft}
                                size="lg"
                                className="px-8"
                                disabled={
                                    isRefining ||
                                    workflowManager.state.isLoading
                                }
                            >
                                <Sparkles className="h-4 w-4 mr-2" />
                                {isAnalyzing ? 'Refining...' : 'AI Refine'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center gap-4 pt-8">
                <Button
                    variant="outline"
                    onClick={handleGenerateDraft}
                    disabled={workflowManager.state.isLoading}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                </Button>
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
