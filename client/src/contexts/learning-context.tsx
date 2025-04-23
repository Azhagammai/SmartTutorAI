import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface LearningContextProps {
  learningStyle: string | null;
  domain: string | null;
  completedAssessment: boolean;
  currentCourse: any | null;
  currentProgress: number;
  isLoading: boolean;
}

const LearningContext = createContext<LearningContextProps>({
  learningStyle: null,
  domain: null,
  completedAssessment: false,
  currentCourse: null,
  currentProgress: 0,
  isLoading: true,
});

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentCourse, setCurrentCourse] = useState<any | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  
  // Fetch learning style
  const { 
    data: learningStyle, 
    isLoading: isLoadingLearningStyle 
  } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch user progress
  const { 
    data: progressData, 
    isLoading: isLoadingProgress 
  } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Fetch courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses 
  } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });
  
  // Determine if assessment is completed
  const completedAssessment = !!learningStyle;
  
  // Get current course and progress
  useEffect(() => {
    if (progressData && progressData.length > 0 && courses) {
      // Find the most recent course with progress
      const sortedProgress = [...progressData].sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
      
      if (sortedProgress.length > 0) {
        const latestProgress = sortedProgress[0];
        const course = courses.find(c => c.id === latestProgress.courseId);
        
        if (course) {
          setCurrentCourse(course);
          setCurrentProgress(latestProgress.progress);
        }
      }
    }
  }, [progressData, courses]);

  const value = {
    learningStyle: learningStyle?.learningType || null,
    domain: learningStyle?.domain || null,
    completedAssessment,
    currentCourse,
    currentProgress,
    isLoading: isLoadingLearningStyle || isLoadingProgress || isLoadingCourses
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  return useContext(LearningContext);
}
