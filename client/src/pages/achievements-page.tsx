import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import {
  Trophy,
  Star,
  Flame,
  Book,
  CheckCircle,
  Timer,
  Brain,
  Award,
  Target,
  Users,
  Zap
} from "lucide-react";

interface UserStats {
  completedCourses: number;
  studyHours: number;
  highScoreQuizzes: number;
  perfectQuizStreak: number;
  helpfulResponses: number;
  discussionsStarted: number;
  xp: number;
}

interface UserAchievement {
  type: string;
  xp: number;
  completedAt: string;
}

// Achievement types and their categories
const achievementCategories = [
  {
    id: "learning",
    name: "Learning Journey",
    description: "Achievements earned through course completion and study time",
    achievements: [
      {
        id: "first-course",
        title: "Course Graduate",
        description: "Complete your first course",
        icon: <Book className="w-6 h-6" />,
        requirement: 1,
        xp: 100
      },
      {
        id: "course-master",
        title: "Course Master",
        description: "Complete 5 courses",
        icon: <Trophy className="w-6 h-6" />,
        requirement: 5,
        xp: 500
      },
      {
        id: "dedicated-learner",
        title: "Dedicated Learner",
        description: "Study for 10 hours",
        icon: <Timer className="w-6 h-6" />,
        requirement: 10,
        xp: 200
      },
      {
        id: "learning-enthusiast",
        title: "Learning Enthusiast",
        description: "Study for 50 hours",
        icon: <Brain className="w-6 h-6" />,
        requirement: 50,
        xp: 1000
      }
    ]
  },
  {
    id: "assessment",
    name: "Assessment Excellence",
    description: "Achievements earned through quiz and exercise performance",
    achievements: [
      {
        id: "quiz-ace",
        title: "Quiz Ace",
        description: "Score 100% on any quiz",
        icon: <Star className="w-6 h-6" />,
        requirement: 1,
        xp: 50
      },
      {
        id: "quiz-master",
        title: "Quiz Master",
        description: "Score 90% or higher on 5 quizzes",
        icon: <Award className="w-6 h-6" />,
        requirement: 5,
        xp: 250
      },
      {
        id: "perfect-streak",
        title: "Perfect Streak",
        description: "Complete 3 quizzes with 100% score in a row",
        icon: <Flame className="w-6 h-6" />,
        requirement: 3,
        xp: 300
      }
    ]
  },
  {
    id: "community",
    name: "Community Engagement",
    description: "Achievements earned through community participation",
    achievements: [
      {
        id: "helpful-peer",
        title: "Helpful Peer",
        description: "Help 3 other students in discussions",
        icon: <Users className="w-6 h-6" />,
        requirement: 3,
        xp: 150
      },
      {
        id: "discussion-starter",
        title: "Discussion Starter",
        description: "Start 5 meaningful discussions",
        icon: <Target className="w-6 h-6" />,
        requirement: 5,
        xp: 200
      }
    ]
  }
];

export default function AchievementsPage() {
  const { user } = useAuth();
  
  // Fetch user's achievements
  const { data: userAchievements } = useQuery<UserAchievement[]>({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });

  // Get user stats for progress tracking
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const getProgress = (achievementId: string): number => {
    if (!stats) return 0;

    switch (achievementId) {
      case "first-course":
      case "course-master":
        return Math.min(100, (stats.completedCourses || 0) * 100 / (achievementId === "first-course" ? 1 : 5));
      case "dedicated-learner":
      case "learning-enthusiast":
        return Math.min(100, (stats.studyHours || 0) * 100 / (achievementId === "dedicated-learner" ? 10 : 50));
      case "quiz-ace":
      case "quiz-master":
        return Math.min(100, (stats.highScoreQuizzes || 0) * 100 / (achievementId === "quiz-ace" ? 1 : 5));
      case "perfect-streak":
        return Math.min(100, (stats.perfectQuizStreak || 0) * 100 / 3);
      case "helpful-peer":
        return Math.min(100, (stats.helpfulResponses || 0) * 100 / 3);
      case "discussion-starter":
        return Math.min(100, (stats.discussionsStarted || 0) * 100 / 5);
      default:
        return 0;
    }
  };

  const isAchieved = (achievementId: string): boolean => {
    return userAchievements?.some(a => a.type === achievementId) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
              <p className="text-gray-600 mt-2">Track your learning milestones and earn recognition</p>
              
              {/* Overall Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Trophy className="w-8 h-8 text-primary mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Total Achievements</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {userAchievements?.length || 0} / {achievementCategories.reduce((acc, cat) => acc + cat.achievements.length, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-8 h-8 text-primary mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Total XP</p>
                          <p className="text-2xl font-bold text-primary">
                            {userAchievements?.reduce((acc, a) => acc + (a.xp || 0), 0) || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Timer className="w-8 h-8 text-primary mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Study Hours</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats?.studyHours || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Achievement Categories */}
            <div className="space-y-8">
              {achievementCategories.map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.achievements.map(achievement => {
                        const achieved = isAchieved(achievement.id);
                        const progress = getProgress(achievement.id);
                        
                        return (
                          <Card key={achievement.id} className={`relative ${achieved ? 'bg-primary/5' : ''}`}>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-4">
                                <div className={`rounded-lg p-2 ${achieved ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                  {achievement.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                                    {achieved && (
                                      <Badge className="bg-primary">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Achieved
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                                  <div className="mt-3">
                                    <Progress value={progress} className="h-1" />
                                    <p className="text-xs text-gray-500 mt-1">Progress: {progress}%</p>
                                  </div>
                                  <div className="mt-2 flex items-center text-xs text-primary">
                                    <Zap className="w-3 h-3 mr-1" />
                                    {achievement.xp} XP
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
