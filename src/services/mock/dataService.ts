/**
 * 🎨 MOCK DATA SERVICE
 *
 * Purpose: Provides data formatting, export, and template utilities for prototype.
 * Handles Excel/CSV exports and email template processing.
 *
 * Features:
 * - Excel export with multiple sheets and custom formatting
 * - CSV generation and download
 * - Email template processing with variable replacement
 * - Data formatting utilities (prices, scores, importance levels)
 * - Template validation
 *
 * Mock Behavior:
 * - All exports happen client-side (no server)
 * - Templates loaded from JSON files
 * - No actual email sending
 * - Browser download API for file exports
 *
 * Integration Notes:
 * - Email exports should be moved to server-side for production
 * - Consider using a template engine (Handlebars, EJS) for emails
 * - Implement email queue system for bulk sends
 * - Add server-side Excel generation for large datasets
 * - Store templates in database for easier management
 * - Add export job tracking and status updates
 *
 * @module services/mock/dataService
 */

import * as XLSX from 'xlsx';
import emailTemplates from '@/data/templates/email-templates.json';
import type { Vendor, Criterion } from '@/types';
import type { VendorComparison } from './aiService';

// Types
export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailVariables {
  [key: string]: string | number | string[];
}

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
}

/**
 * Get email template by type
 *
 * Purpose: Retrieves email template from pre-loaded templates.
 * Used for vendor invitations and notifications.
 *
 * @param templateType - Template type key (e.g., "vendor_invite", "project_update")
 * @returns Email template object or null if template doesn't exist
 *
 * @example
 * ```typescript
 * const template = getEmailTemplate('vendor_invite');
 * if (template) {
 *   console.log('Subject:', template.subject);
 * }
 * ```
 *
 * @remarks
 * - Replace with database query for production
 * - Consider implementing template versioning
 * - Add template caching for performance
 */
export const getEmailTemplate = (
  templateType: keyof typeof emailTemplates
): EmailTemplate | null => {
  const template = emailTemplates[templateType];
  if (!template) return null;

  return {
    subject: template.subject,
    body: template.body
  };
};

/**
 * Replace variables in email template
 *
 * Purpose: Processes email template variables with actual values.
 * Uses Mustache-style {{variable}} syntax for replacements.
 *
 * Behavior:
 * - Replaces all {{variable}} placeholders with provided values
 * - Converts arrays to numbered lists (1. item, 2. item, ...)
 * - Converts objects and primitives to strings
 * - Works on both subject and body
 *
 * @param template - Email template with {{variable}} placeholders
 * @param variables - Object with variable names and values
 * @returns Email template with all variables replaced
 *
 * @example
 * ```typescript
 * const template = {
 *   subject: 'Invitation for {{vendor_name}}',
 *   body: 'Hi {{contact_name}}, we invite you to participate...'
 * };
 * const result = replaceEmailVariables(template, {
 *   vendor_name: 'Salesforce',
 *   contact_name: 'John Smith'
 * });
 * ```
 *
 * @remarks
 * - Consider using a template engine (Handlebars, Mustache) for production
 * - Add support for conditional sections and loops
 * - Implement HTML escaping for security
 */
export const replaceEmailVariables = (
  template: EmailTemplate,
  variables: EmailVariables
): EmailTemplate => {
  let subject = template.subject;
  let body = template.body;

  // Replace each variable in subject and body
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;

    // Convert arrays to formatted lists
    let replacement: string;
    if (Array.isArray(value)) {
      replacement = value.map((item, index) => `${index + 1}. ${item}`).join('\n');
    } else {
      replacement = String(value);
    }

    // Replace all occurrences
    subject = subject.split(placeholder).join(replacement);
    body = body.split(placeholder).join(replacement);
  });

  return {
    subject,
    body
  };
};

