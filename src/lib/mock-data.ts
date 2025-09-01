import { Agent, Activity, Booking, Agency } from '@/types';
import { BookingStatus } from '@/types/booking';

// Mock agents data
export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@hawaii-tours.com',
    phone: '+1-808-555-0101',
    avatar_url: 'https://picsum.photos/200/200?random=1',
    bio: 'Experienced tour guide with 5+ years in Hawaii tourism. Speaks English and Korean fluently.',
    languages: ['English', 'Korean'],
    specialties: ['Hiking', 'Snorkeling', 'Cultural Tours'],
    hourly_rate: 25.00,
    max_hours_per_day: 8,
    is_active: true,
    agency_id: 'agency-001', // 소속 에이전시 ID 추가
    created_at: '2025-08-30T05:00:00.000Z',
    updated_at: '2025-08-30T05:00:00.000Z',
  },
  {
    id: '2',
    name: 'Sarah Kim',
    email: 'sarah@hawaii-tours.com',
    phone: '+1-808-555-0102',
    avatar_url: 'https://picsum.photos/200/200?random=2',
    bio: 'Certified diving instructor specializing in underwater adventures. Bilingual in English and Japanese.',
    languages: ['English', 'Japanese'],
    specialties: ['Scuba Diving', 'Swimming', 'Marine Life'],
    hourly_rate: 30.00,
    max_hours_per_day: 6,
    is_active: true,
    agency_id: 'agency-002', // 소속 에이전시 ID 추가
    created_at: '2025-08-30T06:00:00.000Z',
    updated_at: '2025-08-30T06:00:00.000Z',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@hawaii-tours.com',
    phone: '+1-808-555-0103',
    avatar_url: 'https://picsum.photos/200/200?random=3',
    bio: 'Adventure specialist with expertise in volcano hiking and extreme sports.',
    languages: ['English'],
    specialties: ['Volcano Hiking', 'Rock Climbing', 'Adventure Sports'],
    hourly_rate: 35.00,
    max_hours_per_day: 8,
    is_active: true,
    agency_id: 'agency-003', // 소속 에이전시 ID 추가
    created_at: '2025-08-30T07:00:00.000Z',
    updated_at: '2025-08-30T07:00:00.000Z',
  },
];

