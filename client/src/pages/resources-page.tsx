import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Github,
  Youtube,
  ExternalLink,
  BookMarked,
  Code,
  Terminal,
  CheckCircle
} from "lucide-react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LevelUpAnimation } from "@/components/level-up-animation";
import { useLearning } from "@/contexts/learning-context";

interface WatchedResource {
  id: string;
  title: string;
  type: "video" | "article" | "tutorial" | "documentation" | "github" | "module";
  domain: string;
  platform: string;
  duration?: number;
  completedAt: string;
  progress: number;
}

interface Resource {
  id: string;
  name: string;
  title: string;
  type: "video" | "article" | "tutorial" | "documentation" | "github" | "module";
  url: string;
  description?: string;
  duration?: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  platform: string;
  learningType: "practical-based" | "theory-based" | "story-based";
  domain?: string;
  watched?: boolean;
  completedAt?: string;
}

interface ProgressStatus {
  completed: number;
  total: number;
  progress: number;
  currentLevel: string;
  nextLevel: string;
  nextMilestone: number;
  currentXP: number;
  nextLevelXP: number;
}

const calculateProgressStatus = (domainResources: WatchedResource[], selectedDomain: string): ProgressStatus => {
  const total = resourcesByDomain[selectedDomain]?.length || 0;
  const completed = domainResources.length;
  const progress = Math.round((completed / total) * 100);
  
  const milestones = [
    { level: "Beginner", requirement: 20, xp: 100 },
    { level: "Intermediate", requirement: 40, xp: 250 },
    { level: "Advanced", requirement: 80, xp: 500 },
    { level: "Expert", requirement: 100, xp: 1000 }
  ];

  const currentMilestone = milestones.find(m => progress < m.requirement) || milestones[milestones.length - 1];
  const previousMilestone = milestones[Math.max(0, milestones.indexOf(currentMilestone) - 1)];
  
  const nextRequirement = currentMilestone.requirement;
  const currentLevel = previousMilestone ? previousMilestone.level : "Beginner";
  
  return {
    completed,
    total,
    progress,
    currentLevel,
    nextLevel: currentMilestone.level,
    nextMilestone: nextRequirement,
    currentXP: previousMilestone?.xp || 0,
    nextLevelXP: currentMilestone.xp
  };
};

