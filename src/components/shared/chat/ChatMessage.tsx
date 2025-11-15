import React from 'react';
import { User, Bot } from 'lucide-react';

export interface ChatMessageProps {
  /**
   * The role of the message sender
   */
  role: 'user' | 'assistant' | 'system';

  /**
   * The message content
   */
  content: string;

  /**
   * Optional timestamp for the message
   */
  timestamp?: Date;

  /**
   * Whether to show the avatar (default: true)
   */
  showAvatar?: boolean;

  /**
   * Custom user icon (default: User from lucide-react)
   */
  userIcon?: React.ReactNode;

  /**
   * Custom assistant icon (default: Bot from lucide-react)
   */
  assistantIcon?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ChatMessage - Reusable chat message component
 *
 * A message bubble component for chat interfaces with support for user,
 * assistant, and system messages. Features customizable avatars, timestamps,
 * and styling.
 *
 * @example
 * ```tsx
 * // User message
 * <ChatMessage
 *   role="user"
 *   content="Can you help me with this?"
 *   timestamp={new Date()}
 * />
 *
 * // Assistant message
 * <ChatMessage
 *   role="assistant"
 *   content="Of course! I'd be happy to help."
 *   timestamp={new Date()}
 * />
 *
 * // System message
 * <ChatMessage
 *   role="system"
 *   content="Chat session started"
 * />
 *
 * // Custom icons
 * <ChatMessage
 *   role="assistant"
 *   content="Hello!"
 *   assistantIcon={<Sparkles className="h-5 w-5" />}
 * />
 * ```
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  showAvatar = true,
  userIcon,
  assistantIcon,
  className = '',
}) => {
  /**
   * Format timestamp to HH:MM
   */
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  /**
   * Get alignment class based on role
   */
  const getAlignmentClass = (): string => {
    switch (role) {
      case 'user':
        return 'justify-end';
      case 'system':
        return 'justify-center';
      default:
        return 'justify-start';
    }
  };

  /**
   * Get message bubble styling based on role
   */
  const getMessageBubbleClass = (): string => {
    switch (role) {
      case 'user':
        return 'bg-primary text-primary-foreground';
      case 'system':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-white border border-blue-100';
    }
  };

  /**
   * Get avatar background styling based on role
   */
  const getAvatarClass = (): string => {
    switch (role) {
      case 'user':
        return 'bg-primary';
      default:
        return 'bg-primary/10';
    }
  };

  /**
   * Get icon color based on role
   */
  const getIconClass = (): string => {
    switch (role) {
      case 'user':
        return 'text-primary-foreground';
      default:
        return 'text-primary';
    }
  };

  /**
   * Render avatar based on role
   */
  const renderAvatar = () => {
    if (!showAvatar) return null;

    // System messages don't show avatars
    if (role === 'system') return null;

    const icon = role === 'user'
      ? userIcon || <User className={`h-5 w-5 ${getIconClass()}`} />
      : assistantIcon || <Bot className={`h-5 w-5 ${getIconClass()}`} />;

    return (
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getAvatarClass()}`}>
        {icon}
      </div>
    );
  };

  /**
   * Get aria-label for accessibility
   */
  const getAriaLabel = (): string => {
    switch (role) {
      case 'user':
        return 'User message';
      case 'assistant':
        return 'Assistant message';
      default:
        return 'System message';
    }
  };

  // System messages have different layout
  if (role === 'system') {
    return (
      <div
        className={`flex gap-3 ${getAlignmentClass()} ${className}`}
        role="article"
        aria-label={getAriaLabel()}
      >
        <div className={`px-4 py-2 rounded-lg ${getMessageBubbleClass()} max-w-xs`}>
          <p className="text-sm leading-relaxed">
            {content}
          </p>
          {timestamp && (
            <p className="text-xs opacity-70 mt-1">
              {formatTime(timestamp)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${getAlignmentClass()} ${className}`}
      role="article"
      aria-label={getAriaLabel()}
    >
      <div className={`flex gap-2 flex-1 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {renderAvatar()}
        <div className="flex flex-col gap-1 flex-1">
          <div className={`px-4 py-3 rounded-lg ${getMessageBubbleClass()}`}>
            <p className="leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>
          {timestamp && (
            <p className={`text-xs text-muted-foreground ${role === 'user' ? 'text-right' : 'text-left'}`}>
              {formatTime(timestamp)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
