'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { agenciesApi } from '@/features/agencies/api';
import { activityStaffApi } from '@/features/activity-staff/api';
import { Agency, UpdateAgencyRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, Save, Trash2, Users } from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAgencyPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [agencyId, setAgencyId] = useState<string>('');
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [formData, setFormData] = useState<UpdateAgencyRequest>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    is_active: true,
  });

  // Unwrap params
  useEffect(() => {
    params.then(({ id }) => {
      setAgencyId(id);
    });
  }, [params]);

  // 에이전시 정보 로드
  useEffect(() => {
    if (agencyId) {
      loadAgency();
    }
  }, [agencyId]);

  const loadAgency = async () => {
    try {
      setIsLoading(true);
      const response = await agenciesApi.getAgency(agencyId);
      
      if (response.success && response.data) {
        const agencyData = response.data;
        setAgency(agencyData);
        setFormData({
          name: agencyData.name,
          description: agencyData.description || '',
          address: agencyData.address || '',
          phone: agencyData.phone || '',
          email: agencyData.email || '',
          website: agencyData.website || '',
          logo_url: agencyData.logo_url || '',
          is_active: agencyData.is_active,
        });
        // 에이전트 수 로드
        loadAgentCount();
      } else {
        throw new Error(response.error || '에이전시 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to load agency:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전시 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push('/agencies');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgentCount = async () => {
    try {
      const activityStaffsResponse = await activityStaffApi.getActivityStaffs({ agencyId });
      if (activityStaffsResponse.success && activityStaffsResponse.data) {
        setAgentCount(activityStaffsResponse.data.length);
      }
    } catch (error) {
      console.warn('Failed to load agent count:', error);
      setAgentCount(0);
    }
  };

  const handleInputChange = (field: keyof UpdateAgencyRequest, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      toast({
        title: '입력 오류',
        description: '에이전시 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await agenciesApi.updateAgency(agencyId, {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        logo_url: formData.logo_url?.trim() || undefined,
      });

      if (response.success && response.data) {
        toast({
          title: '성공',
          description: '에이전시 정보가 성공적으로 업데이트되었습니다.',
        });
        router.push('/agencies');
      } else {
        throw new Error(response.error || '에이전시 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update agency:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전시 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agency) return;
    
    try {
      // 먼저 해당 에이전시에 속한 에이전트들을 확인
      const activityStaffsResponse = await activityStaffApi.getActivityStaffs({ agencyId });
      
      if (activityStaffsResponse.success && activityStaffsResponse.data && activityStaffsResponse.data.length > 0) {
        const agentCount = activityStaffsResponse.data.length;
        const agentNames = activityStaffsResponse.data.map(agent => agent.name).join(', ');
        
        toast({
          title: '삭제 불가',
          description: `이 에이전시에는 ${agentCount}명의 에이전트가 소속되어 있습니다. 먼저 모든 에이전트를 다른 에이전시로 이동하거나 삭제해주세요.`,
          variant: 'destructive',
        });
        
        const shouldGoToAgents = confirm(
          `⚠️ 삭제 불가능\n\n"${agency.name}" 에이전시에는 ${agentCount}명의 에이전트가 등록되어 있습니다:\n${agentNames}\n\n에이전시를 삭제하려면 먼저 모든 에이전트를 다른 에이전시로 이동하거나 삭제해야 합니다.\n\n에이전트 관리 페이지로 이동하시겠습니까?`
        );
        
        if (shouldGoToAgents) {
          router.push('/agents');
        }
        return;
      }

      // 연결된 에이전트가 없으면 삭제 확인
      if (!confirm(`정말로 "${agency.name}" 에이전시를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
      }

      const response = await agenciesApi.deleteAgency(agencyId);
      
      if (response.success) {
        toast({
          title: '성공',
          description: '에이전시가 성공적으로 삭제되었습니다.',
        });
        router.push('/agencies');
      } else {
        throw new Error(response.error || '에이전시 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete agency:', error);
      
      const errorMessage = error instanceof Error ? error.message : '에이전시 삭제에 실패했습니다.';
      
      // 에이전트 연결 오류인 경우 더 친화적인 메시지 표시
      if (errorMessage.includes('agent(s) are still associated')) {
        toast({
          title: '삭제 불가',
          description: '이 에이전시에 소속된 에이전트가 있어 삭제할 수 없습니다. 먼저 모든 에이전트를 이동시키거나 삭제해주세요.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '에러',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const handleCancel = () => {
    router.push('/agencies');
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

  if (!agency) {
    return (
      <AdminOrAgencyManager>
        <div className="container mx-auto py-8 px-4">
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium text-gray-900 mb-2">에이전시를 찾을 수 없습니다</h3>
              <p className="text-gray-600 mb-4">요청하신 에이전시가 존재하지 않습니다.</p>
              <Button onClick={() => router.push('/agencies')}>
                에이전시 목록으로 돌아가기
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
              <h1 className="text-3xl font-bold text-gray-900">에이전시 수정</h1>
              <p className="text-gray-600 mt-2">
                {agency.name} 정보를 수정하세요
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                기본 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 에이전시 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  에이전시 이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Hawaii Adventure Tours"
                  required
                />
              </div>

              {/* 설명 */}
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="에이전시에 대한 간단한 설명을 입력하세요..."
                  rows={3}
                />
              </div>

              {/* 로고 URL */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">로고 URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-gray-500">
                  에이전시 로고 이미지의 URL을 입력하세요
                </p>
              </div>

              {/* 소속 에이전트 정보 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <Label className="text-blue-900 font-medium">소속 에이전트</Label>
                </div>
                <div className="text-sm text-blue-700">
                  현재 <span className="font-semibold">{agentCount}명</span>의 에이전트가 이 에이전시에 소속되어 있습니다.
                  {agentCount > 0 && (
                    <div className="mt-1 text-xs text-blue-600">
                      💡 에이전시를 삭제하려면 먼저 모든 에이전트를 다른 에이전시로 이동하거나 삭제해야 합니다.
                    </div>
                  )}
                </div>
              </div>

              {/* 활성 상태 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">활성 상태</Label>
                  <div className="text-sm text-gray-500">
                    에이전시 활성화 여부를 설정하세요
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

          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="info@hawaii-adventure.com"
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
                  placeholder="+1-808-555-0100"
                />
              </div>

              {/* 주소 */}
              <div className="space-y-2">
                <Label htmlFor="address">주소</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Waikiki Beach Rd, Honolulu, HI 96815"
                  rows={2}
                />
              </div>

              {/* 웹사이트 */}
              <div className="space-y-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://hawaii-adventure.com"
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
              disabled={isSubmitting || agentCount > 0}
              className={agentCount > 0 ? "opacity-50 cursor-not-allowed" : ""}
              title={
                agentCount > 0
                  ? `${agentCount}명의 에이전트가 소속되어 있어 삭제할 수 없습니다`
                  : "에이전시 삭제"
              }
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {agentCount > 0 ? `삭제 불가 (${agentCount}명)` : "에이전시 삭제"}
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
