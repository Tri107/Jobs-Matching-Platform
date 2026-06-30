export function CvAnalysisLoading() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <p className="mt-4 text-sm font-semibold text-slate-700">
        Đang tải kết quả phân tích...
      </p>
    </div>
  );
}
