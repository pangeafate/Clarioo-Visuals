import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
  describe('Basic Rendering', () => {
    it('should render typing indicator', () => {
      const { container } = render(<TypingIndicator />);

      // Should render three animated dots
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);
    });

    it('should render bot avatar by default', () => {
      const { container } = render(<TypingIndicator />);

      // Should have avatar container
      const avatar = container.querySelector('.w-10.h-10.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should render with correct structure', () => {
      const { container } = render(<TypingIndicator />);

      // Main container should exist
      const mainContainer = container.querySelector('.flex.gap-3');
      expect(mainContainer).toBeInTheDocument();

      // Dots container should exist
      const dotsContainer = container.querySelector('.flex.gap-1');
      expect(dotsContainer).toBeInTheDocument();
    });
  });

  describe('Avatar Display', () => {
    it('should show avatar when showAvatar is true', () => {
      const { container } = render(<TypingIndicator showAvatar={true} />);

      const avatar = container.querySelector('.w-10.h-10.rounded-full');
      expect(avatar).toBeInTheDocument();
    });

    it('should hide avatar when showAvatar is false', () => {
      const { container } = render(<TypingIndicator showAvatar={false} />);

      const avatar = container.querySelector('.w-10.h-10.rounded-full');
      expect(avatar).not.toBeInTheDocument();
    });

    it('should use custom icon when provided', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;

      render(
        <TypingIndicator
          icon={<CustomIcon />}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should use default Bot icon when not provided', () => {
      const { container } = render(<TypingIndicator />);

      // Check for SVG icon (default Lucide Bot icon)
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should apply animate-bounce to all three dots', () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);

      // Each dot should have bounce animation
      dots.forEach(dot => {
        expect(dot).toHaveClass('animate-bounce');
      });
    });

    it('should apply staggered animation delays', () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll('.animate-bounce');

      // First dot: no delay
      expect(dots[0]).not.toHaveClass('[animation-delay:0.1s]');
      expect(dots[0]).not.toHaveClass('[animation-delay:0.2s]');

      // Second dot: 0.1s delay
      expect(dots[1]).toHaveClass('[animation-delay:0.1s]');

      // Third dot: 0.2s delay
      expect(dots[2]).toHaveClass('[animation-delay:0.2s]');
    });

    it('should render dots with correct size', () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll('.animate-bounce');
      dots.forEach(dot => {
        expect(dot).toHaveClass('w-2');
        expect(dot).toHaveClass('h-2');
        expect(dot).toHaveClass('rounded-full');
      });
    });

    it('should render dots with primary color', () => {
      const { container } = render(<TypingIndicator />);

      const dots = container.querySelectorAll('.animate-bounce');
      dots.forEach(dot => {
        expect(dot).toHaveClass('bg-primary');
      });
    });
  });

  describe('Styling', () => {
    it('should apply default styling to container', () => {
      const { container } = render(<TypingIndicator />);

      const mainContainer = container.querySelector('.flex.gap-3');
      expect(mainContainer).toHaveClass('flex');
      expect(mainContainer).toHaveClass('gap-3');
    });

    it('should apply border styling to dots container', () => {
      const { container } = render(<TypingIndicator />);

      const dotsContainer = container.querySelector('.bg-white.border');
      expect(dotsContainer).toHaveClass('bg-white');
      expect(dotsContainer).toHaveClass('border');
      expect(dotsContainer).toHaveClass('border-blue-100');
      expect(dotsContainer).toHaveClass('rounded-lg');
    });

    it('should apply padding to dots container', () => {
      const { container } = render(<TypingIndicator />);

      const dotsContainer = container.querySelector('.px-4.py-3');
      expect(dotsContainer).toHaveClass('px-4');
      expect(dotsContainer).toHaveClass('py-3');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TypingIndicator className="custom-class" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className provided', () => {
      const { container } = render(
        <TypingIndicator className="custom-class" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex');
      expect(mainContainer).toHaveClass('gap-3');
      expect(mainContainer).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      const { container } = render(<TypingIndicator />);

      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      const { container } = render(<TypingIndicator />);

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have aria-label describing the status', () => {
      const { container } = render(<TypingIndicator />);

      const statusElement = container.querySelector('[role="status"]');
      expect(statusElement).toHaveAttribute('aria-label', 'Assistant is typing');
    });

    it('should have sr-only text for screen readers', () => {
      render(<TypingIndicator />);

      expect(screen.getByText('Typing...')).toBeInTheDocument();
    });

    it('should hide sr-only text visually', () => {
      const { container } = render(<TypingIndicator />);

      const srOnlyText = screen.getByText('Typing...');
      expect(srOnlyText).toHaveClass('sr-only');
    });
  });

  describe('Avatar Background', () => {
    it('should have primary background with opacity', () => {
      const { container } = render(<TypingIndicator />);

      const avatar = container.querySelector('.w-10.h-10.rounded-full');
      expect(avatar).toHaveClass('bg-primary/10');
    });

    it('should center icon in avatar', () => {
      const { container } = render(<TypingIndicator />);

      const avatar = container.querySelector('.w-10.h-10.rounded-full');
      expect(avatar).toHaveClass('flex');
      expect(avatar).toHaveClass('items-center');
      expect(avatar).toHaveClass('justify-center');
    });
  });

  describe('Edge Cases', () => {
    it('should render without errors when no props provided', () => {
      const { container } = render(<TypingIndicator />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should maintain structure with both avatar and custom icon', () => {
      const CustomIcon = () => <div data-testid="custom">Icon</div>;

      const { container } = render(
        <TypingIndicator
          showAvatar={true}
          icon={<CustomIcon />}
        />
      );

      expect(screen.getByTestId('custom')).toBeInTheDocument();
      expect(container.querySelector('.w-10.h-10.rounded-full')).toBeInTheDocument();
    });

    it('should work with className and no avatar', () => {
      const { container } = render(
        <TypingIndicator
          showAvatar={false}
          className="test-class"
        />
      );

      expect(container.firstChild).toHaveClass('test-class');
      expect(container.querySelector('.w-10.h-10.rounded-full')).not.toBeInTheDocument();
    });
  });
});
