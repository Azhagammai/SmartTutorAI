import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, MessageSquare, Search, Plus, MessageCircle, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import CommunityDiscussions from "@/components/community-discussions";
import StudyBuddies from "@/components/study-buddies";
import { motion } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  content: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }),
  domain: z.string().min(1, {
    message: "Please select a domain.",
  }),
});

export default function CommunityPage() {
  const { user } = useAuth();
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form for new discussion
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      domain: "",
    },
  });
  
  // Fetch user's learning style
  const { data: learningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch discussions
  const { data: discussions, isLoading: isLoadingDiscussions } = useQuery({
    queryKey: ["/api/discussions"],
    enabled: !!user,
  });
  
  // Fetch domains
  const { data: domains } = useQuery({
    queryKey: ["/api/domains"],
    enabled: !!user,
  });

  // Create new discussion mutation
  const createDiscussionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/discussions", values);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      setIsNewDiscussionOpen(false);
      form.reset();
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createDiscussionMutation.mutate(values);
  };

  // Filter discussions based on search query
  const filteredDiscussions = discussions?.filter(
    discussion => 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Learning Community</h1>
                <p className="text-gray-500">Connect with other learners, share ideas and get help</p>
              </div>
              
              <Button onClick={() => setIsNewDiscussionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Discussion
              </Button>
            </div>
            
            {/* Tabs for different community sections */}
            <Tabs defaultValue="discussions" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="discussions" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Discussions</span>
                </TabsTrigger>
                <TabsTrigger value="buddies" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Study Buddies</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="discussions" className="space-y-6">
                {/* Search bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search discussions..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Discussions list */}
                <CommunityDiscussions discussions={filteredDiscussions} isLoading={isLoadingDiscussions} />
              </TabsContent>
              
              <TabsContent value="buddies">
                <StudyBuddies learningDomain={learningStyle?.domain} />
              </TabsContent>
            </Tabs>
            
            {/* Upcoming community events */}
            <motion.div 
              className="bg-white shadow-sm rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
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
                        <h3 className="font-medium">JavaScript Study Group</h3>
                        <p className="text-sm text-gray-500 mt-1">Join fellow learners for a collaborative JavaScript study session</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{format(new Date().setDate(new Date().getDate() + 2), "MMM dd, yyyy • h:mm a")}</span>
                        </div>
                      </div>
                      <Badge>Web Development</Badge>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">Join Event</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">AI Ethics Workshop</h3>
                        <p className="text-sm text-gray-500 mt-1">Explore the ethical considerations in artificial intelligence</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{format(new Date().setDate(new Date().getDate() + 5), "MMM dd, yyyy • h:mm a")}</span>
                        </div>
                      </div>
                      <Badge>Artificial Intelligence</Badge>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">Join Event</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-center">
                <Button variant="ghost" size="sm" asChild>
                  <a href="#" className="flex items-center">
                    View All Events
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </CardFooter>
            </motion.div>
          </div>
        </main>
      </div>
      
      <MobileNavigation />
      
      {/* New Discussion Dialog */}
      <Dialog open={isNewDiscussionOpen} onOpenChange={setIsNewDiscussionOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Discussion</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your thoughts, questions or insights..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        defaultValue=""
                        {...field}
                      >
                        <option value="" disabled>Select domain</option>
                        {domains?.map(domain => (
                          <option key={domain.id} value={domain.name}>{domain.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewDiscussionOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createDiscussionMutation.isPending}
                >
                  {createDiscussionMutation.isPending ? "Posting..." : "Post Discussion"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
