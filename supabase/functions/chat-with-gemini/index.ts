import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'model'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history = [] }: ChatRequest = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: geminiApiKey, error: keyError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'GEMINI_API_KEY')
      .single();

    if (keyError || !geminiApiKey) {
      console.error('GEMINI_API_KEY not found in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Convert history to Gemini format
    // Gemini uses 'model' instead of 'assistant' for AI responses
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }))

    // Prepare the request for Gemini API
    const requestBody: any = {
      contents: [
        ...geminiHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      systemInstruction: {
        parts: [{ text: "You are Chainspeak Assistant, an AI assistant integrated into ChainSpeak, a privacy-focused platform where users can have anonymous conversations. Be helpful, thoughtful, and respect the user's privacy. Keep responses conversational and engaging while being informative. Help users understand ChainSpeak features, privacy, blockchain technology, and how to earn from their conversations." }]
      }
    }

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.value}`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      
      // Return a fallback response instead of exposing the error
      return new Response(
        JSON.stringify({ 
          content: "I'm having trouble connecting to my AI service right now. Please try again in a moment. In the meantime, I'm here to help with any questions you might have about privacy, technology, or general topics.",
          error: false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    
    // Extract the response text from Gemini's response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "I apologize, but I couldn't generate a response. Please try again."
    
    return new Response(
      JSON.stringify({ 
        content: content,
        usage: data.usageMetadata || {}
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        content: "I apologize, but I'm experiencing some technical difficulties. Please try sending your message again. I'm here to help with any questions or have a thoughtful conversation with you.",
        error: false
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})