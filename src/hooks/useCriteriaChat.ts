/**
 * 🎯 CRITERIA CHAT HOOK
 *
 * Purpose: Manages AI chat interaction for criteria refinement.
 * Built on top of useChat base hook with specialized features.
 *
 * Features:
 * - Chat synthesis generation for project switching
 * - Project-specific chat persistence in localStorage
 * - AI service integration for conversational refinement
 * - Context preparation (category, current criteria)
 * - Error handling with user feedback
 * - Message history truncation (last 5 messages)
 *
 * @module hooks/useCriteriaChat
 */

import { useState, useEffect, useCallback } from 'react';
import { useChat } from './useChat';
import type { Message } from '@/components/shared/chat';
import * as aiService from '@/services/mock/aiService';
import { useToast } from '@/hooks/use-toast';

/**
 * Chat message structure (exported for compatibility)
 */
export interface ChatMessage extends Message {}

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
  fullChatMessages: ChatMessage[];
  hasChatHistory: boolean;
}

/**
 * Generate synthesis message from chat history
 * Summarizes the conversation for display when switching projects
 *
 * @param messages - Full chat history
 * @returns Synthesis message string
 */
const generateSynthesis = (messages: ChatMessage[]): string => {
  if (messages.length === 0) {
    return "Let's start building your evaluation criteria.";
  }

  // Count user messages
  const userMsgCount = messages.filter(m => m.role === 'user').length;

  // Get last AI message as basis for synthesis
  const lastAiMessage = [...messages]
    .reverse()
    .find(m => m.role === 'assistant');

  if (!lastAiMessage) {
    return "Let's continue refining your criteria.";
  }

  // Extract first sentence from last AI message
  const firstSentence = lastAiMessage.content.split('.')[0];

  // Generate synthesis based on conversation
  if (userMsgCount === 0) {
    return firstSentence + '.';
  }

  return `Based on our ${userMsgCount} discussion${userMsgCount !== 1 ? 's' : ''}, we've refined your evaluation criteria. ${firstSentence}.`;
};

/**
 * Custom hook for AI-powered criteria chat
 *
 * Purpose: Manages conversational AI interaction for criteria refinement.
 * Built on top of useChat with specialized synthesis and AI integration.
 *
 * @param projectId - Unique project identifier for chat isolation
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
 *   initializeChat,
 *   hasChatHistory
 * } = useCriteriaChat(projectId);
 *
 * // Initialize with greeting (only if no history)
 * useEffect(() => {
 *   if (!hasChatHistory) {
 *     initializeChat({
 *       id: '1',
 *       role: 'assistant',
 *       content: 'Hello! I can help you refine your criteria...',
 *       timestamp: new Date()
 *     });
 *   }
 * }, [hasChatHistory]);
 *
 * // Send user message
 * await sendMessage('Add security criteria', {
 *   category: 'CRM Software',
 *   criteria: currentCriteria
 * });
 * ```
 *
 * @remarks
 * - Persists chat history per project in localStorage
 * - Displays synthesis on project load (not full history)
 * - Keeps last 5 messages in context to manage token usage
 * - Automatically handles errors with toast notifications
 * - Loading state can be used to disable input during AI response
 */
export const useCriteriaChat = (projectId: string): UseCriteriaChatReturn => {
  const storageKey = `chat_${projectId}`;

  // Base chat hook for state management
  const {
    messages,
    inputValue: userMessage,
    setInputValue: setUserMessage,
    isTyping: isGenerating,
    setIsTyping: setIsGenerating,
    addMessage: baseAddMessage,
  } = useChat({ storageKey });

  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([]);
  const [fullChatMessages, setFullChatMessages] = useState<ChatMessage[]>([]);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const { toast } = useToast();

  /**
   * Load chat history and generate synthesis on project change
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp || Date.now())
        }));

        setFullChatMessages(messagesWithDates);
        setHasChatHistory(messagesWithDates.length > 0);

        // Display synthesis instead of full history
        if (messagesWithDates.length > 0) {
          const synthesis = generateSynthesis(messagesWithDates);
          setDisplayMessages([{
            id: 'synthesis',
            role: 'assistant',
            content: synthesis,
            timestamp: new Date()
          }]);
        } else {
          setDisplayMessages([]);
        }

        console.log('✅ Chat loaded from localStorage', {
          projectId,
          messageCount: messagesWithDates.length,
          showingSynthesis: true
        });
      } else {
        setFullChatMessages([]);
        setDisplayMessages([]);
        setHasChatHistory(false);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setFullChatMessages([]);
      setDisplayMessages([]);
      setHasChatHistory(false);
    }
  }, [projectId, storageKey]);

  /**
   * Sync messages with base hook when they change (not synthesis)
   */
  useEffect(() => {
    if (messages.length > 0 && messages[0].id !== 'synthesis') {
      setDisplayMessages(messages);
      setFullChatMessages(messages);
      setHasChatHistory(true);
      console.log('💾 Chat saved to localStorage', {
        projectId,
        messageCount: messages.length
      });
    }
  }, [messages, projectId]);

  /**
   * Initialize chat with a message
   * Replaces synthesis with actual conversation
   *
   * @param initialMessage - Initial chat message
   */
  const initializeChat = useCallback((initialMessage: ChatMessage) => {
    setDisplayMessages([initialMessage]);
    baseAddMessage(initialMessage);
  }, [baseAddMessage]);

  /**
   * Add a message to chat history
   *
   * @param message - Message to add
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setDisplayMessages(prev => [...prev, message]);
    baseAddMessage(message);
  }, [baseAddMessage]);

  /**
   * Send user message and get AI response
   *
   * @param message - User's message text
   * @param context - Chat context with category and current criteria
   */
  const sendMessage = useCallback(async (message: string, context: ChatContext): Promise<void> => {
    if (!message.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setDisplayMessages(prev => [...prev, userMsg]);
    baseAddMessage(userMsg);
    setUserMessage('');
    setIsGenerating(true);

    try {
      // Prepare messages for AI service (last 5 messages + current)
      const aiMessages: aiService.ChatMessage[] = [
        ...displayMessages.slice(-5).map(msg => ({
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
      const { data: responseContent, error } = await aiService.chat(aiMessages, {
        category: context.category,
        criteria: mappedCriteria
      });

      if (error || !responseContent) {
        throw new Error(error?.message || 'Failed to get chat response');
      }

      // Add AI response
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setDisplayMessages(prev => [...prev, aiResponse]);
      baseAddMessage(aiResponse);
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
  }, [displayMessages, baseAddMessage, setUserMessage, setIsGenerating, toast]);

  return {
    chatMessages: displayMessages,
    isGenerating,
    userMessage,
    setUserMessage,
    addMessage,
    sendMessage,
    initializeChat,
    fullChatMessages,
    hasChatHistory
  };
};