// Mock activities data
export const mockActivities: Activity[] = [
  {
    id: '1',
    title_en: 'Sunset Beach Walk',
    title_ko: '일몰 해변 산책',
    description_en: 'Beautiful sunset walk along Waikiki Beach with local history and culture insights.',
    description_ko: '와이키키 해변을 따라가는 아름다운 일몰 산책과 현지 역사 및 문화 체험',
    image_url: 'https://picsum.photos/400/300?random=4',
    price_usd: 45.00,
    duration_minutes: 90,
    max_participants: 15,
    min_participants: 2,
    location: 'Waikiki Beach',
    category: 'Beach Activities',
    tags: ['sunset', 'walking', 'scenic', 'cultural'],
    activity_slots: [
      { id: '1-1', start_time: '17:00', duration_minutes: 90, max_capacity: 15, is_available: true },
      { id: '1-2', start_time: '18:00', duration_minutes: 90, max_capacity: 15, is_available: true },
    ],
    daily_schedules: [
      {
        day_of_week: 0, // Sunday
        time_slots: [
          { id: '1-1', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 8 },
          { id: '1-2', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 5 },
        ]
      },
      {
        day_of_week: 1, // Monday
        time_slots: [
          { id: '1-3', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 3 },
          { id: '1-4', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 12 },
        ]
      },
      {
        day_of_week: 2, // Tuesday
        time_slots: [
          { id: '1-5', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 7 },
          { id: '1-6', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 9 },
        ]
      },
      {
        day_of_week: 3, // Wednesday
        time_slots: [
          { id: '1-7', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 4 },
          { id: '1-8', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 6 },
        ]
      },
      {
        day_of_week: 4, // Thursday
        time_slots: [
          { id: '1-9', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 11 },
          { id: '1-10', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 2 },
        ]
      },
      {
        day_of_week: 5, // Friday
        time_slots: [
          { id: '1-11', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 14 },
          { id: '1-12', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 8 },
        ]
      },
      {
        day_of_week: 6, // Saturday
        time_slots: [
          { id: '1-13', start_time: '17:00', end_time: '18:30', is_available: true, max_capacity: 15, current_bookings: 15 },
          { id: '1-14', start_time: '18:00', end_time: '19:30', is_available: true, max_capacity: 15, current_bookings: 13 },
        ]
      },
    ],
    is_active: true,
    created_at: '2025-08-30T08:00:00.000Z',
    updated_at: '2025-08-30T08:00:00.000Z',
  },
  {
    id: '2',
    title_en: 'Volcano Hiking Adventure',
    title_ko: '화산 하이킹 모험',
    description_en: 'Explore the volcanic landscape of Hawaii Volcanoes National Park with expert guides.',
    description_ko: '전문 가이드와 함께하는 하와이 화산 국립공원의 화산 지형 탐험',
    image_url: 'https://picsum.photos/400/300?random=5',
    price_usd: 120.00,
    duration_minutes: 240,
    max_participants: 8,
    min_participants: 4,
    location: 'Hawaii Volcanoes National Park',
    category: 'Adventure',
    tags: ['hiking', 'volcano', 'adventure', 'nature'],
    activity_slots: [
      { id: '2-1', start_time: '08:00', duration_minutes: 240, max_capacity: 8, is_available: true },
      { id: '2-2', start_time: '09:00', duration_minutes: 240, max_capacity: 8, is_available: true },
    ],
    daily_schedules: [
      {
        day_of_week: 0, // Sunday
        time_slots: [
          { id: '2-1', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 2 },
        ]
      },
      {
        day_of_week: 1, // Monday
        time_slots: [
          { id: '2-2', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 3 },
        ]
      },
      {
        day_of_week: 2, // Tuesday
        time_slots: [
          { id: '2-3', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 1 },
        ]
      },
      {
        day_of_week: 3, // Wednesday
        time_slots: [
          { id: '2-4', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 5 },
        ]
      },
      {
        day_of_week: 4, // Thursday
        time_slots: [
          { id: '2-5', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 4 },
        ]
      },
      {
        day_of_week: 5, // Friday
        time_slots: [
          { id: '2-6', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 2 },
        ]
      },
      {
        day_of_week: 6, // Saturday
        time_slots: [
          { id: '2-7', start_time: '08:00', end_time: '12:00', is_available: true, max_capacity: 8, current_bookings: 6 },
        ]
      },
    ],
    is_active: true,
    created_at: '2025-08-30T09:00:00.000Z',
    updated_at: '2025-08-30T09:00:00.000Z',
  },
  {
    id: '3',
    title_en: 'Snorkeling Paradise',
    title_ko: '스노클링 천국',
    description_en: 'Discover vibrant coral reefs and tropical fish in crystal clear Hawaiian waters.',
    description_ko: '맑은 하와이 바다에서 화려한 산호초와 열대어를 발견하세요',
    image_url: 'https://picsum.photos/400/300?random=6',
    price_usd: 75.00,
    duration_minutes: 120,
    max_participants: 12,
    min_participants: 3,
    location: 'Hanauma Bay',
    category: 'Water Sports',
    tags: ['snorkeling', 'marine life', 'water sports', 'family-friendly'],
    activity_slots: [
      { id: '3-1', start_time: '09:00', duration_minutes: 120, max_capacity: 12, is_available: true },
      { id: '3-2', start_time: '13:00', duration_minutes: 120, max_capacity: 12, is_available: true },
    ],
    daily_schedules: [
      {
        day_of_week: 0, // Sunday
        time_slots: [
          { id: '3-1', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 4 },
          { id: '3-2', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 7 },
        ]
      },
      {
        day_of_week: 1, // Monday
        time_slots: [
          { id: '3-3', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 2 },
          { id: '3-4', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 9 },
        ]
      },
      {
        day_of_week: 2, // Tuesday
        time_slots: [
          { id: '3-5', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 6 },
          { id: '3-6', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 3 },
        ]
      },
      {
        day_of_week: 3, // Wednesday
        time_slots: [
          { id: '3-7', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 8 },
          { id: '3-8', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 5 },
        ]
      },
      {
        day_of_week: 4, // Thursday
        time_slots: [
          { id: '3-9', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 1 },
          { id: '3-10', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 11 },
        ]
      },
      {
        day_of_week: 5, // Friday
        time_slots: [
          { id: '3-11', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 10 },
          { id: '3-12', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 4 },
        ]
      },
      {
        day_of_week: 6, // Saturday
        time_slots: [
          { id: '3-13', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 12, current_bookings: 12 },
          { id: '3-14', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 12, current_bookings: 8 },
        ]
      },
    ],
    is_active: true,
    created_at: '2025-08-30T10:00:00.000Z',
    updated_at: '2025-08-30T10:00:00.000Z',
  },
  {
    id: '4',
    title_en: 'Traditional Luau Experience',
    title_ko: '전통 루아우 체험',
    description_en: 'Immerse yourself in Hawaiian culture with traditional dance, music, and authentic cuisine.',
    description_ko: '전통 춤, 음악, 진정한 하와이 요리로 하와이 문화에 몰입하세요',
    image_url: 'https://picsum.photos/400/300?random=7',
    price_usd: 95.00,
    duration_minutes: 180,
    max_participants: 50,
    min_participants: 10,
    location: 'Polynesian Cultural Center',
    category: 'Cultural',
    tags: ['culture', 'dance', 'music', 'food', 'traditional'],
    activity_slots: [
      { id: '4-1', start_time: '18:00', duration_minutes: 180, max_capacity: 50, is_available: true },
      { id: '4-2', start_time: '19:00', duration_minutes: 180, max_capacity: 50, is_available: true },
    ],
    daily_schedules: [
      {
        day_of_week: 0, // Sunday
        time_slots: [
          { id: '4-1', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 30 },
        ]
      },
      {
        day_of_week: 1, // Monday
        time_slots: [
          { id: '4-2', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 15 },
        ]
      },
      {
        day_of_week: 2, // Tuesday
        time_slots: [
          { id: '4-3', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 25 },
        ]
      },
      {
        day_of_week: 3, // Wednesday
        time_slots: [
          { id: '4-4', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 20 },
        ]
      },
      {
        day_of_week: 4, // Thursday
        time_slots: [
          { id: '4-5', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 18 },
        ]
      },
      {
        day_of_week: 5, // Friday
        time_slots: [
          { id: '4-6', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 35 },
        ]
      },
      {
        day_of_week: 6, // Saturday
        time_slots: [
          { id: '4-7', start_time: '18:00', end_time: '21:00', is_available: true, max_capacity: 50, current_bookings: 42 },
        ]
      },
    ],
    is_active: true,
    created_at: '2025-08-30T11:00:00.000Z',
    updated_at: '2025-08-30T11:00:00.000Z',
  },
  {
    id: '5',
    title_en: 'Surfing Lessons',
    title_ko: '서핑 레슨',
    description_en: 'Learn to surf with professional instructors on the beautiful beaches of Hawaii.',
    description_ko: '하와이의 아름다운 해변에서 전문 강사와 함께 서핑을 배우세요',
    image_url: 'https://picsum.photos/400/300?random=8',
    price_usd: 85.00,
    duration_minutes: 120,
    max_participants: 6,
    min_participants: 1,
    location: 'North Shore',
    category: 'Water Sports',
    tags: ['surfing', 'lessons', 'beach', 'adventure'],
    activity_slots: [
      { id: '5-1', start_time: '08:00', duration_minutes: 120, max_capacity: 6, is_available: true },
      { id: '5-2', start_time: '09:00', duration_minutes: 120, max_capacity: 6, is_available: true },
      { id: '5-3', start_time: '10:00', duration_minutes: 120, max_capacity: 6, is_available: true },
      { id: '5-4', start_time: '13:00', duration_minutes: 120, max_capacity: 6, is_available: true },
      { id: '5-5', start_time: '14:00', duration_minutes: 120, max_capacity: 6, is_available: true },
      { id: '5-6', start_time: '15:00', duration_minutes: 120, max_capacity: 6, is_available: true },
      { id: '5-7', start_time: '16:00', duration_minutes: 120, max_capacity: 6, is_available: true },
    ],
    daily_schedules: [
      {
        day_of_week: 0, // Sunday
        time_slots: [
          { id: '5-1', start_time: '08:00', end_time: '10:00', is_available: true, max_capacity: 6, current_bookings: 2 },
          { id: '5-2', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 4 },
          { id: '5-3', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 1 },
          { id: '5-4', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 3 },
          { id: '5-5', start_time: '14:00', end_time: '16:00', is_available: true, max_capacity: 6, current_bookings: 5 },
          { id: '5-6', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 2 },
          { id: '5-7', start_time: '16:00', end_time: '18:00', is_available: true, max_capacity: 6, current_bookings: 0 },
        ]
      },
      {
        day_of_week: 1, // Monday
        time_slots: [
          { id: '5-5', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 5 },
          { id: '5-6', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 2 },
          { id: '5-7', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 6 },
          { id: '5-8', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 1 },
        ]
      },
      {
        day_of_week: 2, // Tuesday
        time_slots: [
          { id: '5-9', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 3 },
          { id: '5-10', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 4 },
          { id: '5-11', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 2 },
          { id: '5-12', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 5 },
        ]
      },
      {
        day_of_week: 3, // Wednesday
        time_slots: [
          { id: '5-13', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 1 },
          { id: '5-14', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 6 },
          { id: '5-15', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 3 },
          { id: '5-16', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 4 },
        ]
      },
      {
        day_of_week: 4, // Thursday
        time_slots: [
          { id: '5-17', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 4 },
          { id: '5-18', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 2 },
          { id: '5-19', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 5 },
          { id: '5-20', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 1 },
        ]
      },
      {
        day_of_week: 5, // Friday
        time_slots: [
          { id: '5-21', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 6 },
          { id: '5-22', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 3 },
          { id: '5-23', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 1 },
          { id: '5-24', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 4 },
        ]
      },
      {
        day_of_week: 6, // Saturday
        time_slots: [
          { id: '5-25', start_time: '09:00', end_time: '11:00', is_available: true, max_capacity: 6, current_bookings: 5 },
          { id: '5-26', start_time: '10:00', end_time: '12:00', is_available: true, max_capacity: 6, current_bookings: 6 },
          { id: '5-27', start_time: '13:00', end_time: '15:00', is_available: true, max_capacity: 6, current_bookings: 2 },
          { id: '5-28', start_time: '15:00', end_time: '17:00', is_available: true, max_capacity: 6, current_bookings: 3 },
        ]
      },
    ],
    is_active: true,
    created_at: '2025-08-30T12:00:00.000Z',
    updated_at: '2025-08-30T12:00:00.000Z',
  },
  {
    id: '6',
    title_en: 'Helicopter Tour',
    title_ko: '헬리콥터 투어',
    description_en: 'Experience breathtaking aerial views of Hawaii\'s most beautiful landscapes.',
    description_ko: '하와이의 가장 아름다운 경관을 헬리콥터에서 내려다보세요',
    image_url: 'https://picsum.photos/400/300?random=9',
    price_usd: 250.00,
    duration_minutes: 60,
    max_participants: 4,
    min_participants: 2,
    location: 'Honolulu Airport',
    category: 'Adventure',
    tags: ['helicopter', 'aerial', 'scenic', 'luxury'],
    activity_slots: [
      { id: '6-1', start_time: '10:00', duration_minutes: 60, max_capacity: 4, is_available: true },
      { id: '6-2', start_time: '14:00', duration_minutes: 60, max_capacity: 4, is_available: true },
    ],
    daily_schedules: [
      {
        day_of_week: 0, // Sunday
        time_slots: [
          { id: '6-1', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 1 },
          { id: '6-2', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 2 },
        ]
      },
      {
        day_of_week: 1, // Monday
        time_slots: [
          { id: '6-3', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 3 },
          { id: '6-4', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 1 },
        ]
      },
      {
        day_of_week: 2, // Tuesday
        time_slots: [
          { id: '6-5', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 2 },
          { id: '6-6', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 4 },
        ]
      },
      {
        day_of_week: 3, // Wednesday
        time_slots: [
          { id: '6-7', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 1 },
          { id: '6-8', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 3 },
        ]
      },
      {
        day_of_week: 4, // Thursday
        time_slots: [
          { id: '6-9', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 4 },
          { id: '6-10', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 2 },
        ]
      },
      {
        day_of_week: 5, // Friday
        time_slots: [
          { id: '6-11', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 2 },
          { id: '6-12', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 1 },
        ]
      },
      {
        day_of_week: 6, // Saturday
        time_slots: [
          { id: '6-13', start_time: '10:00', end_time: '11:00', is_available: true, max_capacity: 4, current_bookings: 3 },
          { id: '6-14', start_time: '14:00', end_time: '15:00', is_available: true, max_capacity: 4, current_bookings: 4 },
        ]
      },
    ],
    is_active: true,
    created_at: '2025-08-30T13:00:00.000Z',
    updated_at: '2025-08-30T13:00:00.000Z',
  },
];

