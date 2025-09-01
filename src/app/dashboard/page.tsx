'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  Calendar, 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin,
  BarChart3,
  Settings,
  Building
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }



  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 에이전시</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 에이전트</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 액티비티</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 관리</CardTitle>
          <CardDescription>전체 시스템을 관리하고 모니터링하세요</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/agents')}>
            <Users className="h-6 w-6" />
            에이전트 관리
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/activities')}>
            <Activity className="h-6 w-6" />
            액티비티 관리
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/test')}>
            <BarChart3 className="h-6 w-6" />
            시스템 통계
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgencyManagerDashboard = () => (
    <div className="space-y-6">
      {/* Agency Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">에이전트 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">모두 활성 상태</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">액티비티 수</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">12개 활성</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,420</div>
            <p className="text-xs text-muted-foreground">+15% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>에이전시 관리</CardTitle>
          <CardDescription>에이전트와 액티비티를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/agents')}>
            <Users className="h-6 w-6" />
            에이전트 관리
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/activities')}>
            <Activity className="h-6 w-6" />
            액티비티 관리
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/calendar')}>
            <Calendar className="h-6 w-6" />
            스케줄 관리
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentDashboard = () => (
    <div className="space-y-6">
      {/* Agent Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">다음: 14:00</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주 근무시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32h</div>
            <p className="text-xs text-muted-foreground">목표: 40h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전문 분야</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Surfing, Hiking, Cultural</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주 수입</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$640</div>
            <p className="text-xs text-muted-foreground">$20/hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>에이전트 도구</CardTitle>
          <CardDescription>일정 확인 및 고객 관리</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/calendar')}>
            <Calendar className="h-6 w-6" />
            스케줄 확인
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/calendar')}>
            <Users className="h-6 w-6" />
            고객 관리
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/activities')}>
            <Activity className="h-6 w-6" />
            액티비티 정보
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getDashboardContent = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return renderAdminDashboard();
      case UserRole.AGENCY_MANAGER:
        return renderAgencyManagerDashboard();
      case UserRole.AGENT:
        return renderAgentDashboard();
      default:
        return <div>알 수 없는 역할입니다.</div>;
    }
  };

  const getRoleDisplayName = () => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {getRoleDisplayName()}
              </Badge>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {user.name}님, 환영합니다! 오늘의 현황을 확인하세요.
          </p>
        </div>
        
        {getDashboardContent()}
      </main>
    </div>
  );
}
