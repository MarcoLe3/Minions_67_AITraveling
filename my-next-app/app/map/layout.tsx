'use client'
import MainMap from "@/components/Map/GoogleMap.tsx"
import { ItineraryProvider } from "@/Context/ItineraryContext"

export default function MapLayout({children}: {children: React.ReactNode}) {
    return(
        <ItineraryProvider>
            <main className="flex flex-col relative">
                <MainMap/>
                {children}
            </main>
        </ItineraryProvider>
    )
}
