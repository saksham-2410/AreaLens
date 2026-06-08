'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useStore, ActiveLayer } from '@/lib/store'
import type { Sector } from '@/data/sectors'
import { getCityConfig, getPlaceById } from '@/data/cities'
import { commuteColor } from '@/lib/commuteUtils'

// Stadia Maps vector styles — Alidade Smooth (≈ Positron) for day and its dark
// twin for night. On localhost these load keyless; in production, allowlist the
// deploy domain in the Stadia dashboard (domain-based auth, no secret key in
// client code). Attribution is required by Stadia + OSM — see AttributionControl
// added below. Swap back to basemaps.cartocdn.com to revert.
const STYLE_DAY   = 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'
const STYLE_NIGHT = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json'

const BG_DAY   = '#F0DEC0'
const BG_NIGHT = '#0C0907'

// Current city config, read live from the store (the view is locked to whichever
// city is selected so the wider region never renders).
const cityCfg = () => getCityConfig(useStore.getState().selectedCity)

// ─── Mode-aware paint expressions ──────────────────────────────────────
function sectorScoreColor(isNight: boolean): maplibregl.ExpressionSpecification {
  return isNight
    ? ['case',
        ['boolean', ['feature-state', 'selected'], false], '#FF9E3D',
        ['boolean', ['feature-state', 'hovered'], false],  '#F2C24C',
        ['interpolate', ['linear'], ['get', 'score'],
          50, '#6E5430', 65, '#8C6A36', 80, '#B0883C', 90, '#D4A648']]
    : ['case',
        ['boolean', ['feature-state', 'selected'], false], '#7A4A1E',
        ['boolean', ['feature-state', 'hovered'], false],  '#C4732A',
        ['interpolate', ['linear'], ['get', 'score'],
          50, '#C09C72', 65, '#C8A87A', 80, '#CEB070', 90, '#C8A446']]
}

function extrusionColor(
  isNight: boolean,
  activeLayer: ActiveLayer,
  commuteTimes: Record<string, number>,
): maplibregl.ExpressionSpecification {
  if (activeLayer === 'commute') {
    const cases = Object.entries(commuteTimes).flatMap(([id, secs]) => {
      if (!secs) return []
      return [['==', ['get', 'id'], id] as maplibregl.ExpressionSpecification, commuteColor(secs)]
    })
    // No office pin yet → no commute data. A 'case' needs ≥1 condition/output
    // pair, so fall back to the neutral score coloring until data exists.
    if (cases.length === 0) return sectorScoreColor(isNight)
    return ['case', ...cases, isNight ? '#5A4A2E' : '#C8A87A'] as maplibregl.ExpressionSpecification
  }
  if (activeLayer === 'waterlogging') {
    return ['interpolate', ['linear'], ['get', 'waterlogging'],
      1, '#A8C5D8', 2, '#7AAFC8', 3, '#9B85C0', 4, '#7B60A8', 5, '#5B3D88']
  }
  if (activeLayer === 'tanker') {
    return ['interpolate', ['linear'], ['get', 'water_tanker'],
      1, '#7AB88A', 2, '#A8C878', 3, '#D4B840', 4, '#C87830', 5, '#A83820']
  }
  if (activeLayer === 'power') {
    return ['interpolate', ['linear'], ['get', 'power_outage'],
      0, '#7AB88A', 30, '#A8C878', 60, '#D4B840', 90, '#C87830', 120, '#A83820']
  }
  if (activeLayer === 'noise') {
    return ['interpolate', ['linear'], ['get', 'noise_db'],
      40, isNight ? '#5A4A2E' : '#C8B888', 55, '#C4A840', 65, '#C47820', 72, '#B84820', 80, '#8B2810']
  }
  return sectorScoreColor(isNight)
}

function borderColor(isNight: boolean): maplibregl.ExpressionSpecification {
  return isNight
    ? ['case',
        ['boolean', ['feature-state', 'selected'], false], 'rgba(255,180,90,0.95)',
        ['boolean', ['feature-state', 'hovered'], false],  'rgba(240,194,76,0.85)',
        'rgba(216,168,90,0.30)']
    : ['case',
        ['boolean', ['feature-state', 'selected'], false], 'rgba(122,74,30,0.9)',
        ['boolean', ['feature-state', 'hovered'], false],  'rgba(196,115,42,0.8)',
        'rgba(155,107,56,0.22)']
}

const BORDER_WIDTH: maplibregl.ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false], 2.5,
  ['boolean', ['feature-state', 'hovered'], false],  1.8,
  0.8,
]

