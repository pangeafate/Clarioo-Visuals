/**
 * VerticalWorkflowStepper Component - Landing Page Workflow Display
 *
 * @prototype Visual demonstration component
 * @purpose Vertical scrollable stepper showing 5-step AI workflow
 *
 * FEATURES:
 * - Sticky progress header with percentage and progress bar
 * - Vertical timeline with completion circles
 * - Three card states: collapsed (completed), expanded (current), preview (upcoming)
 * - Smooth scroll navigation between steps
 * - Mobile-friendly responsive design
 * - Visual indicators: completed (green + checkmark), current (blue + pulse), upcoming (gray hollow)
 * - Connecting lines: solid green (completed), dotted gray (upcoming)
 *
 * DESIGN SPECS:
 * - Progress header: Sticky top, glass effect, Step X of 5
 * - Timeline circles: 48px desktop, 36px mobile
 * - Card heights: 80px (collapsed), viewport (expanded), 100px (preview)
 * - Animations: Framer Motion with spring physics
 * - Colors: Brand blue for current, green for completed, gray for upcoming
 *
 * @see CardCarousel.tsx - Original horizontal workflow cards
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, FileCheck, Users, MessageSquare, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Workflow step data (from CardCarousel.tsx)
const workflowSteps = [
  {
    id: 1,
    step: 'Step 1',
    title: 'Technology Exploration',
    icon: Search,
    shortDescription: 'Define your requirements',
    fullDescription: 'Tell us about your company and what solution you\'re looking for. Our AI understands context and requirements.',
    processFlow: {
      input: 'Company profile + Requirements',
      aiProcessing: 'Context analysis',
      output: 'Structured requirements'
    },
    artifact: 'Requirements Document',
    accentColor: 'brand-blue',
  },
  {
    id: 2,
    step: 'Step 2',
    title: 'Criteria Building',
    icon: FileCheck,
    shortDescription: 'Build evaluation criteria',
    fullDescription: 'AI generates comprehensive evaluation criteria tailored to your industry and needs. Review, refine, and prioritize.',
    processFlow: {
      input: 'Requirements',
      aiProcessing: 'Criteria generation',
      output: 'Evaluation matrix'
    },
    artifact: 'Criteria Matrix PDF',
    accentColor: 'indigo-600',
  },
  {
    id: 3,
    step: 'Step 3',
    title: 'Vendor Discovery',
    icon: Users,
    shortDescription: 'Find matching vendors',
    fullDescription: 'Intelligent search across thousands of vendors. Get match scores, key features, and AI-powered recommendations.',
    processFlow: {
      input: 'Evaluation criteria',
      aiProcessing: 'Intelligent matching',
      output: 'Ranked vendor list'
    },
    artifact: 'Vendor Matches',
    accentColor: 'brand-blueLight',
  },
  {
    id: 4,
    step: 'Step 4',
    title: 'Vendor Comparison',
    icon: MessageSquare,
    shortDescription: 'Compare side-by-side',
    fullDescription: 'Compare vendors side-by-side with detailed matrices. See strengths, weaknesses, and get clear recommendations.',
    processFlow: {
      input: 'Selected vendors',
      aiProcessing: 'Comparison analysis',
      output: 'Decision matrix'
    },
    artifact: 'Comparison Report',
    accentColor: 'cyan-600',
  },
  {
    id: 5,
    step: 'Step 5',
    title: 'Vendor Engagement',
    icon: Mail,
    shortDescription: 'Connect with vendors',
    fullDescription: 'Send professional outreach emails to vendors. Track responses and schedule demos - all in one place.',
    processFlow: {
      input: 'Vendor selection',
      aiProcessing: 'Email generation',
      output: 'Outreach campaigns'
    },
    artifact: 'Email Templates',
    accentColor: 'brand-blueDark',
  }
];

interface StickyProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
}

const StickyProgressHeader = ({ currentStep, totalSteps }: StickyProgressHeaderProps) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-neutral-navy">
            Step {currentStep} of {totalSteps}
          </h3>
          <span className="text-sm font-medium text-brand-blue">
            {percentage}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-blue to-brand-blueLight rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

interface TimelineStepProps {
  step: typeof workflowSteps[0];
  stepNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLast: boolean;
  onNavigate: () => void;
}

const TimelineStep = ({ step, stepNumber, isCompleted, isCurrent, isLast, onNavigate }: TimelineStepProps) => {
  const Icon = step.icon;
  const [isExpanded, setIsExpanded] = useState(isCurrent);

  useEffect(() => {
    setIsExpanded(isCurrent);
  }, [isCurrent]);

  // Determine circle state and styles
  const getCircleStyles = () => {
    if (isCompleted) {
      return 'bg-green-500 border-green-500 text-white';
    }
    if (isCurrent) {
      return 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/30';
    }
    return 'bg-white border-gray-300 text-gray-400';
  };

  // Determine line styles
  const getLineStyles = () => {
    if (isCompleted) {
      return 'bg-green-500';
    }
    return 'bg-gray-200 border-l-2 border-dashed border-gray-300';
  };

  return (
    <div className="relative flex gap-6 md:gap-8">
      {/* Timeline Column */}
      <div className="flex flex-col items-center">
        {/* Circle */}
        <motion.button
          onClick={onNavigate}
          className={`
            relative flex items-center justify-center
            w-12 h-12 md:w-14 md:h-14
            rounded-full border-2 transition-all duration-300
            ${getCircleStyles()}
            ${isCurrent ? 'animate-pulse' : ''}
            cursor-pointer hover:scale-110
            z-10
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCompleted ? (
            <Check className="w-6 h-6 md:w-7 md:h-7" />
          ) : (
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </motion.button>

        {/* Connecting Line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[80px] ${getLineStyles()}`} />
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 pb-8">
        {/* Card Header - Always Visible */}
        <motion.div
          onClick={() => !isCurrent && onNavigate()}
          className={`
            cursor-pointer transition-all duration-300
            ${isCurrent ? '' : 'hover:translate-x-1'}
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={`
                text-xs font-semibold uppercase tracking-wider mb-1
                ${isCompleted ? 'text-green-600' : isCurrent ? 'text-brand-blue' : 'text-gray-400'}
              `}>
                {step.step}
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-neutral-navy">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-slate mt-1">
                {step.shortDescription}
              </p>
            </div>

            {/* Expand/Collapse Icon for completed steps */}
            {isCompleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            )}
          </div>
        </motion.div>

        {/* Expandable Content */}
        <AnimatePresence>
          {(isCurrent || (isCompleted && isExpanded)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={`
                mt-4 p-6 rounded-2xl
                ${isCurrent
                  ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-brand-blue shadow-xl'
                  : 'bg-gray-50 border border-gray-200'
                }
              `}>
                {/* Full Description */}
                <p className="text-neutral-slate leading-relaxed mb-6">
                  {step.fullDescription}
                </p>

                {/* Process Flow */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="min-w-[80px] text-xs font-semibold text-neutral-navy">Input:</div>
                    <div className="text-sm text-neutral-slate">{step.processFlow.input}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="min-w-[80px] text-xs font-semibold text-brand-blue">AI Processing:</div>
                    <div className="text-sm text-brand-blue font-medium">{step.processFlow.aiProcessing}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="min-w-[80px] text-xs font-semibold text-neutral-navy">Output:</div>
                    <div className="text-sm text-neutral-slate">{step.processFlow.output}</div>
                  </div>
                </div>

                {/* Deliverable */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-xs text-neutral-slate mb-1">Deliverable:</p>
                  <p className="text-sm font-semibold text-neutral-navy">
                    📄 {step.artifact}
                  </p>
                </div>

                {/* CTA Button - Only for current step */}
                {isCurrent && (
                  <Button
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-blueLight text-white hover:shadow-lg transition-all duration-300 rounded-xl h-12 text-base font-semibold"
                  >
                    Continue to Next Step
                  </Button>
                )}

                {/* Completed Badge */}
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview for Upcoming Steps */}
        {!isCurrent && !isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200"
          >
            <p className="text-sm text-gray-500">
              Complete previous steps to unlock this stage
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const VerticalWorkflowStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleNavigate = (stepNumber: number) => {
    setCurrentStep(stepNumber);

    // Scroll to step
    const stepElement = stepRefs.current[stepNumber - 1];
    if (stepElement) {
      const headerHeight = 100; // Account for sticky header
      const elementPosition = stepElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      {/* Sticky Progress Header */}
      <StickyProgressHeader currentStep={currentStep} totalSteps={workflowSteps.length} />

      {/* Section Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-navy mb-4">
            How Clarioo AI Works
          </h2>
          <p className="text-lg text-neutral-slate max-w-2xl mx-auto">
            From requirements to vendor selection in 5 intelligent steps
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="space-y-0">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              ref={(el) => (stepRefs.current[index] = el)}
            >
              <TimelineStep
                step={step}
                stepNumber={step.id}
                isCompleted={step.id < currentStep}
                isCurrent={step.id === currentStep}
                isLast={index === workflowSteps.length - 1}
                onNavigate={() => handleNavigate(step.id)}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 && handleNavigate(currentStep - 1)}
            disabled={currentStep === 1}
            className="rounded-xl"
          >
            <ChevronUp className="w-4 h-4 mr-2" />
            Previous Step
          </Button>

          <Button
            onClick={() => currentStep < workflowSteps.length && handleNavigate(currentStep + 1)}
            disabled={currentStep === workflowSteps.length}
            className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-blueLight text-white"
          >
            Next Step
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
