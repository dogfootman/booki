# Role-Based UI System Implementation

## 개요
하와이 액티비티 여행사 운영 플랫폼의 역할별 사용자 인터페이스 시스템입니다.

## 구현된 기능

### 1. 사용자 역할 시스템
- **ADMIN**: 시스템 관리자 - 전체 시스템 관리 및 모니터링
- **AGENCY_MANAGER**: 에이전시 매니저 - 에이전시 운영 및 에이전트 관리
- **AGENT**: 에이전트 - 고객 상담 및 액티비티 가이드

### 2. 인증 및 권한 관리
- Zustand 기반 상태 관리
- 역할별 접근 제어 (RoleGuard 컴포넌트)
- 더미 데이터 기반 사용자 전환

### 3. 역할별 대시보드
- **관리자 대시보드**: 전체 시스템 통계, 에이전시/에이전트/액티비티 관리
- **에이전시 매니저 대시보드**: 소속 에이전시 통계, 에이전트/액티비티 관리
- **에이전트 대시보드**: 개인 스케줄, 근무시간, 수입 정보

### 4. 역할별 네비게이션
- 사용자 역할에 따른 동적 메뉴 구성
- 권한이 없는 페이지 접근 시 자동 리다이렉트

## 사용 방법

### 1. 데모 시작
```
1. /login 페이지 접속
2. "데모 사용자로 시작하기" 섹션에서 원하는 역할 선택
3. 자동으로 해당 역할의 대시보드로 이동
```

### 2. 역할 전환
```
1. /test 페이지에서 "역할 전환" 버튼 클릭
2. 원하는 역할 선택
3. 네비게이션과 대시보드가 자동으로 업데이트
```

### 3. 데모 계정 정보
- **관리자**: admin@bookie.com / password
- **에이전시 매니저**: sarah@hawaii-tours.com / password
- **에이전트**: mike@hawaii-tours.com / password

## 기술적 구현

### 1. 상태 관리
```typescript
// src/lib/stores/auth-store.ts
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      // ... actions
    }),
    { name: 'bookie-auth-storage' }
  )
);
```

### 2. 역할별 접근 제어
```typescript
// src/components/auth/RoleGuard.tsx
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/dashboard',
}) => {
  // 권한 검증 로직
};

// 편의 컴포넌트
export const AdminOnly = ({ children }) => (
  <RoleGuard allowedRoles={[UserRole.ADMIN]}>{children}</RoleGuard>
);
```

### 3. 역할별 네비게이션
```typescript
// src/components/navigation/Navigation.tsx
const getNavigationItems = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return [/* 관리자 전용 메뉴 */];
    case UserRole.AGENCY_MANAGER:
      return [/* 에이전시 매니저 전용 메뉴 */];
    case UserRole.AGENT:
      return [/* 에이전트 전용 메뉴 */];
  }
};
```

## 파일 구조

```
src/
├── types/
│   └── user.ts              # 사용자 및 역할 타입 정의
├── lib/
│   └── stores/
│       └── auth-store.ts    # 인증 상태 관리
├── components/
│   ├── auth/
│   │   └── RoleGuard.tsx    # 역할별 접근 제어
│   └── navigation/
│       └── Navigation.tsx   # 역할별 네비게이션
└── app/
    ├── login/
    │   └── page.tsx         # 로그인 및 역할 선택
    ├── dashboard/
    │   └── page.tsx         # 역할별 대시보드
    ├── agents/
    │   └── page.tsx         # 에이전트 관리 (권한 제어)
    └── activities/
        └── page.tsx         # 액티비티 관리 (권한 제어)
```

## 주요 특징

### 1. 보안
- 클라이언트 사이드 권한 검증
- 역할별 페이지 접근 제어
- 인증되지 않은 사용자 자동 리다이렉트

### 2. 사용자 경험
- 직관적인 역할 선택 인터페이스
- 역할별 맞춤형 대시보드
- 일관된 네비게이션 구조

### 3. 확장성
- 새로운 역할 쉽게 추가 가능
- 권한 시스템 모듈화
- 재사용 가능한 컴포넌트 구조

## 향후 개선 사항

1. **서버 사이드 권한 검증**: API 레벨에서 권한 검증 강화
2. **실시간 권한 업데이트**: 사용자 권한 변경 시 실시간 반영
3. **세분화된 권한**: 역할 내 세부 권한 설정
4. **감사 로그**: 권한 관련 활동 기록
5. **다중 인증**: 2FA, SSO 등 보안 강화

## 테스트 방법

1. **기본 기능 테스트**
   - 각 역할로 로그인하여 대시보드 확인
   - 권한이 없는 페이지 접근 시도
   - 역할 전환 기능 테스트

2. **네비게이션 테스트**
   - 역할별 메뉴 항목 확인
   - 권한에 따른 메뉴 숨김/표시 확인

3. **접근 제어 테스트**
   - RoleGuard 컴포넌트 동작 확인
   - 권한 없는 사용자의 페이지 접근 차단 확인