// Helper functions for mock data operations
export const mockDataUtils = {
  // Generate new ID
  generateId: () => Math.random().toString(36).substr(2, 9),
  
  // Get current timestamp
  getCurrentTimestamp: () => new Date().toISOString(),
  
  // Find agent by ID
  findAgentById: (id: string) => mockAgents.find(agent => agent.id === id),
  
  // Find activity by ID
  findActivityById: (id: string) => mockActivities.find(activity => activity.id === id),
  
  // Check if email exists
  isEmailExists: (email: string, excludeId?: string) => 
    mockAgents.some(agent => agent.email === email && agent.id !== excludeId),
};

// Mock bookings data
export const mockBookings = [
  {
    id: 'booking-001',
    activity_id: '1',
    agent_id: '1',
    customer_name: 'Alice Johnson',
    customer_email: 'alice@example.com',
    customer_phone: '+1-555-0101',
    participants: 2,
    start_time: '2025-09-01T17:00:00.000Z',
    end_time: '2025-09-01T18:30:00.000Z',
    total_price_usd: 90.00,
    status: BookingStatus.CONFIRMED,
    notes: 'First-time visitors, interested in local culture',
    created_at: '2025-08-30T10:00:00.000Z',
    updated_at: '2025-08-30T10:00:00.000Z',
  },
  {
    id: 'booking-002',
    activity_id: '2',
    agent_id: '2',
    customer_name: 'Bob Smith',
    customer_email: 'bob@example.com',
    customer_phone: '+1-555-0102',
    participants: 3,
    start_time: '2025-09-02T09:00:00.000Z',
    end_time: '2025-09-02T11:00:00.000Z',
    total_price_usd: 150.00,
    status: BookingStatus.CONFIRMED,
    notes: 'Family with children, prefer morning slots',
    created_at: '2025-08-30T11:00:00.000Z',
    updated_at: '2025-08-30T11:00:00.000Z',
  },
  {
    id: 'booking-003',
    activity_id: '3',
    agent_id: '3',
    customer_name: 'Carol Davis',
    customer_email: 'carol@example.com',
    customer_phone: '+1-555-0103',
    participants: 1,
    start_time: '2025-09-03T14:00:00.000Z',
    end_time: '2025-09-03T16:00:00.000Z',
    total_price_usd: 70.00,
    status: BookingStatus.PENDING,
    notes: 'Solo traveler, experienced hiker',
    created_at: '2025-08-30T12:00:00.000Z',
    updated_at: '2025-08-30T12:00:00.000Z',
  },
  {
    id: 'booking-004',
    activity_id: '4',
    agent_id: '1',
    customer_name: 'David Wilson',
    customer_email: 'david@example.com',
    customer_phone: '+1-555-0104',
    participants: 4,
    start_time: '2025-09-04T10:00:00.000Z',
    end_time: '2025-09-04T12:00:00.000Z',
    total_price_usd: 200.00,
    status: BookingStatus.CONFIRMED,
    notes: 'Group booking, corporate team building',
    created_at: '2025-08-30T13:00:00.000Z',
    updated_at: '2025-08-30T13:00:00.000Z',
  },
  {
    id: 'booking-005',
    activity_id: '5',
    agent_id: '2',
    customer_name: 'Eva Brown',
    customer_email: 'eva@example.com',
    customer_phone: '+1-555-0105',
    participants: 2,
    start_time: '2025-09-05T16:00:00.000Z',
    end_time: '2025-09-05T18:00:00.000Z',
    total_price_usd: 120.00,
    status: BookingStatus.CANCELLED,
    notes: 'Cancelled due to weather conditions',
    created_at: '2025-08-30T14:00:00.000Z',
    updated_at: '2025-08-30T15:00:00.000Z',
  },
];

