"use client";

import { useState, useCallback, useEffect, type RefObject } from "react";

interface Dimensions {
  width: number;
  height: number;
}

export function useDimensions(ref: RefObject<HTMLElement | null>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      setDimensions({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      });
    }
  }, [ref]);

  useEffect(() => {
    updateDimensions();

    let timeoutId: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [ref, updateDimensions]);

  return dimensions;
}
