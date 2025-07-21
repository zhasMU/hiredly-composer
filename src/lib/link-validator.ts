// Client-side link validation utility
// Replicates the n8n workflow logic for validating links

const COMPETITOR_DOMAINS = [
  'indeed.com',
  'jobstreet.com',
  'glassdoor.com',
  'linkedin.com',
  // add more if needed, use bare domain without www
];

interface ValidationResult {
  url: string;
  status: number;
  isValid: boolean;
  isCompetitor: boolean;
  error?: string;
}

interface LinkValidationResponse {
  validLinks: string[];
  invalidLinks: string[];
  competitorLinks: string[];
}

// CORS proxy configuration
const CORS_PROXY = import.meta.env.VITE_CORS_PROXY_URL || 'https://api.allorigins.win/raw?url=';

/**
 * Check if a domain is a competitor
 */
function isCompetitorDomain(url: string): boolean {
  try {
    // Parse hostname & strip leading 'www.'
    const host = new URL(url).hostname.replace(/^www\./, '');
    
    // Check if the hostname matches, is a subdomain, or a country-specific version
    return COMPETITOR_DOMAINS.some(c => host === c || host.endsWith('.' + c) || host.startsWith(c + '.'));
  } catch (error) {
    console.warn('Invalid URL:', url);
    return false;
  }
}

/**
 * Check HTTP status of a single URL
 */
async function checkUrlStatus(url: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    url,
    status: 0,
    isValid: false,
    isCompetitor: isCompetitorDomain(url)
  };

  try {
    // Use CORS proxy to check the URL
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    result.status = response.status;
    // STATUS 2xx = valid
    result.isValid = response.status >= 200 && response.status < 300;

  } catch (error) {
    console.warn('Failed to check URL:', url, error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
    result.status = 0;
    result.isValid = false;
  }

  return result;
}

/**
 * Alternative method: Check URL without HTTP request (faster, but less accurate)
 * Only checks for competitor domains and basic URL validity
 */
function checkUrlBasic(url: string): ValidationResult {
  const result: ValidationResult = {
    url,
    status: 0,
    isValid: false,
    isCompetitor: isCompetitorDomain(url)
  };

  try {
    // Basic URL validation
    const urlObj = new URL(url);
    
    // Consider it valid if it's a proper HTTP/HTTPS URL and not a competitor
    result.isValid = (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && !result.isCompetitor;
    result.status = result.isValid ? 200 : 0; // Simulate status code
    
  } catch (error) {
    result.error = 'Invalid URL format';
    result.isValid = false;
  }

  return result;
}

/**
 * Validate multiple URLs with progress callback
 */
export async function validateLinks(
  urls: string[], 
  onProgress?: (progress: number, current: string) => void,
  useHttpCheck: boolean = true
): Promise<LinkValidationResponse> {
  const results: ValidationResult[] = [];
  
  // Process URLs with progress tracking
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    // Update progress
    if (onProgress) {
      const progress = Math.round((i / urls.length) * 100);
      onProgress(progress, url);
    }

    // Check URL (with or without HTTP request)
    const result = useHttpCheck ? await checkUrlStatus(url) : checkUrlBasic(url);
    results.push(result);
  }

  // Final progress update
  if (onProgress) {
    onProgress(100, 'Complete');
  }

  // Categorize results exactly like the n8n workflow
  const valid: string[] = [];
  const invalid: string[] = [];
  const competitor: string[] = [];

  for (const item of results) {
    if (item.isCompetitor) {
      competitor.push(item.url);
    } else if (item.isValid) {
      valid.push(item.url);
    } else {
      invalid.push(item.url);
    }
  }

  return {
    validLinks: valid,
    invalidLinks: invalid,
    competitorLinks: competitor,
  };
}

/**
 * Add or remove competitor domains
 */
export function addCompetitorDomain(domain: string): void {
  if (!COMPETITOR_DOMAINS.includes(domain)) {
    COMPETITOR_DOMAINS.push(domain);
  }
}

export function removeCompetitorDomain(domain: string): void {
  const index = COMPETITOR_DOMAINS.indexOf(domain);
  if (index > -1) {
    COMPETITOR_DOMAINS.splice(index, 1);
  }
}

export function getCompetitorDomains(): string[] {
  return [...COMPETITOR_DOMAINS];
}

/**
 * Utility function to test if a URL is reachable (for debugging)
 */
export async function testUrl(url: string): Promise<ValidationResult> {
  return await checkUrlStatus(url);
} 