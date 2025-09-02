'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createActivitySchema, type CreateActivityRequest, type ActivitySlot } from '@/types/activity';
import { z } from 'zod';
import { Clock, Users, MapPin, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  '액티비티', '투어', '레저', '문화체험', '자연탐방', '음식체험', '스포츠', '기타'
];

// Dummy data for testing
const DUMMY_ACTIVITY = {
  id: '1',
  title_en: 'Hawaiian Surfing Adventure',
  title_ko: '하와이 서핑 어드벤처',
  description_en: 'Experience the thrill of surfing in the beautiful waters of Hawaii',
  description_ko: '아름다운 하와이 바다에서 서핑의 스릴을 경험하세요',
  image_url: 'https://picsum.photos/800/600',
  price_usd: 129.99,
  duration_minutes: 120,
  max_participants: 8,
  min_participants: 2,
  location: 'Waikiki Beach, Honolulu',
  category: '레저',
  tags: ['서핑', '바다', '어드벤처'],
  daily_schedules: [],
  activity_slots: [
    {
      id: '1',
      start_time: '09:00',
      duration_minutes: 120,
      max_capacity: 8,
      is_available: true,
    },
    {
      id: '2',
      start_time: '14:00',
      duration_minutes: 120,
      max_capacity: 8,
      is_available: true,
    }
  ],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof createActivitySchema>>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title_en: '',
      title_ko: '',
      description_en: '',
      description_ko: '',
      image_url: '',
      price_usd: 0,
      duration_minutes: 60,
      max_participants: 10,
      min_participants: 1,
      location: '',
      category: '',
      tags: [],
      daily_schedules: [],
      activity_slots: [],
    },
  });

  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({
    control,
    name: 'activity_slots',
  });

  const addSlot = () => {
    const newSlot: ActivitySlot = {
      start_time: '09:00',
      duration_minutes: 60,
      max_capacity: 10,
      is_available: true,
    };
    appendSlot(newSlot);
  };

  const removeSlotItem = (index: number) => {
    removeSlot(index);
  };

  const updateSlot = (index: number, field: keyof ActivitySlot, value: any) => {
    const updatedSlots = [...watch('activity_slots')];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setValue('activity_slots', updatedSlots);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };



  useEffect(() => {
    const loadActivity = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const activity = DUMMY_ACTIVITY;
        
        setValue('title_en', activity.title_en);
        setValue('title_ko', activity.title_ko || '');
        setValue('description_en', activity.description_en || '');
        setValue('description_ko', activity.description_ko || '');
        setValue('image_url', activity.image_url || '');
        setValue('price_usd', activity.price_usd);
        setValue('duration_minutes', activity.duration_minutes);
        setValue('max_participants', activity.max_participants);
        setValue('min_participants', activity.min_participants);
        setValue('location', activity.location || '');
        setValue('category', activity.category || '');
        setValue('tags', activity.tags || []);
        setValue('daily_schedules', activity.daily_schedules || []);
        setValue('activity_slots', activity.activity_slots || []);
        
        setIsActive(activity.is_active);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: '오류',
          description: '액티비티 정보를 불러오는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [setValue, toast]);

  const onSubmit = async (data: z.infer<typeof createActivitySchema>) => {
    setIsSubmitting(true);
    
    try {
      const formData = {
        ...data,
        is_active: isActive,
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '성공',
        description: '액티비티가 성공적으로 수정되었습니다.',
      });
      
      router.push('/activities');
    } catch (error) {
      toast({
        title: '오류',
        description: '액티비티 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">액티비티 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">액티비티 수정</h1>
          <p className="text-gray-600">액티비티 정보를 수정하세요.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                기본 정보
              </CardTitle>
              <CardDescription>액티비티의 기본적인 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title_en">영어 제목 *</Label>
                  <Input
                    id="title_en"
                    {...register('title_en')}
                    placeholder="Activity Title"
                  />
                  {errors.title_en && (
                    <p className="text-sm text-red-600">{errors.title_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_ko">한국어 제목</Label>
                  <Input
                    id="title_ko"
                    {...register('title_ko')}
                    placeholder="액티비티 제목"
                  />
                  {errors.title_ko && (
                    <p className="text-sm text-red-600">{errors.title_ko.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="description_en">영어 설명</Label>
                  <Textarea
                    id="description_en"
                    {...register('description_en')}
                    placeholder="Activity description"
                    rows={3}
                  />
                  {errors.description_en && (
                    <p className="text-sm text-red-600">{errors.description_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ko">한국어 설명</Label>
                  <Textarea
                    id="description_ko"
                    {...register('description_ko')}
                    placeholder="액티비티 설명"
                    rows={3}
                  />
                  {errors.description_ko && (
                    <p className="text-sm text-red-600">{errors.description_ko.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">이미지 URL</Label>
                <Input
                  id="image_url"
                  {...register('image_url')}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && (
                  <p className="text-sm text-red-600">{errors.image_url.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 가격 및 참가자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                가격 및 참가자 정보
              </CardTitle>
              <CardDescription>가격과 참가자 제한을 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price_usd">가격 (USD) *</Label>
                  <Input
                    id="price_usd"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price_usd', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price_usd && (
                    <p className="text-sm text-red-600">{errors.price_usd.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">소요시간 (분) *</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    max="1440"
                    {...register('duration_minutes', { valueAsNumber: true })}
                    placeholder="60"
                  />
                  {errors.duration_minutes && (
                    <p className="text-sm text-red-600">{errors.duration_minutes.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">최대 참가자 수 *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    max="1000"
                    {...register('max_participants', { valueAsNumber: true })}
                    placeholder="10"
                  />
                  {errors.max_participants && (
                    <p className="text-sm text-red-600">{errors.max_participants.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_participants">최소 참가자 수</Label>
                  <Input
                    id="min_participants"
                    type="number"
                    min="1"
                    max="1000"
                    {...register('min_participants', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.min_participants && (
                    <p className="text-sm text-red-600">{errors.min_participants.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 위치 및 카테고리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                위치 및 카테고리
              </CardTitle>
              <CardDescription>액티비티의 위치와 카테고리를 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">위치</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Honolulu, Hawaii"
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select 
                  value={watch('category') || 'none'} 
                  onValueChange={(value) => setValue('category', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">카테고리 선택</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 시간 슬롯 관리 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                시간 슬롯 관리
              </CardTitle>
              <CardDescription>액티비티의 구체적인 시간대와 참가자 제한을 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">각 슬롯마다 시작시간, 소요시간, 최대 참가자 수를 설정할 수 있습니다.</p>
                <Button
                  type="button"
                  onClick={addSlot}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  슬롯 추가
                </Button>
              </div>

              {slotFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>아직 등록된 시간 슬롯이 없습니다.</p>
                  <p className="text-sm">위의 "슬롯 추가" 버튼을 클릭하여 첫 번째 슬롯을 추가하세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {slotFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">슬롯 {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeSlotItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>시작시간 *</Label>
                          <Input
                            type="time"
                            value={watch(`activity_slots.${index}.start_time`) || ''}
                            onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>소요시간 (분) *</Label>
                          <Input
                            type="number"
                            min="1"
                            max="1440"
                            value={watch(`activity_slots.${index}.duration_minutes`) || ''}
                            onChange={(e) => updateSlot(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                            placeholder="60"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>종료시간</Label>
                          <Input
                            type="text"
                            value={calculateEndTime(
                              watch(`activity_slots.${index}.start_time`) || '00:00',
                              watch(`activity_slots.${index}.duration_minutes`) || 0
                            )}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="space-y-2">
                          <Label>최대 참가자 수 *</Label>
                          <Input
                            type="number"
                            min="1"
                            max="1000"
                            value={watch(`activity_slots.${index}.max_capacity`) || ''}
                            onChange={(e) => updateSlot(index, 'max_capacity', parseInt(e.target.value) || 0)}
                            placeholder="10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 활성 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                활성 상태
              </CardTitle>
              <CardDescription>액티비티의 활성 상태를 설정하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is_active">액티비티 활성화</Label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                활성화된 액티비티만 고객에게 표시됩니다.
              </p>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? '수정 중...' : '액티비티 수정'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
