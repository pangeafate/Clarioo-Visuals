/**
 * HeroSection Component - Landing Page Elements 1 & 2
 *
 * @prototype Visual demonstration component
 * @purpose Displays main headline and subtitle for landing page
 *
 * FEATURES (SP_007):
 * - Element 1: Large gradient headline with mobile-first typography
 * - Element 2: Clear value proposition subtitle
 * - Responsive: 56px desktop / 36px mobile headline
 * - Gradient text treatment using brand purple colors
 *
 * DESIGN SPECS:
 * - Typography: -0.02em letter-spacing, warm grays
 * - Gradient: bg-gradient-hero text treatment
 * - Mobile-first responsive breakpoints
 *
 * @see SP_007 Sprint Plan - Phase 1, Task 1.2
 */

import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center px-4 py-12 md:py-16 relative"
    >
      {/* Logo - Upper Left Corner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-4 left-4"
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Clarioo Logo"
          className="h-4 md:h-5 lg:h-6 w-auto"
        />
      </motion.div>

      {/* Element 1: Title */}
      <h1
        className="
          text-4xl md:text-5xl lg:text-6xl
          font-bold
          bg-gradient-to-r from-brand-blue to-brand-blueLight
          bg-clip-text text-transparent
          mb-6
          mt-12 md:mt-16 lg:mt-20
          tracking-tight
          leading-tight
        "
        style={{ letterSpacing: '-0.02em' }}
      >
        Supercharge your software vendor's selection with AI assistant
      </h1>

      {/* Element 2: Subtitle */}
      <p className="text-lg md:text-xl text-neutral-slate max-w-3xl mx-auto leading-relaxed">
        Discover and evaluate software based on your business needs and company context.
      </p>

      {/* Value proposition badges */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <span className="px-6 py-3 bg-brand-blue/10 rounded-full text-sm font-medium text-brand-blue border border-brand-blue/20">
          ⚡ 90% of routine work automated
        </span>
        <span className="px-6 py-3 bg-brand-blue/10 rounded-full text-sm font-medium text-brand-blue border border-brand-blue/20">
          ✓ No doubts in decisions
        </span>
        <span className="px-6 py-3 bg-brand-blue/10 rounded-full text-sm font-medium text-brand-blue border border-brand-blue/20">
          🚀 &lt;24 hours from start to selection
        </span>
      </div>
    </motion.section>
  );
};
