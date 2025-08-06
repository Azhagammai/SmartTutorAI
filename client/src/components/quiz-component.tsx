import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

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
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Handle selecting an answer
  const handleSelectOption = (optionId: string) => {
    if (showResults || isChecking) return;
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
    setShowAnswer(false);
  };
  
  // Check if the selected answer is correct
  const checkAnswer = () => {
    if (!answers[currentQuestion.id]) return;
    
    setIsChecking(true);
    setShowAnswer(true);
    
    const selectedOption = currentQuestion.options.find(
      opt => opt.id === answers[currentQuestion.id]
    );
    
    if (!selectedOption) return;
    
    const isCorrect = selectedOption.correct;
    setResults({
      ...results,
      [currentQuestion.id]: isCorrect
    });

    // Update progress
    const currentProgress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    setProgress(currentProgress);

    // Show answer feedback briefly before moving on
    setTimeout(() => {
      setIsChecking(false);
      setShowAnswer(false);
      
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleQuizComplete();
      }
    }, 1500);
  };

  const handleQuizComplete = () => {
    setShowResults(true);
    const correctAnswers = Object.values(results).filter(r => r).length;
    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    if (onComplete) {
      onComplete(score, totalQuestions);
    }
  };

  const renderFeedback = () => {
    const score = Object.values(results).filter(r => r).length;
    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    const isPass = percentage >= 70;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 rounded-lg bg-gray-50"
      >
        <div className="flex items-center justify-center mb-4">
          {isPass ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          {isPass ? "Congratulations!" : "Keep Learning!"}
        </h3>
        <p className="text-center text-gray-600 mb-4">
          You scored {score} out of {total} ({percentage}%)
        </p>
        {!isPass && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Review these topics:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {quiz.questions.map((q, idx) => !results[q.id] && (
                <li key={q.id} className="text-gray-600">{q.question}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    );
  };

  const renderAnswerFeedback = () => {
    if (!showAnswer || !answers[currentQuestion.id]) return null;

    const selectedOption = currentQuestion.options.find(
      opt => opt.id === answers[currentQuestion.id]
    );
    const isCorrect = selectedOption?.correct;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-4 p-4 rounded-lg ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-center">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? "Correct! Well done!" : "Not quite right. Keep trying!"}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quiz: {quiz.title}</span>
          <span className="text-sm font-normal text-gray-500">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </CardTitle>
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        {!showResults ? (
          <div className="space-y-4">
            <p className="text-lg font-medium">{currentQuestion.question}</p>
            
            <RadioGroup 
              value={answers[currentQuestion.id]} 
              onValueChange={handleSelectOption}
              className="space-y-2"
              disabled={isChecking}
            >
              {currentQuestion.options.map((option) => (
                <div key={option.id} className={`flex items-center space-x-2 p-2 rounded ${
                  showAnswer && answers[currentQuestion.id] === option.id
                    ? option.correct
                      ? 'bg-green-50'
                      : 'bg-red-50'
                    : ''
                }`}>
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {renderAnswerFeedback()}
          </div>
        ) : renderFeedback()}
      </CardContent>
      
      <CardFooter>
        {!showResults ? (
          <Button 
            onClick={checkAnswer} 
            disabled={!answers[currentQuestion.id] || isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : currentQuestionIndex === quiz.questions.length - 1 ? (
              'Submit Quiz'
            ) : (
              'Next Question'
            )}
          </Button>
        ) : (
          <div className="w-full flex justify-end space-x-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retake Quiz
            </Button>
            <Button onClick={() => window.history.back()}>
              Back to Course
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
