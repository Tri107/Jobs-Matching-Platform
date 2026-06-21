/**
 * Mock user data
 * TODO: Replace with AWS Cognito integration
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'candidate' | 'employer';
}

export interface MockCV {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'processed' | 'analyzing';
  isPrimary: boolean;
}

export const mockCurrentUser: MockUser = {
  id: 'demo-user-1',
  name: 'Nguyễn Văn A',
  email: 'nguyen.vana@aimatch.com',
  phone: '090 123 4567',
  avatar: '',
  role: 'candidate',
};

export const mockUserCVs: MockCV[] = [
  {
    id: 'cv-1',
    fileName: 'CV_UX_Designer_2024.pdf',
    fileSize: '1.2 MB',
    uploadedAt: '2 ngày trước',
    status: 'processed',
    isPrimary: true,
  },
  {
    id: 'cv-2',
    fileName: 'CV_Product_Manager_Lead.pdf',
    fileSize: '850 KB',
    uploadedAt: '1 tháng trước',
    status: 'processed',
    isPrimary: false,
  },
  {
    id: 'cv-3',
    fileName: 'CV_Senior_Designer_Final.pdf',
    fileSize: '920 KB',
    uploadedAt: 'vừa xong',
    status: 'analyzing',
    isPrimary: false,
  },
];
