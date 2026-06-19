/**
 * Application constants
 */

// TODO: Replace with AWS API Gateway endpoint
export const API_BASE_URL = 'https://api.example.com';

export const DEMO_USER_ID = 'demo-user-1';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  HOME_LIMIT: 12,
} as const;

export const EXPERIENCE_OPTIONS = [
  { label: 'Dưới 1 năm', value: 'under-1' },
  { label: '1 - 3 năm', value: '1-3' },
  { label: '3 - 5 năm', value: '3-5' },
  { label: 'Trên 5 năm', value: '5+' },
] as const;

export const WORK_TYPE_OPTIONS = [
  { label: 'Toàn thời gian', value: 'Fulltime' },
  { label: 'Bán thời gian', value: 'Part-time' },
  { label: 'Remote / Từ xa', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
] as const;

export const SKILL_OPTIONS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Java',
  'Angular', 'Vue.js', 'Next.js', 'MongoDB', 'AWS',
  'Docker', 'Figma', 'UI/UX', 'Go', 'Kubernetes',
] as const;

export const LOCATION_OPTIONS = [
  'Tất cả địa điểm',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bắc Ninh',
  'Cần Thơ',
  'Hải Phòng',
  'Quảng Ninh',
  'Hưng Yên',
  'Ninh Bình',
  'Khánh Hòa',
] as const;

export const SALARY_RANGES = [
  { label: 'Tất cả mức lương', min: 0, max: Infinity },
  { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
  { label: '30 - 50 triệu', min: 30000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: Infinity },
] as const;
