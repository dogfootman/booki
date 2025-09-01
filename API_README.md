# 하와이 액티비티 매니저 API 문서

## 개요
이 API는 하와이 액티비티 여행사를 위한 에이전트 및 액티비티 관리 시스템을 제공합니다.

## 기본 정보
- **Base URL**: `/api`
- **인증**: Supabase Row Level Security (RLS) 사용
- **데이터 형식**: JSON
- **에러 응답**: 모든 에러는 `success: false`와 `error` 메시지를 포함

## 에이전트 API

### 에이전트 목록 조회
```
GET /api/agents
```

**쿼리 파라미터:**
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10)
- `is_active` (optional): 활성 상태 필터 (true/false)
- `search` (optional): 이름 또는 이메일로 검색

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "avatar_url": "https://example.com/avatar.jpg",
      "bio": "Experienced tour guide",
      "languages": ["English", "Korean"],
      "specialties": ["Hiking", "Snorkeling"],
      "hourly_rate": 25.00,
      "max_hours_per_day": 8,
      "is_active": true,
      "created_at": "2025-08-30T05:56:09.807Z",
      "updated_at": "2025-08-30T05:56:09.807Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 에이전트 상세 조회
```
GET /api/agents/{id}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    // ... 기타 필드
  }
}
```

### 에이전트 생성
```
POST /api/agents
```

**요청 본문:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1-555-0124",
  "bio": "Certified diving instructor",
  "languages": ["English", "Japanese"],
  "specialties": ["Scuba Diving", "Swimming"],
  "hourly_rate": 30.00,
  "max_hours_per_day": 6
}
```

**필수 필드:**
- `name`: 에이전트 이름 (1-255자)
- `email`: 이메일 주소 (고유해야 함)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    // ... 생성된 에이전트 정보
  }
}
```

### 에이전트 수정
```
PUT /api/agents/{id}
```

**요청 본문:** (수정할 필드만 포함)
```json
{
  "hourly_rate": 35.00,
  "is_active": false
}
```

### 에이전트 삭제
```
DELETE /api/agents/{id}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

## 액티비티 API

### 액티비티 목록 조회
```
GET /api/activities
```

**쿼리 파라미터:**
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10)
- `category` (optional): 카테고리 필터
- `is_active` (optional): 활성 상태 필터 (true/false)
- `min_price` (optional): 최소 가격 (USD)
- `max_price` (optional): 최대 가격 (USD)
- `search` (optional): 제목 또는 설명으로 검색 (한국어/영어)

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title_en": "Sunset Beach Walk",
      "title_ko": "일몰 해변 산책",
      "description_en": "Beautiful sunset walk along Waikiki Beach",
      "description_ko": "와이키키 해변을 따라가는 아름다운 일몰 산책",
      "image_url": "https://example.com/sunset-walk.jpg",
      "price_usd": 45.00,
      "duration_minutes": 90,
      "max_participants": 15,
      "min_participants": 2,
      "location": "Waikiki Beach",
      "category": "Beach Activities",
      "tags": ["sunset", "walking", "scenic"],
      "is_active": true,
      "created_at": "2025-08-30T05:56:09.807Z",
      "updated_at": "2025-08-30T05:56:09.807Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 액티비티 상세 조회
```
GET /api/activities/{id}
```

### 액티비티 생성
```
POST /api/activities
```

**요청 본문:**
```json
{
  "title_en": "Volcano Hiking Adventure",
  "title_ko": "화산 하이킹 모험",
  "description_en": "Explore the volcanic landscape of Hawaii",
  "description_ko": "하와이의 화산 지형을 탐험하세요",
  "price_usd": 120.00,
  "duration_minutes": 240,
  "max_participants": 8,
  "min_participants": 4,
  "location": "Hawaii Volcanoes National Park",
  "category": "Adventure",
  "tags": ["hiking", "volcano", "adventure"]
}
```

**필수 필드:**
- `title_en`: 영어 제목 (1-255자)
- `price_usd`: 가격 (USD, 양수)
- `duration_minutes`: 소요 시간 (분, 1-1440)
- `max_participants`: 최대 참가자 수 (양수, 1000 이하)

### 액티비티 수정
```
PUT /api/activities/{id}
```

### 액티비티 삭제
```
DELETE /api/activities/{id}
```

## 에러 처리

### 일반적인 HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청 (유효성 검사 실패)
- `404`: 리소스를 찾을 수 없음
- `409`: 충돌 (예: 중복 이메일)
- `500`: 서버 내부 오류

### 에러 응답 형식
```json
{
  "success": false,
  "error": "에러 메시지",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["price_usd"],
      "message": "Expected string, received number"
    }
  ]
}
```

## 데이터베이스 스키마

### Agents 테이블
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `phone`: VARCHAR(50)
- `avatar_url`: TEXT
- `bio`: TEXT
- `languages`: TEXT[] (배열)
- `specialties`: TEXT[] (배열)
- `hourly_rate`: DECIMAL(10,2)
- `max_hours_per_day`: INTEGER DEFAULT 8
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### Activities 테이블
- `id`: UUID (Primary Key)
- `title_en`: VARCHAR(255) NOT NULL
- `title_ko`: VARCHAR(255)
- `description_en`: TEXT
- `description_ko`: TEXT
- `image_url`: TEXT
- `price_usd`: DECIMAL(10,2) NOT NULL
- `duration_minutes`: INTEGER NOT NULL
- `max_participants`: INTEGER NOT NULL
- `min_participants`: INTEGER DEFAULT 1
- `location`: VARCHAR(255)
- `category`: VARCHAR(100)
- `tags`: TEXT[] (배열)
- `is_active`: BOOLEAN DEFAULT true
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

## 보안

- Row Level Security (RLS) 활성화
- 인증된 사용자만 생성/수정/삭제 가능
- 모든 사용자가 조회 가능
- 입력 데이터 유효성 검사 (Zod 스키마)
- SQL 인젝션 방지 (Supabase 클라이언트 사용)

## 사용 예시

### JavaScript/TypeScript
```typescript
import { agentsApi, activitiesApi } from '@/features';

// 에이전트 목록 조회
const agents = await agentsApi.getAgents({ page: 1, limit: 20 });

// 새 액티비티 생성
const newActivity = await activitiesApi.createActivity({
  title_en: "Snorkeling Adventure",
  price_usd: 75.00,
  duration_minutes: 120,
  max_participants: 12
});
```

### cURL
```bash
# 에이전트 목록 조회
curl -X GET "http://localhost:3000/api/agents?page=1&limit=10"

# 새 에이전트 생성
curl -X POST "http://localhost:3000/api/agents" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```
