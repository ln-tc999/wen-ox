"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiShield } from "react-icons/fi";
import { FluidVolume, ScrambleCycle } from "@/components/ui";

function ChartBackground() {
  const fade =
    "radial-gradient(125% 105% at 50% 46%, #000 40%, transparent 100%)";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      <div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "192px 138px",
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />

      <ul className="absolute inset-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/60">
        <li className="absolute left-[5%] top-[45%] hidden sm:block">
          <span className="block text-main/80 font-semibold">
            <ScrambleCycle
              words={["Network Status"]}
              duration={620}
              glitch={false}
              once
            />
          </span>
          <span className="block">
            [{" "}
            <ScrambleCycle
              words={["Arbitrum Sepolia · 421614"]}
              duration={900}
              glitch={false}
              once
            />{" "}
            ]
          </span>
        </li>
        <li className="absolute right-[5%] top-[38%] text-right hidden sm:block">
          <span className="block text-main/80 font-semibold">
            <ScrambleCycle
              words={["Confidential Enclave"]}
              duration={820}
              glitch={false}
              once
            />
          </span>
          <span className="block">
            [{" "}
            <ScrambleCycle
              words={["iExec Nox Protocol · TEE"]}
              duration={1150}
              glitch={false}
              once
            />{" "}
            ]
          </span>
        </li>
        <li className="absolute bottom-[16%] left-1/2 -translate-x-1/2 text-center hidden md:block">
          <span className="block text-main/80 font-semibold">
            <ScrambleCycle
              words={["Shielded Tokens"]}
              duration={1040}
              glitch={false}
              once
            />
          </span>
          <span className="block">
            [{" "}
            <ScrambleCycle
              words={["ERC-7984 · cUSDC & cRLC"]}
              duration={1400}
              glitch={false}
              once
            />{" "}
            ]
          </span>
        </li>
      </ul>
    </div>
  );
}

function YieldBar({
  height,
  delay,
  inView,
}: {
  height: number;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      className="flex-1 origin-bottom rounded-t"
      style={{
        height: `${height}%`,
        backgroundColor: "var(--color-brand)",
        opacity: 0.35,
      }}
      initial={{ scaleY: 0 }}
      animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    />
  );
}

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1400;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span className="text-2xl font-bold tabular-nums text-main">
      {value}
      {suffix}
    </span>
  );
}

function YieldChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const bars = [
    { id: "b0", height: 30, delay: 0 },
    { id: "b1", height: 45, delay: 0.07 },
    { id: "b2", height: 38, delay: 0.14 },
    { id: "b3", height: 58, delay: 0.21 },
    { id: "b4", height: 50, delay: 0.28 },
    { id: "b5", height: 72, delay: 0.35 },
    { id: "b6", height: 65, delay: 0.42 },
    { id: "b7", height: 85, delay: 0.49 },
    { id: "b8", height: 70, delay: 0.56 },
    { id: "b9", height: 80, delay: 0.63 },
  ];

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-main bg-surface p-6 shadow-xl backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-main bg-surface-muted px-3 py-1.5 text-xs font-semibold text-main">
          <FiShield className="h-3.5 w-3.5 text-brand" />
          <span>TEE Enclave Active</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.div
            className="pointer-events-none select-none"
            initial={{ x: 40, opacity: 0, scale: 0.6 }}
            animate={
              inView
                ? { x: 0, opacity: 1, scale: 1 }
                : { x: 40, opacity: 0, scale: 0.6 }
            }
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <Image
              src="/Assets/Images/Logo-DeFi/morpho-logo.webp"
              alt="Morpho"
              width={36}
              height={36}
              className="rounded-full shadow-md"
            />
          </motion.div>
          <AnimatedCounter target={12} suffix="%" inView={inView} />
          <span className="text-xs text-faint font-semibold">APY</span>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute right-5 top-16 select-none"
        initial={{ y: -30, opacity: 0, scale: 0.5 }}
        animate={
          inView
            ? { y: 0, opacity: 1, scale: 1 }
            : { y: -30, opacity: 0, scale: 0.5 }
        }
        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
      >
        <Image
          src="/Assets/Images/Logo-DeFi/aave-logo.svg"
          alt="Aave"
          width={28}
          height={28}
          className="rounded-full shadow-md"
        />
      </motion.div>

      <div className="relative flex flex-1 items-end justify-between gap-2 px-1 min-h-[160px]">
        {bars.map((bar) => (
          <YieldBar
            key={bar.id}
            height={bar.height}
            delay={bar.delay}
            inView={inView}
          />
        ))}
        <motion.div
          className="pointer-events-none absolute bottom-3 right-6 select-none"
          initial={{ x: -30, y: 20, opacity: 0, scale: 0.5 }}
          animate={
            inView
              ? { x: 0, y: 0, opacity: 1, scale: 1 }
              : { x: -30, y: 20, opacity: 0, scale: 0.5 }
          }
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
        >
          <Image
            src="/Assets/Images/Logo-DeFi/euler-finance-logo.svg"
            alt="Euler"
            width={40}
            height={40}
            className="rounded-full shadow-md"
          />
        </motion.div>
      </div>

      <div className="mt-4 border-t border-main pt-3 flex items-center justify-between text-xs text-muted">
        <span>Confidential Strategy</span>
        <span className="font-semibold text-brand">Arbitrum Sepolia</span>
      </div>
    </div>
  );
}

const ROTATING_KEYWORDS = [
  "confidential",
  "encrypted",
  "unlinkable",
  "verified",
  "yours",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center pt-28 pb-12 md:pt-36 md:pb-20">
      {/* Volumetric Raymarching Fluid Backdrop */}
      <div className="absolute inset-0 opacity-40 dark:opacity-50">
        <FluidVolume
          baseColor="#f5c219"
          background="#0d0e0f"
          quality="high"
          shape="plumes"
        />
      </div>

      {/* Film Grain Texture Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-25"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0.45 0.45 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: "90px 90px",
        }}
      />

      {/* Chart Hairline Grid */}
      <ChartBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-6 w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: LaxStell Scramble Title & CTA */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-main bg-surface px-4 py-1.5 text-xs font-semibold text-main mb-6 shadow-xs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span>Nox Protocol & TEE Integration</span>
            </motion.div>

            <motion.h1
              className="font-sans text-4xl font-bold uppercase leading-[1.05] tracking-tight text-main sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block">Confidential Yield</span>
              <span className="block text-muted">That Stays</span>
              <span className="block text-brand">
                <ScrambleCycle words={ROTATING_KEYWORDS} />
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Confidential yield farming powered by iExec Nox & TEE compute.
              Secure your assets with ERC-7984 tokens and discover top routes —
              keeping your balances hidden on-chain.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/earn"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white transition-all hover-brand shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch App</span>
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/swap"
                className="inline-flex items-center gap-2 rounded-full border border-main bg-surface px-8 py-3.5 text-sm font-semibold text-main transition-colors hover:border-strong hover:bg-surface-raised"
              >
                <span>Private Swap</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Interactive Yield Visual Card */}
          <motion.div
            className="w-full lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="w-full max-w-md aspect-[4/3]">
              <YieldChart />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
