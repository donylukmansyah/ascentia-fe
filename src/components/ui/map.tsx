import * as MapLibreGL from 'maplibre-gl'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from 'cn'

// Bundled worker so Vite emits sibling chunk.
setWorkerUrl(workerUrl)

const LIGHT_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

type MapViewport = {
  center: [number, number]
  zoom: number
}

const MapContext = createContext<{ map: MapLibreGL.Map | null }>({
  map: null,
})

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
  const [mounted, setMounted] = useState(false)
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  useEffect(() => {
    setMounted(true)
    if (!containerRef.current) return
    const instance = new MapLibreGL.Map({
      container: containerRef.current,
      style: LIGHT_STYLE,
      center: viewportRef.current.center,
      zoom: viewportRef.current.zoom,
      // Page scroll passes through; zoom needs Ctrl.
      cooperativeGestures,
      // Friendly cooperative gesture hints.
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
    const handleLoad = () => instance.resize()
    instance.on('load', handleLoad)
    setMap(instance)
    return () => {
      instance.off('load', handleLoad)
      instance.remove()
      setMap(null)
    }
  }, [])

  const value = useMemo(() => ({ map }), [map])

  return (
    <MapContext.Provider value={value}>
      <div
        ref={containerRef}
        className={cn('relative h-full w-full', className)}
      >
        {mounted ? children : null}
      </div>
    </MapContext.Provider>
  )
}
const MarkerContext = createContext<{ marker: MapLibreGL.Marker } | null>(null)

// One open card per map at a time.
const openClosers = new WeakMap<MapLibreGL.Map, Set<() => void>>()

// Hidden staging keeps content measurable.
const STAGED_HIDDEN_CSS =
  'position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;'

type OfficeMarkerProps = {
  longitude: number
  latitude: number
  children: ReactNode
}

export function OfficeMarker({
  longitude,
  latitude,
  children,
}: OfficeMarkerProps) {
  const { map } = useContext(MapContext)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  const marker = useMemo(
    () =>
      typeof document === 'undefined'
        ? null
        : new MapLibreGL.Marker({
            element: document.createElement('div'),
          }).setLngLat([longitude, latitude]),
    // Fixed coords per marker instance.
    [],
  )

  useEffect(() => {
    if (!map || !marker) return
    marker.addTo(map)
    return () => {
      marker.remove()
    }
  }, [map, marker])

  if (!ready || !marker) return null
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
}: {
  children: ReactNode
  className?: string
  popupClassName?: string
}) {
  const { map } = useContext(MapContext)
  const markerContext = useContext(MarkerContext)
  const [openCount, setOpenCount] = useState(0)
  const container = useMemo(
    () =>
      typeof document === 'undefined' ? null : document.createElement('div'),
    [],
  )
  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({
        offset: 18,
        closeButton: false,
        closeOnClick: false,
        className: popupClassName,
      }).setMaxWidth('none'),
    [popupClassName],
  )

  useEffect(() => {
    if (!map || !markerContext || !container) return
    const { marker } = markerContext
    popup.setDOMContent(container)
    const staged = container.parentElement
    // Stage hidden so anchor measures real size.
    if (staged instanceof HTMLElement) {
      staged.style.cssText = STAGED_HIDDEN_CSS
      map.getContainer().appendChild(staged)
    }
    // Click toggles; map click and Escape close.
    const close = () => {
      if (staged instanceof HTMLElement)
        staged.style.cssText = STAGED_HIDDEN_CSS
      popup.remove()
    }
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
      if (staged instanceof HTMLElement) staged.style.cssText = ''
      popup.setLngLat(marker.getLngLat()).addTo(map)
    }
    const closeOnMapClick = (event: MapLibreGL.MapMouseEvent) => {
      const target = event.originalEvent.target as HTMLElement | null
      if (target?.closest('.maplibregl-marker')) return
      close()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const element = marker.getElement()
    element.addEventListener('click', toggle)
    map.on('click', closeOnMapClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      closers.delete(close)
      element.removeEventListener('click', toggle)
      map.off('click', closeOnMapClick)
      document.removeEventListener('keydown', closeOnEscape)
      popup.remove()
    }
  }, [container, map, markerContext, popup])

  if (!container) return null
  return createPortal(
    <div key={openCount} className={cn('pointer-events-auto', className)}>
      {children}
    </div>,
    container,
  )
}
