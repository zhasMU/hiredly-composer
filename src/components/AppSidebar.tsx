import { useState } from "react";
import { ChevronLeft, Settings, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar = ({ isCollapsed, onToggle }: AppSidebarProps) => {
  return (
    <div 
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with chat list */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex flex-col w-full">
            <span className="font-semibold text-xs text-muted-foreground mb-2">Projects</span>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {/* Placeholder for multiple research articles */}
              <button className="w-full text-left px-3 py-2 rounded bg-muted hover:bg-accent focus:bg-accent text-foreground text-sm font-medium transition-colors">Research Article 1</button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-accent focus:bg-accent text-foreground text-sm font-medium transition-colors">Research Article 2</button>
              <button className="w-full text-left px-3 py-2 rounded hover:bg-accent focus:bg-accent text-foreground text-sm font-medium transition-colors">Research Article 3</button>
              {/* Add more as needed */}
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && "px-2"
          )}
        >
          <FileText className="h-4 w-4" />
          {!isCollapsed && "Current Project"}
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && "px-2"
          )}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && "Settings"}
        </Button>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && "px-2"
          )}
        >
          <HelpCircle className="h-4 w-4" />
          {!isCollapsed && "Help"}
        </Button>
      </div>
    </div>
  );
};