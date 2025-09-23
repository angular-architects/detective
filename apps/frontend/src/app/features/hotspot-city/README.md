# Hotspot City 3D

This document explains how building height, footprint, count changes, and coloring work in the 3D Hotspot City.

## Modes and Data Flow

The city renders a list of items prepared by `HotspotCityComponent` and drawn by `City3DComponent`.

- File mode ("By File"): each building represents a single file.
- Module mode: each building represents an aggregated module bucket.

Filters (limits, tolerance slider/min score, and global UI filters) modify the underlying data before it is mapped to buildings.

## Building Height

Height is normalized from `item.height` in `City3DComponent` using the same function in both modes:

- Normalization: `height = clamp(1, 20, (value / 100) * 20)`
  - Scales the raw value to a maximum of 20 units, minimum of 1 unit.

Per mode, the raw `value` is:

### File mode

- Source: file McCabe complexity (`mcCabe`).
- Mapping in parent: `item.height = file.mcCabe`.
- Rendering: `normalizeComplexity(item.height)` applies the scaling above.
- Notes: Results are combined across metrics and scopes so each file has one row:

  1. For each configured scope, load hotspots twice with the current filters: once with metric `Length` and once with metric `McCabe`.
  2. Merge all results by `fileName`:
     - `loc` = max of `complexity` from `Length` results across all scopes
     - `mcCabe` = max of `complexity` from `McCabe` results across all scopes
     - `commits`, `changedLines`, `score` = max across all occurrences of that file (both metrics, all scopes)
  3. The city then renders one building per file: footprint from loc (Length), height from mcCabe (McCabe).

### Module mode

- Source: aggregated file count for the module (after filters).
- Mapping in parent: `item.height = aggregated.count` (aka `total`).
- Rendering: `normalizeComplexity(item.height)` applies the same scaling.

## Building Footprint (Width & Depth)

Footprint is derived from `item.footprint` and determines base size:

- Renderer normalization: `side = min(6, 0.5 + sqrt(max(1, footprint)) / 6)`.
- Mode-specific footprint sources:
  - File mode: file LOC (lines of code).
  - Module mode: aggregated file count.

Larger files/modules appear with a larger base up to a cap, keeping the scene readable.

## Why the number of buildings changes with filters

The number of buildings reflects how many items remain after the current filters are applied upstream of rendering. Changes that affect the count include:

- Tolerance slider (minimum score): items below the min score are excluded by the services/stores.
- Limits (e.g., date ranges, authors, paths): constrain the underlying git log and metrics.
- Selected metric and global filter changes: trigger new loads and aggregations.

Both file and module datasets are reloaded and recomputed when these inputs change, which can add/remove buildings or change their sizes.

## Coloring Rules

Color is assigned in `City3DComponent` and depends on the active mode.

### File mode (McCabe-based)

Based on raw McCabe complexity of the file (the same value used for height):

- `< 10` → Green `#4CAF50`
- `< 20` → Amber `#FFC107`
- `< 40` → Orange `#FF9800`
- `≥ 40` → Red `#F44336`

### Module mode (bucket presence)

Based on the presence of hotspot or warning files in the aggregated module:

- If `countHotspot > 0` → Red `#F44336`
- Else if `countWarning > 0` → Amber `#FFC107`
- Else → Green `#4CAF50`

The boundaries (`warningBoundary`, `hotspotBoundary`, `maxScore`) come with the aggregated result and reflect the current filtered dataset. They define severity buckets across the app; for coloring here, presence in those buckets drives the color.

## Interaction (context)

- Hover: shows a tooltip with file/module details.
- Click:
  - File → opens X-Ray dialog for the file.
  - Module → opens Hotspot Details dialog filtered to that module and severity range.

## Summary

### Per file mode

- Height: normalized from McCabe complexity.
- Footprint: normalized from LOC.
- Count changes: driven by filters (limits, min score, global filters).
- Colors: thresholded by McCabe (<10 green, <20 amber, <40 orange, ≥40 red).

### Per module mode

- Height: normalized from aggregated file count (post-filter total).
- Footprint: normalized from aggregated file count.
- Count changes: driven by filters and module aggregation.
- Colors: by presence of hotspot/warning (red if any hotspot, amber if any warning, else green) using current boundaries.
