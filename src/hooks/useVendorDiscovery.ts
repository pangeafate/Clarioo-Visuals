/**
 * 🎯 VENDOR DISCOVERY HOOK
 *
 * Purpose: Manages AI-powered vendor discovery for evaluation.
 * Extracts business logic from VendorSelection component.
 *
 * Features:
 * - AI-powered vendor discovery based on category and criteria
 * - Fallback to curated mock data when AI fails
 * - Loading state management
 * - Error handling with user feedback
 * - Data transformation for AI service
 *
 * @module hooks/useVendorDiscovery
 */

import { useState } from 'react';
import * as aiService from '@/services/mock/aiService';
import { useToast } from '@/hooks/use-toast';
import mockAIdata from '@/data/mockAIdata.json';

/**
 * Vendor structure returned from discovery
 */
export interface Vendor {
  id: string;
  name: string;
  description: string;
  website: string;
  pricing: string;
  rating: number;
  criteriaScores: Record<string, number>;
  criteriaAnswers?: Record<string, {
    yesNo: 'yes' | 'no' | 'partial';
    comment: string;
  }>;
  features: string[];
}

/**
 * Criteria structure for discovery context
 */
export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}

/**
 * Tech request context for discovery
 */
export interface TechRequest {
  category: string;
  description?: string;
  requirements?: string[];
}

/**
 * Hook return type
 */
export interface UseVendorDiscoveryReturn {
  isDiscovering: boolean;
  discoverVendors: (
    techRequest: TechRequest,
    criteria: Criteria[],
    maxVendors?: number
  ) => Promise<Vendor[]>;
}

/**
 * Custom hook for AI-powered vendor discovery
 *
 * Purpose: Manages vendor discovery business logic with AI service integration.
 * Handles data mapping, error handling, and fallback to mock data.
 *
 * @returns Object with discovery state and function
 *
 * @example
 * ```typescript
 * const { isDiscovering, discoverVendors } = useVendorDiscovery();
 *
 * // Discover vendors based on tech request and criteria
 * const vendors = await discoverVendors(
 *   {
 *     category: 'CRM Software',
 *     description: 'Need mobile support and integrations',
 *     requirements: ['mobile app', 'API integrations']
 *   },
 *   criteria,
 *   10 // maximum vendors to discover
 * );
 * ```
 *
 * @remarks
 * - Automatically falls back to mock data when AI fails
 * - Loading state can be used to show spinners
 * - Shows toast notification when using fallback
 * - Maps AI service data to component format
 */
export const useVendorDiscovery = (): UseVendorDiscoveryReturn => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const { toast } = useToast();

  /**
   * Discover vendors using AI service
   *
   * Purpose: Uses AI to discover relevant vendors based on category,
   * requirements, and evaluation criteria. Falls back to mock data on error.
   *
   * @param techRequest - Tech request with category and requirements
   * @param criteria - Evaluation criteria for context
   * @param maxVendors - Maximum number of vendors to discover (default: 10)
   * @returns Promise resolving to array of discovered vendors
   *
   * @example
   * ```typescript
   * const vendors = await discoverVendors(
   *   { category: 'CRM Software', requirements: ['mobile app'] },
   *   criteria,
   *   15
   * );
   * console.log(`Discovered ${vendors.length} vendors`);
   * ```
   *
   * @remarks
   * - Maps criteria to AI service format for better discovery
   * - Extracts requirements from description if not provided
   * - Falls back to mock data silently on error (with toast)
   * - Returns vendors with basic info (detailed scores added later)
   * - Limits results to maxVendors parameter
   */
  const discoverVendors = async (
    techRequest: TechRequest,
    criteria: Criteria[],
    maxVendors: number = 10
  ): Promise<Vendor[]> => {
    setIsDiscovering(true);

    try {
      // 🎨 PROTOTYPE MODE: Load vendors directly from mockAIdata.json
      // In production, this would call AI service or database

      // Load vendors from mockAIdata.json
      const vendors: Vendor[] = mockAIdata.vendors.map(v => ({
        id: v.id,
        name: v.name,
        description: v.executiveSummary || '',
        website: v.website || `${v.name.toLowerCase().replace(/\s+/g, '')}.com`,
        pricing: 'Contact for pricing', // mockAIdata.json doesn't have pricing field
        rating: v.matchPercentage / 20, // Convert 0-100 to 0-5 scale
        criteriaScores: v.scores || {},
        criteriaAnswers: {},
        features: v.keyFeatures || []
      }));

      // Return limited number of vendors
      return vendors.slice(0, maxVendors);
    } catch (error) {
      console.error('Vendor discovery failed:', error);

      // Fallback to empty array
      toast({
        title: "Discovery Failed",
        description: `Could not load vendors. Please try again.`,
        variant: "destructive"
      });

      return [];
    } finally {
      setIsDiscovering(false);
    }
  };

  /**
   * Get fallback vendors from mock data
   *
   * Purpose: Provides curated vendor list when AI discovery fails.
   * Uses vendors from mockAIdata.json.
   *
   * @param category - Software category
   * @returns Promise resolving to array of fallback vendors
   *
   * @remarks
   * - Loads vendors from mockAIdata.json
   * - In production, this would query database for real vendors
   * - Returns vendors with basic info structure
   */
  const getFallbackVendors = async (category: string): Promise<Vendor[]> => {
    // Load vendors from mockAIdata.json
    const vendors: Vendor[] = mockAIdata.vendors.map(v => ({
      id: v.id,
      name: v.name,
      description: v.executiveSummary || '',
      website: v.website || `${v.name.toLowerCase().replace(/\s+/g, '')}.com`,
      pricing: 'Contact for pricing', // mockAIdata.json doesn't have pricing field
      rating: v.matchPercentage / 20, // Convert 0-100 to 0-5 scale
      criteriaScores: v.scores || {},
      criteriaAnswers: {},
      features: v.keyFeatures || []
    }));

    return vendors;
  };

  return {
    isDiscovering,
    discoverVendors
  };
};
