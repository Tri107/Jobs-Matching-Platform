'use client';

import { create } from 'zustand';
import type { Job } from '@/types/job';
import * as jobApi from '@/features/jobs/services/jobApi';

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

interface FavoritesStore {
  // State
  favoriteIds: Set<string>;
  favoriteJobs: Job[];
  loading: boolean;

  // Actions
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (job: Job) => Promise<void>;
  isFavorite: (jobId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: new Set<string>(),
  favoriteJobs: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true });
    try {
      const favorites = await jobApi.getFavoriteJobs();
      set({
        favoriteJobs: favorites,
        favoriteIds: new Set(favorites.map((j) => j.id)),
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  toggleFavorite: async (job: Job) => {
    const { favoriteIds } = get();
    const isSaved = favoriteIds.has(job.id);

    const newIds = new Set(favoriteIds);
    if (isSaved) {
      const result = await jobApi.removeSavedJob(job.id);
      if (result.requiresAuth) {
        redirectToLogin();
        return;
      }
      if (!result.success) {
        return;
      }

      newIds.delete(job.id);
      set((state) => ({
        favoriteIds: newIds,
        favoriteJobs: state.favoriteJobs.filter((j) => j.id !== job.id),
      }));
    } else {
      const result = await jobApi.saveJob(job.id);
      if (result.requiresAuth) {
        redirectToLogin();
        return;
      }
      if (!result.success) {
        return;
      }

      newIds.add(job.id);
      set((state) => ({
        favoriteIds: newIds,
        favoriteJobs: [...state.favoriteJobs, { ...job, saved: true }],
      }));
    }
  },

  isFavorite: (jobId: string) => {
    return get().favoriteIds.has(jobId);
  },
}));
