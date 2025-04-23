import { AiTutorMessage, InsertAiTutorMessage } from "@shared/schema";
import { storage } from "./storage";

// Map of learning domains to specialized responses
const domainResponses: Record<string, string[]> = {
  "Web Development": [
    "In web development, it's important to understand the separation of concerns between HTML (structure), CSS (presentation), and JavaScript (behavior).",
    "When learning web frameworks like React, start by understanding components and props before diving into state management.",
    "For responsive design, I recommend using a mobile-first approach as it's generally easier to scale up than to scale down.",
    "Modern CSS features like Grid and Flexbox have made complex layouts much easier to implement.",
    "Understanding HTTP and REST principles is essential for effectively working with APIs in web applications.",
    "Web accessibility should be considered from the beginning of development, not as an afterthought.",
    "Version control with Git is a fundamental skill for any web developer working in teams.",
    "When optimizing web performance, focus on reducing bundle size, lazy loading, and efficient DOM operations."
  ],
  "Artificial Intelligence": [
    "Understanding the fundamentals of linear algebra and calculus will help you grasp many AI concepts more easily.",
    "When working with machine learning models, always split your data into training, validation, and test sets.",
    "Data preprocessing is often the most time-consuming but crucial part of any machine learning project.",
    "Start with simpler models before moving to complex ones - often a well-tuned simple model can outperform a poorly configured complex one.",
    "Neural networks are powerful but require significant data and computing resources. Consider if your problem truly needs deep learning.",
    "Understanding bias and variance tradeoff is key to diagnosing performance issues in your models.",
    "Feature engineering can often be more important than the choice of algorithm in many machine learning problems.",
    "Ethics in AI is not just a theoretical concern - it directly impacts how your models perform in real-world applications."
  ],
  "Cybersecurity": [
    "Security is all about layers - never rely on a single protective measure.",
    "Understanding the basics of cryptography is essential for implementing secure communications.",
    "Regular security audits and penetration testing are crucial practices for maintaining system security.",
    "Social engineering remains one of the most effective attack vectors - technical protections must be paired with user education.",
    "Keeping systems and software updated is one of the simplest yet most effective security practices.",
    "When designing secure systems, always follow the principle of least privilege.",
    "Understanding common vulnerabilities like SQL injection, XSS, and CSRF is fundamental for web application security.",
    "Incident response planning is as important as prevention - you need to be prepared for when, not if, a breach occurs."
  ],
  "Data Science": [
    "Data cleaning and preparation typically takes 80% of the time in data science projects, but it's fundamental to success.",
    "Visualization is a powerful tool for understanding data patterns before applying complex algorithms.",
    "Always check your assumptions about the data - distribution, independence, and homogeneity can significantly impact results.",
    "Feature selection and dimensionality reduction are key for building efficient, generalizable models.",
    "Understanding statistical concepts like p-values, confidence intervals, and regression assumptions is essential.",
    "Communication of results to non-technical stakeholders is a crucial skill - focus on insights, not technical details.",
    "Time series data requires specific techniques like seasonality decomposition and stationarity tests.",
    "For big data problems, consider distributed computing frameworks like Spark rather than trying to process everything in memory."
  ],
  "Mobile Development": [
    "When designing mobile apps, consider the constraints of smaller screens and touch interaction from the beginning.",
    "Platform-specific design guidelines (Material Design for Android, Human Interface Guidelines for iOS) are important for user acceptance.",
    "Managing the application lifecycle correctly is crucial for performance and battery optimization.",
    "Testing on actual devices is essential - emulators can't replicate all real-world conditions.",
    "Offline capabilities and synchronization strategies should be considered early in development.",
    "Push notifications require thoughtful implementation to be helpful rather than annoying to users.",
    "Responsive layouts with flexible components are key for supporting different screen sizes and orientations.",
    "For cross-platform development, evaluate tools like React Native or Flutter based on your specific requirements."
  ]
};

// General responses that work for any domain
const generalResponses: string[] = [
  "That's a great question! Let me help you understand this concept more clearly.",
  "I'd recommend breaking this problem down into smaller parts to make it more manageable.",
  "Have you tried applying what you've learned to a small project? It's one of the best ways to solidify your understanding.",
  "Learning this topic takes time, so don't be discouraged if you don't understand everything immediately.",
  "Let's approach this step by step to ensure you have a solid foundation before moving forward.",
  "That's an interesting perspective! Have you considered looking at it from this angle as well?",
  "Based on your learning style, you might find it helpful to visualize this concept with a diagram.",
  "This is a common challenge many students face. Here's how I suggest approaching it...",
  "Great progress! You're asking exactly the right questions at this stage of your learning journey.",
  "Let's connect this new concept with what you already know to help it stick better."
];

