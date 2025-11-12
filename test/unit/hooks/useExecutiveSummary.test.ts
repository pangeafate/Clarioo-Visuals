/**
 * UNIT TESTS: useExecutiveSummary hook
 *
 * Purpose: Test AI-powered executive summary generation
 *
 * Coverage:
 * - getMarketInsights: Market analysis calculation
 * - generateSummary: AI summary generation
 * - Data transformation and mapping
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useExecutiveSummary } from '@/hooks/useExecutiveSummary';
import type { Vendor, Criteria, TechRequest } from '@/hooks/useExecutiveSummary';
import * as aiService from '@/services/mock/aiService';

// Mock AI service
vi.mock('@/services/mock/aiService', () => ({
  generateExecutiveSummary: vi.fn()
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useExecutiveSummary', () => {
  const mockVendors: Vendor[] = [
    {
      id: 'vendor-1',
      name: 'Premium Vendor',
      description: 'Top-tier solution',
      website: 'premium.com',
      pricing: '$100/month',
      rating: 4.8,
      criteriaScores: {
        'crit-1': 5.0,
        'crit-2': 4.5
      },
      features: ['Advanced Features', 'Premium Support']
    },
    {
      id: 'vendor-2',
      name: 'Mid-tier Vendor',
      description: 'Good value solution',
      website: 'midtier.com',
      pricing: '$50/month',
      rating: 4.2,
      criteriaScores: {
        'crit-1': 4.0,
        'crit-2': 4.0
      },
      features: ['Standard Features']
    },
    {
      id: 'vendor-3',
      name: 'Budget Vendor',
      description: 'Affordable option',
      website: 'budget.com',
      pricing: '$25/month',
      rating: 3.5,
      criteriaScores: {
        'crit-1': 3.0,
        'crit-2': 3.5
      },
      features: ['Basic Features']
    }
  ];

  const mockCriteria: Criteria[] = [
    {
      id: 'crit-1',
      name: 'Mobile Support',
      importance: 'high',
      type: 'feature'
    },
    {
      id: 'crit-2',
      name: 'API Integration',
      importance: 'medium',
      type: 'technical'
    }
  ];

  const mockTechRequest: TechRequest = {
    category: 'CRM Software',
    description: 'Enterprise CRM needs'
  };

  const mockCalculateScore = (vendor: Vendor): number => {
    const scores = Object.values(vendor.criteriaScores);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMarketInsights', () => {
    it('should calculate market maturity correctly', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      // High average rating (>= 4.2) = Mature
      const insights = result.current.getMarketInsights(mockVendors, mockCalculateScore);
      const avgRating = mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.length;

      if (avgRating >= 4.2) {
        expect(insights.marketMaturity).toBe('Mature');
      } else if (avgRating >= 3.8) {
        expect(insights.marketMaturity).toBe('Established');
      } else {
        expect(insights.marketMaturity).toBe('Emerging');
      }
    });

    it('should identify mature market with high ratings', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const matureVendors: Vendor[] = mockVendors.map(v => ({ ...v, rating: 4.5 }));

      const insights = result.current.getMarketInsights(matureVendors, mockCalculateScore);

      expect(insights.marketMaturity).toBe('Mature');
    });

    it('should identify established market with medium ratings', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const establishedVendors: Vendor[] = mockVendors.map(v => ({ ...v, rating: 4.0 }));

      const insights = result.current.getMarketInsights(establishedVendors, mockCalculateScore);

      expect(insights.marketMaturity).toBe('Established');
    });

    it('should identify emerging market with low ratings', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const emergingVendors: Vendor[] = mockVendors.map(v => ({ ...v, rating: 3.5 }));

      const insights = result.current.getMarketInsights(emergingVendors, mockCalculateScore);

      expect(insights.marketMaturity).toBe('Emerging');
    });

    it('should calculate competitiveness correctly', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const insights = result.current.getMarketInsights(mockVendors, mockCalculateScore);

      const topPerformers = mockVendors.filter(v => mockCalculateScore(v) >= 4.0).length;

      if (topPerformers >= 3) {
        expect(insights.competitiveness).toBe('Highly Competitive');
      } else if (topPerformers >= 2) {
        expect(insights.competitiveness).toBe('Competitive');
      } else {
        expect(insights.competitiveness).toBe('Limited Options');
      }
    });

    it('should identify highly competitive market with many top performers', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const competitiveVendors: Vendor[] = mockVendors.map(v => ({
        ...v,
        criteriaScores: { 'crit-1': 4.5, 'crit-2': 4.5 }
      }));

      const insights = result.current.getMarketInsights(competitiveVendors, mockCalculateScore);

      expect(insights.competitiveness).toBe('Highly Competitive');
    });

    it('should identify competitive market with some top performers', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const insights = result.current.getMarketInsights(mockVendors.slice(0, 2), mockCalculateScore);

      const topPerformers = mockVendors.slice(0, 2).filter(v => mockCalculateScore(v) >= 4.0).length;

      if (topPerformers >= 2) {
        expect(insights.competitiveness).toBe('Competitive');
      }
    });

    it('should identify limited options with few top performers', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const limitedVendors: Vendor[] = mockVendors.map(v => ({
        ...v,
        criteriaScores: { 'crit-1': 3.0, 'crit-2': 3.0 }
      }));

      const insights = result.current.getMarketInsights(limitedVendors, mockCalculateScore);

      expect(insights.competitiveness).toBe('Limited Options');
    });

    it('should calculate overall quality correctly', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const insights = result.current.getMarketInsights(mockVendors, mockCalculateScore);

      const avgScore = mockVendors.reduce((sum, v) => sum + mockCalculateScore(v), 0) / mockVendors.length;

      if (avgScore >= 4.0) {
        expect(insights.overallQuality).toBe('Excellent');
      } else if (avgScore >= 3.5) {
        expect(insights.overallQuality).toBe('Good');
      } else {
        expect(insights.overallQuality).toBe('Mixed');
      }
    });

    it('should identify excellent quality with high scores', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const excellentVendors: Vendor[] = mockVendors.map(v => ({
        ...v,
        criteriaScores: { 'crit-1': 4.5, 'crit-2': 4.5 }
      }));

      const insights = result.current.getMarketInsights(excellentVendors, mockCalculateScore);

      expect(insights.overallQuality).toBe('Excellent');
    });

    it('should identify good quality with medium-high scores', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const goodVendors: Vendor[] = mockVendors.map(v => ({
        ...v,
        criteriaScores: { 'crit-1': 3.8, 'crit-2': 3.8 }
      }));

      const insights = result.current.getMarketInsights(goodVendors, mockCalculateScore);

      expect(insights.overallQuality).toBe('Good');
    });

    it('should identify mixed quality with low scores', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const mixedVendors: Vendor[] = mockVendors.map(v => ({
        ...v,
        criteriaScores: { 'crit-1': 3.0, 'crit-2': 3.0 }
      }));

      const insights = result.current.getMarketInsights(mixedVendors, mockCalculateScore);

      expect(insights.overallQuality).toBe('Mixed');
    });

    it('should handle single vendor edge case', () => {
      const { result } = renderHook(() => useExecutiveSummary());

      const insights = result.current.getMarketInsights([mockVendors[0]], mockCalculateScore);

      expect(insights.marketMaturity).toBeDefined();
      expect(insights.competitiveness).toBeDefined();
      expect(insights.overallQuality).toBeDefined();
    });
  });

  describe('generateSummary', () => {
    it('should call AI service with correct data', async () => {
      const mockSummary = 'Executive summary of vendor landscape...';

      (aiService.generateExecutiveSummary as any).mockResolvedValueOnce({
        data: mockSummary,
        error: null
      });

      const { result } = renderHook(() => useExecutiveSummary());

      await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(aiService.generateExecutiveSummary).toHaveBeenCalledWith(
        'CRM Software',
        expect.arrayContaining([
          expect.objectContaining({
            id: 'vendor-1',
            name: 'Premium Vendor',
            match_score: expect.any(Number)
          })
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            id: 'crit-1',
            name: 'Mobile Support'
          })
        ])
      );
    });

    it('should convert vendor ratings to match_score (0-100 scale)', async () => {
      (aiService.generateExecutiveSummary as any).mockResolvedValueOnce({
        data: 'Summary',
        error: null
      });

      const { result } = renderHook(() => useExecutiveSummary());

      const testVendor: Vendor = {
        ...mockVendors[0],
        criteriaScores: { 'crit-1': 5.0, 'crit-2': 5.0 }
      };

      await result.current.generateSummary(
        [testVendor],
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const call = (aiService.generateExecutiveSummary as any).mock.calls[0];
      const mappedVendors = call[1];

      // Overall score 5.0 * 20 = 100
      expect(mappedVendors[0].match_score).toBe(100);
    });

    it('should map vendor features as pros', async () => {
      (aiService.generateExecutiveSummary as any).mockResolvedValueOnce({
        data: 'Summary',
        error: null
      });

      const { result } = renderHook(() => useExecutiveSummary());

      await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const call = (aiService.generateExecutiveSummary as any).mock.calls[0];
      const mappedVendors = call[1];

      expect(mappedVendors[0].pros).toEqual(['Advanced Features', 'Premium Support']);
      expect(mappedVendors[1].pros).toEqual(['Standard Features']);
    });

    it('should return AI-generated summary on success', async () => {
      const mockSummary = 'Comprehensive executive summary with market analysis and recommendations...';

      (aiService.generateExecutiveSummary as any).mockResolvedValueOnce({
        data: mockSummary,
        error: null
      });

      const { result } = renderHook(() => useExecutiveSummary());

      const summary = await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(summary).toBe(mockSummary);
    });

    it('should return null on AI failure', async () => {
      (aiService.generateExecutiveSummary as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI service failed' }
      });

      const { result } = renderHook(() => useExecutiveSummary());

      const summary = await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(summary).toBeNull();
    });

    it('should set loading state during generation', async () => {
      (aiService.generateExecutiveSummary as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: 'Summary', error: null }), 100))
      );

      const { result } = renderHook(() => useExecutiveSummary());

      expect(result.current.isGenerating).toBe(false);

      const promise = result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      await waitFor(() => expect(result.current.isGenerating).toBe(true));

      await promise;

      await waitFor(() => expect(result.current.isGenerating).toBe(false));
    });

    it('should handle empty summary response', async () => {
      (aiService.generateExecutiveSummary as any).mockResolvedValueOnce({
        data: '',
        error: null
      });

      const { result } = renderHook(() => useExecutiveSummary());

      const summary = await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(summary).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (aiService.generateExecutiveSummary as any).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useExecutiveSummary());

      const summary = await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(summary).toBeNull();
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (aiService.generateExecutiveSummary as any).mockRejectedValueOnce(
        new Error('Test error')
      );

      const { result } = renderHook(() => useExecutiveSummary());

      await result.current.generateSummary(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Summary generation failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
