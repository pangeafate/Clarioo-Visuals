/**
 * VendorComparison Component
 * Sprint: SP_015 (Revised) - Integrated into workflow
 *
 * Mobile-first vendor comparison screen with vertical bar chart
 * Layout: Horizontal vendor cards at top + vertical bar chart below
 *
 * Can be used in two modes:
 * 1. Standalone mode: Load from mockAIdata.json (for /comparison route)
 * 2. Workflow mode: Accept vendors/criteria from workflow (vendor-comparison step)
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ComparisonVendor, VENDOR_COLOR_PALETTE } from '../types/comparison.types';
import { Criterion } from '../types';
import { VendorCard } from './vendor-comparison/VendorCard';
import { VerticalBarChart } from './vendor-comparison/VerticalBarChart';
import mockAIdata from '../data/mockAIdata.json';
import { TechRequest, Vendor as WorkflowVendor, Criteria as WorkflowCriteria } from './VendorDiscovery';

interface VendorComparisonProps {
  // Standalone mode props
  projectId?: string;
  className?: string;

  // Workflow mode props
  vendors?: WorkflowVendor[];
  criteria?: WorkflowCriteria[];
  techRequest?: TechRequest;
  onComplete?: () => void;
  onVendorsGenerated?: (vendors: WorkflowVendor[]) => void;
}

export const VendorComparison: React.FC<VendorComparisonProps> = ({
  projectId,
  className = '',
  vendors: workflowVendors,
  criteria: workflowCriteria,
  techRequest,
  onComplete,
  onVendorsGenerated,
}) => {
  // Determine if we're in workflow mode or standalone mode
  const isWorkflowMode = !!workflowVendors && !!workflowCriteria;

  // Convert mock data to typed interfaces for standalone mode
  const standaloneCriteria: Criterion[] = useMemo(() => {
    return mockAIdata.criteria.map(c => {
      // Map numeric importance (1-5) to ImportanceLevel
      const getImportanceLevel = (importance: number): 'low' | 'medium' | 'high' => {
        if (importance >= 4) return 'high';
        if (importance >= 3) return 'medium';
        return 'low';
      };

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        importance: getImportanceLevel(c.importance),
        type: c.type || 'other',
      };
    });
  }, []);

  const standaloneShortlist: ComparisonVendor[] = useMemo(() => {
    return mockAIdata.vendors.map((v, index) => ({
      id: v.id,
      name: v.name,
      logo: v.logo,
      website: v.website,
      killerFeature: v.killerFeature,
      executiveSummary: v.executiveSummary,
      keyFeatures: v.keyFeatures,
      matchPercentage: v.matchPercentage,
      scores: new Map(Object.entries(v.scores)),
      color: VENDOR_COLOR_PALETTE[index % VENDOR_COLOR_PALETTE.length],
    }));
  }, []);

  // Convert workflow vendors to ComparisonVendor format
  const workflowShortlist: ComparisonVendor[] = useMemo(() => {
    if (!workflowVendors) return [];

    return workflowVendors.map((v, index) => {
      // Use criteriaScores that's already on the workflow vendor
      // (populated by useVendorDiscovery from mockAIdata.json)
      const scores = v.criteriaScores || {};

      return {
        id: v.id,
        name: v.name,
        logo: `https://logo.clearbit.com/${v.website.replace(/^https?:\/\//,  '')}`,
        website: v.website,
        killerFeature: v.description || '',
        executiveSummary: v.description || '',
        keyFeatures: v.features || [],
        matchPercentage: Math.round((v.rating / 5) * 100),
        scores: new Map(Object.entries(scores)),
        color: VENDOR_COLOR_PALETTE[index % VENDOR_COLOR_PALETTE.length],
      };
    });
  }, [workflowVendors]);

  // Convert workflow criteria to Criterion format
  const workflowCriteriaFormatted: Criterion[] = useMemo(() => {
    if (!workflowCriteria) return [];

    // Filter out archived criteria
    return workflowCriteria
      .filter(c => !c.isArchived)
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.explanation || '',
        importance: c.importance,
        type: c.type || 'other',
      }));
  }, [workflowCriteria]);

  // Use workflow data if available, otherwise use standalone data
  const criteria = isWorkflowMode ? workflowCriteriaFormatted : standaloneCriteria;
  const shortlist = isWorkflowMode ? workflowShortlist : standaloneShortlist;

  // Round-robin carousel indices for 3 vendor cards
  // Each carousel cycles through all available vendors
  const [vendor1Index, setVendor1Index] = useState(0);
  const [vendor2Index, setVendor2Index] = useState(Math.min(1, shortlist.length - 1));
  const [vendor3Index, setVendor3Index] = useState(Math.min(2, shortlist.length - 1));

  // Current vendors (with round-robin allocation)
  const vendor1 = shortlist[vendor1Index] ?? null;
  const vendor2 = shortlist[vendor2Index] ?? null;
  const vendor3 = shortlist[vendor3Index] ?? null;

  // Navigation handlers - cycle through ALL vendors in round-robin fashion
  const handleVendor1Navigate = (direction: 'next' | 'previous') => {
    setVendor1Index(prev => {
      if (direction === 'next') {
        return (prev + 1) % shortlist.length; // Wrap to start
      } else {
        return prev === 0 ? shortlist.length - 1 : prev - 1; // Wrap to end
      }
    });
  };

  const handleVendor2Navigate = (direction: 'next' | 'previous') => {
    setVendor2Index(prev => {
      if (direction === 'next') {
        return (prev + 1) % shortlist.length;
      } else {
        return prev === 0 ? shortlist.length - 1 : prev - 1;
      }
    });
  };

  const handleVendor3Navigate = (direction: 'next' | 'previous') => {
    setVendor3Index(prev => {
      if (direction === 'next') {
        return (prev + 1) % shortlist.length;
      } else {
        return prev === 0 ? shortlist.length - 1 : prev - 1;
      }
    });
  };

  if (shortlist.length === 0) {
    return (
      <div className={`vendor-comparison-container flex items-center justify-center min-h-screen bg-gray-50 ${className}`}>
        <div className="text-center px-6 py-12">
          <h3 className="text-lg font-medium text-gray-900">No vendors to compare</h3>
          <p className="mt-2 text-sm text-gray-500">
            Please select vendors in the previous step.
          </p>
        </div>
      </div>
    );
  }

  const projectName = isWorkflowMode
    ? (techRequest?.description || 'Vendor Comparison')
    : mockAIdata.project.name;

  const projectCategory = isWorkflowMode
    ? (techRequest?.category || '')
    : mockAIdata.project.category;

  return (
    <div className={`vendor-comparison-container bg-gray-50 min-h-screen ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {projectName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {projectCategory} • {shortlist.length} vendors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Vendor Cards - Stacked Vertically */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3 mb-6"
        >
          {/* Vendor 1 Card */}
          {vendor1 && (
            <VendorCard
              vendor={vendor1}
              currentIndex={vendor1Index}
              totalVendors={shortlist.length}
              onNavigate={handleVendor1Navigate}
            />
          )}

          {/* Vendor 2 Card (only show if 2+ vendors) */}
          {shortlist.length >= 2 && vendor2 && (
            <VendorCard
              vendor={vendor2}
              currentIndex={vendor2Index}
              totalVendors={shortlist.length}
              onNavigate={handleVendor2Navigate}
            />
          )}

          {/* Vendor 3 Card (only show if 3+ vendors) */}
          {shortlist.length >= 3 && vendor3 && (
            <VendorCard
              vendor={vendor3}
              currentIndex={vendor3Index}
              totalVendors={shortlist.length}
              onNavigate={handleVendor3Navigate}
            />
          )}
        </motion.div>

        {/* Vertical Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <VerticalBarChart
            vendors={[vendor1, vendor2, vendor3].filter(Boolean)}
            criteria={criteria}
          />
        </motion.div>
      </div>
    </div>
  );
};