// Learning style specific responses
const learningStyleResponses: Record<string, string[]> = {
  "story-based": [
    "Let me share a real-world example that illustrates this concept...",
    "Think of it like this: imagine you're building a house. This concept would be similar to the foundation...",
    "This reminds me of a case study where a team faced a similar challenge and solved it by...",
    "The history behind this concept is fascinating. It was developed when...",
    "Here's how this applies in a real-world scenario you might encounter..."
  ],
  "theory-based": [
    "Let's examine the underlying principles that make this work...",
    "The theoretical framework for this concept has three main components...",
    "Understanding the mathematical model behind this will help clarify why it works this way...",
    "From a conceptual perspective, we can analyze this as a system with these properties...",
    "Let's break down the logical structure of this concept to understand it thoroughly..."
  ],
  "practical-based": [
    "Let's work through a hands-on example to demonstrate how this works...",
    "Try implementing this small code snippet and see what happens when you modify different parts...",
    "A practical exercise you can try is to...",
    "Here's a step-by-step approach you can follow to implement this concept...",
    "Let's build a minimal working example together to illustrate this principle..."
  ]
};

// Function to generate a personalized AI tutor response based on the user's message
export async function generateAiTutorResponse(
  userId: number,
  userMessage: string,
  domain?: string,
  learningStyle?: string
): Promise<string> {
  // Check if the message contains certain keywords to provide more relevant responses
  const lowerCaseMessage = userMessage.toLowerCase();
  let responsePool: string[] = [];
  
  // Add domain-specific responses if available
  if (domain && domain in domainResponses) {
    responsePool = responsePool.concat(domainResponses[domain]);
  }
  
  // Add learning style specific responses if available
  if (learningStyle && learningStyle in learningStyleResponses) {
    responsePool = responsePool.concat(learningStyleResponses[learningStyle]);
  }
  
  // Always include general responses
  responsePool = responsePool.concat(generalResponses);
  
  // Select a random response from the pool
  const randomIndex = Math.floor(Math.random() * responsePool.length);
  let response = responsePool[randomIndex];
  
  // Add a personalized touch based on specific keywords
  if (lowerCaseMessage.includes("help") || lowerCaseMessage.includes("stuck") || lowerCaseMessage.includes("confused")) {
    response = "I understand this can be challenging. " + response;
  } else if (lowerCaseMessage.includes("thank") || lowerCaseMessage.includes("thanks")) {
    response = "You're welcome! I'm glad I could help. " + response;
  } else if (lowerCaseMessage.includes("how") || lowerCaseMessage.includes("what") || lowerCaseMessage.includes("why")) {
    response = "That's an excellent question. " + response;
  }
  
  // Add a follow-up question or encouragement at the end
  const followUps = [
    " Does that help clarify things?",
    " Would you like me to explain this in a different way?",
    " What specific aspect would you like to explore further?",
    " How does this relate to what you're currently working on?",
    " Is there a particular part that you'd like me to elaborate on?"
  ];
  
  const randomFollowUp = followUps[Math.floor(Math.random() * followUps.length)];
  response += randomFollowUp;
  
  return response;
}

// Process a user message and generate an AI response
export async function processAiTutorMessage(
  userId: number,
  userMessage: string,
  domain?: string,
  learningStyle?: string
): Promise<{ userMessage: AiTutorMessage; aiMessage: AiTutorMessage }> {
  // Get AI response
  const aiResponse = await generateAiTutorResponse(userId, userMessage, domain, learningStyle);
  
  // Save user message
  const insertUserMessage: InsertAiTutorMessage = {
    userId,
    message: userMessage,
    isUserMessage: true
  };
  const savedUserMessage = await storage.createAiTutorMessage(insertUserMessage);
  
  // Save AI response
  const insertAiMessage: InsertAiTutorMessage = {
    userId,
    message: aiResponse,
    isUserMessage: false
  };
  const savedAiMessage = await storage.createAiTutorMessage(insertAiMessage);
  
  return {
    userMessage: savedUserMessage,
    aiMessage: savedAiMessage
  };
}