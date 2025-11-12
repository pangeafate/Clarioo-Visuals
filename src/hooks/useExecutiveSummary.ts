/**
 * 🎯 EXECUTIVE SUMMARY HOOK
 *
 * Purpose: Manages AI-powered executive summary generation.
 * Extracts business logic from ExecutiveSummary component.
 *
 * Features:
 * - AI-powered executive summary generation
 * - Market insights calculation (maturity, competitiveness, quality)
 * - Vendor data aggregation and analysis
 * - Loading state management
 * - Error handling with user feedback
 *
 * @module hooks/useExecutiveSummary
 */

import { useState } from 'react';
import * as aiService from '@/services/mock/aiService';
import { useToast } from '@/hooks/use-toast';

/**
 * Vendor structure for summary generation
 */
export interface Vendor {
  id: string;
  name: string;
  description: string;
  website: string;
  pricing: string;
  rating: number;
  criteriaScores: Record<string, number>;
  features: string[];
}

/**
 * Criteria structure for context
 */
export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}

/**
 * Tech request context
 */
export interface TechRequest {
  category: string;
  description?: string;
}

/**
 * Market insights structure
 */
export interface MarketInsights {
  marketMaturity: 'Emerging' | 'Established' | 'Mature';
  competitiveness: 'Limited Options' | 'Competitive' | 'Highly Competitive';
  overallQuality: 'Mixed' | 'Good' | 'Excellent';
}

/**
 * Hook return type
 */
export interface UseExecutiveSummaryReturn {
  isGenerating: boolean;
  generateSummary: (
    vendors: Vendor[],
    criteria: Criteria[],
    techRequest: TechRequest,
    calculateOverallScore: (vendor: Vendor) => number
  ) => Promise<string | null>;
  getMarketInsights: (
    vendors: Vendor[],
    calculateOverallScore: (vendor: Vendor) => number
  ) => MarketInsights;
}

/**
 * Custom hook for AI-powered executive summary generation
 *
 * Purpose: Manages executive summary business logic with AI service integration.
 * Handles vendor analysis, market insights, and summary generation.
 *
 * @returns Object with summary state and functions
 *
 * @example
 * ```typescript
 * const {
 *   isGenerating,
 *   generateSummary,
 *   getMarketInsights
 * } = useExecutiveSummary();
 *
 * // Generate executive summary
 * const summary = await generateSummary(
 *   vendors,
 *   criteria,
 *   techRequest,
 *   calculateOverallScore
 * );
 *
 * // Get market insights
 * const insights = getMarketInsights(vendors, calculateOverallScore);
 * console.log('Market Maturity:', insights.marketMaturity);
 * ```
 *
 * @remarks
 * - Automatically maps data to AI service format
 * - Shows error toast on failure
 * - Loading state can be used to show spinners
 * - Market insights are calculated synchronously
 */
