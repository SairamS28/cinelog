"use client";

import { useCallback, useState } from "react";
import type { LibraryBrowseQuery, LibraryMediaType } from "@/lib/types";
import {
  loadMoreLibrary,
  loadMoreLibraryGroup,
  useGetLibraryViewQuery,
} from "@/store/api/library-api";
import { useAppDispatch } from "@/store";

export function useLibraryList(
  mediaType: LibraryMediaType,
  query: LibraryBrowseQuery,
  enabled: boolean,
) {
  const dispatch = useAppDispatch();
  const [loadingMore, setLoadingMore] = useState(false);
  const result = useGetLibraryViewQuery(
    { mediaType, query },
    { skip: !enabled, refetchOnMountOrArgChange: 30 },
  );
  const placeholder =
    result.data?.mediaType === mediaType ? result.data : undefined;
  const data = result.currentData ?? placeholder;

  const loadMore = useCallback(async () => {
    if (!data || data.groupBy !== null || !data.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await loadMoreLibrary(dispatch, mediaType, query, data.items.length);
    } finally {
      setLoadingMore(false);
    }
  }, [data, dispatch, loadingMore, mediaType, query]);

  const loadMoreGroup = useCallback(
    async (groupKey: string) => {
      const page = data?.groupPages[groupKey];
      if (!data || !page?.hasMore || page.loadingMore) return;
      try {
        await loadMoreLibraryGroup(
          dispatch,
          mediaType,
          query,
          groupKey,
          page.items.length,
        );
      } catch {
        // The page loader is cleared inside loadMoreLibraryGroup.
      }
    },
    [data, dispatch, mediaType, query],
  );

  return {
    data,
    isLoading: enabled && !data && (result.isLoading || result.isFetching),
    isError: result.isError,
    loadingMore,
    loadMore,
    loadMoreGroup,
  };
}
