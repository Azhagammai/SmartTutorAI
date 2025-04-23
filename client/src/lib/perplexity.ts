import { AiTutorMessage } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Function to send a message to the AI tutor using Perplexity API
export async function sendMessageToAiTutor(message: string): Promise<{
  userMessage: AiTutorMessage;
  aiMessage: AiTutorMessage;
}> {
  const response = await apiRequest("POST", "/api/ai-tutor/messages", {
    message,
    isUserMessage: true,
  });
  
  return await response.json();
}

// Function to get chat history with AI tutor
export async function getAiTutorHistory(): Promise<AiTutorMessage[]> {
  const response = await fetch("/api/ai-tutor/messages", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch AI tutor history");
  }
  
  return await response.json();
}

// Function to analyze learning style based on assessment responses
export function analyzeLearningStyle(answers: Record<number, string>): string {
  // Count the frequency of each learning style
  const counters = {
    "story-based": 0,
    "theory-based": 0,
    "practical-based": 0
  };
  
  // Increment counters based on answers
  Object.values(answers).forEach(style => {
    if (style in counters) {
      counters[style as keyof typeof counters]++;
    }
  });
  
  // Find the learning style with the highest count
  let maxCount = 0;
  let dominantStyle = "story-based"; // Default
  
  Object.entries(counters).forEach(([style, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantStyle = style;
    }
  });
  
  return dominantStyle;
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
  // Default recommendations
  const defaultRecommendations = {
    contentFormat: "mixed media (videos, text, and interactive exercises)",
    studyTips: [
      "Create a regular study schedule",
      "Take short breaks between study sessions",
      "Review material frequently"
    ],
    resourceTypes: ["video tutorials", "documentation", "practice exercises"]
  };
  
  // Customize based on learning style
  switch (learningStyle) {
    case "story-based":
      return {
        contentFormat: "narrative-driven content with real-world examples",
        studyTips: [
          "Connect concepts to real-world scenarios",
          "Read case studies related to the topic",
          "Discuss topics with peers to hear their experiences",
          "Create your own stories to explain concepts"
        ],
        resourceTypes: ["case studies", "scenario-based tutorials", "project walkthroughs", "storytelling videos"]
      };
      
    case "theory-based":
      return {
        contentFormat: "comprehensive explanations with diagrams and models",
        studyTips: [
          "Create concept maps to visualize relationships",
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