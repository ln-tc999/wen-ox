"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/* Shared styling tokens that align with Wen-Ox CSS variables */

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

// ---------------------------------------------------------------- BENTO

function Tile({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden border p-6 transition-colors duration-300 hover:border-brand/40 ${className}`}
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "var(--color-surface-2)",
      }}
    >
      {children}
    </div>
  );
}

function TileHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </span>
      <h4 className="mt-3 font-sans text-xl font-bold lowercase leading-tight tracking-tight text-main">
        {title}
      </h4>
    </div>
  );
}

function Stat({
  value,
  sup,
  label,
}: {
  value: string;
  sup?: string;
  label: string;
}) {
  return (
    <>
      <div className="flex items-start gap-1">
        <span className="font-sans text-4xl font-extrabold leading-none tracking-tight text-main">
          {value}
        </span>
        {sup && (
          <span className="mt-0.5 font-mono text-xs text-brand">{sup}</span>
        )}
      </div>
      <span className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-muted">
        {label}
      </span>
    </>
  );
}

export function BentoSection() {
  return (
    <div className="mt-20">
      <Label>
        <span className="text-main/80">the platform</span>
        <span className="text-brand">
          [ one shielded layer · four surfaces ]
        </span>
      </Label>
      <h3 className="mt-6 max-w-2xl font-sans text-2xl font-bold lowercase leading-tight tracking-tight text-main md:text-3xl">
        privacy, proven, not promised.
      </h3>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {/* big feature — commitment note */}
        <Tile className="sm:col-span-2 md:col-span-2 md:row-span-2">
          <TileHead
            eyebrow="01 · commitment note"
            title="your balance is a hash, not an account."
          />
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted">
            every deposit becomes a Poseidon2 commitment in an append-only
            Merkle tree. amount and owner live inside the hash, only the root is
            ever public, and old notes never link to new ones.
          </p>
          <code
            className="mt-6 block w-fit rounded-lg px-3 py-2 font-mono text-[11px] text-brand"
            style={{ backgroundColor: "var(--color-surface-3)" }}
          >
            commitment = hash4(asset, amount, owner, blinding)
          </code>
        </Tile>

        {/* ultrahonk */}
        <Tile className="sm:col-span-2 md:col-span-2">
          <TileHead eyebrow="02 · ultrahonk" title="proofs, not disclosures." />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            each exit is a Noir/UltraHonk zero-knowledge proof, checked inside
            an Arbitrum Sepolia contract over BN254. no amounts, no addresses
            leave the circuit.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
            <span
              className="rounded-md px-2.5 py-1 text-brand"
              style={{ backgroundColor: "var(--color-surface-3)" }}
            >
              14,592 B proof
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-brand"
              style={{ backgroundColor: "var(--color-surface-3)" }}
            >
              1,760 B vk
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-muted"
              style={{ backgroundColor: "var(--color-surface-3)" }}
            >
              keccak transcript
            </span>
          </div>
        </Tile>

        {/* stat: merkle depth */}
        <Tile>
          <Stat value="20" label="merkle depth · 2²⁰ private leaves" />
        </Tile>

        {/* stat: circuits */}
        <Tile>
          <Stat value="5" label="Noir circuits · one verifier each" />
        </Tile>

        {/* bridge */}
        <Tile className="sm:col-span-2 md:col-span-2">
          <TileHead
            eyebrow="03 · trust-minimized aggregator"
            title="aggregated, not wrapped."
          />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            assets locked on Ethereum or other chains arrive natively in
            Arbitrum. The routing state verification is checked{" "}
            <span className="text-brand">natively on-chain</span>, without
            relying on trusted relayers.
          </p>
        </Tile>

        {/* dark pool */}
        <Tile className="sm:col-span-2 md:col-span-2">
          <TileHead eyebrow="04 · dark pool / dex" title="matched blind." />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            orders are placed and matched at the midpoint without revealing size
            or side, then settled atomically: a zero-knowledge DEX where the
            book itself stays hidden.
          </p>
        </Tile>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- ARCHITECTURE

function Layer({
  eyebrow,
  title,
  items,
  highlight = false,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`border px-5 py-4 transition-all duration-300`}
      style={{
        borderColor: highlight ? "var(--color-brand)" : "var(--color-line)",
        backgroundColor: highlight
          ? "rgba(245, 194, 25, 0.05)"
          : "var(--color-surface-2)",
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </span>
        <span className="font-sans text-sm font-semibold tracking-tight text-main">
          {title}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-md px-2 py-1 font-mono text-[10px] tracking-[0.03em] text-muted"
            style={{ backgroundColor: "var(--color-surface-3)" }}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function Connector({ note }: { note: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5 pl-5">
      <span aria-hidden className="text-[13px] leading-none text-brand">
        ↓
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand/80">
        {note}
      </span>
    </div>
  );
}

function RailCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div
      className="border border-dashed p-4"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "var(--color-surface-2)",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-main">
        {title}
      </div>
      {lines.map((l) => (
        <p
          key={l}
          className="mt-1 font-mono text-[10px] leading-relaxed text-muted"
        >
          {l}
        </p>
      ))}
    </div>
  );
}

export function SystemArchitecture() {
  return (
    <div
      className="mt-8 border px-6 py-10 sm:px-10 sm:py-12"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "var(--color-surface-1)",
      }}
    >
      <Label>
        <span className="text-main/80">system architecture</span>
        <span className="text-brand">
          [ L1 lock → L2 verifier → shielded settle ]
        </span>
      </Label>
      <h3 className="mt-6 max-w-2xl font-sans text-xl font-bold lowercase leading-tight tracking-tight text-main md:text-2xl">
        every yield route crosses one boundary, checked on-chain inside TEE
        enclaves.
      </h3>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_16rem]">
        {/* main vertical flow */}
        <div className="flex flex-col">
          <Layer
            eyebrow="L1 · Ethereum Sepolia"
            title="LoxStellBridgeL1 / Mock Token Lock"
            items={["lock ETH / USDC", "emit Locked(commitment)"]}
          />
          <Connector note="untrusted relayer — transports data, holds no authority" />
          <Layer
            eyebrow="Arbitrum Sepolia · verification"
            title="EthLightClient → WenOxVaultAggregator"
            items={[
              "BLS12-381 sync-committee",
              "MPT storage proof vs state_root",
              "bridge_in → mint note",
            ]}
          />
          <Connector note="native BN254 / BLS — iExec Nox TEE Gateway" />
          <Layer
            eyebrow="Arbitrum Sepolia · shielded state"
            title="NoxYieldVault"
            items={[
              "Poseidon2 commitment notes",
              "append-only Merkle · depth 20",
              "nullifier set · 100-root ring",
            ]}
            highlight
          />
          <Connector note="every exit gated by a zero-knowledge proof or operator authorization" />
          <Layer
            eyebrow="Arbitrum Sepolia · UltraHonk verifiers"
            title="5 circuits · one contract each"
            items={[
              "withdraw",
              "transfer",
              "place_order",
              "match_orders",
              "cancel_order",
            ]}
          />
        </div>

        {/* off-chain rail */}
        <aside className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
            off-chain · no authority
          </span>
          <RailCard
            title="SDK"
            lines={[
              "notes · Merkle · Poseidon2",
              "UltraHonk proofs",
              "Arbitrum tx building",
            ]}
          />
          <RailCard
            title="Matcher"
            lines={[
              "off-chain price-time",
              "mirrors match_orders",
              "re-proven on-chain",
            ]}
          />
          <RailCard
            title="Relayer"
            lines={[
              "beacon finality updates",
              "eth_getProof",
              "every value re-verified",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- SWAP / AMM

export function SwapAmmMechanism() {
  return (
    <div
      className="mt-8 border px-6 py-10 sm:px-10 sm:py-12"
      style={{
        borderColor: "var(--color-line)",
        backgroundColor: "var(--color-surface-1)",
      }}
    >
      <Label>
        <span className="text-main/80">swap & amm mechanism</span>
        <span className="text-brand">
          [ commitment → midpoint match → ZK-settlement ]
        </span>
      </Label>
      <h3 className="mt-6 max-w-2xl font-sans text-xl font-bold lowercase leading-tight tracking-tight text-main md:text-2xl">
        how dark swaps work: from commitment to constant product settlement.
      </h3>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_16rem]">
        {/* main vertical flow */}
        <div className="flex flex-col">
          <Layer
            eyebrow="Phase 1 · Client Commitment"
            title="SDK / Zero-Knowledge Circuit"
            items={[
              "shielded input notes locked",
              "generate place_order proof",
              "order commitment emitted",
            ]}
          />
          <Connector note="sealed commitments sent to matcher — size and price hidden" />
          <Layer
            eyebrow="Phase 2 · Midpoint Matching"
            title="Off-Chain Matcher Engine"
            items={[
              "live reference price queried",
              "match bids & asks at midpoint",
              "calculate constant product (x * y = k)",
            ]}
          />
          <Connector note="generates blind execution path and ZK match proof" />
          <Layer
            eyebrow="Phase 3 · On-Chain Settlement"
            title="Arbitrum Sepolia Contract (match_orders)"
            items={[
              "verify ZK proof of matching",
              "nullify spent input notes",
              "append output notes to Merkle tree",
            ]}
            highlight
          />
        </div>

        {/* Technical specs panel */}
        <aside className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
            AMM Specifications
          </span>
          <RailCard
            title="Constant Product"
            lines={[
              "x * y = k formula",
              "maintains pool invariant",
              "slippage computed blind",
            ]}
          />
          <RailCard
            title="Anti-Frontrunning"
            lines={[
              "matched at fair midpoint",
              "no public mempool visibility",
              "sandwiches are impossible",
            ]}
          />
          <RailCard
            title="ZK Privacy"
            lines={[
              "notes nullified privately",
              "only roots are updated",
              "unlinkable asset paths",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