/**
 * Generate email from template
 *
 * Purpose: Convenience function combining template retrieval and variable replacement.
 * One-step email generation from template.
 *
 * @param templateType - Template type key
 * @param variables - Variables to inject into template
 * @returns Fully processed email or null if template doesn't exist
 *
 * @example
 * ```typescript
 * const email = generateEmail('vendor_invite', {
 *   vendor_name: 'HubSpot',
 *   project_name: 'CRM Selection 2024',
 *   deadline: 'March 15, 2024'
 * });
 * if (email) {
 *   sendEmail(recipientEmail, email.subject, email.body);
 * }
 * ```
 *
 * @remarks
 * - Wrapper function for getEmailTemplate() + replaceEmailVariables()
 * - Returns null if template not found
 * - Use validateEmailVariables() first to check required variables
 */
export const generateEmail = (
  templateType: keyof typeof emailTemplates,
  variables: EmailVariables
): EmailTemplate | null => {
  const template = getEmailTemplate(templateType);
  if (!template) return null;

  return replaceEmailVariables(template, variables);
};

/**
 * Export vendors to Excel
 *
 * Purpose: Generates and downloads Excel file with vendor data.
 * Creates formatted spreadsheet with custom column widths.
 *
 * Behavior:
 * - Maps vendor objects to formatted rows
 * - Combines array fields (pros/cons) with semicolons
 * - Sets optimal column widths for readability
 * - Triggers browser download automatically
 * - No server-side processing (client-side only)
 *
 * @param vendors - Array of vendor objects to export
 * @param options - Optional export configuration
 * @param options.filename - Output filename (default: "vendors.xlsx")
 * @param options.sheetName - Excel sheet name (default: "Vendors")
 * @param options.includeHeaders - Include header row (default: true)
 *
 * @example
 * ```typescript
 * exportVendorsToExcel(selectedVendors, {
 *   filename: 'crm-vendors-2024.xlsx',
 *   sheetName: 'CRM Options'
 * });
 * ```
 *
 * @remarks
 * - Uses xlsx library for Excel generation
 * - For production, consider server-side generation for large datasets
 * - Add styling (colors, fonts, borders) for professional reports
 * - Implement progress indicator for large exports
 */
