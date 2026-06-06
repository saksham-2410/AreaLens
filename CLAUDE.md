# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (eslint.config.mjs, Next.js config)
```

No test suite is configured. TypeScript is checked implicitly by `next build`.

## Architecture

AreaLens is a single-page Gurugram neighborhood intelligence tool. The entire app lives in `src/app/page.tsx` and is driven by an **app phase** state machine.

### Phase state machine

`src/lib/store.ts` (Zustand) owns the single source of truth. `AppPhase` controls what's visible:

- `loading` → boot loader plays, map not mounted
- `city-select` → `CitySelector` overlay appears (map mounted but hidden behind)
- `explore` → HUD + map visible, no sector focused
- `focused` → a sector is selected; `SectorPanel` slides in; map pans/zooms to the sector

Transitions: `Loader.onComplete` → `city-select`; `CitySelector.onSelect` → `explore`; map click on sector → `focused`; click on empty map or "back" → `explore`.

### Map (`src/components/MapCanvas.tsx`)

- MapLibre GL rendered in a WebGL canvas. **Must be dynamically imported with `ssr: false`** — see `page.tsx`.
- Map is locked to Gurugram bounds; two CartoDB base styles switch on night mode (Positron day / Dark Matter night).
- Sector polygons are a GeoJSON source. Three layers: `sectors-glow` (fill), `sectors-extrusion` (fill-extrusion), `sectors-border` (line), `sectors-labels` (symbol).
- Hover/select state is held in MapLibre **feature state** (`lift`, `hovered`, `selected`). The lift is driven by a JS spring animation (`requestAnimationFrame`) rather than CSS — the `fill-extrusion-height` expression interpolates a `lift` float (0 → 1.25 overshoot → 1.0 settle).
- Day/night style switch wipes all custom sources/layers; a polling interval (`setInterval`, 80 ms, max 50 tries) re-adds them after the new style loads.
- `reactStrictMode` is **disabled** in `next.config.ts` — the double-mount in StrictMode races with MapLibre's `load` event.

### Data (`src/data/`)

All sector data is static (no API calls at runtime):
- `sectors.ts` — TypeScript types + `ALL_SECTORS` array + `getSectorsGeoJSON()` helper
- `sectorPolygons.ts` — raw polygon coordinates, imported by `sectors.ts`
- `generatedSectors.ts` — supplementary generated sector data

### State (`src/lib/store.ts`)

Key slices:
- `activeLayer: ActiveLayer` — controls which data layer the 3D extrusion colors represent (`none` | `waterlogging` | `tanker` | `power` | `noise` | `commute`)
- `compareSectors: string[]` — up to 2 sector IDs for VS comparison; `VSCompare` panel renders inside `SectorPanel`
- `commuteTimes: Record<string, number>` — seconds per sector, computed by `src/lib/commuteUtils.ts` (haversine mock; intended to hit self-hosted OSRM in the full build)
- Night mode: auto-computed from Gurugram sun times (`src/lib/sunUtils.ts`), overridable via `setNightModeOverride`

### Theming

Two palettes — champagne (day) and dark (night) — defined as CSS custom properties in `src/app/globals.css`. Night mode is toggled by adding/removing the `.night` class on `<html>`. Tailwind v4 tokens are wired via `@theme inline` in the same file. Four Google Fonts are loaded in `layout.tsx` and exposed as CSS variables: `--font-bebas` (display), `--font-lora` (serif), `--font-dm-sans` (sans), `--font-space-mono` (mono).

### Components

- `HUD` — top nav bar. Desktop: layer switcher inline. Mobile: layer switcher in a slide-in left drawer triggered by the logo.
- `SectorPanel` — right side panel on desktop, bottom sheet on mobile (drag-to-expand). Contains `VSCompare`.
- `CommutePanel` — floating card (bottom-left) that appears when the commute layer is active; lets the user pick an office and colors sectors by drive time.
- `CitySelector`, `Loader`, `MobileBanner` — transient overlay components.
