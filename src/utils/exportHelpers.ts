/**
 * 📊 EXPORT HELPERS UTILITY
 *
 * Purpose: Provides utility functions for exporting vendor comparison data
 * to various formats (Excel, CSV).
 *
 * Features:
 * - Excel export with multiple sheets (comparison, criteria, features, assessment)
 * - CSV export for simple data transfer
 * - Pure functions with no side effects
 * - Comprehensive data transformation
 * - Automatic filename generation
 *
 * Dependencies:
 * - xlsx library for Excel generation
 *
 * @module utils/exportHelpers
 */

import * as XLSX from 'xlsx';

/**
 * Vendor structure for export
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
 * Criteria structure for export context
 */
export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}

/**
 * Tech request for export metadata
 */
export interface TechRequest {
  category: string;
  description?: string;
}

/**
 * Export result structure
 */
export interface ExportResult {
  success: boolean;
  filename: string;
  error?: string;
}

/**
 * Export vendor comparison data to Excel format
 *
 * Purpose: Creates comprehensive Excel workbook with multiple sheets
 * containing vendor comparison, criteria, features, and detailed assessment.
 *
 * @param vendors - Vendors to export
 * @param criteria - Evaluation criteria
 * @param techRequest - Tech request for context
 * @param calculateOverallScore - Function to calculate overall vendor score
 * @returns Export result with success status and filename
 *
 * @example
 * ```typescript
 * const result = exportToExcel(
 *   vendors,
 *   criteria,
 *   { category: 'CRM Software' },
 *   calculateOverallScore
 * );
 * console.log(result.success ? 'Exported!' : result.error);
 * ```
 *
 * @remarks
 * **Sheet 1: Vendor Comparison**
 * - Vendor name, description, website, pricing, rating, overall score
 * - Individual criteria scores for each vendor
 *
 * **Sheet 2: Evaluation Criteria**
 * - Criteria name, type, importance level
 *
 * **Sheet 3: Vendor Features** (if available)
 * - Vendor name and associated features
 *
 * **Sheet 4: Detailed Assessment** (if criteria answers available)
 * - Vendor name, criteria name, score, yes/no/partial assessment, comments
 *
 * - Filename format: `vendor-comparison-{category}-{date}.xlsx`
 * - Downloads file automatically via browser API
 * - Pure function, but has browser side effect (file download)
 */
