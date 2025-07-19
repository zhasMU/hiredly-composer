import { useState } from 'react';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { AppSidebar } from '@/components/AppSidebar';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { KeywordsStep } from '@/components/steps/KeywordsStep';
import { ResearchStep } from '@/components/steps/ResearchStep';
import { SourceReviewStep } from '@/components/steps/SourceReviewStep';
import { DraftStep } from '@/components/steps/DraftStep';
import { ScoreRefineStep } from '@/components/steps/ScoreRefineStep';
import { FinalStep } from '@/components/steps/FinalStep';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { useWorkflowManager } from '@/hooks/use-workflow';

const ResearchArticleApp = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const workflowManager = useWorkflowManager();

    const steps = ['Keywords', 'Research', 'Source Review', 'Draft', 'Final'];

    const { state, error, clearError } = workflowManager;
    const { currentStep, isLoading, progress } = state;

    const getLoadingMessage = () => {
        switch (currentStep) {
            case 0:
                return 'Processing keywords and planning research...';
            case 1:
                return 'Conducting deep research and gathering sources...';
            case 2:
                return 'Analyzing sources and extracting insights...';
            case 3:
                return 'Generating article draft with AI assistance...';
            case 4:
                return 'Analyzing quality and generating improvements...';
            default:
                return 'Processing...';
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <KeywordsStep workflowManager={workflowManager} />;
            case 1:
                return <ResearchStep workflowManager={workflowManager} />;
            case 2:
                return <SourceReviewStep workflowManager={workflowManager} />;
            case 3:
                return <DraftStep workflowManager={workflowManager} />;
            case 4:
                return <FinalStep workflowManager={workflowManager} />;
            default:
                return <KeywordsStep workflowManager={workflowManager} />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <LoadingOverlay
                isVisible={isLoading}
                message={getLoadingMessage()}
                progress={progress}
            />

            {/* Error Alert */}
            {error && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={clearError}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-card border-b border-border">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-primary">
                            Hiredly Composer
                        </h1>
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
