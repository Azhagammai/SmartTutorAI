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

// Configure chat settings for educational context
const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

// Initialize a chat
export async function initializeChat(systemPrompt: string) {
  // Send initial system message to set up the chat context
  const completion = await openai.chat.completions.create({
    model: "google/gemini-pro",
    messages: [
      {
        role: "system",
        content: "You are Nova, an advanced AI tutor powered by Gemini. You specialize in providing detailed, interactive learning experiences. " + 
                "Always be engaging and adapt your teaching style based on the student's needs. " + systemPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0.5, // Encourage varied responses
    presence_penalty: 0.5 // Encourage focus on new information
  });

  return {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "assistant", content: completion.choices[0]?.message?.content || "Hello! I'm Nova, your AI tutor. How can I help you learn today?" }
    ]
  };
}

// Send a message to OpenRouter and get a response
export async function generateResponse(history: any, message: string): Promise<string> {
  // Ensure history is in the correct format
  const messages = history.messages || [];
  
  // Add the new user message
  messages.push({
    role: "user",
    content: message
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // Use GPT-3.5 as a fallback since Gemini is not available
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      frequency_penalty: 0.3, // Maintain conversational consistency
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response generated');
    }

    return content;
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw new Error('Failed to generate response');
  }
}
