// Mock Claude API implementation for development
// Replace with real implementation when API key is available

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeAPI {
  private apiKey: string | null;

  constructor() {
    // Check for API key but don't throw error if missing
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
    
    if (!this.apiKey) {
      console.warn('Claude API key not found. Using mock responses for development.');
    }
  }

  async sendMessage(messages: ClaudeMessage[]): Promise<ClaudeResponse> {
    // If no API key, return mock response
    if (!this.apiKey) {
      return this.getMockResponse(messages);
    }

    try {
      // Real API implementation would go here
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        usage: data.usage
      };
    } catch (error) {
      console.error('Claude API error:', error);
      // Fallback to mock response on error
      return this.getMockResponse(messages);
    }
  }

  private getMockResponse(messages: ClaudeMessage[]): ClaudeResponse {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    // Generate contextual mock responses
    let mockResponse = '';

    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      mockResponse = "Hello! I'm Claude, your AI assistant. How can I help you today? I'm here to have thoughtful conversations and assist with any questions you might have.";
    } else if (userMessage.toLowerCase().includes('help')) {
      mockResponse = "I'd be happy to help! I can assist with a wide variety of tasks including answering questions, helping with analysis, creative writing, coding, and much more. What would you like to work on?";
    } else if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('programming')) {
      mockResponse = "I can definitely help with coding! Whether you need help debugging, writing new code, explaining concepts, or reviewing existing code, I'm here to assist. What programming language or specific challenge are you working with?";
    } else if (userMessage.toLowerCase().includes('explain')) {
      mockResponse = "I'd be glad to explain that for you! I can break down complex topics into understandable parts and provide clear explanations. Could you tell me more specifically what you'd like me to explain?";
    } else {
      mockResponse = `I understand you're asking about "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}". This is a mock response since the Claude API key isn't configured. In a real implementation, I would provide a thoughtful and detailed response to your question. Please set up the VITE_CLAUDE_API_KEY environment variable to enable real Claude responses.`;
    }

    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          content: mockResponse,
          usage: {
            input_tokens: userMessage.length / 4, // Rough estimate
            output_tokens: mockResponse.length / 4
          }
        });
      }, 1000 + Math.random() * 1000); // 1-2 second delay
    }) as Promise<ClaudeResponse>;
  }
}

// Export singleton instance
export const claudeAPI = new ClaudeAPI();

// Helper function for easy message sending
export async function sendMessageToClaude(message: string, conversationHistory: ClaudeMessage[] = []): Promise<string> {
  const messages: ClaudeMessage[] = [
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  const response = await claudeAPI.sendMessage(messages);
  return response.content;
}