const resourcesByDomain: Record<string, Resource[]> = {
  "Web Development": [
    {
      id: "Web Development-Complete React Tutorial for Beginners",
      title: "Complete React Tutorial for Beginners",
      type: "video",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      duration: 690,
      difficulty: "beginner",
      platform: "YouTube",
      learningType: "practical-based"
    },
    {
      id: "Web Development-Modern JavaScript - Full Course",
      title: "Modern JavaScript - Full Course",
      type: "video",
      url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
      duration: 195,
      difficulty: "beginner",
      platform: "YouTube",
      learningType: "practical-based"
    },
    {
      id: "Web Development-MDN Web Docs - JavaScript Guide",
      title: "MDN Web Docs - JavaScript Guide",
      type: "documentation",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      difficulty: "intermediate",
      platform: "MDN",
      learningType: "theory-based"
    },
    {
      id: "Web Development-React Official Documentation",
      title: "React Official Documentation",
      type: "documentation",
      url: "https://react.dev",
      difficulty: "intermediate",
      platform: "React",
      learningType: "theory-based"
    },
    {
      id: "Web Development-Full Stack Open Course",
      title: "Full Stack Open Course",
      type: "tutorial",
      url: "https://fullstackopen.com/en/",
      difficulty: "intermediate",
      platform: "University of Helsinki",
      learningType: "story-based"
    }
  ],
  "Artificial Intelligence": [
    {
      id: "Artificial Intelligence-Machine Learning Course by Stanford",
      title: "Machine Learning Course by Stanford",
      type: "video",
      url: "https://www.coursera.org/learn/machine-learning",
      duration: 3600,
      difficulty: "intermediate",
      platform: "Coursera",
      learningType: "theory-based"
    },
    {
      id: "Artificial Intelligence-TensorFlow Documentation",
      title: "TensorFlow Documentation",
      type: "documentation",
      url: "https://www.tensorflow.org/learn",
      difficulty: "intermediate",
      platform: "TensorFlow",
      learningType: "theory-based"
    },
    {
      id: "Artificial Intelligence-PyTorch Tutorials",
      title: "PyTorch Tutorials",
      type: "tutorial",
      url: "https://pytorch.org/tutorials/",
      difficulty: "intermediate",
      platform: "PyTorch",
      learningType: "practical-based"
    },
    {
      id: "Artificial Intelligence-Neural Networks from Scratch",
      title: "Neural Networks from Scratch",
      type: "video",
      url: "https://www.youtube.com/watch?v=Wo5dMEP_BbI",
      duration: 270,
      difficulty: "advanced",
      platform: "YouTube",
      learningType: "practical-based"
    }
  ],
  "Cybersecurity": [
    {
      id: "Cybersecurity-Complete Ethical Hacking Course",
      title: "Complete Ethical Hacking Course",
      type: "video",
      url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
      duration: 720,
      difficulty: "beginner",
      platform: "YouTube",
      learningType: "practical-based"
    },
    {
      id: "Cybersecurity-OWASP Top 10",
      title: "OWASP Top 10",
      type: "documentation",
      url: "https://owasp.org/www-project-top-ten/",
      difficulty: "intermediate",
      platform: "OWASP",
      learningType: "theory-based"
    },
    {
      id: "Cybersecurity-Capture The Flag Challenges",
      title: "Capture The Flag Challenges",
      type: "tutorial",
      url: "https://www.hackthebox.com/",
      difficulty: "advanced",
      platform: "HackTheBox",
      learningType: "story-based"
    }
  ],
  "Data Science": [
    {
      id: "Data Science-Python for Data Science",
      title: "Python for Data Science",
      type: "video",
      url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
      duration: 390,
      difficulty: "beginner",
      platform: "YouTube",
      learningType: "practical-based"
    },
    {
      id: "Data Science-Pandas Documentation",
      title: "Pandas Documentation",
      type: "documentation",
      url: "https://pandas.pydata.org/docs/",
      difficulty: "intermediate",
      platform: "Pandas",
      learningType: "theory-based"
    },
    {
      id: "Data Science-Kaggle Learn",
      title: "Kaggle Learn",
      type: "tutorial",
      url: "https://www.kaggle.com/learn",
      difficulty: "intermediate",
      platform: "Kaggle",
      learningType: "practical-based"
    }
  ]
};

