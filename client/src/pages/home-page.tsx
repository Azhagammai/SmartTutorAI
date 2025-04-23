import { useEffect } from "react";
import { Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { School, ArrowRight, CheckCircle, BookOpen, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  
  // Check if user has completed the assessment
  const { data: learningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });

  // If user has already completed assessment, redirect to dashboard
  useEffect(() => {
    if (learningStyle) {
      // Redirect will happen outside useEffect to avoid warnings
    }
  }, [learningStyle]);

  if (learningStyle) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <School className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-gray-900 ml-2">EduSmart</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Smart Learning Journey</h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            We'll help you discover your ideal learning style and create a personalized path to mastery.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started is Easy</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-bold text-primary">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Take the Learning Style Assessment</h3>
                  <p className="mt-1 text-gray-600">Answer a few questions to help us understand how you learn best.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-bold text-primary">2</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Choose Your Domain of Interest</h3>
                  <p className="mt-1 text-gray-600">Select the subject area you want to master.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="font-bold text-primary">3</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Get Your Personalized Learning Path</h3>
                  <p className="mt-1 text-gray-600">We'll create a custom roadmap tailored to your learning style and goals.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg">
                <a href="/assessment">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personalized Learning</h3>
                  <p className="text-gray-600 text-sm">
                    Adaptive content tailored to your unique learning style
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Story-Based Learning</h3>
                  <p className="text-gray-600 text-sm">
                    Concepts delivered through relatable real-world scenarios
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Community Support</h3>
                  <p className="text-gray-600 text-sm">
                    Learn alongside peers and get help when you need it
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-primary-100 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Achievement System</h3>
                  <p className="text-gray-600 text-sm">
                    Earn badges and track your progress with gamified learning
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2023 EduSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
