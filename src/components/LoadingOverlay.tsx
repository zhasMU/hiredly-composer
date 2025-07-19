import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isVisible, message = "Loading" }: LoadingOverlayProps) => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => prev >= 3 ? 1 : prev + 1);
    }, 500); // Change dots every 500ms

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">
            {message}{'.'.repeat(dots)}
          </h3>
        </div>
      </div>
    </div>
  );
};