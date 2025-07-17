import { useState } from "react";
import { CheckCircle, AlertCircle, HelpCircle, X, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QualityMetrics } from "@/lib/n8n-service";

interface ScoreRefineStepProps {
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

interface Suggestion {
  id: string;
  type: "improvement" | "warning" | "info";
  title: string;
  description: string;
  applied: boolean;
}

const mockMetrics: MetricScore[] = [
  {
    id: "conciseness",
    name: "Conciseness",
    score: 85,
    maxScore: 100,
    description: "Content clarity and brevity",
    tooltip: "Measures how well the article conveys information without unnecessary words"
  },
  {
    id: "coherence", 
    name: "Coherence",
    score: 92,
    maxScore: 100,
    description: "Logical flow and structure",
    tooltip: "Evaluates the logical progression of ideas and overall article structure"
  },
  {
    id: "readability",
    name: "Readability", 
    score: 78,
    maxScore: 100,
    description: "Ease of understanding",
    tooltip: "Assesses vocabulary complexity and sentence structure for target audience"
  },
  {
    id: "toneCompliance",
    name: "Tone Compliance",
    score: 88,
    maxScore: 100,
    description: "Professional academic tone",
    tooltip: "Checks adherence to academic writing standards and professional tone"
  }
];

const mockSuggestions: Suggestion[] = [
  {
    id: "1",
    type: "improvement",
    title: "Improve paragraph transitions",
    description: "Add transitional phrases between paragraphs 3 and 4 to enhance flow",
    applied: false
  },
  {
    id: "2", 
    type: "warning",
    title: "Citation formatting",
    description: "Ensure all citations follow consistent academic format (APA/MLA)",
    applied: false
  },
  {
    id: "3",
    type: "info",
    title: "Consider adding subheadings",
    description: "Break down longer sections with descriptive subheadings for better readability",
    applied: true
  },
  {
    id: "4",
    type: "improvement",
    title: "Strengthen conclusion",
    description: "Add specific recommendations or future research directions in the conclusion",
    applied: false
  }
];

export const ScoreRefineStep = ({ workflowManager }: ScoreRefineStepProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleApplySuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, applied: !s.applied } : s
    ));
  };

  const handleAnalyzeQuality = async () => {
    setIsAnalyzing(true);
    
    // Simulate quality analysis
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      workflowManager.updateState({ progress: i });
    }
    
    // Mock quality metrics
    const qualityMetrics: QualityMetrics = {
      conciseness: 85,
      coherence: 92,
      readability: 78,
      toneCompliance: 88
    };
    
    workflowManager.updateState({ 
      qualityData: qualityMetrics,
      progress: 100
    });
    
    setIsAnalyzing(false);
  };

  const handleProceedToFinal = () => {
    // Update workflow state with current data
    const appliedSuggestions = suggestions.filter(s => s.applied);
    workflowManager.updateState({ 
      qualityData: {
        conciseness: 85,
        coherence: 92,
        readability: 78,
        toneCompliance: 88,
        appliedSuggestions
      }
    });
    workflowManager.nextStep();
  };

  // Show waiting state if no draft data available
  if (!workflowManager.state.draftData) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Score & Refine</h1>
          <p className="text-muted-foreground">
            Waiting for draft to be generated...
          </p>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(mockMetrics.reduce((acc, metric) => acc + metric.score, 0) / mockMetrics.length);
  const improvementCount = suggestions.filter(s => !s.applied && s.type === 'improvement').length;
  const warningCount = suggestions.filter(s => !s.applied && s.type === 'warning').length;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Quality Analysis & Refinement</h1>
        <p className="text-muted-foreground">
          Review your article's quality metrics and apply suggested improvements
        </p>
      </div>

      {/* Overall Score */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Overall Score</h2>
              <p className="text-muted-foreground">Based on multiple quality metrics</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{overallScore}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
          <Progress value={overallScore} className="mt-4" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quality Metrics */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Quality Metrics</h2>
            <Button 
              onClick={handleAnalyzeQuality} 
              variant="outline" 
              size="sm"
              disabled={isAnalyzing || workflowManager.state.isLoading}
            >
              {isAnalyzing ? "Analyzing..." : "Re-analyze"}
            </Button>
          </div>

          <div className="space-y-4">
            {mockMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{metric.name}</h3>
                      <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{metric.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                      </TooltipProvider>
                </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{metric.score}</span>
                      <span className="text-muted-foreground">/{metric.maxScore}</span>
                </div>
                  </div>
                  <Progress value={metric.score} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Improvement Suggestions</h2>
            <div className="flex gap-2">
              {improvementCount > 0 && (
                <Badge variant="secondary">{improvementCount} improvements</Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="destructive">{warningCount} warnings</Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className={`transition-all ${suggestion.applied ? 'bg-muted/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {suggestion.type === 'improvement' && (
                        <Lightbulb className="h-5 w-5 text-blue-500" />
                      )}
                      {suggestion.type === 'warning' && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {suggestion.type === 'info' && (
                        <HelpCircle className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${suggestion.applied ? 'line-through text-muted-foreground' : ''}`}>
                        {suggestion.title}
                      </h3>
                      <p className={`text-sm mt-1 ${suggestion.applied ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {suggestion.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Switch
                        checked={suggestion.applied}
                        onCheckedChange={() => handleApplySuggestion(suggestion.id)}
                      />
                      </div>
                  </div>
          </CardContent>
        </Card>
            ))}
                </div>
                  </div>
              </div>

      {/* Footer Actions */}
      <div className="flex justify-center gap-4 pt-8">
        <Button variant="outline" onClick={handleAnalyzeQuality} disabled={isAnalyzing || workflowManager.state.isLoading}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Analyzing..." : "Re-analyze Quality"}
                  </Button>
        <Button onClick={handleProceedToFinal} size="lg" className="px-8" disabled={workflowManager.state.isLoading}>
          {workflowManager.state.isLoading ? "Processing..." : "Finalize Article"}
                  </Button>
      </div>
    </div>
  );
};