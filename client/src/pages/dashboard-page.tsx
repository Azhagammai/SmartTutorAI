import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import LearningProgress from "@/components/learning-progress";
import AiTutorCard from "@/components/ai-tutor-card";
import CourseCard from "@/components/course-card";
import UserStats from "@/components/user-stats";
import CommunityUpdates from "@/components/community-updates";
import UpcomingTasks from "@/components/upcoming-tasks";
import AiAssistantButton from "@/components/ai-assistant-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Play, Target, Trophy, Star, Activity, Brain, BarChart } from "lucide-react";
import { motion } from "framer-motion";

// Define the LearningStyle type for type safety
interface LearningStyle {
  id?: number;
  userId?: number;
  learningType: string;
  domain: string;
  assessmentResults?: Record<string, any>;
}

// Define Progress and Course types for type safety
interface Progress {
  id?: number;
  userId?: number;
  courseId: number;
  progress: number;
  completed: boolean;
  currentModuleId?: number;
}
interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  difficulty: string;
  estimatedDuration: string;
  thumbnail?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch learning style
  const { data: learningStyle, isLoading: isLoadingLearningStyle } = useQuery<LearningStyle | null>({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch user progress
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  // If user hasn't completed assessment, redirect to assessment page
  if (!isLoadingLearningStyle && (!learningStyle || !learningStyle.domain || !learningStyle.learningType)) {
    return <Redirect to="/assessment" />;
  }

  // Get current course if user has progress
  const getCurrentCourse = () => {
    if (!courses || !userProgress || !(userProgress as Progress[]).length) return null;
    const progressArr = userProgress as Progress[];
    
    // Find the course with the highest progress that's not completed
    const inProgressCourses = progressArr
      .filter(progress => !progress.completed)
      .sort((a, b) => b.progress - a.progress);
    
    if (inProgressCourses.length === 0) return null;
    
    const currentCourseProgress = inProgressCourses[0];
    const currentCourse = courses.find(course => course.id === currentCourseProgress.courseId);
    
    return {
      course: currentCourse,
      progress: { ...currentCourseProgress, id: currentCourseProgress.id ?? 0, userId: currentCourseProgress.userId ?? 0 },
    };
  };

  const currentCourseData = getCurrentCourse();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            {/* Hero Section with Glassmorphism */}
            <motion.div 
              className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden border border-white/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-8 relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                
                <div className="relative">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
                      </h1>
                      {currentCourseData ? (
                        <p className="mt-2 text-gray-600">
                          You're making great progress! You've completed {currentCourseData.progress.progress}% of {currentCourseData.course?.title}.
                        </p>
                      ) : (
                        <p className="mt-2 text-gray-600">Ready to continue your learning journey?</p>
                      )}
                    </div>
                    
                    {currentCourseData && (
                      <div className="mt-4 md:mt-0">
                        <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                          <a href={`/learning-path?courseId=${currentCourseData.course?.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Continue Learning
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {currentCourseData && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${currentCourseData.progress.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                          {currentCourseData.progress.progress}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Learning Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Learning Streak"
                value="0 days"
                icon={<Activity className="h-5 w-5 text-primary" />}
                trend="Start learning to build your streak!"
              />
              <StatsCard 
                title="Course Progress"
                value={`${currentCourseData?.progress.progress || 0}%`}
                icon={<Target className="h-5 w-5 text-primary" />}
                trend="Ready to begin"
              />
              <StatsCard 
                title="Achievements"
                value="0 earned"
                icon={<Trophy className="h-5 w-5 text-primary" />}
                trend="Complete courses to earn achievements"
              />
              <StatsCard 
                title="Knowledge Score"
                value="0"
                icon={<Brain className="h-5 w-5 text-primary" />}
                trend="Learn to increase your score"
              />
            </div>

            {/* Learning Style & AI Tutor Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <motion.div
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Learning Journey</h2>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">
                            Your Learning Style: <span className="text-primary capitalize">{learningStyle?.learningType} Learner</span>
                          </h3>
                          <p className="mt-1 text-gray-600">
                            {learningStyle?.learningType === 'story-based' && 
                              "You learn best through real-world examples and narratives. We've curated content rich in case studies and practical contexts."}
                            {learningStyle?.learningType === 'theory-based' && 
                              "You thrive on understanding core principles and frameworks. We've organized content to build strong theoretical foundations."}
                            {learningStyle?.learningType === 'practical-based' && 
                              "You excel with hands-on practice. We've prioritized interactive exercises and real-world projects."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Course Preview */}
                    {currentCourseData && (
                      <div className="mt-6">
                        <CourseCard 
                          course={currentCourseData.course}
                          progress={currentCourseData.progress}
                          learningStyle={learningStyle?.learningType}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* AI Tutor Section */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <AiTutorCard 
                    domain={learningStyle?.domain} 
                    learningStyle={learningStyle?.learningType}
                  />
                </motion.div>
              </div>
            </div>

            {/* Activity & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <LearningProgress />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <CommunityUpdates />
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <UserStats />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <UpcomingTasks />
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Floating AI Assistant Button */}
      <AiAssistantButton 
        domain={learningStyle?.domain}
        learningStyle={learningStyle?.learningType}
      />
      
      <MobileNavigation />
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="text-sm text-primary mt-2">{trend}</p>
      </CardContent>
    </Card>
  );
}
