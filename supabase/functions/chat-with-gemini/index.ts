
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-goog-api-key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, fn: 'chat-with-gemini' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }    

  const isDebug = Deno.env.get('DEBUG') === 'true';

  try {
    const { message, history = [] }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Get Gemini API key from environment secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      const errorBody = isDebug
        ? { error: true, stage: 'config', details: 'GEMINI_API_KEY not found in environment secrets.' }
        : { content: "I'm having trouble connecting to my AI service right now. The service is not configured correctly." };
      const status = isDebug ? 500 : 200;
      return new Response(JSON.stringify(errorBody), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Convert history to Gemini format (role: 'user' or 'model')
    const geminiHistory = history.map((msg) => ({
      // Force valid Gemini roles only
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    

    // 3. Prepare the request for Gemini API
    const requestBody = {
      contents: [
        ...geminiHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      systemInstruction: {
        parts: [{ text: "You are Chainspeak Assistant, an AI assistant integrated into ChainSpeak, a privacy-focused platform where users can have anonymous conversations. Be helpful, thoughtful, and respect the user's privacy. Keep responses conversational and engaging while being informative. Help users understand ChainSpeak features, privacy, blockchain technology, and how to earn from their conversations." }],
      },
    };

    // 4. Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': geminiApiKey,
  },
  body: JSON.stringify(requestBody),
});

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      const errorBody = isDebug
        ? { error: true, stage: 'gemini_api', status: response.status, details: errorText }
        : { content: "I'm having trouble connecting to my AI service right now. Please try again in a moment." };
      const status = isDebug ? 500 : 200;
      
      return new Response(JSON.stringify(errorBody), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({
        content: content,
        usage: data.usageMetadata || {},
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    const errorBody = isDebug
      ? { error: true, stage: 'handler_exception', details: error.message }
      : { content: "I apologize, but I'm experiencing some technical difficulties. Please try sending your message again." };

      const status = isDebug ? 500 : 200;

      return new Response(
        JSON.stringify(errorBody),
        {
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );      
  }
});