export const useExecutiveSummary = (): UseExecutiveSummaryReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  /**
   * Calculate market insights from vendor data
   *
   * Purpose: Analyzes vendor ratings and scores to determine
   * market maturity, competitiveness, and overall quality.
   *
   * @param vendors - Vendors to analyze
   * @param calculateOverallScore - Function to calculate vendor overall score
   * @returns Market insights object
   *
   * @example
   * ```typescript
   * const insights = getMarketInsights(vendors, calculateOverallScore);
   * // {
   * //   marketMaturity: 'Mature',
   * //   competitiveness: 'Highly Competitive',
   * //   overallQuality: 'Excellent'
   * // }
   * ```
   *
   * @remarks
   * - Market Maturity based on average vendor rating:
   *   - Mature: avgRating >= 4.2
   *   - Established: avgRating >= 3.8
   *   - Emerging: avgRating < 3.8
   *
   * - Competitiveness based on top performers (score >= 4.0):
   *   - Highly Competitive: 3+ top performers
   *   - Competitive: 2 top performers
   *   - Limited Options: < 2 top performers
   *
   * - Overall Quality based on average overall score:
   *   - Excellent: avgScore >= 4.0
   *   - Good: avgScore >= 3.5
   *   - Mixed: avgScore < 3.5
   *
   * - Pure function with no side effects
   * - Synchronous calculation
   */
  const getMarketInsights = (
    vendors: Vendor[],
    calculateOverallScore: (vendor: Vendor) => number
  ): MarketInsights => {
    // Calculate average rating
    const avgRating = vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length;

    // Calculate average overall score
    const avgScore = vendors.reduce((sum, v) => sum + calculateOverallScore(v), 0) / vendors.length;

    // Count top performers (score >= 4.0)
    const topPerformers = vendors.filter(v => calculateOverallScore(v) >= 4.0).length;

    // Determine market maturity based on average rating
    const marketMaturity: MarketInsights['marketMaturity'] =
      avgRating >= 4.2 ? 'Mature' :
      avgRating >= 3.8 ? 'Established' :
      'Emerging';

    // Determine competitiveness based on top performers
    const competitiveness: MarketInsights['competitiveness'] =
      topPerformers >= 3 ? 'Highly Competitive' :
      topPerformers >= 2 ? 'Competitive' :
      'Limited Options';

    // Determine overall quality based on average score
    const overallQuality: MarketInsights['overallQuality'] =
      avgScore >= 4.0 ? 'Excellent' :
      avgScore >= 3.5 ? 'Good' :
      'Mixed';

    return {
      marketMaturity,
      competitiveness,
      overallQuality
    };
  };

  /**
   * Generate executive summary using AI
   *
   * Purpose: Uses AI to generate comprehensive executive-level summary
   * of vendor comparison with strategic insights and recommendations.
   *
   * @param vendors - Vendors to include in summary
   * @param criteria - Evaluation criteria for context
   * @param techRequest - Tech request with category and requirements
   * @param calculateOverallScore - Function to calculate vendor overall score
   * @returns Promise resolving to summary text or null on error
   *
   * @example
   * ```typescript
   * const summary = await generateSummary(
   *   vendors,
   *   criteria,
   *   { category: 'CRM Software', description: 'Need mobile support' },
   *   calculateOverallScore
   * );
   * if (summary) {
   *   console.log('Executive Summary:', summary);
   * }
   * ```
   *
   * @remarks
   * - Maps vendors to AI service format with match scores
   * - Maps criteria for context
   * - Generates strategic, executive-level summary
   * - Shows error toast on failure
   * - Returns null if generation fails
   * - Loading state managed automatically
   */
  const generateSummary = async (
    vendors: Vendor[],
    criteria: Criteria[],
    techRequest: TechRequest,
    calculateOverallScore: (vendor: Vendor) => number
  ): Promise<string | null> => {
    setIsGenerating(true);

    try {
      // Map vendors to aiService format
      const mappedVendors: aiService.Vendor[] = vendors.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        category: techRequest.category,
        website: v.website,
        logo_url: '',
        match_score: calculateOverallScore(v) * 20, // Convert 0-5 to 0-100
        pricing: v.pricing,
        pros: v.features || [],
        cons: []
      }));

      // Map criteria to aiService format
      const mappedCriteria: aiService.Criterion[] = criteria.map(c => ({
        id: c.id,
        name: c.name,
        importance: c.importance,
        type: c.type
      }));

      // Call mock AI service to generate executive summary
      const { data: summaryText, error } = await aiService.generateExecutiveSummary(
        techRequest.category,
        mappedVendors,
        mappedCriteria
      );

      if (error || !summaryText) {
        throw new Error(error?.message || 'Failed to generate summary');
      }

      return summaryText;
    } catch (error) {
      console.error('Summary generation failed:', error);

      toast({
        title: "Generation Failed",
        description: "Failed to generate executive summary. Please try again.",
        variant: "destructive"
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateSummary,
    getMarketInsights
  };
};
