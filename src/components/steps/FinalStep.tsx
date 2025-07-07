import { useState } from "react";
import { Download, Copy, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FinalStepProps {
  onRestart: () => void;
}

export const FinalStep = ({ onRestart }: FinalStepProps) => {
  const [humanChecks, setHumanChecks] = useState({
    coherent: false,
    citations: false,
    noFiller: false
  });

  const article = `# The Transformative Impact of Artificial Intelligence in Healthcare

## Introduction

Artificial intelligence (AI) represents one of the most significant technological advances in modern healthcare, offering unprecedented opportunities to enhance patient care, streamline operations, and improve clinical outcomes [1]. The integration of AI technologies into healthcare systems has accelerated rapidly, driven by advances in machine learning, increased computational power, and the growing availability of healthcare data.

## Current Applications and Technologies

Today's healthcare AI applications span multiple domains, from diagnostic imaging to clinical decision support systems. Machine learning algorithms have demonstrated remarkable accuracy in medical imaging, achieving diagnostic performance that often matches or exceeds that of experienced clinicians [2]. These systems are particularly effective in radiology, pathology, and ophthalmology, where pattern recognition is crucial.

## Benefits and Efficiency Gains

The implementation of AI diagnostic tools has resulted in significant improvements in healthcare delivery. Studies show that AI-powered systems can reduce diagnostic errors by 37% while improving treatment recommendations [2]. Additionally, these technologies have demonstrated the ability to decrease diagnosis times by 28%, allowing for faster patient care and improved outcomes [3].

## Challenges and Limitations

Despite its promise, AI implementation in healthcare faces several challenges. Ethical considerations around privacy, bias, and accountability remain paramount concerns, particularly as studies indicate that privacy issues with patient data affect 67% of hospitals implementing AI systems [4]. Healthcare institutions must carefully balance innovation with patient protection and regulatory compliance.

## Future Prospects and Developments

Economic analysis reveals significant potential for cost savings through AI adoption. Research indicates that healthcare institutions can expect an average 23% cost reduction within 18 months of AI implementation, demonstrating both clinical and financial benefits [5]. As technology continues to advance, we can expect even greater integration of AI across all aspects of healthcare delivery.

## Conclusion and Recommendations

The evidence clearly demonstrates that artificial intelligence is transforming healthcare delivery through improved diagnostic accuracy, enhanced efficiency, and cost reduction. While challenges remain, particularly around ethics and implementation, the benefits far outweigh the risks when proper safeguards are in place.

## References

[1] The Future of Artificial Intelligence in Healthcare: A Comprehensive Review. Nature Medicine, 2024.
[2] Machine Learning Applications in Clinical Decision Support Systems. PubMed, 2023.
[3] AI-Powered Diagnostic Tools: Current State and Future Prospects. New England Journal of Medicine, 2024.
[4] Ethical Considerations in AI-Driven Healthcare Systems. Journal of Bioethics, 2023.
[5] Cost-Effectiveness of AI Implementation in Healthcare Institutions. Health Economics Review, 2024.`;

  const allChecked = Object.values(humanChecks).every(Boolean);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Article Complete!</h1>
        </div>
        <p className="text-muted-foreground">
          Your research article has been generated and is ready for export
        </p>
      </div>

      {/* Article Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Final Article</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto bg-muted/30 p-6 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
              {article}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Copy className="h-6 w-6" />
              <span>Copy HTML</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Download .docx</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Download .md</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Human Check */}
      <Card>
        <CardHeader>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0">
                <CardTitle>Human Quality Check</CardTitle>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={humanChecks.coherent}
                    onCheckedChange={(checked) => 
                      setHumanChecks(prev => ({ ...prev, coherent: !!checked }))
                    }
                  />
                  <span className="text-sm">Flow is coherent and logical</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={humanChecks.citations}
                    onCheckedChange={(checked) => 
                      setHumanChecks(prev => ({ ...prev, citations: !!checked }))
                    }
                  />
                  <span className="text-sm">All citations are valid and properly formatted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={humanChecks.noFiller}
                    onCheckedChange={(checked) => 
                      setHumanChecks(prev => ({ ...prev, noFiller: !!checked }))
                    }
                  />
                  <span className="text-sm">No AI filler language detected</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      {/* Success Banner */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6 text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-green-800">Success!</h3>
            <p className="text-green-700">Article saved to project library</p>
          </div>
          <Button onClick={onRestart} variant="outline">
            Create New Article
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};