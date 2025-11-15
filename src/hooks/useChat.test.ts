import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

describe('useChat', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() => useChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.inputValue).toBe('');
      expect(result.current.isTyping).toBe(false);
    });

    it('should update input value', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('Hello');
      });

      expect(result.current.inputValue).toBe('Hello');
    });

    it('should add user message', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Test message',
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        id: '1',
        role: 'user',
        content: 'Test message',
      });
    });

    it('should add assistant message', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'assistant',
          content: 'AI response',
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        id: '1',
        role: 'assistant',
        content: 'AI response',
      });
    });

    it('should add multiple messages in order', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'First',
        });
        result.current.addMessage({
          id: '2',
          role: 'assistant',
          content: 'Second',
        });
        result.current.addMessage({
          id: '3',
          role: 'user',
          content: 'Third',
        });
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Second');
      expect(result.current.messages[2].content).toBe('Third');
    });
  });

  describe('Send Message', () => {
    it('should handle send with empty input', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.handleSend();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.inputValue).toBe('');
    });

    it('should handle send with whitespace-only input', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('   ');
        result.current.handleSend();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.inputValue).toBe('   ');
    });

    it('should add user message on send', async () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('Hello AI');
      });

      act(() => {
        result.current.handleSend();
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello AI',
      });
    });

    it('should clear input after send', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('Test message');
      });

      act(() => {
        result.current.handleSend();
      });

      expect(result.current.inputValue).toBe('');
    });

    it('should generate unique message IDs', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('First');
      });

      act(() => {
        result.current.handleSend();
      });

      const firstId = result.current.messages[0].id;

      act(() => {
        result.current.setInputValue('Second');
      });

      act(() => {
        result.current.handleSend();
      });

      const secondId = result.current.messages[1].id;

      expect(firstId).not.toBe(secondId);
    });

    it('should call onSend callback if provided', () => {
      const onSend = vi.fn();
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.setInputValue('Test');
      });

      act(() => {
        result.current.handleSend();
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith('Test');
    });

    it('should not call onSend if input is empty', () => {
      const onSend = vi.fn();
      const { result } = renderHook(() => useChat({ onSend }));

      act(() => {
        result.current.handleSend();
      });

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('Typing Indicator', () => {
    it('should set typing state', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setIsTyping(true);
      });

      expect(result.current.isTyping).toBe(true);
    });

    it('should clear typing state', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setIsTyping(true);
      });

      act(() => {
        result.current.setIsTyping(false);
      });

      expect(result.current.isTyping).toBe(false);
    });
  });

  describe('Clear Messages', () => {
    it('should clear all messages', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'First',
        });
        result.current.addMessage({
          id: '2',
          role: 'assistant',
          content: 'Second',
        });
      });

      expect(result.current.messages).toHaveLength(2);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should maintain other state after clearing messages', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('Test input');
        result.current.setIsTyping(true);
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Message',
        });
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.inputValue).toBe('Test input');
      expect(result.current.isTyping).toBe(true);
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save messages to localStorage when storageKey provided', () => {
      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat' })
      );

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Persisted message',
        });
      });

      const stored = localStorage.getItem('test-chat');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        id: '1',
        role: 'user',
        content: 'Persisted message',
      });
    });

    it('should load messages from localStorage on mount', () => {
      const messages = [
        { id: '1', role: 'user', content: 'Loaded message' },
      ];
      localStorage.setItem('test-chat', JSON.stringify(messages));

      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat' })
      );

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        id: '1',
        role: 'user',
        content: 'Loaded message',
      });
    });

    it('should not persist when storageKey not provided', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Not persisted',
        });
      });

      const stored = localStorage.getItem('chat');
      expect(stored).toBeNull();
    });

    it('should update localStorage when messages change', () => {
      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat' })
      );

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'First',
        });
      });

      let stored = JSON.parse(localStorage.getItem('test-chat')!);
      expect(stored).toHaveLength(1);

      act(() => {
        result.current.addMessage({
          id: '2',
          role: 'assistant',
          content: 'Second',
        });
      });

      stored = JSON.parse(localStorage.getItem('test-chat')!);
      expect(stored).toHaveLength(2);
    });

    it('should clear localStorage when messages cleared', () => {
      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat' })
      );

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Message',
        });
      });

      expect(localStorage.getItem('test-chat')).not.toBeNull();

      act(() => {
        result.current.clearMessages();
      });

      const stored = localStorage.getItem('test-chat');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual([]);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('test-chat', 'invalid json');

      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat' })
      );

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('Initial Messages', () => {
    it('should initialize with provided messages', () => {
      const initialMessages = [
        { id: '1', role: 'assistant' as const, content: 'Welcome!' },
        { id: '2', role: 'user' as const, content: 'Hello' },
      ];

      const { result } = renderHook(() =>
        useChat({ initialMessages })
      );

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages).toEqual(initialMessages);
    });

    it('should prefer localStorage over initialMessages', () => {
      const storedMessages = [
        { id: '1', role: 'user', content: 'From storage' },
      ];
      localStorage.setItem('test-chat', JSON.stringify(storedMessages));

      const initialMessages = [
        { id: '2', role: 'user' as const, content: 'From props' },
      ];

      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat', initialMessages })
      );

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('From storage');
    });

    it('should use initialMessages when no localStorage data', () => {
      const initialMessages = [
        { id: '1', role: 'assistant' as const, content: 'Welcome!' },
      ];

      const { result } = renderHook(() =>
        useChat({ storageKey: 'test-chat', initialMessages })
      );

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Welcome!');
    });
  });

  describe('Message Timestamps', () => {
    it('should add timestamp to messages', () => {
      const { result } = renderHook(() => useChat());

      const beforeAdd = new Date();

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Test',
        });
      });

      const afterAdd = new Date();
      const message = result.current.messages[0];

      expect(message.timestamp).toBeInstanceOf(Date);
      expect(message.timestamp!.getTime()).toBeGreaterThanOrEqual(
        beforeAdd.getTime()
      );
      expect(message.timestamp!.getTime()).toBeLessThanOrEqual(
        afterAdd.getTime()
      );
    });

    it('should preserve provided timestamp', () => {
      const { result } = renderHook(() => useChat());
      const customTimestamp = new Date('2025-01-15T10:00:00');

      act(() => {
        result.current.addMessage({
          id: '1',
          role: 'user',
          content: 'Test',
          timestamp: customTimestamp,
        });
      });

      expect(result.current.messages[0].timestamp).toEqual(customTimestamp);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive sends', () => {
      const { result } = renderHook(() => useChat());

      act(() => {
        result.current.setInputValue('First');
      });
      act(() => {
        result.current.handleSend();
      });

      act(() => {
        result.current.setInputValue('Second');
      });
      act(() => {
        result.current.handleSend();
      });

      act(() => {
        result.current.setInputValue('Third');
      });
      act(() => {
        result.current.handleSend();
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages.map((m) => m.content)).toEqual([
        'First',
        'Second',
        'Third',
      ]);
    });

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useChat());
      const longMessage = 'a'.repeat(10000);

      act(() => {
        result.current.setInputValue(longMessage);
      });

      act(() => {
        result.current.handleSend();
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe(longMessage);
    });

    it('should handle special characters in messages', () => {
      const { result } = renderHook(() => useChat());
      const specialMessage = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      act(() => {
        result.current.setInputValue(specialMessage);
      });

      act(() => {
        result.current.handleSend();
      });

      expect(result.current.messages[0].content).toBe(specialMessage);
    });

    it('should handle unicode and emoji', () => {
      const { result } = renderHook(() => useChat());
      const unicodeMessage = 'Hello 👋 世界 🌍';

      act(() => {
        result.current.setInputValue(unicodeMessage);
      });

      act(() => {
        result.current.handleSend();
      });

      expect(result.current.messages[0].content).toBe(unicodeMessage);
    });
  });
});
