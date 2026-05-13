'use client'
import MainMap from "@/components/Map/GoogleMap.tsx"
import { ItineraryProvider } from "@/Context/ItineraryContext"
import { APIProvider } from "@vis.gl/react-google-maps"

export default function MapLayout({children}: {children: React.ReactNode}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string
  return (
    <ItineraryProvider>
      <APIProvider apiKey={apiKey}>
        <main className="flex flex-col relative">
          <MainMap />
          {children}
        </main>
      </APIProvider>
    </ItineraryProvider>
  )
}