// Mock agencies data
export const mockAgencies = [
  {
    id: 'agency-001',
    name: 'Hawaii Adventure Tours',
    description: 'Leading adventure tour company in Hawaii specializing in outdoor activities and cultural experiences.',
    address: '123 Waikiki Beach Rd, Honolulu, HI 96815',
    phone: '+1-808-555-0100',
    email: 'info@hawaii-adventure.com',
    website: 'https://hawaii-adventure.com',
    logo_url: 'https://picsum.photos/200/100?random=10',
    is_active: true,
    created_at: '2025-08-30T05:00:00.000Z',
    updated_at: '2025-08-30T05:00:00.000Z',
  },
  {
    id: 'agency-002',
    name: 'Pacific Ocean Explorers',
    description: 'Marine adventure specialists offering diving, snorkeling, and water sports experiences.',
    address: '456 Ala Moana Blvd, Honolulu, HI 96814',
    phone: '+1-808-555-0200',
    email: 'info@pacific-explorers.com',
    website: 'https://pacific-explorers.com',
    logo_url: 'https://picsum.photos/200/100?random=11',
    is_active: true,
    created_at: '2025-08-30T06:00:00.000Z',
    updated_at: '2025-08-30T06:00:00.000Z',
  },
  {
    id: 'agency-003',
    name: 'Volcano Discovery Tours',
    description: 'Expert guides for volcano hiking, geological tours, and extreme adventure sports.',
    address: '789 Kilauea Ave, Hilo, HI 96720',
    phone: '+1-808-555-0300',
    email: 'info@volcano-discovery.com',
    website: 'https://volcano-discovery.com',
    logo_url: 'https://picsum.photos/200/100?random=12',
    is_active: true,
    created_at: '2025-08-30T07:00:00.000Z',
    updated_at: '2025-08-30T07:00:00.000Z',
  },
];
