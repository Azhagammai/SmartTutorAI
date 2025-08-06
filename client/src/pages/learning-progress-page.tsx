import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import { Video, BookOpen, Code, Terminal, FileText, BookMarked, CheckCircle, PlayCircle } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { apiRequest } from "@/lib/queryClient";
import { ActivityHeatmap } from "@/components/activity-heatmap";

interface WatchedResource {
  id: string;
  title: string;
  type: "video" | "article" | "tutorial" | "documentation" | "github" | "module";
  domain: string;
  completedAt: string;
  duration?: string;
  platform: string;
  progress?: number;
}

interface DomainProgress {
  domain: string;
  completed: number;
  total: number;
  progress: number;
  level: string;
  lastWatched?: WatchedResource;
  recommended: Array<{
    title: string;
    type: string;
    url: string;
    platform: string;
  }>;
  milestones: Array<{
    level: string;
    requirements: number;
    achieved: boolean;
  }>;
}

interface DomainStats {
  total: number;
  byType: Record<string, number>;
  recentActivity: WatchedResource[];
  streakDays: number;
  totalHours: number;
  bestDay: number;
}

interface ActivityMetadata {
  resourceType: WatchedResource['type'];
  domain: string;
  platform: string;
  duration?: string;
}

interface TimelineActivity {
  id: string;
  type: 'learning_activity';
  title: string;
  timestamp: string;
  metadata: ActivityMetadata;
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
}

