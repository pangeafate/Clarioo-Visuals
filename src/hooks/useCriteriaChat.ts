/**
 * 🎯 CRITERIA CHAT HOOK
 *
 * Purpose: Manages AI chat interaction for criteria refinement.
 * Extracts chat business logic from CriteriaBuilder component.
 *
 * Features:
 * - Chat message state management
 * - AI service integration for conversational refinement
 * - Context preparation (category, current criteria)
 * - Error handling with user feedback
 * - Message history truncation (last 5 messages)
 *
 * @module hooks/useCriteriaChat
 */

import { useState } from 'react';
import * as aiService from '@/services/mock/aiService';
import { useToast } from '@/hooks/use-toast';

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Criteria structure for context
 */
export interface Criteria {
  id: string;
  name: string;
  importance: 'low' | 'medium' | 'high';
  type: string;
}

/**
 * Chat context for AI
 */
export interface ChatContext {
  category: string;
  criteria: Criteria[];
}

/**
 * Hook return type
 */
export interface UseCriteriaChatReturn {
  chatMessages: ChatMessage[];
  isGenerating: boolean;
  userMessage: string;
  setUserMessage: (message: string) => void;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (message: string, context: ChatContext) => Promise<void>;
  initializeChat: (initialMessage: ChatMessage) => void;
}

/**
 * Custom hook for AI-powered criteria chat
 *
 * Purpose: Manages conversational AI interaction for criteria refinement.
 * Handles message state, AI service calls, and error handling.
 *
 * @returns Object with chat state and functions
 *
 * @example
 * ```typescript
 * const {
 *   chatMessages,
 *   isGenerating,
 *   userMessage,
 *   setUserMessage,
 *   sendMessage,
 *   initializeChat
 * } = useCriteriaChat();
 *
 * // Initialize with greeting
 * useEffect(() => {
 *   initializeChat({
 *     id: '1',
 *     role: 'assistant',
 *     content: 'Hello! I can help you refine your criteria...',
 *     timestamp: new Date()
 *   });
 * }, []);
 *
 * // Send user message
 * await sendMessage('Add security criteria', {
 *   category: 'CRM Software',
 *   criteria: currentCriteria
 * });
 * ```
 *
 * @remarks
 * - Keeps last 5 messages in context to manage token usage
 * - Automatically handles errors with toast notifications
 * - Loading state can be used to disable input during AI response
 */
export const useCriteriaChat = (): UseCriteriaChatReturn => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  /**
   * Initialize chat with a message
   * Typically used for initial AI greeting
   *
   * @param initialMessage - Initial chat message
   */
  const initializeChat = (initialMessage: ChatMessage) => {
    setChatMessages([initialMessage]);
  };

  /**
   * Add a message to chat history
   * Used to programmatically add messages from criteria generation
   *
   * @param message - Message to add
   */
  const addMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  /**
   * Send user message and get AI response
   *
   * Purpose: Handles complete chat interaction cycle.
   * Adds user message, calls AI service with context, adds response.
   *
   * @param message - User's message text
   * @param context - Chat context with category and current criteria
   *
   * @example
   * ```typescript
   * await sendMessage('Can you add more security criteria?', {
   *   category: 'CRM Software',
   *   criteria: currentCriteria
   * });
   * ```
   *
   * @remarks
   * - Keeps only last 5 messages in context
   * - Shows error toast on failure
   * - Clears input after successful send
   */
  const sendMessage = async (message: string, context: ChatContext): Promise<void> => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    setIsGenerating(true);

    try {
      // Prepare messages for AI service (last 5 messages + current)
      const messages: aiService.ChatMessage[] = [
        ...chatMessages.slice(-5).map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Prepare criteria context for AI
      const mappedCriteria = context.criteria.map(c => ({
        id: c.id,
        name: c.name,
        importance: c.importance,
        type: c.type
      }));

      // Call AI chat service with context
      const { data: responseContent, error } = await aiService.chat(messages, {
        category: context.category,
        criteria: mappedCriteria
      });

      if (error || !responseContent) {
        throw new Error(error?.message || 'Failed to get chat response');
      }

      // Add AI response to chat
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: 'AI Response Failed',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive'
      });
      console.error('AI chat error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    chatMessages,
    isGenerating,
    userMessage,
    setUserMessage,
    addMessage,
    sendMessage,
    initializeChat
  };
};
