import { useState } from "react";
import { CheckCircle, AlertCircle, HelpCircle, X, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ScoreRefineStepProps {
  onNext: () => void;
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

const initialMetrics: MetricScore[] = [
  {
    id: "conciseness",
    name: "Conciseness",
    score: 4,
    maxScore: 5,
    description: "Text is clear and to the point",
    tooltip: "Improve by removing redundant phrases and combining similar ideas"
  },
  {
    id: "coherence", 
    name: "Coherence",
    score: 3,
    maxScore: 5,
    description: "Ideas flow logically",
    tooltip: "Add better transitions between paragraphs and ensure logical flow"
  },
  {
    id: "readability",
    name: "Readability", 
    score: 5,
    maxScore: 5,
    description: "Easy to understand",
    tooltip: "Maintain current reading level and sentence structure"
  },
  {
    id: "tone",
    name: "Tone Compliance",
    score: 2,
    maxScore: 5,
    description: "Matches academic style",
    tooltip: "Use more formal language and reduce casual expressions"
  }
];

const suggestions: Suggestion[] = [
  {
    id: "1",
    type: "improvement",
    title: "Improve paragraph transitions",
    description: "Add connecting phrases between sections 2 and 3 to improve flow",
    applied: false
  },
  {
    id: "2", 
    type: "warning",
    title: "Tone inconsistency detected",
    description: "Replace 'pretty good' with 'effective' in paragraph 4 for academic tone",
    applied: false
  },
  {
    id: "3",
    type: "improvement", 
    title: "Strengthen conclusion",
    description: "Add specific recommendations and future research directions",
    applied: false
  },
  {
    id: "4",
    type: "info",
    title: "Citation formatting",
    description: "Ensure all citations follow consistent academic format",
    applied: true
  }
];

export const ScoreRefineStep = ({ onNext }: ScoreRefineStepProps) => {
  const [metrics, setMetrics] = useState<MetricScore[]>(initialMetrics);
  const [feedbackSuggestions, setFeedbackSuggestions] = useState<Suggestion[]>(suggestions);
  const [passThreshold] = useState(3);
  const [isOverride, setIsOverride] = useState(false);

  const totalScore = metrics.reduce((sum, metric) => sum + metric.score, 0);
  const maxTotalScore = metrics.reduce((sum, metric) => sum + metric.maxScore, 0);
  const averageScore = totalScore / metrics.length;
  const hasPassedThreshold = metrics.every(metric => metric.score >= passThreshold);

  const applySuggestion = (id: string) => {
    setFeedbackSuggestions(suggestions =>
      suggestions.map(suggestion =>
        suggestion.id === id ? { ...suggestion, applied: true } : suggestion
      )
    );
    
    // Simulate score improvement
    if (id === "1") {
      setMetrics(metrics => 
        metrics.map(metric => 
          metric.id === "coherence" ? { ...metric, score: Math.min(5, metric.score + 1) } : metric
        )
      );
    } else if (id === "2") {
      setMetrics(metrics => 
        metrics.map(metric => 
          metric.id === "tone" ? { ...metric, score: Math.min(5, metric.score + 2) } : metric
        )
      );
    }
  };

  const dismissSuggestion = (id: string) => {
    setFeedbackSuggestions(suggestions =>
      suggestions.filter(suggestion => suggestion.id !== id)
    );
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreRing = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${getScoreColor(score, maxScore)}`}>
            {score}
          </span>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Score & Refine</h1>
          <p className="text-muted-foreground">
            Review article quality metrics and apply AI suggestions
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="text-center">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{metric.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-center">
                  {getScoreRing(metric.score, metric.maxScore)}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {metric.score} / {metric.maxScore}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Overall Quality Score</h3>
                <p className="text-sm text-muted-foreground">
                  Average: {averageScore.toFixed(1)} / 5.0
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={(averageScore / 5) * 100} className="w-40" />
                <div className="flex items-center gap-2">
                  {hasPassedThreshold ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">
                    {hasPassedThreshold ? "Passed" : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Feedback & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackSuggestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No suggestions available. Your article looks great!
              </p>
            ) : (
              feedbackSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border ${
                    suggestion.applied ? "bg-muted/30 opacity-75" : "bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            suggestion.type === "warning"
                              ? "destructive"
                              : suggestion.type === "improvement"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {suggestion.type}
                        </Badge>
                        {suggestion.applied && (
                          <Badge variant="outline" className="text-xs bg-green-50">
                            <Check className="h-3 w-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                    {!suggestion.applied && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => applySuggestion(suggestion.id)}
                        >
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pass/Fail Decision */}
        <Card className={`${hasPassedThreshold ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Quality Check</h3>
                  {hasPassedThreshold ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {hasPassedThreshold
                    ? "Your article meets the quality threshold and is ready to publish."
                    : `Some metrics are below the threshold (${passThreshold}/5). Consider applying the suggested improvements.`}
                </p>
                {!hasPassedThreshold && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={isOverride}
                      onCheckedChange={setIsOverride}
                    />
                    <span className="text-sm">Override quality check and continue anyway</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {!hasPassedThreshold && !isOverride && (
                  <Button variant="outline">
                    Apply Fixes
                  </Button>
                )}
                {(!hasPassedThreshold && isOverride) || hasPassedThreshold ? (
                  <Button onClick={onNext}>
                    {hasPassedThreshold ? "Publish Draft" : "Override & Continue"}
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};