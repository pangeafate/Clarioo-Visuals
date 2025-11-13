/**
 * AnimatedInputs Component - Landing Page Element 5
 *
 * @prototype Visual demonstration component
 * @purpose Two active input fields with category dropdown and examples (SP_011: registration-free)
 *
 * FEATURES (SP_011):
 * - Element 5: Two always-active input fields (registration removed)
 * - Side-by-side on desktop (≥768px), stacked on mobile
 * - CategoryDropdown: Quick project creation from categories (disabled when inputs have values)
 * - ExamplesBulletPopover: Inspiration examples with question mark icon
 * - "+ New Project" button: Creates project from input values
 *
 * FIXED (GAP-4): Landing input persistence
 * - Saves input to localStorage on every change
 * - Data flows: Landing → localStorage → Step 1 (TechInput)
 * - Enables seamless user journey from landing to workflow
 *
 * DESIGN SPECS:
 * - Border radius: rounded-xl (20px)
 * - Shadow: soft shadow for inputs
 * - Clean, accessible UI
 *
 * BEHAVIOR:
 * - Input fields always enabled (no registration gate)
 * - CategoryDropdown disables when user types in any input
 * - Auto-save: Saves to localStorage on every keystroke
 * - "+ New Project" creates project from input values
 *
 * @see SP_011 Sprint Plan - Phase 3 (CategoryDropdown & ExamplesBulletPopover Integration)
 * @see SP_007 Sprint Plan - Phase 3, Task 3.2 (Hypnotic Input Animations - DEPRECATED)
 * @see SP_009 Sprint Plan - Phase 2 (GAP-4: Landing Input Connection)
 */

import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryDropdown } from './CategoryDropdown';
import { ExamplesBulletPopover } from './ExamplesBulletPopover';

interface AnimatedInputsProps {
  isAuthenticated: boolean; // SP_011: Kept for backward compatibility, but inputs always active
  companyInput: string;
  solutionInput: string;
  onCompanyChange: (value: string) => void;
  onSolutionChange: (value: string) => void;
  onCreateProject?: () => void;
  // SP_011: New prop for category/example project creation
  onCreateCategoryProject?: (title: string, description: string) => Promise<void>;
}

export const AnimatedInputs = ({
  isAuthenticated,
  companyInput,
  solutionInput,
  onCompanyChange,
  onSolutionChange,
  onCreateProject,
  onCreateCategoryProject
}: AnimatedInputsProps) => {
  // SP_011: Calculate if user has typed in any input field
  const hasInputValues = companyInput.trim().length > 0 || solutionInput.trim().length > 0;
  /**
   * GAP-4 FIX: Save to localStorage on input change
   * Data will be loaded in TechInput.tsx when user starts workflow
   */
  const handleCompanyChange = (value: string) => {
    onCompanyChange(value);
    // Save to localStorage for later retrieval in Step 1
    localStorage.setItem('landing_company_info', value);
  };

  const handleSolutionChange = (value: string) => {
    onSolutionChange(value);
    // Save to localStorage for later retrieval in Step 1
    localStorage.setItem('landing_tech_needs', value);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="px-4 py-12 max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Input: Company Information */}
        <div className="relative">
          <Label htmlFor="company-input" className="text-lg font-semibold text-gray-800 mb-3 block">
            Tell me more about your company
          </Label>

          <div className="relative">
            <Textarea
              id="company-input"
              placeholder="e.g., We are a SaaS company with 50 employees looking to streamline our operations"
              value={companyInput}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="relative rounded-xl h-24 px-4 text-base resize-none bg-white shadow-soft border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all duration-500"
            />
          </div>
        </div>

        {/* Right Input: Solution Requirements */}
        <div className="relative">
          <Label htmlFor="solution-input" className="text-lg font-semibold text-gray-800 mb-3 block">
            Tell me what solution you're looking for
          </Label>

          <div className="relative">
            <Textarea
              id="solution-input"
              placeholder="e.g., CRM system with email integration and mobile app support"
              value={solutionInput}
              onChange={(e) => handleSolutionChange(e.target.value)}
              className="relative rounded-xl h-24 px-4 text-base resize-none bg-white shadow-soft border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* SP_011: New Project Button (always visible, no auth required) */}
      {onCreateProject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-6"
        >
          <Button
            onClick={onCreateProject}
            disabled={!companyInput.trim() || !solutionInput.trim()}
            className={`flex items-center gap-2 ${
              !companyInput.trim() || !solutionInput.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                : ''
            }`}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </motion.div>
      )}

      {/* SP_011: Category Dropdown and Examples */}
      {onCreateCategoryProject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-4"
        >
          {/* Category Dropdown with Examples Icon */}
          <div className="flex items-end gap-2 justify-center">
            <div className="flex-1 max-w-2xl">
              <CategoryDropdown
                onCreateProject={onCreateCategoryProject}
                hasInputValues={hasInputValues}
              />
            </div>
            <div className="mb-1">
              <ExamplesBulletPopover
                onCreateProject={onCreateCategoryProject}
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};
