# n8n Integration Guide for Hiredly Composer

## Overview

This guide explains how to integrate Hiredly Composer with n8n workflows to create a fully functional AI-powered research article writing tool.

## Prerequisites

1. **n8n Instance**: Running n8n server (local or cloud)
2. **API Access**: Webhook endpoints configured in n8n
3. **AI Services**: Access to OpenAI, Claude, or similar AI services
4. **Research APIs**: Access to academic databases, web scraping tools

## Environment Configuration

Create a `.env` file in your project root:

```env
# n8n Configuration
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_API_KEY=your-api-key-here
VITE_N8N_WS_URL=ws://localhost:5678/ws
NODE_ENV=development
```

## n8n Workflow Structure

### 1. Keywords Analysis Workflow
**Webhook URL**: `/webhook/keywords-analysis`

**Input**: 
```json
{
  "query": "AI in healthcare",
  "tags": ["artificial intelligence", "healthcare", "medical"],
  "language": "english",
  "depth": 3,
  "explodedResults": true
}
```

**Processing Steps**:
- Text analysis to extract key concepts
- Query expansion and synonym generation
- Research strategy formulation
- Source estimation

**Output**:
```json
{
  "success": true,
  "executionId": "exec_123",
  "data": {
    "processedKeywords": ["AI", "healthcare", "medical diagnosis"],
    "searchStrategy": "Focus on recent papers and clinical studies",
    "estimatedSources": 25
  }
}
```

### 2. Research & Source Discovery Workflow
**Webhook URL**: `/webhook/research`

**Input**:
```json
{
  "keywords": { /* KeywordsRequest object */ },
  "maxSources": 20,
  "sourceTypes": ["academic", "web", "news"]
}
```

**Processing Steps**:
- Web scraping (Google Scholar, PubMed, arXiv)
- API calls to research databases
- Content extraction and cleaning
- Deduplication and relevance scoring

**Output**:
```json
{
  "success": true,
  "executionId": "exec_124",
  "data": {
    "sources": [
      {
        "id": "src_1",
        "title": "AI Applications in Healthcare",
        "excerpt": "Recent advances in AI...",
        "domain": "nature.com",
        "url": "https://nature.com/article",
        "favicon": "🔬",
        "score": 0.95,
        "type": "academic"
      }
    ],
    "totalFound": 47,
    "searchQueries": ["AI healthcare", "machine learning medicine"]
  }
}
```

### 3. Source Analysis Workflow
**Webhook URL**: `/webhook/source-analysis`

**Processing Steps**:
- Content quality assessment
- Relevance scoring
- Citation extraction
- Bias detection

### 3.1. Link Validation Workflow
**Webhook URL**: `/webhook/validate-links`

**Input**:
```json
{
  "urls": [
    "https://nature.com/article/123",
    "https://pubmed.ncbi.nlm.nih.gov/456",
    "https://competitor-site.com/article"
  ]
}
```

**Processing Steps**:
- HTTP status code checking
- Content accessibility verification
- Competitor domain detection
- Link quality assessment

**Output**:
```json
{
  "success": true,
  "executionId": "exec_125",
  "data": {
    "validLinks": ["https://nature.com/article/123"],
    "invalidLinks": ["https://broken-link.com/article"],
    "competitorLinks": ["https://competitor-site.com/article"]
  }
}
```

### 3. Draft Generation Workflow - IMPORTANT UPDATE
**Webhook URL**: `/webhook/generate-draft`

**CRITICAL**: The draft generation workflow has been updated to include the original query to prevent topic mismatch.

**Updated Input Structure**:
```json
{
  "query": "Are Doctor Jobs in Demand in Malaysia? 2025–2026 Outlook",
  "facts": [
    {
      "heading": "Doctor shortage statistics",
      "summary": "Malaysia faces significant doctor shortage",
      "evidence": "Current doctor-to-patient ratio is below WHO standards",
      "source": "https://example.com/health-report"
    }
  ]
}
```

**Updated System Prompt** (for n8n workflow):
```text
You are a helpful SEO writer. You will be given:

1. ORIGINAL QUERY: The specific topic/question the user wants answered
2. SOURCE MATERIALS consisting of:
   - heading of the source material
   - summary: A brief summary of the information
   - evidence: The specific text that supports the fact
   - source: The direct, full URL where the evidence can be found

Your task is to write an article that DIRECTLY ADDRESSES the original query using the provided source materials.

IMPORTANT: 
- The article title and content must be directly relevant to the original query
- Use the source materials to support your answer to the original query
- Do not deviate from the specific topic/angle requested in the query

The article must be structured with a heading and several sub-headings (following markdown syntax).
The article must contain around 1000 words (with 20% leeway).

Original Query: {{ $json.query }}
Source Materials: {{ $json.facts }}
```

**Why This Update is Critical**:
- **Before**: AI generated content based purely on research facts without context
- **After**: AI understands the specific topic/angle and uses facts to answer that specific question
- **Example Fix**: 
  - Query: "Are Doctor Jobs in Demand in Malaysia? 2025–2026 Outlook"
  - Old Result: "Malaysia's Doctor Shortage: What's Behind the Crisis and Can It Be Solved?"
  - New Result: Article directly addressing job demand outlook for doctors in Malaysia
