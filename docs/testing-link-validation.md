# Testing Link Validation Feature

## Quick Start Testing

### 1. **Start the Application**
```bash
npm run dev
```

### 2. **Navigate to Source Review Step**

**Option A: Use Test Data (Recommended)**
1. Open your browser and go to `http://localhost:<your port number>`
2. Navigate through the steps until you reach "Source Review & Validation" (Step 3)
3. If no sources are available, click **"Load Test Data"** button
4. You'll see 6 sample sources with different validation scenarios

**Option B: Complete Full Workflow**
1. Start from Step 1 (Keywords)
2. Enter any research query and proceed
3. Complete the Research step (may use mock data)
4. Reach the Source Review step

### 3. **Test the Validation**
1. Click the **"Validate All Links"** button
2. Watch the real-time progress bar and current URL display
3. Observe the results after validation completes

## Test Scenarios

### 📊 **Sample Test Data Included**

When you click "Load Test Data", you get these sources:

| Source | URL | Expected Result | Why |
|--------|-----|----------------|-----|
| **Nature Research** | `nature.com/articles/...` | ✅ **Valid** | Real academic site with good status |
| **PubMed Article** | `pubmed.ncbi.nlm.nih.gov/...` | ✅ **Valid** | Government medical database |
| **Indeed Job** | `indeed.com/viewjob...` | 🟠 **Competitor** | Listed in competitor domains |
| **LinkedIn Post** | `linkedin.com/jobs/...` | 🟠 **Competitor** | Listed in competitor domains |
| **Broken Link** | `nonexistent-domain-12345.com` | ❌ **Invalid** | Non-existent domain |
| **GitHub Repo** | `github.com/microsoft/vscode` | ✅ **Valid** | Popular public repository |

### 🎯 **Validation Modes**

**Test Both Modes:**

1. **HTTP Validation Mode (Default)**
   - Uses CORS proxy to check actual HTTP status
   - More accurate but slower
   - May fail if CORS proxy is down

2. **Basic Validation Mode**
   - Only checks URL format and competitor domains
   - Fast and reliable
   - To test: Modify the validation call in code:
   ```typescript
   const result = await validateLinks(urls, callback, false); // false = basic mode
   ```

## Expected Results

### 🟢 **Valid Links**
- Should show green "Valid" badge
- Remain selected for draft generation
- Status: "Link validated successfully"

### 🔴 **Invalid Links** 
- Should show red "Invalid" badge
- Automatically deselected
- Status: "Link is broken or inaccessible"

### 🟠 **Competitor Links**
- Should show orange "Competitor" badge  
- Automatically deselected
- Status: "Identified as competitor content"

### 📊 **Progress Tracking**
- Progress bar should update from 0% to 100%
- Current URL hostname should display
- "Checking: domain.com" message should appear

## Manual Testing Scenarios

### Test Case 1: Mixed Results
```
Expected: 2 valid, 1 invalid, 2 competitor links
Toast: "2 valid, 1 invalid, 2 competitor links found."
```

### Test Case 2: Filter Testing
1. After validation, test filters:
   - **All (6)** - Shows all sources
   - **Valid (2)** - Shows only green-badged sources  
   - **Flagged (3)** - Shows invalid + competitor sources
   - **Pending (0)** - Should be empty after validation

### Test Case 3: Search Functionality
1. Type "nature" in search box
2. Should filter to show only Nature article
3. Clear search to see all sources again

### Test Case 4: Manual Override
1. Click the "X" button on a valid source
2. Should mark it as invalid manually
3. Should be deselected and show "Manually marked as invalid"

## Environment Testing

### CORS Proxy Testing

**Test with Default Proxy:**
```env
VITE_CORS_PROXY_URL=https://api.allorigins.win/raw?url=
```

**Test with Alternative Proxy:**
```env
VITE_CORS_PROXY_URL=https://cors-anywhere.herokuapp.com/
```

**Test Basic Mode (No Proxy):**
Change validation call to use `false` for HTTP checking.

## Troubleshooting

### ❌ **Validation Fails Immediately**
- Check browser console for CORS errors
- Try switching to basic validation mode
- Verify CORS proxy URL in environment

### ❌ **All Links Show as Invalid**
- CORS proxy might be down
- Check network connectivity
- Try alternative CORS proxy

### ❌ **Progress Bar Doesn't Move**
- JavaScript error in validation function
- Check browser developer tools console

### ❌ **Competitor Detection Not Working**
- Check if domains are in the competitor list
- Verify URL parsing logic
- Look for subdomain vs domain issues

## Advanced Testing

### Custom Test URLs

Add your own test URLs by modifying the sample data:

```typescript
// Add to SAMPLE_TEST_SOURCES array
{
  id: "custom-test",
  title: "Your Custom Test",
  url: "https://your-test-domain.com",
  domain: "your-test-domain.com",
  // ... other properties
}
```

### Performance Testing

1. Load 20+ sources
2. Time the validation process
3. Monitor network requests in browser dev tools
4. Check memory usage during validation

### Error Scenario Testing

1. **Network Disconnection**: Disconnect internet during validation
2. **Timeout Testing**: Use very slow-responding URLs
3. **Invalid URLs**: Add malformed URLs to test error handling

## Production Testing Checklist

- [ ] Test with production CORS proxy
- [ ] Verify competitor domain list is up-to-date
- [ ] Test with realistic number of sources (50+)
- [ ] Verify validation results accuracy
- [ ] Test error handling and recovery
- [ ] Check mobile responsiveness
- [ ] Verify toast notifications work
- [ ] Test with slow network connections

## Debug Information

### Console Logs
The validation function logs useful debugging info:
```
Failed to check URL: https://example.com Error: ...
Link validation failed: Error details...
```

### Network Tab
Monitor the Network tab in browser dev tools to see:
- CORS proxy requests
- Response times
- Failed requests

### React DevTools
Use React DevTools to inspect:
- Component state changes
- Progress updates
- Source list modifications 