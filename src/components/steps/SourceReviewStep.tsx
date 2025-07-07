import { useState } from "react";
import { Search, Filter, AlertCircle, ExternalLink, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SourceReviewStepProps {
  onNext: () => void;
}

interface Source {
  id: string;
  title: string;
  evidence: string;
  date: string;
  url: string;
  domain: string;
  isValid: boolean;
  isBroken: boolean;
  isSelected: boolean;
}

const mockSources: Source[] = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence in Healthcare: A Comprehensive Review",
    evidence: "AI technologies show 94% accuracy in diagnostic imaging compared to 84% human accuracy",
    date: "2024-01-15",
    url: "https://nature.com/articles/ai-healthcare",
    domain: "nature.com",
    isValid: true,
    isBroken: false,
    isSelected: true
  },
  {
    id: "2",
    title: "Machine Learning Applications in Clinical Decision Support Systems",
    evidence: "ML algorithms reduce diagnostic errors by 37% and improve treatment recommendations",
    date: "2023-12-03",
    url: "https://pubmed.ncbi.nlm.nih.gov/articles/ml-clinical",
    domain: "pubmed.ncbi.nlm.nih.gov",
    isValid: true,
    isBroken: false,
    isSelected: true
  },
  {
    id: "3",
    title: "AI-Powered Diagnostic Tools: Current State and Future Prospects",
    evidence: "Implementation of AI diagnostic tools resulted in 28% faster diagnosis times",
    date: "2024-02-08",
    url: "https://broken-link.com/article",
    domain: "medicaljournal.com",
    isValid: true,
    isBroken: true,
    isSelected: false
  },
  {
    id: "4",
    title: "Ethical Considerations in AI-Driven Healthcare Systems",
    evidence: "Study highlights privacy concerns with patient data in AI systems affecting 67% of hospitals",
    date: "2023-11-20",
    url: "https://bioethics.org/ai-ethics",
    domain: "bioethics.org",
    isValid: true,
    isBroken: false,
    isSelected: true
  },
  {
    id: "5",
    title: "Cost-Effectiveness of AI Implementation in Healthcare Institutions",
    evidence: "ROI analysis shows average 23% cost reduction within 18 months of AI implementation",
    date: "2024-01-30",
    url: "https://healtheconomics.com/ai-costs",
    domain: "healtheconomics.com",
    isValid: false,
    isBroken: false,
    isSelected: false
  }
];

export const SourceReviewStep = ({ onNext }: SourceReviewStepProps) => {
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "valid" | "flagged">("all");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.evidence.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "valid") return matchesSearch && source.isValid && !source.isBroken;
    if (filter === "flagged") return matchesSearch && (!source.isValid || source.isBroken);
    return matchesSearch;
  });

  const toggleSourceSelection = (id: string) => {
    setSources(sources.map(source => 
      source.id === id ? { ...source, isSelected: !source.isSelected } : source
    ));
  };

  const markInvalid = (id: string) => {
    setSources(sources.map(source => 
      source.id === id ? { ...source, isValid: false, isSelected: false } : source
    ));
  };

  const selectedCount = sources.filter(s => s.isSelected).length;
  const invalidCount = sources.filter(s => !s.isValid || s.isBroken).length;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Source Review</h1>
        <p className="text-muted-foreground">
          Review and validate the sources found during research
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({sources.length})
          </Button>
          <Button
            variant={filter === "valid" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("valid")}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Valid ({sources.filter(s => s.isValid && !s.isBroken).length})
          </Button>
          <Button
            variant={filter === "flagged" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("flagged")}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Flagged ({invalidCount})
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Sources Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Select</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Evidence</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSources.map((source) => (
                  <tr key={source.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <Checkbox
                        checked={source.isSelected}
                        onCheckedChange={() => toggleSourceSelection(source.id)}
                        disabled={!source.isValid || source.isBroken}
                      />
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button 
                              className="text-sm font-medium text-left hover:text-primary transition-colors line-clamp-2"
                              onClick={() => setSelectedSource(source)}
                            >
                              {source.title}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-left">{source.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Evidence</h4>
                                <p className="text-sm text-muted-foreground">{source.evidence}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Source Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p><strong>Domain:</strong> {source.domain}</p>
                                  <p><strong>Date:</strong> {source.date}</p>
                                  <p><strong>URL:</strong> {source.url}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {source.domain}
                          </Badge>
                          {source.isBroken && (
                            <Badge variant="destructive" className="text-xs">
                              Broken Link
                            </Badge>
                          )}
                          {!source.isValid && (
                            <Badge variant="secondary" className="text-xs">
                              Invalid
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                        {source.evidence}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{source.date}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {source.isValid && !source.isBroken && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markInvalid(source.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Decision Banner */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Ready to proceed?</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCount} sources selected • {invalidCount} sources flagged
              </p>
              {invalidCount > 0 && (
                <p className="text-sm text-orange-600">
                  You have flagged sources. Would you like to research additional sources?
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {invalidCount > 0 && (
                <Button variant="outline">
                  Re-search
                </Button>
              )}
              <Button onClick={onNext} disabled={selectedCount === 0}>
                Generate Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};