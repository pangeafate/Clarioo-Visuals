/**
 * 🎨 MOCK AI SERVICE
 *
 * Purpose: Simulates AI-powered features for visual prototype.
 * Uses pre-generated data instead of OpenAI API calls.
 *
 * Mock Behavior:
 * - Category-based criteria generation from templates
 * - Vendor selection and match scoring
 * - Multi-vendor comparison and analysis
 * - Chat-based vendor consultation
 * - Executive summary generation
 * - Simulates realistic AI processing delays (1500-3500ms)
 *
 * AI Features Simulated:
 * - Criteria generation based on category and requirements
 * - Vendor ranking by match score
 * - Natural language chat responses
 * - Contextual recommendations
 * - Comparative analysis
 * - Executive summary formatting
 *
 * Integration Notes:
 * - When integrating OpenAI, replace with actual API calls
 * - Remove all simulateAIDelay() calls
 * - Replace criteriaData/vendorsData with database queries
 * - Implement proper prompt engineering for each feature
 * - Add token usage tracking and cost management
 * - Implement streaming responses for chat
 * - Add error handling for API rate limits
 * - Consider caching frequent queries
 *
 * @module services/mock/aiService
 */

import mockAIdata from '@/data/mockAIdata.json';
import { simulateAIDelay } from '@/utils/mockHelpers';
import { normalizeString } from '@/utils/dataTransformers';
import type { Criterion, Vendor, ApiError } from '@/types';

// AI-specific types
export interface VendorComparison {
  vendor_id: string;
  vendor_name: string;
  strengths: string[];
  weaknesses: string[];
  overall_score: number;
  recommendation: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Get criteria for a specific category
 *
 * Helper function that retrieves pre-generated criteria templates
 * for a given software category.
 *
 * @param category - Software category key (e.g., "crm", "marketing")
 * @returns Array of criteria for the category (currently returns CRM criteria for all categories)
 *
 * @internal
 */
const getCriteriaForCategory = (category: string): Criterion[] => {
  // 🎨 PROTOTYPE MODE: Return CRM criteria from mockAIdata for all categories
  // In production, this would fetch category-specific criteria from database
  return mockAIdata.criteria.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    importance: c.importance >= 4 ? 'high' : c.importance >= 3 ? 'medium' : 'low',
    type: c.type || 'other',
  })) as unknown as Criterion[];
};

/**
 * Get vendors for a specific category
 *
 * Helper function that retrieves pre-generated vendor data
 * for a given software category.
 *
 * @param category - Software category key (e.g., "crm", "marketing")
 * @returns Array of vendors for the category, or default vendors if not found
 *
 * @internal
 */
const getVendorsForCategory = (category: string): Vendor[] => {
  const categoryKey = category as keyof typeof mockAIdata.vendorsByCategory;
  const vendors = mockAIdata.vendorsByCategory[categoryKey];
  if (!vendors) {
    throw new Error(`No vendors found for category: ${category}. Available categories: ${Object.keys(mockAIdata.vendorsByCategory).join(', ')}`);
  }
  return vendors;
};

/**
 * Generate evaluation criteria based on project requirements
 *
 * Purpose: Simulates AI-powered criteria generation for vendor evaluation.
 * Returns category-specific criteria that match user requirements.
 *
 * Mock Behavior:
 * - Retrieves criteria templates for the specified category
 * - Prioritizes criteria that match user requirements
 * - Returns up to 'count' criteria (default 20)
 * - Simulates AI processing delay (1800-2500ms)
 * - Always succeeds with valid category
 *
 * @param category - Software category (e.g., "CRM Software", "Marketing Automation")
 * @param requirements - Optional user requirements to influence criteria priority
 * @param count - Number of criteria to return (default: 20)
 * @returns Promise with generated criteria array or error
 *
 * @example
 * ```typescript
 * const { data, error } = await generateCriteria(
 *   'CRM Software',
 *   ['mobile app', 'integration', 'reporting'],
 *   15
 * );
 * if (data) {
 *   console.log(`Generated ${data.length} criteria`);
 * }
 * ```
 *
 * @remarks
 * - Replace with OpenAI API call for production
 * - Real implementation should use GPT-4 with prompt engineering
 * - Consider caching criteria for common categories
 * - Add token usage tracking for cost management
 */
