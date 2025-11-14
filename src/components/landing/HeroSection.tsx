/**
 * HeroSection Component - Landing Page Elements 1 & 2 (Redesigned)
 *
 * @prototype Visual demonstration component
 * @purpose Modern centered hero section with gradient background
 *
 * FEATURES:
 * - Centered layout with large logo/icon
 * - Clean typography hierarchy: Title → Subtitle → Toggle
 * - Balanced gradient background (gray-50 to blue-50)
 * - Value proposition badges
 * - Integrated authentication toggle
 *
 * DESIGN SPECS:
 * - Background: Subtle gradient with overlay
 * - Typography: Large centered title, descriptive subtitle
 * - Spacing: Generous vertical rhythm
 * - Mobile-first responsive
 *
 * @see Modern SaaS landing page redesign
 */

import { motion } from 'framer-motion';
import { ViewToggleButton } from './ViewToggleButton';

interface HeroSectionProps {
  children?: React.ReactNode; // For RegistrationToggle (SP_011: temporarily disabled)
  // SP_011: View toggle props
  currentView?: 'landing' | 'project';
  onViewToggle?: () => void;
}

export const HeroSection = ({ children, currentView, onViewToggle }: HeroSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex flex-col items-center justify-center px-4 py-16 md:py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 pointer-events-none" />

      {/* SP_011: View Toggle Button - Upper left corner */}
      {currentView && onViewToggle && (
        <div className="absolute top-4 left-4 z-10">
          <ViewToggleButton currentView={currentView} onToggle={onViewToggle} />
        </div>
      )}

      <div className="relative max-w-5xl mx-auto text-center space-y-4">
        {/* Clarioo Brand Badge - Centered */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-4 xs:mb-6 sm:mb-8"
        >
          <div className="px-5 py-2.5 xs:px-6 xs:py-3 sm:px-8 sm:py-4 bg-gradient-to-br from-gray-200 via-blue-200/90 to-purple-200/90 rounded-xl xs:rounded-2xl">
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Clarioo
            </span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]"
          style={{ letterSpacing: '-0.03em' }}
        >
          Software Selection Expert
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed"
        >
          Supercharge your software vendor's selection with AI assistant. Discover and evaluate software based on your business needs and company context.
        </motion.p>

        {/* Explore Button with Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex items-center justify-center gap-1 xs:gap-2 pt-4"
        >
          <button
            onClick={() => {
              window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
              });
            }}
            className="px-3 xs:px-5 sm:px-8 py-1.5 xs:py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-xs xs:text-sm sm:text-base rounded-full shadow-md hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Explore &gt;
          </button>
          <span className="text-xs xs:text-sm sm:text-lg md:text-xl text-gray-600 font-medium">
            software comparison and criteria templates
          </span>
        </motion.div>

        {/* Authentication Toggle (passed as children) */}
        {children && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-2"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
