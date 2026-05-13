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
  const size = active ? 34 : 28
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    `background:${active ? '#E64A19' : '#FF7043'}`,
    'border-radius:50%',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'color:white',
    'font-weight:700',
    `font-size:${active ? 13 : 11}px`,
    `border:${active ? '2.5px' : '2px'} solid white`,
    'cursor:pointer',
    `box-shadow:${active
      ? '0 0 0 3px rgba(230,74,25,0.25), 0 3px 10px rgba(0,0,0,0.3)'
      : '0 2px 6px rgba(0,0,0,0.25)'}`,
    'transition:all 0.15s ease',
    'font-family:sans-serif',
    'letter-spacing:-0.3px',
    'user-select:none',
  ].join(';')
  el.textContent = label
  return el
}

export default function MapRenderDirections({ activities }: RouteComponentProp) {
  const map = useMap()
  const markerLib = useMapsLibrary('marker')
  const { activeActivity, setActiveActivity } = useItinerary()

  const connectorRef = useRef<google.maps.Polyline | null>(null)
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map())

  // Build connector line and numbered pins whenever the activity list changes
  useEffect(() => {
    if (!map || !markerLib) return

    connectorRef.current?.setMap(null)
    markersRef.current.forEach(m => { m.map = null })
    markersRef.current.clear()

    if (!activities.length) return

    // Subtle dashed connector — shows order without competing with the pins
    if (activities.length > 1) {
      connectorRef.current = new google.maps.Polyline({
        path: activities.map(a => ({ lat: a.lat, lng: a.lng })),
        geodesic: true,
        strokeOpacity: 0,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 0.5,
              strokeColor: '#FF7043',
              strokeWeight: 2,
              scale: 3,
            },
            offset: '0',
            repeat: '10px',
          },
        ],
        map,
        zIndex: 1,
      })
    }

    // Numbered pins
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

      marker.addListener('click', () =>
        setActiveActivity({ globalIndex: activity.globalIndex, lat: activity.lat, lng: activity.lng })
      )

      markersRef.current.set(activity.globalIndex, marker)
    })

    return () => {
      connectorRef.current?.setMap(null)
      markersRef.current.forEach(m => { m.map = null })
      markersRef.current.clear()
    }
  }, [map, markerLib, activities])

  // Update pin appearance on selection — no full recreation
  useEffect(() => {
    if (!map) return
    activities.forEach(activity => {
      const marker = markersRef.current.get(activity.globalIndex)
      if (!marker) return
      const isActive = activeActivity?.globalIndex === activity.globalIndex
      const el = marker.content as HTMLElement
      const size = isActive ? 34 : 28
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.background = isActive ? '#E64A19' : '#FF7043'
      el.style.fontSize = isActive ? '13px' : '11px'
      el.style.border = `${isActive ? '2.5px' : '2px'} solid white`
      el.style.boxShadow = isActive
        ? '0 0 0 3px rgba(230,74,25,0.25), 0 3px 10px rgba(0,0,0,0.3)'
        : '0 2px 6px rgba(0,0,0,0.25)'
      marker.zIndex = isActive ? 10 : 5
    })
  }, [activeActivity, activities, map])

  return null
}
