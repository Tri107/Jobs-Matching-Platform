import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NOVA - AI Match Platform | Tìm việc làm, Tuyển dụng hiệu quả",
  description:
    "Hệ thống AI phân tích hồ sơ và đề xuất cơ hội khớp nhất với bạn dựa trên kỹ năng và kinh nghiệm thực tế.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
