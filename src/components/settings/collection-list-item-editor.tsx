"use client";

import { FilterClauseRow } from "@/components/settings/filter-clause-row";
import { SearchFilterSelect } from "@/components/search-popup/search-filter-select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Tooltip } from "@/components/ui/tooltip";
import { LIBRARY_GROUP_OPTIONS, MAX_COLLECTION_FILTERS } from "@/lib/constants";
import { useCollectionEditor } from "@/hooks/settings/use-collection-editor";
import type {
  CollectionFilterItem,
  CollectionSortItem,
  SmartCollectionWithFilters,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Info, Loader2, Plus } from "lucide-react";

type CollectionListItemEditorProps = {
  collection?: SmartCollectionWithFilters;
  onCancel: () => void;
  onSave: (payload: {
    name: string;
    mediaType: number;
    showInLibrary: boolean;
    showInDashboard: boolean;
    groupBy: number | null;
    filters: CollectionFilterItem[];
    sorts: CollectionSortItem[];
    editingId?: number;
  }) => Promise<boolean>;
};

const MEDIA_TYPE_OPTIONS = [
  { value: "0", label: "Movies" },
  { value: "1", label: "Series" },
];

const GROUPING_RESTRICTION_HINT =
  "Collections displayed on the dashboard cannot be grouped. Disable 'Show in dashboard' to enable grouping.";

export function CollectionListItemEditor({
  collection,
  onCancel,
  onSave,
}: CollectionListItemEditorProps) {
  const {
    isEditing,
    name,
    setName,
    mediaType,
    showInLibrary,
    setShowInLibrary,
    showInDashboard,
    groupBy,
    setGroupBy,
    filters,
    sort,
    isSubmitting,
    error,
    groupTooltipOpen,
    triggerGroupTooltip,
    handleGroupTooltipChange,
    mediaTypeKey,
    sortOptions,
    groupDisabled,
    dashboardDisabled,
    canAddFilter,
    updateFilter,
    addFilter,
    removeFilter,
    changeMediaType,
    changeSort,
    toggleShowInDashboard,
    handleSubmit,
  } = useCollectionEditor(collection, onCancel, onSave);

  return (
    <div className="space-y-4 border-t border-outline-alt/60 pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField id="collection-name" label="Name">
          <Input
            className="border-outline-alt text-on-surface"
            id="collection-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Collection name"
            value={name}
          />
        </FormField>
        <FormField id="collection-media-type" label="Media type">
          <SearchFilterSelect
            aria-label="Media type"
            heading="Media type"
            menuMinWidth={220}
            onChange={changeMediaType}
            options={MEDIA_TYPE_OPTIONS}
            placeholder="Media type"
            triggerClassName="min-w-full"
            value={String(mediaType)}
          />
        </FormField>
      </div>

      <FormField
        id="collection-filters"
        label="Filters"
        labelSuffix={
          <span className="rounded border border-outline-alt/60 bg-surface-container px-1.5 py-0.5 font-mono text-[11px] font-medium text-secondary">
            {filters.length}/{MAX_COLLECTION_FILTERS}
          </span>
        }
      >
        <div className="space-y-2">
          {filters.length === 0 ? (
            <p className="font-public-sans text-xs text-secondary">
              No filters — all items of this media type are included.
            </p>
          ) : (
            filters.map((filter, index) => (
              <div className="space-y-2" key={index}>
                {index > 0 ? (
                  <span className="inline-block font-mono text-[10px] font-bold tracking-wider text-outline-muted uppercase">
                    AND
                  </span>
                ) : null}
                <FilterClauseRow
                  clause={filter}
                  mediaType={mediaTypeKey}
                  onRemove={() => removeFilter(index)}
                  onUpdate={(field, value) => updateFilter(index, field, value)}
                />
              </div>
            ))
          )}
          {canAddFilter ? (
            <Button
              className="h-8 gap-1.5 px-2.5 text-xs"
              onClick={addFilter}
              type="button"
              variant="darkFilled"
            >
              <Plus className="h-3.5 w-3.5" />
              Add filter
            </Button>
          ) : null}
        </div>
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField id="collection-sort" label="Sort">
          <SearchFilterSelect
            aria-label="Sort collection"
            heading="Sort"
            menuMinWidth={220}
            onChange={changeSort}
            options={sortOptions.map((option) => ({
              value: `${option.field}:${option.direction}`,
              label: option.label,
            }))}
            placeholder="Sort"
            triggerClassName="min-w-full"
            value={`${sort.field}:${sort.direction}`}
          />
        </FormField>
        <FormField
          id="collection-group"
          label="Group"
          labelSuffix={
            <Tooltip
              align="responsive"
              content={GROUPING_RESTRICTION_HINT}
              contentClassName="w-64 sm:w-72"
              isOpen={groupTooltipOpen}
              onOpenChange={handleGroupTooltipChange}
              side="top"
            >
              <button
                aria-label="Grouping restriction info"
                className="inline-flex size-4 cursor-pointer items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                onClick={(event) => {
                  event.preventDefault();
                  triggerGroupTooltip();
                }}
                type="button"
              >
                <Info className="size-3.5" />
              </button>
            </Tooltip>
          }
        >
          <div
            className={cn("w-full", groupDisabled && "cursor-not-allowed")}
            onClick={() => {
              if (groupDisabled) {
                triggerGroupTooltip();
              }
            }}
          >
            <SearchFilterSelect
              aria-label="Group collection"
              disabled={groupDisabled}
              heading="Group"
              menuMinWidth={220}
              onChange={(value) =>
                setGroupBy(value === "" ? null : Number(value))
              }
              options={LIBRARY_GROUP_OPTIONS}
              placeholder="None"
              triggerClassName="min-w-full"
              value={groupBy === null ? "" : String(groupBy)}
            />
          </div>
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2.5">
          <ToggleSwitch
            checked={showInLibrary}
            onChange={() => setShowInLibrary((prev) => !prev)}
            title="Show in library preset dropdown"
          />
          <span className="font-public-sans text-xs text-on-surface">
            Show in library
          </span>
        </label>
        <div
          className={cn(
            "flex items-center gap-2.5",
            dashboardDisabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
          onClick={() => {
            if (dashboardDisabled) {
              triggerGroupTooltip();
            }
          }}
        >
          <span className={cn(dashboardDisabled && "pointer-events-none")}>
            <ToggleSwitch
              checked={showInDashboard}
              disabled={dashboardDisabled}
              onChange={toggleShowInDashboard}
            />
          </span>
          <span
            className={cn(
              "font-public-sans text-xs text-on-surface select-none",
              dashboardDisabled && "pointer-events-none",
            )}
            onClick={() => {
              if (!dashboardDisabled) toggleShowInDashboard();
            }}
          >
            Show in dashboard
          </span>
        </div>
      </div>

      {error ? (
        <p className="font-public-sans text-xs text-status-error">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
          type="button"
          variant="primaryFilled"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Save Collection"
          ) : (
            "Create Collection"
          )}
        </Button>
        <Button onClick={onCancel} type="button" variant="darkFilled">
          Cancel
        </Button>
      </div>
    </div>
  );
}
