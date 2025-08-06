import { users, type User, type InsertUser, type LearningStyle, type InsertLearningStyle, type Course, type InsertCourse, type Module, type InsertModule, type Quiz, type InsertQuiz, type UserProgress, type InsertUserProgress, type ForumDiscussion, type InsertForumDiscussion, type ForumReply, type InsertForumReply, type UserAchievement, type InsertUserAchievement, type AiTutorMessage, type InsertAiTutorMessage, type UserStats, type Achievement, type WatchedResource, type LearningLevel, type ResourceType } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Learning Styles methods
  getLearningStyle(userId: number): Promise<LearningStyle | undefined>;
  createLearningStyle(learningStyle: InsertLearningStyle): Promise<LearningStyle>;
  updateLearningStyle(userId: number, learningStyle: Partial<InsertLearningStyle>): Promise<LearningStyle | undefined>;

  // Courses methods
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getCoursesByDomain(domain: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Modules methods
  getModule(id: number): Promise<Module | undefined>;
  getModulesByCourse(courseId: number): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;

  // Quizzes methods
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizByModule(moduleId: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;

  // User Progress methods
  getUserProgressByCourse(userId: number, courseId: number): Promise<UserProgress | undefined>;
  getUserAllProgress(userId: number): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, courseId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined>;

  // Forum methods
  getForumDiscussion(id: number): Promise<ForumDiscussion | undefined>;
  getAllForumDiscussions(): Promise<ForumDiscussion[]>;
  getForumDiscussionsByDomain(domain: string): Promise<ForumDiscussion[]>;
  createForumDiscussion(discussion: InsertForumDiscussion): Promise<ForumDiscussion>;
  getForumReplies(discussionId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;

  // User Achievements methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;

  // AI Tutor methods
  getAiTutorMessages(userId: number): Promise<AiTutorMessage[]>;
  createAiTutorMessage(message: InsertAiTutorMessage): Promise<AiTutorMessage>;

  // User Stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(userId: number, stats: UserStats): Promise<UserStats>;

  // Achievements methods
  addAchievement(userId: number, achievement: Achievement): Promise<void>;
  getAchievements(userId: number): Promise<Achievement[]>;

  // Watched Resources methods
  getWatchedResources(userId: number): Promise<WatchedResource[]>;
  addWatchedResource(userId: number, resource: WatchedResource): Promise<void>;

  // Session store
  sessionStore: session.SessionStore;
}

// Define UserStats and Achievement interfaces
interface UserStats {
  completedResources: number;
  studyHours: number;
  lastActivityAt: Date;
  totalProgress: number;
  streakDays: number;
  level: string;
  xp: number;
}

interface Achievement {
  type: string;
  completedAt: Date;
  xp: number;
}

interface WatchedResource {
  userId: number;
  resourceId: number;
  resourceType: ResourceType;
  watchedAt: Date;
}

// Implement Memory Storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private learningStyles: Map<number, LearningStyle>;
  private courses: Map<number, Course>;
  private modules: Map<number, Module>;
  private quizzes: Map<number, Quiz>;
  private userProgress: Map<string, UserProgress>; // key = userId_courseId
  private forumDiscussions: Map<number, ForumDiscussion>;
  private forumReplies: Map<number, ForumReply>;
  private userAchievements: Map<number, UserAchievement>;
  private aiTutorMessages: Map<number, AiTutorMessage>;
  private userStats: Map<number, UserStats>;
  private achievements: Map<number, Achievement[]>;
  private watchedResources: Map<number, WatchedResource[]>;

  sessionStore: session.SessionStore;
  currentId: {
    users: number;
    learningStyles: number;
    courses: number;
    modules: number;
    quizzes: number;
    userProgress: number;
    forumDiscussions: number;
    forumReplies: number;
    userAchievements: number;
    aiTutorMessages: number;
  }

  constructor() {
    this.users = new Map();
    this.learningStyles = new Map();
    this.courses = new Map();
    this.modules = new Map();
    this.quizzes = new Map();
    this.userProgress = new Map();
    this.forumDiscussions = new Map();
    this.forumReplies = new Map();
    this.userAchievements = new Map();
    this.aiTutorMessages = new Map();
    this.userStats = new Map();
    this.achievements = new Map();
    this.watchedResources = new Map();
    
    this.currentId = {
      users: 1,
      learningStyles: 1,
      courses: 1,
      modules: 1,
      quizzes: 1,
      userProgress: 1,
      forumDiscussions: 1,
      forumReplies: 1,
      userAchievements: 1,
      aiTutorMessages: 1,
    };

    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Initialize with some sample courses
    this.initializeSampleData();
  }

  // Private method to initialize sample courses data
  private async initializeSampleData() {
    // Web Development Course
    const webDevCourse: InsertCourse = {
      title: "Web Development Fundamentals",
      description: "Learn the basics of web development including HTML, CSS, and JavaScript.",
      domain: "Web Development",
      difficulty: "beginner",
      estimatedDuration: "4 weeks",
      thumbnail: "https://cdn.pixabay.com/photo/2016/11/23/14/45/coding-1853305_1280.jpg"
    };
    const webDev = await this.createCourse(webDevCourse);

    // AI/ML Course
    const aiCourse: InsertCourse = {
      title: "Introduction to Artificial Intelligence",
      description: "Learn the fundamentals of AI, machine learning, and neural networks.",
      domain: "Artificial Intelligence",
      difficulty: "intermediate",
      estimatedDuration: "6 weeks",
      thumbnail: "https://cdn.pixabay.com/photo/2019/04/15/11/47/artificial-intelligence-4129650_1280.jpg"
    };
    const ai = await this.createCourse(aiCourse);

    // Cybersecurity Course
    const cyberCourse: InsertCourse = {
      title: "Cybersecurity Essentials",
      description: "Learn the basics of cybersecurity, network security, and ethical hacking.",
      domain: "Cybersecurity",
      difficulty: "intermediate",
      estimatedDuration: "8 weeks",
      thumbnail: "https://cdn.pixabay.com/photo/2017/01/19/07/55/cyber-security-1991324_1280.jpg"
    };
    await this.createCourse(cyberCourse);

    // Add modules for Web Development course
    const htmlModule: InsertModule = {
      courseId: webDev.id,
      title: "HTML Fundamentals",
      description: "Learn the basics of HTML and how to structure web pages.",
      content: "<h1>Introduction to HTML</h1><p>HTML is the standard markup language for Web pages...</p>",
      videoUrl: "https://www.youtube.com/embed/UB1O30fR-EE",
      order: 1
    };
    await this.createModule(htmlModule);

    const cssModule: InsertModule = {
      courseId: webDev.id,
      title: "CSS Styling",
      description: "Learn how to style web pages using CSS.",
      content: "<h1>Introduction to CSS</h1><p>CSS is the language we use to style HTML documents...</p>",
      videoUrl: "https://www.youtube.com/embed/1PnVor36_40",
      order: 2
    };
    await this.createModule(cssModule);

    const jsModule: InsertModule = {
      courseId: webDev.id,
      title: "JavaScript Functions",
      description: "Learn how to create and use functions to organize your code.",
      content: "<h1>JavaScript Functions</h1><p>Functions are one of the fundamental building blocks in JavaScript...</p>",
      videoUrl: "https://www.youtube.com/embed/N8ap4k_1QEQ",
      order: 3
    };
    const jsModuleCreated = await this.createModule(jsModule);

    // Add quiz for JavaScript module
    const jsQuiz: InsertQuiz = {
      moduleId: jsModuleCreated.id,
      title: "JavaScript Functions Quiz",
      description: "Test your knowledge of JavaScript functions",
      questions: [
        {
          id: 1,
          question: "Which of the following correctly defines a JavaScript function?",
          options: [
            { id: "a", text: "function myFunction() {}", correct: true },
            { id: "b", text: "function:myFunction() {}", correct: false },
            { id: "c", text: "myFunction => function() {}", correct: false }
          ]
        },
        {
          id: 2,
          question: "What does the 'return' keyword do in a function?",
          options: [
            { id: "a", text: "Stops the function execution and returns a value", correct: true },
            { id: "b", text: "Prints a value to the console", correct: false },
            { id: "c", text: "Creates a loop inside the function", correct: false }
          ]
        }
      ]
    };
    await this.createQuiz(jsQuiz);

    // Add modules for AI course
    const introAIModule: InsertModule = {
      courseId: ai.id,
      title: "Introduction to AI",
      description: "Learn the basics of artificial intelligence and its applications.",
      content: "<h1>What is Artificial Intelligence?</h1><p>Artificial Intelligence (AI) refers to the simulation of human intelligence in machines...</p>",
      videoUrl: "https://www.youtube.com/embed/mJeNghZXtMo",
      order: 1
    };
    await this.createModule(introAIModule);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Learning Styles methods
  async getLearningStyle(userId: number): Promise<LearningStyle | undefined> {
    return Array.from(this.learningStyles.values()).find(
      (style) => style.userId === userId,
    );
  }

  async createLearningStyle(learningStyle: InsertLearningStyle): Promise<LearningStyle> {
    const id = this.currentId.learningStyles++;
    const createdAt = new Date();
    const style: LearningStyle = { ...learningStyle, id, createdAt };
    this.learningStyles.set(id, style);
    return style;
  }

  async updateLearningStyle(userId: number, learningStyle: Partial<InsertLearningStyle>): Promise<LearningStyle | undefined> {
    const style = await this.getLearningStyle(userId);
    if (!style) return undefined;

    const updatedStyle: LearningStyle = { ...style, ...learningStyle };
    this.learningStyles.set(style.id, updatedStyle);
    return updatedStyle;
  }

  // Courses methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCoursesByDomain(domain: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.domain === domain,
    );
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentId.courses++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  // Modules methods
  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async getModulesByCourse(courseId: number): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter((module) => module.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async createModule(module: InsertModule): Promise<Module> {
    const id = this.currentId.modules++;
    const newModule: Module = { ...module, id };
    this.modules.set(id, newModule);
    return newModule;
  }

  // Quizzes methods
  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizByModule(moduleId: number): Promise<Quiz | undefined> {
    return Array.from(this.quizzes.values()).find(
      (quiz) => quiz.moduleId === moduleId,
    );
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentId.quizzes++;
    const newQuiz: Quiz = { ...quiz, id };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  // User Progress methods
  async getUserProgressByCourse(userId: number, courseId: number): Promise<UserProgress | undefined> {
    const key = `${userId}_${courseId}`;
    return this.userProgress.get(key);
  }

  async getUserAllProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId,
    );
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentId.userProgress++;
    const lastAccessed = new Date();
    const newProgress: UserProgress = { ...progress, id, lastAccessed };
    const key = `${progress.userId}_${progress.courseId}`;
    this.userProgress.set(key, newProgress);
    return newProgress;
  }

  async updateUserProgress(userId: number, courseId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const key = `${userId}_${courseId}`;
    const existingProgress = this.userProgress.get(key);
    if (!existingProgress) return undefined;

    const lastAccessed = new Date();
    const updatedProgress: UserProgress = { ...existingProgress, ...progress, lastAccessed };
    this.userProgress.set(key, updatedProgress);
    return updatedProgress;
  }

  // Forum methods
  async getForumDiscussion(id: number): Promise<ForumDiscussion | undefined> {
    return this.forumDiscussions.get(id);
  }

  async getAllForumDiscussions(): Promise<ForumDiscussion[]> {
    return Array.from(this.forumDiscussions.values());
  }

  async getForumDiscussionsByDomain(domain: string): Promise<ForumDiscussion[]> {
    return Array.from(this.forumDiscussions.values()).filter(
      (discussion) => discussion.domain === domain,
    );
  }

  async createForumDiscussion(discussion: InsertForumDiscussion): Promise<ForumDiscussion> {
    const id = this.currentId.forumDiscussions++;
    const createdAt = new Date();
    const newDiscussion: ForumDiscussion = { ...discussion, id, createdAt };
    this.forumDiscussions.set(id, newDiscussion);
    return newDiscussion;
  }

  async getForumReplies(discussionId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values()).filter(
      (reply) => reply.discussionId === discussionId,
    );
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const id = this.currentId.forumReplies++;
    const createdAt = new Date();
    const newReply: ForumReply = { ...reply, id, createdAt };
    this.forumReplies.set(id, newReply);
    return newReply;
  }

  // User Achievements methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (achievement) => achievement.userId === userId,
    );
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentId.userAchievements++;
    const earnedAt = new Date();
    const newAchievement: UserAchievement = { ...achievement, id, earnedAt };
    this.userAchievements.set(id, newAchievement);
    return newAchievement;
  }

  // AI Tutor methods
  async getAiTutorMessages(userId: number): Promise<AiTutorMessage[]> {
    return Array.from(this.aiTutorMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createAiTutorMessage(message: InsertAiTutorMessage): Promise<AiTutorMessage> {
    const id = this.currentId.aiTutorMessages++;
    const createdAt = new Date();
    const newMessage: AiTutorMessage = { ...message, id, createdAt };
    this.aiTutorMessages.set(id, newMessage);
    return newMessage;
  }

  // User Stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    if (!this.userStats.has(userId)) {
      // Initialize default stats if none exist
      const defaultStats: UserStats = {
        userId,
        completedResources: 0,
        studyHours: 0,
        lastActivityAt: new Date(),
        totalProgress: 0,
        streakDays: 0,
        level: "Beginner",
        xp: 0
      };
      this.userStats.set(userId, defaultStats);
      return defaultStats;
    }
    return this.userStats.get(userId);
  }

  async updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    const updatedStats = { ...existingStats, ...stats } as UserStats;
    this.userStats.set(userId, updatedStats);
    return updatedStats;
  }

  // Achievements methods
  async addAchievement(userId: number, achievement: Achievement): Promise<void> {
    const userAchievements = await this.getAchievements(userId);
    if (!userAchievements.some(a => a.type === achievement.type)) {
      userAchievements.push(achievement);
      this.achievements.set(userId, userAchievements);
    }
  }

  async getAchievements(userId: number): Promise<Achievement[]> {
    return this.achievements.get(userId) || [];
  }

  // Watched Resources methods
  async getWatchedResources(userId: number): Promise<WatchedResource[]> {
    return this.watchedResources.get(userId) || [];
  }

  async addWatchedResource(userId: number, resource: WatchedResource): Promise<void> {
    const resources = await this.getWatchedResources(userId);
    resources.push(resource);
    this.watchedResources.set(userId, resources);
  }
}

export const storage = new MemStorage();
