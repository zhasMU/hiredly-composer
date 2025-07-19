import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
    currentStep: number;
    className?: string;
}

const steps = ['Keywords', 'Research', 'Source Review', 'Draft', 'Final'];

export const ProgressIndicator = ({
    currentStep,
    className,
}: ProgressIndicatorProps) => {
    return (
        <div
            className={cn(
                'flex items-center justify-center space-x-4',
                className
            )}
        >
            {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                    <div className="flex items-center space-x-2">
                        <div
                            className={cn(
                                'w-8 h-8 min-w-[2rem] min-h-[2rem] rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                                index < currentStep
                                    ? 'bg-primary text-primary-foreground'
                                    : index === currentStep
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            {index + 1}
                        </div>
                        <span
                            className={cn(
                                'text-sm font-medium transition-colors hidden sm:block',
                                index <= currentStep
                                    ? 'text-foreground'
                                    : 'text-muted-foreground'
                            )}
                        >
                            {step}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                'w-12 h-0.5 mx-2 transition-colors',
                                index < currentStep ? 'bg-primary' : 'bg-muted'
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