export default function LearningProgressPage() {
  const { user } = useAuth();
  const [activityStats, setActivityStats] = useState<Record<string, DomainStats>>({});
  const [selectedDomain, setSelectedDomain] = useState<string>("Web Development");
  const [view, setView] = useState<"overview" | "activity">("overview");

  // Fetch user's watched resources
  const { data: watchedResources = [], isLoading } = useQuery<WatchedResource[]>({
    queryKey: ["/api/progress/resources"],
    enabled: !!user
  });

  // Update activity stats when watched resources change
  useEffect(() => {
    if (Array.isArray(watchedResources)) {
      const stats = watchedResources.reduce((acc, resource) => {
        if (!resource || !resource.domain) return acc;
        
        if (!acc[resource.domain]) {
          acc[resource.domain] = {
            total: 0,
            byType: {},
            recentActivity: [],
            streakDays: 0,
            totalHours: 0,
            bestDay: 0
          };
        }
        
        // Update total count
        acc[resource.domain].total++;

        // Update type counts
        if (resource.type) {
          acc[resource.domain].byType[resource.type] = (acc[resource.domain].byType[resource.type] || 0) + 1;
        }

        // Calculate hours if duration is available
        if (resource.duration) {
          const hours = parseFloat(resource.duration) || 0;
          acc[resource.domain].totalHours += hours;
        }
        
        // Add to recent activity with proper sorting and limiting
        acc[resource.domain].recentActivity = [
          resource,
          ...acc[resource.domain].recentActivity
        ]
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 10);

        // Calculate best day
        const date = new Date(resource.completedAt).toDateString();
        const dailyCounts = acc[resource.domain].recentActivity.reduce((counts, activity) => {
          const activityDate = new Date(activity.completedAt).toDateString();
          counts[activityDate] = (counts[activityDate] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);
        
        acc[resource.domain].bestDay = Math.max(...Object.values(dailyCounts));
        
        return acc;
      }, {} as Record<string, DomainStats>);

      // Update streak counts
      Object.keys(stats).forEach(domain => {
        stats[domain].streakDays = calculateStreak(stats[domain].recentActivity);
      });

      setActivityStats(stats);
    }
  }, [watchedResources]);

  // Handle new activity updates
  const handleActivityUpdate = async (watchedResource: WatchedResource) => {
    try {
      // Create activity timeline entry
      const timeline = {
        id: `${watchedResource.id}-${Date.now()}`,
        type: 'learning_activity',
        title: `Completed ${watchedResource.type}: ${watchedResource.title}`,
        timestamp: watchedResource.completedAt,
        metadata: {
          resourceType: watchedResource.type,
          domain: watchedResource.domain,
          platform: watchedResource.platform,
          duration: watchedResource.duration
        }
      };

      // Post the activity to the timeline
      await apiRequest("POST", "/api/user/timeline", timeline);
      
      // Update local stats
      setActivityStats(prev => {
        const newStats = { ...prev };
        const domain = watchedResource.domain;
          if (!newStats[domain]) {
          newStats[domain] = {
            total: 0,
            byType: {},
            recentActivity: [],
            streakDays: 0,
            totalHours: 0,
            bestDay: 0
          };
        }
        
        newStats[domain].total++;
        if (watchedResource.type) {
          newStats[domain].byType[watchedResource.type] = 
            (newStats[domain].byType[watchedResource.type] || 0) + 1;
        }
        
        newStats[domain].recentActivity = [
          watchedResource,
          ...newStats[domain].recentActivity
        ].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 10);
        
        newStats[domain].streakDays = calculateStreak(newStats[domain].recentActivity);
        
        return newStats;
      });

    } catch (error) {
      console.error('Failed to update activity:', error);
      throw error;
    }
  };

  // Calculate current learning streak
  const calculateStreak = (activities: WatchedResource[]): number => {
    if (!activities.length) return 0;
    
    const sortedDates = activities
      .map(a => new Date(a.completedAt).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const uniqueDates = Array.from(new Set(sortedDates));
    let streak = 1;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) streak++;
      else break;
    }
    
    return streak;
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-8 py-6 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="border-b border-border pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Learning Progress</h1>
                  <p className="text-muted-foreground mt-1">Track your learning journey and achievements</p>
                </div>
                <Tabs value={view} onValueChange={(v) => setView(v as "overview" | "activity")}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-muted-foreground">Loading your learning progress...</p>
                </div>
              ) : (
                <>
                  {/* Activity Heatmap */}
                  <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="px-0">
                      <CardTitle className="text-base font-medium text-muted-foreground">
                        {watchedResources.length} activities in the last year
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ActivityHeatmap activities={watchedResources} />
                    </CardContent>
                  </Card>

                  {view === "overview" && (
                    <div className="space-y-8">
                      {/* Summary Stats */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Current Streak</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold">{activityStats[selectedDomain]?.streakDays || 0}</span>
                              <span className="text-sm text-muted-foreground">days</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Activities</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold">{activityStats[selectedDomain]?.total || 0}</span>
                              <span className="text-sm text-muted-foreground">completed</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Learning Hours</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold">{activityStats[selectedDomain]?.totalHours || 0}</span>
                              <span className="text-sm text-muted-foreground">hours</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Best Day</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold">{activityStats[selectedDomain]?.bestDay || 0}</span>
                              <span className="text-sm text-muted-foreground">activities</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Domain Cards */}
                      <div className="grid gap-4 md:grid-cols-3">
                        {Object.entries(activityStats).map(([domain, stats]) => (
                          <Card 
                            key={domain} 
                            className={`relative overflow-hidden hover:border-primary/50 transition-colors ${
                              domain === selectedDomain ? 'border-primary' : ''
                            }`}
                            onClick={() => setSelectedDomain(domain)}
                            role="button"
                            tabIndex={0}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span>{domain}</span>
                                {domain === selectedDomain && (
                                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Selected</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {Object.entries(stats.byType).map(([type, count]) => (
                                  <div key={type} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {type === "video" && <Video className="h-4 w-4" />}
                                      {type === "article" && <FileText className="h-4 w-4" />}
                                      {type === "tutorial" && <BookOpen className="h-4 w-4" />}
                                      {type === "module" && <Terminal className="h-4 w-4" />}
                                      {type === "documentation" && <BookMarked className="h-4 w-4" />}
                                      {type === "github" && <Code className="h-4 w-4" />}
                                      <span className="text-sm capitalize">{type}s</span>
                                    </div>
                                    <span className="text-sm font-medium">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {view === "activity" && (
                    <div className="space-y-6">
                      <Card className="overflow-hidden">
                        <CardHeader>
                          <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ActivityTimeline activities={watchedResources} />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
