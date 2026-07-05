import Link from 'next/link';

export function CvAnalysisErrorState() {
  return (
    <div className="rounded-2xl border border-red-100 bg-white px-6 py-14 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        Không thể hiển thị kết quả phân tích
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
        Kết quả phân tích không hợp lệ hoặc đã hết phiên lưu tạm thời. Vui lòng thực hiện phân tích lại.
      </p>
      <div className="mt-6">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Quay lại trang việc làm
        </Link>
      </div>
    </div>
  );
}
