'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Activity, Home, BarChart3, LogOut, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Role-based navigation items
const getNavigationItems = (role: UserRole) => {
  const baseItems = [
    { href: '/', label: '홈', icon: Home },
  ];

  switch (role) {
    case UserRole.ADMIN:
      return [
        ...baseItems,
        { href: '/dashboard', label: '대시보드', icon: BarChart3 },
        { href: '/agencies', label: '에이전시 관리', icon: Building2 },
        { href: '/agents', label: '에이전트 관리', icon: Users },
        { href: '/activities', label: '액티비티 관리', icon: Activity },
        { href: '/calendar', label: '전체 스케줄', icon: Calendar },
      ];
    
    case UserRole.AGENCY_MANAGER:
      return [
        ...baseItems,
        { href: '/dashboard', label: '대시보드', icon: BarChart3 },
        { href: '/agencies', label: '에이전시 관리', icon: Building2 },
        { href: '/agents', label: '에이전트 관리', icon: Users },
        { href: '/activities', label: '액티비티 관리', icon: Activity },
        { href: '/calendar', label: '스케줄 관리', icon: Calendar },
      ];
    
    case UserRole.AGENT:
      return [
        ...baseItems,
        { href: '/dashboard', label: '내 대시보드', icon: BarChart3 },
        { href: '/calendar', label: '내 스케줄', icon: Calendar },
      ];
    
    default:
      return baseItems;
  }
};

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const navigationItems = isAuthenticated && user ? getNavigationItems(user.role) : [];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getRoleDisplayName = () => {
    if (!user) return '';
    
    switch (user.role) {
      case UserRole.ADMIN:
        return '시스템 관리자';
      case UserRole.AGENCY_MANAGER:
        return '에이전시 매니저';
      case UserRole.AGENT:
        return '에이전트';
      default:
        return '사용자';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Bookie
            </Link>
            {isAuthenticated && user && (
              <Badge variant="secondary" className="ml-3">
                {getRoleDisplayName()}
              </Badge>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-sm">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  로그인
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
