import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FlagTriangleRight, Wifi, Server, Database, Braces, Layers } from 'lucide-react';

export default function LearningProgress() {
  const { user } = useAuth();
  
  // Fetch user's learning style
  const { data: learningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch user's progress
  const { data: userProgress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Fetch courses for learning path visualization
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });

  // Get courses for the user's domain
  const domainCourses = courses?.filter(course => 
    course.domain === learningStyle?.domain
  ) || [];
  
  // Map progress to courses
  const progressMap = new Map();
  if (userProgress) {
    userProgress.forEach(progress => {
      progressMap.set(progress.courseId, progress);
    });
  }

  // Define a set of topic icons
  const topicIcons = [
    <Wifi className="h-5 w-5 text-primary" />,
    <Server className="h-5 w-5 text-primary" />,
    <Database className="h-5 w-5 text-primary" />,
    <Braces className="h-5 w-5 text-primary" />,
    <Layers className="h-5 w-5 text-primary" />
  ];

  return (
    <Card className="bg-white rounded-lg border border-gray-200 shadow-sm flex-grow">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FlagTriangleRight className="text-secondary h-5 w-5 mr-2" />
          Your Learning Path
        </h3>
        
        {domainCourses.length > 0 ? (
          <div className="mt-4 space-y-3">
            {domainCourses.slice(0, 5).map((course, index) => {
              const progress = progressMap.get(course.id);
              const isCompleted = progress?.completed || false;
              const isInProgress = progress && progress.progress > 0 && !isCompleted;
              
              return (
                <div key={course.id} className="flex items-start">
                  <div className="flex items-center h-5 mt-0.5">
                    <Checkbox 
                      id={`course-${course.id}`} 
                      checked={isCompleted}
                      disabled={!isCompleted && !isInProgress}
                    />
                  </div>
                  <div className="ml-3 text-sm flex items-center">
                    <span className="mr-2">{topicIcons[index % topicIcons.length]}</span>
                    <Label 
                      htmlFor={`course-${course.id}`} 
                      className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                    >
                      {course.title}
                      {isInProgress && !isCompleted && (
                        <span className="text-accent ml-2 text-xs font-medium">In Progress</span>
                      )}
                    </Label>
                  </div>
                </div>
              );
            })}
            
            {domainCourses.length > 5 && (
              <div className="pt-2">
                <a href="/learning-path" className="text-sm font-medium text-primary hover:text-primary-600">
                  View full roadmap →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 py-6 text-center text-gray-500">
            <p>No learning path available yet.</p>
            <p className="text-sm mt-1">Complete your learning style assessment or select a domain.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
