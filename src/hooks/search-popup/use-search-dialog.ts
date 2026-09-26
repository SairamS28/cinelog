"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchShortcut } from "@/hooks/search-popup/use-search-shortcut";
import type { SearchMediaType } from "@/components/search-popup/search-controls";
import { apiErrorMessage } from "@/store/api/base-api";
import {
  useSearchQuery,
  type SearchArgs,
  type SearchStatus,
} from "@/store/api/search-api";

export function useSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<SearchMediaType>("movie");
  const [year, setYear] = useState<number>();
  const [language, setLanguage] = useState<string>();
  const [page, setPage] = useState(1);
  const [request, setRequest] = useState<SearchArgs | null>(null);

  const result = useSearchQuery(request ?? { mediaType, query: "", page: 1 }, {
    skip: request === null,
  });

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setYear(undefined);
      setLanguage(undefined);
      setPage(1);
      setRequest(null);
    }
  }, []);

  const handleMediaTypeChange = useCallback((nextType: SearchMediaType) => {
    setMediaType(nextType);
    setPage(1);
  }, []);

  const handleQueryChange = useCallback((nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  }, []);

  const handleYearChange = useCallback((nextYear?: number) => {
    setYear(nextYear);
    setPage(1);
  }, []);

  const handleLanguageChange = useCallback((nextLanguage?: string) => {
    setLanguage(nextLanguage);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      const normalizedQuery = query.trim();
      if (!normalizedQuery) return;
      setRequest({
        mediaType,
        query: normalizedQuery,
        year,
        language,
        page: nextPage,
      });
    },
    [language, mediaType, query, year],
  );

  useSearchShortcut(
    useCallback(() => handleOpenChange(!open), [handleOpenChange, open]),
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedQuery = query.trim();
      setRequest(
        normalizedQuery
          ? { mediaType, query: normalizedQuery, year, language, page: 1 }
          : null,
      );
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [language, mediaType, query, year]);

  const status: SearchStatus = request
    ? result.isError
      ? "failed"
      : result.isFetching
        ? "loading"
        : result.isSuccess
          ? "success"
          : "idle"
    : "idle";

  const searchState = {
    query: request?.query ?? "",
    results: status === "loading" ? [] : (result.currentData?.results ?? []),
    total_pages: result.currentData?.total_pages ?? 0,
    page: result.currentData?.page ?? page,
    status,
    error: result.isError
      ? apiErrorMessage(result.error, "Search request failed")
      : undefined,
  };

  const showPagination =
    searchState.total_pages > 1 &&
    (searchState.status === "success" || searchState.status === "loading");

  const requestSearch = useCallback(
    (nextPage: number, nextQuery = query.trim()) => {
      if (!nextQuery) return;
      setPage(nextPage);
      setRequest({
        mediaType,
        query: nextQuery,
        year,
        language,
        page: nextPage,
      });
    },
    [language, mediaType, query, year],
  );

  return {
    open,
    query,
    mediaType,
    year,
    language,
    page,
    searchState,
    showPagination,
    requestSearch,
    handleOpenChange,
    handleMediaTypeChange,
    handleQueryChange,
    handleYearChange,
    handleLanguageChange,
    handlePageChange,
  };
}
