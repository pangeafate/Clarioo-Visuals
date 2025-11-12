/**
 * UNIT TESTS: useVendorDiscovery hook
 *
 * Purpose: Test AI-powered vendor discovery logic
 *
 * Coverage:
 * - discoverVendors: AI vendor discovery with fallback
 * - Requirement extraction from description
 * - Data mapping to/from AI service format
 * - Error handling and fallback behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVendorDiscovery } from '@/hooks/useVendorDiscovery';
import type { Criteria, TechRequest } from '@/hooks/useVendorDiscovery';
import * as aiService from '@/services/mock/aiService';

// Mock AI service
vi.mock('@/services/mock/aiService', () => ({
  discoverVendors: vi.fn()
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useVendorDiscovery', () => {
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
    description: 'Need mobile app and REST API support',
    requirements: ['mobile app', 'API']
  };

  const mockAIVendors: aiService.Vendor[] = [
    {
      id: 'ai-vendor-1',
      name: 'AI Discovered Vendor A',
      description: 'Top CRM solution',
      category: 'CRM Software',
      website: 'ai-vendor-a.com',
      logo_url: '',
      match_score: 85,
      pricing: '$60/month',
      pros: ['Great mobile app', 'Strong API'],
      cons: ['Expensive']
    },
    {
      id: 'ai-vendor-2',
      name: 'AI Discovered Vendor B',
      description: 'Affordable CRM',
      category: 'CRM Software',
      website: 'ai-vendor-b.com',
      logo_url: '',
      match_score: 72,
      pricing: '$30/month',
      pros: ['Budget-friendly', 'Easy to use'],
      cons: ['Limited features']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('discoverVendors', () => {
    it('should call AI service with correct parameters', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      await result.current.discoverVendors(mockTechRequest, mockCriteria, 10);

      expect(aiService.discoverVendors).toHaveBeenCalledWith(
        'CRM Software',
        ['mobile app', 'API'],
        expect.arrayContaining([
          expect.objectContaining({
            id: 'crit-1',
            name: 'Mobile Support',
            importance: 'high'
          })
        ]),
        10
      );
    });

    it('should map AI vendors to component format', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      expect(vendors).toHaveLength(2);
      expect(vendors[0]).toMatchObject({
        id: 'ai-vendor-1',
        name: 'AI Discovered Vendor A',
        description: 'Top CRM solution',
        website: 'ai-vendor-a.com',
        pricing: '$60/month',
        rating: 4.25, // 85/20 = 4.25
        features: ['Great mobile app', 'Strong API']
      });
      expect(vendors[0].criteriaScores).toEqual({});
      expect(vendors[0].criteriaAnswers).toEqual({});
    });

    it('should convert match_score to 0-5 rating scale', async () => {
      const vendors = [
        { ...mockAIVendors[0], match_score: 100 }, // Should be 5.0
        { ...mockAIVendors[1], match_score: 60 },  // Should be 3.0
        { ...mockAIVendors[1], match_score: 0 }    // Should be 0.0
      ];

      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: vendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const discoveredVendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      expect(discoveredVendors[0].rating).toBe(5.0);
      expect(discoveredVendors[1].rating).toBe(3.0);
      expect(discoveredVendors[2].rating).toBe(0.0);
    });

    it('should use pros as initial features', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      expect(vendors[0].features).toEqual(['Great mobile app', 'Strong API']);
      expect(vendors[1].features).toEqual(['Budget-friendly', 'Easy to use']);
    });

    it('should set default pricing when missing', async () => {
      const vendorsNoPricing = mockAIVendors.map(v => ({ ...v, pricing: undefined }));

      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: vendorsNoPricing,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      vendors.forEach(vendor => {
        expect(vendor.pricing).toBe('Contact for pricing');
      });
    });

    it('should extract requirements from description if not provided', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const requestNoRequirements: TechRequest = {
        category: 'CRM Software',
        description: 'Need mobile app integration analytics support'
      };

      const { result } = renderHook(() => useVendorDiscovery());

      await result.current.discoverVendors(requestNoRequirements, mockCriteria, 10);

      const call = (aiService.discoverVendors as any).mock.calls[0];
      const requirements = call[1];

      // Should extract words longer than 3 characters
      expect(requirements).toContain('need');
      expect(requirements).toContain('mobile');
      expect(requirements).toContain('integration');
      expect(requirements).toContain('analytics');
      expect(requirements).toContain('support');
    });

    it('should use provided requirements over description extraction', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      await result.current.discoverVendors(mockTechRequest, mockCriteria, 10);

      const call = (aiService.discoverVendors as any).mock.calls[0];
      const requirements = call[1];

      // Should use explicit requirements, not extract from description
      expect(requirements).toEqual(['mobile app', 'API']);
    });

    it('should respect maxVendors limit', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      await result.current.discoverVendors(mockTechRequest, mockCriteria, 5);

      expect(aiService.discoverVendors).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.any(Array),
        5
      );
    });

    it('should default to 10 vendors if maxVendors not provided', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: mockAIVendors,
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      await result.current.discoverVendors(mockTechRequest, mockCriteria);

      expect(aiService.discoverVendors).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.any(Array),
        10
      );
    });

    it('should set loading state during discovery', async () => {
      (aiService.discoverVendors as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({ data: mockAIVendors, error: null }), 100))
      );

      const { result } = renderHook(() => useVendorDiscovery());

      expect(result.current.isDiscovering).toBe(false);

      const promise = result.current.discoverVendors(mockTechRequest, mockCriteria, 10);

      await waitFor(() => expect(result.current.isDiscovering).toBe(true));

      await promise;

      await waitFor(() => expect(result.current.isDiscovering).toBe(false));
    });
  });

  describe('fallback behavior', () => {
    it('should fall back to mock vendors on AI error', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI service unavailable' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      // Should return fallback vendors
      expect(vendors.length).toBeGreaterThan(0);
      vendors.forEach(vendor => {
        expect(vendor.id).toBeDefined();
        expect(vendor.name).toContain(mockTechRequest.category);
        expect(vendor.description).toBeDefined();
        expect(vendor.website).toBeDefined();
      });
    });

    it('should fall back when AI returns empty array', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: [],
        error: null
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      expect(vendors.length).toBeGreaterThan(0);
    });

    it('should respect maxVendors when using fallback', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI failed' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        3
      );

      expect(vendors.length).toBeLessThanOrEqual(3);
    });

    it('should generate category-specific fallback vendors', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI failed' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        5
      );

      vendors.forEach(vendor => {
        expect(vendor.name).toContain('CRM Software');
        expect(vendor.description.toLowerCase()).toContain('crm');
      });
    });

    it('should include realistic features in fallback vendors', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI failed' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        5
      );

      vendors.forEach(vendor => {
        expect(vendor.features).toBeDefined();
        expect(vendor.features.length).toBeGreaterThan(0);
        vendor.features.forEach(feature => {
          expect(typeof feature).toBe('string');
          expect(feature.length).toBeGreaterThan(0);
        });
      });
    });

    it('should set realistic ratings in fallback vendors', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI failed' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        5
      );

      vendors.forEach(vendor => {
        expect(vendor.rating).toBeGreaterThanOrEqual(3.5);
        expect(vendor.rating).toBeLessThanOrEqual(5.0);
      });
    });

    it('should initialize empty criteriaScores in fallback', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'AI failed' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        5
      );

      vendors.forEach(vendor => {
        expect(vendor.criteriaScores).toEqual({});
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      (aiService.discoverVendors as any).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      // Should fall back and return vendors
      expect(vendors.length).toBeGreaterThan(0);
    });

    it('should handle AI service timeout', async () => {
      (aiService.discoverVendors as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'Request timeout' }
      });

      const { result } = renderHook(() => useVendorDiscovery());

      const vendors = await result.current.discoverVendors(
        mockTechRequest,
        mockCriteria,
        10
      );

      expect(vendors.length).toBeGreaterThan(0);
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (aiService.discoverVendors as any).mockRejectedValueOnce(
        new Error('Test error')
      );

      const { result } = renderHook(() => useVendorDiscovery());

      await result.current.discoverVendors(mockTechRequest, mockCriteria, 10);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Vendor discovery failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
