import { useState } from "react";
import { Download, Copy, FileText, CheckCircle, RotateCcw, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import showdown from 'showdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { convertMarkdownToDocx, downloadDocx } from '@mohtasham/md-to-docx';

interface FinalStepProps {
  workflowManager: any; // We'll properly type this later
}

export const FinalStep = ({ workflowManager }: FinalStepProps) => {
  const [humanChecks, setHumanChecks] = useState({
    coherent: false,
    citations: false,
    noFiller: false
  });
  const [exportFormat, setExportFormat] = useState("markdown");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Use article content from workflow state or fallback to mock data
  const article = workflowManager.state.draftData?.content || `# The Transformative Impact of Artificial Intelligence in Healthcare

## Introduction

Artificial intelligence (AI) represents one of the most significant technological advances in modern healthcare, offering unprecedented opportunities to enhance patient care, streamline operations, and improve clinical outcomes [1]. The integration of AI technologies into healthcare systems has accelerated rapidly, driven by advances in machine learning, increased computational power, and the growing availability of healthcare data.

## Current Applications and Technologies

Today's healthcare AI applications span multiple domains, from diagnostic imaging to clinical decision support systems. Machine learning algorithms have demonstrated remarkable accuracy in medical imaging, achieving diagnostic performance that often matches or exceeds that of experienced clinicians [2]. These systems are particularly effective in radiology, pathology, and ophthalmology, where pattern recognition is crucial.

## Benefits and Efficiency Gains

The implementation of AI in healthcare has led to significant improvements in diagnostic accuracy, treatment efficiency, and patient outcomes. Clinical decision support systems powered by AI can analyze vast amounts of patient data to suggest optimal treatment plans, reducing medical errors and improving care quality [3]. Additionally, AI-driven automation has streamlined administrative tasks, allowing healthcare professionals to focus more on patient care.

## Challenges and Limitations

Despite its promising applications, AI in healthcare faces several challenges. Data privacy and security concerns remain paramount, as healthcare AI systems require access to sensitive patient information. Furthermore, the "black box" nature of many AI algorithms raises questions about transparency and accountability in clinical decision-making [4]. Healthcare providers must also navigate regulatory frameworks and ensure AI systems are validated for clinical use.

## Future Prospects and Developments

The future of AI in healthcare holds immense potential, with emerging technologies like personalized medicine, predictive analytics, and robotic surgery on the horizon. As AI systems become more sophisticated and interpretable, we can expect broader adoption across healthcare settings. Integration with wearable devices and real-time monitoring systems will enable proactive healthcare management and early intervention strategies.

## Conclusion and Recommendations

Artificial intelligence represents a transformative force in healthcare, offering unprecedented opportunities to improve patient outcomes and operational efficiency. However, successful implementation requires careful consideration of ethical, regulatory, and technical challenges. Healthcare organizations should invest in robust data infrastructure, staff training, and collaborative partnerships to fully realize AI's potential while maintaining patient safety and trust.

## References

[1] Nature Medicine - The Future of Artificial Intelligence in Healthcare
[2] PubMed - Machine Learning Applications in Clinical Decision Support
[3] Bioethics.org - Ethical Considerations in AI-Driven Healthcare Systems
[4] Health Economics - Cost-Effectiveness of AI Implementation`;

  // Convert markdown to HTML using Showdown
  const convertMarkdownToHtml = (markdown: string): string => {
    // Configure Showdown with GitHub flavor and additional options
    const converter = new showdown.Converter({
      flavor: 'github',
      tables: true,
      strikethrough: true,
      tasklists: true,
      ghCodeBlocks: true,
      headerLevelStart: 1,
      simpleLineBreaks: true,
      openLinksInNewWindow: true,
      parseImgDimensions: true,
      ghCompatibleHeaderId: true,
      customizedHeaderId: true,
      encodeEmails: true,
      ellipsis: true,
      emoji: true,
      underline: false,
      completeHTMLDocument: false
    });

    // Convert markdown to HTML and return clean HTML without styling
    return converter.makeHtml(markdown);
  };

  // Create a blob and download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

    const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      // Try to use the n8n service first
      if (workflowManager.state.draftData) {
        const result = await workflowManager.mutations.export.mutateAsync({
          content: workflowManager.state.draftData,
          format: format as 'html' | 'docx' | 'pdf' | 'markdown'
        });
        
        if (result.success && result.data.downloadUrl) {
          // If n8n service returns a download URL, use it
          window.open(result.data.downloadUrl, '_blank');
          toast({
            title: "Export Complete",
            description: `Article exported as ${format.toUpperCase()}`,
          });
          setIsExporting(false);
          return;
        }
      }
      throw new Error('N8n service not available, using local fallback');
    } catch (error) {
      // Fallback to local file generation
      console.warn('N8n export failed, using local fallback:', error);
      
      switch (format) {
        case 'markdown':
          downloadFile(article, 'research-article.md', 'text/markdown');
          toast({
            title: "Export Complete",
            description: "Article downloaded as Markdown",
          });
          break;
          
        case 'html':
          const htmlContent = convertMarkdownToHtml(article);
          const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Article</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
          downloadFile(completeHtml, 'research-article.html', 'text/html');
          toast({
            title: "Export Complete",
            description: "Article downloaded as HTML",
          });
          break;
          
        case 'pdf':
          await handlePdfExport();
          break;
          
        case 'docx':
          await handleDocxExport();
          break;
          
        default:
          downloadFile(article, 'research-article.txt', 'text/plain');
          toast({
            title: "Export Complete",
            description: "Article downloaded as text file",
          });
      }
    }
    
    setIsExporting(false);
  };

  const handlePdfExport = async () => {
    try {
      // Create a temporary div with the article content for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        color: #333;
      `;
      
      // Convert markdown to HTML and add to temp div
      const htmlContent = convertMarkdownToHtml(article);
      tempDiv.innerHTML = htmlContent;
      
      // Temporarily add to document for rendering
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Generate canvas from the HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temp div
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      
      // Save the PDF
      pdf.save('research-article.pdf');
      
      toast({
        title: "PDF Export Complete",
        description: "Article downloaded as PDF",
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "PDF Export Failed",
        description: "Unable to generate PDF. Please try HTML or Markdown.",
        variant: "destructive",
      });
    }
  };

  const handleDocxExport = async () => {
    try {
      // Use the md-to-docx library to convert markdown to DOCX
      const blob = await convertMarkdownToDocx(article, {
        documentType: 'document',
        style: {
          titleSize: 32,
          headingSpacing: 240,
          paragraphSpacing: 240,
          lineSpacing: 1.15,
          heading1Size: 28,
          heading2Size: 24,
          heading3Size: 20,
          heading4Size: 18,
          heading5Size: 16,
          paragraphSize: 22,
          listItemSize: 22,
          codeBlockSize: 20,
          blockquoteSize: 22,
          paragraphAlignment: "JUSTIFIED",
        }
      });
      
      // Download the DOCX file
      downloadDocx(blob, "research-article.docx");
      
      toast({
        title: "Word Export Complete",
        description: "Article downloaded as Word document",
      });
    } catch (error) {
      console.error('DOCX export failed:', error);
      toast({
        title: "Word Export Failed",
        description: "Unable to generate Word document. Please try HTML or Markdown.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAsHtml = async () => {
    setIsExporting(true);
    setExportFormat('html');
    
    try {
      const htmlContent = convertMarkdownToHtml(article);
      
      // Wrap in basic HTML document structure for download
      const completeHtmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Article</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
      
      downloadFile(completeHtmlDocument, 'research-article.html', 'text/html');
      
      toast({
        title: "HTML Download Complete",
        description: "Article downloaded as clean HTML file",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download HTML file",
        variant: "destructive",
      });
    }
    
    setIsExporting(false);
  };

  const handleCopyAsHtml = async () => {
    try {
      const htmlContent = convertMarkdownToHtml(article);
      await navigator.clipboard.writeText(htmlContent);
      toast({
        title: "HTML Copied",
        description: "Article HTML has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy HTML to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(article);
      toast({
        title: "Copied to Clipboard",
        description: "Article content has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    workflowManager.resetWorkflow();
  };

  const isReadyForExport = Object.values(humanChecks).every(check => check);
  const wordCount = article.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  // Get metrics from workflow state
  const qualityMetrics = workflowManager.state.qualityData;
  const overallScore = qualityMetrics ? 
    Math.round((qualityMetrics.conciseness + qualityMetrics.coherence + qualityMetrics.readability + qualityMetrics.toneCompliance) / 4) 
    : 86;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">Article Complete!</h1>
        </div>
        <p className="text-muted-foreground">
          Your research article is ready for final review and export
        </p>
      </div>

      {/* Article Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Article Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{wordCount}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{readingTime}</div>
              <div className="text-sm text-muted-foreground">Min Read</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{workflowManager.state.researchData?.length || 6}</div>
              <div className="text-sm text-muted-foreground">Sources</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{overallScore}</div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Human Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Final Human Review</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please review these quality aspects before exporting
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                id="coherent"
                    checked={humanChecks.coherent}
                    onCheckedChange={(checked) => 
                  setHumanChecks(prev => ({ ...prev, coherent: checked as boolean }))
                    }
                  />
              <label htmlFor="coherent" className="text-sm font-medium">
                Content flows logically and ideas are well-connected
              </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                id="citations"
                    checked={humanChecks.citations}
                    onCheckedChange={(checked) => 
                  setHumanChecks(prev => ({ ...prev, citations: checked as boolean }))
                    }
                  />
              <label htmlFor="citations" className="text-sm font-medium">
                All sources are properly cited and referenced
              </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                id="noFiller"
                    checked={humanChecks.noFiller}
                    onCheckedChange={(checked) => 
                  setHumanChecks(prev => ({ ...prev, noFiller: checked as boolean }))
                    }
                  />
              <label htmlFor="noFiller" className="text-sm font-medium">
                No unnecessary filler content or repetition
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Preview */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Article Preview</CardTitle>
                <FileText className="h-5 w-5" />
                </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/30 p-4 rounded-lg max-h-96 overflow-y-auto">
                  {article}
                </pre>
              </div>
            </CardContent>
          </Card>
            </CollapsibleContent>
          </Collapsible>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Download Formats</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('markdown')}
                  disabled={!isReadyForExport || isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isExporting && exportFormat === 'markdown' ? 'Exporting...' : 'Download as Markdown'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownloadAsHtml}
                  disabled={!isReadyForExport || isExporting}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {isExporting && exportFormat === 'html' ? 'Downloading...' : 'Download as HTML'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('pdf')}
                  disabled={!isReadyForExport || isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting && exportFormat === 'pdf' ? 'Exporting...' : 'Download as PDF'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('docx')}
                  disabled={!isReadyForExport || isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isExporting && exportFormat === 'docx' ? 'Exporting...' : 'Download as Word Doc'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Quick Actions</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as Markdown
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyAsHtml}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Copy as HTML
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleStartOver}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start New Article
                </Button>
              </div>
            </div>
          </div>

          {!isReadyForExport && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please complete the human quality review above before exporting.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};