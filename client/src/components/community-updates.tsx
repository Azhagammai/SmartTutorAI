import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award, Users } from "lucide-react";

export default function CommunityUpdates() {
  // Sample community updates
  const updates = [
    {
      id: 1,
      type: "reply",
      user: {
        name: "Sarah",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      content: "responded to your question about JavaScript promises",
      time: "15 minutes ago",
      borderColor: "border-primary-300"
    },
    {
      id: 2,
      type: "achievement",
      content: "You earned the Code Master badge!",
      time: "1 hour ago",
      borderColor: "border-green-300",
      icon: <Award className="text-green-500 text-sm" />
    },
    {
      id: 3,
      type: "resource",
      user: {
        name: "Michael",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      content: "shared a study resource: \"JavaScript Array Methods Cheatsheet\"",
      time: "3 hours ago",
      borderColor: "border-gray-300"
    },
    {
      id: 4,
      type: "group",
      content: "New study group formed: React Developers",
      time: "Yesterday",
      borderColor: "border-accent-300",
      icon: <Users className="text-accent-500 text-sm" />
    }
  ];

  return (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Community Updates</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4 max-h-64 overflow-y-auto">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {updates.map(update => (
              <div key={update.id} className={`border-l-2 ${update.borderColor} pl-3`}>
                <div className="flex items-start">
                  {update.user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={update.user.avatar} alt={update.user.name} />
                      <AvatarFallback>{update.user.name[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {update.icon}
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm text-gray-800">
                      {update.user && <span className="font-medium">{update.user.name}</span>}{" "}
                      {update.content}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{update.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <a href="/community" className="text-sm font-medium text-primary hover:text-primary-600">
          View all activity →
        </a>
      </CardFooter>
    </Card>
  );
}
