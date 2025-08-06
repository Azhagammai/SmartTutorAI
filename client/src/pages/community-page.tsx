import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Calendar, ChevronRight, Bot, Sparkles } from "lucide-react";
import { format } from "date-fns";
import CommunityDiscussions from "@/components/community-discussions";
import StudyBuddies from "@/components/study-buddies";
import AiAssistantButton from "@/components/ai-assistant-button";
import { motion } from "framer-motion";

interface LearningStyle {
  id?: number;
  userId?: number;
  learningType: string;
  domain: string;
  assessmentResults?: Record<string, any>;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discussions");
  
  // Get learning style for AI context
  const { data: learningStyle } = useQuery<LearningStyle>({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            {/* AI-Enhanced Community Features */}
            <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl overflow-hidden border border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Learning Community</h1>
                    <p className="text-gray-600">Connect with peers and get AI-powered learning support</p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Find Study Partners
                  </Button>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">AI Community Insights</h3>
                    <p className="text-sm text-gray-600">
                      {learningStyle?.domain ? 
                        `Based on your interests in ${learningStyle.domain}, we've found study groups and discussions that match your learning style.` :
                        'Complete your learning style assessment to get personalized community recommendations.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Tabs key="community-tabs" defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 border-b">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="discussions" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Discussions
                    </TabsTrigger>
                    <TabsTrigger value="study-groups" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Study Groups
                    </TabsTrigger>
                    <TabsTrigger value="events" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Events
                    </TabsTrigger>
                  </TabsList>
                </div>

                <React.Suspense fallback={<div className="p-6 text-center">Loading content...</div>}>
                  {activeTab === "discussions" && (
                    <TabsContent value="discussions" className="p-6">
                      <CommunityDiscussions 
                        key={learningStyle?.domain || 'default'} 
                        domainFilter={learningStyle?.domain} 
                      />
                    </TabsContent>
                  )}

                  {activeTab === "study-groups" && (
                    <TabsContent value="study-groups" className="p-6">
                      <StudyBuddies 
                        key={learningStyle?.domain || 'default'} 
                        learningDomain={learningStyle?.domain} 
                      />
                    </TabsContent>
                  )}

                  {activeTab === "events" && (
                    <TabsContent value="events" className="p-6">
                      <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            Upcoming Community Events
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Study Group Session</h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Join fellow learners in a collaborative learning session
                                    {learningStyle?.domain && ` focused on ${learningStyle.domain}`}
                                  </p>
                                  <div className="flex items-center mt-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {format(new Date().setDate(new Date().getDate() + 2), "MMMM d, yyyy 'at' h:mm a")}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="flex items-center">
                                  Join <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </React.Suspense>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
      
      <AiAssistantButton 
        domain={learningStyle?.domain}
        learningStyle={learningStyle?.learningType}
      />
      
      <MobileNavigation />
    </div>
  );
}
