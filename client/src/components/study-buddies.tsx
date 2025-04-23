import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users } from "lucide-react";

interface StudyBuddiesProps {
  learningDomain?: string;
}

export default function StudyBuddies({ learningDomain }: StudyBuddiesProps) {
  const { toast } = useToast();
  
  // Sample study buddies (in a real app, these would come from an API)
  const sampleBuddies = [
    {
      id: 1,
      name: "Michael Foster",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      domain: "Web Development",
      level: "Intermediate"
    },
    {
      id: 2,
      name: "Dries Vincent",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      domain: "JavaScript",
      level: "Advanced"
    },
    {
      id: 3,
      name: "Jenny Wilson",
      image: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      domain: "React",
      level: "Beginner"
    },
    {
      id: 4,
      name: "Lindsay Walton",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      domain: "Artificial Intelligence",
      level: "Intermediate"
    },
    {
      id: 5,
      name: "Tom Cook",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      domain: "Cybersecurity",
      level: "Advanced"
    }
  ];
  
  // Filter buddies based on the user's learning domain if available
  const filteredBuddies = learningDomain
    ? sampleBuddies.filter(buddy => 
        buddy.domain === learningDomain || 
        buddy.domain.includes(learningDomain.split(" ")[0])
      )
    : sampleBuddies;
  
  // Handle connect button click
  const handleConnect = (buddyId: number, buddyName: string) => {
    toast({
      title: "Connection request sent",
      description: `You've sent a connection request to ${buddyName}.`,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Find Study Buddies
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredBuddies.map((buddy, index) => (
              <li key={buddy.id} className={`px-4 py-3 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={buddy.image} alt={buddy.name} />
                      <AvatarFallback>{buddy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{buddy.name}</p>
                      <p className="text-xs text-gray-500">{buddy.domain} • {buddy.level}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConnect(buddy.id, buddy.name)}
                    className="flex items-center"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Connect
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-3 bg-gray-50 text-right">
            <a href="#" className="text-sm font-medium text-primary hover:text-primary-600">View all →</a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
