import { AiTutorMessage } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface ChatContext {
  domain?: string;
  learningStyle?: string;
}

// Function to generate system prompt based on context
function generateSystemPrompt({ domain, learningStyle }: Partial<ChatContext>): string {
  let prompt = "You are an intelligent and supportive AI tutor powered by Google's Gemini. You have expertise in multiple domains and adapt your teaching style based on the student's needs. ";
  
  if (domain) {
    prompt += `You specialize in ${domain} and will provide accurate, up-to-date information. `;
  }
  
  if (learningStyle) {
    prompt += `The student's preferred learning style is ${learningStyle}, so adapt your explanations accordingly. `;
    
    switch (learningStyle) {
      case "story-based":
        prompt += "Use real-world examples and narratives to explain concepts. Create engaging scenarios and analogies to illustrate technical ideas. ";
        break;
      case "theory-based":
        prompt += "Focus on theoretical foundations and detailed explanations. Break down complex concepts into their fundamental principles. ";
        break;
      case "practical-based":
        prompt += "Emphasize hands-on examples and practical applications. Provide code snippets, exercises, and real-world use cases. ";
        break;
    }
  }
  
  prompt += "Be encouraging, clear, and help students understand complex topics step by step. ";
  prompt += "If a concept is unclear, break it down further or approach it from a different angle. ";
  prompt += "Always maintain a professional and supportive tone, and encourage questions for clarification.";
  
  return prompt;
}

// Function to send a message to the AI tutor using backend API
export async function sendMessageToAiTutor(
  message: string,
  domain?: string,
  learningStyle?: string
): Promise<{ userMessage: AiTutorMessage; aiMessage: AiTutorMessage }> {
  try {    // Send request to backend API
    const response = await apiRequest("POST", "/api/ai-tutor/messages", {
      message,
      isUserMessage: true, // Required by schema
      context: {
        domain,
        learningStyle,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get AI tutor response');
    }

    return response.json();
  } catch (error) {
    console.error('Error in sendMessageToAiTutor:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate AI tutor response');
  }
}

// Function to get chat history
export async function getAiTutorHistory(): Promise<AiTutorMessage[]> {
  try {
    const response = await fetch("/api/ai-tutor/messages", {
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return []; // Return empty history on error
  }
}

// Function to analyze learning style based on assessment responses
export async function analyzeLearningStyle(answers: Record<number, string>): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/learning-style/analyze", {
      answers
    });

    if (!response.ok) {
      throw new Error('Failed to analyze learning style');
    }

    const result = await response.json();
    return result.learningType;
  } catch (error) {
    console.error('Error analyzing learning style:', error);
    return 'practical-based'; // Default to practical-based on error
  }
}

// Function to provide personalized recommendations based on learning style and domain
export function getPersonalizedRecommendations(
  learningStyle: string,
  domain: string
): {
  contentFormat: string;
  studyTips: string[];
  resourceTypes: string[];
} {
  // Define default recommendations
  const defaultRecommendations = {
    contentFormat: "mixed format with text and visuals",
    studyTips: [
      "Take regular breaks",
      "Practice active recall",
      "Use spaced repetition",
      "Explain concepts to others"
    ],
    resourceTypes: ["documentation", "video tutorials", "practice exercises", "quizzes"]
  };

  switch (learningStyle) {
    case "story-based":
      return {
        contentFormat: "narrative and scenario-based content",
        studyTips: [
          "Connect concepts to real-world stories",
          "Create your own analogies",
          "Learn through case studies",
          "Use metaphors to understand complex ideas"
        ],
        resourceTypes: ["case studies", "scenario-based tutorials", "project walkthroughs", "storytelling videos"]
      };
      
    case "theory-based":
      return {
        contentFormat: "comprehensive explanations with diagrams and models",
        studyTips: [
          "Create concept maps",
          "Focus on understanding fundamental principles",
          "Read in-depth articles and papers",
          "Take detailed notes and organize them systematically"
        ],
        resourceTypes: ["textbooks", "academic papers", "comprehensive guides", "theoretical explanations"]
      };
      
    case "practical-based":
      return {
        contentFormat: "hands-on exercises and interactive tutorials",
        studyTips: [
          "Build projects from day one",
          "Practice by doing rather than just reading",
          "Use coding playgrounds and sandboxes",
          "Apply concepts immediately after learning them"
        ],
        resourceTypes: ["coding exercises", "interactive tutorials", "DIY projects", "lab simulations"]
      };
      
    default:
      return defaultRecommendations;
  }
}
