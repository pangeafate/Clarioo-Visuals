/**
 * VerticalBarChart Component
 * Sprint: SP_015 (Revised)
 *
 * Vertical bar chart showing vendor scores for each criterion
 * Replicates category structure from CriteriaBuilder with accordion sections
 * Categories: Feature, Technical, Business, Compliance, + Custom
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, ChevronRight, Star, HelpCircle, Check, Minus } from 'lucide-react';
import { ComparisonVendor, CriterionState } from '../../types/comparison.types';
import { Criterion } from '../../types';
import { SignalAntenna } from '../vendor-discovery/SignalAntenna';
import { Button } from '../ui/button';
import { TYPOGRAPHY } from '../../styles/typography-config';

interface VerticalBarChartProps {
  vendors: (ComparisonVendor | null)[];
  criteria: Criterion[];
  onCriterionClick?: (criterionId: string) => void;
  className?: string;
}

/**
 * Render icon/text for 4-state criterion evaluation
 * - yes: Green "Yes" text
 * - no: Red "No" text
 * - unknown: Gray ? icon in circle
 * - star: Gold star icon
 */
const renderCriterionState = (state: CriterionState, criterionIndex: number, vendorIndex: number) => {
  const baseDelay = criterionIndex * 0.05 + vendorIndex * 0.1;

  switch (state) {
    case 'yes':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: baseDelay }}
          className="flex items-center justify-center h-full"
        >
          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
        </motion.div>
      );

    case 'no':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: baseDelay }}
          className="flex items-center justify-center h-full"
        >
          <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </motion.div>
      );

    case 'unknown':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: baseDelay }}
          className="flex items-center justify-center h-full"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </motion.div>
      );

    case 'star':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: baseDelay }}
          className="flex items-center justify-center h-full"
        >
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
        </motion.div>
      );

    default:
      return null;
  }
};

