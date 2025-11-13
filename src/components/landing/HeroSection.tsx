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

interface HeroSectionProps {
  children?: React.ReactNode; // For RegistrationToggle
}

export const HeroSection = ({ children }: HeroSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex flex-col items-center justify-center px-4 py-16 md:py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-4">
        {/* Clarioo Brand Badge - Centered */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-2"
        >
          <div className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <span className="text-2xl md:text-3xl font-bold text-white">Clarioo</span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]"
          style={{ letterSpacing: '-0.03em' }}
        >
          Software Selection Expert
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed"
        >
          Supercharge your software vendor's selection with AI assistant. Discover and evaluate software based on your business needs and company context.
        </motion.p>

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
