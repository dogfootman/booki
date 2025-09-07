'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { activityStaffApi } from '@/features/activity-staff/api';
import { ActivityStaff } from '@/types/activity-staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Users, Mail, Phone, Clock, DollarSign, UserPlus, Edit, Trash2 } from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

export default function ActivityStaffPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activityStaffs, setActivityStaffs] = useState<ActivityStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // 액티비티 스태프 목록 로드
  useEffect(() => {
    loadActivityStaffs();
  }, [searchTerm, filterActive]);

  const loadActivityStaffs = async () => {
    try {
      setIsLoading(true);
      const response = await activityStaffApi.getActivityStaffs({
        search: searchTerm || undefined,
        is_active: filterActive,
      });
      
      if (response.success && response.data) {
        setActivityStaffs(response.data);
      } else {
        throw new Error(response.error || '액티비티 스태프 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to load activity staffs:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '액티비티 스태프 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setFilterActive(null);
    } else if (value === 'active') {
      setFilterActive(true);
    } else {
      setFilterActive(false);
    }
  };

  const handleDeleteActivityStaff = async (activityStaffId: string, activityStaffName: string) => {
    if (!confirm(`정말로 "${activityStaffName}" 액티비티 스태프를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await activityStaffApi.deleteActivityStaff(activityStaffId);
      
      if (response.success) {
        toast({
          title: '성공',
          description: '액티비티 스태프가 성공적으로 삭제되었습니다.',
        });
        loadActivityStaffs(); // 목록 새로고침
      } else {
        throw new Error(response.error || '액티비티 스태프 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete activity staff:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '액티비티 스태프 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminOrAgencyManager>
      <div className="container mx-auto py-8 px-4">
        {/* 헤더 */}
        <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">액티비티 스태프 관리</h1>
            <p className="text-gray-600 mt-2">
              투어 가이드 및 스태프 정보를 관리하세요
            </p>
          </div>
          <Button 
            onClick={() => router.push('/activity-staff/new')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            새 스태프 등록
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="스태프 이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <Label htmlFor="filter" className="sr-only">상태 필터</Label>
            <select
              id="filter"
              value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">빠른 액션</h3>
              <p className="text-blue-700 text-sm">새로운 액티비티 스태프를 등록하거나 관리 작업을 수행하세요</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/activity-staff/new')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                스태프 등록
              </Button>
              <Button 
                onClick={() => router.push('/activity-staff/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                새로 등록
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 액티비티 스태프 목록 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : activityStaffs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 액티비티 스태프가 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterActive !== null ? '검색 조건에 맞는 스태프가 없습니다.' : '첫 번째 액티비티 스태프를 등록해보세요.'}
            </p>
            {!searchTerm && filterActive === null && (
              <Button 
                onClick={() => router.push('/activity-staff/new')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                첫 번째 스태프 등록하기
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activityStaffs.map((activityStaff) => (
              <Card key={activityStaff.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={activityStaff.avatar_url} alt={activityStaff.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(activityStaff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{activityStaff.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {activityStaff.email}
                        </div>
                      </div>
                    </div>
                    <Badge variant={activityStaff.is_active ? 'default' : 'secondary'}>
                      {activityStaff.is_active ? '활성' : '비활성'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {activityStaff.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {activityStaff.phone}
                    </div>
                  )}
                  
                  {activityStaff.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {activityStaff.bio}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {activityStaff.hourly_rate && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {activityStaff.hourly_rate}/hr
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activityStaff.max_hours_per_day}h/day
                    </div>
                  </div>
                  
                  {activityStaff.languages.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-500">언어</Label>
                      <div className="flex flex-wrap gap-1">
                        {activityStaff.languages.map((language) => (
                          <Badge key={language} variant="outline" className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activityStaff.specialties.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-500">전문 분야</Label>
                      <div className="flex flex-wrap gap-1">
                        {activityStaff.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/activity-staff/${activityStaff.id}/edit`)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteActivityStaff(activityStaff.id, activityStaff.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 하단 추가 생성 버튼 */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">더 많은 스태프가 필요하신가요?</h3>
              <p className="text-gray-600 mb-4">새로운 투어 가이드나 스태프를 추가로 등록하세요</p>
              <Button 
                onClick={() => router.push('/activity-staff/new')}
                size="lg"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                추가 스태프 등록
              </Button>
            </div>
          </div>
        </>
      )}
      </div>
    </AdminOrAgencyManager>
  );
}
