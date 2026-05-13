'use client'
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps"
import { useEffect } from "react"
import MapRenderDirections from "@/components/Map/MapLines"
import JourneyRoute from "@/components/Map/JourneyRoute"
import { useItinerary, Journey } from "@/Context/ItineraryContext"

function MapPanToActivity() {
  const map = useMap()
  const { activeActivity } = useItinerary()

  useEffect(() => {
    if (!map || !activeActivity) return
    map.panTo({ lat: activeActivity.lat, lng: activeActivity.lng })
    map.setZoom(15)
  }, [map, activeActivity])

  return null
}

function MapFitJourneys() {
  const map = useMap()
  const { journeys } = useItinerary()

  useEffect(() => {
    if (!map || !journeys.length) return

    const bounds = new google.maps.LatLngBounds()
    journeys.forEach(j => {
      if (j.origin_lat && j.origin_lng) bounds.extend({ lat: j.origin_lat, lng: j.origin_lng })
      if (j.destination_lat && j.destination_lng) bounds.extend({ lat: j.destination_lat, lng: j.destination_lng })
    })
    if (bounds.isEmpty()) return

    // Pad left to clear the 350px itinerary panel, generous top/bottom for the arc bulge
    const padding = { top: 100, right: 80, bottom: 80, left: 420 }

    // fitBounds before tiles load can be overridden by the map's initial render.
    // Wait for the first 'idle' event so the viewport is fully settled.
    const listener = map.addListener('idle', () => {
      map.fitBounds(bounds, padding)
      google.maps.event.removeListener(listener)
    })

    // Also call immediately for cases where the map is already idle
    map.fitBounds(bounds, padding)

    return () => google.maps.event.removeListener(listener)
  }, [map, journeys])

  return null
}

export default function MainMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API
  const mapId = process.env.NEXT_PUBLIC_MAP_ID
  const { activities, days, journeys } = useItinerary()

  const activitiesByDay = days.map((_: any, dayIdx: number) =>
    activities.filter(a => a.dayIndex === dayIdx)
  )

  const defaultCenter =
    days[0]?.origin_lat
      ? { lat: days[0].origin_lat, lng: days[0].origin_lng }
      : { lat: 37.7749, lng: -122.4194 }

  return (
    <APIProvider apiKey={apiKey as string}>
      <div style={{ height: '100vh', width: '100%' }}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={5}
          mapId={mapId}
          disableDefaultUI={true}
        >
          <MapPanToActivity />
          <MapFitJourneys />

          {/* Intercity journey arcs (e.g. London → Paris) */}
          {journeys.map((j: Journey, i: number) =>
            j.origin_lat && j.origin_lng && j.destination_lat && j.destination_lng ? (
              <JourneyRoute
                key={i}
                origin={j.origin}
                originLat={j.origin_lat}
                originLng={j.origin_lng}
                destination={j.destination}
                destinationLat={j.destination_lat}
                destinationLng={j.destination_lng}
              />
            ) : null
          )}

          {/* Per-day intra-city routes and activity pins */}
          {days.map((day: any, index: number) => (
            <MapRenderDirections
              key={index}
              index={index + 1}
              originLocation={day.origin}
              originLat={day.origin_lat}
              originLng={day.origin_lng}
              destinationLocation={day.destination}
              destinationLat={day.destination_lat}
              destinationLng={day.destination_lng}
              activities={activitiesByDay[index] ?? []}
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  )
}
