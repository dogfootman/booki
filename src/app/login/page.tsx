'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, LogIn, User, Building, Users } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  const { login, isLoading, error, clearError, switchUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (selectedRole) {
      // Quick role switch for demo
      switchUser(selectedRole);
      router.push('/dashboard');
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
    // Quick demo login - immediately switch user and redirect
    switchUser(role);
    router.push('/dashboard');
  };

  const demoUsers = [
    {
      role: UserRole.ADMIN,
      email: 'admin@bookie.com',
      name: '시스템 관리자',
      description: '전체 시스템 관리 및 모니터링',
      icon: User,
      color: 'bg-red-500',
    },
    {
      role: UserRole.AGENCY_MANAGER,
      email: 'sarah@hawaii-tours.com',
      name: 'Sarah Johnson',
      description: '에이전시 운영 및 에이전트 관리',
      icon: Building,
      color: 'bg-blue-500',
    },
    {
      role: UserRole.AGENT,
      email: 'mike@hawaii-tours.com',
      name: 'Mike Chen',
      description: '고객 상담 및 액티비티 가이드',
      icon: Users,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bookie</h1>
          <p className="text-gray-600">하와이 액티비티 여행사 운영 플랫폼</p>
        </div>

        {/* Demo Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Quick Demo Login
            </CardTitle>
            <CardDescription>
              역할별 기능을 바로 확인하려면 아래 버튼을 클릭하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoUsers.map((user) => {
              const IconComponent = user.icon;
              return (
                <Button
                  key={user.role}
                  variant={selectedRole === user.role ? 'default' : 'outline'}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleRoleSwitch(user.role)}
                >
                  <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center mr-3`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.description}</div>
                    <Badge variant="secondary" className="mt-1">
                      {user.role === UserRole.ADMIN && '관리자'}
                      {user.role === UserRole.AGENCY_MANAGER && '에이전시 매니저'}
                      {user.role === UserRole.AGENT && '에이전트'}
                    </Badge>
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      클릭하여 바로 로그인
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Traditional Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              로그인
            </CardTitle>
            <CardDescription>
              이메일과 비밀번호로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bookie.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  데모용 비밀번호: <code className="bg-gray-100 px-1 rounded">password</code>
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Bookie. 하와이 액티비티 여행사 운영 플랫폼</p>
        </div>
      </div>
    </div>
  );
}