```

### 4. Draft Generation Workflow
**Webhook URL**: `/webhook/generate-draft`

**Input**:
```json
{
  "sources": [/* Source objects */],
  "outline": [/* OutlineItem objects */],
  "template": "academic",
  "tone": "formal",
  "targetLength": 2000
}
```

**Processing Steps**:
- AI content generation (OpenAI/Claude API)
- Citation integration
- Formatting and structure
- Content validation

### 5. Quality Analysis Workflow
**Webhook URL**: `/webhook/quality-analysis`

**Processing Steps**:
- Readability analysis
- Coherence scoring
- Citation validation
- Improvement suggestions generation

### 6. Export Workflow
**Webhook URL**: `/webhook/export`

**Processing Steps**:
- Format conversion (HTML, DOCX, PDF)
- File generation
- Upload to storage
- Download URL generation

## n8n Workflow Examples

### Sample Keywords Analysis Workflow

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "keywords-analysis",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Process Keywords",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Extract and process keywords\nconst { query, tags, language, depth } = $input.item.json;\n\n// Your keyword processing logic here\nconst processedKeywords = query.split(' ').filter(word => word.length > 3);\nconst searchStrategy = `Focus on ${language} sources with depth level ${depth}`;\n\nreturn {\n  processedKeywords,\n  searchStrategy,\n  estimatedSources: Math.floor(Math.random() * 30) + 10\n};"
      }
    },
    {
      "name": "Response",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "return {\n  success: true,\n  executionId: $workflow.id,\n  data: $input.item.json\n};"
      }
    }
  ],
  "connections": {
    "Webhook": {"main": [[{"node": "Process Keywords", "type": "main", "index": 0}]]},
    "Process Keywords": {"main": [[{"node": "Response", "type": "main", "index": 0}]]}
  }
}
```

### Sample Research Workflow with Web Scraping

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "research",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Google Scholar Search",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://scholar.google.com/scholar",
        "method": "GET",
        "qs": {
          "q": "={{ $json.keywords.query }}"
        }
      }
    },
    {
      "name": "PubMed API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
        "method": "GET",
        "qs": {
          "db": "pubmed",
          "term": "={{ $json.keywords.query }}",
          "retmode": "json"
        }
      }
    },
    {
      "name": "Process Results",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Combine and process all sources\nconst sources = [];\n// Your source processing logic here\n\nreturn {\n  sources,\n  totalFound: sources.length,\n  searchQueries: [$input.item.json.keywords.query]\n};"
      }
    }
  ]
}
```

### Sample Link Validation Workflow

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "validate-links",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Split URLs",
      "type": "n8n-nodes-base.itemLists",
      "parameters": {
        "operation": "splitOutItems",
        "fieldName": "urls"
      }
    },
    {
      "name": "Check Link Status",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{ $json.item }}",
        "method": "HEAD",
        "options": {
          "timeout": 10000,
          "followRedirect": true
        },
        "continueOnFail": true
      }
    },
    {
      "name": "Classify Links",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "const items = $input.all();\nconst valid = [];\nconst invalid = [];\nconst competitor = [];\n\nfor (const item of items) {\n  if (item.json.skip) continue;\n  if (item.json.isCompetitor) competitor.push(item.json.url);\n  else if (item.json.isValid) valid.push(item.json.url);\n  else invalid.push(item.json.url);\n}\n\nreturn [{\n  json: {\n    validLinks: valid,\n    invalidLinks: invalid,\n    competitorLinks: competitor,\n  }\n}];"
      }
    }
  ],
  "connections": {
    "Webhook": {"main": [[{"node": "Split URLs", "type": "main", "index": 0}]]},
    "Split URLs": {"main": [[{"node": "Check Link Status", "type": "main", "index": 0}]]},
    "Check Link Status": {"main": [[{"node": "Classify Links", "type": "main", "index": 0}]]}
  }
}
```

## Progress Tracking Setup

### WebSocket Implementation

In your n8n workflow, add progress updates:

```javascript
// In any processing node
const executionId = $workflow.id;
const progress = 50; // Current progress percentage

// Send progress update via webhook
$httpRequest({
  url: 'http://your-frontend-url/api/progress',
  method: 'POST',
  body: {
    executionId,
    step: 'research',
    progress,
    status: 'running',
    message: 'Analyzing sources...'
  }
});
```

### Frontend Progress Listener

The frontend automatically listens for progress updates through the WebSocket connection configured in the n8n service.

## Error Handling

### Workflow Error Responses

```json
{
  "success": false,
  "executionId": "exec_123",
  "error": "Failed to connect to research database",
  "details": {
    "step": "source-discovery",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Retry Logic

The frontend automatically implements retry logic with exponential backoff for failed requests.

## Security Considerations

1. **API Key Management**: Store n8n API keys securely
2. **Webhook Security**: Implement authentication for webhook endpoints
3. **Rate Limiting**: Configure rate limits for API calls
4. **Data Privacy**: Ensure sensitive research data is handled securely

## Deployment

### Local Development
1. Start n8n: `npx n8n start`
2. Import workflow templates
3. Configure webhook URLs
4. Start frontend: `npm run dev`

### Production
1. Deploy n8n to cloud (n8n Cloud, self-hosted)
2. Configure production webhook URLs
3. Set up SSL certificates
4. Deploy frontend application

## Testing

### Workflow Testing
Use n8n's built-in testing features to validate each workflow step.

### Integration Testing
Test the complete flow from frontend to n8n and back.

### Error Scenarios
Test various error conditions and ensure proper error handling.

## Monitoring

- Set up logging in n8n workflows
- Monitor workflow execution times
- Track success/failure rates
- Set up alerts for critical failures

## Next Steps

1. Set up your n8n instance
2. Import the provided workflow templates
3. Configure your API keys and endpoints
4. Test the integration with sample data
5. Customize workflows for your specific needs

For support and questions, refer to the [n8n documentation](https://docs.n8n.io/) and the project repository. 