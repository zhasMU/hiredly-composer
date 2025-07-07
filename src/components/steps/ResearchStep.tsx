import { useEffect, useState } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ResearchStepProps {
  onNext: () => void;
}

interface SourceCard {
  id: string;
  title: string;
  excerpt: string;
  domain: string;
  favicon: string;
  url: string;
}

const mockSources: SourceCard[] = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence in Healthcare: A Comprehensive Review",
    excerpt: "This study examines the transformative potential of AI technologies in medical diagnosis, treatment planning, and patient care optimization...",
    domain: "nature.com",
    favicon: "🔬",
    url: "https://nature.com/articles/ai-healthcare"
  },
  {
    id: "2", 
    title: "Machine Learning Applications in Clinical Decision Support Systems",
    excerpt: "Recent advances in machine learning have enabled the development of sophisticated clinical decision support tools that assist healthcare professionals...",
    domain: "pubmed.ncbi.nlm.nih.gov",
    favicon: "📚",
    url: "https://pubmed.ncbi.nlm.nih.gov/articles/ml-clinical"
  },
  {
    id: "3",
    title: "AI-Powered Diagnostic Tools: Current State and Future Prospects",
    excerpt: "The integration of artificial intelligence in diagnostic imaging and laboratory medicine has shown remarkable promise in improving accuracy...",
    domain: "nejm.org",
    favicon: "⚕️",
    url: "https://nejm.org/ai-diagnostics"
  },
  {
    id: "4",
    title: "Ethical Considerations in AI-Driven Healthcare Systems",
    excerpt: "As artificial intelligence becomes more prevalent in healthcare, addressing ethical concerns around privacy, bias, and accountability becomes crucial...",
    domain: "bioethics.org",
    favicon: "🤔",
    url: "https://bioethics.org/ai-ethics"
  },
  {
    id: "5",
    title: "Cost-Effectiveness of AI Implementation in Healthcare Institutions",
    excerpt: "Economic analysis of AI adoption in hospitals reveals significant potential for cost savings while improving patient outcomes...",
    domain: "healtheconomics.com",
    favicon: "💰",
    url: "https://healtheconomics.com/ai-costs"
  }
];

export const ResearchStep = ({ onNext }: ResearchStepProps) => {
  const [progress, setProgress] = useState(0);
  const [displayedSources, setDisplayedSources] = useState<SourceCard[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Add sources as we progress
        const sourceIndex = Math.floor(newProgress / 20);
        if (sourceIndex < mockSources.length && sourceIndex >= displayedSources.length) {
          setDisplayedSources(prev => [...prev, mockSources[sourceIndex]]);
        }
        
        if (newProgress >= 100) {
          setIsComplete(true);
          clearInterval(timer);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [displayedSources.length]);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Deep Research in Progress</h1>
        <p className="text-muted-foreground">
          AI is analyzing sources and gathering relevant information...
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
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Sources Found ({displayedSources.length})
        </h2>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayedSources.map((source, index) => (
            <Card 
              key={source.id} 
              className="animate-fade-in border-l-4 border-l-primary"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{source.favicon}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm line-clamp-2">{source.title}</h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {source.excerpt}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {source.domain}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Button */}
      {isComplete && (
        <div className="flex justify-center pt-8 animate-fade-in">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Review Sources
          </button>
        </div>
      )}
    </div>
  );
};