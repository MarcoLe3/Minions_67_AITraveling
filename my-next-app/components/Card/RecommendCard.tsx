"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext } from "react";

interface RecommendCardProp {
  title: string;
  location: string;
  image: string;
  bgColor: string;
  titleColor: string;
  locationColor: string;
}

const ThemeContext = createContext<string>("");

function LearnMore() {
  const title = useContext(ThemeContext);

  return (
    <Link
      aria-label={`Learn more about ${title}`}
      className="
        flex gap-2 items-center justify-center
        bg-[#4285F4] hover:bg-[#3066be] hover:shadow-xl
        text-white w-fit h-fit
        px-3 py-2 rounded-3xl
        font-semibold cursor-pointer
        transition-colors duration-200
      "
      href={`/map/${title}`}
    >
      Learn more
      <Image
        alt=""
        aria-hidden="true"
        src="/arrow-right.svg"
        width={20}
        height={20}
      />
    </Link>
  );
}

export function RecommendCard({
  title,
  location,
  image,
  bgColor,
  titleColor,
  locationColor,
}: RecommendCardProp) {
  return (
    <ThemeContext value={title}>
      <article
        style={{ backgroundColor: bgColor }}
        className="flex flex-col gap-4 p-4 rounded-2xl"
        aria-label={`${title} in ${location}`}
        itemScope
      >
        <header className="flex justify-between gap-4 items-start">
          <div>
            <h2
              style={{ color: titleColor }}
              className="text-xl font-semibold"
              itemProp="name"
            >
              {title}
            </h2>
            <address
              style={{ color: locationColor }}
              className="text-md not-italic"
              itemProp="address"
            >
              {location}
            </address>
          </div>

          <LearnMore />
        </header>

        <figure className="">
          <Image
            alt={`${title}, ${location}`}
            src={image}
            width={400}
            height={350}
            className="rounded-2xl w-full h-auto"
            loading="lazy"
            decoding="async"
            itemProp="image"
          />
        </figure>
      </article>
    </ThemeContext>
  );
}