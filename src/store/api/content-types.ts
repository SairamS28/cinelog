import type { MovieDetails, SeriesDetails } from "@/lib/types";

export type ContentMediaType = "movie" | "series";
export type ContentDetailsData = MovieDetails | SeriesDetails;
export type ContentMutationStatus = "idle" | "loading" | "success" | "failed";

export type ContentMutation =
  | "add-watchlist"
  | "remove-watchlist"
  | "update-impression"
  | "update-watch-status"
  | "update-progress";

export type ContentProgressMutation = {
  seasonNumber: number;
  episodeNumber: number;
};

export type ContentLibraryFields = {
  is_present_in_watchlist?: boolean;
  watch_status?: number | null;
  impression?: number | null;
  total_number_of_episodes_watched?: number;
  total_number_of_seasons_watched?: number;
  seasons?: Array<{
    season_number: number;
    episode_count?: number;
    episodes_watched: number;
  }>;
};

export type ContentMutationArg = {
  id: string;
  mediaType: ContentMediaType;
  mutation: ContentMutation;
  value?: number | null;
  progress?: ContentProgressMutation;
};
