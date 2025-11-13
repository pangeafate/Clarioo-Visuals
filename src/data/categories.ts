/**
 * Software Categories Data - SP_011
 *
 * @purpose Defines software categories for quick project creation
 *
 * USAGE:
 * - CategoryDropdown component uses this list for category selection
 * - Each category represents a common software search domain
 * - Categories are sorted alphabetically for easy scanning
 *
 * DATA STRUCTURE:
 * - id: Unique identifier for the category
 * - label: Display name for the category
 * - description: Brief explanation of the category
 *
 * @see SP_011 Sprint Plan - Phase 2, Task 2 (CategoryDropdown)
 * @see /src/components/landing/CategoryDropdown.tsx
 */

export interface SoftwareCategory {
  id: string;
  label: string;
  description: string;
}

export const SOFTWARE_CATEGORIES: SoftwareCategory[] = [
  {
    id: 'analytics',
    label: 'Analytics & Business Intelligence',
    description: 'Data visualization, reporting, and business intelligence tools'
  },
  {
    id: 'cloud-infrastructure',
    label: 'Cloud Infrastructure',
    description: 'Cloud hosting, storage, and infrastructure services'
  },
  {
    id: 'collaboration',
    label: 'Collaboration & Communication',
    description: 'Team messaging, video conferencing, and collaboration platforms'
  },
  {
    id: 'crm',
    label: 'CRM Software',
    description: 'Customer relationship management and sales tools'
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity & Compliance',
    description: 'Security monitoring, threat detection, and compliance tools'
  },
  {
    id: 'data-management',
    label: 'Data Management',
    description: 'Database systems, data warehousing, and ETL tools'
  },
  {
    id: 'dev-tools',
    label: 'Developer Tools',
    description: 'IDEs, version control, CI/CD, and development platforms'
  },
  {
    id: 'ecommerce',
    label: 'E-commerce Platforms',
    description: 'Online store builders, payment processing, and shopping cart solutions'
  },
  {
    id: 'email-marketing',
    label: 'Email Marketing',
    description: 'Email campaigns, automation, and newsletter tools'
  },
  {
    id: 'erp',
    label: 'ERP Systems',
    description: 'Enterprise resource planning and business management software'
  },
  {
    id: 'hr-management',
    label: 'HR Management',
    description: 'HR software, payroll, recruiting, and employee management'
  },
  {
    id: 'marketing-automation',
    label: 'Marketing Automation',
    description: 'Marketing automation, lead generation, and campaign management'
  },
  {
    id: 'productivity',
    label: 'Productivity & Office',
    description: 'Document editing, spreadsheets, and office productivity tools'
  },
  {
    id: 'project-management',
    label: 'Project Management',
    description: 'Task management, project planning, and workflow tools'
  },
  {
    id: 'support-helpdesk',
    label: 'Support & Helpdesk',
    description: 'Customer support, ticketing, and help desk software'
  }
];
