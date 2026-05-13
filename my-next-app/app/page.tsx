import DestinationForm from "@/components/Form/DestinationForm.tsx"
import { RecommendCard } from "@/components/Card/RecommendCard.tsx"
import { MapPin, Sparkles, TrendingUp, Clock } from "lucide-react"

const stats = [
  { value: "150+", label: "Destinations", icon: MapPin },
  { value: "AI", label: "Powered Planning", icon: Sparkles },
  { value: "Real-time", label: "Pricing Data", icon: TrendingUp },
  { value: "24/7", label: "Trip Support", icon: Clock },
]

export default async function Home() {
  const { default: recommendedLocation } = await import("@/json/recommended-location.json");

  return (
    <main className="flex flex-col items-center w-full">

      {/* ── Full-screen Hero ─────────────────────────────────── */}
      <section
        aria-label="Hero"
        className="relative w-full h-screen flex flex-col items-center justify-center bg-cover bg-center bg-[url(/vocation.jpg)]"
      >
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60 pointer-events-none" />

        {/* hero content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-3xl">
          <span className="text-white/70 uppercase tracking-[0.25em] text-xs font-semibold">
            AI-Powered Travel Planning
          </span>

          <h1 className="text-8xl text-white font-bold leading-none drop-shadow-2xl">
            Travel Easy
          </h1>

          <p className="text-xl text-white/85 max-w-xl font-light leading-relaxed">
            Plan your perfect trip with real-time pricing, destination insights,
            and personalised itineraries — all powered by AI.
          </p>

          <DestinationForm />
        </div>

        {/* scroll nudge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 select-none">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-white/35 animate-pulse" />
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <section aria-label="Key stats" className="w-full bg-white border-y border-gray-100 py-12">
        <ul className="flex justify-around items-center max-w-4xl mx-auto list-none gap-6 flex-wrap">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <li key={label} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
                <div className="text-sm text-gray-400 mt-0.5">{label}</div>
              </div>
              {i < stats.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-gray-200 ml-4" />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Trips we recommend ───────────────────────────────── */}
      <section aria-label="Recommended destinations" className="w-full flex flex-col items-center gap-12 py-24 px-6 bg-white">
        <div className="flex flex-col items-center gap-4 text-center max-w-xl">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-blue-500 font-semibold bg-blue-50 px-3 py-1.5 rounded-full">
            <Sparkles size={12} />
            Handpicked for you
          </span>
          <h2 className="text-5xl font-bold text-gray-900 leading-tight">Trips we recommend</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Smart Travel puts you in control — connect destination data, real-time
            pricing, and currency shifts to plan and book your entire trip.
          </p>
        </div>

        <ul className="flex gap-6 list-none flex-wrap justify-center">
          {Object.entries(recommendedLocation).map(([key, value]) => (
            <li key={key}>
              <RecommendCard
                title={value.title}
                location={value.location}
                image={value.image}
                lat={value.lat}
                lng={value.lng}
                bgColor={value.bgColor}
                titleColor={value.titleColor}
                locationColor={value.locationColor}
              />
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
