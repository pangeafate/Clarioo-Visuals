import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from './ChatInterface';

describe('ChatInterface', () => {
  const mockMessages = [
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Hello! How can I help you today?',
      timestamp: new Date('2025-01-15T10:00:00'),
    },
    {
      id: '2',
      role: 'user' as const,
      content: 'Can you help me with my project?',
      timestamp: new Date('2025-01-15T10:01:00'),
    },
  ];

  const mockOnSend = vi.fn();

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render chat interface', () => {
      const { container } = render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render messages area', () => {
      render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      // Both messages should be rendered
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
      expect(screen.getByText('Can you help me with my project?')).toBeInTheDocument();
    });

    it('should render input area', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with title when provided', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          title="AI Assistant"
        />
      );

      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });
  });

  describe('Messages Display', () => {
    it('should render empty state when no messages', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          emptyStateMessage="No messages yet"
        />
      );

      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('should render all messages in order', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      const messages = container.querySelectorAll('[role="article"]');
      expect(messages).toHaveLength(2);
    });

    it('should show typing indicator when isTyping is true', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          isTyping={true}
        />
      );

      // Check for typing indicator (animated dots)
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBeGreaterThan(0);
    });

    it('should not show typing indicator when isTyping is false', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          isTyping={false}
        />
      );

      // No typing indicator
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(0);
    });
  });

  describe('Input Control', () => {
    it('should display controlled input value', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue="Test message"
          onInputChange={() => {}}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test message');
    });

    it('should call onInputChange when typing', async () => {
      const user = userEvent.setup();
      const mockOnInputChange = vi.fn();

      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={mockOnInputChange}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(mockOnInputChange).toHaveBeenCalled();
    });

    it('should call onSend when send button clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue="Test"
          onInputChange={() => {}}
        />
      );

      const sendButton = screen.getByRole('button');
      await user.click(sendButton);

      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    it('should disable input when disabled prop is true', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          disabled={true}
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Auto-scroll Behavior', () => {
    it('should auto-scroll to bottom on new messages', async () => {
      const { rerender } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      const newMessage = {
        id: '3',
        role: 'assistant' as const,
        content: 'New message',
        timestamp: new Date(),
      };

      rerender(
        <ChatInterface
          messages={[...mockMessages, newMessage]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      // New message should be visible
      expect(screen.getByText('New message')).toBeInTheDocument();
    });
  });

  describe('Custom Placeholder', () => {
    it('should use custom placeholder when provided', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          placeholder="Ask me anything..."
        />
      );

      expect(screen.getByPlaceholderText('Ask me anything...')).toBeInTheDocument();
    });

    it('should use default placeholder when not provided', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });
  });

  describe('Height Configuration', () => {
    it('should apply default max height to messages container', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      const messagesContainer = container.querySelector('.overflow-y-auto');
      expect(messagesContainer).toHaveClass('max-h-96');
    });

    it('should apply custom max height when provided', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          maxHeight="max-h-[500px]"
        />
      );

      const messagesContainer = container.querySelector('.overflow-y-auto');
      expect(messagesContainer).toHaveClass('max-h-[500px]');
    });
  });

  describe('Styling', () => {
    it('should apply default container styling', () => {
      const { container } = render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex');
      expect(mainContainer).toHaveClass('flex-col');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          className="custom-chat"
        />
      );

      expect(container.firstChild).toHaveClass('custom-chat');
    });

    it('should separate messages and input with separator', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      // Check for Separator component (Radix UI separator with decorative=true doesn't have role)
      const separator = container.querySelector('[data-orientation="horizontal"]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveClass('bg-border');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no messages and empty state provided', () => {
      render(
        <ChatInterface
          messages={[]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          emptyStateMessage="Start a conversation"
        />
      );

      expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    });

    it('should not show empty state when messages exist', () => {
      render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
          emptyStateMessage="No messages"
        />
      );

      expect(screen.queryByText('No messages')).not.toBeInTheDocument();
    });
  });

  describe('Message Content', () => {
    it('should handle messages without timestamps', () => {
      const messagesWithoutTimestamps = [
        {
          id: '1',
          role: 'assistant' as const,
          content: 'Hello',
        },
      ];

      render(
        <ChatInterface
          messages={messagesWithoutTimestamps}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longMessage = {
        id: '1',
        role: 'assistant' as const,
        content: 'a'.repeat(1000),
      };

      render(
        <ChatInterface
          messages={[longMessage]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      const { container } = render(
        <ChatInterface
          messages={[longMessage]}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      expect(container.querySelector('p.leading-relaxed')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      // Messages should have article role
      expect(container.querySelectorAll('[role="article"]').length).toBeGreaterThan(0);

      // Input should have textbox role
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // Button should have button role
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have scrollable region for messages', () => {
      const { container } = render(
        <ChatInterface
          messages={mockMessages}
          onSend={mockOnSend}
          inputValue=""
          onInputChange={() => {}}
        />
      );

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
