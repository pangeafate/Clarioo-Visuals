import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@/components/shared/chat';

export interface UseChatOptions {
  /**
   * Optional callback fired when user sends a message
   */
  onSend?: (message: string) => void;

  /**
   * Optional localStorage key for persisting messages
   */
  storageKey?: string;

  /**
   * Optional initial messages to display
   * Ignored if localStorage data exists
   */
  initialMessages?: Message[];
}

export interface UseChatReturn {
  /**
   * Array of chat messages
   */
  messages: Message[];

  /**
   * Current input value
   */
  inputValue: string;

  /**
   * Whether the assistant is typing
   */
  isTyping: boolean;

  /**
   * Update the input value
   */
  setInputValue: (value: string) => void;

  /**
   * Set the typing state
   */
  setIsTyping: (isTyping: boolean) => void;

  /**
   * Add a message to the chat
   */
  addMessage: (message: Message) => void;

  /**
   * Handle sending a message
   * Adds user message and calls onSend callback
   */
  handleSend: () => void;

  /**
   * Clear all messages
   */
  clearMessages: () => void;
}

/**
 * useChat - Base chat hook for managing chat state and localStorage persistence
 *
 * Provides core chat functionality including message management, input handling,
 * typing state, and optional localStorage persistence.
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   inputValue,
 *   isTyping,
 *   setInputValue,
 *   handleSend,
 * } = useChat({
 *   storageKey: 'my-chat',
 *   onSend: async (message) => {
 *     // Get AI response
 *     const response = await getAIResponse(message);
 *     addMessage({
 *       id: Date.now().toString(),
 *       role: 'assistant',
 *       content: response,
 *     });
 *   },
 * });
 *
 * <ChatInterface
 *   messages={messages}
 *   inputValue={inputValue}
 *   onInputChange={setInputValue}
 *   onSend={handleSend}
 *   isTyping={isTyping}
 * />
 * ```
 */
export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const { onSend, storageKey, initialMessages = [] } = options;

  // Load messages from localStorage or use initialMessages
  const loadMessages = (): Message[] => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error);
      }
    }
    return initialMessages;
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Persist messages to localStorage when they change
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages to localStorage:', error);
      }
    }
  }, [messages, storageKey]);

  /**
   * Add a message to the chat
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        timestamp: message.timestamp || new Date(),
      },
    ]);
  }, []);

  /**
   * Handle sending a message
   */
  const handleSend = useCallback(() => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    // Create user message
    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    // Add user message
    addMessage(userMessage);

    // Clear input
    setInputValue('');

    // Call onSend callback
    if (onSend) {
      onSend(trimmedInput);
    }
  }, [inputValue, addMessage, onSend]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    inputValue,
    isTyping,
    setInputValue,
    setIsTyping,
    addMessage,
    handleSend,
    clearMessages,
  };
};