export const exportToExcel = (
  vendors: Vendor[],
  criteria: Criteria[],
  techRequest: TechRequest,
  calculateOverallScore: (vendor: Vendor) => number
): ExportResult => {
  try {
    // Create main comparison data
    const comparisonData = vendors.map(vendor => {
      const row: any = {
        'Vendor Name': vendor.name,
        'Description': vendor.description,
        'Website': vendor.website,
        'Pricing': vendor.pricing,
        'Rating': vendor.rating,
        'Overall Score': calculateOverallScore(vendor).toFixed(2)
      };

      // Add criteria scores
      criteria.forEach(criterion => {
        row[criterion.name] = vendor.criteriaScores[criterion.id]?.toFixed(1) || 'N/A';
      });

      return row;
    });

    // Create detailed criteria sheet
    const criteriaData = criteria.map(criterion => ({
      'Criteria': criterion.name,
      'Type': criterion.type,
      'Importance': criterion.importance
    }));

    // Create vendor features sheet
    const featuresData: Array<{ Vendor: string; Feature: string }> = [];
    vendors.forEach(vendor => {
      vendor.features.forEach(feature => {
        featuresData.push({
          'Vendor': vendor.name,
          'Feature': feature
        });
      });
    });

    // Create detailed assessment sheet
    const assessmentData: Array<{
      Vendor: string;
      Criteria: string;
      Score: string;
      Assessment: string;
      Comment: string;
    }> = [];

    vendors.forEach(vendor => {
      criteria.forEach(criterion => {
        const answer = vendor.criteriaAnswers?.[criterion.id];
        assessmentData.push({
          'Vendor': vendor.name,
          'Criteria': criterion.name,
          'Score': vendor.criteriaScores[criterion.id]?.toFixed(1) || 'N/A',
          'Assessment': answer?.yesNo || 'N/A',
          'Comment': answer?.comment || 'No comment available'
        });
      });
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add comparison sheet
    const comparisonSheet = XLSX.utils.json_to_sheet(comparisonData);
    XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Vendor Comparison');

    // Add criteria sheet
    const criteriaSheet = XLSX.utils.json_to_sheet(criteriaData);
    XLSX.utils.book_append_sheet(workbook, criteriaSheet, 'Evaluation Criteria');

    // Add features sheet (if there are features)
    if (featuresData.length > 0) {
      const featuresSheet = XLSX.utils.json_to_sheet(featuresData);
      XLSX.utils.book_append_sheet(workbook, featuresSheet, 'Vendor Features');
    }

    // Add detailed assessment sheet (if there are answers)
    if (assessmentData.length > 0) {
      const assessmentSheet = XLSX.utils.json_to_sheet(assessmentData);
      XLSX.utils.book_append_sheet(workbook, assessmentSheet, 'Detailed Assessment');
    }

    // Generate filename
    const filename = `vendor-comparison-${techRequest.category.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('Excel export failed:', error);
    return {
      success: false,
      filename: '',
      error: error instanceof Error ? error.message : 'Failed to export to Excel'
    };
  }
};

/**
 * Export vendor comparison data to CSV format
 *
 * Purpose: Creates simple CSV file with vendor comparison data
 * for easy import into spreadsheet applications.
 *
 * @param vendors - Vendors to export
 * @param criteria - Evaluation criteria
 * @param techRequest - Tech request for filename
 * @param calculateOverallScore - Function to calculate overall vendor score
 * @returns Export result with success status and filename
 *
 * @example
 * ```typescript
 * const result = exportToCSV(
 *   vendors,
 *   criteria,
 *   { category: 'CRM Software' },
 *   calculateOverallScore
 * );
 * console.log(result.success ? 'Exported!' : result.error);
 * ```
 *
 * @remarks
 * **CSV Structure**:
 * - Header row: Vendor, Rating, Overall Score, Pricing, Website, [Criteria Names...]
 * - Data rows: One per vendor with all scores
 *
 * - Filename format: `vendor-comparison-{category}.csv`
 * - Downloads file automatically via browser API
 * - Pure function, but has browser side effect (file download)
 * - Simpler format than Excel, single sheet equivalent
 */
export const exportToCSV = (
  vendors: Vendor[],
  criteria: Criteria[],
  techRequest: TechRequest,
  calculateOverallScore: (vendor: Vendor) => number
): ExportResult => {
  try {
    // Create CSV header
    const headers = [
      'Vendor',
      'Rating',
      'Overall Score',
      'Pricing',
      'Website',
      ...criteria.map(c => c.name)
    ];

    // Create CSV rows
    const rows = vendors.map(vendor => [
      vendor.name,
      vendor.rating.toString(),
      calculateOverallScore(vendor).toFixed(1),
      vendor.pricing,
      vendor.website,
      ...criteria.map(c => vendor.criteriaScores[c.id]?.toFixed(1) || 'N/A')
    ]);

    // Combine header and rows
    const csvContent = [
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = `vendor-comparison-${techRequest.category.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('CSV export failed:', error);
    return {
      success: false,
      filename: '',
      error: error instanceof Error ? error.message : 'Failed to export to CSV'
    };
  }
};

/**
 * Generate export filename
 *
 * Purpose: Creates consistent filename for exports based on
 * category and current date.
 *
 * @param techRequest - Tech request with category
 * @param format - File format (excel, csv)
 * @returns Formatted filename
 *
 * @example
 * ```typescript
 * const filename = generateExportFilename(
 *   { category: 'CRM Software' },
 *   'excel'
 * );
 * // Returns: "vendor-comparison-crm-software-2024-01-15.xlsx"
 * ```
 *
 * @remarks
 * - Converts category to lowercase kebab-case
 * - Includes ISO date (YYYY-MM-DD)
 * - Pure function, deterministic for same inputs
 */
export const generateExportFilename = (
  techRequest: TechRequest,
  format: 'excel' | 'csv'
): string => {
  const category = techRequest.category.replace(/\s+/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'excel' ? 'xlsx' : 'csv';

  return `vendor-comparison-${category}-${date}.${extension}`;
};
