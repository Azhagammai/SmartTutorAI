import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuizComponent from "@/components/quiz-component";
import { Play, Clock, BookmarkIcon, Share2 } from "lucide-react";

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
  progress?: {
    id: number;
    userId: number;
    courseId: number;
    progress: number;
    completed: boolean;
    currentModuleId?: number;
  };
}

export default function CourseCard({ course, progress }: CourseCardProps) {
  // If no course provided, show placeholder
  if (!course) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Current Course</h2>
        <p className="mt-4 text-gray-500">No course selected yet. Choose a course from your learning path to start.</p>
      </div>
    );
  }

  // Fetch modules for the course
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: [`/api/courses/${course.id}/modules`],
    enabled: !!course,
  });

  // Get current module
  const currentModule = modules?.find(module => 
    progress?.currentModuleId ? module.id === progress.currentModuleId : module.order === 1
  );

  // Fetch quiz for the module
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: [`/api/modules/${currentModule?.id}/quiz`],
    enabled: !!currentModule,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Current Course: {course.title}</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center px-2">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {course.estimatedDuration}
          </Badge>
          <Badge className="capitalize">{course.difficulty}</Badge>
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
          
          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
            <div className="relative aspect-video h-64 bg-gray-100 flex items-center justify-center">
              {currentModule.videoUrl ? (
                <iframe 
                  src={currentModule.videoUrl} 
                  title={currentModule.title}
                  className="w-full h-full" 
                  allowFullScreen
                ></iframe>
              ) : (
                <img 
                  src={course.thumbnail || "https://cdn.pixabay.com/photo/2018/06/08/00/48/developer-3461405_1280.png"} 
                  alt={currentModule.title} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{currentModule.title}</p>
                  <p className="text-xs text-gray-500">Module {currentModule.order}</p>
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

          {/* Module Content */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: currentModule.content }}></div>
          </div>
          
          {/* Quiz Component */}
          {quiz && (
            <div className="mt-6">
              <QuizComponent quiz={quiz} />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 text-center py-8">
          <p className="text-gray-500">No modules found for this course.</p>
        </div>
      )}
    </div>
  );
}
