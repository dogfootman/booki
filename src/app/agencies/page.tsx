'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { agenciesApi } from '@/features/agencies/api';
import { activityStaffApi } from '@/features/activity-staff/api';
import { Agency } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Edit,
  Trash2,
  Building,
  Users
} from 'lucide-react';
import { AdminOrAgencyManager } from '@/components/auth/RoleGuard';

export default function AgenciesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [agencyAgentCounts, setAgencyAgentCounts] = useState<Record<string, number>>({});

  // 에이전시 목록 로드
  useEffect(() => {
    loadAgencies();
  }, [searchTerm, filterActive]);

  const loadAgencies = async () => {
    try {
      setIsLoading(true);
      const response = await agenciesApi.getAgencies({
        search: searchTerm || undefined,
        is_active: filterActive,
      });
      
      if (response.success && response.data) {
        console.log('Loaded agencies:', response.data);
        setAgencies(response.data);
        // 각 에이전시의 에이전트 수를 가져옴
        loadAgencyAgentCounts(response.data);
      } else {
        throw new Error(response.error || '에이전시 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to load agencies:', error);
      toast({
        title: '에러',
        description: error instanceof Error ? error.message : '에이전시 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgencyAgentCounts = async (agencyList: Agency[]) => {
    try {
      const counts: Record<string, number> = {};
      
      // 각 에이전시에 대해 에이전트 수를 가져옴
      await Promise.all(
        agencyList.map(async (agency) => {
          try {
            console.log(`Loading agents for agency ${agency.id} (${agency.name})`);
            const activityStaffsResponse = await activityStaffApi.getActivityStaffs({ agencyId: agency.id });
            console.log(`Agency ${agency.id} response:`, activityStaffsResponse);
            counts[agency.id] = activityStaffsResponse.success && activityStaffsResponse.data ? activityStaffsResponse.data.length : 0;
          } catch (error) {
            console.warn(`Failed to load agent count for agency ${agency.id}:`, error);
            counts[agency.id] = 0;
          }
        })
      );
      
      console.log('Final agency agent counts:', counts);
      setAgencyAgentCounts(counts);
    } catch (error) {
      console.error('Failed to load agency agent counts:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setFilterActive(undefined);
    } else if (value === 'active') {
      setFilterActive(true);
    } else {
      setFilterActive(false);
    }
  };

  const handleDeleteAgency = async (agencyId: string, agencyName: string) => {
    try {
      console.log(`Attempting to delete agency ${agencyId} (${agencyName})`);
      console.log(`Current agent count from state: ${agencyAgentCounts[agencyId]}`);
      
      // 상태에서 에이전트 수를 먼저 확인
      const stateAgentCount = agencyAgentCounts[agencyId] || 0;
      if (stateAgentCount > 0) {
        alert(`⚠️ 삭제 불가능\n\n"${agencyName}" 에이전시에는 ${stateAgentCount}명의 에이전트가 등록되어 있습니다.\n\n에이전시를 삭제하려면 먼저 모든 에이전트를 다른 에이전시로 이동하거나 삭제해야 합니다.\n\n에이전트 관리 페이지로 이동하시겠습니까?`);
        
        if (confirm('에이전트 관리 페이지로 이동하시겠습니까?')) {
          router.push('/agents');
        }
        return;
      }
      
      // 실시간으로 다시 한 번 확인
      const activityStaffsResponse = await activityStaffApi.getActivityStaffs({ agencyId });
      console.log(`Delete check - agents response:`, activityStaffsResponse);
      
      if (activityStaffsResponse.success && activityStaffsResponse.data && activityStaffsResponse.data.length > 0) {
        const agentCount = activityStaffsResponse.data.length;
        const agentNames = activityStaffsResponse.data.map(agent => agent.name).join(', ');
        
        const shouldProceed = confirm(
          `⚠️ 삭제 불가능\n\n"${agencyName}" 에이전시에는 ${agentCount}명의 에이전트가 등록되어 있습니다:\n${agentNames}\n\n에이전시를 삭제하려면 먼저 모든 에이전트를 다른 에이전시로 이동하거나 삭제해야 합니다.\n\n에이전트 관리 페이지로 이동하시겠습니까?`
        );
        
        if (shouldProceed) {
          router.push('/agents');
        }
        return;
      }

      // 연결된 에이전트가 없으면 삭제 확인
      if (!confirm(`정말로 "${agencyName}" 에이전시를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
      }

      const response = await agenciesApi.deleteAgency(agencyId);
      
      if (response.success) {
        toast({
          title: '성공',
          description: '에이전시가 성공적으로 삭제되었습니다.',
        });
        loadAgencies(); // 목록 새로고침
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
              <h1 className="text-3xl font-bold text-gray-900">에이전시 관리</h1>
              <p className="text-gray-600 mt-2">
                여행사 및 투어 회사 정보를 관리하세요
              </p>
            </div>
            <Button 
              onClick={() => router.push('/agencies/new')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg"
            >
              <Building className="w-5 h-5 mr-2" />
              새 에이전시 등록
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
                  placeholder="에이전시 이름 또는 설명으로 검색..."
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
                value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
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
                <p className="text-blue-700 text-sm">새로운 에이전시를 등록하거나 관리 작업을 수행하세요</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/agencies/new')}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  에이전시 등록
                </Button>
                <Button 
                  onClick={() => router.push('/agencies/new')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Building className="w-4 h-4 mr-2" />
                  새로 등록
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 에이전시 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : agencies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 에이전시가 없습니다</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterActive !== undefined ? '검색 조건에 맞는 에이전시가 없습니다.' : '첫 번째 에이전시를 등록해보세요.'}
              </p>
              {!searchTerm && filterActive === undefined && (
                <Button 
                  onClick={() => router.push('/agencies/new')}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Building className="w-4 h-4 mr-2" />
                  첫 번째 에이전시 등록하기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {agencies.map((agency) => (
                <Card key={agency.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={agency.logo_url} alt={agency.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(agency.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{agency.name}</CardTitle>
                          {agency.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {agency.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={agency.is_active ? 'default' : 'secondary'}>
                        {agency.is_active ? '활성' : '비활성'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {agency.description && (
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {agency.description}
                      </CardDescription>
                    )}

                    {agency.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {agency.phone}
                      </div>
                    )}

                    {agency.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{agency.address}</span>
                      </div>
                    )}

                    {agency.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-3 h-3" />
                        <a 
                          href={agency.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline line-clamp-1"
                        >
                          {agency.website}
                        </a>
                      </div>
                    )}

                    {/* 에이전트 수 표시 */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600">
                        소속 에이전트: 
                        <span className={`font-medium ml-1 ${agencyAgentCounts[agency.id] > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {agencyAgentCounts[agency.id] || 0}명
                        </span>
                      </span>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/agencies/${agency.id}/edit`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAgency(agency.id, agency.name)}
                        disabled={agencyAgentCounts[agency.id] > 0}
                        className={
                          agencyAgentCounts[agency.id] > 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                        }
                        title={
                          agencyAgentCounts[agency.id] > 0
                            ? `${agencyAgentCounts[agency.id]}명의 에이전트가 소속되어 있어 삭제할 수 없습니다`
                            : "에이전시 삭제 (주의: 소속 에이전트가 있으면 삭제되지 않습니다)"
                        }
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {agencyAgentCounts[agency.id] > 0 ? (
                          <>
                            삭제 불가
                            <span className="ml-1 text-xs">
                              ({agencyAgentCounts[agency.id]}명)
                            </span>
                          </>
                        ) : (
                          "삭제"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 하단 추가 생성 버튼 */}
            <div className="mt-8 text-center">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">더 많은 에이전시가 필요하신가요?</h3>
                <p className="text-gray-600 mb-4">새로운 여행사나 투어 회사를 추가로 등록하세요</p>
                <Button 
                  onClick={() => router.push('/agencies/new')}
                  size="lg"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Building className="w-4 h-4 mr-2" />
                  추가 에이전시 등록
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminOrAgencyManager>
  );
}
