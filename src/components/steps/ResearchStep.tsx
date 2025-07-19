import { useEffect, useState } from "react";
import { ExternalLink, Globe, Play, TestTube, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResearchRequest, DeepResearchRequest } from "@/lib/n8n-service";

interface ResearchStepProps {
  workflowManager: any; // We'll properly type this later
}

export const ResearchStep = ({ workflowManager }: ResearchStepProps) => {
  const [autoStarted, setAutoStarted] = useState(false);

  // Don't auto-start - let user choose between real and simulation
  // useEffect(() => {
  //   if (workflowManager.state.keywordsData && !autoStarted && !workflowManager.state.isLoading) {
  //     setAutoStarted(true);
  //     handleAutoStartResearch();
  //   }
  // }, [workflowManager.state.keywordsData, autoStarted, workflowManager.state.isLoading]);

  const handleAutoStartResearch = async () => {
    if (!workflowManager.state.keywordsData) return;

    const researchRequest: ResearchRequest = {
      keywords: workflowManager.state.keywordsData,
      maxSources: 10,
      sourceTypes: ['academic', 'web', 'news']
    };
    
    setAutoStarted(true);
    await workflowManager.executeResearch(researchRequest);
  };

  const handleStartDeepResearch = async () => {
    if (!workflowManager.state.keywordsData) return;

    const deepResearchRequest: DeepResearchRequest = {
      keyword: workflowManager.state.keywordsData.query,
    };
    
    setAutoStarted(true);
    await workflowManager.executeDeepResearch(deepResearchRequest);
  };

  const handleSimulateResearch = async () => {
    setAutoStarted(true);
    await workflowManager.simulateResearch();
  };

  const handleRetryResearch = async () => {
    setAutoStarted(false);
    // Reset any error state
    workflowManager.clearError();
  };

  // If we don't have keywords data yet, show waiting state
  if (!workflowManager.state.keywordsData) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Research Step</h1>
          <p className="text-muted-foreground">
            Waiting for keywords to be processed...
          </p>
        </div>
      </div>
    );
  }

  // If research is complete, show results
  if (workflowManager.state.researchData && !workflowManager.state.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Research Complete!</h1>
          <p className="text-muted-foreground">
            Found {workflowManager.state.researchData.length} sources for your research
          </p>
        </div>

        {/* Research Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sources Found ({workflowManager.state.researchData.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {workflowManager.state.researchData.map((source: any) => (
              <Card 
                key={source.id} 
                className="animate-fade-in border-l-4 border-l-primary"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{source.favicon || "doc"}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm line-clamp-2">{source.title}</h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {source.excerpt}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {source.domain}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Score: {source.score}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {source.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-8">
          <Button
            onClick={() => workflowManager.nextStep()}
            size="lg"
            className="px-8"
          >
            Review Sources
          </Button>
          <Button
            onClick={handleRetryResearch}
            size="lg"
            variant="outline"
            className="px-6"
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  // Show ready state with option to choose execution method
  if (!autoStarted && !workflowManager.state.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Ready for Research</h1>
          <p className="text-muted-foreground">
            Your keywords are ready. Choose how to proceed with research.
          </p>
        </div>

        {/* Keywords Summary */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Research Query:</h3>
          <p className="text-muted-foreground mb-4">{workflowManager.state.keywordsData.query}</p>
          
          {workflowManager.state.keywordsData.tags?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {workflowManager.state.keywordsData.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Button
              onClick={handleAutoStartResearch}
              disabled={workflowManager.state.isLoading}
              size="lg"
              className="px-8"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Research (n8n Workflow)
            </Button>
            <Button
              onClick={handleStartDeepResearch}
              disabled={workflowManager.state.isLoading}
              size="lg"
              className="px-8"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Deep Research
            </Button>
            <Button
              onClick={handleSimulateResearch}
              disabled={workflowManager.state.isLoading}
              size="lg"
              variant="outline"
              className="px-8"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Simulate Research (Test Data)
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Use "Simulate Research" if your n8n workflows aren't ready yet, or if you want to test with consistent data.
          </p>
        </div>
      </div>
    );
  }

  // Show loading/progress state
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Deep Research in Progress</h1>
        <p className="text-muted-foreground">
          {workflowManager.state.isLoading 
            ? "AI is analyzing sources and gathering relevant information..."
            : "Ready to start research"
          }
        </p>
      </div>

      {/* Progress Circle */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - (workflowManager.state.progress || 0) / 100)}`}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{workflowManager.state.progress || 0}%</span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {workflowManager.error && (
        <div className="text-center space-y-4">
          <p className="text-red-500">{workflowManager.error}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleRetryResearch} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleSimulateResearch} variant="default">
              Use Simulation Instead
            </Button>
                </div>
        </div>
      )}

      {/* Cancel option during loading */}
      {workflowManager.state.isLoading && (
        <div className="flex justify-center">
          <Button 
            onClick={() => {
              workflowManager.cancelExecution();
              setAutoStarted(false);
            }}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};