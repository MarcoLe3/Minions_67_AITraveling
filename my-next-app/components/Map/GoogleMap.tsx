'use client'
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps"
import { useEffect } from "react"
import MapRenderDirections from "@/components/Map/MapLines"
import { useItinerary } from "@/Context/ItineraryContext"

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

export default function MainMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API
  const mapId = process.env.NEXT_PUBLIC_MAP_ID
  const { activities, days } = useItinerary()

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
          defaultZoom={11}
          mapId={mapId}
          disableDefaultUI={true}
        >
          <MapPanToActivity />
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