export const generateCriteria = async (
  category: string,
  requirements?: string[],
  count: number = 20
): Promise<{ data: Criterion[] | null; error: ApiError | null }> => {
  await simulateAIDelay(1800, 2500);

  try {
    const allCriteria = getCriteriaForCategory(category);

    // If requirements provided, prioritize matching criteria
    let selectedCriteria: Criterion[];

    if (requirements && requirements.length > 0) {
      // Filter criteria that match requirements (case-insensitive partial match)
      const matchingCriteria = allCriteria.filter(criterion =>
        requirements.some(req =>
          criterion.name.toLowerCase().includes(req.toLowerCase())
        )
      );

      // Combine matching criteria with remaining criteria
      const remainingCriteria = allCriteria.filter(
        c => !matchingCriteria.includes(c)
      );

      selectedCriteria = [...matchingCriteria, ...remainingCriteria].slice(0, count);
    } else {
      // Return first N criteria
      selectedCriteria = allCriteria.slice(0, count);
    }

    return {
      data: selectedCriteria,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: 'Failed to generate criteria',
        code: 'GENERATION_ERROR'
      }
    };
  }
};

/**
 * Select and rank vendors based on criteria
 *
 * Purpose: Simulates AI-powered vendor selection and ranking.
 * Returns top-ranked vendors for the specified category.
 *
 * Mock Behavior:
 * - Retrieves vendor data for the specified category
 * - Adjusts match scores based on high-priority criteria
 * - Sorts vendors by match score (descending)
 * - Returns top 'count' vendors (default 8)
 * - Simulates AI processing delay (2000-2800ms)
 * - Always succeeds with valid category
 *
 * @param category - Software category (e.g., "CRM Software")
 * @param criteria - Optional evaluation criteria to influence ranking
 * @param count - Number of top vendors to return (default: 8)
 * @returns Promise with ranked vendor array or error
 *
 * @example
 * ```typescript
 * const { data, error } = await selectVendors(
 *   'CRM Software',
 *   criteriaList,
 *   5
 * );
 * if (data) {
 *   console.log(`Top vendor: ${data[0].name} (${data[0].match_score}%)`);
 * }
 * ```
 *
 * @remarks
 * - Replace with OpenAI API call for production
 * - Real implementation should analyze criteria weights and vendor features
 * - Consider implementing embeddings for semantic matching
 * - Add confidence scores for recommendations
 */
export const selectVendors = async (
  category: string,
  criteria?: Criterion[],
  count: number = 8
): Promise<{ data: Vendor[] | null; error: ApiError | null }> => {
  await simulateAIDelay(2000, 2800);

  try {
    let vendors = getVendorsForCategory(category);

    // If criteria provided, adjust match scores slightly
    if (criteria && criteria.length > 0) {
      const highPriorityCriteria = criteria.filter(c => c.importance === 'high');
      const highPriorityWeight = highPriorityCriteria.length / criteria.length;

      // Adjust match scores based on criteria weight
      vendors = vendors.map(vendor => ({
        ...vendor,
        match_score: Math.min(
          100,
          Math.floor(vendor.match_score + (highPriorityWeight * 5))
        )
      }));
    }

    // Sort by match score and return top N
    const rankedVendors = vendors
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, count);

    return {
      data: rankedVendors,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: 'Failed to select vendors',
        code: 'SELECTION_ERROR'
      }
    };
  }
};

