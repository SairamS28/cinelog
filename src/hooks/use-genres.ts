"use client";

import { useGetGenresQuery, type GenreOption } from "@/store/api/reference-api";

export type { GenreOption };

export function useGenres() {
  const result = useGetGenresQuery();
  return {
    genres: result.data ?? [],
    loading: result.isLoading,
  };
}
