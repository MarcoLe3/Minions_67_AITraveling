"use client";

import Image from "next/image";
import { MapPin, Loader2 } from "lucide-react";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/Context/PostProvider";

interface RecommendCardProp {
  title: string;
  location: string;
  image: string;
  lat: number;
  lng: number;
  bgColor: string;
  titleColor: string;
  locationColor: string;
}

const SF = { name: "San Francisco", lat: 37.7749, lng: -122.4194 };

interface DestCtx {
  title: string;
  lat: number;
  lng: number;
}
const DestContext = createContext<DestCtx>({ title: "", lat: 0, lng: 0 });

function ExploreButton() {
  const { title, lat, lng } = useContext(DestContext);
  const { sendDataToServer, loading } = usePostContext();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (pending || loading) return;
    setPending(true);
    const result = await sendDataToServer({
      paths: [[SF, { name: title, lat, lng }]],
      budget: 1000,
      days: 7,
    });
    setPending(false);
    if (result?.success) {
      router.push("/map/demoMap");
    } else {
      alert(`Could not load trip: ${result?.error || "Unknown error"}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={`Explore ${title}`}
      className="
        self-start mt-3
        inline-flex items-center gap-1.5
        bg-white/20 hover:bg-white/35 disabled:opacity-60 backdrop-blur-sm
        text-white text-sm font-semibold
        px-4 py-2 rounded-full border border-white/30
        transition-all duration-200 cursor-pointer disabled:cursor-not-allowed
      "
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Loading…
        </>
      ) : (
        <>
          Explore
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </>
      )}
    </button>
  );
}

export function RecommendCard({
  title,
  location,
  image,
  lat,
  lng,
}: RecommendCardProp) {
  return (
    <DestContext value={{ title, lat, lng }}>
      <article
        className="relative w-72 h-96 rounded-3xl overflow-hidden group cursor-pointer shadow-lg transition-all duration-400 hover:scale-[1.03] hover:shadow-2xl"
        aria-label={`${title} in ${location}`}
        itemScope
      >
        <Image
          alt={`${title}, ${location}`}
          src={image}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          itemProp="image"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h2 className="text-2xl font-bold text-white leading-tight" itemProp="name">
            {title}
          </h2>
          <address className="flex items-center gap-1 not-italic text-white/70 text-sm mt-1" itemProp="address">
            <MapPin size={13} />
            {location}
          </address>
          <ExploreButton />
        </div>
      </article>
    </DestContext>
  );
}
