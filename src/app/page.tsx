'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, Github, Copy, Sparkles, Calendar, Users, Activity, BarChart3 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types/user';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  const features = [
    {
      title: '에이전트 스케줄 관리',
      description: 'AI 최적화로 예약 분산 및 과부하 방지',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: '액티비티 예약 시스템',
      description: '실시간 예약 관리 및 결제 연동',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'SNS 자동 게시',
      description: 'AI 문구 생성 및 자동 업로드',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: '역할별 대시보드',
      description: '관리자, 에이전시, 에이전트별 맞춤형 UI',
      icon: BarChart3,
      color: 'bg-orange-500',
    },
  ];

  const roles = [
    {
      role: UserRole.ADMIN,
      title: '시스템 관리자',
      description: '전체 시스템 관리 및 모니터링',
      features: ['에이전시 관리', '시스템 통계', '사용자 권한 관리'],
      color: 'bg-red-500',
    },
    {
      role: UserRole.AGENCY_MANAGER,
      title: '에이전시 매니저',
      description: '에이전시 운영 및 에이전트 관리',
      features: ['에이전트 관리', '액티비티 관리', '스케줄 관리'],
      color: 'bg-blue-500',
    },
    {
      role: UserRole.AGENT,
      title: '에이전트',
      description: '고객 상담 및 액티비티 가이드',
      features: ['스케줄 확인', '고객 관리', '액티비티 정보'],
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          하와이 액티비티 여행사
          <br />
          <span className="text-blue-600">운영 플랫폼</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI 최적화 스케줄링, 자동 SNS 게시, 역할별 맞춤형 대시보드로 
          하와이 액티비티 여행사의 운영 효율성을 극대화하세요.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/login')}>
            데모 시작하기
          </Button>
          <Button variant="outline" size="lg">
            자세히 보기
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          주요 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Roles Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          역할별 맞춤형 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className={`${role.color} h-2`} />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {role.role === UserRole.ADMIN && '관리자'}
                    {role.role === UserRole.AGENCY_MANAGER && '에이전시 매니저'}
                    {role.role === UserRole.AGENT && '에이전트'}
                  </Badge>
                  {role.title}
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">지금 시작하세요</CardTitle>
            <CardDescription>
              하와이 액티비티 여행사의 운영을 혁신하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={() => router.push('/login')}>
              무료 데모 시작
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">Bookie</p>
          <p className="text-gray-400">
            © 2024 Bookie. 하와이 액티비티 여행사 운영 플랫폼
          </p>
        </div>
      </footer>
    </div>
  );
}
