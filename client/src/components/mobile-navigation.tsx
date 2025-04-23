import React from 'react';
import { useLocation } from 'wouter';
import { LayoutDashboard, GraduationCap, MessageSquare, User as UserIcon } from 'lucide-react';

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard' && location === '/dashboard') return true;
    if (path === '/learning-path' && location.includes('/learning-path')) return true;
    if (path === '/community' && location === '/community') return true;
    if (path === '/profile' && location === '/profile') return true;
    return false;
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around">
        <a 
          href="/dashboard" 
          className={`flex-1 flex flex-col items-center py-3 ${isActive('/dashboard') ? 'text-primary' : 'text-gray-500'}`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a 
          href="/learning-path" 
          className={`flex-1 flex flex-col items-center py-3 ${isActive('/learning-path') ? 'text-primary' : 'text-gray-500'}`}
        >
          <GraduationCap className="h-5 w-5" />
          <span className="text-xs mt-1">Courses</span>
        </a>
        <a 
          href="/community" 
          className={`flex-1 flex flex-col items-center py-3 ${isActive('/community') ? 'text-primary' : 'text-gray-500'}`}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">Community</span>
        </a>
        <a 
          href="/profile" 
          className={`flex-1 flex flex-col items-center py-3 ${isActive('/profile') ? 'text-primary' : 'text-gray-500'}`}
        >
          <UserIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </div>
    </div>
  );
}
