import Link from 'next/link';

export function CvAnalysisEmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Chưa có kết quả phân tích</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
        Để phân tích CV, hãy mở một công việc và chọn &quot;Đánh giá CV theo công việc&quot;.
      </p>
      <div className="mt-6">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          Đi đến trang việc làm
        </Link>
      </div>
    </div>
  );
}
