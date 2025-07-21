// Client-side link validation utility
// Uses fetch API for validating links in browser environment

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
 * Check HTTP status of a single URL using fetch API
 */
async function checkUrlStatus(url: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    url,
    status: 0,
    isValid: false,
    isCompetitor: isCompetitorDomain(url)
  };

  try {
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    let usedCors = false;

    try {
      // Try CORS mode first to get proper status codes
      response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'User-Agent': 'hiredly-composer-link-validator/1.0',
        },
        signal: controller.signal
      });
      usedCors = true;
    } catch (corsError) {
      try {
        // If CORS fails, try no-cors mode (limited status info)
        response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'User-Agent': 'hiredly-composer-link-validator/1.0',
          },
          signal: controller.signal
        });
      } catch (headError) {
        // If HEAD fails completely, try GET with no-cors
        response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'User-Agent': 'hiredly-composer-link-validator/1.0',
          },
          signal: controller.signal
        });
      }
    }

    clearTimeout(timeoutId);

    result.status = response.status;
    
    if (usedCors && response.status !== 0) {
      // We have proper HTTP status codes from CORS mode
      if (response.status >= 200 && response.status < 300) {
        // 2xx = Success
        result.isValid = !result.isCompetitor;
      } else if (response.status >= 400 && response.status < 500) {
        // 4xx = Client Error (404 Not Found, 403 Forbidden, etc.)
        result.isValid = false;
        result.error = `HTTP ${response.status}: ${getStatusText(response.status)}`;
      } else if (response.status >= 500) {
        // 5xx = Server Error (treat as temporarily invalid)
        result.isValid = false;
        result.error = `HTTP ${response.status}: Server Error`;
      } else if (response.status >= 300 && response.status < 400) {
        // 3xx = Redirection (fetch should handle this automatically, but just in case)
        result.isValid = !result.isCompetitor;
      }
    } else {
      // no-cors mode or status is 0 (opaque response)
      if (response.type === 'opaque') {
        // Request completed but we can't see the status due to CORS
        // This usually means the URL is reachable, but we can't verify if it's a 404
        // We'll be conservative and consider it valid if not a competitor
        result.isValid = !result.isCompetitor;
        result.status = 200; // Assume success since we can't tell
        result.error = 'Status unknown due to CORS restrictions';
      } else {
        // Unexpected case
        result.isValid = false;
        result.error = 'Unable to determine response status';
      }
    }

  } catch (error) {
    console.warn('Failed to check URL:', url, error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        result.error = 'Request timeout';
      } else if (error.message.includes('Failed to fetch')) {
        result.error = 'Network error or URL not reachable';
      } else if (error.message.includes('CORS')) {
        result.error = 'CORS policy blocked the request';
      } else {
        result.error = error.message;
      }
    } else {
      result.error = 'Unknown error';
    }
    
    result.status = 0;
    result.isValid = false;
  }

  return result;
}

/**
 * Get human-readable status text for HTTP status codes
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  
  return statusTexts[status] || 'Unknown Status';
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

    // Add small delay to avoid overwhelming servers
    if (useHttpCheck && i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
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