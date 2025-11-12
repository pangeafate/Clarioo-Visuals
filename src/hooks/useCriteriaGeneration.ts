/**
 * 🎯 CRITERIA GENERATION HOOK
 *
 * Purpose: Manages AI-powered criteria generation for vendor evaluation.
 * Extracts business logic from CriteriaBuilder component.
 *
 * Features:
 * - AI-powered criteria generation based on category and requirements
 * - Fallback to standard criteria when AI fails
 * - Loading state management
 * - Error handling with user-friendly fallbacks
 *
 * @module hooks/useCriteriaGeneration
 */

import { useState } from 'react';
import * as aiService from '@/services/mock/aiService';

/**
 * Criteria structure for component use
 */
export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}

/**
 * Tech request data for criteria generation
 */
export interface TechRequest {
  category: string;
  requirements?: string[];
  description?: string;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Hook return type
 */
export interface UseCriteriaGenerationReturn {
  isGenerating: boolean;
  generateInitialCriteria: (request: TechRequest) => Promise<{
    criteria: Criteria[];
    message: ChatMessage;
  }>;
  generateFallbackCriteria: (request: TechRequest) => Criteria[];
}

/**
 * Generate fallback criteria when AI fails
 *
 * Purpose: Provides standard evaluation criteria as a fallback.
 * Returns a comprehensive set of 20 criteria covering all aspects.
 *
 * @param request - Tech request data
 * @returns Array of 20 standard criteria
 *
 * @remarks
 * - Used as fallback when AI service fails
 * - Covers feature, technical, business, and compliance aspects
 * - Generic but comprehensive coverage
 */
const createFallbackCriteria = (request: TechRequest): Criteria[] => {
  return [
    { id: '1', name: 'User Interface Design', importance: 'high', type: 'feature' },
    { id: '2', name: 'Core Functionality', importance: 'high', type: 'feature' },
    { id: '3', name: 'Performance Speed', importance: 'high', type: 'technical' },
    { id: '4', name: 'Mobile Compatibility', importance: 'high', type: 'feature' },
    { id: '5', name: 'Integration Capabilities', importance: 'high', type: 'technical' },
    { id: '6', name: 'Customization Options', importance: 'medium', type: 'feature' },
    { id: '7', name: 'Reporting & Analytics', importance: 'medium', type: 'feature' },
    { id: '8', name: 'API Documentation', importance: 'medium', type: 'technical' },
    { id: '9', name: 'Data Export Options', importance: 'medium', type: 'feature' },
    { id: '10', name: 'Workflow Automation', importance: 'medium', type: 'feature' },
    { id: '11', name: 'Real-time Updates', importance: 'medium', type: 'technical' },
    { id: '12', name: 'Multi-user Support', importance: 'high', type: 'feature' },
    { id: '13', name: 'Backup & Recovery', importance: 'high', type: 'technical' },
    { id: '14', name: 'Scalability', importance: 'medium', type: 'technical' },
    { id: '15', name: 'Pricing Model', importance: 'high', type: 'business' },
    { id: '16', name: 'Customer Support Quality', importance: 'high', type: 'business' },
    { id: '17', name: 'Training Resources', importance: 'medium', type: 'business' },
    { id: '18', name: 'Vendor Reputation', importance: 'medium', type: 'business' },
    { id: '19', name: 'Data Security', importance: 'high', type: 'compliance' },
    { id: '20', name: 'GDPR Compliance', importance: 'medium', type: 'compliance' }
  ];
};

/**
 * Custom hook for AI-powered criteria generation
 *
 * Purpose: Manages criteria generation with AI service integration.
 * Handles loading states, errors, and fallback generation.
 *
 * @returns Object with generation state and functions
 *
 * @example
 * ```typescript
 * const { isGenerating, generateInitialCriteria, generateFallbackCriteria } = useCriteriaGeneration();
 *
 * // Generate criteria with AI
 * const { criteria, message } = await generateInitialCriteria({
 *   category: 'CRM Software',
 *   requirements: ['mobile app', 'integrations']
 * });
 *
 * // Or use fallback
 * const fallbackCriteria = generateFallbackCriteria(techRequest);
 * ```
 *
 * @remarks
 * - Automatically handles AI failures with fallback
 * - Returns both criteria and explanatory chat message
 * - Loading state can be used to show spinners
 */
export const useCriteriaGeneration = (): UseCriteriaGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Generate initial criteria using AI service
   *
   * @param request - Tech request with category and requirements
   * @returns Promise with generated criteria and chat message
   */
  const generateInitialCriteria = async (
    request: TechRequest
  ): Promise<{ criteria: Criteria[]; message: ChatMessage }> => {
    setIsGenerating(true);

    try {
      // Extract requirements from description
      const requirements = request.requirements || [];

      // Call AI service to generate criteria
      const { data: generatedCriteria, error } = await aiService.generateCriteria(
        request.category,
        requirements,
        20
      );

      if (error || !generatedCriteria) {
        throw new Error(error?.message || 'Failed to generate criteria');
      }

      // Map to component's Criteria type
      const aiCriteria: Criteria[] = generatedCriteria.map((c, index) => ({
        id: `ai-${index + 1}`,
        name: c.name,
        importance: c.importance,
        type: c.type
      }));

      // Create success message
      const successMessage: ChatMessage = {
        id: '2',
        role: 'assistant',
        content: `I've generated 20 evaluation criteria for ${request.category} solutions based on your requirements. These criteria cover essential product features, technical capabilities, business factors, and compliance considerations. You can refine these criteria using the chat or manually add/remove items as needed.`,
        timestamp: new Date()
      };

      return {
        criteria: aiCriteria,
        message: successMessage
      };
    } catch (error) {
      console.error('AI criteria generation failed:', error);

      // Use fallback criteria
      const fallbackCriteria = createFallbackCriteria(request);

      // Create fallback message
      const fallbackMessage: ChatMessage = {
        id: '2',
        role: 'assistant',
        content: `I couldn't generate AI-powered criteria. I've provided 20 standard criteria for ${request.category} solutions instead. You can still use the chat to refine these criteria or ask for suggestions.`,
        timestamp: new Date()
      };

      return {
        criteria: fallbackCriteria,
        message: fallbackMessage
      };
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generate fallback criteria
   * Public accessor for fallback criteria generation
   *
   * @param request - Tech request data
   * @returns Array of fallback criteria
   */
  const generateFallbackCriteria = (request: TechRequest): Criteria[] => {
    return createFallbackCriteria(request);
  };

  return {
    isGenerating,
    generateInitialCriteria,
    generateFallbackCriteria
  };
};
