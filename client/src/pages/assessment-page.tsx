import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { analyzeLearningStyle } from "@/lib/openai";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import LearningStyleCard from "@/components/learning-style-card";
import { School, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// Assessment steps
const STEPS = {
  WELCOME: 'welcome',
  QUESTIONS: 'questions',
  LEARNING_STYLE: 'learning_style',
  DOMAINS: 'domains',
  COMPLETE: 'complete'
};

export default function AssessmentPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [learningStyleResult, setLearningStyleResult] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessment questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["/api/assessment-questions"],
    enabled: !!user,
  });

  // Fetch available domains
  const { data: domains, isLoading: isLoadingDomains } = useQuery({
    queryKey: ["/api/domains"],
    enabled: !!user,
  });

  // Check if user has already completed the assessment
  const { data: existingLearningStyle, isLoading: isLoadingLearningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });

  // Submit learning style mutation
  const submitLearningStyleMutation = useMutation({
    mutationFn: async (data: { learningType: string; domain: string; assessmentResults: Record<number, string> }) => {
      const response = await apiRequest("POST", "/api/learning-style", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-style"] });
      setCurrentStep(STEPS.COMPLETE);
    }
  });

  // Effect to redirect if already completed
  useEffect(() => {
    if (existingLearningStyle && !isLoadingLearningStyle) {
      // If user already has learning style set, redirect to dashboard
      // Will handle in the render logic
    }
  }, [existingLearningStyle, isLoadingLearningStyle]);

  // If the user has already completed assessment, redirect to dashboard
  if (existingLearningStyle && !isLoadingLearningStyle) {
    return <Redirect to="/dashboard" />;
  }

  // Handle answering a question
  const handleAnswer = (questionId: number, learningTypeIndicator: string) => {
    setAnswers({ ...answers, [questionId]: learningTypeIndicator });
  };

  // Move to next question or step
  const handleNext = () => {
    if (currentStep === STEPS.WELCOME) {
      setCurrentStep(STEPS.QUESTIONS);
      return;
    }

    if (currentStep === STEPS.QUESTIONS) {
      if (currentQuestionIndex < (questions?.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Analyze answers to determine learning style
        const learningStyle = analyzeLearningStyle(answers);
        setLearningStyleResult(learningStyle);
        setCurrentStep(STEPS.LEARNING_STYLE);
      }
      return;
    }

    if (currentStep === STEPS.LEARNING_STYLE) {
      setCurrentStep(STEPS.DOMAINS);
    }
  };

  // Move to previous question or step
  const handlePrevious = () => {
    if (currentStep === STEPS.QUESTIONS && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentStep === STEPS.QUESTIONS && currentQuestionIndex === 0) {
      setCurrentStep(STEPS.WELCOME);
    } else if (currentStep === STEPS.LEARNING_STYLE) {
      setCurrentStep(STEPS.QUESTIONS);
      setCurrentQuestionIndex(questions?.length ? questions.length - 1 : 0);
    } else if (currentStep === STEPS.DOMAINS) {
      setCurrentStep(STEPS.LEARNING_STYLE);
    }
  };

  // Submit the assessment
  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log("Submitting learning style:", {
      learningType: learningStyleResult,
      domain: selectedDomain,
      assessmentResults: answers
    });
    
    submitLearningStyleMutation.mutate({
      learningType: learningStyleResult,
      domain: selectedDomain,
      assessmentResults: answers
    }, {
      onError: (error) => {
        console.error("Learning style submission error:", error);
        setIsSubmitting(false);
      }
    });
  };

  // Render progress indicator for questions
  const renderProgress = () => {
    if (!questions) return null;
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );
  };

  // Render the current question
  const renderQuestion = () => {
    if (isLoadingQuestions || !questions || questions.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div>
        {renderProgress()}
        <h3 className="text-lg font-medium text-gray-900 mb-6">{currentQuestion.question}</h3>
        <RadioGroup 
          value={answers[currentQuestion.id] || ""} 
          onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          className="space-y-4"
        >
          {currentQuestion.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={option.learningTypeIndicator} id={`option-${option.id}`} />
              <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // Render domains selection
  const renderDomains = () => {
    if (isLoadingDomains || !domains) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Choose a domain you want to master</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((domain) => (
            <Card 
              key={domain.id} 
              className={`cursor-pointer transition-all ${selectedDomain === domain.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setSelectedDomain(domain.id)}
            >
              <div className="aspect-video w-full overflow-hidden">
                <img src={domain.image} alt={domain.name} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  {domain.name}
                  {selectedDomain === domain.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">{domain.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render the welcome step
  const renderWelcome = () => {
    return (
      <div className="text-center">
        <div className="mx-auto bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <School className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Learning Style Assessment</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Answer a few questions to help us understand how you learn best, and we'll create a personalized learning path just for you.
        </p>
        <Button size="lg" onClick={handleNext}>Start Assessment</Button>
      </div>
    );
  };

  // Render the learning style result
  const renderLearningStyle = () => {
    return (
      <div className="text-center">
        <div className="mx-auto bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Learning Style: <span className="capitalize">{learningStyleResult}</span> Learner</h2>
        <div className="mb-8">
          <LearningStyleCard learningStyle={learningStyleResult} />
        </div>
        <Button size="lg" onClick={handleNext}>Continue</Button>
      </div>
    );
  };

  // Render the completion step
  const renderComplete = () => {
    // Find the selected domain name
    const domainName = domains?.find(d => d.id === selectedDomain)?.name || selectedDomain;
    
    return (
      <div className="text-center">
        <div className="mx-auto bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We've created your personalized learning path based on your {learningStyleResult} learning style and interest in {domainName}.
        </p>
        <Button size="lg" asChild>
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    );
  };

  // Main content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return renderWelcome();
      case STEPS.QUESTIONS:
        return renderQuestion();
      case STEPS.LEARNING_STYLE:
        return renderLearningStyle();
      case STEPS.DOMAINS:
        return renderDomains();
      case STEPS.COMPLETE:
        return renderComplete();
      default:
        return null;
    }
  };

  // Render navigation buttons
  const renderNavigation = () => {
    if (currentStep === STEPS.WELCOME || currentStep === STEPS.COMPLETE) {
      return null;
    }

    return (
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {currentStep === STEPS.DOMAINS ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedDomain || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current"></div>
              </>
            ) : (
              "Complete"
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={currentStep === STEPS.QUESTIONS && !answers[questions?.[currentQuestionIndex]?.id]}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <motion.div 
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8">
            {renderContent()}
            {renderNavigation()}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
