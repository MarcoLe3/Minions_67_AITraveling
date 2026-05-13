'use client'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'

interface JourneyRouteProps {
  origin: string
  originLat: number
  originLng: number
  destination: string
  destinationLat: number
  destinationLng: number
}

/**
 * Generates a curved arc path between two lat/lng points by offsetting
 * interpolated midpoints northward. The bulge scales with distance so
 * short hops (London→Paris) look subtle and long hauls look dramatic.
 */
function getCurvedPath(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  steps = 60
): google.maps.LatLngLiteral[] {
  const dlat = lat2 - lat1
  const dlng = lng2 - lng1
  const dist = Math.sqrt(dlat * dlat + dlng * dlng)
  const curveMagnitude = Math.min(dist * 0.3, 18) // cap at 18° for very long routes

  const points: google.maps.LatLngLiteral[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    points.push({
      lat: lat1 + dlat * t + Math.sin(Math.PI * t) * curveMagnitude,
      lng: lng1 + dlng * t,
    })
  }
  return points
}

function makeCityPin(name: string, isOrigin: boolean): HTMLDivElement {
  const el = document.createElement('div')
  const bg = isOrigin ? '#3b82f6' : '#10b981'
  el.style.cssText = [
    'display:flex',
    'align-items:center',
    'gap:5px',
    'padding:5px 10px',
    `background:${bg}`,
    'border-radius:999px',
    'color:white',
    'font-size:12px',
    'font-weight:700',
    'white-space:nowrap',
    'box-shadow:0 2px 8px rgba(0,0,0,0.35)',
    'font-family:sans-serif',
    'letter-spacing:0.2px',
    'cursor:default',
    'pointer-events:none',
  ].join(';')

  // Small circle dot to distinguish origin vs destination
  const dot = document.createElement('span')
  dot.style.cssText = [
    'width:6px',
    'height:6px',
    'border-radius:50%',
    'background:rgba(255,255,255,0.75)',
    'display:inline-block',
    'flex-shrink:0',
  ].join(';')

  el.appendChild(dot)
  el.appendChild(document.createTextNode(name))
  return el
}

export default function JourneyRoute({
  origin, originLat, originLng,
  destination, destinationLat, destinationLng,
}: JourneyRouteProps) {
  const map = useMap()
  const markerLib = useMapsLibrary('marker')

  const arcRef = useRef<google.maps.Polyline | null>(null)
  const originMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const destMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

  useEffect(() => {
    if (!map || !markerLib) return

    const path = getCurvedPath(originLat, originLng, destinationLat, destinationLng)

    // Solid blue arc with forward-arrow direction indicators
    arcRef.current = new google.maps.Polyline({
      path,
      geodesic: false, // we supply the curve ourselves
      strokeColor: '#3b82f6',
      strokeOpacity: 0.85,
      strokeWeight: 2.5,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            scale: 3,
            strokeColor: '#3b82f6',
            strokeWeight: 2,
            strokeOpacity: 1,
          },
          repeat: '120px',
          offset: '50%',
        },
      ],
      map,
      zIndex: 1,
    })

    originMarkerRef.current = new markerLib.AdvancedMarkerElement({
      position: { lat: originLat, lng: originLng },
      map,
      content: makeCityPin(origin, true),
      title: origin,
      zIndex: 3,
    })

    destMarkerRef.current = new markerLib.AdvancedMarkerElement({
      position: { lat: destinationLat, lng: destinationLng },
      map,
      content: makeCityPin(destination, false),
      title: destination,
      zIndex: 3,
    })

    return () => {
      arcRef.current?.setMap(null)
      if (originMarkerRef.current) originMarkerRef.current.map = null
      if (destMarkerRef.current) destMarkerRef.current.map = null
    }
  }, [map, markerLib, origin, originLat, originLng, destination, destinationLat, destinationLng])

  return null
}
