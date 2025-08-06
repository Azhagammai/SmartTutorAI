import { useMutation, useQueryClient } from "@tanstack/react-query";

interface WatchHistory {
  moduleId: number;
  title: string;
  type: string;
  completedAt: string;
  duration?: number;
  progress: number;
}

interface ModuleProgress {
  moduleId: number;
  courseId: number;
  completed: boolean;
  timeSpent: number; // in seconds
  quizScore?: number;
  watchHistory?: WatchHistory;
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, progress, currentModuleId }: { 
      courseId: number;
      progress: number;
      currentModuleId: number;
    }) => {
      const response = await fetch(`/api/progress/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress,
          currentModuleId,
          completed: progress === 100
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    }
  });
}

export function useUpdateModuleProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleProgress: ModuleProgress) => {
      const response = await fetch(`/api/progress/${moduleProgress.courseId}/module/${moduleProgress.moduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleProgress)
      });

      if (!response.ok) {
        throw new Error('Failed to update module progress');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate both progress queries
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/progress/${variables.courseId}/module/${variables.moduleId}`] 
      });
    }
  });
}

// Calculate course progress based on completed modules
export function calculateCourseProgress(
  modules: { id: number }[], 
  completedModuleIds: number[]
): number {
  if (!modules.length) return 0;
  return Math.round((completedModuleIds.length / modules.length) * 100);
}

// Helper to track time spent on a module
export class ModuleTimeTracker {
  private startTime: number;
  private totalTime: number;

  constructor() {
    this.startTime = 0;
    this.totalTime = 0;
  }

  start() {
    this.startTime = Date.now();
  }

  pause() {
    if (this.startTime) {
      this.totalTime += Date.now() - this.startTime;
      this.startTime = 0;
    }
  }

  resume() {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
  }

  getTotalTimeInSeconds(): number {
    const currentTime = this.startTime ? Date.now() - this.startTime : 0;
    return Math.round((this.totalTime + currentTime) / 1000);
  }

  reset() {
    this.startTime = 0;
    this.totalTime = 0;
  }
}
