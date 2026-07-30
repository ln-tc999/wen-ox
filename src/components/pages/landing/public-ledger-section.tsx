"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiShield,
  FiLock,
  FiUnlock,
  FiGlobe,
} from "react-icons/fi";

export function PublicLedgerSection() {
  const [isConfidential, setIsConfidential] = useState(true);

  // Mock transaction data to show the contrast
  const transactions = [
    {
      id: 1,
      user: "0x3f...9b2a",
      action: "Deposit USDC",
      publicAmount: "150,000 USDC",
      privateAmount: "•••••• USDC",
      strategy: "Aave Yield Route",
    },
    {
      id: 2,
      user: "0x7a...4d81",
      action: "Withdraw RLC",
      publicAmount: "85,000 RLC",
      privateAmount: "•••••• RLC",
      strategy: "Morpho Optimizer",
    },
    {
      id: 3,
      user: "0x9d...2e5c",
      action: "Yield Compounded",
      publicAmount: "12,450 USDC",
      privateAmount: "•••••• USDC",
      strategy: "Curve Leverage",
    },
  ];

  return (
    <section
      id="ledger-comparison"
      className="relative w-full py-24 md:py-32 overflow-hidden border-t border-b"
      style={{
        backgroundColor: "var(--color-canvas)",
        borderColor: "var(--color-line)",
      }}
    >
      {/* Background Deco Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
            style={{
              borderColor: "var(--color-brand)",
              color: "var(--color-brand)",
              backgroundColor: "rgba(216, 180, 254, 0.05)",
            }}
          >
            <FiShield className="size-3" /> Solving The Public Ledger Paradox
          </motion.div>

          <motion.h2
            className="text-4xl tracking-tight text-main md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Public Verification.
            <br />
            <span className="text-brand">Absolute Privacy.</span>
          </motion.h2>

          <motion.p
            className="text-muted text-base md:text-lg leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Traditional public ledgers force you to broadcast transaction
            amounts and balances to the world. Wen-Ox uses iExec Nox TEE to
            decrypt & route yield privately, leaving zero plaintext footprint
            on-chain.
          </motion.p>
        </div>

        {/* Live Simulator Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Simulation Controls & Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-main">
              Ledger Privacy Simulator
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Toggle the switch to see how transaction information changes
              between standard public blockchains and the Wen-Ox Confidential
              Layer.
            </p>

            <div
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{
                borderColor: "var(--color-line)",
                backgroundColor: "var(--color-surface-1)",
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-main">
                  {isConfidential
                    ? "Confidential Shielding On"
                    : "Confidential Shielding Off"}
                </span>
                <span className="text-xs text-muted">
                  {isConfidential
                    ? "Data processed inside secure TEE enclaves"
                    : "Plaintext exposed on Etherscan/Arbiscan"}
                </span>
              </div>

              {/* Custom Switch Toggle */}
              <button
                onClick={() => setIsConfidential(!isConfidential)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                style={{
                  backgroundColor: isConfidential
                    ? "var(--color-brand)"
                    : "var(--color-surface-3)",
                }}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  style={{
                    transform: isConfidential
                      ? "translateX(20px)"
                      : "translateX(0px)",
                  }}
                />
              </button>
            </div>

            {/* Benefit Highlights */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-brand"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  {isConfidential ? (
                    <FiLock className="size-4" />
                  ) : (
                    <FiUnlock className="size-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-main">
                    Cryptographic Obfuscation
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {isConfidential
                      ? "Amounts are encrypted client-side using Nox Handle before submission."
                      : "MEV searchers & copy-traders can instantly frontrun your transaction."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border text-brand"
                  style={{ borderColor: "var(--color-line)" }}
                >
                  {isConfidential ? (
                    <FiShield className="size-4" />
                  ) : (
                    <FiGlobe className="size-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-main">
                    Zero-Knowledge Verification
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    {isConfidential
                      ? "Only the aggregate TVL is publicly visible; individual strategies stay encrypted."
                      : "Total deposits, address relationships, and vault allocations are visible."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Ledger Display */}
          <div className="lg:col-span-7">
            <div
              className="w-full rounded-2xl border overflow-hidden shadow-2xl relative"
              style={{
                borderColor: "var(--color-line)",
                backgroundColor: "var(--color-surface-1)",
              }}
            >
              {/* Terminal Title Bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b text-xs text-muted"
                style={{
                  borderColor: "var(--color-line)",
                  backgroundColor: "var(--color-surface-2)",
                }}
              >
                <div className="flex items-center gap-2 font-mono">
                  <span className="inline-block size-2.5 rounded-full bg-red-500/70" />
                  <span className="inline-block size-2.5 rounded-full bg-yellow-500/70" />
                  <span className="inline-block size-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 font-semibold text-main">
                    wen-ox-ledger-visualizer
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  {isConfidential ? (
                    <span className="flex items-center gap-1 text-green-500">
                      <FiEyeOff className="size-3" /> NOX_SHIELDED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <FiEye className="size-3" /> PUBLIC_PLAIN_TEXT
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions List */}
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      <th className="pb-3 font-semibold text-muted">Sender</th>
                      <th className="pb-3 font-semibold text-muted">Action</th>
                      <th className="pb-3 font-semibold text-muted text-right">
                        Value / Amount
                      </th>
                      <th className="pb-3 font-semibold text-muted text-right">
                        Vault Strategy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b last:border-0 hover:bg-black/10 transition-colors duration-150"
                        style={{ borderColor: "var(--color-line)" }}
                      >
                        <td className="py-4 text-main font-semibold">
                          {tx.user}
                        </td>
                        <td className="py-4 text-muted">{tx.action}</td>
                        <td className="py-4 text-right">
                          <motion.span
                            key={isConfidential ? "private" : "public"}
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={
                              isConfidential
                                ? "text-brand font-bold"
                                : "text-main font-bold"
                            }
                          >
                            {isConfidential
                              ? tx.privateAmount
                              : tx.publicAmount}
                          </motion.span>
                        </td>
                        <td className="py-4 text-right text-muted font-medium">
                          {isConfidential ? (
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-brand/20 bg-brand/5 text-brand">
                              TEE Executed
                            </span>
                          ) : (
                            tx.strategy
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Terminal Footer Info */}
              <div
                className="px-5 py-3 border-t flex items-center justify-between text-[11px] font-mono text-muted"
                style={{
                  borderColor: "var(--color-line)",
                  backgroundColor: "var(--color-surface-2)",
                }}
              >
                <span>Status: Fully Auditable On-Chain</span>
                <span>Verification: Cryptographic Attestation ✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
