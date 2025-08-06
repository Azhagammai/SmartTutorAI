import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Video,
  BookOpen,
  Code,
  Terminal,
  FileText,
  BookMarked,
  CheckCircle,
  Github,
  PlayCircle,
  Puzzle,
} from "lucide-react";

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

// Add TimelineActivity interface
interface TimelineActivity {
  id: string;
  type: 'learning_activity';
  title: string;
  timestamp: string;
  metadata: {
    resourceType: WatchedResource['type'];
    domain: string;
    platform: string;
    duration?: string;
  };
}

type ActivityItem = WatchedResource | TimelineActivity;

const isTimelineActivity = (activity: ActivityItem): activity is TimelineActivity => {
  return 'type' in activity && activity.type === 'learning_activity';
};

const getActivityMetadata = (activity: ActivityItem) => {
  if (isTimelineActivity(activity)) {
    return {
      type: activity.metadata.resourceType,
      domain: activity.metadata.domain,
      platform: activity.metadata.platform,
      duration: activity.metadata.duration,
      timestamp: activity.timestamp
    };
  }
  return {
    type: activity.type,
    domain: activity.domain,
    platform: activity.platform,
    duration: activity.duration,
    timestamp: activity.completedAt
  };
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="w-4 h-4" />;
    case "article":
      return <FileText className="w-4 h-4" />;
    case "tutorial":
      return <BookOpen className="w-4 h-4" />;
    case "documentation":
      return <BookMarked className="w-4 h-4" />;
    case "github":
      return <Github className="w-4 h-4" />;
    case "module":
      return <Puzzle className="w-4 h-4" />;
    default:
      return <CheckCircle className="w-4 h-4" />;
  }
};

export function ActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-8">
            {activities.sort((a, b) => {
              const timeA = isTimelineActivity(a) ? a.timestamp : a.completedAt;
              const timeB = isTimelineActivity(b) ? b.timestamp : b.completedAt;
              return new Date(timeB).getTime() - new Date(timeA).getTime();
            }).map((activity) => {
              const metadata = getActivityMetadata(activity);
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    {getResourceIcon(metadata.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <Badge variant="secondary">
                        {formatDistanceToNow(new Date(metadata.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{metadata.type}</Badge>
                      <span>•</span>
                      <span>{metadata.domain}</span>
                      {metadata.duration && (
                        <>
                          <span>•</span>
                          <span>{metadata.duration}</span>
                        </>
                      )}
                    </div>
                    {'progress' in activity && activity.progress !== undefined && activity.progress < 100 && (
                      <div className="w-full mt-2">
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${activity.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
