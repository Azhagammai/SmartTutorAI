import React, { useState } from "react";
import { Button } from "./ui/button";
import { Bot, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AiTutorChat from "./ai-tutor-chat";
import { motion, AnimatePresence } from "framer-motion";

interface AiAssistantButtonProps {
  domain?: string;
  learningStyle?: string;
  minimized?: boolean;
}

export default function AiAssistantButton({ domain, learningStyle, minimized = false }: AiAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get tutor name based on domain
  const getTutorName = () => {
    switch (domain) {
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
    <>
      <AnimatePresence>
        <motion.div
          className={`fixed ${
            minimized ? "bottom-20 right-4" : "bottom-4 right-4"
          } z-50`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            variant={minimized ? "outline" : "default"}
            size={minimized ? "icon" : "default"}
            className={`shadow-lg ${
              minimized
                ? "rounded-full h-12 w-12"
                : "rounded-full px-4 py-2 flex items-center space-x-2"
            } bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary`}
          >
            {minimized ? (
              <Bot className="h-5 w-5 text-primary-foreground" />
            ) : (
              <>
                <Bot className="h-5 w-5" />
                <span>Ask {getTutorName()}</span>
              </>
            )}
          </Button>
        </motion.div>
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center">
              <Bot className="h-5 w-5 text-primary mr-2" />
              {getTutorName()} - Your AI Learning Assistant
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <AiTutorChat domain={domain} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