// Hover heights. We drive these via JS animation (data-driven feature state +
// requestAnimationFrame for spring overshoot) so the rise reads as a real
// physical pop instead of a linear CSS interpolation.
const FLAT_H        = 30
const SELECTED_H    = 380
const HOVER_PEAK    = 880   // peak of the overshoot animation
const HOVER_SETTLE  = 720   // resting hover height after the bounce

// We read a per-feature 'lift' number (0..1) from feature-state and interpolate
// it against the heights. The lift is animated in JS with a spring curve so the
// tile bounces up past the settle height and back, giving the rise real weight.
const HEIGHT: maplibregl.ExpressionSpecification = [
  'interpolate', ['linear'],
  ['coalesce', ['feature-state', 'lift'],
    ['case', ['boolean', ['feature-state', 'selected'], false], 0.45, 0],
  ],
  0,    FLAT_H,
  0.45, SELECTED_H,
  1.0,  HOVER_SETTLE,
  1.25, HOVER_PEAK,    // overshoot — values >1 only set during the bounce
]

function tooltipHTML(s: Sector, isNight: boolean): string {
  const c = isNight
    ? { main: '#F3E9D8', vibe: '#B6A284', accent: '#D8A85A', price: '#E8C474', sub: '#7C6A50', div: 'rgba(216,168,90,0.18)' }
    : { main: '#2C1A0E', vibe: '#9B7A50', accent: '#9B6B38', price: '#6B3A12', sub: '#B09070', div: 'rgba(155,107,56,0.15)' }
  const aqiColor = s.metrics.aqi > 110 ? '#B83420' : s.metrics.aqi > 100 ? '#C07820' : '#1E7A4A'
  return `
    <div style="font-family:'DM Sans',sans-serif">
      <div style="font-size:10px;color:${c.vibe};letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px">
        ${s.vibe_emoji} ${s.vibe_tag}
      </div>
      <div style="font-size:15px;font-weight:700;color:${c.main};font-family:'Lora',serif;font-style:italic">
        ${s.sector_name}
      </div>
      <div style="display:flex;gap:14px;margin-top:8px;padding-top:7px;border-top:1px solid ${c.div}">
        <div><div style="font-size:18px;color:${c.accent};font-family:'Bebas Neue',sans-serif;letter-spacing:.06em;line-height:1">${s.score}</div><div style="font-size:9px;color:${c.sub};margin-top:1px">SCORE</div></div>
        <div><div style="font-size:18px;color:${c.price};font-family:'Bebas Neue',sans-serif;letter-spacing:.06em;line-height:1">₹${(s.price_range.buy_psf[0]/1000).toFixed(0)}k+</div><div style="font-size:9px;color:${c.sub};margin-top:1px">PSF</div></div>
        <div><div style="font-size:18px;color:${aqiColor};font-family:'Bebas Neue',sans-serif;letter-spacing:.06em;line-height:1">${s.metrics.aqi}</div><div style="font-size:9px;color:${c.sub};margin-top:1px">AQI</div></div>
      </div>
    </div>`
}

