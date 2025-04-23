import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertLearningStyleSchema, insertForumDiscussionSchema, insertForumReplySchema, insertAiTutorMessageSchema } from "@shared/schema";
import { processAiTutorMessage } from "./ai-tutor";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all available courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get courses by domain
  app.get("/api/courses/domain/:domain", async (req, res) => {
    try {
      const { domain } = req.params;
      const courses = await storage.getCoursesByDomain(domain);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses by domain" });
    }
  });

  // Get a specific course by ID
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get modules for a course
  app.get("/api/courses/:id/modules", async (req, res) => {
    try {
      const modules = await storage.getModulesByCourse(parseInt(req.params.id));
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Get a specific module
  app.get("/api/modules/:id", async (req, res) => {
    try {
      const module = await storage.getModule(parseInt(req.params.id));
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  // Get quiz for a module
  app.get("/api/modules/:id/quiz", async (req, res) => {
    try {
      const quiz = await storage.getQuizByModule(parseInt(req.params.id));
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Learning style assessment and domain selection
  app.post("/api/learning-style", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Learning style request body:", req.body);

      // Create a complete learning style object with userId
      const learningStyleData = {
        userId: req.user.id,
        learningType: req.body.learningType,
        domain: req.body.domain,
        assessmentResults: req.body.assessmentResults || {}
      };

      console.log("Processed learning style data:", learningStyleData);

      const existingStyle = await storage.getLearningStyle(req.user.id);
      if (existingStyle) {
        console.log("Updating existing learning style for user:", req.user.id);
        // Explicitly pass each field to avoid validation issues
        const updatedStyle = await storage.updateLearningStyle(req.user.id, {
          learningType: learningStyleData.learningType,
          domain: learningStyleData.domain,
          assessmentResults: learningStyleData.assessmentResults
        });
        return res.json(updatedStyle);
      }

      console.log("Creating new learning style for user:", req.user.id);
      // Explicitly create with all required fields
      const learningStyle = await storage.createLearningStyle(learningStyleData);
      
      console.log("Learning style created successfully:", learningStyle);
      res.status(201).json(learningStyle);
    } catch (error) {
      console.error("Learning style error:", error);
      res.status(500).json({ message: "Failed to save learning style", error: String(error) });
    }
  });

  // Get user's learning style
  app.get("/api/learning-style", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const learningStyle = await storage.getLearningStyle(req.user.id);
      if (!learningStyle) {
        return res.status(404).json({ message: "Learning style not found" });
      }
      
      res.json(learningStyle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning style" });
    }
  });

  // Track user progress
  app.post("/api/progress/:courseId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const courseId = parseInt(req.params.courseId);
      const { progress, currentModuleId, completed } = req.body;

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if progress already exists
      const existingProgress = await storage.getUserProgressByCourse(req.user.id, courseId);
      
      if (existingProgress) {
        // Update existing progress
        const updatedProgress = await storage.updateUserProgress(req.user.id, courseId, {
          progress,
          currentModuleId,
          completed
        });
        return res.json(updatedProgress);
      }

      // Create new progress
      const newProgress = await storage.createUserProgress({
        userId: req.user.id,
        courseId,
        progress: progress || 0,
        currentModuleId,
        completed: completed || false
      });
      
      res.json(newProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get user progress for a specific course
  app.get("/api/progress/:courseId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const courseId = parseInt(req.params.courseId);
      const progress = await storage.getUserProgressByCourse(req.user.id, courseId);
      
      if (!progress) {
        return res.json({ progress: 0, completed: false });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get all user progress
  app.get("/api/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const allProgress = await storage.getUserAllProgress(req.user.id);
      res.json(allProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all progress" });
    }
  });

  // Forum discussions
  app.get("/api/discussions", async (req, res) => {
    try {
      const discussions = await storage.getAllForumDiscussions();
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  // Get discussions by domain
  app.get("/api/discussions/domain/:domain", async (req, res) => {
    try {
      const { domain } = req.params;
      const discussions = await storage.getForumDiscussionsByDomain(domain);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions by domain" });
    }
  });

  // Create new discussion
  app.post("/api/discussions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = insertForumDiscussionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid discussion data" });
      }

      const discussion = await storage.createForumDiscussion({
        ...result.data,
        userId: req.user.id,
      });
      
      res.status(201).json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });

  // Get discussion replies
  app.get("/api/discussions/:id/replies", async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const replies = await storage.getForumReplies(discussionId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  // Add reply to discussion
  app.post("/api/discussions/:id/replies", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const discussionId = parseInt(req.params.id);
      
      // Check if discussion exists
      const discussion = await storage.getForumDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }

      const result = insertForumReplySchema.safeParse({
        ...req.body,
        discussionId,
        userId: req.user.id,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid reply data" });
      }

      const reply = await storage.createForumReply(result.data);
      res.status(201).json(reply);
    } catch (error) {
      res.status(500).json({ message: "Failed to add reply" });
    }
  });

  // User achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const achievements = await storage.getUserAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // AI Tutor chat
  app.get("/api/ai-tutor/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const messages = await storage.getAiTutorMessages(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message to AI tutor
  app.post("/api/ai-tutor/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = insertAiTutorMessageSchema.safeParse({
        ...req.body,
        userId: req.user.id,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }

      // Get user's learning style
      const learningStyle = await storage.getLearningStyle(req.user.id);
      
      // Process message using our AI tutor implementation
      const response = await processAiTutorMessage(
        req.user.id,
        result.data.message,
        learningStyle?.domain,
        learningStyle?.learningType
      );

      res.status(201).json(response);
    } catch (error) {
      console.error("AI Tutor error:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Get assessment questions
  app.get("/api/assessment-questions", (req, res) => {
    // Static set of assessment questions
    const questions = [
      {
        id: 1,
        question: "When learning something new, I prefer to:",
        options: [
          { id: "a", text: "Read stories or examples about how it's used in real life", learningTypeIndicator: "story-based" },
          { id: "b", text: "Study the underlying principles and theories", learningTypeIndicator: "theory-based" },
          { id: "c", text: "Try it out myself through hands-on activities", learningTypeIndicator: "practical-based" }
        ]
      },
      {
        id: 2,
        question: "I understand concepts best when they are presented as:",
        options: [
          { id: "a", text: "Real-world scenarios or case studies", learningTypeIndicator: "story-based" },
          { id: "b", text: "Detailed explanations with facts and figures", learningTypeIndicator: "theory-based" },
          { id: "c", text: "Interactive exercises or simulations", learningTypeIndicator: "practical-based" }
        ]
      },
      {
        id: 3,
        question: "When faced with a problem, I typically:",
        options: [
          { id: "a", text: "Think about similar situations and how they were resolved", learningTypeIndicator: "story-based" },
          { id: "b", text: "Analyze it logically and break it down into parts", learningTypeIndicator: "theory-based" },
          { id: "c", text: "Try different approaches until I find one that works", learningTypeIndicator: "practical-based" }
        ]
      },
      {
        id: 4,
        question: "I find it easiest to remember information when:",
        options: [
          { id: "a", text: "It's presented in a narrative or storytelling format", learningTypeIndicator: "story-based" },
          { id: "b", text: "It's organized in structured outlines or diagrams", learningTypeIndicator: "theory-based" },
          { id: "c", text: "I've applied it or practiced it myself", learningTypeIndicator: "practical-based" }
        ]
      },
      {
        id: 5,
        question: "When watching educational videos, I prefer ones that:",
        options: [
          { id: "a", text: "Show how the concept affects real people or situations", learningTypeIndicator: "story-based" },
          { id: "b", text: "Provide comprehensive explanations of the subject", learningTypeIndicator: "theory-based" },
          { id: "c", text: "Demonstrate how to do something step by step", learningTypeIndicator: "practical-based" }
        ]
      }
    ];
    
    res.json(questions);
  });

  // Get available domains
  app.get("/api/domains", (req, res) => {
    // Static list of available domains/subjects
    const domains = [
      {
        id: "web-dev",
        name: "Web Development",
        description: "Learn to build modern websites and web applications",
        image: "https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg"
      },
      {
        id: "ai-ml",
        name: "Artificial Intelligence",
        description: "Explore machine learning, neural networks, and AI applications",
        image: "https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_1280.jpg"
      },
      {
        id: "cybersecurity",
        name: "Cybersecurity",
        description: "Master network security, ethical hacking, and threat prevention",
        image: "https://cdn.pixabay.com/photo/2017/05/10/22/28/cyber-security-2301730_1280.jpg"
      },
      {
        id: "mobile-dev",
        name: "Mobile Development",
        description: "Create apps for iOS and Android platforms",
        image: "https://cdn.pixabay.com/photo/2017/01/04/20/15/mobile-application-1953143_1280.jpg"
      },
      {
        id: "data-science",
        name: "Data Science",
        description: "Analyze data and extract valuable insights using statistical methods",
        image: "https://cdn.pixabay.com/photo/2017/01/17/12/41/analytics-1986901_1280.jpg"
      }
    ];
    
    res.json(domains);
  });

  const httpServer = createServer(app);

  return httpServer;
}
