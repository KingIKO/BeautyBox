"use client";

import Image from "next/image";
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg";

interface BoxHeroProps {
  title: string;
  description: string | null;
  coverImage: string | null;
}

export default function BoxHero({
  title,
  description,
  coverImage,
}: BoxHeroProps) {
  return (
    <section className="relative w-full min-h-[260px] sm:min-h-[360px] flex items-end overflow-hidden rounded-3xl">
      {/* Background */}
      {coverImage ? (
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <AnimatedGradient colors={["#fb7185", "#f9a8d4", "#fcd34d"]} speed={0.05} blur="medium" />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
        aria-hidden="true"
      />

      {/* Text content */}
      <div className="relative z-10 w-full px-7 py-10 sm:px-10 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