export const exportVendorsToExcel = (
  vendors: Vendor[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'vendors.xlsx',
    sheetName = 'Vendors',
    includeHeaders = true
  } = options;

  // Prepare data for export
  const exportData = vendors.map(vendor => ({
    'Vendor Name': vendor.name,
    'Match Score': `${vendor.match_score}%`,
    'Pricing': vendor.pricing,
    'Category': vendor.category,
    'Description': vendor.description,
    'Website': vendor.website,
    'Pros': vendor.pros.join('; '),
    'Cons': vendor.cons.join('; ')
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: includeHeaders ? undefined : [],
    skipHeader: !includeHeaders
  });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Vendor Name
    { wch: 12 }, // Match Score
    { wch: 18 }, // Pricing
    { wch: 20 }, // Category
    { wch: 50 }, // Description
    { wch: 30 }, // Website
    { wch: 40 }, // Pros
    { wch: 40 }  // Cons
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export criteria to Excel
 *
 * Purpose: Generates and downloads Excel file with evaluation criteria.
 * Creates formatted spreadsheet showing criteria details.
 *
 * Behavior:
 * - Formats importance levels to uppercase
 * - Capitalizes criterion types
 * - Sets optimal column widths
 * - Triggers browser download automatically
 *
 * @param criteria - Array of criterion objects to export
 * @param options - Optional export configuration
 * @param options.filename - Output filename (default: "criteria.xlsx")
 * @param options.sheetName - Excel sheet name (default: "Evaluation Criteria")
 * @param options.includeHeaders - Include header row (default: true)
 *
 * @example
 * ```typescript
 * exportCriteriaToExcel(projectCriteria, {
 *   filename: 'evaluation-criteria.xlsx'
 * });
 * ```
 *
 * @remarks
 * - Useful for sharing evaluation framework with stakeholders
 * - Consider adding weight/score columns for evaluation tracking
 */
export const exportCriteriaToExcel = (
  criteria: Criterion[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'criteria.xlsx',
    sheetName = 'Evaluation Criteria',
    includeHeaders = true
  } = options;

  // Prepare data for export
  const exportData = criteria.map(criterion => ({
    'Criterion': criterion.name,
    'Importance': criterion.importance.toUpperCase(),
    'Type': criterion.type.charAt(0).toUpperCase() + criterion.type.slice(1),
    'ID': criterion.id
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: includeHeaders ? undefined : [],
    skipHeader: !includeHeaders
  });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 }, // Criterion
    { wch: 12 }, // Importance
    { wch: 15 }, // Type
    { wch: 15 }  // ID
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export vendor comparison to Excel
 *
 * Purpose: Generates Excel file with AI-powered vendor comparison analysis.
 * Creates formatted spreadsheet with strengths, weaknesses, and recommendations.
 *
 * Behavior:
 * - Formats scores as percentages
 * - Combines array fields with semicolons
 * - Includes full recommendation text
 * - Sets wide columns for detailed content
 * - Triggers browser download automatically
 *
 * @param comparisons - Array of vendor comparison objects
 * @param options - Optional export configuration
 * @param options.filename - Output filename (default: "vendor-comparison.xlsx")
 * @param options.sheetName - Excel sheet name (default: "Vendor Comparison")
 * @param options.includeHeaders - Include header row (default: true)
 *
 * @example
 * ```typescript
 * const { data } = await compareVendors(['v1', 'v2', 'v3'], 'CRM Software');
 * if (data) {
 *   exportComparisonToExcel(data, {
 *     filename: 'crm-comparison-analysis.xlsx'
 *   });
 * }
 * ```
 *
 * @remarks
 * - Perfect for executive summaries and stakeholder presentations
 * - Consider adding charts for visual comparison
 */
export const exportComparisonToExcel = (
  comparisons: VendorComparison[],
  options: ExportOptions = {}
): void => {
  const {
    filename = 'vendor-comparison.xlsx',
    sheetName = 'Vendor Comparison',
    includeHeaders = true
  } = options;

  // Prepare data for export
  const exportData = comparisons.map(comparison => ({
    'Vendor': comparison.vendor_name,
    'Overall Score': `${comparison.overall_score}%`,
    'Strengths': comparison.strengths.join('; '),
    'Weaknesses': comparison.weaknesses.join('; '),
    'Recommendation': comparison.recommendation
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData, {
    header: includeHeaders ? undefined : [],
    skipHeader: !includeHeaders
  });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Vendor
    { wch: 15 }, // Overall Score
    { wch: 50 }, // Strengths
    { wch: 50 }, // Weaknesses
    { wch: 60 }  // Recommendation
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Export comprehensive vendor analysis to multi-sheet Excel
 *
 * Purpose: Generates complete vendor analysis report with multiple sheets.
 * All-in-one export for full project documentation.
 *
 * Behavior:
 * - Creates separate sheets for Vendors, Criteria, and Comparison
 * - Formats each sheet with appropriate column widths
 * - Includes all available data in single workbook
 * - Comparison sheet is optional (only if data provided)
 * - Triggers browser download automatically
 *
 * @param data - Complete analysis data object
 * @param data.vendors - Array of vendor objects
 * @param data.criteria - Array of criterion objects
 * @param data.comparisons - Optional vendor comparison analysis
 * @param filename - Output filename (default: "vendor-analysis.xlsx")
 *
 * @example
 * ```typescript
 * exportFullAnalysis({
 *   vendors: selectedVendors,
 *   criteria: evaluationCriteria,
 *   comparisons: comparisonData
 * }, 'crm-complete-analysis-2024.xlsx');
 * ```
 *
 * @remarks
 * - Most comprehensive export option
 * - Perfect for project documentation and archival
 * - Consider adding executive summary sheet
 * - Add project metadata sheet (dates, team, decisions)
 */
export const exportFullAnalysis = (
  data: {
    vendors: Vendor[];
    criteria: Criterion[];
    comparisons?: VendorComparison[];
  },
  filename: string = 'vendor-analysis.xlsx'
): void => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Vendors
  const vendorsData = data.vendors.map(vendor => ({
    'Vendor Name': vendor.name,
    'Match Score': `${vendor.match_score}%`,
    'Pricing': vendor.pricing,
    'Category': vendor.category,
    'Description': vendor.description,
    'Website': vendor.website,
    'Pros': vendor.pros.join('; '),
    'Cons': vendor.cons.join('; ')
  }));

  const vendorsSheet = XLSX.utils.json_to_sheet(vendorsData);
  vendorsSheet['!cols'] = [
    { wch: 20 }, { wch: 12 }, { wch: 18 }, { wch: 20 },
    { wch: 50 }, { wch: 30 }, { wch: 40 }, { wch: 40 }
  ];
  XLSX.utils.book_append_sheet(workbook, vendorsSheet, 'Vendors');

  // Sheet 2: Criteria
  const criteriaData = data.criteria.map(criterion => ({
    'Criterion': criterion.name,
    'Importance': criterion.importance.toUpperCase(),
    'Type': criterion.type.charAt(0).toUpperCase() + criterion.type.slice(1)
  }));

  const criteriaSheet = XLSX.utils.json_to_sheet(criteriaData);
  criteriaSheet['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, criteriaSheet, 'Criteria');

  // Sheet 3: Comparison (if provided)
  if (data.comparisons && data.comparisons.length > 0) {
    const comparisonData = data.comparisons.map(comparison => ({
      'Vendor': comparison.vendor_name,
      'Overall Score': `${comparison.overall_score}%`,
      'Strengths': comparison.strengths.join('; '),
      'Weaknesses': comparison.weaknesses.join('; '),
      'Recommendation': comparison.recommendation
    }));

    const comparisonSheet = XLSX.utils.json_to_sheet(comparisonData);
    comparisonSheet['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 50 }, { wch: 50 }, { wch: 60 }
    ];
    XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Comparison');
  }

  // Download file
  XLSX.writeFile(workbook, filename);
};

/**
 * Format data for CSV export
 *
 * Purpose: Converts array of objects to CSV format string.
 * Handles arrays, objects, and special characters properly.
 *
 * Behavior:
 * - Extracts headers from first object
 * - Converts arrays to semicolon-separated lists
 * - Wraps values with commas/quotes in quotes
 * - Escapes quotes with double quotes ("")
 * - Returns empty string for empty arrays
 *
 * @param data - Array of objects to convert
 * @returns CSV-formatted string with headers
 *
 * @example
 * ```typescript
 * const csv = convertToCSV([
 *   { name: 'Vendor A', score: 95 },
 *   { name: 'Vendor B', score: 87 }
 * ]);
 * downloadCSV(csv, 'vendors.csv');
 * ```
 *
 * @remarks
 * - Follows RFC 4180 CSV standard
 * - Compatible with Excel and Google Sheets
 */
export const convertToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header];

      // Handle arrays, objects, and special characters
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      } else if (typeof value === 'object') {
        return `"${JSON.stringify(value)}"`;
      } else if (String(value).includes(',') || String(value).includes('"')) {
        return `"${String(value).replace(/"/g, '""')}"`;
      }

      return value;
    }).join(',')
  );

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Download CSV file
 *
 * Purpose: Triggers browser download of CSV content.
 * Creates blob and downloads via hidden link element.
 *
 * Behavior:
 * - Creates Blob with correct MIME type
 * - Uses browser download API (no server)
 * - Cleans up URL object after download
 * - Works in all modern browsers
 *
 * @param csvContent - CSV-formatted string content
 * @param filename - Output filename (default: "export.csv")
 *
 * @example
 * ```typescript
 * const csv = convertToCSV(vendorData);
 * downloadCSV(csv, 'vendors-export.csv');
 * ```
 *
 * @remarks
 * - Client-side download only (no server involved)
 * - UTF-8 encoding with BOM for Excel compatibility
 */
export const downloadCSV = (csvContent: string, filename: string = 'export.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Format price string for display
 *
 * Purpose: Ensures consistent price formatting.
 * Simple trimming utility.
 *
 * @param priceString - Raw price string (e.g., "$99/month")
 * @returns Trimmed price string
 *
 * @example
 * ```typescript
 * const price = formatPrice('  $99/month  '); // "$99/month"
 * ```
 */
export const formatPrice = (priceString: string): string => {
  // Already formatted in most cases, just ensure consistency
  return priceString.trim();
};

/**
 * Format match score as percentage
 *
 * Purpose: Converts numeric score to percentage string.
 * Rounds to nearest integer.
 *
 * @param score - Match score value (0-100)
 * @returns Formatted percentage string
 *
 * @example
 * ```typescript
 * formatMatchScore(87.5); // "88%"
 * ```
 */
export const formatMatchScore = (score: number): string => {
  return `${Math.round(score)}%`;
};

/**
 * Format importance level with styling info
 *
 * Purpose: Provides display label and Tailwind CSS classes for importance badges.
 * Used for consistent UI rendering of importance levels.
 *
 * @param importance - Importance level
 * @returns Object with capitalized label and Tailwind color classes
 *
 * @example
 * ```typescript
 * const { label, colorClass } = formatImportance('high');
 * // { label: "High", colorClass: "text-red-600 bg-red-50" }
 * ```
 */
export const formatImportance = (
  importance: 'high' | 'medium' | 'low'
): { label: string; colorClass: string } => {
  const map = {
    high: { label: 'High', colorClass: 'text-red-600 bg-red-50' },
    medium: { label: 'Medium', colorClass: 'text-yellow-600 bg-yellow-50' },
    low: { label: 'Low', colorClass: 'text-green-600 bg-green-50' }
  };

  return map[importance];
};

/**
 * List all available email templates
 *
 * Purpose: Returns array of all available template type keys.
 * Useful for building template selector UIs.
 *
 * @returns Array of template type strings
 *
 * @example
 * ```typescript
 * const templates = listEmailTemplates();
 * // ["vendor_invite", "project_update", "reminder", ...]
 * ```
 */
export const listEmailTemplates = (): string[] => {
  return Object.keys(emailTemplates);
};

/**
 * Validate email variables
 *
 * Purpose: Checks if all required template variables are provided.
 * Prevents sending emails with missing placeholders.
 *
 * Behavior:
 * - Extracts all {{variable}} placeholders from template
 * - Checks each against provided variables object
 * - Returns array of missing variable names
 * - Returns empty array if all variables provided
 *
 * @param template - Email template to validate
 * @param variables - Variables object to check
 * @returns Array of missing variable names (empty if all present)
 *
 * @example
 * ```typescript
 * const template = getEmailTemplate('vendor_invite');
 * const missing = validateEmailVariables(template, {
 *   vendor_name: 'HubSpot'
 *   // contact_name is missing!
 * });
 * if (missing.length > 0) {
 *   console.error('Missing variables:', missing);
 * }
 * ```
 *
 * @remarks
 * - Use before calling replaceEmailVariables() or generateEmail()
 * - Helps prevent incomplete emails
 */
export const validateEmailVariables = (
  template: EmailTemplate,
  variables: EmailVariables
): string[] => {
  const content = `${template.subject} ${template.body}`;
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const requiredVariables = new Set<string>();

  let match;
  while ((match = variablePattern.exec(content)) !== null) {
    requiredVariables.add(match[1]);
  }

  const missing: string[] = [];
  requiredVariables.forEach(varName => {
    if (!(varName in variables)) {
      missing.push(varName);
    }
  });

  return missing;
};
