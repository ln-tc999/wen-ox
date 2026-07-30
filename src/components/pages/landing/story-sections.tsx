"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

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
        <span className="text-brand">[ one shielded layer · two vaults ]</span>
      </Label>
      <h3 className="mt-6 max-w-2xl font-sans text-2xl font-bold lowercase leading-tight tracking-tight text-main md:text-3xl">
        privacy, proven, not promised.
      </h3>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {/* big feature — commitment note */}
        <Tile className="sm:col-span-2 md:col-span-2 md:row-span-2">
          <TileHead
            eyebrow="01 · Nox Handle Client"
            title="your amount is a handle, not plaintext."
          />
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted">
            every deposit wraps your underlying assets to confidential tokens.
            amounts are encrypted client-side using the Nox Handle SDK, mapping
            plaintext values to cryptographically secure handles.
          </p>
          <code
            className="mt-6 block w-fit rounded-lg px-3 py-2 font-mono text-[11px] text-brand"
            style={{ backgroundColor: "var(--color-surface-3)" }}
          >
            handle = encryptInput(amount, type, contract)
          </code>
        </Tile>

        {/* TEE Enclave */}
        <Tile className="sm:col-span-2 md:col-span-2">
          <TileHead
            eyebrow="02 · TEE Enclave"
            title="off-chain secure compute."
          />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            confidential smart contracts read handles and process yields
            securely inside Intel SGX/TDX Trusted Execution Environments.
            decrypted data never touches the public chain.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
            <span
              className="rounded-md px-2.5 py-1 text-brand"
              style={{ backgroundColor: "var(--color-surface-3)" }}
            >
              Nox Compute Precompile
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-brand"
              style={{ backgroundColor: "var(--color-surface-3)" }}
            >
              Intel SGX/TDX
            </span>
            <span
              className="rounded-md px-2.5 py-1 text-muted"
              style={{ backgroundColor: "var(--color-surface-3)" }}
            >
              EIP-712 auth
            </span>
          </div>
        </Tile>

        {/* stat: TEE events */}
        <Tile>
          <Stat value="14" label="on-chain TEE precompile events per wrap" />
        </Tile>

        {/* stat: protocols */}
        <Tile>
          <Stat value="2" label="confidential cTokens · cUSDC & cRLC" />
        </Tile>

        {/* trust-minimized aggregator */}
        <Tile className="sm:col-span-2 md:col-span-2">
          <TileHead
            eyebrow="03 · confidential yield"
            title="shielded strategies."
          />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            yield vault strategies compound assets on Arbitrum Sepolia. live
            aggregate TVL is visible using public decryption allowances, but
            individual allocation mappings remain strictly private.
          </p>
        </Tile>

        {/* Instant Faucet integration */}
        <Tile className="sm:col-span-2 md:col-span-2">
          <TileHead
            eyebrow="04 · instant faucet"
            title="one-click testnet assets."
          />
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            get pre-funded with Arbitrum Sepolia ETH, public USDC, and RLC
            instantly. Built specifically for hackathon judges to verify the
            end-to-end confidential deposit flow in seconds.
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
          [ wrap assets → deposit operator → TEE secure yield ]
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
            eyebrow="Arbitrum Sepolia · L2 Public Token"
            title="ERC-20 Contracts (USDC / RLC)"
            items={["USDC: 0x75faf...4AA4d", "RLC: 0x9923e...8C963"]}
          />
          <Connector note="wrap underlying assets to confidential tokens client-side" />
          <Layer
            eyebrow="Arbitrum Sepolia · ERC-7984"
            title="Confidential Wrapper (cUSDC / cRLC)"
            items={[
              "cUSDC: 0x1ccec...b808e",
              "cRLC: 0x92b23...9af4",
              "Nox TEE precompile authorization check",
            ]}
          />
          <Connector note="deposit cToken into confidential yield vaults" />
          <Layer
            eyebrow="Arbitrum Sepolia · shielded yield state"
            title="NoxYieldVault (cUSDC / cRLC)"
            items={[
              "cUSDC Vault: 0x75ef7...1351F",
              "cRLC Vault: 0x1955e...2Adf",
              "Poseidon2 Merkle tree state mapping",
            ]}
            highlight
          />
          <Connector note="TEE Compute Enclave for private balance decryption" />
          <Layer
            eyebrow="Arbitrum Sepolia · TEE precompile integration"
            title="NoxCompute Precompile (iExec)"
            items={[
              "0xd464B...1c229",
              "decrypt balance with EIP-712 signature verification",
            ]}
          />
        </div>

        {/* off-chain rail */}
        <aside className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
            off-chain · client SDK
          </span>
          <RailCard
            title="Nox Handle SDK"
            lines={[
              "encryptInput() client-side",
              "decrypt balance via handle mapping",
              "Arbitrum JSON-RPC client integration",
            ]}
          />
          <RailCard
            title="EIP-712 Signatures"
            lines={[
              "authorize publicDecrypt()",
              "decrypt user balances locally",
              "gasless view balance mapping",
            ]}
          />
          <RailCard
            title="Yield Aggregation"
            lines={[
              "route deposits to vaults",
              "read live APY variables",
              "automatic compounding check",
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
        <span className="text-main/80">confidential swap mechanism</span>
        <span className="text-brand">
          [ encrypt input → execute swap → wrap output ]
        </span>
      </Label>
      <h3 className="mt-6 max-w-2xl font-sans text-xl font-bold lowercase leading-tight tracking-tight text-main md:text-2xl">
        how dark swaps work: from client-side handle to curve/uniswap router.
      </h3>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_16rem]">
        {/* main vertical flow */}
        <div className="flex flex-col">
          <Layer
            eyebrow="Phase 1 · Client Encryption"
            title="Nox Handle SDK"
            items={[
              "shielded input handles generated",
              "RSA encryption key signatures exchanged",
              "operator allowance granted",
            ]}
          />
          <Connector note="encrypted handles sent to router contract — sizes hidden" />
          <Layer
            eyebrow="Phase 2 · Enclave Execution"
            title="NoxCompute TEE Swap Router"
            items={[
              "decrypt input amount securely inside enclave",
              "unwrap cToken to public token",
              "execute standard swap on Curve / Uniswap",
            ]}
          />
          <Connector note="re-wrap public output to confidential wrapper" />
          <Layer
            eyebrow="Phase 3 · Confidential Output"
            title="ERC-7984 Token Wrapper"
            items={[
              "transfer wrapped cToken back to user",
              "encrypt yield output handles",
              "issue execution receipt receipt",
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
            title="Composability"
            lines={[
              "integrates with Curve/Uniswap",
              "underlying pool stays unchanged",
              "slippage check inside TEE",
            ]}
          />
          <RailCard
            title="Frontrunning Protection"
            lines={[
              "hidden swap size and path",
              "encrypted mempool payload",
              "sandwiches are mitigated",
            ]}
          />
          <RailCard
            title="Private Accounting"
            lines={[
              "individual balance encrypted",
              "balances fully auditable",
              "unlinkable trading routes",
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
