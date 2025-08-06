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

interface User {
  id: number;
  fullName: string;
  avatar?: string;
}

interface Reply {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
}

interface Discussion {
  id: number;
  userId: number;
  title: string;
  content: string;
  domain: string;
  tags: string[];
  createdAt: string;
  replies: Reply[];
}

interface CommunityDiscussionsProps {
  domainFilter?: string;
}

const replySchema = z.object({
  content: z.string().min(1, "Reply cannot be empty"),
});

type ReplyFormData = z.infer<typeof replySchema>;

export default function CommunityDiscussions({ domainFilter }: CommunityDiscussionsProps) {
  const { user } = useAuth();
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

  // Fetch discussions with domain filter
  const { data: discussions = [], isLoading } = useQuery<Discussion[]>({
    queryKey: ["/api/discussions", domainFilter],
    enabled: !!user,
  });

  // Fetch users for displaying names
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  const form = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: {
      content: "",
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: (data: ReplyFormData) => {
      if (!selectedDiscussion?.id) throw new Error("No discussion selected");
      return apiRequest("POST", `/api/discussions/${selectedDiscussion.id}/replies`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      form.reset();
    },
  });

  const getUserName = (userId: number | undefined) => {
    if (!userId) return "Anonymous User";
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.fullName || "Anonymous User";
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
  };

  const filteredDiscussions = domainFilter 
    ? discussions.filter(d => d.domain === domainFilter)
    : discussions;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDiscussion(discussion)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={users.find(u => u.id === discussion.userId)?.avatar} />
                      <AvatarFallback>{getUserName(discussion.userId)?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{getUserName(discussion.userId)}</p>
                      <p className="text-xs text-gray-500">
                        {discussion.createdAt ? format(new Date(discussion.createdAt), "MMM d, yyyy") : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{discussion.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{discussion.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {discussion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                    <span className="text-sm text-gray-500 flex items-center ml-auto">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {discussion.replies.length} replies
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDiscussion} onOpenChange={() => setSelectedDiscussion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDiscussion?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={users.find(u => u.id === selectedDiscussion?.userId)?.avatar} />
                  <AvatarFallback>
                    {selectedDiscussion ? getUserName(selectedDiscussion.userId).charAt(0) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {selectedDiscussion ? getUserName(selectedDiscussion.userId) : "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedDiscussion && format(new Date(selectedDiscussion.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <p className="text-sm">{selectedDiscussion?.content}</p>
            </div>

            <div className="space-y-4">
              {selectedDiscussion?.replies?.map((reply) => (
                <div key={reply.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={users.find(u => u.id === reply.userId)?.avatar} />
                      <AvatarFallback>{getUserName(reply.userId)?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{getUserName(reply.userId)}</p>
                      <p className="text-xs text-gray-500">
                        {reply.createdAt ? format(new Date(reply.createdAt), "MMM d, yyyy 'at' h:mm a") : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(data => addReplyMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Reply</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Share your thoughts..." />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addReplyMutation.isPending}
                >
                  {addReplyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
