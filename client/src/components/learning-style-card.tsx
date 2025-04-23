import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getPersonalizedRecommendations } from "@/lib/openai";
import { BookOpen, Lightbulb, FileText } from "lucide-react";

interface LearningStyleCardProps {
  learningStyle: string;
  domain?: string;
}

export default function LearningStyleCard({ learningStyle, domain = "general" }: LearningStyleCardProps) {
  const recommendations = getPersonalizedRecommendations(learningStyle, domain);

  // Define descriptions by learning style
  const descriptions = {
    "story-based": "You learn best through real-world examples, case studies, and narratives. You connect with content that provides context and relates concepts to practical situations.",
    "theory-based": "You learn best through comprehensive explanations, frameworks, and models. You enjoy understanding the underlying principles and theoretical foundations.",
    "practical-based": "You learn best through hands-on practice, interactive exercises, and direct application. You prefer to learn by doing rather than just reading or listening."
  };

  // Get appropriate icon for learning style
  const getLearningStyleIcon = () => {
    switch (learningStyle) {
      case "story-based":
        return <BookOpen className="h-5 w-5 text-primary" />;
      case "theory-based":
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case "practical-based":
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="border-primary-100">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary-50 p-2 rounded-full">
            {getLearningStyleIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 capitalize mb-1">
              {learningStyle} Learner
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {descriptions[learningStyle as keyof typeof descriptions] || 
               "Your learning style preferences help us tailor content to match how you learn best."}
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Preferred Content Format</h4>
                <p className="text-sm text-gray-600">{recommendations.contentFormat}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Study Tips</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 mt-1 space-y-1">
                  {recommendations.studyTips.slice(0, 3).map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Recommended Resources</h4>
                <p className="text-sm text-gray-600">
                  {recommendations.resourceTypes.slice(0, 4).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
