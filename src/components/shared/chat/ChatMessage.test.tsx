import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import { User, Bot } from 'lucide-react';

describe('ChatMessage', () => {
  describe('Basic Rendering', () => {
    it('should render user message with correct styling', () => {
      render(
        <ChatMessage
          role="user"
          content="Hello, can you help me?"
        />
      );

      expect(screen.getByText('Hello, can you help me?')).toBeInTheDocument();
    });

    it('should render assistant message with correct styling', () => {
      render(
        <ChatMessage
          role="assistant"
          content="Of course! How can I help you today?"
        />
      );

      expect(screen.getByText('Of course! How can I help you today?')).toBeInTheDocument();
    });

    it('should render system message with correct styling', () => {
      render(
        <ChatMessage
          role="system"
          content="System notification"
        />
      );

      expect(screen.getByText('System notification')).toBeInTheDocument();
    });
  });

  describe('Avatar Display', () => {
    it('should show user avatar for user messages', () => {
      const { container } = render(
        <ChatMessage
          role="user"
          content="Test message"
        />
      );

      // User icon should be present
      const userIcon = container.querySelector('svg');
      expect(userIcon).toBeInTheDocument();
    });

    it('should show bot avatar for assistant messages', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
        />
      );

      // Bot icon should be present
      const botIcon = container.querySelector('svg');
      expect(botIcon).toBeInTheDocument();
    });

    it('should not show avatar when showAvatar is false', () => {
      const { container } = render(
        <ChatMessage
          role="user"
          content="Test message"
          showAvatar={false}
        />
      );

      // Avatar container should not exist
      const avatarContainer = container.querySelector('.w-10.h-10.rounded-full');
      expect(avatarContainer).not.toBeInTheDocument();
    });

    it('should use custom user icon when provided', () => {
      const CustomIcon = () => <div data-testid="custom-user-icon">Custom</div>;

      render(
        <ChatMessage
          role="user"
          content="Test message"
          userIcon={<CustomIcon />}
        />
      );

      expect(screen.getByTestId('custom-user-icon')).toBeInTheDocument();
    });

    it('should use custom assistant icon when provided', () => {
      const CustomIcon = () => <div data-testid="custom-assistant-icon">Custom</div>;

      render(
        <ChatMessage
          role="assistant"
          content="Test message"
          assistantIcon={<CustomIcon />}
        />
      );

      expect(screen.getByTestId('custom-assistant-icon')).toBeInTheDocument();
    });
  });

  describe('Message Alignment', () => {
    it('should align user messages to the right', () => {
      const { container } = render(
        <ChatMessage
          role="user"
          content="Test message"
        />
      );

      const messageWrapper = container.firstChild;
      expect(messageWrapper).toHaveClass('justify-end');
    });

    it('should align assistant messages to the left', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
        />
      );

      const messageWrapper = container.firstChild;
      expect(messageWrapper).toHaveClass('justify-start');
    });

    it('should center system messages', () => {
      const { container } = render(
        <ChatMessage
          role="system"
          content="Test message"
        />
      );

      const messageWrapper = container.firstChild;
      expect(messageWrapper).toHaveClass('justify-center');
    });
  });

  describe('Message Styling', () => {
    it('should apply primary background to user messages', () => {
      const { container } = render(
        <ChatMessage
          role="user"
          content="Test message"
        />
      );

      const messageBubble = screen.getByText('Test message').closest('div');
      expect(messageBubble).toHaveClass('bg-primary');
      expect(messageBubble).toHaveClass('text-primary-foreground');
    });

    it('should apply white background to assistant messages', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
        />
      );

      const messageBubble = screen.getByText('Test message').closest('div');
      expect(messageBubble).toHaveClass('bg-white');
      expect(messageBubble).toHaveClass('border');
    });

    it('should apply muted background to system messages', () => {
      const { container } = render(
        <ChatMessage
          role="system"
          content="Test message"
        />
      );

      const messageBubble = screen.getByText('Test message').closest('div');
      expect(messageBubble).toHaveClass('bg-muted');
    });
  });

  describe('Content Rendering', () => {
    it('should render multiline content', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const { container } = render(
        <ChatMessage
          role="assistant"
          content={content}
        />
      );

      // Check for the paragraph element containing the content
      const paragraphElement = container.querySelector('p.leading-relaxed');
      expect(paragraphElement).toBeInTheDocument();
      expect(paragraphElement?.textContent).toBe(content);
    });

    it('should render long content', () => {
      const longContent = 'This is a very long message that contains multiple sentences. '.repeat(10);
      const { container } = render(
        <ChatMessage
          role="assistant"
          content={longContent}
        />
      );

      // Check for the paragraph element containing the content
      const paragraphElement = container.querySelector('p.leading-relaxed');
      expect(paragraphElement).toBeInTheDocument();
      expect(paragraphElement?.textContent).toBe(longContent);
    });

    it('should render content with special characters', () => {
      const content = 'Special chars: @#$%^&*()_+-={}[]|;:"<>,.?/';
      render(
        <ChatMessage
          role="assistant"
          content={content}
        />
      );

      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  describe('Timestamp Display', () => {
    it('should show timestamp when provided', () => {
      const timestamp = new Date('2025-01-15T10:30:00');
      render(
        <ChatMessage
          role="assistant"
          content="Test message"
          timestamp={timestamp}
        />
      );

      // Timestamp should be rendered (format: HH:MM)
      expect(screen.getByText('10:30')).toBeInTheDocument();
    });

    it('should not show timestamp when not provided', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
        />
      );

      // Should not have timestamp element
      const timestamp = container.querySelector('.text-xs');
      expect(timestamp).not.toBeInTheDocument();
    });

    it('should format timestamp correctly', () => {
      const timestamp = new Date('2025-01-15T09:05:00');
      render(
        <ChatMessage
          role="assistant"
          content="Test message"
          timestamp={timestamp}
        />
      );

      expect(screen.getByText('09:05')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
          className="custom-class"
        />
      );

      const messageWrapper = container.firstChild;
      expect(messageWrapper).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className is provided', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
          className="custom-class"
        />
      );

      const messageWrapper = container.firstChild;
      expect(messageWrapper).toHaveClass('flex');
      expect(messageWrapper).toHaveClass('gap-3');
      expect(messageWrapper).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attribute', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content="Test message"
        />
      );

      // Message should have article role for better semantics
      expect(container.querySelector('[role="article"]')).toBeInTheDocument();
    });

    it('should have aria-label indicating message role', () => {
      render(
        <ChatMessage
          role="assistant"
          content="Test message"
        />
      );

      expect(screen.getByLabelText(/assistant message/i)).toBeInTheDocument();
    });

    it('should have aria-label for user messages', () => {
      render(
        <ChatMessage
          role="user"
          content="Test message"
        />
      );

      expect(screen.getByLabelText(/user message/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const { container } = render(
        <ChatMessage
          role="assistant"
          content=""
        />
      );

      // Verify message is rendered even with empty content
      const messageBubble = container.querySelector('.px-4.py-3.rounded-lg');
      expect(messageBubble).toBeInTheDocument();
    });

    it('should handle very long single word', () => {
      const longWord = 'a'.repeat(500);
      render(
        <ChatMessage
          role="assistant"
          content={longWord}
        />
      );

      expect(screen.getByText(longWord)).toBeInTheDocument();
    });

    it('should handle HTML entities in content', () => {
      const content = '&lt;script&gt;alert("test")&lt;/script&gt;';
      render(
        <ChatMessage
          role="assistant"
          content={content}
        />
      );

      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });
});
