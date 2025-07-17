# Workflow Simulation Guide

This guide explains how to use the simulation features to test the Hiredly Composer workflow without requiring fully functional n8n workflows.

## Overview

The Hiredly Composer now includes simulation capabilities for the Keywords and Research steps, allowing you to test the complete workflow flow including the Source Review step with link validation.

## Features

### 1. Keywords Step Simulation
- **Purpose**: Bypass the n8n keywords processing workflow
- **What it does**: Simulates a 2-second processing time, then advances to the Research step
- **How to use**: 
  1. Enter your research query in the Keywords step
  2. Click **"Simulate Research"** button instead of "Start Research (Real)"
  3. The system will store your keywords data and move to the Research step

### 2. Research Step Simulation
- **Purpose**: Bypass the n8n research workflow and provide test data
- **What it does**: 
  - Simulates research processing with progress updates
  - Provides 6 test sources including:
    - 3 high-quality academic sources (Nature, PubMed, NEJM)
    - 1 general web source (bioethics.org)
    - 1 competitor domain source (indeed.com) 
    - 1 broken link for testing validation
- **How to use**:
  1. After completing Keywords (real or simulated), the Research step will auto-start
  2. Alternatively, click **"Simulate Research"** button for immediate mock data

## Test Flow Instructions

### Quick Simulation Test
1. **Keywords Step**: Enter any research query → Click "Simulate Research"
2. **Research Step**: Will automatically simulate and provide test sources
3. **Source Review Step**: Test the link validation with the provided sources

### Mixed Real/Simulation Test
1. **Keywords Step**: Use real n8n workflow with "Start Research (Real)" 
2. **Research Step**: If n8n fails, click "Simulate Research" as fallback
3. **Source Review Step**: Test with either real or simulated data

## Test Data Included

The simulation provides these test sources:

| Source | Type | Purpose | Expected Validation |
|--------|------|---------|-------------------|
| Nature article | Academic | High-quality source | ✅ Valid |
| PubMed article | Academic | High-quality source | ✅ Valid |
| NEJM article | Academic | High-quality source | ✅ Valid |
| Bioethics.org | Web | General source | ✅ Valid |
| Indeed.com | Web | Competitor domain | ⚠️ Competitor |
| nonexistent-domain-12345.com | Web | Broken link | ❌ Invalid |

## Benefits for Development

1. **Independent Testing**: Test frontend without waiting for n8n workflow completion
2. **Consistent Data**: Always get the same test sources for reliable testing
3. **Full Flow Coverage**: Test the complete workflow including Source Review link validation
4. **Error Testing**: Built-in broken links and competitor domains for validation testing
5. **Quick Iteration**: No waiting time for actual AI processing

## Integration with Real Workflows

- Simulation functions use the same data structures as real n8n workflows
- Easy to switch between simulation and real execution
- Simulation data flows seamlessly into subsequent steps
- All workflow state management remains consistent

## Usage Notes

- Simulation bypasses actual n8n calls completely
- Mock data is hardcoded but follows the same TypeScript interfaces
- Progress updates are simulated with realistic timing
- Error handling works the same way as real workflows
- Can mix simulation with real n8n calls (e.g., simulate keywords, use real research)

This simulation system ensures you can develop and test the complete workflow experience even when parts of the n8n infrastructure are not yet ready. 