/**
 * Compare multiple vendors with detailed analysis
 *
 * Purpose: Simulates AI-powered multi-vendor comparison.
 * Generates detailed analysis with strengths, weaknesses, and recommendations.
 *
 * Mock Behavior:
 * - Retrieves vendor data for specified IDs
 * - Extracts top strengths (pros) and weaknesses (cons)
 * - Calculates overall scores based on match score and pros/cons balance
 * - Generates contextual recommendations based on scores
 * - Sorts results by overall score (descending)
 * - Simulates AI processing delay (2200-3000ms)
 * - Returns NOT_FOUND error if no vendors match IDs
 *
 * @param vendorIds - Array of vendor IDs to compare (e.g., ["vendor_1", "vendor_2"])
 * @param category - Software category for context
 * @param criteria - Optional evaluation criteria (reserved for future use)
 * @returns Promise with comparison analysis array or error
 *
 * @example
 * ```typescript
 * const { data, error } = await compareVendors(
 *   ['hubspot', 'salesforce', 'zoho'],
 *   'CRM Software',
 *   criteriaList
 * );
 * if (data) {
 *   data.forEach(comparison => {
 *     console.log(`${comparison.vendor_name}: ${comparison.overall_score}%`);
 *     console.log(`Strengths: ${comparison.strengths.join(', ')}`);
 *   });
 * }
 * ```
 *
 * @remarks
 * - Replace with OpenAI API call for production
 * - Real implementation should use GPT-4 for nuanced analysis
 * - Consider using structured output for consistent format
 * - Add side-by-side feature comparison
 * - Implement criteria-weighted scoring
 */
export const compareVendors = async (
  vendorIds: string[],
  category: string,
  criteria?: Criterion[]
): Promise<{ data: VendorComparison[] | null; error: ApiError | null }> => {
  await simulateAIDelay(2200, 3000);

  try {
    const allVendors = getVendorsForCategory(category);
    const vendorsToCompare = allVendors.filter(v => vendorIds.includes(v.id));

    if (vendorsToCompare.length === 0) {
      return {
        data: null,
        error: {
          message: 'No vendors found for comparison',
          code: 'NOT_FOUND'
        }
      };
    }

    // Generate comparisons for each vendor
    const comparisons: VendorComparison[] = vendorsToCompare.map(vendor => {
      // Extract strengths from pros
      const strengths = vendor.pros.slice(0, 3);

      // Extract weaknesses from cons
      const weaknesses = vendor.cons.slice(0, 2);

      // Calculate overall score based on match_score and pros/cons balance
      const prosConsRatio = vendor.pros.length / (vendor.cons.length + 1);
      const overallScore = Math.min(
        100,
        Math.floor((vendor.match_score + prosConsRatio * 10) / 1.1)
      );

      // Generate recommendation based on score
      let recommendation: string;
      if (overallScore >= 85) {
        recommendation = `${vendor.name} is an excellent choice that strongly aligns with your requirements. Highly recommended for consideration.`;
      } else if (overallScore >= 75) {
        recommendation = `${vendor.name} is a solid option that meets most of your needs. Worth serious evaluation.`;
      } else if (overallScore >= 65) {
        recommendation = `${vendor.name} could work but may require some compromises. Consider if specific features are critical.`;
      } else {
        recommendation = `${vendor.name} may have significant gaps for your use case. Evaluate carefully against your must-have requirements.`;
      }

      return {
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        strengths,
        weaknesses,
        overall_score: overallScore,
        recommendation
      };
    });

    // Sort by overall score
    comparisons.sort((a, b) => b.overall_score - a.overall_score);

    return {
      data: comparisons,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: 'Failed to compare vendors',
        code: 'COMPARISON_ERROR'
      }
    };
  }
};

/**
 * Chat-based AI interaction
 *
 * Purpose: Simulates conversational AI assistant for vendor discovery.
 * Provides contextual responses based on chat history and current context.
 *
 * Mock Behavior:
 * - Analyzes last user message for intent detection
 * - Uses context (vendors, criteria, category) to generate relevant responses
 * - Handles common queries: recommendations, comparisons, pricing, criteria
 * - Returns generic helpful response for unrecognized queries
 * - Simulates AI processing delay (1500-2200ms)
 * - Returns INVALID_INPUT error if message format is incorrect
 *
 * @param messages - Chat history array (must end with user message)
 * @param context - Optional context object with category, vendors, criteria
 * @returns Promise with AI response string or error
 *
 * @example
 * ```typescript
 * const { data, error } = await chat(
 *   [
 *     { role: 'user', content: 'Which vendor would you recommend?' }
 *   ],
 *   {
 *     category: 'CRM Software',
 *     vendors: topVendors,
 *     criteria: criteriaList
 *   }
 * );
 * if (data) {
 *   console.log('AI response:', data);
 * }
 * ```
 *
 * @remarks
 * - Replace with OpenAI Chat API for production
 * - Real implementation should use GPT-4 with system prompts
 * - Implement streaming responses for better UX
 * - Add conversation memory and context tracking
 * - Consider fine-tuning for vendor domain knowledge
 */
