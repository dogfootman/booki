'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/types/activity';
import { Search, Plus, Edit, Trash2, Clock, Users, MapPin, Calendar } from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

// Dummy data for testing
const DUMMY_ACTIVITIES: Activity[] = [
  {
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
  },
  {
    id: '2',
    title_en: 'Volcano Hiking Tour',
    title_ko: '화산 하이킹 투어',
    description_en: 'Explore the majestic volcanoes of Hawaii with expert guides',
    description_ko: '전문 가이드와 함께 하와이의 웅장한 화산을 탐험하세요',
    image_url: 'https://picsum.photos/800/600',
    price_usd: 89.99,
    duration_minutes: 180,
    max_participants: 12,
    min_participants: 4,
    location: 'Hawaii Volcanoes National Park',
    category: '자연탐방',
    tags: ['하이킹', '화산', '자연'],
    daily_schedules: [],
    activity_slots: [
      {
        id: '3',
        start_time: '08:00',
        duration_minutes: 180,
        max_capacity: 12,
        is_available: true,
      }
    ],
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title_en: 'Traditional Luau Feast',
    title_ko: '전통 루아우 축제',
    description_en: 'Experience authentic Hawaiian culture and cuisine',
    description_ko: '진정한 하와이 문화와 요리를 경험하세요',
    image_url: 'https://picsum.photos/800/600',
    price_usd: 149.99,
    duration_minutes: 240,
    max_participants: 50,
    min_participants: 10,
    location: 'Polynesian Cultural Center',
    category: '문화체험',
    tags: ['문화', '음식', '전통'],
    daily_schedules: [],
    activity_slots: [
      {
        id: '4',
        start_time: '18:00',
        duration_minutes: 240,
        max_capacity: 50,
        is_available: true,
      }
    ],
    is_active: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

export default function ActivitiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadActivities();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadActivities = () => {
    let filteredActivities = DUMMY_ACTIVITIES;

    // 검색어 필터링
    if (searchTerm) {
      filteredActivities = filteredActivities.filter(activity =>
        activity.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.title_ko?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description_ko?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (selectedCategory && selectedCategory !== 'all') {
      filteredActivities = filteredActivities.filter(activity =>
        activity.category === selectedCategory
      );
    }

    // 상태 필터링
    if (selectedStatus && selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active';
      filteredActivities = filteredActivities.filter(activity =>
        activity.is_active === isActive
      );
    }

    setActivities(filteredActivities);
  };

  const handleDelete = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivities(prev => prev.filter(activity => activity.id !== id));
      
      toast({
        title: '성공',
        description: '액티비티가 삭제되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '액티비티 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${mins}분`;
  };

  return (
    <AdminOrAgencyManager>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">액티비티 관리</h1>
            <p className="text-gray-600">등록된 액티비티를 관리하고 새로운 액티비티를 추가하세요.</p>
          </div>
          <Button
            onClick={() => router.push('/activities/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            새 액티비티 등록
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="액티비티명, 설명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    <SelectItem value="액티비티">액티비티</SelectItem>
                    <SelectItem value="투어">투어</SelectItem>
                    <SelectItem value="레저">레저</SelectItem>
                    <SelectItem value="문화체험">문화체험</SelectItem>
                    <SelectItem value="자연탐방">자연탐방</SelectItem>
                    <SelectItem value="음식체험">음식체험</SelectItem>
                    <SelectItem value="스포츠">스포츠</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select value={selectedStatus || "all"} onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액티비티 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={activity.image_url || 'https://picsum.photos/800/600'}
                  alt={activity.title_en}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{activity.title_en}</CardTitle>
                    {activity.title_ko && (
                      <CardDescription className="text-sm text-gray-600">
                        {activity.title_ko}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={activity.is_active ? "default" : "secondary"}>
                    {activity.is_active ? '활성' : '비활성'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 기본 정보 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{activity.location || '위치 미정'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(activity.duration_minutes)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{activity.min_participants}~{activity.max_participants}명</span>
                  </div>
                </div>

                <Separator />

                {/* 시간 슬롯 정보 */}
                {activity.activity_slots && activity.activity_slots.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>시간 슬롯</span>
                    </div>
                    <div className="space-y-1">
                      {activity.activity_slots.map((slot, index) => (
                        <div key={slot.id || index} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                          <span className="text-gray-600">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time || calculateEndTime(slot.start_time, slot.duration_minutes))}
                          </span>
                          <span className="text-gray-500">
                            최대 {slot.max_capacity}명
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* 가격 및 액션 */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    ${activity.price_usd}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/activities/${activity.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 결과 없음 */}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400">검색어나 필터를 변경해보세요.</p>
          </div>
        )}
        </div>
      </div>
    </AdminOrAgencyManager>
  );
}

// Helper function to calculate end time
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
