/**
 * Mock user data
 * TODO: Replace with AWS Cognito integration
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'candidate' | 'employer';
}

export const mockCurrentUser: MockUser = {
  id: 'demo-user-1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  avatar: '',
  role: 'candidate',
};
