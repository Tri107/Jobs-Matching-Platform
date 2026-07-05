/**
 * Mock data for CV Analysis results
 */

export interface CVAnalysisResult {
  matchScore: number;
  matchLabel: string;
  targetPosition: string;
  skillScore: number;
  structureScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestedSkills: { name: string; icon?: string }[];
  aiAdvice: string;
  expertTip: string;
}

export const mockCVAnalysis: CVAnalysisResult = {
  matchScore: 85,
  matchLabel: 'EXCELLENT',
  targetPosition: 'Senior Frontend Developer',
  skillScore: 92,
  structureScore: 78,
  strengths: [
    'Thành thạo React/Next.js với 5 năm kinh nghiệm thực tế.',
    'Có kiến thức sâu về tối ưu hóa hiệu năng ứng dụng.',
    'Portfolio dự án thực tế phong phú và trực quan.',
  ],
  weaknesses: [
    'Thiếu chứng chỉ Cloud chuyên nghiệp (AWS/Azure).',
    'Kinh nghiệm quản lý đội ngũ chưa được thể hiện rõ.',
    'Trình độ tiếng Anh giao tiếp cần được cung cấp thêm.',
  ],
  suggestedSkills: [
    { name: 'Cloud Computing (AWS)' },
    { name: 'English (IELTS 6.5+)' },
    { name: 'Docker & Kubernetes' },
    { name: 'Unit Testing (Jest/Cypress)' },
  ],
  aiAdvice:
    'Ngành Tech đang ưu tiên các ứng viên có tư duy Product. Bạn nên thêm vào CV các chỉ số đo lường hiệu quả (ví dụ: "Tối ưu tốc độ tải trang lên 40%" thay vì chỉ ghi "Tối ưu web"). Đặc biệt, hãy nhấn mạnh kỹ năng xử lý State Management phức tạp.',
  expertTip:
    'Sử dụng từ khóa "System Design" để lọt qua vòng quét ATS của các công ty lớn.',
};
