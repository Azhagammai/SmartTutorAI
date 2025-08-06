import { AiTutorMessage, InsertAiTutorMessage } from "@shared/schema";
import { storage } from "./storage";
import OpenAI from 'openai';

// Initialize OpenAI client with OpenRouter configuration for Gemini
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "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",
  defaultHeaders: {
    "HTTP-Referer": "https://smarttutorai.com",
    "X-Title": "SmartTutorAI - Nova",
    "OpenRouter-Model-Preferred": "google/gemini-pro" // Force Gemini Pro model
  },
});

// Interface for chat messages
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Interface for chat session
interface ChatSession {
  messages: ChatMessage[];
}

// Store active chat sessions
const activeSessions = new Map<number, ChatSession>();

// Generate system prompt for the AI tutor
function generatePrompt(domain?: string, learningStyle?: string): string {
  let prompt = "You are Nova, an advanced AI tutor powered by Gemini. ";
  prompt += "You specialize in providing detailed, interactive learning experiences. ";
  
  if (domain) {
    prompt += `You are teaching ${domain}. Provide clear explanations with examples and real applications. `;
  }
  
  if (learningStyle) {
    switch (learningStyle) {
      case "story-based":
        prompt += "Use engaging stories, analogies, and real-world examples to explain concepts. Make technical ideas relatable through narrative. ";
        break;
      case "theory-based":
        prompt += "Focus on theoretical foundations, principles, and systematic explanations. Break down complex concepts into fundamental components. ";
        break;
      case "practical-based":
        prompt += "Emphasize hands-on learning with code examples, exercises, and real-world applications. Provide actionable steps and practical tips. ";
        break;
    }
  }
  
  prompt += "Be engaging and conversational while maintaining educational value. ";
  prompt += "If a concept is unclear, break it down into simpler parts. ";
  prompt += "Encourage questions and provide detailed, specific responses that deepen understanding.";
  
  return prompt;
}

// Initialize or get a chat session
async function getChatSession(
  userId: number, 
  domain?: string, 
  learningStyle?: string
): Promise<ChatSession> {
  let session = activeSessions.get(userId);
  
  if (!session) {
    const systemPrompt = generatePrompt(domain, learningStyle);
    
    // Initialize chat with system prompt
    const completion = await openai.chat.completions.create({
      model: "google/gemini-pro",
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.95,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    });

    session = {
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "assistant", 
          content: completion.choices[0]?.message?.content || 
                   "Hello! I'm Nova, your AI tutor. What would you like to learn about?"
        }
      ]
    };
    
    activeSessions.set(userId, session);
  }
  
  return session;
}

// Process user message and generate AI response
export async function processAiTutorMessage(
  userId: number,
  userMessage: string,
  domain?: string,
  learningStyle?: string
): Promise<{ userMessage: AiTutorMessage; aiMessage: AiTutorMessage }> {
  try {
    // Get or initialize chat session
    const session = await getChatSession(userId, domain, learningStyle);
    
    // Add user message to chat history
    session.messages.push({
      role: "user",
      content: userMessage
    });

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "google/gemini-pro",
      messages: session.messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.95,
      frequency_penalty: 0.3
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response generated');
    }

    // Add AI response to chat history
    session.messages.push({
      role: "assistant",
      content: aiResponse
    });
    
    // Update session
    activeSessions.set(userId, session);

    // Save messages to storage
    const savedUserMessage = await storage.createAiTutorMessage({
      userId,
      message: userMessage,
      isUserMessage: true
    });

    const savedAiMessage = await storage.createAiTutorMessage({
      userId,
      message: aiResponse,
      isUserMessage: false
    });

    return {
      userMessage: savedUserMessage,
      aiMessage: savedAiMessage
    };

  } catch (error) {
    console.error('Error in processAiTutorMessage:', error);
    throw error;
  }
}
