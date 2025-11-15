import React from 'react';
import { Bot } from 'lucide-react';

export interface TypingIndicatorProps {
  /**
   * Whether to show the avatar (default: true)
   */
  showAvatar?: boolean;

  /**
   * Custom icon (default: Bot from lucide-react)
   */
  icon?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TypingIndicator - Animated typing indicator for chat interfaces
 *
 * Displays an animated three-dot indicator to show that the assistant
 * is typing a response. Includes proper ARIA attributes for accessibility.
 *
 * @example
 * ```tsx
 * // Basic usage
 * {isGenerating && <TypingIndicator />}
 *
 * // Without avatar
 * <TypingIndicator showAvatar={false} />
 *
 * // With custom icon
 * <TypingIndicator
 *   icon={<Sparkles className="h-5 w-5 text-primary" />}
 * />
 * ```
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  showAvatar = true,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
    >
      <div className="flex gap-2">
        {showAvatar && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon || <Bot className="h-5 w-5 text-primary" />}
          </div>
        )}
        <div className="bg-white border border-blue-100 px-4 py-3 rounded-lg">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
          </div>
          <span className="sr-only">Typing...</span>
        </div>
      </div>
    </div>
  );
};
