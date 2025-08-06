import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuizComponent from "@/components/quiz-component";
import { Play, Clock, BookmarkIcon, Share2, Trophy } from "lucide-react";
import { useUpdateProgress, useUpdateModuleProgress, ModuleTimeTracker } from "@/lib/progress";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useLearning } from "@/contexts/learning-context";

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  questions: {
    id: number;
    question: string;
    options: {
      id: string;
      text: string;
      correct: boolean;
    }[];
  }[];
}

interface LearningStyle {
  id?: number;
  userId?: number;
  learningType: string;
  domain: string;
  assessmentResults?: Record<string, any>;
}

interface CourseCardProps {
  course?: {
    id: number;
    title: string;
    description: string;
    domain: string;
    difficulty: string;
    estimatedDuration: string;
    thumbnail?: string;
  };
  progress: {
    id: number;
    userId: number;
    courseId: number;
    progress: number;
    completed: boolean;
    currentModuleId?: number;
  };
  learningStyle?: string;
}

interface ModuleProgress {
  moduleId: number;
  courseId: number;
  completed: boolean;
  timeSpent: number; 
  quizScore?: number;
  watchHistory?: {
    moduleId: number;
    title: string;
    type: string;
    completedAt: string;
    duration?: number;
    progress: number;
  };
}

