"use client";

import React, { forwardRef, useRef } from "react";
import { AnimatedBeam } from "./magicui/animated-beam";

// Circle component for icons
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex items-center justify-center rounded-none border border-foreground/30 bg-accent/10 backdrop-blur p-3 shadow-sm text-foreground ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

// Node component for chain/wallet elements
const Node = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children?: React.ReactNode;
    isCenter?: boolean;
    isUnWallet?: boolean;
    isChain?: boolean;
  }
>(({ className, children, isCenter, isUnWallet, isChain }, ref) => {
  return (
    <div
      ref={ref}
      className={`z-10 flex items-center justify-center rounded-none border border-border ${
        isCenter
          ? "w-24 h-24 bg-foreground text-background shadow-lg"
          : isChain
          ? "w-32 h-32 bg-card/50 backdrop-blur shadow-sm"
          : "w-20 h-20 bg-card/50 backdrop-blur shadow-sm"
      } ${className || ""}`}
    >
      {isUnWallet ? (
        <img
          src="/logo-light.svg"
          alt="UnWallet"
          className="w-16 h-16 object-contain"
        />
      ) : isChain ? (
        <img
          src="/anychain.svg"
          alt="Any Chain"
          className="w-20 h-20 object-contain"
        />
      ) : (
        <span
          className={`text-center font-medium mono-text ${
            isCenter ? "text-sm" : "text-xs"
          }`}
          style={{ fontFamily: "var(--font-departure-mono)" }}
        >
          {children}
        </span>
      )}
    </div>
  );
});

Node.displayName = "Node";

const Beam = () => {
  const containerRef = useRef(null);

  // Left side refs
  const userLeftRef = useRef(null);
  const storeLeftRef = useRef(null);
  const botLeftRef = useRef(null);

  // Right side refs
  const userRightRef = useRef(null);
  const storeRightRef = useRef(null);
  const botRightRef = useRef(null);

  // Center chain refs
  const chainLeftRef = useRef(null);
  const unwalletRef = useRef(null);
  const chainRightRef = useRef(null);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full h-[500px] items-center justify-center overflow-hidden p-10"
    >
      <div className="flex w-full max-w-6xl items-center justify-between">
        {/* Left Side Icons */}
        <div className="flex flex-col gap-8">
          <Circle ref={userLeftRef} className="w-12 h-12">
            <UserIcon />
          </Circle>
          <Circle ref={storeLeftRef} className="w-12 h-12">
            <StoreIcon />
          </Circle>
          <Circle ref={botLeftRef} className="w-12 h-12">
            <BotIcon />
          </Circle>
        </div>

        {/* Center Chain Flow */}
        <div className="flex items-center gap-20">
          <Node ref={chainLeftRef} isChain>
            Any
            <br />
            Chain
          </Node>
          <Node ref={unwalletRef} isCenter isUnWallet>
            UnWallet
          </Node>
          <Node ref={chainRightRef} isChain>
            Any
            <br />
            Chain
          </Node>
        </div>

        {/* Right Side Icons */}
        <div className="flex flex-col gap-8">
          <Circle ref={storeRightRef} className="w-12 h-12">
            <StoreIcon />
          </Circle>
          <Circle ref={userRightRef} className="w-12 h-12">
            <UserIcon />
          </Circle>
          <Circle ref={botRightRef} className="w-12 h-12">
            <BotIcon />
          </Circle>
        </div>
      </div>

      {/* Animated Beams - Left to Chain */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userLeftRef}
        toRef={chainLeftRef}
        curvature={-30}
        pathColor="#ffffff"
        pathWidth={8}
        pathOpacity={0.05}
        duration={3}
        showTokens={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={storeLeftRef}
        toRef={chainLeftRef}
        curvature={0}
        pathColor="#ffffff"
        pathWidth={8}
        pathOpacity={0.05}
        duration={3.5}
        delay={0.5}
        showTokens={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={botLeftRef}
        toRef={chainLeftRef}
        curvature={30}
        pathColor="#ffffff"
        pathWidth={8}
        pathOpacity={0.05}
        duration={4}
        delay={1}
        showTokens={true}
      />

      {/* Center Chain Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={chainLeftRef}
        toRef={unwalletRef}
        pathColor="#ffffff"
        pathWidth={10}
        pathOpacity={0.08}
        duration={2}
        showTokens={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={unwalletRef}
        toRef={chainRightRef}
        pathColor="#ffffff"
        pathWidth={10}
        pathOpacity={0.08}
        duration={2}
        delay={0.3}
        showTokens={true}
      />

      {/* Animated Beams - Chain to Right */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={chainRightRef}
        toRef={storeRightRef}
        curvature={-30}
        pathColor="#ffffff"
        pathWidth={8}
        pathOpacity={0.05}
        duration={3}
        delay={1.2}
        showTokens={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={chainRightRef}
        toRef={userRightRef}
        curvature={0}
        pathColor="#ffffff"
        pathWidth={8}
        pathOpacity={0.05}
        duration={3.5}
        delay={1.5}
        showTokens={true}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={chainRightRef}
        toRef={botRightRef}
        curvature={30}
        pathColor="#ffffff"
        pathWidth={8}
        pathOpacity={0.05}
        duration={4}
        delay={1.8}
        showTokens={true}
      />

      {/* Reverse flow beams for bidirectional effect */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={unwalletRef}
        toRef={chainLeftRef}
        pathColor="#cccccc"
        pathWidth={6}
        pathOpacity={0.02}
        duration={2}
        reverse
        delay={1}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={chainRightRef}
        toRef={unwalletRef}
        pathColor="#cccccc"
        pathWidth={6}
        pathOpacity={0.02}
        duration={2}
        reverse
        delay={1.5}
      />
    </div>
  );
};

// Icon Components
const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const StoreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BotIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeLinecap="round" />
    <line x1="16" y1="16" x2="16" y2="16" strokeLinecap="round" />
  </svg>
);

export default Beam;
