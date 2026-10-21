import type * as MapLibreGL from 'maplibre-gl'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from 'cn'
import { useLanguage } from '#/lib/i18n'

const LIGHT_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

type MapViewport = {
  center: [number, number]
  zoom: number
}

const MapContext = createContext<{
  map: MapLibreGL.Map | null
  library: typeof MapLibreGL | null
}>({ map: null, library: null })

type OfficeMapProps = {
  children?: ReactNode
  className?: string
  viewport: MapViewport
  cooperativeGestures?: boolean
}

export function OfficeMap({
  children,
  className,
  viewport,
  cooperativeGestures = true,
}: OfficeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<MapLibreGL.Map | null>(null)
  const [library, setLibrary] = useState<typeof MapLibreGL | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const { t } = useLanguage()
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    let instance: MapLibreGL.Map | undefined
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        try {
          const [module, worker] = await Promise.all([
            import('maplibre-gl'),
            import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
            import('maplibre-gl/dist/maplibre-gl.css'),
          ])
          if (cancelled) return
          module.setWorkerUrl(worker.default)
          instance = new module.Map({
            container,
            style: LIGHT_STYLE,
            center: viewportRef.current.center,
            zoom: viewportRef.current.zoom,
            cooperativeGestures,
            locale: {
              'CooperativeGesturesHandler.WindowsHelpText':
                'Scroll untuk lanjut • Ctrl + scroll untuk zoom',
              'CooperativeGesturesHandler.MacHelpText':
                'Scroll untuk lanjut • ⌘ + scroll untuk zoom',
              'CooperativeGesturesHandler.MobileHelpText':
                'Geser 1 jari untuk scroll • 2 jari untuk peta',
            },
            attributionControl: { compact: true },
          })
          const current = instance
          current.on('load', () => {
            current.resize()
            if (!cancelled) setFailed(false)
          })
          current.on('error', () => {
            if (!cancelled && !current.isStyleLoaded()) setFailed(true)
          })
          setLibrary(module)
          setMap(current)
        } catch {
          if (!cancelled) setFailed(true)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(container)
    return () => {
      cancelled = true
      observer.disconnect()
      instance?.remove()
    }
  }, [attempt, cooperativeGestures])

  const value = useMemo(() => ({ map, library }), [map, library])

  return (
    <MapContext.Provider value={value}>
      <div
        ref={containerRef}
        className={cn('office-map relative h-full w-full', className)}
      >
        {map && library ? children : null}
        {failed ? (
          <div
            role="alert"
            className="absolute inset-0 z-10 grid place-content-center gap-3 bg-background/95 p-6 text-center text-sm"
          >
            <p>
              {t(
                'ui.mapUnavailable',
                'Map unavailable. Directions remain available.',
              )}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${viewport.center[1]},${viewport.center[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-primary-text underline"
            >
              {t('common.openMaps', 'Open in Google Maps')}
            </a>
            <button
              type="button"
              className="min-h-11 cursor-pointer underline"
              onClick={() => {
                setMap(null)
                setFailed(false)
                setAttempt((current) => current + 1)
              }}
            >
              {t('common.tryAgain', 'Try again')}
            </button>
          </div>
        ) : null}
      </div>
    </MapContext.Provider>
  )
}
const MarkerContext = createContext<{ marker: MapLibreGL.Marker } | null>(null)

// One open card per map at a time.
const openClosers = new WeakMap<MapLibreGL.Map, Set<() => void>>()

type OfficeMarkerProps = {
  longitude: number
  latitude: number
  anchor?: MapLibreGL.MarkerOptions['anchor']
  children: ReactNode
}

export function OfficeMarker({
  longitude,
  latitude,
  anchor = 'center',
  children,
}: OfficeMarkerProps) {
  const { map, library } = useContext(MapContext)
  const marker = useMemo(
    () =>
      !library
        ? null
        : new library.Marker({
            element: document.createElement('div'),
            anchor,
          }).setLngLat([longitude, latitude]),
    [anchor, longitude, latitude, library],
  )

  useEffect(() => {
    if (!map || !marker) return
    marker.addTo(map)
    return () => {
      marker.remove()
    }
  }, [map, marker])

  if (!marker) return null
  return (
    <MarkerContext.Provider value={{ marker }}>
      {children}
    </MarkerContext.Provider>
  )
}

export function MarkerPin({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  const context = useContext(MarkerContext)
  if (!context) throw new Error('MarkerPin must be used within OfficeMarker')
  return createPortal(
    <div className={cn('relative cursor-pointer', className)}>{children}</div>,
    context.marker.getElement(),
  )
}

export function MarkerCard({
  children,
  className,
  popupClassName,
  defaultOpen = false,
  closeButton = false,
}: {
  children: ReactNode
  className?: string
  popupClassName?: string
  defaultOpen?: boolean
  closeButton?: boolean
}) {
  const { map, library } = useContext(MapContext)
  const markerContext = useContext(MarkerContext)
  const contentId = useId()
  const [openCount, setOpenCount] = useState(0)
  const container = useMemo(
    () =>
      typeof document === 'undefined' ? null : document.createElement('div'),
    [],
  )
  const popup = useMemo(
    () =>
      // No anchor: MapLibre flips side to fit.
      library
        ? new library.Popup({
            offset: 18,
            closeButton,
            closeOnClick: false,
            focusAfterOpen: false,
            className: popupClassName,
          }).setMaxWidth('none')
        : null,
    [closeButton, popupClassName, library],
  )

  useEffect(() => {
    if (!map || !markerContext || !container || !popup) return
    const { marker } = markerContext
    popup.setDOMContent(container)
    const element = marker.getElement()
    const trigger = element.querySelector('button')
    const label =
      trigger?.getAttribute('aria-label') || trigger?.textContent.trim()
    container.id = contentId
    container.setAttribute('role', 'dialog')
    if (label) container.setAttribute('aria-label', label)
    trigger?.setAttribute('aria-expanded', 'false')
    trigger?.setAttribute('aria-haspopup', 'dialog')
    trigger?.setAttribute('aria-controls', contentId)
    // Clamp once per open; loops caused judder.
    const clampCard = () => {
      const mapElement = map.getContainer()
      container.style.maxWidth = `${Math.max(0, mapElement.clientWidth - 32)}px`
      container.style.maxHeight = `${Math.max(0, mapElement.clientHeight - 32)}px`
    }
    // Clip only when scrolling; otherwise it cuts the card shadow.
    const syncOverflow = () => {
      const scrolls = container.scrollHeight > container.clientHeight
      container.style.overflowX = scrolls ? 'hidden' : 'visible'
      container.style.overflowY = scrolls ? 'auto' : 'visible'
    }
    const resetTrigger = () => {
      trigger?.setAttribute('aria-expanded', 'false')
      trigger?.focus({ preventScroll: true })
    }
    popup.on('close', resetTrigger)
    // Click toggles; map click and Escape close.
    const close = () => popup.remove()
    const closers = openClosers.get(map) ?? new Set<() => void>()
    openClosers.set(map, closers)
    closers.add(close)
    const toggle = () => {
      if (popup.isOpen()) {
        close()
        return
      }
      closers.forEach((fn) => {
        if (fn !== close) fn()
      })
      setOpenCount((count) => count + 1)
      clampCard()
      popup.setLngLat(marker.getLngLat()).addTo(map)
      syncOverflow()
      trigger?.setAttribute('aria-expanded', 'true')
    }
    const closeOnMapClick = (event: MapLibreGL.MapMouseEvent) => {
      const target = event.originalEvent.target as HTMLElement | null
      if (target?.closest('.maplibregl-marker, .maplibregl-popup')) return
      close()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    element.addEventListener('click', toggle)
    map.on('click', closeOnMapClick)
    document.addEventListener('keydown', closeOnEscape)
    if (defaultOpen) {
      toggle()
    }
    return () => {
      closers.delete(close)
      element.removeEventListener('click', toggle)
      map.off('click', closeOnMapClick)
      document.removeEventListener('keydown', closeOnEscape)
      popup.off('close', resetTrigger)
      popup.remove()
    }
  }, [container, contentId, defaultOpen, map, markerContext, popup])

  if (!container) return null
  return createPortal(
    <div
      key={openCount}
      className={cn('pointer-events-auto overscroll-contain', className)}
    >
      {children}
    </div>,
    container,
  )
}
