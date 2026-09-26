import { baseApi } from "@/store/api/base-api";

export type SearchMediaType = "movie" | "series";
export type SearchStatus = "idle" | "loading" | "success" | "failed";

export type SearchResult = {
  genres: string[];
  id?: number;
  is_present_in_watchlist?: boolean;
  watch_status?: number | null;
  original_language?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  title?: string;
  vote_average?: number;
};

export type SearchArgs = {
  mediaType: SearchMediaType;
  query: string;
  year?: number;
  language?: string;
  page: number;
};

export type SearchPayload = {
  results: SearchResult[];
  page: number;
  total_pages: number;
};

export const searchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    search: build.query<SearchPayload, SearchArgs>({
      query: ({ mediaType, query, year, language, page }) => {
        const params = new URLSearchParams({
          query,
          page: String(page),
        });
        if (year !== undefined) params.set("year", String(year));
        if (language) params.set("language", language);
        return { url: `/api/search/${mediaType}?${params.toString()}` };
      },
    }),
  }),
});

export const { useSearchQuery, useLazySearchQuery } = searchApi;
