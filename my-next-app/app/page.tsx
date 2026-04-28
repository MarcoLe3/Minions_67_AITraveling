import DestinationForm from "@/components/Form/DestinationForm.tsx"
import { RecommendCard } from "@/components/Card/RecommendCard.tsx"

export default async function Home() {
  const { default: recommendedLocation } = await import("@/json/recommended-location.json");

  return (
    <main className="flex flex-col items-center w-full gap-10 pt-10 pb-10">
      <section
        aria-label="Hero"
        className="flex flex-col items-center gap-10 justify-center w-[70vw] h-[80vh] rounded-4xl pt-20 bg-cover bg-center bg-[url(/vocation.jpg)]"
      >
        <h1 className="text-7xl text-white font-semibold">Travel Easy</h1>
        <DestinationForm />
      </section>

      <section
        aria-label="Introduction"
        className="w-full justify-center flex p-4 text-center"
      >
        <div className="w-auto max-w-[40vw] flex flex-col gap-10 items-center">
          <h2 className="text-5xl font-semibold">Trips we recommend</h2>
          <p className="text-2xl ">
            Smart Travel puts you in control. Easily connect destination data,
            real-time pricing, and currency shifts to plan, budget, and book
            your entire trip. Powered by AI, this agent understands how you
            travel and just makes it all work.
          </p>
        </div>
      </section>
      <section aria-label="Recommended destinations">
        <ul className="flex gap-4 w-[70vw] list-none">
          {Object.entries(recommendedLocation).map(([key, value]) => (
            <li key={key}>
              <RecommendCard
                title={value.title}
                location={value.location}
                image={value.image}
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