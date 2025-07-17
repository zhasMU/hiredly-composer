# CORS Proxy Setup for Link Validation

## What is CORS and Why Do We Need a Proxy?

When your React app tries to make HTTP requests to external websites (like checking if links are valid), the browser's security policy (CORS - Cross-Origin Resource Sharing) will block these requests unless the external website explicitly allows them.

Since most websites don't allow cross-origin requests, we need a **CORS proxy** - a server that makes the request on our behalf and forwards the response back to our app.

## Environment Configuration

Add this to your `.env` file:

```env
# CORS Proxy URL for link validation
# Default: https://api.allorigins.win/raw?url=
VITE_CORS_PROXY_URL=https://api.allorigins.win/raw?url=
```

## CORS Proxy Options

### 1. **allorigins.win** (Default - Free)
```env
VITE_CORS_PROXY_URL=https://api.allorigins.win/raw?url=
```
- ✅ Free to use
- ✅ No setup required
- ❌ Rate limited
- ❌ Not suitable for production

### 2. **cors-anywhere.herokuapp.com** (Free with limitations)
```env
VITE_CORS_PROXY_URL=https://cors-anywhere.herokuapp.com/
```
- ✅ Free to use
- ❌ Requires temporary access request
- ❌ Rate limited
- ❌ Not suitable for production

### 3. **Your Own CORS Proxy** (Recommended for Production)

Create your own CORS proxy using Express.js:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

app.use('/proxy', createProxyMiddleware({
  target: 'http://example.com', // This will be overridden
  changeOrigin: true,
  router: (req) => {
    // Extract target URL from query parameter
    return req.query.url;
  },
  pathRewrite: {
    '^/proxy': '',
  },
}));

app.listen(3001, () => {
  console.log('CORS proxy running on port 3001');
});
```

Then set:
```env
VITE_CORS_PROXY_URL=http://localhost:3001/proxy?url=
```

### 4. **CloudFlare Workers** (Production Ready)

Deploy a CloudFlare Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }
  
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
  })
  
  const newResponse = new Response(response.body, response)
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  return newResponse
}
```

## Alternative: Basic Validation (No HTTP Requests)

If you don't want to deal with CORS proxies, you can use basic validation that only checks competitor domains and URL format:

```typescript
// In your component
const validateAllLinks = async () => {
  // ... existing code ...
  
  const result = await validateLinks(
    urls, 
    (progress, currentUrl) => {
      setValidationProgress(progress);
      setCurrentValidatingUrl(currentUrl);
    },
    false // Set to false for basic validation (no HTTP requests)
  );
  
  // ... rest of the code ...
};
```

This approach:
- ✅ No CORS issues
- ✅ Much faster
- ✅ Still detects competitor links
- ❌ Cannot detect broken links
- ❌ Less accurate validation

## Security Considerations

1. **Never expose API keys** in CORS proxy URLs
2. **Rate limiting**: Implement rate limiting on your proxy
3. **Whitelist domains**: Only allow proxying to specific domains
4. **Authentication**: Add authentication to your proxy if needed

## Production Deployment

For production applications, we recommend:

1. Deploy your own CORS proxy on the same infrastructure as your app
2. Use CloudFlare Workers or similar edge computing platform
3. Implement proper rate limiting and security measures
4. Monitor proxy usage and costs 