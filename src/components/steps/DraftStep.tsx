import { useState } from "react";
import { GripVertical, FileText, Plus, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DraftStepProps {
  onNext: () => void;
}

interface OutlineItem {
  id: string;
  title: string;
  order: number;
}

interface Citation {
  id: string;
  number: number;
  title: string;
  source: string;
}

const initialOutline: OutlineItem[] = [
  { id: "1", title: "Introduction to AI in Healthcare", order: 1 },
  { id: "2", title: "Current Applications and Technologies", order: 2 },
  { id: "3", title: "Benefits and Efficiency Gains", order: 3 },
  { id: "4", title: "Challenges and Limitations", order: 4 },
  { id: "5", title: "Future Prospects and Developments", order: 5 },
  { id: "6", title: "Conclusion and Recommendations", order: 6 }
];

const citations: Citation[] = [
  { id: "1", number: 1, title: "The Future of Artificial Intelligence in Healthcare", source: "nature.com" },
  { id: "2", number: 2, title: "Machine Learning Applications in Clinical Decision Support", source: "pubmed.ncbi.nlm.nih.gov" },
  { id: "3", number: 3, title: "Ethical Considerations in AI-Driven Healthcare Systems", source: "bioethics.org" },
  { id: "4", number: 4, title: "Cost-Effectiveness of AI Implementation", source: "healtheconomics.com" }
];

export const DraftStep = ({ onNext }: DraftStepProps) => {
  const [outline, setOutline] = useState<OutlineItem[]>(initialOutline);
  const [template, setTemplate] = useState("academic");
  const [content, setContent] = useState(`# The Transformative Impact of Artificial Intelligence in Healthcare

## Introduction to AI in Healthcare

Artificial intelligence (AI) represents one of the most significant technological advances in modern healthcare, offering unprecedented opportunities to enhance patient care, streamline operations, and improve clinical outcomes [1]. The integration of AI technologies into healthcare systems has accelerated rapidly, driven by advances in machine learning, increased computational power, and the growing availability of healthcare data.

## Current Applications and Technologies

Today's healthcare AI applications span multiple domains, from diagnostic imaging to clinical decision support systems. Machine learning algorithms have demonstrated remarkable accuracy in medical imaging, achieving diagnostic performance that often matches or exceeds that of experienced clinicians [2]. These systems are particularly effective in radiology, pathology, and ophthalmology, where pattern recognition is crucial.

Clinical decision support systems powered by AI are transforming how healthcare providers approach patient care...

[Continue writing your article here]`);
  const [wordCount, setWordCount] = useState(content.split(' ').length);
  const [sentenceCount, setSentenceCount] = useState(content.split(/[.!?]+/).length - 1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const handleContentChange = (value: string) => {
    setContent(value);
    setWordCount(value.split(' ').filter(word => word.length > 0).length);
    setSentenceCount(value.split(/[.!?]+/).filter(s => s.trim().length > 0).length);
    
    // Auto-save simulation
    setTimeout(() => {
      setLastSaved(new Date());
    }, 1000);
  };

  const insertCitation = (citation: Citation) => {
    const citationText = `[${citation.number}]`;
    setContent(prev => prev + citationText);
  };

  const addOutlineItem = () => {
    const newItem: OutlineItem = {
      id: Date.now().toString(),
      title: "New Section",
      order: outline.length + 1
    };
    setOutline([...outline, newItem]);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Article Composer</h1>
        <p className="text-muted-foreground">
          Create your research article with AI-powered assistance
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Outline */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Template</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic Paper</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="report">Research Report</SelectItem>
                  <SelectItem value="review">Literature Review</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Outline</CardTitle>
                <Button size="sm" variant="ghost" onClick={addOutlineItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {outline.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors cursor-move"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">{item.title}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Editor */}
        <div className="col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Words: {wordCount}</span>
              <span>Sentences: {sentenceCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Save className="h-4 w-4" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <Card className="flex-1">
            <CardContent className="p-0">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[500px] border-0 resize-none text-base leading-relaxed"
                placeholder="Start writing your article..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Evidence Sidebar */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Citations & Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {citations.map((citation) => (
                  <Card key={citation.id} className="border border-muted">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <Badge variant="outline" className="text-xs">
                            [{citation.number}]
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => insertCitation(citation)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <h4 className="text-sm font-medium line-clamp-2">
                          {citation.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {citation.source}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Separator />
              
              <div className="text-center">
                <Button variant="outline" size="sm" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refresh Evidence
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center pt-8">
        <Button onClick={onNext} size="lg" className="px-8">
          Score & Refine
        </Button>
      </div>
    </div>
  );
};