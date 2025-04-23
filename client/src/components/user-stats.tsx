import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Flame, Zap, Trophy } from 'lucide-react';

export default function UserStats() {
  const { user } = useAuth();
  
  // Fetch user's achievements
  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
  });
  
  // Fetch user's progress
  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Calculate stats
  const calculateStats = () => {
    const stats = {
      streakDays: 0,
      xpPoints: 0,
      badgesEarned: 0,
      challengesCompleted: 0,
    };
    
    if (achievements) {
      // Find streak days
      const streakAchievement = achievements.find(a => a.type === 'streak');
      if (streakAchievement) {
        stats.streakDays = streakAchievement.value;
      }
      
      // Calculate total XP
      const xpAchievements = achievements.filter(a => a.type === 'xp');
      stats.xpPoints = xpAchievements.reduce((total, a) => total + a.value, 0);
      
      // Count badges
      const badges = achievements.filter(a => a.type === 'badge');
      stats.badgesEarned = badges.length;
      
      // Count completed challenges
      const challenges = achievements.filter(a => a.type === 'challenge');
      stats.challengesCompleted = challenges.length;
    }
    
    // If no achievements yet, set default values for better UX
    if (!achievements || achievements.length === 0) {
      // Count completed modules as challenges
      if (progress && progress.length > 0) {
        stats.challengesCompleted = progress.filter(p => p.completed).length;
        stats.xpPoints = progress.reduce((total, p) => total + Math.floor(p.progress * 10), 0);
        stats.streakDays = 1; // Assume at least 1 day if they have any progress
      }
    }
    
    return stats;
  };
  
  const stats = calculateStats();

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-50 rounded-lg p-3 text-center">
            <div className="flex flex-col items-center">
              <Flame className="h-5 w-5 text-primary mb-1" />
              <span className="block text-2xl font-bold text-primary">{stats.streakDays}</span>
              <span className="text-xs text-primary-700">Days Streak</span>
            </div>
          </div>
          <div className="bg-secondary-50 rounded-lg p-3 text-center">
            <div className="flex flex-col items-center">
              <Zap className="h-5 w-5 text-secondary mb-1" />
              <span className="block text-2xl font-bold text-secondary">{stats.xpPoints}</span>
              <span className="text-xs text-secondary-700">XP Points</span>
            </div>
          </div>
          <div className="bg-accent-50 rounded-lg p-3 text-center">
            <div className="flex flex-col items-center">
              <Award className="h-5 w-5 text-accent mb-1" />
              <span className="block text-2xl font-bold text-accent">{stats.badgesEarned}</span>
              <span className="text-xs text-accent-700">Badges Earned</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="flex flex-col items-center">
              <Trophy className="h-5 w-5 text-gray-600 mb-1" />
              <span className="block text-2xl font-bold text-gray-600">{stats.challengesCompleted}</span>
              <span className="text-xs text-gray-700">Challenges Completed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
