'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { agentsApi } from '@/features/agents/api';
import { agenciesApi } from '@/features/agencies/api';
import { Agent, UpdateAgentRequest, Agency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Save, Trash2, Building2, Globe, Languages } from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAgentPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [agentId, setAgentId] = useState<string>('');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateAgentRequest>({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    bio: '',
    languages: [],
    specialties: [],
    hourly_rate: 0,
    max_hours_per_day: 8,
    is_active: true,
    agency_id: '',
  });

  // Unwrap params
  useEffect(() => {
    params.then(({ id }) => {
      setAgentId(id);
    });
  }, [params]);

  // 에이전트 정보 및 에이전시 목록 로드
  useEffect(() => {
    if (agentId) {
      Promise.all([loadAgent(), loadAgencies()]);
    }
  }, [agentId]);

  const loadAgent = async () => {
    try {
      setIsLoading(true);
      const response = await agentsApi.getAgent(agentId);
      
      if (response.success && response.data) {
        const agentData = response.data;
        setAgent(agentData);
        setFormData({
          name: agentData.name,
          email: agentData.email,
          phone: agentData.phone || '',
          avatar_url: agentData.avatar_url || '',
          bio: agentData.bio || '',
          languages: agentData.languages || [],
          specialties: agentData.specialties || [],
          hourly_rate: agentData.hourly_rate || 0,
          max_hours_per_day: agentData.max_hours_per_day || 8,
          is_active: agentData.is_active,
          agency_id: agentData.agency_id,
        });
      } else {
        throw new Error(response.error || '에이전트 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to load agent:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전트 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push('/agents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const response = await agenciesApi.getAgencies();
      if (response.success && response.data) {
        setAgencies(response.data.filter(agency => agency.is_active));
      }
    } catch (error) {
      console.warn('Failed to load agencies:', error);
    }
  };

  const handleInputChange = (field: keyof UpdateAgentRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayInputChange = (field: 'languages' | 'specialties', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: '입력 오류',
        description: '에이전트 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: '입력 오류',
        description: '이메일을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await agentsApi.updateAgent(agentId, {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        avatar_url: formData.avatar_url?.trim() || undefined,
        bio: formData.bio?.trim() || undefined,
      });

      if (response.success && response.data) {
        toast({
          title: '성공',
          description: '에이전트 정보가 성공적으로 업데이트되었습니다.',
        });
        router.push('/agents');
      } else {
        throw new Error(response.error || '에이전트 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전트 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    
    if (!confirm(`정말로 "${agent.name}" 에이전트를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await agentsApi.deleteAgent(agentId);
      
      if (response.success) {
        toast({
          title: '성공',
          description: '에이전트가 성공적으로 삭제되었습니다.',
        });
        router.push('/agents');
      } else {
        throw new Error(response.error || '에이전트 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전트 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  if (isLoading) {
    return (
      <AdminOrAgencyManager>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AdminOrAgencyManager>
    );
  }

  if (!agent) {
    return (
      <AdminOrAgencyManager>
        <div className="container mx-auto py-8 px-4">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-2">에이전트를 찾을 수 없습니다</h3>
              <p className="text-gray-600 mb-4">요청하신 에이전트가 존재하지 않습니다.</p>
              <Button onClick={() => router.push('/agents')}>
                에이전트 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminOrAgencyManager>
    );
  }

  return (
    <AdminOrAgencyManager>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">에이전트 수정</h1>
              <p className="text-gray-600 mt-2">
                {agent.name} 정보를 수정하세요
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@hawaii-tours.com"
                  required
                />
              </div>

              {/* 전화번호 */}
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1-808-555-0101"
                />
              </div>

              {/* 아바타 URL */}
              <div className="space-y-2">
                <Label htmlFor="avatar_url">프로필 이미지 URL</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* 소속 에이전시 */}
              <div className="space-y-2">
                <Label htmlFor="agency_id">
                  소속 에이전시 <span className="text-red-500">*</span>
                </Label>
                <select
                  id="agency_id"
                  value={formData.agency_id}
                  onChange={(e) => handleInputChange('agency_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">에이전시를 선택하세요</option>
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 활성 상태 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">활성 상태</Label>
                  <div className="text-sm text-gray-500">
                    에이전트 활성화 여부를 설정하세요
                  </div>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 상세 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                상세 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 소개 */}
              <div className="space-y-2">
                <Label htmlFor="bio">소개</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="에이전트에 대한 간단한 소개를 입력하세요..."
                  rows={3}
                />
              </div>

              {/* 언어 */}
              <div className="space-y-2">
                <Label htmlFor="languages">
                  <Languages className="w-4 h-4 inline mr-1" />
                  사용 가능한 언어
                </Label>
                <Input
                  id="languages"
                  type="text"
                  value={formData.languages.join(', ')}
                  onChange={(e) => handleArrayInputChange('languages', e.target.value)}
                  placeholder="English, Korean, Japanese (쉼표로 구분)"
                />
                <p className="text-sm text-gray-500">
                  여러 언어는 쉼표(,)로 구분하여 입력하세요
                </p>
              </div>

              {/* 전문 분야 */}
              <div className="space-y-2">
                <Label htmlFor="specialties">전문 분야</Label>
                <Input
                  id="specialties"
                  type="text"
                  value={formData.specialties.join(', ')}
                  onChange={(e) => handleArrayInputChange('specialties', e.target.value)}
                  placeholder="Hiking, Snorkeling, Cultural Tours (쉼표로 구분)"
                />
                <p className="text-sm text-gray-500">
                  여러 전문 분야는 쉼표(,)로 구분하여 입력하세요
                </p>
              </div>

              {/* 시급 */}
              <div className="space-y-2">
                <Label htmlFor="hourly_rate">시급 (USD)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                  placeholder="25.00"
                />
              </div>

              {/* 최대 근무 시간 */}
              <div className="space-y-2">
                <Label htmlFor="max_hours_per_day">일일 최대 근무 시간</Label>
                <Input
                  id="max_hours_per_day"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.max_hours_per_day}
                  onChange={(e) => handleInputChange('max_hours_per_day', parseInt(e.target.value) || 8)}
                  placeholder="8"
                />
              </div>
            </CardContent>
          </Card>

          {/* 폼 액션 */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              에이전트 삭제
            </Button>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    업데이트 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    변경사항 저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminOrAgencyManager>
  );
}
