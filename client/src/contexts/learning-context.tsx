import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "../hooks/use-toast";

interface LearningStyle {
  id?: number;
  userId?: number;
  learningType: string;
  domain: string;
  assessmentResults?: Record<string, any>;
}

interface WatchedResource {
  id: string;
  title: string;
  type: "video" | "article" | "tutorial" | "documentation" | "github" | "module";
  domain: string;
  completedAt: string;
  duration?: number;
  progress: number;
  platform: string;
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

interface Progress {
  id?: number;
  userId?: number;
  courseId: number;
  progress: number;
  completed: boolean;
  currentModuleId?: number;
  lastAccessed: string;
  watchHistory?: WatchedResource[];
}

interface DomainProgress {
  domain: string;
  completed: number;
  total: number;
  progress: number;
  level: string;
  lastWatched?: WatchedResource;
  milestones: {
    level: string;
    requirements: number;
    achieved: boolean;
  }[];
}

interface Achievement {
  type: string;
  xp: number;
  completedAt: string;
}

interface SyncResponse {
  stats: {
    completedResources: number;
    studyHours: number;
    lastActivityAt: string;
    totalProgress: number;
  };
  achievements?: Achievement[];
}

interface LearningContextState {
  learningStyle: string | null;
  domain: string | null;
  completedAssessment: boolean;
  currentCourse: Course | null;
  currentProgress: number;
  watchedResources: WatchedResource[];
  domainProgress: Record<string, DomainProgress>;
  isLoading: boolean;
  updateProgress: (courseId: number, resource: WatchedResource) => Promise<void>;
}

const LearningContext = createContext<LearningContextState>({
  learningStyle: null,
  domain: null,
  completedAssessment: false,
  currentCourse: null,
  currentProgress: 0,
  watchedResources: [],
  domainProgress: {},
  isLoading: true,
  updateProgress: async () => {},
});

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [watchedResources, setWatchedResources] = useState<WatchedResource[]>([]);
  const [domainProgress, setDomainProgress] = useState<Record<string, DomainProgress>>({});
  
  // Fetch learning style
  const { 
    data: learningStyle, 
    isLoading: isLoadingLearningStyle 
  } = useQuery<LearningStyle>({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Fetch user progress
  const { 
    data: progressData, 
    isLoading: isLoadingProgress 
  } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Fetch courses
  const { 
    data: courses, 
    isLoading: isLoadingCourses 
  } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });
  
  // Determine if assessment is completed
  const completedAssessment = !!learningStyle;
  
  // Get current course and calculate progress
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

      // Update watched resources from progress data
      const allWatchedResources = progressData.reduce<WatchedResource[]>((acc, progress) => {
        return progress.watchHistory ? [...acc, ...progress.watchHistory] : acc;
      }, []);
      setWatchedResources(allWatchedResources);
    }
  }, [progressData, courses]);

  // Calculate domain progress
  useEffect(() => {
    if (!watchedResources.length || !learningStyle?.domain) return;

    const domains = Array.from(new Set(watchedResources.map(r => r.domain)));
    const newDomainProgress: Record<string, DomainProgress> = {};

    domains.forEach(domain => {
      const domainResources = watchedResources.filter(r => r.domain === domain);
      const totalTargets: Record<string, number> = {
        "Web Development": 10,
        "Artificial Intelligence": 8,
        "Data Science": 8,
        "Cybersecurity": 6
      };

      const total = totalTargets[domain] || 10;
      const completed = domainResources.length;
      const progress = Math.round((completed / total) * 100);

      const milestones = [
        { level: "Beginner", requirements: 20, achieved: progress >= 20 },
        { level: "Intermediate", requirements: 40, achieved: progress >= 40 },
        { level: "Advanced", requirements: 80, achieved: progress >= 80 },
        { level: "Expert", requirements: 100, achieved: progress >= 100 }
      ];

      const getLevel = (progress: number) => {
        if (progress >= 80) return "Advanced";
        if (progress >= 40) return "Intermediate";
        return "Beginner";
      };

      newDomainProgress[domain] = {
        domain,
        completed,
        total,
        progress,
        level: getLevel(progress),
        lastWatched: domainResources[0],
        milestones
      };
    });

    setDomainProgress(newDomainProgress);
  }, [watchedResources, learningStyle?.domain]);

  // Update progress handler with optimistic updates and sync
  const updateProgress = async (courseId: number, resource: WatchedResource) => {
    try {
      // Optimistically update local state
      setWatchedResources(prev => [...prev, resource]);
      
      // Calculate domain progress before update
      const currentDomainProgress = domainProgress[resource.domain];
      const oldProgress = currentDomainProgress?.progress || 0;
      const oldLevel = currentDomainProgress?.level || "Beginner";
      
      // Call progress sync endpoint
      const syncResponse = await fetch("/api/progress/sync", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource,
          previousProgress: oldProgress,
          previousLevel: oldLevel,
          learningType: learningStyle?.learningType
        })
      });

      if (!syncResponse.ok) {
        throw new Error('Failed to sync progress');
      }

      const { stats, achievements } = await syncResponse.json() as SyncResponse;

      // Update course progress if applicable
      if (courseId) {
        const progressResponse = await fetch(`/api/progress/${courseId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            resource,
            timestamp: new Date().toISOString()
          })
        });

        if (!progressResponse.ok) {
          throw new Error('Failed to update course progress');
        }
      }

      // Handle achievements
      if (achievements?.length) {
        achievements.forEach((achievement: Achievement) => {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `You've earned the ${achievement.type} achievement! (+${achievement.xp} XP)`,
            duration: 5000,
          });
        });
      }

      // Check for domain level changes
      if (domainProgress[resource.domain]) {
        const newProgress = Math.round(((domainProgress[resource.domain].completed + 1) / domainProgress[resource.domain].total) * 100);
        
        // Check for milestone achievements
        const milestones = [20, 40, 80, 100];
        milestones.forEach(milestone => {
          if (oldProgress < milestone && newProgress >= milestone) {
            const level = milestone === 100 ? "Expert" : 
                         milestone >= 80 ? "Advanced" :
                         milestone >= 40 ? "Intermediate" : "Beginner";
            
            toast({
              title: "🎉 Level Up!",
              description: `You've reached ${level} level in ${resource.domain}!`,
              duration: 5000,
            });
          }
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setWatchedResources(prev => prev.filter(r => r.id !== resource.id));
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const value = {
    learningStyle: learningStyle?.learningType || null,
    domain: learningStyle?.domain || null,
    completedAssessment,
    currentCourse,
    currentProgress,
    watchedResources,
    domainProgress,
    isLoading: isLoadingLearningStyle || isLoadingProgress || isLoadingCourses,
    updateProgress
  };
  
  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
}

export type { Course, Progress, LearningStyle, WatchedResource, DomainProgress, Achievement, SyncResponse };
