/**
 * VendorCard Component
 * Sprint: SP_015 (Revised)
 *
 * Horizontal vendor card with company name, match percentage, and info button
 * Includes navigation arrows for cycling through vendors
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComparisonVendor } from '../../types/comparison.types';
import { Button } from '../ui/button';
import { SPACING } from '../../styles/spacing-config';

interface VendorCardProps {
  vendor: ComparisonVendor | null;
  currentIndex: number;
  totalVendors: number;
  onNavigate: (direction: 'next' | 'previous') => void;
  onInfoClick?: () => void;
  className?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-900',
    matchBg: 'bg-white',
    accent: 'bg-green-500',
  },
  orange: {
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-900',
    matchBg: 'bg-white',
    accent: 'bg-orange-500',
  },
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-900',
    matchBg: 'bg-white',
    accent: 'bg-blue-500',
  },
};

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  currentIndex,
  totalVendors,
  onNavigate,
  onInfoClick,
  className = '',
}) => {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalVendors - 1;

  // Navigation counter state - show both counters when any arrow is clicked
  const [showCounters, setShowCounters] = useState(false);

  // Expansion state for accordion
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate vendors to left and right
  const vendorsToLeft = currentIndex;
  const vendorsToRight = totalVendors - currentIndex - 1;

  // Show counters briefly on navigation
  useEffect(() => {
    if (showCounters) {
      const timer = setTimeout(() => setShowCounters(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showCounters]);

  const handleNavigate = (direction: 'next' | 'previous') => {
    // Show both counters regardless of which arrow is clicked
    setShowCounters(true);
    onNavigate(direction);
  };

  // Allow clicking disabled arrows to show counters
  const handleDisabledClick = () => {
    setShowCounters(true);
  };

  return (
    <div className={`vendor-card-wrapper ${className}`}>
      <div className={`flex items-center ${SPACING.vendorComparison.navigation.gap}`}>
        {/* Previous Arrow with Counter */}
        <div className="relative flex-shrink-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              hasPrevious ? handleNavigate('previous') : handleDisabledClick();
            }}
            className="cursor-pointer"
          >
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasPrevious}
              className="h-8 w-8 pointer-events-none"
              asChild
            >
              <div>
                <ChevronLeft className="h-5 w-5" />
              </div>
            </Button>
          </div>

          {/* Left Counter - Always show when counters are visible */}
          <AnimatePresence>
            {showCounters && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 whitespace-nowrap"
              >
                {vendorsToLeft}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vendor Card Content - Clickable to expand */}
        <motion.div
          key={vendor?.id ?? 'empty'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: vendor?.color ? `${vendor.color.hex}15` : '#f3f4f6',
            borderColor: vendor?.color?.hex ?? '#d1d5db'
          }}
          className={`flex-1 flex items-center border-2 rounded-2xl ${SPACING.vendorComparison.card.container} min-w-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
        >
          {/* Left 40%: Vendor Info - Company Name + Match % stacked */}
          <div className={`flex-[0.4] min-w-0 ${SPACING.vendorComparison.card.leftSection}`}>
            <div style={{ color: vendor?.color?.hex ?? '#111827' }} className="font-semibold truncate text-sm sm:text-base leading-tight">
              {vendor?.name ?? 'No vendor selected'}
            </div>
            <div style={{ color: vendor?.color?.hex ?? '#111827' }} className="text-xs sm:text-sm opacity-80 mt-1">
              Match {vendor?.matchPercentage ?? 0}%
            </div>
          </div>

          {/* Right 60%: Killer Feature with semi-transparent white overlay - LARGER */}
          <div className="flex-[0.6] min-w-0 flex items-center justify-end">
            {vendor?.killerFeature && (
              <div className={`bg-white/60 backdrop-blur-sm rounded-lg ${SPACING.vendorComparison.card.rightSection} w-full`}>
                <div className="text-[10px] sm:text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                  {vendor.killerFeature}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Arrow with Counter */}
        <div className="relative flex-shrink-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              hasNext ? handleNavigate('next') : handleDisabledClick();
            }}
            className="cursor-pointer"
          >
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasNext}
              className="h-8 w-8 pointer-events-none"
              asChild
            >
              <div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </Button>
          </div>

          {/* Right Counter - Always show when counters are visible */}
          <AnimatePresence>
            {showCounters && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 whitespace-nowrap"
              >
                {vendorsToRight}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Accordion Expansion Content */}
      <AnimatePresence>
        {isExpanded && vendor && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              style={{
                backgroundColor: vendor.color ? `${vendor.color.hex}10` : '#f9fafb',
                borderColor: vendor.color?.hex ?? '#d1d5db'
              }}
              className="mt-2 border-2 rounded-2xl p-4 sm:p-6"
            >
              {/* Executive Summary */}
              {vendor.executiveSummary && (
                <div className="mb-4">
                  <h3
                    style={{ color: vendor.color?.hex ?? '#111827' }}
                    className="text-sm sm:text-base font-semibold mb-2"
                  >
                    About {vendor.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {vendor.executiveSummary}
                  </p>
                </div>
              )}

              {/* Research Insights */}
              {vendor.keyFeatures && vendor.keyFeatures.length > 0 && (
                <div>
                  <h3
                    style={{ color: vendor.color?.hex ?? '#111827' }}
                    className="text-sm sm:text-base font-semibold mb-2"
                  >
                    Research Insights
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {vendor.keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span
                          style={{ color: vendor.color?.hex ?? '#6b7280' }}
                          className="text-sm mt-0.5 flex-shrink-0"
                        >
                          •
                        </span>
                        <span className="text-xs sm:text-sm text-gray-700 leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
