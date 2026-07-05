'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { JobList } from '@/features/jobs/components/JobList';
import { useFavoritesStore } from '@/features/jobs/hooks/useFavorites';
import { HiOutlineHeart } from 'react-icons/hi2';

export default function FavoritesPage() {
  const { favoriteJobs, favoriteIds, loading, fetchFavorites, toggleFavorite } =
    useFavoritesStore();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Yêu thích</h1>
        <p className="mt-1 text-sm text-slate-500">
          Danh sách các việc làm bạn đã lưu
        </p>
      </div>

      {favoriteJobs.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <HiOutlineHeart className="h-10 w-10 text-slate-400" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">
            Chưa có việc làm yêu thích
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Hãy duyệt danh sách việc làm và lưu những vị trí bạn quan tâm
          </p>
          <Link
            href="/jobs"
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
          >
            Tìm việc làm
          </Link>
        </div>
      ) : (
        <JobList
          jobs={favoriteJobs}
          loading={loading}
          favoriteIds={favoriteIds}
          onToggleFavorite={toggleFavorite}
          variant="list"
          emptyMessage="Chưa có việc làm yêu thích"
        />
      )}
    </div>
  );
}
