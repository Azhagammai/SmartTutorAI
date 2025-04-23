import React, { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch learning style
  const { data: learningStyle, isLoading: isLoadingLearningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch user progress
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  // If user hasn't completed assessment, redirect to assessment page
  if (!isLoadingLearningStyle && !learningStyle) {
    return <Redirect to="/assessment" />;
  }

  // Get current course if user has progress
  const getCurrentCourse = () => {
    if (!courses || !userProgress || userProgress.length === 0) return null;
    
    // Find the course with the highest progress that's not completed
    const inProgressCourses = userProgress
      .filter(progress => !progress.completed)
      .sort((a, b) => b.progress - a.progress);
    
    if (inProgressCourses.length === 0) return null;
    
    const currentCourseProgress = inProgressCourses[0];
    const currentCourse = courses.find(course => course.id === currentCourseProgress.courseId);
    
    return {
      course: currentCourse,
      progress: currentCourseProgress
    };
  };

  const currentCourseData = getCurrentCourse();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div 
              className="bg-white shadow-sm rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!</h1>
                    {currentCourseData ? (
                      <p className="mt-1 text-gray-500">
                        You've completed {currentCourseData.progress.progress}% of {currentCourseData.course?.title}. Keep it up!
                      </p>
                    ) : (
                      <p className="mt-1 text-gray-500">Ready to continue your learning journey?</p>
                    )}
                  </div>
                  {currentCourseData && (
                    <div className="mt-4 md:mt-0">
                      <Button asChild>
                        <a href={`/learning-path?courseId=${currentCourseData.course?.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {currentCourseData && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${currentCourseData.progress.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-700">{currentCourseData.progress.progress}%</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Personalized Learning Section */}
            <motion.div 
              className="bg-white shadow-sm rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900">Your Learning Journey</h2>
                <p className="mt-1 text-gray-500">Based on your assessment, we've tailored a learning path for you.</p>
                
                {/* Learning Style */}
                {learningStyle && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="material-icons text-primary">psychology</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-primary-800">Your Learning Style: <span className="font-semibold capitalize">{learningStyle.learningType} Learner</span></h3>
                        <p className="mt-1 text-sm text-primary-700">
                          {learningStyle.learningType === 'story-based' && "You learn best through real-world examples and narratives. We'll prioritize case studies and context-rich materials."}
                          {learningStyle.learningType === 'theory-based' && "You learn best through systematic explanations and theoretical frameworks. We'll prioritize comprehensive guides and in-depth analysis."}
                          {learningStyle.learningType === 'practical-based' && "You learn best through hands-on practice and application. We'll prioritize interactive exercises and real-world projects."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* AI Tutor and Learning Path */}
                <div className="mt-4 flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                  <AiTutorCard domain={learningStyle?.domain} learningStyle={learningStyle?.learningType} />
                  <LearningProgress />
                </div>
              </div>
            </motion.div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Course */}
              <motion.div 
                className="md:col-span-2 bg-white shadow-sm rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {currentCourseData ? (
                  <CourseCard course={currentCourseData.course} progress={currentCourseData.progress} />
                ) : (
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Start Your Learning Journey</h2>
                    <p className="text-gray-600 mb-6">
                      Explore our courses and start learning today with content tailored to your
                      {learningStyle?.learningType && <span className="font-medium"> {learningStyle.learningType}</span>} learning style.
                    </p>
                    <Button asChild>
                      <a href="/learning-path">Browse Courses</a>
                    </Button>
                  </div>
                )}
              </motion.div>
              
              {/* Community & Progress */}
              <div className="space-y-6">
                {/* Learning Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <UserStats />
                </motion.div>
                
                {/* Community Activity */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <CommunityUpdates />
                </motion.div>
                
                {/* Upcoming Tasks */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <UpcomingTasks />
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
