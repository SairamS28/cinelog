"use client";

import { useEffect, useMemo, useState } from "react";
import { TMDB_POSTER_BASE_URL } from "@/lib/constants";
import type { MediaLean, TitleCandidate } from "@/lib/types";
import type { ApiError } from "@/store/api/base-api";
import { useLazySearchQuery, type SearchResult } from "@/store/api/search-api";
import {
  useAddTitleMutation,
  useGetTitleSuggestionsQuery,
} from "@/store/api/user-api";

const MEDIA_SEGMENT = { 0: "movie", 1: "series" } as const;

function candidateKey(candidate: Pick<TitleCandidate, "tmdbId" | "mediaType">) {
  return `${candidate.mediaType}-${candidate.tmdbId}`;
}

function toRawPosterPath(fullUrl: string | null): string | null {
  if (!fullUrl) return null;
  return fullUrl.startsWith(TMDB_POSTER_BASE_URL)
    ? fullUrl.slice(TMDB_POSTER_BASE_URL.length)
    : fullUrl;
}

function toCandidates(
  results: SearchResult[],
  mediaType: 0 | 1,
): TitleCandidate[] {
  return results.flatMap((result) =>
    result.id === undefined || !result.title
      ? []
      : [
          {
            tmdbId: result.id,
            mediaType,
            title: result.title,
            posterPath: toRawPosterPath(result.poster_path ?? null),
            year: result.release_date ?? null,
            rating: result.vote_average ?? null,
            inWatchlist: result.is_present_in_watchlist ?? false,
          },
        ],
  );
}

export function useTitleStep({
  genreIds,
  mediaLean,
  languages,
  minRating,
  eras,
  addedKeys,
  onAdded,
}: {
  genreIds: number[];
  mediaLean: MediaLean;
  languages?: string[];
  minRating?: number | null;
  eras?: string[];
  addedKeys?: Set<string>;
  onAdded?: (key: string) => void;
}) {
  const suggestions = useGetTitleSuggestionsQuery({
    mediaLean,
    genreIds,
    languages,
    eras,
    minRating,
  });
  const [triggerSearch] = useLazySearchQuery();
  const [addTitle] = useAddTitleMutation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TitleCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [localAdded, setLocalAdded] = useState<Set<string>>(new Set());
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const serverAdded = useMemo(() => {
    const keys = new Set<string>();
    for (const candidate of suggestions.data?.titles ?? []) {
      if (candidate.inWatchlist) keys.add(candidateKey(candidate));
    }
    return keys;
  }, [suggestions.data]);
  const added = useMemo(() => {
    const next = new Set(addedKeys ?? localAdded);
    for (const key of serverAdded) next.add(key);
    return next;
  }, [addedKeys, localAdded, serverAdded]);
  const trimmedQuery = query.trim();

  function markAdded(key: string) {
    setLocalAdded((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    onAdded?.(key);
  }

  useEffect(() => {
    const keys = (suggestions.data?.titles ?? []).flatMap((candidate) =>
      candidate.inWatchlist ? [candidateKey(candidate)] : [],
    );
    if (keys.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      for (const key of keys) onAdded?.(key);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [onAdded, suggestions.data]);

  useEffect(() => {
    let ignore = false;
    const timeoutId = window.setTimeout(async () => {
      if (trimmedQuery.length === 0) {
        if (!ignore) {
          setResults([]);
          setIsSearching(false);
        }
        return;
      }
      if (!ignore) setIsSearching(true);
      const wantMovies = mediaLean === 0 || mediaLean === 2;
      const wantSeries = mediaLean === 1 || mediaLean === 2;
      const [movies, series] = await Promise.all([
        wantMovies
          ? triggerSearch({ mediaType: "movie", query: trimmedQuery, page: 1 })
              .unwrap()
              .then((data) => toCandidates(data.results, 0))
              .catch(() => [])
          : Promise.resolve([]),
        wantSeries
          ? triggerSearch({ mediaType: "series", query: trimmedQuery, page: 1 })
              .unwrap()
              .then((data) => toCandidates(data.results, 1))
              .catch(() => [])
          : Promise.resolve([]),
      ]);
      if (!ignore) {
        setResults([...movies, ...series]);
        for (const candidate of [...movies, ...series]) {
          if (candidate.inWatchlist) markAdded(candidateKey(candidate));
        }
        setIsSearching(false);
      }
    }, 500);
    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmedQuery, mediaLean, triggerSearch]);

  async function handleAdd(candidate: TitleCandidate) {
    const key = candidateKey(candidate);
    if (added.has(key) || pendingKeys.has(key)) return;

    setErrorKey(null);
    setPendingKeys((prev) => new Set(prev).add(key));
    try {
      await addTitle({
        mediaType: MEDIA_SEGMENT[candidate.mediaType],
        tmdbId: candidate.tmdbId,
      }).unwrap();
      markAdded(key);
    } catch (error) {
      const status = (error as ApiError | undefined)?.status;
      if (status === 409) markAdded(key);
      else setErrorKey(key);
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  return {
    query,
    setQuery,
    trimmedQuery,
    suggestions: suggestions.data?.titles ?? [],
    isLoadingSuggestions: suggestions.isLoading,
    results,
    isSearching,
    added,
    pendingKeys,
    errorKey,
    handleAdd,
    candidateKey,
  };
}
