import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { sendMessageToAiTutor } from "@/lib/gemini";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AiTutorMessage {
  id: number;
  userId: number;
  message: string;
  isUserMessage: boolean;
  createdAt: Date;
}

interface AiTutorChatProps {
  domain?: string;
  learningStyle?: string;
}

export default function AiTutorChat({ domain, learningStyle }: AiTutorChatProps) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Card className="flex flex-col h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Bot className="h-5 w-5 text-primary mr-2" />
            <span>AI Tutor Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Bot className="h-12 w-12 text-gray-300 mb-4 mx-auto" />
            <p className="text-gray-600 mb-4">Please log in to use the AI tutor</p>
            <a 
              href="/auth" 
              className={cn(
                buttonVariants({ variant: "default" }),
                "no-underline"
              )}
            >
              Log In
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fetch chat history with error handling
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isError: hasFetchError,
  } = useQuery<AiTutorMessage[]>({
    queryKey: ["/api/ai-tutor/messages", domain, learningStyle],
    enabled: !!user,
    retry: 2,
    staleTime: 30000,
    onError: (error) => {
      console.error("Error fetching messages:", error);
      setError("Failed to load chat history");
    }
  });

  // Send message mutation with improved error handling
  const sendMessageMutation = useMutation<
    { userMessage: AiTutorMessage; aiMessage: AiTutorMessage },
    Error,
    string
  >({
    mutationFn: async (message: string) => {
      setError(null);
      return sendMessageToAiTutor(message, domain, learningStyle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-tutor/messages"] });
      setMessageInput(""); // Clear input after successful send
    },
    onError: (error: Error) => {
      console.error('Chat error:', error);
      const errorMessage = error.message || "Failed to send message";
      
      // Show user-friendly error messages
      if (errorMessage.includes('Unauthorized')) {
        setError("Please log in to use the AI tutor");
      } else if (errorMessage.includes('rate limit')) {
        setError("Please wait a moment before sending another message");
      } else if (errorMessage.includes('configuration')) {
        setError("AI tutor is being configured. Please try again in a moment");
      } else {
        setError(errorMessage);
      }
      
      setTimeout(() => setError(null), 5000);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        // Don't retry auth, API key, or rate limit issues
        if (error.message.includes('API key') || error.message.includes('safety')) {
          return false;
        }
        // Retry network/timeout issues up to 2 times
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: 1000
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear error when domain or learning style changes
  useEffect(() => {
    setError(null);
  }, [domain, learningStyle]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && !sendMessageMutation.isPending) {
      try {
        await sendMessageMutation.mutateAsync(messageInput);
        setMessageInput("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  // Helper function to get tutor name based on domain
  const getTutorName = (domainInput?: string): string => {
    switch (domainInput) {
      case "Web Development":
        return "Nova";
      case "Artificial Intelligence":
        return "Atlas";
      case "Cybersecurity":
        return "Cipher";
      case "Data Science":
        return "Data";
      default:
        return "Nova";
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Bot className="h-5 w-5 text-primary mr-2" />
          <span>Nova - Your Gemini-Powered AI Learning Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full max-h-[350px] px-4">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:text-red-400 dark:bg-red-900/10">
              {error}
            </div>
          )}
          {hasFetchError && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-50 rounded-lg dark:text-red-400 dark:bg-red-900/10">
              Failed to load chat history. Please try refreshing the page.
            </div>
          )}
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4 py-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${msg.isUserMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start max-w-[80%] ${msg.isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 ${msg.isUserMessage ? 'ml-2' : 'mr-2'}`}>
                      {msg.isUserMessage ? (
                        <AvatarFallback className="bg-primary-50 text-primary">
                          {user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getTutorName(domain))}&background=6366f1&color=fff`} />
                          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div className={`rounded-lg px-4 py-2 ${
                      msg.isUserMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {sendMessageMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start max-w-[80%]">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getTutorName(domain))}&background=6366f1&color=fff`} />
                      <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center flex-col p-4">
              <Bot className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-center text-gray-500">
                No messages yet. Start a conversation with your AI tutor about {domain || 'your studies'}.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="w-full flex space-x-2">
          <div className={`relative flex-1 ${isInputFocused ? 'ring-2 ring-primary ring-opacity-50 rounded-md' : ''}`}>
            <Input
              placeholder="Ask a question..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="pr-10"
            />
          </div>
          <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !messageInput.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
