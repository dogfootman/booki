'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAgentSchema, CreateAgentRequest } from '@/types/agent';
import { Agency } from '@/types';
import { agentsApi } from '@/features/agents/api';
import { agenciesApi } from '@/features/agencies/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';

export default function NewAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      bio: '',
      languages: [],
      specialties: [],
      hourly_rate: undefined,
      max_hours_per_day: 8,
      agency_id: '',
    },
  });

  // 에이전시 목록 로드
  useEffect(() => {
    const loadAgencies = async () => {
      try {
        setIsLoading(true);
        const response = await agenciesApi.getAgencies({ is_active: true });
        if (response.success && response.data) {
          setAgencies(response.data);
        }
      } catch (error) {
        console.error('Failed to load agencies:', error);
        toast({
          title: '에러',
          description: '에이전시 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAgencies();
  }, [toast]);

  // 폼 제출 처리
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await agentsApi.createAgent(data);
      
      if (response.success && response.data) {
        toast({
          title: '성공',
          description: '에이전트가 성공적으로 등록되었습니다.',
        });
        router.push('/agents'); // 에이전트 목록 페이지로 이동
      } else {
        throw new Error(response.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전트 등록에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">새 에이전트 등록</h1>
        <p className="text-gray-600 mt-2">
          새로운 에이전트 정보를 입력하여 등록하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            에이전트 정보
          </CardTitle>
          <CardDescription>
            에이전트의 기본 정보와 소속 에이전시를 입력하세요.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="에이전트 이름을 입력하세요"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="example@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1-808-555-0123"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">소개</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="에이전트에 대한 간단한 소개를 입력하세요"
                  rows={3}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>
            </div>

            {/* 소속 에이전시 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">소속 에이전시</h3>
              
              <div className="space-y-2">
                <Label htmlFor="agency_id">에이전시 *</Label>
                <Select
                  onValueChange={(value) => setValue('agency_id', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.agency_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="소속 에이전시를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.agency_id && (
                  <p className="text-sm text-red-500">{errors.agency_id.message}</p>
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    에이전시 목록을 불러오는 중...
                  </div>
                )}
              </div>
            </div>

            {/* 업무 설정 섹션 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">업무 설정</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">시급 (USD)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('hourly_rate', { valueAsNumber: true })}
                    placeholder="25.00"
                    className={errors.hourly_rate ? 'border-red-500' : ''}
                  />
                  {errors.hourly_rate && (
                    <p className="text-sm text-red-500">{errors.hourly_rate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_hours_per_day">일일 최대 근무 시간 *</Label>
                  <Input
                    id="max_hours_per_day"
                    type="number"
                    min="1"
                    max="24"
                    {...register('max_hours_per_day', { valueAsNumber: true })}
                    className={errors.max_hours_per_day ? 'border-red-500' : ''}
                  />
                  {errors.max_hours_per_day && (
                    <p className="text-sm text-red-500">{errors.max_hours_per_day.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    에이전트 등록
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
