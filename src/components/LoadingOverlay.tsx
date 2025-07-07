import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
}

export const LoadingOverlay = ({ isVisible, message = "Loading...", progress }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">{message}</h3>
          
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full bg-primary transition-all duration-500 ease-out",
                "animate-pulse"
              )}
              style={{
                width: progress !== undefined ? `${progress}%` : '0%',
                background: progress !== undefined 
                  ? 'hsl(var(--primary))' 
                  : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.5), hsl(var(--primary)))',
                backgroundSize: progress === undefined ? '200% 100%' : 'auto',
                animation: progress === undefined ? 'loading-gradient 2s ease-in-out infinite' : 'none'
              }}
            />
          </div>
          
          {progress !== undefined && (
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          )}
        </div>
      </div>
      
    </div>
  );
};