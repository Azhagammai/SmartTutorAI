import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  GraduationCap, 
  MessageSquare, 
  Trophy, 
  Settings, 
  User as UserIcon,
  ChevronRight,
  ChevronLeft,
  BookOpen
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  // Handle toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Define menu items
  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      active: location === "/dashboard"
    },
    {
      title: "My Learning",
      icon: <GraduationCap className="h-5 w-5" />,
      href: "/learning-path",
      active: location.includes("/learning-path")
    },
    {
      title: "Community",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/community",
      active: location === "/community"
    },
    {
      title: "Resources",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/resources",
      active: location === "/resources"
    },
    {
      title: "Achievements",
      icon: <Trophy className="h-5 w-5" />,
      href: "/achievements",
      active: location === "/achievements"
    }
  ];

  // Settings and profile items
  const bottomItems = [
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
      active: location === "/settings"
    },
    {
      title: "Profile",
      icon: <UserIcon className="h-5 w-5" />,
      href: "/profile",
      active: location === "/profile"
    }
  ];

  return (
    <div className={cn(
      "hidden md:block fixed left-0 top-16 bottom-0 z-20 overflow-hidden bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="h-full flex flex-col justify-between">
        {/* Main menu */}
        <ScrollArea className="flex-1 pt-3">
          <div className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                  item.active
                    ? "bg-primary-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </a>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom section */}
        <div className="p-3 space-y-1">
          {bottomItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </a>
          ))}

          {/* Collapse button */}
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center px-2 py-2 mt-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <div className="flex items-center w-full justify-between">
                <span>Collapse Sidebar</span>
                <ChevronLeft className="h-5 w-5" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
