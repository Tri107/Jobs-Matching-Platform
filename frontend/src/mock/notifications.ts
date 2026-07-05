/**
 * Mock notifications data
 * TODO: Replace with AWS API Gateway endpoint GET /notifications
 */

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'match' | 'job' | 'system';
}

export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    title: 'Kết quả đánh giá mới',
    message: 'CV của bạn phù hợp 92% với vị trí Senior Frontend Developer tại Techcombank.',
    read: false,
    createdAt: '2026-06-18T10:30:00',
    type: 'match',
  },
  {
    id: 'notif-2',
    title: 'Việc làm mới phù hợp',
    message: '5 việc làm mới phù hợp với hồ sơ của bạn đã được cập nhật.',
    read: false,
    createdAt: '2026-06-17T14:00:00',
    type: 'job',
  },
  {
    id: 'notif-3',
    title: 'Cập nhật hệ thống',
    message: 'Tính năng Đánh giá AI đã được nâng cấp với độ chính xác cao hơn.',
    read: true,
    createdAt: '2026-06-16T09:00:00',
    type: 'system',
  },
];
