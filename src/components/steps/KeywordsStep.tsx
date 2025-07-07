import { useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface KeywordsStepProps {
  onNext: () => void;
}

const sampleQueries = [
  "Impact of artificial intelligence on healthcare",
  "Climate change effects on global agriculture",
  "Social media influence on mental health",
  "Renewable energy adoption trends",
  "Future of remote work post-pandemic"
];

export const KeywordsStep = ({ onNext }: KeywordsStepProps) => {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [language, setLanguage] = useState("english");
  const [depth, setDepth] = useState([3]);
  const [explodedResults, setExplodedResults] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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

        {/* Advanced Options */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Advanced Options
              <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Research Depth</label>
                <div className="px-3">
                  <Slider
                    value={depth}
                    onValueChange={setDepth}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Surface</span>
                    <span>Deep</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Exploded Results</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={explodedResults}
                    onCheckedChange={setExplodedResults}
                  />
                  <span className="text-sm text-muted-foreground">Include broader topics</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

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

      {/* Next Button */}
      <div className="flex justify-center pt-8">
        <Button
          onClick={onNext}
          disabled={!query.trim()}
          size="lg"
          className="px-8"
        >
          Start Research
        </Button>
      </div>
    </div>
  );
};