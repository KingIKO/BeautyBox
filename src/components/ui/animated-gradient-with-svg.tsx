"use client";

import React, { useId, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useDimensions } from "@/components/hooks/use-debounced-dimensions";

interface AnimatedGradientProps {
  colors: string[];
  speed?: number;
  blur?: "light" | "medium" | "heavy";
  className?: string;
}

const BLUR_VALUES = {
  light: 50,
  medium: 80,
  heavy: 120,
};

function generateRandomTransforms() {
  return {
    tx1: `${Math.random() * 40 - 20}%`,
    ty1: `${Math.random() * 40 - 20}%`,
    tx2: `${Math.random() * 40 - 20}%`,
    ty2: `${Math.random() * 40 - 20}%`,
    tx3: `${Math.random() * 40 - 20}%`,
    ty3: `${Math.random() * 40 - 20}%`,
    tx4: `${Math.random() * 40 - 20}%`,
    ty4: `${Math.random() * 40 - 20}%`,
    opacity1: (0.5 + Math.random() * 0.3).toFixed(2),
    opacity2: (0.4 + Math.random() * 0.4).toFixed(2),
    opacity3: (0.5 + Math.random() * 0.3).toFixed(2),
    opacity4: (0.4 + Math.random() * 0.4).toFixed(2),
  };
}

export function AnimatedGradient({
  colors,
  speed = 5,
  blur = "medium",
  className,
}: AnimatedGradientProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(containerRef);

  const blurValue = BLUR_VALUES[blur];
  const duration = 20 / speed; // speed=5 -> 4s, speed=0.05 -> 400s

  const circles = useMemo(
    () =>
      colors.map((color, i) => ({
        color,
        transforms: generateRandomTransforms(),
        delay: -(duration / colors.length) * i,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors.join(","), duration]
  );

  const circleSize = Math.max(dimensions.width, dimensions.height) * 0.6;

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      {dimensions.width > 0 && (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <defs>
            <filter id={`${id}-blur`}>
              <feGaussianBlur stdDeviation={blurValue} />
            </filter>
          </defs>
          {circles.map((circle, i) => (
            <circle
              key={`${id}-circle-${i}`}
              cx={dimensions.width / 2}
              cy={dimensions.height / 2}
              r={circleSize / 2}
              fill={circle.color}
              filter={`url(#${id}-blur)`}
              className="animate-background-gradient"
              style={
                {
                  "--tx-1": circle.transforms.tx1,
                  "--ty-1": circle.transforms.ty1,
                  "--tx-2": circle.transforms.tx2,
                  "--ty-2": circle.transforms.ty2,
                  "--tx-3": circle.transforms.tx3,
                  "--ty-3": circle.transforms.ty3,
                  "--tx-4": circle.transforms.tx4,
                  "--ty-4": circle.transforms.ty4,
                  "--opacity-1": circle.transforms.opacity1,
                  "--opacity-2": circle.transforms.opacity2,
                  "--opacity-3": circle.transforms.opacity3,
                  "--opacity-4": circle.transforms.opacity4,
                  "--duration": `${duration}s`,
                  animationDelay: `${circle.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </svg>
      )}
    </div>
  );
}
