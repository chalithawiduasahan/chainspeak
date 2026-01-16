import { supabase } from '../lib/supabase'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'model'
  content: string
}

export class ChainspeakAssistant {
  private conversationHistory: ChatMessage[] = []

  async sendMessage(userMessage: string): Promise<Message> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      })

      // Call the Gemini edge function
      const { data, error } = await supabase.functions.invoke('chat-with-claude', {
        body: {
          message: userMessage,
          history: this.conversationHistory.slice(0, -1) // Send all but the current message
        }
      })

      if (error) {
        console.error('Error calling Gemini edge function:', error)
        throw new Error(`Failed to get AI response: ${error.message}`)
      }

      if (!data || !data.content) {
        throw new Error('Invalid response from AI service')
      }

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: data.content
      })

      // Keep history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20)
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        sender: 'ai',
        timestamp: new Date()
      }

      return aiMessage
    } catch (error) {
      console.error('Error in ChainspeakAssistant:', error)
      
      // Return a fallback message
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: "I apologize, but I'm experiencing some technical difficulties. Please try sending your message again. I'm here to help with any questions about ChainSpeak, privacy, blockchain, or general topics.",
        sender: 'ai',
        timestamp: new Date()
      }

      return aiMessage
    }
  }

  // Method to clear conversation history (useful for new sessions)
  clearHistory(): void {
    this.conversationHistory = []
  }
}

export const chainspeakAssistant = new ChainspeakAssistant()