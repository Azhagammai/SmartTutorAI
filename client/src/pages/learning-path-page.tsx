import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import CourseCard from "@/components/course-card";
import JourneyVisualization from "@/components/journey-visualization";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen, Map, Bot, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import AiAssistantButton from "@/components/ai-assistant-button";

// Define interfaces for better type safety
interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  domain: string;
  estimatedDuration: string;
  thumbnail?: string;
}

interface Module {
  id: number;
  courseId: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  order: number;
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

export default function LearningPathPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showJourneyView, setShowJourneyView] = useState(true);
  
  // Extract courseId from URL if present
  const urlParams = new URLSearchParams(location.split("?")[1]);
  const courseIdParam = urlParams.get("courseId");
  const viewParam = urlParams.get("view");
  const showRecommended = viewParam === "recommended";
  
  // Fetch learning style
  const { data: learningStyle } = useQuery<LearningStyle>({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });
  
  // Fetch all user progress
  const { data: allProgress } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Filter courses based on search, filter selection, and view mode
  const filteredCourses = courses?.filter((course: Course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showRecommended && learningStyle) {
      // Show courses in the user's domain that match their level
      const progress = allProgress?.find((p: Progress) => p.courseId === course.id);
      const isAppropriateLevel = !progress || (!progress.completed && progress.progress < 100);
      return matchesSearch && course.domain === learningStyle.domain && isAppropriateLevel;
    }

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "my-domain" && learningStyle) {
      return matchesSearch && course.domain === learningStyle.domain;
    }
    
    // Find progress for this course
    const progress = allProgress?.find((p: Progress) => p.courseId === course.id);
    
    if (selectedFilter === "in-progress") {
      return matchesSearch && progress && progress.progress > 0 && !progress.completed;
    }
    
    if (selectedFilter === "completed") {
      return matchesSearch && progress && progress.completed;
    }
    
    return matchesSearch;
  });

  // Prepare courses for journey visualization
  const journeyCourses = React.useMemo(() => {
    if (!courses || !allProgress || !learningStyle) return [];
    
    // Filter courses by domain and sort by difficulty
    const domainCourses = courses
      .filter(course => course.domain === learningStyle.domain)
      .sort((a, b) => {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
               difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
      });

    // Find the current course
    const currentProgress = allProgress.find(p => p.progress > 0 && !p.completed);
    const currentCourseId = currentProgress?.courseId;

    // Map courses to journey visualization format
    return domainCourses.map((course, index) => {
      const progress = allProgress.find(p => p.courseId === course.id);
      const previousCourse = index > 0 ? domainCourses[index - 1] : null;
      const previousProgress = previousCourse 
        ? allProgress.find(p => p.courseId === previousCourse.id)
        : null;
      
      return {
        id: course.id,
        title: course.title,
        difficulty: course.difficulty,
        isCompleted: progress?.completed || false,
        isLocked: previousCourse ? !(previousProgress?.completed) : false,
        progress: progress?.progress || 0
      };
    });
  }, [courses, allProgress, learningStyle]);

  // Render course detail view (Coursera-like)
  const renderCourseDetail = () => {
    if (!courseIdParam || !courses) return null;
    const courseId = parseInt(courseIdParam);
    const course = courses.find((c: Course) => c.id === courseId);
    const progress = allProgress?.find((p: Progress) => p.courseId === courseId) || { progress: 0, completed: false, currentModuleId: undefined };
    if (!course) {
      return (
        <div className="text-center py-10">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Course not found</h3>
          <p className="text-gray-500 mt-2">This course may have been removed or is unavailable.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/learning-path"}>
            Back to all courses
          </Button>
        </div>
      );
    }
    // Fetch modules for this course
    const { data: modules, isLoading: isLoadingModules } = useQuery<Module[]>({
      queryKey: [`/api/courses/${courseId}/modules`],
      enabled: !!courseId,
    });
    // Persistent state for current module selection
    const [selectedModuleId, setSelectedModuleId] = React.useState<number | undefined>(undefined);
    React.useEffect(() => {
      if (progress.currentModuleId) {
        setSelectedModuleId(progress.currentModuleId);
      } else if (modules && modules.length > 0) {
        setSelectedModuleId(modules[0].id);
      }
    }, [progress.currentModuleId, modules]);
    // Find current module
    const sortedModules = modules ? [...modules].sort((a, b) => a.order - b.order) : [];
    const currentModule = sortedModules.find((m) => m.id === selectedModuleId) || sortedModules[0];
    // Calculate unlocked modules (Coursera: can only access up to current+1)
    let unlockedIdx = 0;
    if (progress.progress > 0 && sortedModules.length > 0) {
      unlockedIdx = Math.max(0, Math.ceil((progress.progress / 100) * sortedModules.length));
    }
    return (
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar: Module Navigation */}
        <aside className="md:w-1/4 w-full mb-6 md:mb-0">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Course Modules</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingModules ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !sortedModules.length ? (
                <p className="text-gray-500 py-4">No modules available for this course yet.</p>
              ) : (
                <ul className="space-y-2">
                  {sortedModules.map((module, idx) => {
                    const isCurrent = selectedModuleId === module.id;
                    const isUnlocked = idx <= unlockedIdx;
                    const isCompleted = progress.progress > 0 && idx + 1 <= unlockedIdx;
                    return (
                      <li key={module.id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${isCurrent ? 'bg-primary-50 text-primary font-semibold' : 'hover:bg-gray-50 text-gray-700'} ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                          onClick={() => isUnlocked && setSelectedModuleId(module.id)}
                          disabled={!isUnlocked}
                          aria-current={isCurrent ? 'step' : undefined}
                        >
                          <span>
                            Module {module.order}: {module.title}
                          </span>
                          {isCurrent && <Badge variant="secondary" className="ml-2">Current</Badge>}
                          {isCompleted && <span className="ml-2 text-green-600 text-xs">✓</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
        {/* Main Content: Current Module */}
        <section className="flex-1 min-w-0">
          <div className="mb-6">
            <Button variant="outline" onClick={() => window.location.href = "/learning-path"} className="flex items-center mb-2">
              <span className="mr-2">←</span> Back to courses
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span className="capitalize">{course.difficulty}</span>
              <span className="mx-2">•</span>
              <span>{course.estimatedDuration}</span>
            </div>
            <p className="text-gray-700 mb-2">{course.description}</p>
            {progress.progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-600">
              <span>{progress.progress}% complete</span>
              {progress.completed ? <span className="text-green-600 font-medium">Completed</span> : null}
            </div>
          </div>
          {/* Show CourseCard for current module */}
          {currentModule && (
            <CourseCard 
              course={course} 
              progress={{
                id: ("id" in progress && typeof progress.id === "number") ? progress.id : 0,
                userId: ("userId" in progress && typeof progress.userId === "number") ? progress.userId : 0,
                courseId: course.id,
                progress: progress.progress,
                completed: progress.completed,
                currentModuleId: currentModule.id
              }}
            />
          )}
        </section>
      </div>
    );
  };
  
  // Render course list with prerequisites and learning style info
  const renderCourseList = () => {
    if (isLoadingCourses) {
      return (
        <div className="col-span-full flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!filteredCourses || filteredCourses.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      );
    }
    
    return (
      <>
        {filteredCourses.map((course: Course, index: number) => {
          const progress = allProgress?.find((p: Progress) => p.courseId === course.id) || { progress: 0, completed: false, currentModuleId: undefined };
          const isRecommended = showRecommended && (!progress || (!progress.completed && progress.progress < 100));
          
          return (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="col-span-1"
            >
              <Card className={`h-full flex flex-col ${isRecommended ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={course.thumbnail || "https://cdn.pixabay.com/photo/2018/06/08/00/48/developer-3461405_1280.png"} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {progress.completed && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-green-500 text-white">Completed</Badge>
                    </div>
                  )}
                  {progress.progress > 0 && !progress.completed && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  )}
                  {isRecommended && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-primary text-white">Recommended</Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                    <span className="capitalize">{course.difficulty}</span>
                    <span>•</span>
                    <span>{course.estimatedDuration}</span>
                    {learningStyle?.learningType && (
                      <>
                        <span>•</span>
                        <span className="text-primary">{learningStyle.learningType} optimized</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 flex-1">{course.description}</p>
                  
                  {progress.progress > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{progress.progress}% complete</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    {showRecommended && (
                      <div className="text-sm text-gray-600 bg-primary/5 p-2 rounded">
                        <span className="font-medium">Why this course?</span> Perfect for your {learningStyle?.learningType} learning style with {course.difficulty} content.
                      </div>
                    )}
                    <Button asChild className="w-full">
                      <a href={`/learning-path?courseId=${course.id}`}>
                        {progress.progress > 0 ? "Continue Course" : "Start Course"}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </>
    );
  };

  // Render the main content
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          {courseIdParam ? (
            // Show course detail view when courseId is present
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => window.location.href="/learning-path"} className="flex items-center">
                  <span className="mr-2">←</span> Back to courses
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Course Details</h1>
              </div>
              {renderCourseDetail()}
            </div>
          ) : (
            // Show learning path view
            <div className="space-y-6">
              {/* AI Learning Path Recommendations */}
              <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden border border-white/20">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Your Learning Path</h1>
                      <p className="text-gray-600">AI-personalized course recommendations for your journey</p>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Get Path Suggestions
                    </Button>
                  </div>
                  
                  <div className="bg-primary/5 rounded-lg p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI Learning Insights</h3>
                      <p className="text-sm text-gray-600">
                        Based on your {learningStyle?.learningType} learning style, here are personalized course recommendations in {learningStyle?.domain}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Header with learning style info */}
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {showRecommended ? "Your Learning Journey" : "Learning Path"}
                    </h1>
                    {learningStyle && (
                      <p className="text-gray-500 mt-1">
                        Courses {showRecommended ? "recommended" : ""} for {learningStyle.domain} with {learningStyle.learningType} learning style
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={() => setShowJourneyView(!showJourneyView)}
                  >
                    <Map className="w-4 h-4" />
                    <span>{showJourneyView ? "Grid View" : "Journey View"}</span>
                  </Button>
                </div>
              </div>

              {showRecommended && learningStyle && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Your Personalized Learning Journey</h3>
                  <p className="text-blue-700">
                    Based on your {learningStyle.learningType} learning style, we've crafted an optimized path through {learningStyle.domain}.
                    The journey below represents your progression from beginner to expert, with each milestone building upon previous knowledge.
                  </p>
                </div>
              )}

              {/* Journey Visualization */}
              {showJourneyView && journeyCourses.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Your Learning Journey Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <JourneyVisualization 
                      courses={journeyCourses}
                      currentCourseId={allProgress?.find(p => p.progress > 0 && !p.completed)?.courseId}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Search courses..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {!showRecommended && (
                    <div className="flex items-center space-x-2">
                      <Filter className="h-5 w-5 text-gray-400" />
                      <select
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2"
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                      >
                        <option value="all">All Courses</option>
                        <option value="my-domain">My Domain ({learningStyle?.domain})</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}

                  <Button 
                    variant={showRecommended ? "default" : "outline"}
                    onClick={() => {
                      if (showRecommended) {
                        window.location.href = "/learning-path";
                      } else {
                        window.location.href = "/learning-path?view=recommended";
                      }
                    }}
                  >
                    {showRecommended ? "View All Courses" : "View Recommended"}
                  </Button>
                </div>
              </div>

              {/* Course Grid */}
              <div className={showJourneyView ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {renderCourseList()}
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* AI Assistant */}
      <AiAssistantButton 
        domain={learningStyle?.domain}
        learningStyle={learningStyle?.learningType}
      />
      
      <MobileNavigation />
    </div>
  );
}
