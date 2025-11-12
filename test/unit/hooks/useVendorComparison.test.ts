/**
 * UNIT TESTS: useVendorComparison hook
 *
 * Purpose: Test vendor comparison business logic
 *
 * Coverage:
 * - calculateOverallScore: Weighted scoring calculation
 * - generateFallbackScores: Fallback scoring algorithm
 * - generateDetailedComparison: AI-powered comparison (with fallback)
 * - generateStrategicComparison: Strategic analysis generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVendorComparison } from '@/hooks/useVendorComparison';
import type { Vendor, Criteria, TechRequest } from '@/hooks/useVendorComparison';
import * as aiService from '@/services/mock/aiService';

// Mock AI service
vi.mock('@/services/mock/aiService', () => ({
  compareVendors: vi.fn(),
  chat: vi.fn()
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useVendorComparison', () => {
  const mockVendors: Vendor[] = [
    {
      id: 'vendor-1',
      name: 'Test Vendor A',
      description: 'Leading solution',
      website: 'vendor-a.com',
      pricing: '$50/month',
      rating: 4.5,
      criteriaScores: {
        'crit-1': 4.5,
        'crit-2': 4.0,
        'crit-3': 3.5
      },
      features: ['Feature 1', 'Feature 2']
    },
    {
      id: 'vendor-2',
      name: 'Test Vendor B',
      description: 'Enterprise platform',
      website: 'vendor-b.com',
      pricing: 'Contact',
      rating: 4.0,
      criteriaScores: {
        'crit-1': 3.5,
        'crit-2': 4.5,
        'crit-3': 4.0
      },
      features: ['Feature A', 'Feature B']
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
    },
    {
      id: 'crit-3',
      name: 'Documentation',
      importance: 'low',
      type: 'support'
    }
  ];

  const mockTechRequest: TechRequest = {
    category: 'CRM Software',
    description: 'Need mobile and API support'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateOverallScore', () => {
    it('should calculate weighted score correctly', () => {
      const { result } = renderHook(() => useVendorComparison());

      const score = result.current.calculateOverallScore(mockVendors[0], mockCriteria);

      // Expected: (4.5*3 + 4.0*2 + 3.5*1) / (3+2+1) = (13.5 + 8 + 3.5) / 6 = 25 / 6 ≈ 4.17
      expect(score).toBeCloseTo(4.17, 2);
    });

    it('should weight high importance criteria more', () => {
      const { result } = renderHook(() => useVendorComparison());

      // Vendor that excels in HIGH importance criteria
      const vendorHighImportanceFocus: Vendor = {
        ...mockVendors[0],
        criteriaScores: {
          'crit-1': 5.0, // high importance (weight 3) = 15
          'crit-2': 3.0, // medium (weight 2) = 6
          'crit-3': 1.0  // low (weight 1) = 1
        }
      };

      // Vendor that excels in LOW importance criteria
      const vendorLowImportanceFocus: Vendor = {
        ...mockVendors[1],
        criteriaScores: {
          'crit-1': 1.0, // high importance (weight 3) = 3
          'crit-2': 5.0, // medium (weight 2) = 10
          'crit-3': 5.0  // low (weight 1) = 5
        }
      };

      const highImportanceScore = result.current.calculateOverallScore(vendorHighImportanceFocus, mockCriteria);
      const lowImportanceScore = result.current.calculateOverallScore(vendorLowImportanceFocus, mockCriteria);

      // Expected highImportanceScore: (5.0*3 + 3.0*2 + 1.0*1) / 6 = 22/6 ≈ 3.67
      // Expected lowImportanceScore: (1.0*3 + 5.0*2 + 5.0*1) / 6 = 18/6 = 3.0

      // Vendor with higher score on high-importance criterion should score better overall
      expect(highImportanceScore).toBeGreaterThan(lowImportanceScore);
      expect(highImportanceScore).toBeCloseTo(3.67, 2);
      expect(lowImportanceScore).toBe(3.0);
    });

    it('should handle empty criteria scores', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorNoScores: Vendor = {
        ...mockVendors[0],
        criteriaScores: {}
      };

      const score = result.current.calculateOverallScore(vendorNoScores, mockCriteria);

      expect(score).toBe(0);
    });

    it('should handle missing criteria', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorPartialScores: Vendor = {
        ...mockVendors[0],
        criteriaScores: {
          'crit-1': 4.0
          // Missing crit-2 and crit-3
        }
      };

      const score = result.current.calculateOverallScore(vendorPartialScores, mockCriteria);

      // Should only count crit-1: 4.0*3 / (3+2+1) = 12/6 = 2.0
      expect(score).toBeCloseTo(2.0, 2);
    });
  });

  describe('generateFallbackScores', () => {
    it('should generate scores for all criteria', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorsNoScores = mockVendors.map(v => ({ ...v, criteriaScores: {} }));
      const scoredVendors = result.current.generateFallbackScores(vendorsNoScores, mockCriteria);

      scoredVendors.forEach(vendor => {
        expect(Object.keys(vendor.criteriaScores)).toHaveLength(3);
        mockCriteria.forEach(criterion => {
          expect(vendor.criteriaScores[criterion.id]).toBeDefined();
          expect(vendor.criteriaScores[criterion.id]).toBeGreaterThanOrEqual(1);
          expect(vendor.criteriaScores[criterion.id]).toBeLessThanOrEqual(5);
        });
      });
    });

    it('should generate criteria answers', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorsNoScores = mockVendors.map(v => ({ ...v, criteriaScores: {} }));
      const scoredVendors = result.current.generateFallbackScores(vendorsNoScores, mockCriteria);

      scoredVendors.forEach(vendor => {
        expect(vendor.criteriaAnswers).toBeDefined();
        mockCriteria.forEach(criterion => {
          const answer = vendor.criteriaAnswers?.[criterion.id];
          expect(answer).toBeDefined();
          expect(['yes', 'no', 'partial']).toContain(answer?.yesNo);
          expect(answer?.comment).toBeTruthy();
        });
      });
    });

    it('should map high scores to "yes" answers', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorNoScores: Vendor = {
        ...mockVendors[0],
        criteriaScores: {}
      };

      // generateFallbackScores generates random scores, so we test the actual logic
      const [scored] = result.current.generateFallbackScores([vendorNoScores], mockCriteria);

      // Check that answers exist and are valid
      mockCriteria.forEach(criterion => {
        const answer = scored.criteriaAnswers?.[criterion.id];
        expect(answer).toBeDefined();
        expect(['yes', 'no', 'partial']).toContain(answer?.yesNo);

        // Verify the mapping logic: high scores (>= 4.0) -> 'yes'
        const score = scored.criteriaScores[criterion.id];
        if (score >= 4.0) {
          expect(answer?.yesNo).toBe('yes');
        } else if (score >= 2.5) {
          expect(answer?.yesNo).toBe('partial');
        } else {
          expect(answer?.yesNo).toBe('no');
        }
      });
    });

    it('should map scores to correct answer types', () => {
      const { result } = renderHook(() => useVendorComparison());

      // Test with vendors that have no scores to trigger fallback generation
      const vendorsNoScores = mockVendors.map(v => ({ ...v, criteriaScores: {} }));
      const scoredVendors = result.current.generateFallbackScores(vendorsNoScores, mockCriteria);

      // Verify each vendor's answers match their scores
      scoredVendors.forEach(vendor => {
        mockCriteria.forEach(criterion => {
          const score = vendor.criteriaScores[criterion.id];
          const answer = vendor.criteriaAnswers?.[criterion.id];

          expect(answer).toBeDefined();

          // Verify the mapping is consistent
          if (score >= 4.0) {
            expect(answer?.yesNo).toBe('yes');
          } else if (score >= 2.5) {
            expect(answer?.yesNo).toBe('partial');
          } else {
            expect(answer?.yesNo).toBe('no');
          }
        });
      });
    });

    it('should include comments for all answers', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorsNoScores = mockVendors.map(v => ({ ...v, criteriaScores: {} }));
      const scoredVendors = result.current.generateFallbackScores(vendorsNoScores, mockCriteria);

      // Verify each answer has a comment
      scoredVendors.forEach(vendor => {
        mockCriteria.forEach(criterion => {
          const answer = vendor.criteriaAnswers?.[criterion.id];

          expect(answer).toBeDefined();
          expect(answer?.comment).toBeDefined();
          expect(answer?.comment.length).toBeGreaterThan(0);
        });
      });
    });

    it('should generate features if missing', () => {
      const { result } = renderHook(() => useVendorComparison());

      const vendorsNoFeatures = mockVendors.map(v => ({ ...v, features: [] }));
      const scoredVendors = result.current.generateFallbackScores(vendorsNoFeatures, mockCriteria);

      scoredVendors.forEach(vendor => {
        expect(vendor.features).toBeDefined();
        expect(vendor.features.length).toBeGreaterThan(0);
      });
    });

    it('should preserve existing features', () => {
      const { result } = renderHook(() => useVendorComparison());

      const scoredVendors = result.current.generateFallbackScores(mockVendors, mockCriteria);

      expect(scoredVendors[0].features).toEqual(['Feature 1', 'Feature 2']);
      expect(scoredVendors[1].features).toEqual(['Feature A', 'Feature B']);
    });
  });

  describe('generateDetailedComparison', () => {
    it('should call AI service with correct data', async () => {
      const mockComparison = [
        {
          vendorId: 'vendor-1',
          scores: { 'crit-1': 4.5, 'crit-2': 4.0, 'crit-3': 3.5 },
          criteriaAnswers: {
            'crit-1': { yesNo: 'yes' as const, comment: 'Great' }
          },
          features: ['AI Feature']
        }
      ];

      (aiService.compareVendors as any).mockResolvedValueOnce({
        data: mockComparison,
        error: null
      });

      const { result } = renderHook(() => useVendorComparison());

      const vendors = await result.current.generateDetailedComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      expect(aiService.compareVendors).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'vendor-1',
            name: 'Test Vendor A'
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

    it('should return AI-scored vendors on success', async () => {
      const mockComparison = [
        {
          vendorId: 'vendor-1',
          scores: { 'crit-1': 5.0, 'crit-2': 4.5, 'crit-3': 4.0 },
          criteriaAnswers: {
            'crit-1': { yesNo: 'yes' as const, comment: 'Excellent mobile support' }
          },
          features: ['Mobile App', 'Offline Mode']
        },
        {
          vendorId: 'vendor-2',
          scores: { 'crit-1': 4.0, 'crit-2': 5.0, 'crit-3': 4.5 },
          criteriaAnswers: {
            'crit-1': { yesNo: 'partial' as const, comment: 'Good API coverage' }
          },
          features: ['REST API', 'GraphQL']
        }
      ];

      (aiService.compareVendors as any).mockResolvedValueOnce({
        data: mockComparison,
        error: null
      });

      const { result } = renderHook(() => useVendorComparison());

      const vendors = await result.current.generateDetailedComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      expect(vendors[0].criteriaScores).toEqual({ 'crit-1': 5.0, 'crit-2': 4.5, 'crit-3': 4.0 });
      expect(vendors[0].features).toEqual(['Mobile App', 'Offline Mode']);
      expect(vendors[1].criteriaScores).toEqual({ 'crit-1': 4.0, 'crit-2': 5.0, 'crit-3': 4.5 });
    });

    it('should fall back to algorithmic scoring on AI failure', async () => {
      (aiService.compareVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI service unavailable' }
      });

      const { result } = renderHook(() => useVendorComparison());

      const vendorsNoScores = mockVendors.map(v => ({ ...v, criteriaScores: {} }));
      const vendors = await result.current.generateDetailedComparison(
        vendorsNoScores,
        mockCriteria,
        mockTechRequest
      );

      // Should have fallback scores
      vendors.forEach(vendor => {
        expect(Object.keys(vendor.criteriaScores)).toHaveLength(3);
        mockCriteria.forEach(criterion => {
          expect(vendor.criteriaScores[criterion.id]).toBeDefined();
        });
      });
    });

    it('should set loading state during generation', async () => {
      (aiService.compareVendors as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: [], error: null }), 100))
      );

      const { result } = renderHook(() => useVendorComparison());

      expect(result.current.isGenerating).toBe(false);

      const promise = result.current.generateDetailedComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      await waitFor(() => expect(result.current.isGenerating).toBe(true));

      await promise;

      await waitFor(() => expect(result.current.isGenerating).toBe(false));
    });
  });

  describe('generateStrategicComparison', () => {
    it('should call AI chat with strategic prompt', async () => {
      (aiService.chat as any).mockResolvedValueOnce({
        data: 'Strategic analysis here',
        error: null
      });

      const { result } = renderHook(() => useVendorComparison());

      await result.current.generateStrategicComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      expect(aiService.chat).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('vendor comparison')
          })
        ]),
        expect.objectContaining({
          systemMessage: expect.stringContaining('technology consultant')
        })
      );
    });

    it('should include vendor summaries in prompt', async () => {
      (aiService.chat as any).mockResolvedValueOnce({
        data: 'Analysis',
        error: null
      });

      const { result } = renderHook(() => useVendorComparison());

      await result.current.generateStrategicComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      const chatCall = (aiService.chat as any).mock.calls[0];
      const prompt = chatCall[0][0].content;

      expect(prompt).toContain('Test Vendor A');
      expect(prompt).toContain('Test Vendor B');
      expect(prompt).toContain('Overall Score');
    });

    it('should return analysis text on success', async () => {
      const mockAnalysis = 'Detailed strategic analysis of vendors...';

      (aiService.chat as any).mockResolvedValueOnce({
        data: mockAnalysis,
        error: null
      });

      const { result } = renderHook(() => useVendorComparison());

      const analysis = await result.current.generateStrategicComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      expect(analysis).toBe(mockAnalysis);
    });

    it('should return null on AI failure', async () => {
      (aiService.chat as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI failed' }
      });

      const { result } = renderHook(() => useVendorComparison());

      const analysis = await result.current.generateStrategicComparison(
        mockVendors,
        mockCriteria,
        mockTechRequest
      );

      expect(analysis).toBeNull();
    });
  });
});
