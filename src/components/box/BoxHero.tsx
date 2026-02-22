"use client";

import Image from "next/image";

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
    <section className="relative w-full min-h-[240px] sm:min-h-[320px] flex items-end overflow-hidden rounded-xl">
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
        <div
          className="absolute inset-0 bg-gradient-to-br from-pink-200 via-rose-300 to-amber-200"
          aria-hidden="true"
        />
      )}

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
        aria-hidden="true"
      />

      {/* Text content */}
      <div className="relative z-10 w-full px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-white/85 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
