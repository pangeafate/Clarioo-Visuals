/**
 * Project Examples Data - SP_011
 *
 * @purpose Provides inspiration examples for quick project creation
 *
 * USAGE:
 * - ExamplesBulletPopover component displays these as clickable bullets
 * - Each example creates a project with confirmation dialog
 * - Examples represent common software search scenarios
 *
 * DATA STRUCTURE:
 * - id: Unique identifier for the example
 * - title: Short descriptive title (used as project name)
 * - description: Longer explanation of the use case
 *
 * DESIGN NOTES:
 * - Examples sourced from user-provided image (SP_011)
 * - Also found in TechInput.tsx suggestions array
 * - Cover diverse software categories
 *
 * @see SP_011 Sprint Plan - Phase 3, Task 2 (ExamplesBulletPopover)
 * @see /src/components/landing/ExamplesBulletPopover.tsx
 */

export interface ProjectExample {
  id: string;
  title: string;
  description: string;
}

export const PROJECT_EXAMPLES: ProjectExample[] = [
  {
    id: 'crm-integration',
    title: 'CRM that integrates with our existing email system',
    description: 'Find a customer relationship management solution that seamlessly connects with your current email infrastructure'
  },
  {
    id: 'project-management',
    title: 'Project management tool for remote teams',
    description: 'Discover collaboration software optimized for distributed teams with task tracking, communication, and file sharing'
  },
  {
    id: 'security-monitoring',
    title: 'Security monitoring for cloud infrastructure',
    description: 'Search for cybersecurity solutions to protect and monitor your cloud-based systems and applications'
  },
  {
    id: 'analytics-platform',
    title: 'Analytics platform for customer behavior tracking',
    description: 'Explore business intelligence tools to analyze user behavior, track metrics, and generate insights'
  }
];
