import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface ChatInputProps {
  /**
   * The current value of the input
   */
  value: string;

  /**
   * Callback fired when the input value changes
   */
  onChange: (value: string) => void;

  /**
   * Callback fired when the send button is clicked or Enter is pressed
   */
  onSend: () => void;

  /**
   * Placeholder text for the textarea
   */
  placeholder?: string;

  /**
   * Whether the input is disabled
   */
  disabled?: boolean;

  /**
   * Number of visible text rows (default: 3)
   */
  rows?: number;

  /**
   * Custom send icon
   */
  sendIcon?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ChatInput - Reusable chat input component
 *
 * A textarea input with a send button for chat interfaces.
 * Supports Enter to send, Shift+Enter for new line.
 *
 * @example
 * ```tsx
 * const [message, setMessage] = useState('');
 *
 * <ChatInput
 *   value={message}
 *   onChange={setMessage}
 *   onSend={() => {
 *     handleSend(message);
 *     setMessage('');
 *   }}
 *   placeholder="Type your message..."
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom icon
 * <ChatInput
 *   value={message}
 *   onChange={setMessage}
 *   onSend={handleSend}
 *   sendIcon={<Sparkles className="h-4 w-4" />}
 *   disabled={isLoading}
 * />
 * ```
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  rows = 3,
  sendIcon,
  className = '',
}) => {
  /**
   * Handle textarea change
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  /**
   * Handle send button click
   */
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Check if send button should be disabled
   */
  const isSendDisabled = !value.trim() || disabled;

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1 space-y-2">
        <Label htmlFor="chat-input" className="sr-only">
          Message
        </Label>
        <Textarea
          id="chat-input"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="resize-none"
          aria-label="Message"
          aria-disabled={disabled}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={isSendDisabled}
        size="icon"
        className="self-end"
        aria-label="Send message"
      >
        {sendIcon || <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
};
