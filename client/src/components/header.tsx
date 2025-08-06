import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { School, ChevronDown, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  hideMenu?: boolean;
}

export default function Header({ hideMenu = false }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollPos, setLastScrollPos] = useState(0);

  // Handle scroll to hide/show header
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingDown = currentScrollPos > lastScrollPos;
      
      if (currentScrollPos > 50) {
        setIsHeaderVisible(!isScrollingDown);
      } else {
        setIsHeaderVisible(true);
      }
      
      setLastScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPos]);

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${isHeaderVisible ? 'transform-none' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <School className="text-primary h-8 w-8 mr-2" />
              <span className="font-bold text-xl text-gray-900">EduSmart</span>
            </div>
            
            {!hideMenu && (
              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <a 
                  href="/dashboard" 
                  className={`${location === '/dashboard' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Dashboard
                </a>
                <a 
                  href="/learning-path" 
                  className={`${location.includes('/learning-path') ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  My Courses
                </a>
                <a 
                  href="/community" 
                  className={`${location === '/community' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Community
                </a>
                <a 
                  href="/resources" 
                  className={`${location === '/resources' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Resources
                </a>
                <a 
                  href="/achievements" 
                  className={`${location === '/achievements' ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Achievements
                </a>
              </nav>
            )}
          </div>

          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center p-1 rounded-full focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=6366f1&color=fff`} 
                        alt={user?.fullName || 'User'} 
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block ml-2 text-sm font-medium text-gray-700">{user?.fullName}</span>
                    <ChevronDown className="hidden md:block ml-1 h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/80 backdrop-blur-md">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200/50" />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200/50" />
                  <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
