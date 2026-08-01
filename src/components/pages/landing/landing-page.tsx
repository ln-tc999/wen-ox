"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useDepositStore } from "@/stores"; // dummy or actual hooks if needed, otherwise toggle states
import { ScrambleCycle } from "@/components/ui";
import { FeaturesSection } from "./features-section";

const ROTATING = ["shielded", "unlinkable", "verified", "private", "yours"];

// Coordinate-label copy
const NET_TITLE = ["Network Status"];
const NET_VALUE = ["Arbitrum Sepolia · 421614"];
const PROOF_TITLE = ["Confidential Enclave"];
const PROOF_VALUE = ["iExec Nox Protocol · TEE"];
const SHIELD_TITLE = ["Shielded Tokens"];
const SHIELD_VALUE = ["ERC-7984 · cUSDC, cRLC & cWETH"];

const GRID_V = "rgba(255,255,255,0.06)";
const GRID_H = "rgba(255,255,255,0.09)";
const GRID_V_LIGHT = "rgba(33,27,18,0.06)";
const GRID_H_LIGHT = "rgba(33,27,18,0.09)";

function ChartBackground({ dark }: { dark: boolean }) {
  const fade =
    "radial-gradient(125% 105% at 50% 46%, #000 40%, transparent 100%)";
  const textColor = dark ? "text-[#efe9dc]/55" : "text-[#211b12]/55";
  const textHighlight = dark ? "text-[#efe9dc]/80" : "text-[#211b12]/80";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid-v) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-h) 1px, transparent 1px)",
          backgroundSize: "192px 138px",
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />

      <ul
        className={`absolute inset-0 font-mono text-[10px] uppercase tracking-[0.14em] ${textColor}`}
        style={{ opacity: "var(--grid-op, 1)" }}
      >
        <li className="absolute left-[5%] top-[45%]">
          <span className={`block ${textHighlight}`}>
            <ScrambleCycle
              words={NET_TITLE}
              duration={620}
              glitch={false}
              once
            />
          </span>
          <span className="block">
            [{" "}
            <ScrambleCycle
              words={NET_VALUE}
              duration={900}
              glitch={false}
              once
            />{" "}
            ]
          </span>
        </li>
        <li className="absolute right-[5%] top-[38%] text-right">
          <span className={`block ${textHighlight}`}>
            <ScrambleCycle
              words={PROOF_TITLE}
              duration={820}
              glitch={false}
              once
            />
          </span>
          <span className="block">
            [{" "}
            <ScrambleCycle
              words={PROOF_VALUE}
              duration={1150}
              glitch={false}
              once
            />{" "}
            ]
          </span>
        </li>
        <li className="absolute bottom-[16%] left-1/2 -translate-x-1/2 text-center">
          <span className={`block ${textHighlight}`}>
            <ScrambleCycle
              words={SHIELD_TITLE}
              duration={1040}
              glitch={false}
              once
            />
          </span>
          <span className="block">
            [{" "}
            <ScrambleCycle
              words={SHIELD_VALUE}
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

function Word({ children }: { children: string }) {
  return <span className="inline-block">{children}</span>;
}

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const [dark, setDark] = useState(true);

  // Monitor DOM dataset theme or standard class theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.dataset.theme !== "light";
      setDark(isDark);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    setDark(document.documentElement.dataset.theme !== "light");
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 0.6)),
      );
      const a = 1 - p; // grid + labels fade out as the story scrolls up
      const colorPrefix = dark ? "255,255,255" : "33,27,18";
      el.style.setProperty(
        "--grid-v",
        `rgba(${colorPrefix},${(0.06 * a).toFixed(3)})`,
      );
      el.style.setProperty(
        "--grid-h",
        `rgba(${colorPrefix},${(0.09 * a).toFixed(3)})`,
      );
      el.style.setProperty("--grid-op", a.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dark]);

  return (
    <div
      className="relative w-full transition-colors duration-300"
      style={{
        backgroundColor: dark ? "#17120b" : "#efe9dc",
        color: dark ? "#efe9dc" : "#211b12",
      }}
    >
      <section
        ref={heroRef}
        className="relative min-h-screen w-full overflow-hidden"
        style={
          {
            "--grid-v": dark ? GRID_V : GRID_V_LIGHT,
            "--grid-h": dark ? GRID_H : GRID_H_LIGHT,
            "--grid-op": 1,
          } as any
        }
      >
        {/* Backdrop — hero banner graded onto brand's sepia axis */}
        <div className="absolute inset-0 isolate overflow-hidden">
          <Image
            src="/Assets/Images/Background/hero-banner.jpg"
            alt=""
            fill
            priority
            className="object-cover pointer-events-none select-none"
            style={{
              filter: dark
                ? "saturate(0.45) contrast(1.05) brightness(0.44)"
                : "saturate(0.4) contrast(0.9) brightness(1.06)",
            }}
          />
          {/* Hue tint */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: dark ? "#4f3e22" : "#b2a590",
              mixBlendMode: "color",
              opacity: 0.55,
            }}
          />
          {/* Ground wash */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: dark ? "#17120b" : "#efe9dc",
              mixBlendMode: dark ? "multiply" : "screen",
              opacity: dark ? 0.5 : 0.55,
            }}
          />
        </div>

        {/* Static film grain */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0.45 0.45 0 -0.4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize: "90px 90px",
            opacity: dark ? 0.6 : 0.25,
          }}
        />

        <ChartBackground dark={dark} />

        {/* Upper gradient shading */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: dark
              ? "linear-gradient(to bottom, rgba(20,16,9,0.55), rgba(20,16,9,0.12) 42%, transparent 70%)"
              : "linear-gradient(to bottom, rgba(239,233,220,0.55), rgba(239,233,220,0.12) 42%, transparent 70%)",
          }}
        />

        {/* Header — inverts blend color dynamically */}
        <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
          <div className="flex items-center justify-between px-8 py-5">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Assets/Images/Logo-Brand/logo-light.png"
                alt="Zknull"
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="font-sans text-base font-semibold tracking-tight text-[#efe9dc]">
                wen-ox
              </span>
            </Link>
            <nav className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.18em]">
              <Link
                href="/faucet"
                className="text-[#efe9dc]/70 transition hover:text-[#efe9dc]"
              >
                Faucet
              </Link>
              <ThemeToggle />
              <Link
                href="/earn"
                className="text-[#efe9dc]/70 transition hover:text-[#efe9dc]"
              >
                Enter →
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
          <h1
            className="text-center font-sans font-extrabold uppercase leading-[0.98] tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 7.4vw, 5.75rem)",
              textShadow: dark ? "0 2px 30px rgba(20,16,9,0.45)" : "none",
              color: dark ? "#f6f1e6" : "#211b12",
            }}
          >
            <span className="flex flex-wrap justify-center gap-x-[0.26em]">
              <Word>private</Word>
              <Word>your</Word>
              <Word>yield</Word>
            </span>
            <span className="flex flex-wrap justify-center gap-x-[0.26em]">
              <Word>that</Word>
              <Word>stays</Word>
            </span>
            <span className="block text-brand">
              <ScrambleCycle words={ROTATING} duration={900} hold={2000} />
            </span>
          </h1>

          <span
            className={`mt-10 font-mono text-[11px] uppercase tracking-[0.3em] ${dark ? "text-[#efe9dc]/55" : "text-[#211b12]/55"}`}
          >
            scroll
          </span>
        </div>

        {/* Clean seam wash */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[32rem]"
          style={{
            background: dark
              ? "linear-gradient(to bottom, rgba(23,18,11,0) 0%, rgba(23,18,11,0) 48%, rgba(23,18,11,0.35) 70%, rgba(23,18,11,0.72) 86%, rgba(23,18,11,0.92) 94%, #17120b 100%)"
              : "linear-gradient(to bottom, rgba(239,233,220,0) 0%, rgba(239,233,220,0) 48%, rgba(239,233,220,0.35) 70%, rgba(239,233,220,0.72) 86%, rgba(239,233,220,0.92) 94%, #efe9dc 100%)",
          }}
        />
      </section>

      {/* Narrative beats stack + Bento section + System specs */}
      <FeaturesSection />

      {/* Infinite loop text marquee footer */}
      <footer
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-8 py-16 transition-colors duration-300"
        style={{
          backgroundColor: dark ? "#17120b" : "#efe9dc",
          color: dark ? "#efe9dc" : "#211b12",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0.35 0.35 0.35 0 -0.36'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
            backgroundSize: "90px 90px",
          }}
        />

        <div className="relative flex items-start justify-between">
          <p
            className={`max-w-xs text-[15px] font-medium leading-snug ${dark ? "text-[#efe9dc]/80" : "text-[#211b12]/80"}`}
          >
            Feel free to build yield strategies natively on Arbitrum Sepolia —
            privacy with composability.
          </p>
          <div className="relative h-24 w-44 opacity-85 select-none pointer-events-none">
            <Image
              src="/Assets/Images/Logo-Brand/logo-light.png"
              alt="Zknull"
              fill
              sizes="176px"
              className="object-contain"
            />
          </div>
        </div>

        <style>{`
          @keyframes wen-ox-marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-wen-ox-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: wen-ox-marquee 20s linear infinite;
          }
        `}</style>

        <div className="relative overflow-hidden w-full whitespace-nowrap select-none">
          <div
            className="animate-wen-ox-marquee font-bold"
            style={{
              fontSize: "clamp(2rem, 8.2vw, 6.5rem)",
              color: dark ? "#b3a081" : "#8e7a5c",
            }}
          >
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              WEN-OX
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              IEXEC NOX
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              ARBITRUM
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              CONFIDENTIAL
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              SHIELDED YIELD
            </Link>
            <span className="mx-8 opacity-45">·</span>

            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              WEN-OX
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              IEXEC NOX
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              ARBITRUM
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              CONFIDENTIAL
            </Link>
            <span className="mx-8 opacity-45">·</span>
            <Link
              href="/"
              className={`transition-colors ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              SHIELDED YIELD
            </Link>
            <span className="mx-8 opacity-45">·</span>
          </div>
          <div
            className="mt-6 h-px w-full"
            style={{
              backgroundColor: dark
                ? "rgba(239,233,220,0.2)"
                : "rgba(33,27,18,0.2)",
            }}
          />
        </div>

        <div className="relative">
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <nav
              className={`flex gap-6 font-mono text-[13px] uppercase tracking-[0.14em] ${dark ? "text-[#efe9dc]/70" : "text-[#211b12]/70"}`}
            >
              <a
                href="https://github.com/ln-tc999/wen-ox"
                className={`transition ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
              >
                GitHub
              </a>
            </nav>

            <div className="flex justify-end">
              <div className="max-w-[20rem] text-right">
                <div
                  className={`mb-4 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] justify-end ${dark ? "text-[#efe9dc]" : "text-[#211b12]"}`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    aria-hidden
                  >
                    <circle cx="5" cy="6.5" r="4.5" stroke="currentColor" />
                    <circle cx="8" cy="6.5" r="4.5" stroke="currentColor" />
                  </svg>
                  Build on Nox
                </div>
                <p
                  className={`text-[13px] leading-relaxed ${dark ? "text-[#efe9dc]/70" : "text-[#211b12]/70"}`}
                >
                  Wen-Ox is a privacy-first aggregator utilizing TEE technology.
                  Learn more from iExec Nox documentation.
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-14 flex items-center justify-between border-t pt-6 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{
              borderColor: dark
                ? "rgba(239,233,220,0.12)"
                : "rgba(33,27,18,0.12)",
              color: dark ? "rgba(239,233,220,0.5)" : "rgba(33,27,18,0.5)",
            }}
          >
            <span>© Wen-Ox Team 2026</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`transition ${dark ? "hover:text-[#efe9dc]" : "hover:text-[#211b12]"}`}
            >
              Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
