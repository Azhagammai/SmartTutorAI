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
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "my-domain" && learningStyle) {
      return matchesSearch && course.domain === learningStyle.domain;
    }
    
    // Find progress for this course
    const progress = allProgress?.find(p => p.courseId === course.id);
    
    if (selectedFilter === "in-progress") {
      return matchesSearch && progress && progress.progress > 0 && !progress.completed;
    }
    
    if (selectedFilter === "completed") {
      return matchesSearch && progress && progress.completed;
    }
    
    return matchesSearch;
  });

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
        {filteredCourses.map((course, index) => {
          const progress = allProgress?.find(p => p.courseId === course.id) || { progress: 0, completed: false };
          
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
                      <Badge variant="success" className="bg-green-500">Completed</Badge>
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
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
