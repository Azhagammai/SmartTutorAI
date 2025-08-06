import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../hooks/use-auth";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Star, 
  Calendar as CalendarIcon, 
  Pen, 
  BookMarked,
  GraduationCap,
  Activity,
  Users,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  fullName: string;
  email: string;
  currentCourse?: string;
  coursesCompleted: number;
  studyHours: number;
  teamProjects: number;
  coursesCreated: number;
  contributions: number;
  progress: Record<string, number>;
  certificates: Certificate[];
  achievements: string[];
  completedActivities: CompletedActivity[];
}

interface Certificate {
  id: string;
  name: string;
  date: string;
  issuer: string;
  url?: string;
}

interface CompletedActivity {
  type: 'course' | 'quiz' | 'exercise' | 'video';
  name: string;
  date: string;
  duration?: number;
  score?: number;
  progress?: number;
  completed?: boolean;  
}

// Function to calculate user stats from activities
const calculateStats = (profile: UserProfile) => {
  let studyHours = 0;
  let completedCourses = 0;
  const achievements = new Set<string>();

  if (profile.completedActivities) {
    for (const activity of profile.completedActivities) {
      if (activity.type === 'course' && activity.progress === 100) {
        completedCourses++;
        achievements.add('Course Completer');
      }
      if (activity.type === 'video' && activity.duration) {
        studyHours += activity.duration / 60;
      }
      if (activity.type === 'exercise' && activity.duration) {
        studyHours += activity.duration / 60;
      }
      if (activity.type === 'quiz' && activity.score && activity.score > 90) {
        achievements.add('Quiz Master');
      }
    }
  }

  // Study time achievements
  if (studyHours >= 10) achievements.add('Dedicated Learner');
  if (studyHours >= 50) achievements.add('Learning Enthusiast');

  return {
    studyHours,
    coursesCompleted: completedCourses,
    achievements: Array.from(achievements)
  };
};

import React from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Pick<UserProfile, 'fullName' | 'email' | 'currentCourse'>>({ 
    fullName: "", 
    email: "", 
    currentCourse: "" 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data: UserProfile) => {
        // Calculate stats from completed activities
        const stats = calculateStats(data);
        
        // Update profile with calculated stats
        const updatedProfile = {
          ...data,
          studyHours: stats.studyHours,
          coursesCompleted: stats.coursesCompleted,
          achievements: stats.achievements
        };
        
        setProfile(updatedProfile);
        setForm({
          fullName: data.fullName || "",
          email: data.email || "",
          currentCourse: data.currentCourse || ""
        });
      });
  }, []);

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    if (!profile) return;
    
    setEditMode(false);
    setForm({
      fullName: profile.fullName,
      email: profile.email,
      currentCourse: profile.currentCourse || ""
    });
    setMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      if (res.ok) {
        setProfile(updated);
        setEditMode(false);
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile");
      }
    } catch (error) {
      setMessage("An error occurred while updating");
    }
    setLoading(false);
  };

  const getInitials = (name: string) => 
    name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "U";

  const getBadges = () => {
    if (!profile?.achievements) return [];
    
    return profile.achievements.map(achievement => ({
      label: achievement,
      variant: achievement.includes('Master') ? 'default' : 'outline'
    } as const));
  };
  // Group activities by date
  type LearningActivity = {
    date: string;
    activities: ActivityType[];
  };

  type ActivityType = CompletedActivity & {
    type: "course" | "quiz" | "exercise" | "video";
    name: string;
    progress?: number;
    score?: number;
    completed?: boolean;
    duration?: number;
  };

  const getLearningActivity = () => {
    if (!profile?.completedActivities) return [];

    const groupedActivities = profile.completedActivities.reduce((acc, activity) => {
      const date = activity.date;
      if (!acc[date]) {
        acc[date] = { date, activities: [] };
      }
      acc[date].activities.push(activity);
      return acc;
    }, {} as Record<string, LearningActivity>);

    return Object.values(groupedActivities).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const learningActivity = getLearningActivity();

  if (!profile) return <div className="p-8">Loading...</div>;

  const courseProgress = profile.currentCourse && profile.progress ? profile.progress[profile.currentCourse] || 0 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 pt-8 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and view your progress</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={`https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=6366f1&color=fff`}
                      alt={profile.fullName} 
                    />
                    <AvatarFallback>{getInitials(profile.fullName)}</AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                  <p className="text-gray-500">{profile.email}</p>
                  {!editMode && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={handleEdit}
                    >
                      <Pen className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {profile.coursesCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-500">Courses</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {getBadges().length}
                    </div>
                    <div className="text-sm text-gray-500">Achievements</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {profile.studyHours || 0}
                    </div>
                    <div className="text-sm text-gray-500">Study Hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Course */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookMarked className="w-5 h-5 mr-2" />
                  Current Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-medium">{profile.currentCourse || "No active course"}</h3>
                  <Progress value={courseProgress} className="h-2" />
                  <p className="text-sm text-gray-500">{courseProgress}% Complete</p>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getBadges().map((badge, i) => (
                    <Badge key={i} variant={badge.variant} className="px-3 py-1">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Learning Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            {editMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Your email"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Course</label>
                      <Input
                        name="currentCourse"
                        value={form.currentCourse}
                        onChange={handleChange}
                        placeholder="Current course"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                    {message && (
                      <p className={`text-sm ${message.includes('Failed') || message.includes('error') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Learning Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <Tabs key="learning-activity-tabs" defaultValue="activity">
                    <TabsList>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="certificates">Certificates</TabsTrigger>
                    </TabsList>
                    
                    <React.Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
                      <TabsContent value="activity">
                        <div className="space-y-8">
                          {learningActivity.map((day, dayIndex) => (
                            <div key={dayIndex} className="space-y-3">
                              <h4 className="text-sm font-medium text-gray-500">
                                {format(new Date(day.date), "MMMM d, yyyy")}
                              </h4>
                              <div className="space-y-3">
                                {day.activities.map((activity, actIndex) => (
                                  <div key={actIndex} className="flex items-center space-x-4 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      {activity.type === 'course' && <BookOpen className="w-4 h-4 text-primary" />}
                                      {activity.type === 'quiz' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                      {activity.type === 'exercise' && <Star className="w-4 h-4 text-primary" />}
                                      {activity.type === 'video' && <Activity className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{activity.name}</p>
                                      <p className="text-gray-500">
                                        {(() => {
                                          switch (activity.type) {
                                            case 'course':
                                              return `${activity.progress}% completed`;
                                            case 'quiz':
                                              return `Score: ${activity.score}%`;
                                            case 'exercise':
                                              return activity.completed ? "Completed" : "In Progress";
                                            case 'video':
                                              return `${activity.duration} minutes`;
                                            default:
                                              return null;
                                          }
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="certificates">
                        <div className="grid gap-4">
                          {profile.certificates?.length > 0 ? (
                            profile.certificates.map((cert: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{cert.name}</p>
                                    <p className="text-sm text-gray-500">{cert.date}</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-center py-4">No certificates yet</p>
                          )}
                        </div>
                      </TabsContent>
                    </React.Suspense>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