export default function MapCanvas() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<maplibregl.Map | null>(null)
  const tooltipRef   = useRef<maplibregl.Popup | null>(null)
  const hoveredId    = useRef<string | null>(null)
  const ready        = useRef(false)
  // Per-feature spring animation state: id -> { from, to, started, raf }
  const liftAnims    = useRef<Record<string, { raf: number }>>({})

  const { phase, isNightMode, activeLayer, commuteTimes, selectedCity } = useStore()

  // ─── Add data layers (called on first load + after each style switch) ──
  const addDataLayers = (map: maplibregl.Map, isNight: boolean) => {
    try { map.setPaintProperty('background', 'background-color', isNight ? BG_NIGHT : BG_DAY) } catch {}

    // Tune the basemap to the palette: warm roads, hide the busy building
    // footprints, soften water — so the city reads clean under the sectors.
    const roadColor  = isNight ? '#2A2118' : '#DEC8A0'
    const waterColor = isNight ? '#15110B' : '#E7D3AE'
    for (const layer of map.getStyle().layers ?? []) {
      const id = layer.id
      if (layer.type === 'line' && /road|street|highway|bridge|tunnel/i.test(id)) {
        try { map.setPaintProperty(id, 'line-color', roadColor) } catch {}
      }
      if (/building/i.test(id)) {
        try { map.setLayoutProperty(id, 'visibility', 'none') } catch {}
      }
      if (layer.type === 'fill' && /water/i.test(id)) {
        try { map.setPaintProperty(id, 'fill-color', waterColor) } catch {}
      }
    }

    if (!map.getSource('sectors')) {
      map.addSource('sectors', { type: 'geojson', data: cityCfg().getGeoJSON() })
    }

    // ── GLOW HALO: a soft expanded glow under the hovered sector. Uses fill
    // (not extrusion) so it lays flat on the map for the spotlight effect.
    if (!map.getLayer('sectors-glow')) {
      map.addLayer({
        id: 'sectors-glow',
        type: 'fill',
        source: 'sectors',
        paint: {
          'fill-color': isNight ? '#FFC65A' : '#E89030',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hovered'], false],  isNight ? 0.42 : 0.32,
            ['boolean', ['feature-state', 'selected'], false], isNight ? 0.28 : 0.20,
            0,
          ],
          'fill-opacity-transition': { duration: 250, delay: 0 },
        } as maplibregl.FillLayerSpecification['paint'],
      })
    }

    if (!map.getLayer('sectors-extrusion')) {
      map.addLayer({
        id: 'sectors-extrusion',
        type: 'fill-extrusion',
        source: 'sectors',
        paint: {
          'fill-extrusion-color': extrusionColor(isNight, useStore.getState().activeLayer, useStore.getState().commuteTimes),
          'fill-extrusion-height': HEIGHT,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': isNight ? 0.95 : 0.90,
          // Faster transitions so the JS-driven spring animation feels snappy
          // rather than smeared.
          'fill-extrusion-height-transition': { duration: 120, delay: 0 },
          'fill-extrusion-color-transition': { duration: 180, delay: 0 },
        } as maplibregl.FillExtrusionLayerSpecification['paint'],
      })
    }

    if (!map.getLayer('sectors-border')) {
      map.addLayer({
        id: 'sectors-border',
        type: 'line',
        source: 'sectors',
        paint: {
          'line-color': borderColor(isNight),
          'line-width': BORDER_WIDTH,
          'line-blur': ['case', ['boolean', ['feature-state', 'hovered'], false], 1.5, 0],
        } as maplibregl.LineLayerSpecification['paint'],
      })
    }

    if (!map.getLayer('sectors-labels')) {
      map.addLayer({
        id: 'sectors-labels',
        type: 'symbol',
        source: 'sectors',
        layout: {
          'text-field': ['get', 'sector_code'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-letter-spacing': 0.10,
          'text-allow-overlap': false,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': isNight
            ? ['case', ['boolean', ['feature-state', 'hovered'], false], '#F2C24C', 'rgba(216,168,90,0.78)']
            : ['case', ['boolean', ['feature-state', 'hovered'], false], '#5C3010', 'rgba(100,65,28,0.70)'],
          'text-halo-color': isNight ? 'rgba(10,8,5,0.85)' : 'rgba(245,230,206,0.85)',
          'text-halo-width': 1.5,
        } as maplibregl.SymbolLayerSpecification['paint'],
      })
    }

    // Restore selection highlight (feature-state is wiped on style switch)
    const sel = useStore.getState().selectedSectorId
    if (sel) {
      try { map.setFeatureState({ source: 'sectors', id: sel }, { selected: true }) } catch {}
    }
  }

  // ─── INIT ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const startNight = useStore.getState().isNightMode
    const cfg = cityCfg()

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: startNight ? STYLE_NIGHT : STYLE_DAY,
      bounds: cfg.bounds,
      fitBoundsOptions: { padding: 70, pitch: 52, bearing: -12 },
      maxBounds: cfg.maxBounds,
      minZoom: cfg.minZoom,
      maxZoom: 17,
      pitch: 52,
      bearing: -12,
      attributionControl: false,
    })
    // Stadia + OSM require visible attribution. Compact keeps it to a small
    // "ⓘ" toggle that expands to the credits, so the locked Gurugram view stays
    // clean. Strings come from the style's source definitions automatically.
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    mapRef.current = map
    if (typeof window !== 'undefined') {
      ;(window as unknown as { __map?: maplibregl.Map }).__map = map
    }

    tooltipRef.current = new maplibregl.Popup({
      closeButton: false, closeOnClick: false, className: 'map-tooltip', offset: 14,
    })

    const onReady = () => {
      if (ready.current) return
      ready.current = true
      addDataLayers(map, useStore.getState().isNightMode)

      // ── Spring animator: pops the tile to overshoot (1.25), then settles
      // to 1.0. Cancelled & reversed on mouseleave for a clean drop.
      const animateLift = (id: string, target: number) => {
        const existing = liftAnims.current[id]
        if (existing) cancelAnimationFrame(existing.raf)

        const fromState = (map.getFeatureState({ source: 'sectors', id }) as { lift?: number }) || {}
        const startLift = typeof fromState.lift === 'number'
          ? fromState.lift
          : (useStore.getState().selectedSectorId === id ? 0.45 : 0)
        const t0 = performance.now()

        // Spring constants tuned for a satisfying pop without being silly.
        // Critical: pop reaches 1.25 around t=120ms, settles to target by ~420ms.
        const POP_DURATION = 480

        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / POP_DURATION)
          let v: number
          if (target >= 1) {
            // Going up: out-back with overshoot
            // f(t) = blend from start to peak (1.25) then back to settle (1.0)
            const peak = 1.25
            if (t < 0.32) {
              // Accelerate up to peak
              const u = t / 0.32
              const eased = 1 - Math.pow(1 - u, 3)  // ease-out cubic
              v = startLift + (peak - startLift) * eased
            } else {
              // Damped return to target
              const u = (t - 0.32) / 0.68
              const eased = 1 - Math.pow(1 - u, 2)
              v = peak + (target - peak) * eased
            }
          } else {
            // Going down: brisk ease-in cubic — feels like gravity
            const eased = Math.pow(t, 2.2)
            v = startLift + (target - startLift) * eased
          }
          try { map.setFeatureState({ source: 'sectors', id }, { lift: v }) } catch {}
          if (t < 1) {
            liftAnims.current[id] = { raf: requestAnimationFrame(step) }
          } else {
            delete liftAnims.current[id]
          }
        }
        liftAnims.current[id] = { raf: requestAnimationFrame(step) }
      }

      // ── Hover ──
      map.on('mousemove', 'sectors-extrusion', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        const id = e.features?.[0]?.properties?.id as string
        if (!id || id === hoveredId.current) return
        if (hoveredId.current) {
          map.setFeatureState({ source: 'sectors', id: hoveredId.current }, { hovered: false })
          animateLift(hoveredId.current,
            useStore.getState().selectedSectorId === hoveredId.current ? 0.45 : 0)
        }
        hoveredId.current = id
        map.setFeatureState({ source: 'sectors', id }, { hovered: true })
        animateLift(id, 1)
        useStore.getState().setHoveredSector(id)

        const s = getPlaceById(id)
        if (s && tooltipRef.current) {
          tooltipRef.current
            .setLngLat(e.lngLat)
            .setHTML(tooltipHTML(s, useStore.getState().isNightMode))
            .addTo(map)
        }
      })

      map.on('mouseleave', 'sectors-extrusion', () => {
        map.getCanvas().style.cursor = ''
        if (hoveredId.current) {
          const prev = hoveredId.current
          map.setFeatureState({ source: 'sectors', id: prev }, { hovered: false })
          animateLift(prev, useStore.getState().selectedSectorId === prev ? 0.45 : 0)
          hoveredId.current = null
        }
        useStore.getState().setHoveredSector(null)
        tooltipRef.current?.remove()
      })

      // ── Click to focus (or add to compare when in selection mode) ──
      map.on('click', 'sectors-extrusion', (e) => {
        const id = e.features?.[0]?.properties?.id as string
        if (!id) return

        // Compare-selection mode: add the tapped sector and reopen the panel.
        if (useStore.getState().isSelectingCompare) {
          useStore.getState().addToCompare(id)
          useStore.getState().setIsSelectingCompare(false)
          useStore.getState().setShowComparePanel(true)
          return
        }

        const sector = getPlaceById(id)
        if (!sector) return

        const prev = useStore.getState().selectedSectorId
        if (prev) map.setFeatureState({ source: 'sectors', id: prev }, { selected: false })
        map.setFeatureState({ source: 'sectors', id }, { selected: true })
        useStore.getState().setSelectedSector(id)
        useStore.getState().setPhase('focused')

        const isMobile = window.innerWidth < 768
        map.flyTo({
          center: sector.coordinates,
          // Tighter zoom on mobile so the small map viewport still shows the
          // selected sector clearly above the bottom sheet.
          zoom: isMobile ? cityCfg().zoomFocus + 0.5 : cityCfg().zoomFocus,
          pitch: 55,
          bearing: -12,
          duration: 1400,
          easing: t => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
          // Mobile: leave the top half of the screen visible above the bottom
          // sheet. Desktop: push the map to the left of the right side panel.
          padding: isMobile
            ? { top: 0, bottom: window.innerHeight * 0.55, left: 0, right: 0 }
            : { top: 0, bottom: 0, left: 0, right: window.innerWidth * 0.52 },
        })
      })

      // ── Click empty → deselect (or cancel compare selection) ──
      map.on('click', (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ['sectors-extrusion'] })
        if (hits.length === 0) {
          // Cancel compare-selection mode without losing the compare panel.
          if (useStore.getState().isSelectingCompare) {
            useStore.getState().setIsSelectingCompare(false)
            useStore.getState().setShowComparePanel(true)
            return
          }
          const prev = useStore.getState().selectedSectorId
          if (prev) {
            map.setFeatureState({ source: 'sectors', id: prev }, { selected: false })
            useStore.getState().setSelectedSector(null)
            useStore.getState().setPhase('explore')
            // Phase effect handles the recenter (with padding reset).
          }
        }
      })
    }

    // Run on load, OR immediately if the style is already loaded (handles the
    // React StrictMode remount where 'load' may have fired on a prior instance)
    map.on('load', onReady)
    if (map.isStyleLoaded()) onReady()

    return () => { mapRef.current?.remove(); mapRef.current = null; ready.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── DAY / NIGHT base-style switch ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready.current) return
    map.setStyle(isNightMode ? STYLE_NIGHT : STYLE_DAY)
    // setStyle wipes our source/layers. Event timing (styledata) is unreliable
    // mid-swap, so poll until the new style is fully loaded AND our layer is
    // actually gone, then re-add. Guaranteed to land exactly once.
    let tries = 0
    const iv = setInterval(() => {
      tries += 1
      if (map.isStyleLoaded() && !map.getLayer('sectors-extrusion')) {
        addDataLayers(map, isNightMode)
        clearInterval(iv)
      } else if (tries > 50) {
        clearInterval(iv)
      }
    }, 80)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNightMode])

  // ─── FLY TO EXPLORE (+ safety net: ensure layers exist) ───────────────
  // After focusing a sector we used non-zero camera padding (bottom 55% on
  // mobile for the bottom sheet, right 52% on desktop for the side panel).
  // MapLibre persists camera padding state across calls — so a plain fitBounds
  // here would re-fit the bounds inside that *biased* viewport, leaving the
  // user staring at empty area south of the city. We explicitly clear the
  // padding first via setPadding so the recenter uses the full visible map.
  useEffect(() => {
    const map = mapRef.current
    if (phase === 'explore' && map) {
      if (map.isStyleLoaded() && !map.getLayer('sectors-extrusion')) {
        addDataLayers(map, useStore.getState().isNightMode)
      }
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
      const isMobile = window.innerWidth < 768
      map.fitBounds(cityCfg().bounds, {
        padding: isMobile ? 20 : 70,
        duration: 1600,
        pitch: 52,
        bearing: -12,
        essential: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ─── CITY SWITCH ──────────────────────────────────────────────────────
  // The map is created once (during 'landing', defaulting to Gurugram). When
  // the user picks a different city at city-select, relocate: swap the source
  // data, re-frame the camera and re-apply the locked bounds for the new city.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready.current) return
    const cfg = cityCfg()

    // Clear any prior city's selection/commute so nothing carries over.
    useStore.getState().setSelectedSector(null)
    useStore.getState().setCommuteTimes({})

    const src = map.getSource('sectors') as maplibregl.GeoJSONSource | undefined
    if (src) src.setData(cfg.getGeoJSON())

    // Drop the lock while we travel, then re-apply it once settled — otherwise
    // maxBounds from the old city would clamp the flight to the new one.
    map.setMaxBounds(null)
    map.setMinZoom(cfg.minZoom)
    map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
    map.fitBounds(cfg.bounds, {
      padding: window.innerWidth < 768 ? 20 : 70,
      duration: 1600,
      pitch: 52,
      bearing: -12,
      essential: true,
    })
    const t = setTimeout(() => { try { map.setMaxBounds(cfg.maxBounds) } catch {} }, 1700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity])

  // ─── LAYER SWITCHING ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !map.getLayer('sectors-extrusion')) return
    map.setPaintProperty('sectors-extrusion', 'fill-extrusion-color',
      extrusionColor(isNightMode, activeLayer, commuteTimes))
  }, [activeLayer, commuteTimes, isNightMode])

  return (
    <div
      ref={mapContainer}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, background: 'var(--bg)' }}
    />
  )
}
