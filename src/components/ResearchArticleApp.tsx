import { useState } from "react";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { AppSidebar } from "@/components/AppSidebar";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { KeywordsStep } from "@/components/steps/KeywordsStep";
import { ResearchStep } from "@/components/steps/ResearchStep";
import { SourceReviewStep } from "@/components/steps/SourceReviewStep";
import { DraftStep } from "@/components/steps/DraftStep";
import { ScoreRefineStep } from "@/components/steps/ScoreRefineStep";
import { FinalStep } from "@/components/steps/FinalStep";
import { Button } from "@/components/ui/button";

const ResearchArticleApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    "Keywords",
    "Research",
    "Source Review", 
    "Draft",
    "Score & Refine",
    "Final"
  ];

  const handleNextStep = () => {
    if (currentStep === 0) {
      // Show loading when transitioning to research
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentStep(prev => prev + 1);
      }, 2000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <KeywordsStep onNext={handleNextStep} />;
      case 1:
        return <ResearchStep onNext={handleNextStep} />;
      case 2:
        return <SourceReviewStep onNext={handleNextStep} />;
      case 3:
        return <DraftStep onNext={handleNextStep} />;
      case 4:
        return <ScoreRefineStep onNext={handleNextStep} />;
      case 5:
        return <FinalStep onRestart={handleRestart} />;
      default:
        return <KeywordsStep onNext={handleNextStep} />;
    }
  };

  const getCtaLabel = () => {
    switch (currentStep) {
      case 0: return "Start Research";
      case 1: return "Review Sources";
      case 2: return "Generate Draft";
      case 3: return "Score & Refine";
      case 4: return "Publish Draft";
      case 5: return "Create New Article";
      default: return "Next";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Initiating deep research..."
        progress={undefined}
      />
      
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">Hiredly Composer</h1>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex-1 max-w-2xl mx-8">
            <ProgressIndicator currentStep={currentStep} />
          </div>
          
          <div className="w-32" /> {/* Spacer for balance */}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AppSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {renderCurrentStep()}
        </main>
      </div>

      {/* Floating CTA (bottom-right) */}
      {/* Removed floating button as per instructions */}
    </div>
  );
};

export default ResearchArticleApp;