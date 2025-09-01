'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/dashboard',
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle>접근 권한이 필요합니다</CardTitle>
          <CardDescription>
            이 페이지에 접근하려면 로그인이 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/login')}>
            <User className="h-4 w-4 mr-2" />
            로그인하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If user doesn't have required role, show access denied
  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle>접근이 거부되었습니다</CardTitle>
          <CardDescription>
            이 페이지에 접근할 권한이 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push(redirectTo)}>
            대시보드로 돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User has required role, render children
  return <>{children}</>;
};

// Convenience components for specific roles
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AgencyManagerOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={[UserRole.AGENCY_MANAGER]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AgentOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={[UserRole.AGENT]} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOrAgencyManager: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.AGENCY_MANAGER]} fallback={fallback}>
    {children}
  </RoleGuard>
);
