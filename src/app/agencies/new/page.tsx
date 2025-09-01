'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agenciesApi } from '@/features/agencies/api';
import { CreateAgencyRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

export default function NewAgencyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateAgencyRequest>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
  });

  const handleInputChange = (field: keyof CreateAgencyRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: '입력 오류',
        description: '에이전시 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await agenciesApi.createAgency({
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
          description: '에이전시가 성공적으로 등록되었습니다.',
        });
        router.push('/agencies');
      } else {
        throw new Error(response.error || '에이전시 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create agency:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전시 등록에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/agencies');
  };

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
              <h1 className="text-3xl font-bold text-gray-900">새 에이전시 등록</h1>
              <p className="text-gray-600 mt-2">
                새로운 여행사 또는 투어 회사 정보를 등록하세요
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
          <div className="flex justify-end gap-4">
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
                  등록 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  에이전시 등록
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminOrAgencyManager>
  );
}
