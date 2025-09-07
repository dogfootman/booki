'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, Search, Filter, Building2, Activity as ActivityIcon, CalendarX, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { agencyUnavailableSchedulesApi } from '@/features/agency-unavailable-schedules/api';
import { agenciesApi } from '@/features/agencies/api';
import { activitiesApi } from '@/features/activities/api';
import { activityStaffApi } from '@/features/activity-staff/api';
import { AgencyUnavailableSchedule, Agency, Activity, ActivityStaff } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ScheduleFormData {
  agency_id: string;
  date: string;
  reason: string;
  is_active: boolean;
}

export default function AgencySchedulesPage() {
  const [schedules, setSchedules] = useState<AgencyUnavailableSchedule[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityStaffs, setActivityStaffs] = useState<ActivityStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isAgentFormOpen, setIsAgentFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AgencyUnavailableSchedule | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedActivityStaff, setSelectedActivityStaff] = useState<ActivityStaff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState<'agency' | 'activity' | 'activityStaff'>('agency');
  const { toast } = useToast();

  const [formData, setFormData] = useState<ScheduleFormData>({
    agency_id: '',
    date: '',
    reason: '',
    is_active: true
  });

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, agenciesRes, activitiesRes, activityStaffsRes] = await Promise.all([
        agencyUnavailableSchedulesApi.getSchedules(),
        agenciesApi.getAgencies(),
        activitiesApi.getActivities(),
        activityStaffApi.getActivityStaffs()
      ]);

      if (schedulesRes.success && schedulesRes.data) {
        setSchedules(schedulesRes.data);
      }

      if (agenciesRes.success && agenciesRes.data) {
        setAgencies(agenciesRes.data);
      }

      if (activitiesRes.success && activitiesRes.data) {
        setActivities(activitiesRes.data);
      }

      if (activityStaffsRes.success && activityStaffsRes.data) {
        setActivityStaffs(activityStaffsRes.data);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '데이터를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 에이전시 이름 가져오기
  const getAgencyName = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency?.name || '알 수 없는 에이전시';
  };

  // 필터링된 스케줄 목록
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getAgencyName(schedule.agency_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgency = !selectedAgency || schedule.agency_id === selectedAgency;
    const matchesActive = activeFilter === 'all' || 
                         (activeFilter === 'active' && schedule.is_active) ||
                         (activeFilter === 'inactive' && !schedule.is_active);

    return matchesSearch && matchesAgency && matchesActive;
  });

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      agency_id: '',
      date: '',
      reason: '',
      is_active: true
    });
    setEditingSchedule(null);
  };

  // 스케줄 저장
  const handleSave = async () => {
    try {
      if (!formData.agency_id || !formData.date) {
        toast({
          title: '오류',
          description: '에이전시와 날짜를 입력해주세요.',
          variant: 'destructive',
        });
        return;
      }

      if (editingSchedule) {
        // 수정
        const response = await agencyUnavailableSchedulesApi.updateSchedule(editingSchedule.id, {
          date: formData.date,
          reason: formData.reason,
          is_active: formData.is_active
        });

        if (response.success) {
          toast({
            title: '성공',
            description: '스케줄이 수정되었습니다.',
          });
          await loadData();
          setIsFormOpen(false);
          resetForm();
        } else {
          throw new Error(response.error || '수정 실패');
        }
      } else {
        // 생성
        const response = await agencyUnavailableSchedulesApi.createSchedule(formData);

        if (response.success) {
          toast({
            title: '성공',
            description: '새로운 불가 스케줄이 생성되었습니다.',
          });
          await loadData();
          setIsFormOpen(false);
          resetForm();
        } else {
          throw new Error(response.error || '생성 실패');
        }
      }
    } catch (error) {
      console.error('저장 실패:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 스케줄 삭제
  const handleDelete = async (schedule: AgencyUnavailableSchedule) => {
    if (!confirm('정말 이 스케줄을 삭제하시겠습니까?')) return;

    try {
      const response = await agencyUnavailableSchedulesApi.deleteSchedule(schedule.id);

      if (response.success) {
        toast({
          title: '성공',
          description: '스케줄이 삭제되었습니다.',
        });
        await loadData();
      } else {
        throw new Error(response.error || '삭제 실패');
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      toast({
        title: '오류',
        description: '삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 편집 모드로 설정
  const handleEdit = (schedule: AgencyUnavailableSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      agency_id: schedule.agency_id,
      date: schedule.date,
      reason: schedule.reason || '',
      is_active: schedule.is_active
    });
    setIsFormOpen(true);
  };

  // 새로 만들기
  const handleCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // 액티비티 예약불가 날짜 관리
  const handleAddActivityUnavailableDate = async (activityId: string, date: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/unavailable-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // 즉시 activities 배열 업데이트
        const updatedActivities = activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, unavailable_dates: result.data.unavailable_dates }
            : activity
        );
        setActivities(updatedActivities);
        
        // selectedActivity도 즉시 업데이트
        if (selectedActivity && selectedActivity.id === activityId) {
          setSelectedActivity({
            ...selectedActivity,
            unavailable_dates: result.data.unavailable_dates
          });
        }
        
        toast({
          title: '성공',
          description: '액티비티 예약불가 날짜가 추가되었습니다.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '추가 실패');
      }
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '예약불가 날짜 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveActivityUnavailableDate = async (activityId: string, date: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/unavailable-dates`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // 즉시 activities 배열 업데이트
        const updatedActivities = activities.map(activity => 
          activity.id === activityId 
            ? { ...activity, unavailable_dates: result.data.unavailable_dates }
            : activity
        );
        setActivities(updatedActivities);
        
        // selectedActivity도 즉시 업데이트
        if (selectedActivity && selectedActivity.id === activityId) {
          setSelectedActivity({
            ...selectedActivity,
            unavailable_dates: result.data.unavailable_dates
          });
        }
        
        toast({
          title: '성공',
          description: '액티비티 예약불가 날짜가 제거되었습니다.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '제거 실패');
      }
    } catch (error) {
      console.error('날짜 제거 오류:', error);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '예약불가 날짜 제거 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarX className="mr-3 h-8 w-8" />
            예약 불가 스케줄 관리
          </h1>
          <p className="text-gray-600 mt-1">
            에이전시 및 액티비티별 예약 불가 날짜를 관리합니다
          </p>
        </div>
        
        <div className="flex gap-2">
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button onClick={handleCreate} className="flex items-center" disabled={currentTab !== 'agency'}>
                <Plus className="h-4 w-4 mr-2" />
                새 에이전시 불가 스케줄
              </Button>
            </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingSchedule ? '불가 스케줄 수정' : '새 불가 스케줄 생성'}
              </SheetTitle>
              <SheetDescription>
                에이전시의 예약 불가 날짜를 설정합니다.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 mt-6">
              {/* 에이전시 선택 */}
              <div>
                <label className="block text-sm font-medium mb-2">에이전시</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.agency_id}
                  onChange={(e) => setFormData({ ...formData, agency_id: e.target.value })}
                  disabled={!!editingSchedule}
                >
                  <option value="">에이전시를 선택하세요</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 날짜 */}
              <div>
                <label className="block text-sm font-medium mb-2">날짜</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* 사유 */}
              <div>
                <label className="block text-sm font-medium mb-2">사유</label>
                <Input
                  type="text"
                  placeholder="불가 사유를 입력하세요"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              {/* 활성 상태 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  활성 상태
                </label>
              </div>

              {/* 버튼들 */}
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingSchedule ? '수정' : '생성'}
                </Button>
                <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                  취소
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Sheet open={isActivityFormOpen} onOpenChange={setIsActivityFormOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              onClick={() => setIsActivityFormOpen(true)} 
              className="flex items-center"
              disabled={currentTab !== 'activity'}
            >
              <Plus className="h-4 w-4 mr-2" />
              액티비티 예약불가 날짜 관리
            </Button>
          </SheetTrigger>

          <SheetContent className="w-[600px] sm:w-[700px]">
            <SheetHeader>
              <SheetTitle>액티비티 예약불가 날짜 관리</SheetTitle>
              <SheetDescription>
                액티비티별로 예약을 받지 않을 날짜를 설정합니다.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* 액티비티 선택 */}
              <div>
                <label className="block text-sm font-medium mb-2">액티비티 선택</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={selectedActivity?.id || ''}
                  onChange={(e) => {
                    const activity = activities.find(a => a.id === e.target.value);
                    setSelectedActivity(activity || null);
                  }}
                >
                  <option value="">액티비티를 선택하세요</option>
                  {activities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title_ko || activity.title_en}
                    </option>
                  ))}
                </select>
              </div>

              {selectedActivity && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-lg mb-4">현재 예약불가 날짜</h3>
                    
                    {selectedActivity.unavailable_dates && selectedActivity.unavailable_dates.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {selectedActivity.unavailable_dates.map((date) => (
                          <div key={date} className="flex items-center justify-between p-2 border rounded bg-red-50 border-red-200">
                            <span className="text-red-700 font-medium">{date}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveActivityUnavailableDate(selectedActivity.id, date)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 mb-4">등록된 예약불가 날짜가 없습니다.</p>
                    )}

                    <div className="flex gap-2">
                      <Input
                        type="date"
                        placeholder="새 예약불가 날짜"
                        id="new-activity-date"
                        className="flex-1"
                      />
                      <Button
                        onClick={async () => {
                          const input = document.getElementById('new-activity-date') as HTMLInputElement;
                          if (!input?.value) {
                            toast({
                              title: '오류',
                              description: '날짜를 선택해주세요.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          
                          if (!selectedActivity) {
                            toast({
                              title: '오류',
                              description: '액티비티를 선택해주세요.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          
                          // 중복 체크 - 최신 activities 배열에서 확인
                          const currentActivity = activities.find(a => a.id === selectedActivity.id);
                          if (currentActivity?.unavailable_dates?.includes(input.value)) {
                            toast({
                              title: '오류',
                              description: '이미 등록된 날짜입니다.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          
                          await handleAddActivityUnavailableDate(selectedActivity.id, input.value);
                          input.value = '';
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        추가
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentTab('agency')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'agency'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="inline h-4 w-4 mr-2" />
              에이전시 불가 스케줄
            </button>
            <button
              onClick={() => setCurrentTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ActivityIcon className="inline h-4 w-4 mr-2" />
              액티비티 불가 날짜
            </button>
            <button
              onClick={() => setCurrentTab('activityStaff')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === 'activityStaff'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              에이전트 불가 날짜
            </button>
          </nav>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="사유 또는 에이전시 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 에이전시 필터 */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
            >
              <option value="">모든 에이전시</option>
              {agencies.map(agency => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>

            {/* 활성 상태 필터 */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>

            {/* 결과 개수 */}
            <div className="flex items-center text-sm text-gray-600">
              총 {filteredSchedules.length}개 스케줄
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 콘텐츠 */}
      {currentTab === 'agency' ? (
        /* 에이전시 스케줄 목록 */
        <div className="grid gap-4">
          {filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">표시할 스케줄이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSchedules.map(schedule => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {getAgencyName(schedule.agency_id)}
                        </h3>
                        <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                          {schedule.is_active ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">{schedule.date}</span>
                        </div>
                        {schedule.reason && (
                          <div>
                            <span className="font-medium">사유:</span> {schedule.reason}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">생성일:</span> {new Date(schedule.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(schedule)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* 액티비티 예약불가 날짜 목록 */
        <div className="grid gap-4">
          {activities.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ActivityIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">등록된 액티비티가 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            activities.map(activity => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {activity.title_ko || activity.title_en}
                        </h3>
                        <Badge variant={activity.is_active ? 'default' : 'secondary'}>
                          {activity.is_active ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarX className="h-4 w-4 mr-2" />
                          <span className="font-medium">
                            예약불가 날짜: {activity.unavailable_dates?.length || 0}개
                          </span>
                        </div>
                        {activity.unavailable_dates && activity.unavailable_dates.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {activity.unavailable_dates.slice(0, 3).map((date) => (
                              <Badge key={date} variant="outline" className="text-xs">
                                {date}
                              </Badge>
                            ))}
                            {activity.unavailable_dates.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{activity.unavailable_dates.length - 3}개 더
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setIsActivityFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        관리
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 에이전트 불가 날짜 탭 */}
      {currentTab === 'activityStaff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">에이전트 불가 날짜</h2>
              <p className="text-gray-600">에이전트별 예약 불가 날짜를 관리합니다</p>
            </div>
          </div>

          {/* 에이전트 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activityStaffs.map((activityStaff) => (
              <Card key={activityStaff.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{activityStaff.name}</CardTitle>
                    <Badge variant={activityStaff.is_active ? 'secondary' : 'outline'}>
                      {activityStaff.is_active ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  <CardDescription>{activityStaff.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>불가 날짜:</strong> {activityStaff.unavailable_dates?.length || 0}개
                    </div>
                    {activityStaff.unavailable_dates && activityStaff.unavailable_dates.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {activityStaff.unavailable_dates.slice(0, 3).join(', ')}
                        {activityStaff.unavailable_dates.length > 3 && ` 외 ${activityStaff.unavailable_dates.length - 3}일`}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedActivityStaff(activityStaff);
                        setIsAgentFormOpen(true);
                      }}
                      className="w-full"
                    >
                      <CalendarX className="h-4 w-4 mr-2" />
                      관리
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 에이전트 불가 날짜 관리 Sheet */}
          <Sheet open={isAgentFormOpen} onOpenChange={setIsAgentFormOpen}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>에이전트 예약불가 날짜 관리</SheetTitle>
                <SheetDescription>
                  {selectedActivityStaff ? `${selectedActivityStaff.name} 에이전트의 예약불가 날짜를 관리합니다` : '에이전트를 선택해주세요'}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* 에이전트 선택 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">에이전트 선택</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedActivityStaff?.id || ''}
                    onChange={(e) => {
                      const activityStaff = activityStaffs.find(a => a.id === e.target.value);
                      setSelectedActivityStaff(activityStaff || null);
                    }}
                  >
                    <option value="">에이전트를 선택하세요</option>
                    {activityStaffs.map(activityStaff => (
                      <option key={activityStaff.id} value={activityStaff.id}>
                        {activityStaff.name} ({activityStaff.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 현재 불가 날짜 목록 */}
                {selectedActivityStaff && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">현재 예약불가 날짜</label>
                    {selectedActivityStaff.unavailable_dates && selectedActivityStaff.unavailable_dates.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedActivityStaff.unavailable_dates.map((date) => (
                          <div key={date} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{date}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAgentUnavailableDate(selectedActivityStaff.id, date)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">등록된 예약불가 날짜가 없습니다.</p>
                    )}
                  </div>
                )}

                {/* 새 날짜 추가 */}
                {selectedActivityStaff && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">새 예약불가 날짜 추가</label>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        id="new-activityStaff-date"
                        className="flex-1"
                      />
                      <Button
                        onClick={async () => {
                          const input = document.getElementById('new-activityStaff-date') as HTMLInputElement;
                          if (!input?.value) {
                            toast({ title: '오류', description: '날짜를 선택해주세요.', variant: 'destructive' });
                            return;
                          }

                          if (!selectedActivityStaff) {
                            toast({ title: '오류', description: '에이전트를 선택해주세요.', variant: 'destructive' });
                            return;
                          }

                          // 중복 체크 - 최신 activityStaffs 배열에서 확인
                          const currentAgent = activityStaffs.find(a => a.id === selectedActivityStaff.id);
                          if (currentAgent?.unavailable_dates?.includes(input.value)) {
                            toast({ title: '오류', description: '이미 등록된 날짜입니다.', variant: 'destructive' });
                            return;
                          }

                          await handleAddAgentUnavailableDate(selectedActivityStaff.id, input.value);
                          input.value = '';
                        }}
                      >
                        추가
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );

  // 에이전트 불가 날짜 추가
  async function handleAddAgentUnavailableDate(activityStaffId: string, date: string) {
    try {
      const response = await fetch(`/api/activityStaffs/${activityStaffId}/unavailable-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });

      if (response.ok) {
        const result = await response.json();

        // 즉시 activityStaffs 배열 업데이트
        const updatedActivityStaffs = activityStaffs.map(activityStaff =>
          activityStaff.id === activityStaffId
            ? { ...activityStaff, unavailable_dates: result.data.unavailable_dates }
            : activityStaff
        );
        setActivityStaffs(updatedActivityStaffs);

        // selectedActivityStaff도 즉시 업데이트
        if (selectedActivityStaff && selectedActivityStaff.id === activityStaffId) {
          setSelectedActivityStaff({
            ...selectedActivityStaff,
            unavailable_dates: result.data.unavailable_dates
          });
        }

        toast({
          title: '성공',
          description: '에이전트 예약불가 날짜가 추가되었습니다.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '추가 실패');
      }
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '예약불가 날짜 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }

  // 에이전트 불가 날짜 제거
  async function handleRemoveAgentUnavailableDate(activityStaffId: string, date: string) {
    try {
      const response = await fetch(`/api/activityStaffs/${activityStaffId}/unavailable-dates`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });

      if (response.ok) {
        const result = await response.json();

        // 즉시 activityStaffs 배열 업데이트
        const updatedActivityStaffs = activityStaffs.map(activityStaff =>
          activityStaff.id === activityStaffId
            ? { ...activityStaff, unavailable_dates: result.data.unavailable_dates }
            : activityStaff
        );
        setActivityStaffs(updatedActivityStaffs);

        // selectedActivityStaff도 즉시 업데이트
        if (selectedActivityStaff && selectedActivityStaff.id === activityStaffId) {
          setSelectedActivityStaff({
            ...selectedActivityStaff,
            unavailable_dates: result.data.unavailable_dates
          });
        }

        toast({
          title: '성공',
          description: '에이전트 예약불가 날짜가 제거되었습니다.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '제거 실패');
      }
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '예약불가 날짜 제거 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }
}
