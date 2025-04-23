import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import CourseCard from "@/components/course-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function LearningPathPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Extract courseId from URL if present
  const urlParams = new URLSearchParams(location.split("?")[1]);
  const courseIdParam = urlParams.get("courseId");
  
  // Fetch learning style
  const { data: learningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user,
  });
  
  // Fetch all user progress
  const { data: allProgress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Filter courses based on search and filter selection
  const filteredCourses = courses?.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "my-domain" && learningStyle) {
      return matchesSearch && course.domain === learningStyle.domain;
    }
    
    // Find progress for this course
    const progress = allProgress?.find((p: any) => p.courseId === course.id);
    
    if (selectedFilter === "in-progress") {
      return matchesSearch && progress && progress.progress > 0 && !progress.completed;
    }
    
    if (selectedFilter === "completed") {
      return matchesSearch && progress && progress.completed;
    }
    
    return matchesSearch;
  });

  // Render course detail view
  const renderCourseDetail = () => {
    if (!courseIdParam || !courses) return null;
    
    const courseId = parseInt(courseIdParam);
    const course = courses.find((c: any) => c.id === courseId);
    const progress = allProgress?.find((p: any) => p.courseId === courseId) || { progress: 0, completed: false };
    
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
    const { data: modules, isLoading: isLoadingModules } = useQuery<any[]>({
      queryKey: [`/api/courses/${courseId}/modules`],
      enabled: !!courseId,
    });
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3 space-y-4">
            <Card>
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                <img 
                  src={course.thumbnail || "https://cdn.pixabay.com/photo/2018/06/08/00/48/developer-3461405_1280.png"} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="capitalize">{course.difficulty}</span>
                  <span className="mx-2">•</span>
                  <span>{course.estimatedDuration}</span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">About this course</h3>
                <p className="text-gray-700">{course.description}</p>
                
                {progress.progress > 0 && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>{progress.progress}% complete</span>
                      {progress.completed ? 
                        <span className="text-green-600 font-medium">Completed</span> : 
                        <span>{Math.round(progress.progress * 0.01 * (modules?.length || 0))} / {modules?.length || 0} modules</span>
                      }
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => {
                      if (!progress.progress) {
                        // Get first module
                        if (modules && modules.length > 0) {
                          const firstModule = modules.sort((a: any, b: any) => a.order - b.order)[0];
                          
                          // Create initial progress
                          fetch(`/api/progress/${courseId}`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              progress: 5,
                              currentModuleId: firstModule.id,
                              completed: false
                            })
                          })
                          .then(res => res.json())
                          .then(() => {
                            window.location.reload();
                          })
                          .catch(err => console.error('Error creating progress:', err));
                        }
                      }
                    }}
                  >
                    {progress.progress > 0 ? "Continue Learning" : "Start Learning"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Module List */}
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingModules ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !modules || modules.length === 0 ? (
                  <p className="text-gray-500 py-4">No modules available for this course yet.</p>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module: any, index: number) => (
                      <div 
                        key={module.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-500">Module {index + 1}</span>
                            <h4 className="font-medium">{module.title}</h4>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            // Create or update progress when starting a module
                            if (!progress.progress) {
                              fetch(`/api/progress/${courseId}`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  progress: 10,
                                  currentModuleId: module.id,
                                  completed: false
                                })
                              })
                              .then(res => res.json())
                              .then(() => {
                                window.location.reload();
                              })
                              .catch(err => console.error('Error updating progress:', err));
                            }
                          }}>
                            {progress.currentModuleId === module.id ? "Continue" : "Start"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-1/3 space-y-4">
            {/* AI Tutor Card */}
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                Get personalized assistance with Nova, your AI tutor tailored to your learning style.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href={`/ai-tutor?domain=${course.domain}`}>Chat with Nova</a>
              </Button>
            </div>
            
            {/* Related Courses */}
            <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Related Courses</h3>
              {courses
                .filter((c: any) => c.domain === course.domain && c.id !== course.id)
                .slice(0, 3)
                .map((relatedCourse: any) => (
                  <div key={relatedCourse.id} className="mb-4 last:mb-0">
                    <h4 className="font-medium text-sm">{relatedCourse.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{relatedCourse.difficulty} • {relatedCourse.estimatedDuration}</p>
                    <Button variant="link" asChild className="h-auto p-0 text-sm">
                      <a href={`/learning-path?courseId=${relatedCourse.id}`}>View Course</a>
                    </Button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render course list
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
        {filteredCourses.map((course: any, index: number) => {
          const progress = allProgress?.find((p: any) => p.courseId === course.id) || { progress: 0, completed: false };
          
          return (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="col-span-1"
            >
              <Card className="h-full flex flex-col">
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
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="capitalize">{course.difficulty}</span>
                    <span className="mx-2">•</span>
                    <span>{course.estimatedDuration}</span>
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
                  
                  <div className="mt-4">
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
            // Show course list view
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learning Path</h1>
                <p className="text-gray-500">Explore courses tailored to your learning style</p>
              </div>
              
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
                </div>
              </div>
              
              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderCourseList()}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
