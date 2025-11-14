/**
 * 🎯 CRITERIA CHAT HOOK
 *
 * Purpose: Manages AI chat interaction for criteria refinement.
 * Extracts chat business logic from CriteriaBuilder component.
 *
 * Features:
 * - Chat message state management
 * - Project-specific chat persistence in localStorage
 * - Chat synthesis generation for project switching
 * - AI service integration for conversational refinement
 * - Context preparation (category, current criteria)
 * - Error handling with user feedback
 * - Message history truncation (last 5 messages)
 *
 * @module hooks/useCriteriaChat
 */

import { useState, useEffect } from 'react';
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
  fullChatMessages: ChatMessage[]; // Full chat history (not synthesis)
  hasChatHistory: boolean; // Whether project has existing chat
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
 * Handles message state, AI service calls, error handling, and persistence.
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [fullChatMessages, setFullChatMessages] = useState<ChatMessage[]>([]);
  const [hasChatHistory, setHasChatHistory] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const storageKey = `chat_${projectId}`;

  /**
   * Load chat history from localStorage on project change
   */
  useEffect(() => {
    const loadChat = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const messages: ChatMessage[] = JSON.parse(saved);
          // Convert timestamp strings back to Date objects
          const parsed = messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));

          setFullChatMessages(parsed);
          setHasChatHistory(parsed.length > 0);

          // Display synthesis instead of full history
          if (parsed.length > 0) {
            const synthesis = generateSynthesis(parsed);
            setChatMessages([{
              id: 'synthesis',
              role: 'assistant',
              content: synthesis,
              timestamp: new Date()
            }]);
          }

          console.log('✅ Chat loaded from localStorage', {
            projectId,
            messageCount: parsed.length,
            showingSynthesis: true
          });
        } else {
          setFullChatMessages([]);
          setChatMessages([]);
          setHasChatHistory(false);
        }
      } catch (error) {
        console.error('Failed to load chat:', error);
        setFullChatMessages([]);
        setChatMessages([]);
        setHasChatHistory(false);
      }
    };

    loadChat();
  }, [projectId, storageKey]);

  /**
   * Save chat to localStorage when messages change
   * Only save if we have real messages (not synthesis)
   */
  useEffect(() => {
    if (chatMessages.length > 0 && chatMessages[0].id !== 'synthesis') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(chatMessages));
        setFullChatMessages(chatMessages);
        setHasChatHistory(true);
        console.log('💾 Chat saved to localStorage', {
          projectId,
          messageCount: chatMessages.length
        });
      } catch (error) {
        console.error('Failed to save chat:', error);
      }
    }
  }, [chatMessages, projectId, storageKey]);

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
    initializeChat,
    fullChatMessages,
    hasChatHistory
  };
};
