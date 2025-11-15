import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCriteriaChat } from './useCriteriaChat';
import * as aiService from '@/services/mock/aiService';

// Mock the AI service
vi.mock('@/services/mock/aiService');

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useCriteriaChat', () => {
  const mockProjectId = 'test-project-123';
  const mockContext = {
    category: 'CRM Software',
    criteria: [
      {
        id: '1',
        name: 'Security',
        importance: 'high' as const,
        type: 'technical',
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      expect(result.current.chatMessages).toEqual([]);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.userMessage).toBe('');
      expect(result.current.hasChatHistory).toBe(false);
    });

    it('should load chat from localStorage', () => {
      const savedMessages = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(
        `chat_${mockProjectId}`,
        JSON.stringify(savedMessages)
      );

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      // Should show synthesis, not original messages
      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0].id).toBe('synthesis');
      expect(result.current.hasChatHistory).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem(`chat_${mockProjectId}`, 'invalid json');

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      expect(result.current.chatMessages).toEqual([]);
      expect(result.current.hasChatHistory).toBe(false);
    });
  });

  describe('Message Management', () => {
    it('should update user message input', () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      act(() => {
        result.current.setUserMessage('Test message');
      });

      expect(result.current.userMessage).toBe('Test message');
    });

    it('should initialize chat with a message', () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      const initialMessage = {
        id: '1',
        role: 'assistant' as const,
        content: 'Welcome!',
        timestamp: new Date(),
      };

      act(() => {
        result.current.initializeChat(initialMessage);
      });

      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0]).toMatchObject({
        id: '1',
        role: 'assistant',
        content: 'Welcome!',
      });
    });

    it('should add a message to chat', () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      const message = {
        id: '1',
        role: 'user' as const,
        content: 'Test',
        timestamp: new Date(),
      };

      act(() => {
        result.current.addMessage(message);
      });

      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0].content).toBe('Test');
    });
  });

  describe('AI Integration', () => {
    it('should send message and get AI response', async () => {
      const mockResponse = {
        data: 'AI response content',
        error: null,
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      await act(async () => {
        await result.current.sendMessage('User question', mockContext);
      });

      // Should have user message and AI response
      expect(result.current.chatMessages).toHaveLength(2);
      expect(result.current.chatMessages[0].role).toBe('user');
      expect(result.current.chatMessages[0].content).toBe('User question');
      expect(result.current.chatMessages[1].role).toBe('assistant');
      expect(result.current.chatMessages[1].content).toBe('AI response content');
    });

    it('should set generating state during AI call', async () => {
      let resolveChat: (value: any) => void;
      const chatPromise = new Promise(resolve => {
        resolveChat = resolve;
      });
      vi.mocked(aiService.chat).mockReturnValue(chatPromise as any);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      // Start sending
      const sendPromise = act(async () => {
        await result.current.sendMessage('Test', mockContext);
      });

      // Should be generating
      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });

      // Resolve the AI call
      resolveChat!({ data: 'Response', error: null });
      await sendPromise;

      // Should no longer be generating
      expect(result.current.isGenerating).toBe(false);
    });

    it('should clear user message after send', async () => {
      const mockResponse = {
        data: 'AI response',
        error: null,
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      act(() => {
        result.current.setUserMessage('Test message');
      });

      await act(async () => {
        await result.current.sendMessage('Test message', mockContext);
      });

      expect(result.current.userMessage).toBe('');
    });

    it('should not send empty message', async () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      await act(async () => {
        await result.current.sendMessage('', mockContext);
      });

      expect(result.current.chatMessages).toHaveLength(0);
      expect(aiService.chat).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only message', async () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      await act(async () => {
        await result.current.sendMessage('   ', mockContext);
      });

      expect(result.current.chatMessages).toHaveLength(0);
      expect(aiService.chat).not.toHaveBeenCalled();
    });

    it('should call AI service with correct context', async () => {
      const mockResponse = {
        data: 'Response',
        error: null,
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      await act(async () => {
        await result.current.sendMessage('Question', mockContext);
      });

      expect(aiService.chat).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: 'Question',
          }),
        ]),
        expect.objectContaining({
          category: 'CRM Software',
          criteria: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              name: 'Security',
              importance: 'high',
              type: 'technical',
            }),
          ]),
        })
      );
    });

    it('should truncate message history to last 5 messages', async () => {
      const mockResponse = {
        data: 'Response',
        error: null,
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      // Initialize with 6 messages
      act(() => {
        result.current.initializeChat({
          id: '1',
          role: 'assistant',
          content: 'Msg 1',
          timestamp: new Date(),
        });
      });

      for (let i = 2; i <= 6; i++) {
        act(() => {
          result.current.addMessage({
            id: i.toString(),
            role: 'user',
            content: `Msg ${i}`,
            timestamp: new Date(),
          });
        });
      }

      // Send new message
      await act(async () => {
        await result.current.sendMessage('New message', mockContext);
      });

      // Should only include last 5 messages + current in AI context
      const chatCall = vi.mocked(aiService.chat).mock.calls[0];
      const messages = chatCall[0];

      // Should be 6 messages total (last 5 + current)
      expect(messages.length).toBeLessThanOrEqual(6);
    });

    it('should handle AI service error', async () => {
      const mockError = {
        data: null,
        error: { message: 'AI service failed' },
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockError);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      await act(async () => {
        await result.current.sendMessage('Test', mockContext);
      });

      // Should only have user message, no AI response
      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0].role).toBe('user');
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('Chat Synthesis', () => {
    it('should generate synthesis for empty chat', () => {
      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      expect(result.current.chatMessages).toEqual([]);
    });

    it('should generate synthesis when loading chat history', () => {
      const savedMessages = [
        {
          id: '1',
          role: 'assistant',
          content: 'We can help you with criteria. Additional details here.',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          role: 'user',
          content: 'Add security',
          timestamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        `chat_${mockProjectId}`,
        JSON.stringify(savedMessages)
      );

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      // Should show synthesis message
      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0].id).toBe('synthesis');
      expect(result.current.chatMessages[0].role).toBe('assistant');
      expect(result.current.chatMessages[0].content).toContain('discussion');
      expect(result.current.chatMessages[0].content).toContain('criteria');
    });

    it('should expose full chat messages separately', () => {
      const savedMessages = [
        {
          id: '1',
          role: 'user',
          content: 'First message',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Response',
          timestamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        `chat_${mockProjectId}`,
        JSON.stringify(savedMessages)
      );

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      // Displayed messages: synthesis only
      expect(result.current.chatMessages).toHaveLength(1);
      expect(result.current.chatMessages[0].id).toBe('synthesis');

      // Full chat messages: original history
      expect(result.current.fullChatMessages).toHaveLength(2);
      expect(result.current.fullChatMessages[0].content).toBe('First message');
      expect(result.current.fullChatMessages[1].content).toBe('Response');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save chat to localStorage after sending message', async () => {
      const mockResponse = {
        data: 'AI response',
        error: null,
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      await act(async () => {
        await result.current.sendMessage('Test', mockContext);
      });

      const stored = localStorage.getItem(`chat_${mockProjectId}`);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].content).toBe('Test');
      expect(parsed[1].content).toBe('AI response');
    });

    it('should not save synthesis message', () => {
      const savedMessages = [
        {
          id: '1',
          role: 'user',
          content: 'Original',
          timestamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem(
        `chat_${mockProjectId}`,
        JSON.stringify(savedMessages)
      );

      renderHook(() => useCriteriaChat(mockProjectId));

      // Should still have original message, not synthesis
      const stored = localStorage.getItem(`chat_${mockProjectId}`);
      const parsed = JSON.parse(stored!);
      expect(parsed[0].content).toBe('Original');
      expect(parsed[0].id).not.toBe('synthesis');
    });

    it('should update hasChatHistory flag', async () => {
      const mockResponse = {
        data: 'Response',
        error: null,
      };
      vi.mocked(aiService.chat).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCriteriaChat(mockProjectId));

      expect(result.current.hasChatHistory).toBe(false);

      await act(async () => {
        await result.current.sendMessage('Test', mockContext);
      });

      expect(result.current.hasChatHistory).toBe(true);
    });
  });

  describe('Project Switching', () => {
    it('should load different chat for different project', () => {
      const project1Messages = [
        {
          id: '1',
          role: 'user',
          content: 'Project 1 message',
          timestamp: new Date().toISOString(),
        },
      ];

      const project2Messages = [
        {
          id: '2',
          role: 'user',
          content: 'Project 2 message',
          timestamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem('chat_project1', JSON.stringify(project1Messages));
      localStorage.setItem('chat_project2', JSON.stringify(project2Messages));

      const { result: result1 } = renderHook(() => useCriteriaChat('project1'));
      const { result: result2 } = renderHook(() => useCriteriaChat('project2'));

      // Full messages should be different
      expect(result1.current.fullChatMessages[0].content).toBe(
        'Project 1 message'
      );
      expect(result2.current.fullChatMessages[0].content).toBe(
        'Project 2 message'
      );
    });

    it('should reload chat when projectId changes', () => {
      const project1Messages = [
        {
          id: '1',
          role: 'user',
          content: 'Project 1',
          timestamp: new Date().toISOString(),
        },
      ];

      const project2Messages = [
        {
          id: '2',
          role: 'user',
          content: 'Project 2',
          timestamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem('chat_project1', JSON.stringify(project1Messages));
      localStorage.setItem('chat_project2', JSON.stringify(project2Messages));

      const { result, rerender } = renderHook(
        ({ id }) => useCriteriaChat(id),
        { initialProps: { id: 'project1' } }
      );

      expect(result.current.fullChatMessages[0].content).toBe('Project 1');

      rerender({ id: 'project2' });

      expect(result.current.fullChatMessages[0].content).toBe('Project 2');
    });
  });
});
