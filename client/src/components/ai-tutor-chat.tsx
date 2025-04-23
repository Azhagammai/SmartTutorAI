import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { sendMessageToAiTutor } from "@/lib/openai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AiTutorChat({ domain }: { domain?: string }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Fetch chat history
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/ai-tutor/messages"],
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => sendMessageToAiTutor(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-tutor/messages"] });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message);
      setMessage("");
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Bot className="h-5 w-5 text-primary mr-2" />
          <span>Chat with Nova - Your AI Tutor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full max-h-[350px] px-4">
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : messages && messages.length > 0 ? (
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
                          <AvatarImage src="https://ui-avatars.com/api/?name=AI+Tutor&background=6366f1&color=fff" />
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
                      <AvatarImage src="https://ui-avatars.com/api/?name=AI+Tutor&background=6366f1&color=fff" />
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="pr-10"
            />
          </div>
          <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
