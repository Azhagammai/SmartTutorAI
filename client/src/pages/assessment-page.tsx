import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { analyzeLearningStyle } from "@/lib/openai";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import LearningStyleCard from "@/components/learning-style-card";
import { School, CheckCircle, ChevronLeft, ChevronRight, Bot, Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import AiAssistantButton from "@/components/ai-assistant-button";

// Assessment steps
const STEPS = {
  WELCOME: 'welcome',
  QUESTIONS: 'questions',
  LEARNING_STYLE: 'learning_style',
  DOMAINS: 'domains',
  COMPLETE: 'complete'
};

// Assessment question type
interface AssessmentQuestion {
  id: number;
  question: string;
  options: Array<{
    id: string;
    text: string;
    learningTypeIndicator: string;
  }>;
}

// Domain type
interface Domain {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function AssessmentPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(STEPS.WELCOME);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [learningStyle, setLearningStyle] = useState<string | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [learningStyleResult, setLearningStyleResult] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessment questions
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<AssessmentQuestion[]>({
    queryKey: ["/api/assessment-questions"],
    enabled: !!user,
  });

  // Fetch available domains
  const { data: domains, isLoading: isLoadingDomains } = useQuery<Domain[]>({
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

  // Handle navigation based on user state and assessment completion
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If the user has already completed assessment, redirect to dashboard
  // But don't redirect if they just registered (check URL for a specific parameter)
  if (existingLearningStyle && !isLoadingLearningStyle && !window.location.search.includes('newUser=true')) {
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

    if (currentStep === STEPS.QUESTIONS && questions) {
      if (currentQuestionIndex < questions.length - 1) {
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
    } else if (currentStep === STEPS.LEARNING_STYLE && questions) {
      setCurrentStep(STEPS.QUESTIONS);
      setCurrentQuestionIndex(questions.length - 1);
    } else if (currentStep === STEPS.DOMAINS) {
      setCurrentStep(STEPS.LEARNING_STYLE);
    }
  };

  // Submit the assessment
  const handleSubmit = () => {
    if (!selectedDomain) return;
    
    setIsSubmitting(true);
    console.log("Submitting learning style:", {
      learningType: learningStyleResult,
      domain: selectedDomain,
      assessmentResults: answers
    });
    
    // Convert assessmentResults to JSON string to ensure proper transmission
    const assessmentResultsJSON = JSON.stringify(answers);
    
    submitLearningStyleMutation.mutate({
      learningType: learningStyleResult,
      domain: selectedDomain,
      assessmentResults: answers
    }, {
      onSuccess: () => {
        console.log("Learning style saved successfully");
        setCurrentStep(STEPS.COMPLETE);
        
        // Add a small delay before redirecting to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000);
      },
      onError: (error) => {
        console.error("Learning style submission error:", error);
        setIsSubmitting(false);
        alert("There was an error saving your learning style. Please try again.");
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
    const isNewUser = window.location.search.includes('newUser=true');
    return (
      <div className="text-center">
        <div className="mx-auto bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center mb-6">
          <School className="h-10 w-10 text-primary" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {isNewUser ? (
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to EduSmart, {user?.fullName?.split(' ')[0]}! 👋
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">
              Learning Style Assessment
            </h2>
          )}
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {isNewUser 
              ? "Let's start by understanding how you learn best. This will help us create a personalized learning experience just for you."
              : "Answer a few questions to help us understand how you learn best, and we'll create a personalized learning path for you."
            }
          </p>
          <Button size="lg" onClick={handleNext} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
            {isNewUser ? "Let's Get Started" : "Start Assessment"}
          </Button>
        </motion.div>
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
    const selectedDomainObj = domains?.find(d => d.id === selectedDomain);
    const domainName = selectedDomainObj?.name || selectedDomain;
    
    return (
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="mx-auto bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mb-6"
          initial={{ scale: 0.5, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Created Successfully! 🎉</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We've analyzed your responses and created a personalized learning experience just for you.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-medium text-gray-900 mb-4">Your Learning Profile</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Learning Style: <span className="font-medium capitalize">{learningStyleResult}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Primary Domain: <span className="font-medium">{domainName}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">Personalized Path: <span className="font-medium">Ready</span></span>
              </div>
            </div>
          </div>

          <Button 
            size="lg" 
            asChild
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            <a href="/dashboard">Go to Your Dashboard</a>
          </Button>
        </motion.div>
      </motion.div>
    );
  };

  // Main content based on current step
  const renderContent = () => {
    const content = (() => {
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
    })();

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  };

  // Render navigation buttons
  const renderNavigation = () => {
    if (currentStep === STEPS.WELCOME || currentStep === STEPS.COMPLETE) {
      return null;
    }

    const isQuestionAnswered = 
      currentStep !== STEPS.QUESTIONS || 
      (questions && currentQuestionIndex < questions.length && answers[questions[currentQuestionIndex].id]);

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
            disabled={!isQuestionAnswered}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header hideMenu />
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI-Enhanced Assessment Process */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">AI Learning Style Assessment</CardTitle>
            
            {/* Progress Steps */}
            {currentStep !== STEPS.WELCOME && currentStep !== STEPS.COMPLETE && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`h-2 w-2 rounded-full ${currentStep === STEPS.QUESTIONS ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === STEPS.LEARNING_STYLE ? 'bg-primary animate-pulse' : currentStep === STEPS.QUESTIONS ? 'bg-gray-200' : 'bg-primary'}`} />
                <div className={`h-2 w-2 rounded-full ${currentStep === STEPS.DOMAINS ? 'bg-primary animate-pulse' : currentStep === STEPS.QUESTIONS || currentStep === STEPS.LEARNING_STYLE ? 'bg-gray-200' : 'bg-primary'}`} />
              </div>
            )}

            {currentStep === STEPS.WELCOME && (
              <p className="text-gray-600 mt-2">
                Our AI will analyze your responses to personalize your learning experience
              </p>
            )}
          </CardHeader>
          
          <CardContent>
            {currentStep === STEPS.WELCOME && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">AI-Powered Learning Analysis</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Our advanced AI system will analyze your learning preferences and create a personalized learning path just for you.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Feature 
                    icon={<Brain className="h-5 w-5 text-primary" />}
                    title="Smart Learning Style Detection"
                    description="Identifies your optimal learning approach through behavioral analysis"
                  />
                  <Feature 
                    icon={<Sparkles className="h-5 w-5 text-primary" />}
                    title="Personalized Content Adaptation"
                    description="Customizes content format and delivery based on your preferences"
                  />
                  <Feature 
                    icon={<School className="h-5 w-5 text-primary" />}
                    title="Adaptive Learning Path"
                    description="Creates a dynamic learning journey that evolves with your progress"
                  />
                </div>
              </motion.div>
            )}

            {/* ...existing steps content... */}
            {renderContent()}
            {renderNavigation()}
          </CardContent>
        </Card>
      </main>
      
      {/* AI Assistant */}
      <AiAssistantButton minimized />
    </div>
  );
}

// Helper component for welcome screen features
function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
