'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/stores/auth-store';
import { UserRole } from '@/types/user';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  languages: string[];
  specialties: string[];
  hourly_rate?: number;
  is_active: boolean;
}

interface Activity {
  id: string;
  title_en: string;
  title_ko?: string;
  description_en?: string;
  price_usd: number;
  duration_minutes: number;
  max_participants: number;
  category?: string;
  tags: string[];
  is_active: boolean;
}

export default function TestPage() {
  const { user, isAuthenticated, switchUser } = useAuthStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
        setMessage(`에이전트 ${data.data.length}명 조회 성공`);
      } else {
        setMessage(`에이전트 조회 실패: ${data.error}`);
      }
    } catch (error) {
      setMessage(`에이전트 조회 오류: ${error}`);
    }
    setLoading(false);
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
        setMessage(`액티비티 ${data.data.length}개 조회 성공`);
      } else {
        setMessage(`액티비티 조회 실패: ${data.error}`);
      }
    } catch (error) {
      setMessage(`액티비티 조회 오류: ${error}`);
    }
    setLoading(false);
  };

  const createTestAgent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '테스트 가이드',
          email: `test${Date.now()}@example.com`,
          phone: '+82-10-1234-5678',
          bio: '테스트용 가이드입니다',
          languages: ['Korean', 'English'],
          specialties: ['테스트', '데모'],
          hourly_rate: 20.00,
          max_hours_per_day: 6,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('테스트 에이전트 생성 성공');
        fetchAgents(); // 목록 새로고침
      } else {
        setMessage(`에이전트 생성 실패: ${data.error}`);
      }
    } catch (error) {
      setMessage(`에이전트 생성 오류: ${error}`);
    }
    setLoading(false);
  };

  const testSimpleAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing simple API...');
      
      const response = await fetch('/api/test');
      console.log('Test API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test API response:', data);
        setMessage('간단한 API 테스트 성공!');
      } else {
        setMessage(`API 테스트 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('Simple API test error:', error);
      setMessage(`API 테스트 오류: ${error}`);
    }
    setLoading(false);
  };

  const createTestActivity = async () => {
    setLoading(true);
    try {
      console.log('Starting activity creation...'); // 디버깅 로그
      
      const requestBody = {
        title_en: 'Test Activity',
        price_usd: 50.00,
        duration_minutes: 60,
        max_participants: 10,
        tags: ['test', 'demo'],
      };
      
      console.log('Request body:', requestBody); // 요청 데이터 로그
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status); // 응답 상태 로그
      console.log('Response headers:', response.headers); // 응답 헤더 로그
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Activity creation response:', data); // 디버깅 로그
      
      if (data.success) {
        setMessage('테스트 액티비티 생성 성공');
        fetchActivities(); // 목록 새로고침
      } else {
        setMessage(`액티비티 생성 실패: ${data.error}`);
        if (data.details) {
          setMessage(`액티비티 생성 실패: ${data.error}`);
          if (data.details) {
            console.log('Validation details:', data.details); // 유효성 검사 상세 정보
          }
        }
      }
    } catch (error) {
      console.error('Activity creation error:', error); // 에러 로그
      setMessage(`액티비티 생성 오류: ${error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
    fetchActivities();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">하와이 액티비티 매니저 API 테스트</h1>
        <p className="text-gray-600 mb-6">Mock 데이터를 사용한 API 기능 테스트 페이지</p>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>현재 사용자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {user.role === UserRole.ADMIN && '시스템 관리자'}
                  {user.role === UserRole.AGENCY_MANAGER && '에이전시 매니저'}
                  {user.role === UserRole.AGENT && '에이전트'}
                </Badge>
                <span className="font-medium">{user.name}</span>
                <span className="text-gray-600">{user.email}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => switchUser(UserRole.ADMIN)}
                >
                  관리자로 전환
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => switchUser(UserRole.AGENCY_MANAGER)}
                >
                  에이전시 매니저로 전환
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => switchUser(UserRole.AGENT)}
                >
                  에이전트로 전환
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">로그인이 필요합니다</p>
              <Button onClick={() => window.location.href = '/login'}>
                로그인하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메시지 표시 */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {/* 테스트 버튼들 */}
      <div className="flex gap-4 justify-center flex-wrap">
        <Button onClick={fetchAgents} disabled={loading}>
          에이전트 목록 조회
        </Button>
        <Button onClick={fetchActivities} disabled={loading}>
          액티비티 목록 조회
        </Button>
        <Button onClick={createTestAgent} disabled={loading} variant="outline">
          테스트 에이전트 생성
        </Button>
        <Button onClick={createTestActivity} disabled={loading} variant="outline">
          테스트 액티비티 생성
        </Button>
        <Button onClick={testSimpleAPI} disabled={loading} variant="outline">
          🧪 간단한 API 테스트
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 에이전트 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              에이전트 목록
              <Badge variant="secondary">{agents.length}명</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{agent.name}</h3>
                  <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                    {agent.is_active ? '활성' : '비활성'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{agent.email}</p>
                {agent.bio && <p className="text-sm mb-2">{agent.bio}</p>}
                <div className="flex flex-wrap gap-1 mb-2">
                  {agent.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <p className="text-gray-500 text-center py-4">에이전트가 없습니다</p>
            )}
          </CardContent>
        </Card>

        {/* 액티비티 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              액티비티 목록
              <Badge variant="secondary">{activities.length}개</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{activity.title_en}</h3>
                  <Badge variant={activity.is_active ? 'default' : 'secondary'}>
                    {activity.is_active ? '활성' : '비활성'}
                  </Badge>
                </div>
                {activity.title_ko && (
                  <p className="text-sm text-gray-600 mb-2">{activity.title_ko}</p>
                )}
                {activity.description_en && (
                  <p className="text-sm mb-2">{activity.description_en}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>💰 ${activity.price_usd}</span>
                  <span>⏱️ {activity.duration_minutes}분</span>
                  <span>👥 {activity.max_participants}명</span>
                </div>
                {activity.category && (
                  <Badge variant="outline" className="text-xs mb-2">
                    {activity.category}
                  </Badge>
                )}
                <div className="flex flex-wrap gap-1">
                  {(activity.tags || []).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-gray-500 text-center py-4">액티비티가 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* API 정보 */}
      <div className="text-center text-sm text-gray-500">
        <p>이 페이지는 하드코딩된 Mock 데이터를 사용합니다</p>
        <p>실제 데이터베이스 연결 없이 API 기능을 테스트할 수 있습니다</p>
      </div>
    </div>
  );
}
