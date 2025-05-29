# AI Implementation Plan for Business Model Playground

## Overview
This plan outlines the steps to implement AI features in the Business Model Playground app using the Vercel AI SDK. The main feature will be generating suggested business costs to help users think of costs they might want to account for in their projects.

## Prerequisites

### 1. API Keys Setup
- [ ] Sign up for an OpenAI account at https://platform.openai.com
- [ ] Generate an API key from the OpenAI dashboard
- [ ] Store the API key securely (we'll use environment variables)

### 2. Dependencies Installation
```bash
npm install ai openai
```

## Implementation Steps

### 1. Environment Setup
- [ ] Create a `.env.local` file in the root directory
- [ ] Add the OpenAI API key:
  ```
  OPENAI_API_KEY=your_api_key_here
  ```
- [ ] Add `.env.local` to `.gitignore` if not already there

### 2. AI Service Setup
- [ ] Create a new file `lib/ai.ts` to handle AI-related functionality
- [ ] Implement the OpenAI client configuration
- [ ] Create type definitions for the structured data we'll generate

### 3. Cost Generation Feature
- [ ] Create a new component `components/CostGenerator.tsx`
- [ ] Implement a form to collect:
  - Business type/industry
  - Business size
  - Location (optional)
- [ ] Create a function to generate structured cost suggestions using the Vercel AI SDK
- [ ] Implement error handling and loading states

### 4. Integration with Existing App
- [ ] Add the CostGenerator component to the fixed costs section
- [ ] Create a "Generate Suggestions" button
- [ ] Implement the logic to add generated costs to the project
- [ ] Add proper TypeScript types for the generated data

### 5. UI/UX Enhancements
- [ ] Add loading states during generation
- [ ] Implement error handling UI
- [ ] Add a way to edit generated costs before adding them
- [ ] Add a way to save favorite generated costs

## Code Structure

### Example AI Service Setup (`lib/ai.ts`)
```typescript
import OpenAI from 'openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const costSchema = z.object({
  costs: z.array(z.object({
    name: z.string(),
    category: z.string(),
    estimatedAmount: z.number(),
    frequency: z.enum(['monthly', 'annual']),
    description: z.string(),
  })),
});

export async function generateCostSuggestions(params: {
  businessType: string;
  businessSize: string;
  location?: string;
}) {
  const { object } = await generateObject({
    model: openai('gpt-4'),
    schema: costSchema,
    prompt: `Generate a list of common business costs for a ${params.businessSize} ${params.businessType} business${params.location ? ` in ${params.location}` : ''}. Include both fixed and variable costs.`,
  });

  return object;
}
```

### Example Component Usage
```typescript
// components/CostGenerator.tsx
'use client';

import { useState } from 'react';
import { generateCostSuggestions } from '@/lib/ai';

export function CostGenerator() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handleGenerate = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await generateCostSuggestions({
        businessType: formData.get('businessType') as string,
        businessSize: formData.get('businessSize') as string,
        location: formData.get('location') as string,
      });
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component JSX here
}
```

## Future Enhancements
1. Add more context to cost generation (e.g., industry-specific costs)
2. Implement cost optimization suggestions
3. Add the ability to generate product/service suggestions
4. Implement cost trend analysis
5. Add the ability to generate business model comparisons

## Security Considerations
- Never expose API keys in client-side code
- Implement rate limiting for API calls
- Add proper error handling for API failures
- Consider implementing a caching layer for common requests

## Testing Plan
1. Unit tests for the AI service functions
2. Integration tests for the CostGenerator component
3. End-to-end tests for the complete flow
4. Load testing for the AI integration
5. Error handling tests

## Deployment Considerations
- Ensure environment variables are properly set in Vercel
- Monitor API usage and costs
- Set up proper error tracking
- Implement fallback UI for when AI features are unavailable 