// Category color coding matching CriteriaBuilder
const getCategoryColors = (category: string) => {
  const normalized = category.toLowerCase();

  if (normalized.includes('feature')) {
    return {
      border: 'border-l-indigo-400',
      bg: 'bg-indigo-50/50',
      text: 'text-indigo-700',
      headerBg: 'bg-indigo-50',
    };
  }

  if (normalized.includes('technical')) {
    return {
      border: 'border-l-violet-400',
      bg: 'bg-violet-50/50',
      text: 'text-violet-700',
      headerBg: 'bg-violet-50',
    };
  }

  if (normalized.includes('business')) {
    return {
      border: 'border-l-teal-400',
      bg: 'bg-teal-50/50',
      text: 'text-teal-700',
      headerBg: 'bg-teal-50',
    };
  }

  if (normalized.includes('compliance')) {
    return {
      border: 'border-l-amber-400',
      bg: 'bg-amber-50/50',
      text: 'text-amber-700',
      headerBg: 'bg-amber-50',
    };
  }

  return {
    border: 'border-l-slate-400',
    bg: 'bg-slate-50/50',
    text: 'text-slate-700',
    headerBg: 'bg-slate-50',
  };
};

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  vendors,
  criteria,
  onCriterionClick,
  className = '',
}) => {
  // Filter out null vendors
  const activeVendors = vendors.filter((v): v is ComparisonVendor => v !== null);

  // Accordion state - all sections expanded by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Feature', 'Technical', 'Business', 'Compliance'])
  );

  // Group criteria by category (type field)
  const categorizedCriteria = useMemo(() => {
    const groups: Record<string, Criterion[]> = {};

    criteria.forEach((criterion) => {
      // Capitalize first letter of type for display
      const category = criterion.type
        ? criterion.type.charAt(0).toUpperCase() + criterion.type.slice(1)
        : 'Other';

      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(criterion);
    });

    // Sort criteria within each category by importance
    Object.keys(groups).forEach((category) => {
      groups[category].sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      });
    });

    return groups;
  }, [criteria]);

  // Standard categories in order
  const standardCategories = ['Feature', 'Technical', 'Business', 'Compliance'];

  // Custom categories (anything not in standard list)
  const customCategories = Object.keys(categorizedCriteria).filter(
    (cat) => !standardCategories.includes(cat)
  );

  // All categories in display order
  const allCategories = [
    ...standardCategories.filter((cat) => categorizedCriteria[cat]),
    ...customCategories,
  ];

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (activeVendors.length === 0) {
    return (
      <div className={`vertical-bar-chart bg-gray-50 rounded-lg p-8 text-center ${className}`}>
        <p className="text-sm text-gray-500">Select vendors to compare</p>
      </div>
    );
  }

  // Calculate total high priority count
  const totalHighPriority = criteria.filter(
    (c) => c.importance === 'high'
  ).length;

  return (
    <div className={`vertical-bar-chart bg-white rounded-2xl border-2 border-gray-200 overflow-hidden ${className}`}>
      {/* Header: Evaluation Criteria */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Evaluation Criteria ({criteria.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalHighPriority} High Priority
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Sections by Category */}
      <div className="divide-y divide-gray-200">
        {allCategories.map((category) => {
          const categoryCriteria = categorizedCriteria[category] || [];
          const isExpanded = expandedSections.has(category);
          const categoryColors = getCategoryColors(category);

          // Count by importance
          const highCount = categoryCriteria.filter(
            (c) => c.importance === 'high'
          ).length;
          const mediumCount = categoryCriteria.filter(
            (c) => c.importance === 'medium'
          ).length;
          const lowCount = categoryCriteria.filter(
            (c) => c.importance === 'low'
          ).length;

          return (
            <div key={category} className={`border-l-4 ${categoryColors.border}`}>
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(category)}
                className={`w-full ${categoryColors.bg} hover:bg-opacity-80 transition-colors px-4 sm:px-6 py-3 flex items-center justify-between`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                  <h4 className={`${TYPOGRAPHY.heading.h6} ${categoryColors.text}`}>
                    {category}
                  </h4>
                  <span className={`${TYPOGRAPHY.muted.small} text-gray-600`}>
                    {categoryCriteria.length} - {highCount} High, {mediumCount} Medium, {lowCount} Low
                  </span>
                </div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 sm:p-4 space-y-3 bg-white relative">
                      {/* Rotated Vendor Names - Spanning entire category section */}
                      <div className="absolute top-0 bottom-0 pointer-events-none flex" style={{ left: '0.75rem', right: '0.75rem' }}>
                        {/* Spacer matching criterion card width */}
                        <div className="flex-shrink-0 w-40 xs:w-44 sm:w-52 lg:w-60" />
                        {/* Gap matching the layout */}
                        <div className="w-2 sm:w-3 flex-shrink-0" />
                        {/* Vendor columns */}
                        <div className="flex-1 grid grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2 h-full">
                          {activeVendors.map((vendor) => (
                            <div key={`watermark-${vendor.id}`} className="relative h-full flex items-start justify-center pt-6 sm:pt-8">
                              <span
                                style={{
                                  color: vendor.color.hex,
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg) translateX(-55%)',
                                }}
                                className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold opacity-[0.15] whitespace-nowrap"
                              >
                                {vendor.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {categoryCriteria.map((criterion, criterionIndex) => {
                        const importance = criterion.importance;

                        return (
                          <div key={criterion.id} className="flex items-stretch gap-2 sm:gap-3">
                            {/* Criterion Card (Left Side) */}
                            <button
                              onClick={() => onCriterionClick?.(criterion.id)}
                              className="flex-shrink-0 w-40 xs:w-44 sm:w-52 lg:w-60 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl px-2 xs:px-3 sm:px-4 py-2 sm:py-3 transition-all hover:shadow-md group"
                            >
                              <div className="flex flex-col gap-1.5 sm:gap-2">
                                {/* Header: Name + Icons */}
                                <div className="flex items-start justify-between gap-1.5">
                                  <h5 className="text-[11px] xs:text-xs sm:text-sm font-semibold text-gray-900 text-left flex-1 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                    {criterion.name}
                                  </h5>

                                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                    {/* Signal Antenna */}
                                    <SignalAntenna importance={importance} />

                                    {/* AI Edit Button */}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCriterionClick?.(criterion.id);
                                      }}
                                      className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-gray-100"
                                      title="Edit criterion"
                                    >
                                      <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Description */}
                                {criterion.description && (
                                  <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 text-left line-clamp-2 leading-relaxed">
                                    {criterion.description}
                                  </p>
                                )}
                              </div>
                            </button>

                            {/* 3 Vendor Columns - Icon/Text Display */}
                            <div className="flex-1 grid grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2 items-center min-h-[40px] xs:min-h-[50px] sm:min-h-[60px]">
                              {activeVendors.map((vendor, vendorIndex) => {
                                const state = vendor.scores.get(criterion.id) ?? 'unknown';

                                return (
                                  <div key={`vendor-${vendorIndex}`} className="min-w-0">
                                    {/* Icon Cell - no background */}
                                    <div className="w-full h-8 xs:h-9 sm:h-10 flex items-center justify-center">
                                      {renderCriterionState(state, criterionIndex, vendorIndex)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Legend - All 3 Vendors */}
      <div className="border-t-2 border-gray-200 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex gap-2 xs:gap-3 sm:gap-6 justify-center flex-wrap">
          {activeVendors.map((vendor) => {
            return (
              <div key={vendor.id} className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
                <div
                  style={{ backgroundColor: vendor.color.hex }}
                  className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded shadow-sm flex-shrink-0"
                />
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[100px]">
                  {vendor.name}
                </span>
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-500 flex-shrink-0">
                  {vendor.matchPercentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