export const chat = async (
  messages: ChatMessage[],
  context?: {
    category?: string;
    vendors?: Vendor[];
    criteria?: Criterion[];
  }
): Promise<{ data: string | null; error: ApiError | null }> => {
  await simulateAIDelay(1500, 2200);

  try {
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== 'user') {
      return {
        data: null,
        error: {
          message: 'Invalid message format',
          code: 'INVALID_INPUT'
        }
      };
    }

    // Generate contextual response based on message content
    const userMessage = lastMessage.content.toLowerCase();

    let response: string;

    // Handle common queries
    if (userMessage.includes('recommend') || userMessage.includes('suggestion')) {
      if (context?.vendors && context.vendors.length > 0) {
        const topVendor = context.vendors[0];
        response = `Based on your requirements, I would recommend ${topVendor.name}. It has a match score of ${topVendor.match_score}% and offers ${topVendor.pros[0].toLowerCase()}. ${topVendor.description}`;
      } else {
        response = "I'd be happy to recommend vendors once you've defined your evaluation criteria and category.";
      }
    } else if (userMessage.includes('compare') || userMessage.includes('difference')) {
      if (context?.vendors && context.vendors.length >= 2) {
        const [vendor1, vendor2] = context.vendors;
        response = `Comparing ${vendor1.name} and ${vendor2.name}: ${vendor1.name} scores ${vendor1.match_score}% and excels in ${vendor1.pros[0].toLowerCase()}, while ${vendor2.name} scores ${vendor2.match_score}% and is known for ${vendor2.pros[0].toLowerCase()}. The main trade-off is ${vendor1.cons[0].toLowerCase()} vs ${vendor2.cons[0].toLowerCase()}.`;
      } else {
        response = "I need at least two vendors selected to provide a comparison.";
      }
    } else if (userMessage.includes('price') || userMessage.includes('cost')) {
      if (context?.vendors && context.vendors.length > 0) {
        const vendor = context.vendors[0];
        response = `${vendor.name} pricing is ${vendor.pricing}. This varies based on team size and feature requirements. I recommend requesting a detailed quote from their sales team.`;
      } else {
        response = "Please select specific vendors to get pricing information.";
      }
    } else if (userMessage.includes('criteria') || userMessage.includes('important')) {
      if (context?.criteria && context.criteria.length > 0) {
        const highPriority = context.criteria.filter(c => c.importance === 'high');
        response = `Your high-priority criteria include: ${highPriority.slice(0, 3).map(c => c.name).join(', ')}. These should be the primary focus during vendor evaluation.`;
      } else {
        response = "Let's define your evaluation criteria first. What features and capabilities are most important for your use case?";
      }
    } else {
      // Generic helpful response
      response = "I'm here to help you evaluate and select the right vendor for your needs. You can ask me to recommend vendors, compare options, discuss pricing, or refine your criteria. What would you like to know?";
    }

    return {
      data: response,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: 'Failed to generate chat response',
        code: 'CHAT_ERROR'
      }
    };
  }
};

/**
 * Generate executive summary for vendor selection
 *
 * Purpose: Simulates AI-powered executive summary generation.
 * Creates formatted markdown report for stakeholder presentation.
 *
 * Mock Behavior:
 * - Formats comprehensive markdown report
 * - Highlights top recommendation with key details
 * - Lists evaluation criteria and methodology
 * - Includes alternative vendor options
 * - Provides actionable next steps
 * - Simulates AI processing delay (2500-3500ms)
 * - Always succeeds with valid inputs
 *
 * @param category - Software category for context
 * @param vendors - Ranked vendor list (first is top recommendation)
 * @param criteria - Evaluation criteria used in selection
 * @returns Promise with markdown-formatted summary or error
 *
 * @example
 * ```typescript
 * const { data, error } = await generateExecutiveSummary(
 *   'CRM Software',
 *   rankedVendors,
 *   criteriaList
 * );
 * if (data) {
 *   console.log('Executive Summary:\n', data);
 * }
 * ```
 *
 * @remarks
 * - Replace with OpenAI API call for production
 * - Real implementation should use GPT-4 for professional writing
 * - Consider customizable templates for different industries
 * - Add PDF export capability
 * - Include ROI calculations and cost comparisons
 */
