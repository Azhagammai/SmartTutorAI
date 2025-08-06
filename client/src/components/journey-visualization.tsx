import React from 'react';
import { motion } from 'framer-motion';
import { Milestone, Flag, Map, CheckCircle, Lock } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface JourneyVisualizationProps {
  courses: Array<{
    id: number;
    title: string;
    difficulty: string;
    isCompleted: boolean;
    isLocked: boolean;
    progress: number;
  }>;
  currentCourseId?: number;
}

export default function JourneyVisualization({ courses, currentCourseId }: JourneyVisualizationProps) {
  return (
    <div className="relative py-8">
      {/* Journey Path Line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
      
      {/* Journey Points */}
      <div className="relative z-10 flex justify-between items-center">
        {courses.map((course, index) => {
          const isCurrent = course.id === currentCourseId;
          const isCompleted = course.isCompleted;
          const isLocked = course.isLocked;
          
          return (
            <motion.div
              key={course.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Milestone Point */}
              <Card className={`relative p-4 mb-4 w-48 transform ${
                isCurrent ? 'bg-primary-50 border-primary' : 
                isCompleted ? 'bg-green-50 border-green-200' : 
                isLocked ? 'bg-gray-50 border-gray-200' : 'bg-white'
              }`}>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 bg-inherit border-r border-b" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : isCurrent ? (
                      <Flag className="w-6 h-6 text-primary" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Milestone className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <p className="font-medium text-sm">{course.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{course.difficulty}</p>
                  {(course.progress > 0 && !isCompleted) && (
                    <div className="w-full mt-2">
                      <Progress value={course.progress} className="h-1" />
                      <p className="text-xs text-gray-500 mt-1">{course.progress}% complete</p>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Journey Point */}
              <div className={`w-4 h-4 rounded-full border-2 ${
                isCurrent ? 'bg-primary border-primary' :
                isCompleted ? 'bg-green-500 border-green-500' :
                isLocked ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-400'
              }`} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
