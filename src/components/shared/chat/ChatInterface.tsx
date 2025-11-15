import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Separator } from '@/components/ui/separator';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatInterfaceProps {
  /**
   * Array of messages to display
   */
  messages: Message[];

  /**
   * Callback fired when send button is clicked or Enter is pressed
   */
  onSend: () => void;

  /**
   * Current value of the input field
   */
  inputValue: string;

  /**
   * Callback fired when input value changes
   */
  onInputChange: (value: string) => void;

  /**
   * Whether the assistant is currently typing
   */
  isTyping?: boolean;

  /**
   * Whether the interface is disabled
   */
  disabled?: boolean;

  /**
   * Placeholder text for the input
   */
  placeholder?: string;

  /**
   * Optional title for the chat interface
   */
  title?: string;

  /**
   * Message to show when there are no messages
   */
  emptyStateMessage?: string;

  /**
   * Maximum height for messages container (default: max-h-96)
   */
  maxHeight?: string;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * ChatInterface - Complete chat interface component
 *
 * A full-featured chat interface combining messages display, input, and typing indicator.
 * Handles auto-scrolling to latest messages and provides a consistent chat experience.
 *
 * @example
 * ```tsx
 * const [messages, setMessages] = useState<Message[]>([]);
 * const [input, setInput] = useState('');
 * const [isTyping, setIsTyping] = useState(false);
 *
 * const handleSend = async () => {
 *   if (!input.trim()) return;
 *
 *   // Add user message
 *   const userMessage: Message = {
 *     id: Date.now().toString(),
 *     role: 'user',
 *     content: input,
 *     timestamp: new Date()
 *   };
 *   setMessages(prev => [...prev, userMessage]);
 *   setInput('');
 *   setIsTyping(true);
 *
 *   // Get AI response
 *   const response = await getAIResponse(input);
 *   setIsTyping(false);
 *
 *   const aiMessage: Message = {
 *     id: (Date.now() + 1).toString(),
 *     role: 'assistant',
 *     content: response,
 *     timestamp: new Date()
 *   };
 *   setMessages(prev => [...prev, aiMessage]);
 * };
 *
 * <ChatInterface
 *   messages={messages}
 *   onSend={handleSend}
 *   inputValue={input}
 *   onInputChange={setInput}
 *   isTyping={isTyping}
 *   title="AI Assistant"
 *   emptyStateMessage="Start a conversation with AI"
 * />
 * ```
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSend,
  inputValue,
  onInputChange,
  isTyping = false,
  disabled = false,
  placeholder,
  title,
  emptyStateMessage,
  maxHeight = 'max-h-96',
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Optional Title */}
      {title && (
        <div className="pb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      {/* Messages Container */}
      <div
        className={`overflow-y-auto ${maxHeight} mb-4`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="space-y-4 pr-4">
          {/* Empty State */}
          {messages.length === 0 && emptyStateMessage && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{emptyStateMessage}</p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};
