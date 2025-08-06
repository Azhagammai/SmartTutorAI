import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  throw new Error('OPENROUTER_API_KEY environment variable is not set');
}

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://smarttutorai.com",
    "X-Title": "SmartTutorAI - Nova",
  },
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatSession {
  messages: ChatMessage[];
}

// Create a new chat session with system prompt
export async function createChatSession(systemPrompt: string): Promise<ChatSession> {
  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // Use GPT-3.5 as a fallback since Gemini is not available
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      frequency_penalty: 0.5
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response generated');
    }

    return {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "assistant", content }
      ]
    };
  } catch (error) {
    console.error('Error in createChatSession:', error);
    throw error;
  }
}

// Send a message and get a response
export async function sendMessage(session: ChatSession, message: string): Promise<string> {
  try {
    // Add user message to history
    session.messages.push({ role: "user", content: message });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // Use GPT-3.5 as a fallback since Gemini is not available
      messages: session.messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      frequency_penalty: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response generated');
    }

    // Add AI response to history
    session.messages.push({ role: "assistant", content });
    return content;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}