// Helper function to convert difficulty to badge variant
const getDifficultyBadgeVariant = (difficulty: Resource['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'secondary';
    case 'intermediate':
      return 'outline';
    case 'advanced':
      return 'default';
    default:
      return 'secondary';
  }
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const { updateProgress } = useLearning();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState("Web Development");
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [learningTypeFilter, setLearningTypeFilter] = useState<"all" | "practical-based" | "theory-based" | "story-based">("all");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState("");

  // Fetch watched resources
  const { data: watchedResources = [] } = useQuery<WatchedResource[]>({
    queryKey: ["/api/progress/resources"],
    enabled: !!user
  });

  // Mark resource as watched and track completion
  const watchMutation = useMutation({
    mutationFn: async (resource: Resource) => {
      // Create watched resource tracking
      const watchedResource = {
        resourceId: resource.id,
        title: resource.title,
        type: resource.type,
        domain: selectedDomain,
        platform: resource.platform,
        duration: resource.duration,
        completedAt: new Date().toISOString(),
        progress: 0,
        activityType: 'resource_started'
      };

      const response = await apiRequest("POST", "/api/progress/resources/track", watchedResource);
      if (!response.ok) throw new Error("Failed to track resource");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress/resources"] });
    }
  });

  // Calculate domain statistics and progress tracking
  const getProgressStatus = (domainResources: WatchedResource[]) => {
    const total = resourcesByDomain[selectedDomain]?.length || 0;
    const completed = domainResources.length;
    const progress = Math.round((completed / total) * 100);
    
    // Calculate level and next milestone with enhanced progress tracking
    const milestones = [
      { level: "Beginner", requirement: 20 },
      { level: "Intermediate", requirement: 40 },
      { level: "Advanced", requirement: 80 },
      { level: "Expert", requirement: 100 }
    ];
  
    const currentMilestone = milestones.find(m => progress < m.requirement) || milestones[milestones.length - 1];
    const previousMilestone = milestones[Math.max(0, milestones.indexOf(currentMilestone) - 1)];
    
    const nextRequirement = currentMilestone.requirement;
    const currentLevel = previousMilestone ? previousMilestone.level : "Beginner";
    
    return {
      completed,
      total,
      progress,
      currentLevel,
      nextLevel: currentMilestone.level,
      nextMilestone: nextRequirement
    };
  };

  // Mark resource as complete with enhanced tracking
  const markResourceAsComplete = useMutation({
    mutationFn: async (resource: Resource) => {
      const watchedResource: WatchedResource = {
        id: resource.id,
        title: resource.title,
        type: resource.type,
        domain: selectedDomain,
        platform: resource.platform,
        duration: resource.duration,
        completedAt: new Date().toISOString(),
        progress: 100
      };

      // Update learning context for immediate feedback
      await updateProgress(0, watchedResource);

      // Track completion with metadata
      const response = await apiRequest("POST", "/api/progress/resources/complete", {
        resource: watchedResource,
        metadata: {
          resourceType: resource.type,
          difficulty: resource.difficulty,
          platform: resource.platform,
          learningType: resource.learningType,
          activityType: 'resource_completion'
        }
      });

      if (!response.ok) throw new Error("Failed to mark resource as completed");
      
      const responseData = await response.json();
      return { responseData, watchedResource };
    },
    onSuccess: ({ responseData, watchedResource }) => {
      // Update all related queries to reflect completion
      queryClient.invalidateQueries({ queryKey: ["/api/progress/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });

      // Calculate new progress and check for level up
      const updatedResources = [...(Array.isArray(watchedResources) ? watchedResources : []), watchedResource];
      const domainResources = updatedResources.filter(r => r.domain === selectedDomain);
      const { progress, currentLevel, nextLevel } = getProgressStatus(domainResources);

      // Check for level change
      const oldProgress = getProgressStatus(
        (Array.isArray(watchedResources) ? watchedResources : [])
          .filter(r => r.domain === selectedDomain)
      );

      if (oldProgress.currentLevel !== currentLevel) {
        setNewLevel(currentLevel);
        setShowLevelUp(true);
      } else {
        toast({
          title: `Resource Completed! 🎉`,
          description: nextLevel !== currentLevel 
            ? `You're getting closer to ${nextLevel} level! (${progress}% complete)`
            : `Great progress! You're ${progress}% through this domain.`,
          duration: 5000
        });
      }
    },
    onError: (error) => {
      console.error("Error completing resource:", error);
      toast({
        title: "Error",
        description: "Failed to mark resource as completed. Please try again.",
        variant: "destructive"
      });
    }
  });

  const isResourceCompleted = (resource: Resource) => {
    return Array.isArray(watchedResources) && watchedResources.some(
      w => w.title === resource.title && w.domain === selectedDomain
    );
  };

  const handleResourceClick = async (resource: Resource) => {
    // Open resource in new tab
    window.open(resource.url, "_blank");
    
    // Mark as watched if not already
    if (!resource.watched) {
      watchMutation.mutate(resource);
    }
  };

  const getResourceIcon = (type: Resource["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "article":
        return <FileText className="w-5 h-5" />;
      case "tutorial":
        return <BookOpen className="w-5 h-5" />;
      case "documentation":
        return <BookMarked className="w-5 h-5" />;
      case "github":
        return <Github className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: Resource["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
    }
  };

  const filteredResources = resourcesByDomain[selectedDomain]?.map(resource => {
    // Check if resource has been watched
    const isWatched = Array.isArray(watchedResources) && watchedResources.length > 0 
      ? watchedResources.some(w => w.title === resource.title && w.domain === selectedDomain)
      : false;
      
    return {
      ...resource,
      id: `${selectedDomain}-${resource.title}`, // Generate unique ID
      watched: isWatched
    };
  }).filter(
    resource => (filter === "all" || resource.difficulty === filter) && 
                (learningTypeFilter === "all" || resource.learningType === learningTypeFilter)
  ) || [];  // Calculate current progress for selected domain
  // Calculate current progress for selected domain
  const domainResources = Array.isArray(watchedResources) 
    ? watchedResources.filter(r => r.domain === selectedDomain)
    : [];
  
  const progressStatus = calculateProgressStatus(domainResources, selectedDomain);

  const renderResource = (resource: Resource) => (
    <Card key={resource.id} className="h-full flex flex-col">
      <CardHeader className="flex-none pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{resource.title}</CardTitle>
          <div className="flex space-x-2">
            <Badge variant={getDifficultyBadgeVariant(resource.difficulty)}>
              {resource.difficulty}
            </Badge>
            {isResourceCompleted(resource) && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center text-gray-500 text-sm space-x-2 mt-1">
          <span>{resource.duration || "Self-paced"}</span>
          <span>•</span>
          <span>{resource.platform}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          {getResourceIcon(resource.type)}
          <span className="capitalize text-sm">{resource.type}</span>
        </div>
        
        <div className="flex-1">
          {resource.description && (
            <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
          )}
        </div>

        <div className="space-y-2 mt-auto">
          <Button 
            className="w-full" 
            variant="default"
            onClick={() => window.open(resource.url, "_blank")}
          >
            {isResourceCompleted(resource) ? "Review Resource" : "Start Learning"}
          </Button>
          
          {!isResourceCompleted(resource) && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => markResourceAsComplete.mutate(resource)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <LevelUpAnimation
              level={newLevel}
              show={showLevelUp}
              onComplete={() => {
                setShowLevelUp(false);
                toast({
                  title: "New Level Achieved! 🏆",
                  description: `You've reached ${newLevel} level! Keep up the great work!`,
                  duration: 5000
                });
              }}
            />

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
              <p className="text-gray-600 mt-2">Curated learning materials for your selected domain</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="space-y-6">
                {/* Progress Overview with Enhanced Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Domain Progress */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{selectedDomain}</span>
                          <span className="text-sm text-gray-500">
                            {progressStatus.completed} / {progressStatus.total} completed
                          </span>
                        </div>
                        <Progress value={progressStatus.progress} />
                        <div className="mt-3 flex justify-between text-xs text-gray-500">
                          <span>Current Level: {progressStatus.currentLevel}</span>
                          <span>{progressStatus.nextLevel} at {progressStatus.nextMilestone}%</span>
                        </div>
                      </div>

                      {/* Enhanced Time Invested Section */}
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">Progress Overview</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-primary/5 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-primary">{progressStatus.completed}</div>
                            <div className="text-xs text-gray-600">Resources Completed</div>
                          </div>
                          <div className="bg-primary/5 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-primary">{progressStatus.progress}%</div>
                            <div className="text-xs text-gray-600">Domain Progress</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Up</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resourcesByDomain[selectedDomain]
                        ?.filter((r: Resource) => !Array.isArray(watchedResources) ? true : 
                          !watchedResources.some((w: WatchedResource) => w.title === r.title))
                        .slice(0, 2)
                        .map((r: Resource, i: number) => (
                          <div key={i} className="flex items-start space-x-2">
                            {getResourceIcon(r.type)}
                            <div>
                              <p className="text-sm font-medium">{r.title}</p>
                              <p className="text-xs text-gray-500">{r.duration}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1"
                                onClick={() => handleResourceClick(r)}
                              >
                                Start Learning
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Domains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.keys(resourcesByDomain).map((domain) => (
                        <Button
                          key={domain}
                          variant={selectedDomain === domain ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedDomain(domain)}
                        >
                          {domain === "Web Development" && <Code className="w-4 h-4 mr-2" />}
                          {domain === "Artificial Intelligence" && <Terminal className="w-4 h-4 mr-2" />}
                          {domain === "Cybersecurity" && <FileText className="w-4 h-4 mr-2" />}
                          {domain === "Data Science" && <BookOpen className="w-4 h-4 mr-2" />}
                          {domain}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={filter === "all" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setFilter("all")}
                      >
                        All Levels
                      </Button>
                      <Button
                        variant={filter === "beginner" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setFilter("beginner")}
                      >
                        Beginner
                      </Button>
                      <Button
                        variant={filter === "intermediate" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setFilter("intermediate")}
                      >
                        Intermediate
                      </Button>
                      <Button
                        variant={filter === "advanced" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setFilter("advanced")}
                      >
                        Advanced
                      </Button>
                    </div>
                  </CardContent>            </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Style</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant={learningTypeFilter === "all" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setLearningTypeFilter("all")}
                      >
                        All Styles
                      </Button>
                      <Button
                        variant={learningTypeFilter === "practical-based" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setLearningTypeFilter("practical-based")}
                      >
                        Practical Learning
                      </Button>
                      <Button
                        variant={learningTypeFilter === "theory-based" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setLearningTypeFilter("theory-based")}
                      >
                        Theory Based
                      </Button>
                      <Button
                        variant={learningTypeFilter === "story-based" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setLearningTypeFilter("story-based")}
                      >
                        Story Based
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredResources.map((resource, index) => (
                    renderResource(resource)
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <MobileNavigation />
      </div>
    </div>
  );
}