export const generateExecutiveSummary = async (
  category: string,
  vendors: Vendor[],
  criteria: Criterion[]
): Promise<{ data: string | null; error: ApiError | null }> => {
  await simulateAIDelay(2500, 3500);

  try {
    const topVendor = vendors[0];
    const highPriorityCriteria = criteria.filter(c => c.importance === 'high');

    const summary = `# ${category} Vendor Selection - Executive Summary

## Overview
After comprehensive evaluation of ${vendors.length} leading ${category} vendors against ${criteria.length} criteria, we recommend **${topVendor.name}** as the optimal solution.

## Top Recommendation: ${topVendor.name}
**Match Score:** ${topVendor.match_score}%
**Pricing:** ${topVendor.pricing}

### Key Strengths
${topVendor.pros.map(pro => `- ${pro}`).join('\n')}

### Considerations
${topVendor.cons.map(con => `- ${con}`).join('\n')}

## Evaluation Criteria
Our assessment prioritized the following high-importance factors:
${highPriorityCriteria.slice(0, 5).map(c => `- ${c.name}`).join('\n')}

## Alternative Options
${vendors.slice(1, 3).map(v =>
  `### ${v.name} (Match Score: ${v.match_score}%)
${v.description}
**Best for:** ${v.pros[0]}`
).join('\n\n')}

## Next Steps
1. Schedule demo with ${topVendor.name}
2. Request detailed pricing proposal
3. Conduct technical evaluation
4. Review customer references
5. Negotiate contract terms

---
*This summary was generated based on your specific requirements and evaluation criteria.*
`;

    return {
      data: summary,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: 'Failed to generate executive summary',
        code: 'SUMMARY_ERROR'
      }
    };
  }
};

/**
 * Get vendor details by ID
 *
 * Purpose: Helper function to retrieve specific vendor data.
 * Used by components for vendor detail pages and tooltips.
 *
 * @param vendorId - Unique vendor identifier
 * @param category - Software category to search within
 * @returns Vendor object if found, null otherwise
 *
 * @example
 * ```typescript
 * const vendor = getVendorById('hubspot', 'CRM Software');
 * if (vendor) {
 *   console.log('Vendor:', vendor.name);
 * }
 * ```
 */
export const getVendorById = (
  vendorId: string,
  category: string
): Vendor | null => {
  const vendors = getVendorsForCategory(category);
  return vendors.find(v => v.id === vendorId) || null;
};

/**
 * Search vendors by name or description
 *
 * Purpose: Simulates search functionality for vendor discovery.
 * Returns vendors matching the search query.
 *
 * Mock Behavior:
 * - Case-insensitive partial match on vendor name
 * - Case-insensitive partial match on vendor description
 * - Searches within specified category
 * - Simulates search delay (800-1200ms)
 * - Returns empty array if no matches found
 * - Always succeeds with valid inputs
 *
 * @param query - Search query string
 * @param category - Software category to search within
 * @returns Promise with matching vendors array or error
 *
 * @example
 * ```typescript
 * const { data, error } = await searchVendors(
 *   'cloud-based',
 *   'CRM Software'
 * );
 * if (data) {
 *   console.log(`Found ${data.length} vendors matching "cloud-based"`);
 * }
 * ```
 *
 * @remarks
 * - Replace with database full-text search for production
 * - Real implementation should use Supabase FTS or Algolia
 * - Consider adding fuzzy matching for typos
 * - Implement search result ranking by relevance
 * - Add search history and suggestions
 */
export const searchVendors = async (
  query: string,
  category: string
): Promise<{ data: Vendor[] | null; error: ApiError | null }> => {
  await simulateAIDelay(800, 1200);

  try {
    const vendors = getVendorsForCategory(category);
    const lowerQuery = query.toLowerCase();

    const results = vendors.filter(
      v =>
        v.name.toLowerCase().includes(lowerQuery) ||
        v.description.toLowerCase().includes(lowerQuery)
    );

    return {
      data: results,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: {
        message: 'Search failed',
        code: 'SEARCH_ERROR'
      }
    };
  }
};
