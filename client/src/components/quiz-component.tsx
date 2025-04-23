import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizComponentProps {
  quiz: {
    id: number;
    title: string;
    description?: string;
    questions: Array<{
      id: number;
      question: string;
      options: Array<{
        id: string;
        text: string;
        correct: boolean;
      }>;
    }>;
  };
  onComplete?: (score: number, total: number) => void;
}

export default function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Handle selecting an answer
  const handleSelectOption = (optionId: string) => {
    if (showResults) return; // Don't allow changes after submission
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
  };
  
  // Check if the selected answer is correct
  const checkAnswer = () => {
    setIsChecking(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedOption = currentQuestion.options.find(
        option => option.id === answers[currentQuestion.id]
      );
      
      const isCorrect = selectedOption?.correct || false;
      
      setResults({
        ...results,
        [currentQuestion.id]: isCorrect
      });
      
      setShowResults(true);
      setIsChecking(false);
    }, 700);
  };
  
  // Move to the next question
  const goToNextQuestion = () => {
    setShowResults(false);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };
  
  // Complete the quiz
  const finishQuiz = () => {
    const correctAnswers = Object.values(results).filter(r => r).length;
    const totalQuestions = quiz.questions.length;
    
    if (onComplete) {
      onComplete(correctAnswers, totalQuestions);
    }
    
    // Reset for future attempts
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults({});
    setShowResults(false);
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  // Determine if user has reached the end of the quiz
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  // Determine action button text
  const getActionButtonText = () => {
    if (isChecking) return "Checking...";
    if (showResults) {
      return isLastQuestion ? "Finish Quiz" : "Next Question";
    }
    return "Check Answer";
  };
  
  // Determine action button handler
  const handleActionButton = () => {
    if (isChecking) return;
    
    if (showResults) {
      if (isLastQuestion) {
        finishQuiz();
      } else {
        goToNextQuestion();
      }
    } else {
      checkAnswer();
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-md font-medium flex items-center">
          <HelpCircle className="text-accent h-5 w-5 mr-2" />
          {quiz.title}
        </CardTitle>
        {quiz.description && <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>}
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <p className="text-gray-800 font-medium mt-4">{currentQuestion.question}</p>
          
          <RadioGroup 
            value={answers[currentQuestion.id] || ""} 
            onValueChange={handleSelectOption}
            className="space-y-3 mt-2"
          >
            {currentQuestion.options.map((option) => (
              <div 
                key={option.id} 
                className={`flex items-center space-x-2 border p-3 rounded-lg 
                  ${showResults && answers[currentQuestion.id] === option.id 
                    ? option.correct 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200' 
                    : 'hover:bg-gray-50'
                  }`}
              >
                <RadioGroupItem value={option.id} id={`option-${option.id}`} disabled={showResults} />
                <Label 
                  htmlFor={`option-${option.id}`} 
                  className={`flex-1 cursor-pointer ${showResults && 'cursor-default'}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option.text}</span>
                    <AnimatePresence>
                      {showResults && answers[currentQuestion.id] === option.id && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {option.correct ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {showResults && (
            <div className={`p-3 rounded-lg ${
              results[currentQuestion.id] ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium mb-1">
                {results[currentQuestion.id] ? 'Correct!' : 'Incorrect!'}
              </p>
              <p className="text-sm">
                {results[currentQuestion.id] 
                  ? 'Great job! You got it right.' 
                  : `The correct answer is: ${currentQuestion.options.find(o => o.correct)?.text}`
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <Button 
          onClick={handleActionButton} 
          disabled={!answers[currentQuestion.id] || isChecking}
          className="ml-auto"
        >
          {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getActionButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
