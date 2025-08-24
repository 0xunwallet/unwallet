"use client";

import { motion } from "motion/react";
import { RefObject, useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>; // Container ref
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  showTokens?: boolean;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false, // Include the reverse prop
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  showTokens = false,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
  const [pathLength, setPathLength] = useState(0);

  // Calculate the gradient coordinates based on the reverse prop
  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`;
        setPathD(d);

        // Calculate approximate path length for token positioning
        const dx = endX - startX;
        const dy = endY - startY;
        const controlX = (startX + endX) / 2;
        const controlDx = controlX - startX;
        const controlDy = controlY - startY;

        // Approximate length of quadratic curve
        const length =
          Math.sqrt(dx * dx + dy * dy) +
          Math.sqrt(controlDx * controlDx + controlDy * controlDy);
        setPathLength(length);
      }
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      // For all entries, recalculate the path
      for (const entry of entries) {
        updatePath();
      }
    });

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Call the updatePath initially to set the initial path
    updatePath();

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu z-0",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth + 2}
        stroke="#ffffff"
        strokeOpacity="0.03"
        strokeLinecap="round"
      />

      {/* Animated Token Symbols */}
      {showTokens && pathD && (
        <>
          {/* First token - DAI */}
          <image href="/tokens/dai.png" width="32" height="32" x="-16" y="-16">
            <animateMotion
              dur={`${duration * 0.8}s`}
              repeatCount="indefinite"
              begin={`${delay + 0.5}s`}
            >
              <mpath href={`#${id}-path`} />
            </animateMotion>
          </image>

          {/* Second token - USDC */}
          <image href="/tokens/usdc.png" width="28" height="28" x="-14" y="-14">
            <animateMotion
              dur={`${duration * 0.8}s`}
              repeatCount="indefinite"
              begin={`${delay + 1.5}s`}
            >
              <mpath href={`#${id}-path`} />
            </animateMotion>
          </image>

          {/* Third token - USDT */}
          <image href="/tokens/usdt.png" width="24" height="24" x="-12" y="-12">
            <animateMotion
              dur={`${duration * 0.8}s`}
              repeatCount="indefinite"
              begin={`${delay + 2.5}s`}
            >
              <mpath href={`#${id}-path`} />
            </animateMotion>
          </image>
        </>
      )}

      <defs>
        {/* Hidden path for token animation */}
        {showTokens && (
          <path
            id={`${id}-path`}
            d={pathD}
            fill="none"
            style={{ visibility: "hidden" }}
          />
        )}
      </defs>
    </svg>
  );
};
