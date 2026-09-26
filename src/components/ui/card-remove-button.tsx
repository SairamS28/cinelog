"use client";

import { BookmarkOff, Loader2 } from "lucide-react";
import { TRIGGER_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CardRemoveButtonProps = {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

export function CardRemoveButton({
  disabled = false,
  loading = false,
  onClick,
}: CardRemoveButtonProps) {
  return (
    <button
      aria-label="Remove from library"
      className={cn(TRIGGER_CLASS, "shrink-0 text-secondary")}
      disabled={disabled || loading}
      onClick={onClick}
      title="Remove from library"
      type="button"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-brand-primary" />
      ) : (
        <BookmarkOff className="h-4 w-4" />
      )}
    </button>
  );
}
