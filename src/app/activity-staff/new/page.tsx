'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { activityStaffApi } from '@/features/activity-staff/api';
import { agenciesApi } from '@/features/agencies/api';
import { Agency } from '@/types';
import { CreateActivityStaffRequest } from '@/types/activity-staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

const COMMON_LANGUAGES = [
  'English', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'French', 'German', 'Russian'
];

const COMMON_SPECIALTIES = [
  'Hiking', 'Snorkeling', 'Cultural Tours', 'Scuba Diving', 'Swimming', 'Marine Life',
  'Photography', 'Food Tours', 'Historical Tours', 'Nature Tours', 'Adventure Sports'
];

export default function NewActivityStaffPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CreateActivityStaffRequest>({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    bio: '',
    languages: [],
    specialties: [],
    hourly_rate: undefined,
    max_hours_per_day: 8,
    agency_id: '',
    unavailable_dates: [],
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // 에이전시 목록 로드
  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      const response = await agenciesApi.getAgencies();
      if (response.success && response.data) {
        setAgencies(response.data);
      }
    } catch (error) {
      console.error('Failed to load agencies:', error);
    }
  };

  const handleInputChange = (field: keyof CreateActivityStaffRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLanguage = (language: string) => {
    if (language && !formData.languages?.includes(language)) {
      handleInputChange('languages', [...(formData.languages || []), language]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    handleInputChange('languages', formData.languages?.filter(l => l !== language) || []);
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties?.includes(specialty)) {
      handleInputChange('specialties', [...(formData.specialties || []), specialty]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    handleInputChange('specialties', formData.specialties?.filter(s => s !== specialty) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.agency_id) {
      toast({
        title: '입력 오류',
        description: '이름, 이메일, 에이전시는 필수 입력 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await activityStaffApi.createActivityStaff(formData);
      
      if (response.success) {
        toast({
          title: '성공',
          description: '새로운 액티비티 스태프가 성공적으로 등록되었습니다.',
        });
        router.push('/activity-staff');
      } else {
        throw new Error(response.error || '액티비티 스태프 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create activity staff:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '액티비티 스태프 등록에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminOrAgencyManager>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/activity-staff')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 액티비티 스태프 등록</h1>
              <p className="text-gray-600 mt-2">새로운 투어 가이드 또는 스태프를 등록하세요</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>
                  스태프의 기본적인 개인 정보를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="hong@hawaii-tours.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1-808-555-0123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agency_id">소속 에이전시 *</Label>
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
                </div>

                <div>
                  <Label htmlFor="avatar_url">프로필 이미지 URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">소개</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="스태프의 경험과 전문성을 간단히 소개해주세요..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 근무 조건 */}
            <Card>
              <CardHeader>
                <CardTitle>근무 조건</CardTitle>
                <CardDescription>
                  시급과 근무 시간 등 근무 조건을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourly_rate">시급 (USD)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate || ''}
                      onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || undefined)}
                      placeholder="25.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_hours_per_day">일일 최대 근무 시간</Label>
                    <Input
                      id="max_hours_per_day"
                      type="number"
                      min="1"
                      max="24"
                      value={formData.max_hours_per_day}
                      onChange={(e) => handleInputChange('max_hours_per_day', parseInt(e.target.value) || 8)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 언어 및 전문 분야 */}
            <Card>
              <CardHeader>
                <CardTitle>언어 및 전문 분야</CardTitle>
                <CardDescription>
                  스태프가 구사하는 언어와 전문 분야를 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 언어 */}
                <div>
                  <Label>언어</Label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {COMMON_LANGUAGES.map((language) => (
                        <Badge
                          key={language}
                          variant={formData.languages?.includes(language) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => 
                            formData.languages?.includes(language) 
                              ? removeLanguage(language)
                              : addLanguage(language)
                          }
                        >
                          {language}
                          {formData.languages?.includes(language) && (
                            <X className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="새 언어 추가..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLanguage(newLanguage);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addLanguage(newLanguage)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.languages && formData.languages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">선택된 언어:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.languages.map((language) => (
                            <Badge key={language} variant="default" className="flex items-center gap-1">
                              {language}
                              <button
                                type="button"
                                onClick={() => removeLanguage(language)}
                                className="hover:bg-blue-600 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 전문 분야 */}
                <div>
                  <Label>전문 분야</Label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SPECIALTIES.map((specialty) => (
                        <Badge
                          key={specialty}
                          variant={formData.specialties?.includes(specialty) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => 
                            formData.specialties?.includes(specialty) 
                              ? removeSpecialty(specialty)
                              : addSpecialty(specialty)
                          }
                        >
                          {specialty}
                          {formData.specialties?.includes(specialty) && (
                            <X className="w-3 h-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="새 전문 분야 추가..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSpecialty(newSpecialty);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSpecialty(newSpecialty)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.specialties && formData.specialties.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">선택된 전문 분야:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.specialties.map((specialty) => (
                            <Badge key={specialty} variant="default" className="flex items-center gap-1">
                              {specialty}
                              <button
                                type="button"
                                onClick={() => removeSpecialty(specialty)}
                                className="hover:bg-blue-600 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/activity-staff')}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                등록하기
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminOrAgencyManager>
  );
}
