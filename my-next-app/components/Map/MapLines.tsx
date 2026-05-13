'use client'
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import { useItinerary, ActivityFull } from '@/Context/ItineraryContext'

interface RouteComponentProp {
  index: number
  originLocation: string
  originLat?: number
  originLng?: number
  destinationLocation: string
  destinationLat?: number
  destinationLng?: number
  activities: ActivityFull[]
}

function makePinElement(label: string, active: boolean): HTMLDivElement {
  const el = document.createElement('div')
  el.style.cssText = [
    `width:${active ? 36 : 30}px`,
    `height:${active ? 36 : 30}px`,
    `background:${active ? '#E64A19' : '#FF7043'}`,
    'border-radius:50%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'color:white',
    'font-weight:700',
    `font-size:${active ? 13 : 11}px`,
    `border:${active ? 3 : 2}px solid white`,
    'cursor:pointer',
    'box-shadow:0 2px 6px rgba(0,0,0,0.35)',
    'transition:all 0.15s ease',
    'font-family:sans-serif',
  ].join(';')
  el.textContent = label
  return el
}

export default function MapRenderDirections({
  originLocation,
  destinationLocation,
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  activities,
}: RouteComponentProp) {
  const map = useMap()
  const routeLib = useMapsLibrary('routes')
  const markerLib = useMapsLibrary('marker')
  const { activeActivity, setActiveActivity } = useItinerary()

  const directionRenderer = useRef<google.maps.DirectionsRenderer | null>(null)
  const directionService = useRef<google.maps.DirectionsService | null>(null)
  const activityPolyline = useRef<google.maps.Polyline | null>(null)
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map())

  // Initialize direction services
  useEffect(() => {
    if (!routeLib || !map) return
    if (!directionRenderer.current) {
      directionRenderer.current = new routeLib.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#1A73E8',
          strokeWeight: 4,
          strokeOpacity: 0.75,
        },
      })
    }
    if (!directionService.current) {
      directionService.current = new routeLib.DirectionsService()
    }
    return () => {
      directionRenderer.current?.setMap(null)
      directionRenderer.current = null
    }
  }, [routeLib, map])

  // Render the blue origin-to-destination route
  useEffect(() => {
    if (!routeLib || !directionRenderer.current || !directionService.current) return

    const origin =
      originLat !== undefined && originLng !== undefined
        ? { lat: originLat, lng: originLng }
        : originLocation

    const destination =
      destinationLat !== undefined && destinationLng !== undefined
        ? { lat: destinationLat, lng: destinationLng }
        : destinationLocation

    directionService.current
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      })
      .then(result => {
        directionRenderer.current?.setDirections(result)
      })
      .catch(err => console.error('Origin-to-destination route error:', err))
  }, [routeLib, originLocation, originLat, originLng, destinationLocation, destinationLat, destinationLng])

  // Create activity markers and orange connecting polyline
  useEffect(() => {
    if (!map || !markerLib) return

    activityPolyline.current?.setMap(null)
    markersRef.current.forEach(m => { m.map = null })
    markersRef.current.clear()

    if (!activities.length) return

    if (activities.length > 1) {
      activityPolyline.current = new google.maps.Polyline({
        path: activities.map(a => ({ lat: a.lat, lng: a.lng })),
        geodesic: true,
        strokeColor: '#FF7043',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      })
    }

    activities.forEach(activity => {
      const isActive = activeActivity?.globalIndex === activity.globalIndex
      const pinEl = makePinElement(`${activity.globalIndex}`, isActive)

      const marker = new markerLib.AdvancedMarkerElement({
        position: { lat: activity.lat, lng: activity.lng },
        map,
        content: pinEl,
        title: activity.name,
        zIndex: isActive ? 10 : 5,
      })

      marker.addListener('click', () => {
        setActiveActivity({
          globalIndex: activity.globalIndex,
          lat: activity.lat,
          lng: activity.lng,
        })
      })

      markersRef.current.set(activity.globalIndex, marker)
    })

    return () => {
      activityPolyline.current?.setMap(null)
      markersRef.current.forEach(m => { m.map = null })
      markersRef.current.clear()
    }
  }, [map, markerLib, activities])

  // Update marker pin styles when activeActivity changes — no recreation needed
  useEffect(() => {
    if (!map) return
    activities.forEach(activity => {
      const marker = markersRef.current.get(activity.globalIndex)
      if (!marker) return
      const isActive = activeActivity?.globalIndex === activity.globalIndex
      const el = marker.content as HTMLElement
      el.style.width = isActive ? '36px' : '30px'
      el.style.height = isActive ? '36px' : '30px'
      el.style.background = isActive ? '#E64A19' : '#FF7043'
      el.style.fontSize = isActive ? '13px' : '11px'
      el.style.border = `${isActive ? 3 : 2}px solid white`
      marker.zIndex = isActive ? 10 : 5
    })
  }, [activeActivity, activities, map])

  return null
}
