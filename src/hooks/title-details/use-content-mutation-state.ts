"use client";

import type {
  ContentMediaType,
  ContentMutation,
  ContentMutationStatus,
  ContentProgressMutation,
} from "@/store/api/content-types";
import { useMutateContentDetailsMutation } from "@/store/api/content-details-api";

export function useContentMutationState(
  mediaType: ContentMediaType,
  id?: number,
) {
  const [, mutation] = useMutateContentDetailsMutation({
    fixedCacheKey: `content-${mediaType}-${id ?? "none"}`,
  });
  const args = mutation.originalArgs;
  const mutationStatus: ContentMutationStatus = mutation.isLoading
    ? "loading"
    : mutation.isError
      ? "failed"
      : mutation.isSuccess
        ? "success"
        : "idle";

  return {
    mutationStatus,
    lastMutation: args?.mutation as ContentMutation | undefined,
    pendingValue: mutation.isLoading ? args?.value : undefined,
    pendingProgress: mutation.isLoading
      ? (args?.progress as ContentProgressMutation | undefined)
      : undefined,
  };
}
