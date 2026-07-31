"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import ScrollStack, { ScrollStackItem } from "./scroll-stack";
import {
  BentoSection,
  SystemArchitecture,
  SwapAmmMechanism,
} from "./story-sections";

// Film grain SVG background overlay styling matching LaxStell
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.35 0.35 0.35 0 -0.36'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

const STACK = [
  {
    n: "01",
    label: "public ledger",
    coord: "[ every block · forever ]",
    title: "public chains remember everything.",
    body: "every block on an open chain is permanent, public and linkable. amounts, balances, counterparties: readable by anyone with the address, forever. the ledger never forgets.",
    src: "/Assets/Images/Background/hourglass.webp",
    poster: "/Assets/Images/Background/hourglass-poster.webp",
    flip: false,
  },
  {
    n: "02",
    label: "vault aggregator",
    coord: "[ confidential yield · smart routing ]",
    title: "automatic yield & private routing.",
    body: "deposits are sent to optimal yield routes across Arbitrum while shielding details. Nox gateways matched with TEE secure enclaves process the funds off-chain and compound yield without exposing user identities or allocations.",
    src: "/Assets/Images/Background/vortex.webp",
    poster: "/Assets/Images/Background/vortex-poster.webp",
    flip: true,
  },
  {
    n: "03",
    label: "shielded pool",
    coord: "[ Poseidon2 · Merkle ]",
    title: "the shielded layer forgets.",
    body: "wrap your public USDC, RLC, or WETH into cUSDC, cRLC, or cWETH, committing your assets into a secure Merkle tree. amount and owner stay inside the hash; only the root is ever public, and old notes never link to new.",
    src: "/Assets/Images/Background/balance.webp",
    poster: "/Assets/Images/Background/balance-poster.webp",
    flip: false,
  },
  {
    n: "04",
    label: "proven math",
    coord: "[ UltraHonk · BN254 ]",
    title: "the math is the lock.",
    body: "every move out is a zero-knowledge proof, checked on-chain inside an Arbitrum smart contract. a spend reveals only a nullifier, so the old note and the new never link. no valid proof, no funds move.",
    src: "/Assets/Images/Background/cube.webp",
    poster: "/Assets/Images/Background/cube-poster.webp",
    flip: true,
  },
];

const MODULES = [
  {
    k: "DEPOSIT / WITHDRAW",
    d: "USDC & RLC in, BLS-verified and wrapped to cToken.",
    to: "/earn",
  },
  {
    k: "PORTFOLIO",
    d: "private multi-asset balances only you can see.",
    to: "/portfolio",
  },
  {
    k: "SWAP",
    d: "a zero-knowledge dark pool; swaps executed privately.",
    to: "/swap",
  },
  {
    k: "FAUCET",
    d: "request instant mock testnet funds in one click.",
    to: "/faucet",
  },
];

function LoopAsset({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  return (
    <picture className="contents">
      <source media="(prefers-reduced-motion: reduce)" srcSet={poster} />
      <img src={src} alt="" aria-hidden className={className} />
    </picture>
  );
}

function Label({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] ${className}`}
    >
      {children}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section
      className="relative w-full overflow-hidden px-6 py-24 sm:px-8 md:py-32 transition-colors duration-300"
      style={{
        backgroundColor: "var(--color-canvas)",
        color: "var(--color-text)",
      }}
    >
      {/* Film grain backdrop overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20 dark:opacity-25"
        style={{
          backgroundImage: GRAIN,
          backgroundSize: "90px 90px",
          maskImage: "linear-gradient(to bottom, transparent, #000 16rem)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, #000 16rem)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Intro */}
        <Label>
          <span className="text-main/80">public ledger</span>
          <span aria-hidden className="text-brand">
            →
          </span>
          <span className="text-main/80">shielded layer</span>
        </Label>
        <h2 className="mt-8 max-w-3xl font-sans text-3xl font-bold lowercase leading-none tracking-tight text-main sm:text-4xl md:text-5xl">
          public chains remember everything.{" "}
          <span className="text-muted">the shielded layer forgets.</span>
        </h2>

        {/* Narrative Card Stack */}
        <div className="mt-14 md:mt-16">
          <ScrollStack
            useWindowScroll
            itemDistance={280}
            itemStackDistance={44}
            stackPosition="14%"
            scaleEndPosition="6%"
            baseScale={0.88}
            itemScale={0.04}
            blurAmount={0}
          >
            {STACK.map((s) => (
              <ScrollStackItem
                key={s.n}
                itemClassName={`flex min-h-[72vh] items-center rounded-[1.75rem] border px-6 py-12 sm:px-14 sm:py-16 transition-colors duration-300 shadow-2xl`}
                style={{
                  borderColor: "var(--color-line)",
                  backgroundColor: "var(--color-surface-2)",
                }}
              >
                <div className="grid w-full grid-cols-1 items-center gap-x-12 gap-y-8 md:grid-cols-2">
                  <div
                    className={`mx-auto w-[clamp(210px,32vw,380px)] ${s.flip ? "md:order-1" : "md:order-2"}`}
                  >
                    <LoopAsset
                      src={s.src}
                      poster={s.poster}
                      className="block w-full object-contain"
                    />
                  </div>
                  <div
                    className={`max-w-md ${s.flip ? "md:order-2" : "md:order-1"}`}
                  >
                    <Label>
                      <span className="text-main">
                        {s.n} · {s.label}
                      </span>
                      <span className="text-brand">{s.coord}</span>
                    </Label>
                    <h3 className="mt-5 font-sans text-2xl font-bold lowercase leading-tight tracking-tight text-main">
                      {s.title}
                    </h3>
                    <p className="mt-5 text-sm leading-relaxed text-muted">
                      {s.body}
                    </p>
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>

        {/* Bento platform grid */}
        <BentoSection />

        {/* System architecture lock diagram */}
        <SystemArchitecture />

        {/* Swap/AMM constant product mechanism */}
        <SwapAmmMechanism />

        {/* Module CTA card */}
        <div
          className="relative mt-8 border px-6 py-10 sm:px-10 sm:py-12"
          style={{
            borderColor: "var(--color-line)",
            backgroundColor: "var(--color-surface-1)",
          }}
        >
          <div
            className="grid grid-cols-2 gap-px overflow-hidden border bg-line sm:grid-cols-4"
            style={{ borderColor: "var(--color-line)" }}
          >
            {MODULES.map((m) => (
              <Link
                key={m.k}
                href={m.to}
                className="group block px-5 py-7 transition"
                style={{ backgroundColor: "var(--color-surface-2)" }}
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-main">
                  {m.k}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">{m.d}</p>
                <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-brand transition-colors group-hover:text-brand/80">
                  open →
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/earn"
            className="inline-block mt-10 font-mono text-[12px] uppercase tracking-[0.18em] text-brand transition hover:text-brand/80"
          >
            enter the shielded layer →
          </Link>
        </div>
      </div>
    </section>
  );
}
