import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AiTutorChat from "@/components/ai-tutor-chat";
import { Bot, MessageSquare } from "lucide-react";

interface AiTutorCardProps {
  domain?: string;
  learningStyle?: string;
}

export default function AiTutorCard({ domain, learningStyle }: AiTutorCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  
  // Determine tutor name and specialty based on domain
  const getTutorInfo = () => {
    switch (domain) {
      case "Web Development":
        return { name: "Nova", specialty: "Web Development Specialist" };
      case "Artificial Intelligence":
        return { name: "Atlas", specialty: "AI & Machine Learning Expert" };
      case "Cybersecurity":
        return { name: "Cipher", specialty: "Cybersecurity Advisor" };
      case "Mobile Development":
        return { name: "Mira", specialty: "Mobile App Development Guide" };
      case "Data Science":
        return { name: "Data", specialty: "Data Analysis & Visualization Coach" };
      default:
        return { name: "Nova", specialty: "Learning Assistant" };
    }
  };
  
  const tutorInfo = getTutorInfo();
  
  // Generate a tutor message based on learning style
  const generateTutorMessage = () => {
    if (!learningStyle) return "Hi there! I'm your AI tutor. How can I help you with your learning journey today?";
    
    switch (learningStyle) {
      case "story-based":
        return `Hi! I've analyzed your recent progress and noticed you're doing well. I've found some real-world case studies that might help you understand the concepts better. Would you like to explore them?`;
      case "theory-based":
        return `Hello! Based on your learning pattern, I've compiled some detailed explanations and theoretical frameworks that might deepen your understanding. Ready to dive into them?`;
      case "practical-based":
        return `Hey there! I've added some interactive exercises to help you practice what you've learned. Would you like to work through them together?`;
      default:
        return `Hi! I'm here to help with your studies. What would you like to learn today?`;
    }
  };

  return (
    <>
      <Card className="bg-white rounded-lg border border-gray-200 shadow-sm flex-grow">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Your AI Tutor: {tutorInfo.name}</h3>
              <p className="text-sm text-gray-500">{tutorInfo.specialty}</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-700 italic">"{generateTutorMessage()}"</p>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center" 
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with {tutorInfo.name}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="h-5 w-5 text-primary mr-2" />
              Chat with {tutorInfo.name}
            </DialogTitle>
          </DialogHeader>
          <AiTutorChat domain={domain} />
        </DialogContent>
      </Dialog>
    </>
  );
}
