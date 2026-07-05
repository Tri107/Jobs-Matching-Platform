import Link from 'next/link';

const footerColumns = [
  {
    title: 'Về NOVA',
    links: [
      { label: 'Giới thiệu', href: '#' },
      { label: 'Tuyển dụng', href: '#' },
      { label: 'Liên hệ', href: '#' },
      { label: 'Blog công nghệ', href: '#' },
    ],
  },
  {
    title: 'Dành cho Ứng viên',
    links: [
      { label: 'Tìm việc làm', href: '/jobs' },
      { label: 'Tải lên CV', href: '/upload-cv' },
      { label: 'Phân tích CV AI', href: '/cv-analysis' },
      { label: 'Hồ sơ cá nhân', href: '/profile' },
    ],
  },
  {
    title: 'Nhà tuyển dụng',
    links: [
      { label: 'Đăng tin tuyển dụng', href: '#' },
      { label: 'Tìm kiếm ứng viên', href: '#' },
      { label: 'Giải pháp nhân sự', href: '#' },
      { label: 'Quản lý hồ sơ', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-black text-white">▲</span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">NOVA</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Nền tảng tuyển dụng thông minh hàng đầu với công nghệ AI giúp kết
              nối ứng viên và nhà tuyển dụng một cách chính xác nhất.
            </p>
          </div>

          {/* Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-slate-900">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-blue-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row lg:px-6">
          <p>© 2024 AI Match Platform. Nền tảng tuyển dụng thông minh.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-slate-600">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="hover:text-slate-600">
              Điều khoản sử dụng
            </Link>
            <Link href="#" className="hover:text-slate-600">
              Hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
