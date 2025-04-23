import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { FileText, Code, BookOpen, Calendar } from "lucide-react";

export default function UpcomingTasks() {
  const { user } = useAuth();
  
  // Fetch user's learning style
  const { data: learningStyle } = useQuery({
    queryKey: ["/api/learning-style"],
    enabled: !!user,
  });
  
  // Fetch user's progress to determine current courses
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Generate sample tasks based on user's courses
  const getTasks = () => {
    // Default tasks if no progress or learning style data
    const defaultTasks = [
      {
        id: 1,
        title: "JavaScript Quiz",
        dueIn: 2,
        difficulty: "Medium",
        icon: <FileText className="text-accent h-5 w-5 mr-2" />
      },
      {
        id: 2,
        title: "DOM Project",
        dueIn: 5,
        difficulty: "Hard",
        icon: <Code className="text-primary h-5 w-5 mr-2" />
      },
      {
        id: 3,
        title: "Reading: Async JS",
        dueIn: 7,
        difficulty: "Easy",
        icon: <BookOpen className="text-secondary h-5 w-5 mr-2" />
      }
    ];
    
    // If we have progress and learning style data, customize the tasks
    if (progress && progress.length > 0 && learningStyle) {
      // Get in-progress courses
      const inProgressCourses = progress.filter(p => p.progress > 0 && !p.completed);
      
      if (inProgressCourses.length > 0) {
        return [
          {
            id: 1,
            title: `${learningStyle.domain} Quiz`,
            dueIn: 3,
            difficulty: "Medium",
            icon: <FileText className="text-accent h-5 w-5 mr-2" />
          },
          {
            id: 2,
            title: `${learningStyle.domain} Project`,
            dueIn: 7,
            difficulty: "Hard",
            icon: <Code className="text-primary h-5 w-5 mr-2" />
          },
          {
            id: 3,
            title: `Study Group: ${learningStyle.domain}`,
            dueIn: 2,
            difficulty: "Easy",
            icon: <Calendar className="text-secondary h-5 w-5 mr-2" />
          }
        ];
      }
    }
    
    return defaultTasks;
  };
  
  const tasks = getTasks();
  
  // Get badge color based on difficulty
  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200">
          {tasks.map(task => (
            <li key={task.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  {task.icon}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">Due in {task.dueIn} days</p>
                  </div>
                </div>
                <Badge className={getDifficultyBadgeVariant(task.difficulty)}>
                  {task.difficulty}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
