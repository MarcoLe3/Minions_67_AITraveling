'use client'
import MainMap from "@/components/Map/GoogleMap.tsx"
import { ActiveDayProvider } from "@/Context/ActiveDayContext"

export default function MapLayout({children}: {children: React.ReactNode}) {
    return(
        <ActiveDayProvider>
        <main
            className="flex flex-col relative"
        >
            <MainMap/>
            {children}
        </main>
        </ActiveDayProvider>
    )
}