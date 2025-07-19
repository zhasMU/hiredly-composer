import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { KeywordsRequest } from "@/lib/n8n-service";

interface KeywordsStepProps {
  workflowManager: any; // We'll properly type this later
}

const sampleQueries = [
  "Impact of artificial intelligence on healthcare",
  "Climate change effects on global agriculture",
  "Social media influence on mental health",
  "Renewable energy adoption trends",
  "Future of remote work post-pandemic"
];

export const KeywordsStep = ({ workflowManager }: KeywordsStepProps) => {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Auto-generate tags based on keywords
    if (value.length > 10) {
      const words = value.toLowerCase().split(' ').filter(word => 
        word.length > 3 && !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)
      );
      setTags(words.slice(0, 5));
    } else {
      setTags([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    handleQueryChange(sample);
  };

  const handleContinue = () => {
    const keywordsRequest: KeywordsRequest = {
      query,
      tags,
      language: "english",
      depth: 3,
      explodedResults: false
    };
    
    // Store keywords data and move to next step without loading
    workflowManager.updateState({
      keywordsData: keywordsRequest
    });
    workflowManager.nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Research Keywords</h1>
        <p className="text-muted-foreground">Enter your research question or keywords to begin</p>
      </div>

      <div className="space-y-6">
        {/* Main Input */}
        <div className="space-y-4">
          <Textarea
            placeholder="Enter a search question or keywords..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="min-h-[120px] text-base resize-none"
          />
          
          {/* Auto-generated tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Generated tags:</span>
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Sample Queries */}
        {!query && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Sample queries to get you started:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleQueries.map((sample) => (
                <Button
                  key={sample}
                  variant="outline"
                  className="justify-start text-left h-auto p-3"
                  onClick={() => handleSampleClick(sample)}
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-8">
        <Button
          onClick={handleContinue}
          disabled={!query.trim()}
          size="lg"
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};