export default function CourseCard({ course, progress, learningStyle }: CourseCardProps) {
  const { updateProgress: updateContextProgress } = useLearning();
  const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: [`/api/courses/${course?.id}/modules`],
    enabled: !!course,
  });

  // State for module progress
  const [timeTracker] = useState(() => new ModuleTimeTracker());
  const [quizScore, setQuizScore] = useState<number | undefined>();
  const updateProgress = useUpdateProgress();
  const updateModuleProgress = useUpdateModuleProgress();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current module
  const currentModule = modules?.find((module: Module) => 
    progress?.currentModuleId ? module.id === progress.currentModuleId : module.order === 1
  );

  // Fetch quiz for the module
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery<Quiz>({
    queryKey: [`/api/modules/${currentModule?.id}/quiz`],
    enabled: !!currentModule,
  });

  // Start tracking time when module loads
  useEffect(() => {
    if (currentModule) {
      timeTracker.start();
      return () => timeTracker.pause();
    }
  }, [currentModule, timeTracker]);

  // Handle module completion
  const handleModuleComplete = async () => {
    if (!course || !currentModule || !modules) return;

    try {
      // Track time spent and validate minimum engagement
      const timeSpentInMinutes = timeTracker.getTotalTimeInSeconds() / 60;
      const minRequiredTime = 5; // Minimum 5 minutes per module
      
      if (timeSpentInMinutes < minRequiredTime && !quizScore) {
        toast({
          title: "More time needed",
          description: `Please spend at least ${minRequiredTime} minutes reviewing the material before completing the module.`,
          variant: "destructive"
        });
        return;
      }

      // Update module progress
      await updateModuleProgress.mutateAsync({
        moduleId: currentModule.id,
        courseId: course.id,
        completed: true,
        timeSpent: timeTracker.getTotalTimeInSeconds(),
        quizScore,
        watchHistory: {
          moduleId: currentModule.id,
          title: currentModule.title,
          type: "module",
          completedAt: new Date().toISOString(),
          duration: timeSpentInMinutes,
          progress: 100
        }
      });

      // Find next module
      const nextModule = modules.find(m => m.order === currentModule.order + 1);
      
      // Calculate new course progress including completion time criteria
      const newProgress = Math.min(
        Math.round((currentModule.order / modules.length) * 100),
        100
      );

      // Update course progress
      await updateProgress.mutateAsync({
        courseId: course.id,
        progress: newProgress,
        currentModuleId: nextModule?.id ?? currentModule.id
      });

      // Update learning context
      updateContextProgress(course.id, {
        id: `${course.id}-${currentModule.id}`,
        title: currentModule.title,
        type: "module",
        domain: course.domain,
        completedAt: new Date().toISOString(),
        duration: Math.round(timeSpentInMinutes),
        progress: 100,
        platform: "Course"
      });

      // Show encouraging message
      const messages = [
        "🌟 Fantastic progress! You're mastering this content!",
        "🎯 Great work! Keep up the momentum!",
        "💪 You're crushing it! On to the next challenge!",
        "🎉 Excellent job! You're one step closer to your goals!",
        "⭐ Amazing progress! Your dedication is showing!"
      ];
      
      toast({
        title: "Achievement Unlocked!",
        description: messages[Math.floor(Math.random() * messages.length)],
        duration: 5000,
      });

      // Reset timer for next module
      timeTracker.reset();
      setQuizScore(undefined);

      // Refresh progress queries
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/resources"] });

      // Show special milestone messages
      if (newProgress >= 100) {
        toast({
          title: "🏆 Course Completed!",
          description: "Congratulations! You've mastered this course. Time to celebrate your achievement!",
          duration: 6000,
        });
      } else if (newProgress >= 75 && progress.progress < 75) {
        toast({
          title: "🎯 Major Milestone!",
          description: "You've completed 75% of the course! The finish line is in sight!",
          duration: 5000,
        });
      } else if (newProgress >= 50 && progress.progress < 50) {
        toast({
          title: "💫 Halfway There!",
          description: "You've reached the halfway point! Keep up the great work!",
          duration: 5000,
        });
      } else if (newProgress >= 25 && progress.progress < 25) {
        toast({
          title: "🌟 Getting Started!",
          description: "You've completed 25% of the course! You're building great momentum!",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    if (score >= 70) { // Pass threshold
      handleModuleComplete();
    } else {
      toast({
        title: "Quiz score",
        description: "You need a score of 70% or higher to complete this module. Review the material and try again!",
        variant: "destructive"
      });
    }
  };

  // Track video watching and update progress
  const handleVideoComplete = async () => {
    if (!course || !currentModule) return;

    try {
      const timeSpentInMinutes = timeTracker.getTotalTimeInSeconds() / 60;
      const minRequiredTime = 5; // Minimum 5 minutes per video

      if (timeSpentInMinutes < minRequiredTime) {
        toast({
          title: "More time needed",
          description: `Please watch at least ${minRequiredTime} minutes of the video before marking as complete.`,
          variant: "destructive"
        });
        return;
      }

      // Update module progress with video completion
      await updateModuleProgress.mutateAsync({
        moduleId: currentModule.id,
        courseId: course.id,
        completed: true,
        timeSpent: timeTracker.getTotalTimeInSeconds(),
        watchHistory: {
          moduleId: currentModule.id,
          title: currentModule.title,
          type: "video",
          completedAt: new Date().toISOString(),
          duration: timeSpentInMinutes,
          progress: 100
        }
      });

      // Update learning context
      updateContextProgress(course.id, {
        id: `${course.id}-${currentModule.id}-video`,
        title: currentModule.title,
        type: "video",
        domain: course.domain,
        completedAt: new Date().toISOString(),
        duration: Math.round(timeSpentInMinutes),
        progress: 100,
        platform: "Course Video"
      });

      // Show encouraging message
      toast({
        title: "🎥 Video Completed!",
        description: "Great work! You're making excellent progress!",
        duration: 3000
      });

      // Refresh progress queries
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/resources"] });
    } catch (error) {
      console.error("Error updating video progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  // If no course provided, show placeholder
  if (!course) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Current Course</h2>
        <p className="mt-4 text-gray-500">No course selected yet. Choose a course from your learning path to start.</p>
      </div>
    );
  }

  // Get personalized content format based on learning style
  const getPersonalizedContent = (content: string): string => {
    if (!learningStyle) return content;

    const commonStyles = "p-4 my-4 rounded-lg border";
    
    switch (learningStyle) {
      case "story-based":
        return content.replace(
          /(<h[1-6]>.*?<\/h[1-6]>)/g, 
          (match, header) => `${header}
            <div class="${commonStyles} bg-yellow-50 border-yellow-100">
              <h4 class="font-medium mb-2">Real-World Example</h4>
              <p>Let's see how this concept applies in practice...</p>
            </div>`
        );
      case "theory-based":
        return content.replace(
          /(<h[1-6]>.*?<\/h[1-6]>)/g,
          (match, header) => `${header}
            <div class="${commonStyles} bg-blue-50 border-blue-100">
              <h4 class="font-medium mb-2">Theoretical Framework</h4>
              <p>Understanding the underlying principles...</p>
            </div>`
        );
      case "practical-based":
        return content.replace(
          /(<h[1-6]>.*?<\/h[1-6]>)/g,
          (match, header) => `${header}
            <div class="${commonStyles} bg-green-50 border-green-100">
              <h4 class="font-medium mb-2">Hands-on Exercise</h4>
              <p>Try this interactive exercise to reinforce the concept...</p>
            </div>`
        );
      default:
        return content;
    }
  };

  const renderModuleContent = () => {
    if (!currentModule) return null;

    return (
      <div className="space-y-6">
        {/* Video Content */}
        {currentModule.videoUrl && (
          <div className="relative aspect-video h-64 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
            <iframe 
              src={currentModule.videoUrl} 
              title={currentModule.title}
              className="w-full h-full" 
              allowFullScreen
              onEnded={handleVideoComplete}
            ></iframe>
          </div>
        )}

        {/* Text Content */}
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ 
            __html: getPersonalizedContent(currentModule.content)
          }} />
        </div>

        {/* PDF Content */}
        {currentModule.pdfUrl && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Additional Reading Material</h4>
            <iframe
              src={currentModule.pdfUrl}
              className="w-full h-[500px]"
              title="PDF Document"
            />
          </div>
        )}

        {/* Quiz Component */}
        {quiz && (
          <div className="mt-6">
            <QuizComponent 
              quiz={quiz} 
              onComplete={handleQuizComplete}
            />
          </div>
        )}

        {/* Complete Module Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleModuleComplete}
            disabled={quiz && !quizScore}
            className="bg-primary hover:bg-primary-600"
          >
            Complete Module & Continue
          </Button>
        </div>
      </div>
    );
  };

  // Calculate module progress for progress bar
  const moduleIndex = modules && currentModule ? modules.findIndex(m => m.id === currentModule.id) : 0;
  const totalModules = modules ? modules.length : 1;
  const moduleProgress = totalModules > 1 ? Math.round(((moduleIndex + 1) / totalModules) * 100) : 100;

  // Show completion trophy for completed course
  const showCompletionTrophy = progress.completed && progress.progress >= 100;

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={moduleProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Module {moduleIndex + 1} of {totalModules}</span>
            <span>{moduleProgress}% complete</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">{course?.title}</h2>
            {showCompletionTrophy && (
              <Trophy className="h-6 w-6 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center px-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {course?.estimatedDuration}
            </Badge>
            <Badge className="capitalize">{course?.difficulty}</Badge>
          </div>
        </div>

        {/* Module Content */}
        {isLoadingModules ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : currentModule ? (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Current Module: {currentModule.title}</h3>
            <p className="mt-1 text-gray-500">{currentModule.description}</p>
            <div className="mt-4">
              {renderModuleContent()}
            </div>
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Module {currentModule.order}</p>
                  <p className="text-xs text-gray-500">Keep going! You're doing great.</p>
                </div>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center p-1.5 border border-gray-300 rounded-full text-gray-400 hover:text-gray-500">
                    <BookmarkIcon className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center p-1.5 border border-gray-300 rounded-full text-gray-400 hover:text-gray-500">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8">
            <p className="text-gray-500">No modules found for this course.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
