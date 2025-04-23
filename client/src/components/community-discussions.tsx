import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, ChevronRight, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface CommunityDiscussionsProps {
  discussions?: any[];
  isLoading?: boolean;
}

const replySchema = z.object({
  content: z.string().min(5, { message: "Reply must be at least 5 characters" }),
});

export default function CommunityDiscussions({ discussions, isLoading }: CommunityDiscussionsProps) {
  const { user } = useAuth();
  const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
  
  // Fetch users for displaying names
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && !!discussions?.length,
  });
  
  // Form for reply
  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Fetch discussion replies when a discussion is selected
  const { data: replies, isLoading: isLoadingReplies } = useQuery({
    queryKey: [`/api/discussions/${selectedDiscussion?.id}/replies`],
    enabled: !!selectedDiscussion,
  });
  
  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: async ({ discussionId, content }: { discussionId: number; content: string }) => {
      const response = await apiRequest("POST", `/api/discussions/${discussionId}/replies`, { content });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/discussions/${selectedDiscussion?.id}/replies`] });
      form.reset();
    }
  });
  
  // Submit reply
  const onSubmitReply = (values: z.infer<typeof replySchema>) => {
    if (!selectedDiscussion) return;
    
    addReplyMutation.mutate({
      discussionId: selectedDiscussion.id,
      content: values.content,
    });
  };
  
  // Get user name by id
  const getUserName = (userId: number) => {
    const foundUser = users?.find(u => u.id === userId);
    return foundUser?.fullName || "Anonymous User";
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };
  
  // Handle opening discussion detail
  const openDiscussion = (discussion: any) => {
    setSelectedDiscussion(discussion);
  };
  
  // Handle closing discussion detail
  const closeDiscussion = () => {
    setSelectedDiscussion(null);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render empty state
  if (!discussions || discussions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
          <p className="text-gray-500 mb-4">Be the first to start a discussion in the community!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card key={discussion.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDiscussion(discussion)}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${getUserName(discussion.userId)}&background=6366f1&color=fff`} />
                  <AvatarFallback>{getUserName(discussion.userId).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900 hover:underline">
                      {discussion.title}
                    </p>
                    <Badge variant="outline">{discussion.domain}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Started by <span className="font-medium text-gray-900">{getUserName(discussion.userId)}</span>
                  </p>
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {replies?.length || 0} replies
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{formatDate(discussion.createdAt)}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Discussion Detail Dialog */}
      <Dialog open={!!selectedDiscussion} onOpenChange={(open) => !open && closeDiscussion()}>
        <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDiscussion?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto py-4">
            <div className="mb-6 border-b pb-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${getUserName(selectedDiscussion?.userId)}&background=6366f1&color=fff`} />
                  <AvatarFallback>{getUserName(selectedDiscussion?.userId).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserName(selectedDiscussion?.userId)}
                    </p>
                    <span className="text-xs text-gray-500">
                      {selectedDiscussion && formatDate(selectedDiscussion.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedDiscussion?.content}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Replies</h4>
              
              {isLoadingReplies ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : replies && replies.length > 0 ? (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${getUserName(reply.userId)}&background=6366f1&color=fff`} />
                          <AvatarFallback>{getUserName(reply.userId).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900">
                              {getUserName(reply.userId)}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                            {reply.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No replies yet. Be the first to reply!
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitReply)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Reply</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your reply here..." 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={addReplyMutation.isPending}
                  >
                    {addReplyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Reply'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
