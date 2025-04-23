import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User related schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

// Learning Styles
export const learningStyles = pgTable("learning_styles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  learningType: text("learning_type").notNull(), // story-based, theory-based, practical-based
  domain: text("domain").notNull(), // Web Dev, AI, Cybersecurity, etc.
  assessmentResults: json("assessment_results"), // JSON results from the assessment
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLearningStyleSchema = createInsertSchema(learningStyles).omit({
  id: true,
  createdAt: true,
}).partial({
  userId: true,
  assessmentResults: true,
});

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  domain: text("domain").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  estimatedDuration: text("estimated_duration").notNull(), // e.g., "4 weeks"
  thumbnail: text("thumbnail"),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

// Modules (Lessons within a course)
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(), // HTML content or path to content
  videoUrl: text("video_url"),
  order: integer("order").notNull(),
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  description: text("description"),
  questions: json("questions").notNull(), // JSON array of quiz questions
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
});

// User Progress
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: integer("progress").notNull().default(0), // percentage of course completed
  lastAccessed: timestamp("last_accessed").defaultNow(),
  completed: boolean("completed").default(false),
  currentModuleId: integer("current_module_id").references(() => modules.id),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

// Forum Discussions
export const forumDiscussions = pgTable("forum_discussions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  domain: text("domain").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertForumDiscussionSchema = createInsertSchema(forumDiscussions).omit({
  id: true,
});

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull().references(() => forumDiscussions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // streak, badge, points, etc.
  value: integer("value").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
});

// AI Tutor Messages
export const aiTutorMessages = pgTable("ai_tutor_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiTutorMessageSchema = createInsertSchema(aiTutorMessages).omit({
  id: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLearningStyle = z.infer<typeof insertLearningStyleSchema>;
export type LearningStyle = typeof learningStyles.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertForumDiscussion = z.infer<typeof insertForumDiscussionSchema>;
export type ForumDiscussion = typeof forumDiscussions.$inferSelect;

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertAiTutorMessage = z.infer<typeof insertAiTutorMessageSchema>;
export type AiTutorMessage = typeof aiTutorMessages.$inferSelect;

// Assessment question schema for front-end validation
export const assessmentQuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    learningTypeIndicator: z.string()
  })),
});

export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

// Domain selection schema for front-end validation
export const domainSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string().optional(),
});

export type DomainSelection = z.infer<typeof domainSelectionSchema>;

// Learning path schema
export const learningPathSchema = z.object({
  userId: z.number(),
  domain: z.string(),
  learningType: z.string(),
  courses: z.array(z.number()),
});

export type LearningPath = z.infer<typeof learningPathSchema>;
