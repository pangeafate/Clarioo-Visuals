/**
 * UNIT TESTS: exportHelpers utility
 *
 * Purpose: Test Excel and CSV export functions
 *
 * Coverage:
 * - exportToExcel: Multiple sheets, data transformation, filename generation
 * - exportToCSV: Simple CSV format, data transformation
 * - generateExportFilename: Filename formatting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import {
  exportToExcel,
  exportToCSV,
  generateExportFilename,
  type Vendor,
  type Criteria,
  type TechRequest
} from '@/utils/exportHelpers';

// Mock XLSX library
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn()
  },
  writeFile: vi.fn()
}));

// Mock DOM APIs for CSV download
const createElementSpy = vi.fn();
const createObjectURLSpy = vi.fn();
const revokeObjectURLSpy = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock document.createElement
  global.document.createElement = vi.fn((tag: string) => {
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        click: vi.fn()
      } as any;
    }
    return {} as any;
  });

  // Mock URL APIs
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock Blob
  global.Blob = vi.fn() as any;
});

describe('exportHelpers', () => {
  const mockVendors: Vendor[] = [
    {
      id: 'vendor-1',
      name: 'Test Vendor A',
      description: 'Leading CRM solution',
      website: 'test-vendor-a.com',
      pricing: '$50/month',
      rating: 4.5,
      criteriaScores: {
        'crit-1': 4.5,
        'crit-2': 4.0
      },
      criteriaAnswers: {
        'crit-1': {
          yesNo: 'yes',
          comment: 'Excellent mobile support'
        },
        'crit-2': {
          yesNo: 'partial',
          comment: 'Good API but limited'
        }
      },
      features: ['Mobile App', 'API Integration', 'Analytics']
    },
    {
      id: 'vendor-2',
      name: 'Test Vendor B',
      description: 'Enterprise CRM platform',
      website: 'test-vendor-b.com',
      pricing: 'Contact for pricing',
      rating: 4.2,
      criteriaScores: {
        'crit-1': 3.5,
        'crit-2': 4.5
      },
      features: ['Cloud-based', 'Custom Workflows']
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
    description: 'Need mobile and API support'
  };

  const mockCalculateScore = (vendor: Vendor): number => {
    const scores = Object.values(vendor.criteriaScores);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  describe('exportToExcel', () => {
    it('should create workbook with all sheets', () => {
      const result = exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(4); // 4 sheets
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(4);
      expect(XLSX.writeFile).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should generate correct comparison data', () => {
      exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const comparisonCall = (XLSX.utils.json_to_sheet as any).mock.calls[0][0];

      expect(comparisonCall).toHaveLength(2); // 2 vendors
      expect(comparisonCall[0]).toMatchObject({
        'Vendor Name': 'Test Vendor A',
        'Description': 'Leading CRM solution',
        'Website': 'test-vendor-a.com',
        'Pricing': '$50/month',
        'Rating': 4.5
      });
      expect(comparisonCall[0]['Overall Score']).toBeDefined();
      expect(comparisonCall[0]['Mobile Support']).toBe('4.5');
      expect(comparisonCall[0]['API Integration']).toBe('4.0');
    });

    it('should generate correct criteria data', () => {
      exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const criteriaCall = (XLSX.utils.json_to_sheet as any).mock.calls[1][0];

      expect(criteriaCall).toHaveLength(2);
      expect(criteriaCall[0]).toEqual({
        'Criteria': 'Mobile Support',
        'Type': 'feature',
        'Importance': 'high'
      });
    });

    it('should generate correct features data', () => {
      exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const featuresCall = (XLSX.utils.json_to_sheet as any).mock.calls[2][0];

      expect(featuresCall.length).toBeGreaterThan(0);
      expect(featuresCall[0]).toMatchObject({
        'Vendor': 'Test Vendor A',
        'Feature': 'Mobile App'
      });
    });

    it('should generate correct assessment data', () => {
      exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const assessmentCall = (XLSX.utils.json_to_sheet as any).mock.calls[3][0];

      expect(assessmentCall).toHaveLength(4); // 2 vendors × 2 criteria
      expect(assessmentCall[0]).toMatchObject({
        'Vendor': 'Test Vendor A',
        'Criteria': 'Mobile Support',
        'Score': '4.5',
        'Assessment': 'yes',
        'Comment': 'Excellent mobile support'
      });
    });

    it('should generate correct filename', () => {
      const result = exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(result.filename).toMatch(/^vendor-comparison-crm-software-\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should handle missing criteria answers', () => {
      const vendorsNoAnswers = mockVendors.map(v => ({ ...v, criteriaAnswers: undefined }));

      const result = exportToExcel(
        vendorsNoAnswers,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(result.success).toBe(true);

      const assessmentCall = (XLSX.utils.json_to_sheet as any).mock.calls[3][0];
      expect(assessmentCall[0]['Assessment']).toBe('N/A');
      expect(assessmentCall[0]['Comment']).toBe('No comment available');
    });

    it('should handle export errors', () => {
      (XLSX.writeFile as any).mockImplementationOnce(() => {
        throw new Error('Export failed');
      });

      const result = exportToExcel(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Export failed');
    });
  });

  describe('exportToCSV', () => {
    it('should create CSV with correct structure', () => {
      const result = exportToCSV(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(global.Blob).toHaveBeenCalledWith(
        expect.any(Array),
        { type: 'text/csv' }
      );
      expect(result.success).toBe(true);
    });

    it('should generate correct CSV headers', () => {
      exportToCSV(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const csvContent = (global.Blob as any).mock.calls[0][0][0];
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');

      expect(headers).toEqual([
        'Vendor',
        'Rating',
        'Overall Score',
        'Pricing',
        'Website',
        'Mobile Support',
        'API Integration'
      ]);
    });

    it('should generate correct CSV data rows', () => {
      exportToCSV(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const csvContent = (global.Blob as any).mock.calls[0][0][0];
      const lines = csvContent.split('\n');
      const firstDataRow = lines[1].split(',');

      expect(firstDataRow[0]).toBe('Test Vendor A');
      expect(firstDataRow[1]).toBe('4.5');
      expect(firstDataRow[3]).toBe('$50/month');
      expect(firstDataRow[5]).toBe('4.5'); // Mobile Support score
      expect(firstDataRow[6]).toBe('4.0'); // API Integration score
    });

    it('should trigger download', () => {
      exportToCSV(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      const mockAnchor = (global.document.createElement as any).mock.results[0].value;
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should generate correct filename', () => {
      const result = exportToCSV(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(result.filename).toBe('vendor-comparison-crm-software.csv');
    });

    it('should handle missing criteria scores', () => {
      const vendorsPartialScores: Vendor[] = [{
        ...mockVendors[0],
        criteriaScores: { 'crit-1': 4.0 } // Missing crit-2
      }];

      const result = exportToCSV(
        vendorsPartialScores,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(result.success).toBe(true);

      const csvContent = (global.Blob as any).mock.calls[0][0][0];
      const lines = csvContent.split('\n');
      const dataRow = lines[1].split(',');

      expect(dataRow[6]).toBe('N/A'); // Missing score
    });

    it('should handle export errors', () => {
      // Mock Blob constructor to throw error
      const OriginalBlob = global.Blob;
      (global as any).Blob = class {
        constructor() {
          throw new Error('Blob creation failed');
        }
      };

      const result = exportToCSV(
        mockVendors,
        mockCriteria,
        mockTechRequest,
        mockCalculateScore
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Blob creation failed');

      // Restore original Blob
      global.Blob = OriginalBlob;
    });
  });

  describe('generateExportFilename', () => {
    it('should generate Excel filename correctly', () => {
      const filename = generateExportFilename(mockTechRequest, 'excel');

      expect(filename).toMatch(/^vendor-comparison-crm-software-\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should generate CSV filename correctly', () => {
      const filename = generateExportFilename(mockTechRequest, 'csv');

      expect(filename).toMatch(/^vendor-comparison-crm-software-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should handle category with multiple spaces', () => {
      const request: TechRequest = {
        category: 'Customer   Relationship   Management'
      };

      const filename = generateExportFilename(request, 'excel');

      expect(filename).toContain('customer-relationship-management');
    });

    it('should convert category to lowercase', () => {
      const request: TechRequest = {
        category: 'CRM Software'
      };

      const filename = generateExportFilename(request, 'excel');

      expect(filename).toContain('crm-software');
      expect(filename).not.toContain('CRM');
    });

    it('should include current date', () => {
      const filename = generateExportFilename(mockTechRequest, 'excel');
      const today = new Date().toISOString().split('T')[0];

      expect(filename).toContain(today);
    });
  });
});
