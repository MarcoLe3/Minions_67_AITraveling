import MainMap from "@/components/Map/GoogleMap.tsx"

export default function MapLayout({children}: {children: React.ReactNode}) {
    return(
        <main
            className="flex flex-col relative"
        >
            <MainMap/>
            {children}
        </main>
    )
}