import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FlagTriangleRight, Wifi, Server, Database, Braces, Layers, Book, Target, Trophy, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
}

interface LearningStyle {
  id?: number;
  userId?: number;
  learningType: string;
  domain: string;
  assessmentResults?: Record<string, any>;
}

export default function LearningProgress() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user's learning style
  const { data: learningStyle } = useQuery<LearningStyle>({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch user's progress
  const { data: userProgress } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Fetch user's watched resources
  const { data: watchedResources } = useQuery({
    queryKey: ["/api/progress/resources"],
    enabled: !!user
  });
  
  // Fetch courses for learning path visualization
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  // Get courses for the user's domain
  const domainCourses = courses?.filter(course => 
    course.domain === learningStyle?.domain
  ) || [];
  
  // Map progress to courses
  const progressMap = new Map<number, Progress>();
  if (userProgress) {
    userProgress.forEach(progress => {
      progressMap.set(progress.courseId, progress);
    });
  }

  // Calculate overall progress
  const calculateProgress = () => {
    if (!Array.isArray(watchedResources)) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = watchedResources.length;
    const total = domainCourses.length * 5; // Assuming 5 resources per course
    const percentage = Math.min(Math.round((completed / total) * 100), 100);

    return { completed, total, percentage };
  };

  const { completed, total, percentage } = calculateProgress();

  // Get learning status with encouragement messages
  const getLearningStatus = () => {
    if (percentage >= 80) {
      return { 
        label: "Advanced", 
        color: "text-purple-600",
        message: "Excellent progress! You're mastering the material!" 
      };
    }
    if (percentage >= 40) {
      return { 
        label: "Intermediate", 
        color: "text-blue-600",
        message: "Great work! Keep pushing forward!" 
      };
    }
    return { 
      label: "Beginner", 
      color: "text-green-600",
      message: "You're on your way! Every step counts!" 
    };
  };

  const status = getLearningStatus();

  // Topic icons with enhanced visual feedback
  const topicIcons = [
    <Wifi key="wifi" className="h-5 w-5 text-primary animate-pulse" />,
    <Server key="server" className="h-5 w-5 text-primary" />,
    <Database key="database" className="h-5 w-5 text-primary" />,
    <Braces key="braces" className="h-5 w-5 text-primary" />,
    <Layers key="layers" className="h-5 w-5 text-primary" />
  ];

  // Show achievement animation when milestone reached
  React.useEffect(() => {
    const previousPercentage = parseInt(localStorage.getItem('previousProgress') || '0');
    if (percentage > previousPercentage && percentage >= 25) {
      // Show achievement animation
      const milestoneAchieved = Math.floor(percentage / 25) * 25;
      toast({
        title: `🎉 Milestone Achieved!`,
        description: `You've reached ${milestoneAchieved}% completion in your learning journey!`,
        duration: 5000,
      });
    }
    localStorage.setItem('previousProgress', percentage.toString());
  }, [percentage]);

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-lg border border-gray-200 shadow-sm flex-grow">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FlagTriangleRight className="text-secondary h-5 w-5 mr-2" />
            Your Learning Path
          </h3>

          {learningStyle && (
            <p className="text-sm text-gray-600 mt-2">
              Personalized for {learningStyle.domain} with {learningStyle.learningType} learning approach
            </p>
          )}
          
          {domainCourses.length > 0 ? (
            <div className="mt-4 space-y-3">
              {domainCourses.slice(0, 5).map((course, index) => {
                const progress = progressMap.get(course.id);
                const isCompleted = progress?.completed || false;
                const isInProgress = progress && progress.progress > 0 && !isCompleted;
                const isNext = !isCompleted && !isInProgress && 
                  index === domainCourses.findIndex(c => !progressMap.get(c.id)?.completed);
                
                return (
                  <div key={course.id} className="flex items-start group">
                    <div className="flex items-center h-5 mt-0.5">
                      <Checkbox 
                        id={`course-${course.id}`} 
                        checked={isCompleted}
                        disabled={!isCompleted && !isInProgress}
                      />
                    </div>
                    <div className="ml-3 text-sm flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <Label 
                          htmlFor={`course-${course.id}`} 
                          className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                        >
                          <span className="inline-flex items-center">
                            <span className="mr-2">{topicIcons[index % topicIcons.length]}</span>
                            {course.title}
                          </span>
                        </Label>
                        <div className="flex items-center">
                          {isInProgress && !isCompleted && (
                            <span className="text-accent text-xs font-medium px-2 py-1 bg-accent/10 rounded">In Progress</span>
                          )}
                          {isNext && (
                            <span className="text-primary text-xs font-medium px-2 py-1 bg-primary/10 rounded">Recommended Next</span>
                          )}
                        </div>
                      </div>
                      {(isInProgress || isNext) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {course.difficulty} • {course.estimatedDuration}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 space-y-2">
                {domainCourses.length > 5 && (
                  <a href="/learning-path" className="text-sm font-medium text-primary hover:text-primary-600 block">
                    View full roadmap →
                  </a>
                )}
                <a href="/learning-path?view=recommended" className="text-sm text-gray-600 hover:text-gray-900 block">
                  View personalized recommendations →
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 py-6 text-center text-gray-500">
              <p>No learning path available yet.</p>
              <p className="text-sm mt-1">Complete your learning style assessment or select a domain.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FlagTriangleRight className="w-5 h-5 mr-2 text-primary" />
              Learning Progress
            </h3>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>
          
          <div className="space-y-6">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium">{completed}/{total} completed</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <Book className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{completed}</div>
                <div className="text-xs text-gray-500">Resources Completed</div>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
                <div className="text-xs text-gray-500">Course Progress</div>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{Math.floor(percentage / 20)}</div>
                <div className="text-xs text-gray-500">Level Achieved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
