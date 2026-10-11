import * as MapLibreGL from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from 'cn'

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
}

export function OfficeMap({ children, className, viewport }: OfficeMapProps) {
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
      attributionControl: { compact: true },
    })
    setMap(instance)
    return () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
}: {
  children: ReactNode
  className?: string
}) {
  const { map } = useContext(MapContext)
  const markerContext = useContext(MarkerContext)
  const container = useMemo(
    () =>
      typeof document === 'undefined' ? null : document.createElement('div'),
    [],
  )
  const popup = useMemo(
    () =>
      new MapLibreGL.Popup({ offset: 16, closeButton: false }).setMaxWidth(
        'none',
      ),
    [],
  )

  useEffect(() => {
    if (!map || !markerContext || !container) return
    const { marker } = markerContext
    popup.setDOMContent(container)
    const open = () => popup.setLngLat(marker.getLngLat()).addTo(map)
    const close = () => popup.remove()
    const element = marker.getElement()
    element.addEventListener('click', open)
    element.addEventListener('mouseenter', open)
    element.addEventListener('mouseleave', close)
    return () => {
      element.removeEventListener('click', open)
      element.removeEventListener('mouseenter', open)
      element.removeEventListener('mouseleave', close)
      popup.remove()
    }
  }, [container, map, markerContext, popup])

  if (!container) return null
  return createPortal(
    <div
      className={cn(
        'pointer-events-auto w-64 overflow-hidden rounded-xl bg-background shadow-xl',
        className,
      )}
    >
      {children}
    </div>,
    container,
  )
}
