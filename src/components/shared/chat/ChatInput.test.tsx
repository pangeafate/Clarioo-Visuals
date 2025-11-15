import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render textarea and send button', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with placeholder text', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
          placeholder="Type your message..."
        />
      );

      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('should use default placeholder when not provided', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });
  });

  describe('Value Control', () => {
    it('should display controlled value', () => {
      render(
        <ChatInput
          value="Test message"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test message');
    });

    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <ChatInput
          value=""
          onChange={mockOnChange}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle multiline input', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <ChatInput
          value=""
          onChange={mockOnChange}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Send Button', () => {
    it('should be disabled when value is empty', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const sendButton = screen.getByRole('button');
      expect(sendButton).toBeDisabled();
    });

    it('should be disabled when value is only whitespace', () => {
      render(
        <ChatInput
          value="   "
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const sendButton = screen.getByRole('button');
      expect(sendButton).toBeDisabled();
    });

    it('should be enabled when value has content', () => {
      render(
        <ChatInput
          value="Hello"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const sendButton = screen.getByRole('button');
      expect(sendButton).not.toBeDisabled();
    });

    it('should call onSend when clicked', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value="Test message"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const sendButton = screen.getByRole('button');
      await user.click(sendButton);

      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    it('should not call onSend when disabled', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const sendButton = screen.getByRole('button');
      await user.click(sendButton);

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should send on Enter key', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value="Test message"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{Enter}');

      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    it('should not send on Shift+Enter', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value="Test message"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{Shift>}{Enter}{/Shift}');

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('should not send on Enter when value is empty', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '{Enter}');

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
          disabled={true}
        />
      );

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should disable send button when disabled prop is true', () => {
      render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
          disabled={true}
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not call onSend when disabled', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
          disabled={true}
        />
      );

      const sendButton = screen.getByRole('button');
      await user.click(sendButton);

      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe('Custom Icon', () => {
    it('should render custom send icon when provided', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Send</div>;

      render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
          sendIcon={<CustomIcon />}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should use default Send icon when not provided', () => {
      const { container } = render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      // Check for SVG icon (default Lucide Send icon)
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Textarea Configuration', () => {
    it('should set default rows', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(3);
    });

    it('should use custom rows when provided', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
          rows={5}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.rows).toBe(5);
    });

    it('should have resize-none class', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label for textarea', () => {
      render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      // Check for textarea specifically (not button)
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAccessibleName(/message/i);
    });

    it('should have aria-label on send button', () => {
      render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      expect(screen.getByLabelText(/send message/i)).toBeInTheDocument();
    });

    it('should indicate disabled state in aria', () => {
      render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
          disabled={true}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className provided', () => {
      const { container } = render(
        <ChatInput
          value=""
          onChange={() => {}}
          onSend={mockOnSend}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('gap-2');
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long input', async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();
      const longText = 'a'.repeat(1000);

      render(
        <ChatInput
          value={longText}
          onChange={mockOnChange}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle special characters in input', async () => {
      const specialChars = '@#$%^&*()_+-={}[]|;:"<>,.?/';

      render(
        <ChatInput
          value={specialChars}
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialChars);
    });

    it('should handle rapid send clicks', async () => {
      const user = userEvent.setup();

      render(
        <ChatInput
          value="Test"
          onChange={() => {}}
          onSend={mockOnSend}
        />
      );

      const sendButton = screen.getByRole('button');
      await user.tripleClick(sendButton);

      // Should call onSend for each click
      expect(mockOnSend).toHaveBeenCalled();
    });
  });
});
