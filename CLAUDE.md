# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version

This uses **Next.js 16** with breaking changes. APIs, conventions, and file structure may differ from your training data. When making Next.js-specific changes, check `node_modules/next/dist/docs/` first and heed deprecation notices.

## Setup & Development

```bash
# Initial setup (requires env vars — see below)
pnpm install
pnpm dev      # http://localhost:3000

# Linting & formatting (Biome, not ESLint/Prettier)
pnpm lint     # check only
pnpm format   # write changes
```

**No `pnpm typecheck` script exists.** Biome handles linting/formatting exclusively.

### Required Environment Variables

Create `.env.local` with:
- `PROJECT_ID` — WalletConnect project ID
- `NEXT_PUBLIC_APP_URL` — app URL for metadata
- `CHAINGPT_API_KEY` — optional, for AI features (contact @vladnazarxyz for free credits)

## Project Structure

- **Root**: Next.js app at `/` with `package.json`
- **Path alias**: `@/*` maps to `./src/*`
- **Foundry contracts**: `/foundry/` directory (Solidity ^0.8.24)
- **App pages**: `src/app/(app)/` - earn, portfolio, compare routes
- **Components**: `src/components/pages/(app)/` - page-specific components
- **Smart contract compilation**: `cd foundry && forge build && forge test -vv`

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + React Compiler (`babel-plugin-react-compiler` enabled in `next.config.ts`)
- **Tailwind CSS 4** + PostCSS
- **wagmi v2, viem v2.47+, RainbowKit v2.2+**
- **Zustand** for client state
- **TanStack Query v5** for server state
- **Biome 2.2** for linting/formatting
- **Foundry** for smart contracts (Solidity 0.8.24, Cancun EVM)
- **iExec Nox Protocol** for confidential computing
  - `@iexec-nox/handle@^0.1.0-beta.10` 
  - `@iexec-nox/nox-protocol-contracts@^0.2.2`
  - `@iexec-nox/nox-confidential-contracts@^0.1.0`

## Architecture Overview

### Two Parallel Protocol Systems

This app integrates **two distinct protocols** for vault aggregation:

| System | Purpose | API Routes | Client Libs |
|--------|---------|-----------|-------------|
| **Nox Protocol** | Confidential vaults with ERC-7984 tokens (cUSDC, cRLC) | `src/app/api/nox/{vaults,quote,meta,portfolio}/` | `src/lib/nox-{vault,meta,quote,handle}.ts` |
| **LI.FI** | General earn/portfolio aggregation | `src/app/api/earn/{vaults,quote,portfolio}/` <br/> `src/app/api/lifi/meta/` | `src/lib/lifi-{earn,meta,quote,portfolio}.ts` |

### Nox Protocol (Confidential)

- **Confidential tokens**: cUSDC, cRLC (ERC-7984 standard) on **Arbitrum Sepolia (421614)**
- **Contract addresses**: `src/lib/nox-types.ts` → `NOX_CONTRACTS`, `NOX_VAULTS`
- **Handle client creation**:
  - From wagmi: `createNoxHandleClientFromWagmi()` 
  - From window: `createNoxHandleClientFromWindow()`
  - Source: `@/lib/nox-handle`
- **State management**: 
  - Deposit: `src/stores/nox-deposit-store.ts`
  - Withdraw: `src/stores/nox-withdraw-store.ts`
- **Vault ABI**: `src/lib/nox-vault-contract.ts`

### LI.FI Integration

- **General earn vaults** and portfolio aggregation
- Optional `LIFI_API_KEY` env var (passed as `x-lifi-api-key` header)
- State stores: `deposit-store.ts`, `withdraw-store.ts`, `portfolio-store.ts`

### Portfolio System

`src/lib/portfolio-fetcher.ts` merges:
1. LI.FI positions (from LI.FI API)
2. Tracked vault positions (from `src/lib/tracked-vaults.ts`)

### Smart Contracts (`/foundry/`)

Two main contracts:
- `DeployNoxVaults.s.sol` — deployment script
- `NoxYieldVault.sol` — ERC-4626 vault implementation

Compile and test:
```bash
cd foundry
forge build
forge test -vv
```

Deploy to Arbitrum Sepolia:
```bash
cd foundry
forge script DeployNoxVaults.s.sol:DeployNoxVaults \
  --rpc-url https://sepolia-rollup.arbitrum.io/rpc --broadcast
```

## Network Configuration

**Default chain**: Arbitrum Sepolia (421614)

Wagmi config includes all viem chains, prioritized:
1. Arbitrum One (42161)
2. Arbitrum Sepolia (421614)  ← default testnet
3. Neon EVM (143)
4. Base (8453)
5. Optimism (10)
6. Ethereum (1)
7. Polygon (137)
8. ...then alphabetically

Chain config: `src/lib/wagmi.ts`

## Key Implementation Details

### API Proxy Pattern

All external API calls are proxied through Next.js Route Handlers to:
- Protect API keys (never sent to browser)
- Avoid CORS issues
- Add server-side caching/error handling

Example: `src/app/api/chaingpt/route.ts` proxies ChainGPT API

### Confidential Token Flow

**Deposit flow** (Nox vaults only):
1. Approve underlying token (USDC/RLC) → cToken wrapper
2. Wrap to confidential token (cUSDC/cRLC)
3. Set operator approval for vault
4. Deposit cToken into vault
5. Decrypt balance via Nox Handle SDK (gasless EIP-712 signature)

**Withdraw flow**:
1. Redeem shares from vault
2. Unwrap cToken → underlying token

Store logic: `src/stores/nox-{deposit,withdraw}-store.ts`

### State Management

- **Zustand** stores for UI state (deposit/withdraw flows, filters, modals)
- **TanStack Query** for server data (vaults, portfolio, quotes)
- Store index: `src/stores/index.ts`

### AI Integration

ChainGPT integration for vault recommendations:
- Endpoint: `src/app/api/chaingpt/route.ts`
- Client lib: `src/lib/chaingpt.ts`
- Functions: `chatWithChainGPT()`, `generateVaultRecommendation()`, `auditSmartContract()`
- Floating AI chat button: `src/components/ui/ai-chat/`

## Working with This Codebase

### When Adding Features

1. **New vault protocol**: Add to either Nox or LI.FI API routes, not both
2. **New page**: Create under `src/app/(app)/[page]/page.tsx`
3. **New component**: Place in `src/components/pages/(app)/[page]/`
4. **New contract**: Add to `/foundry/` and update ABIs in `src/lib/`

### When Making Changes

- **Smart contracts**: Update both `/foundry/` source and frontend ABIs
- **Contract addresses**: Update `src/lib/nox-types.ts` constants
- **API endpoints**: Test both Nox and LI.FI code paths if applicable
- **Confidential features**: Always use Handle SDK for encryption/decryption

### Testing Locally

1. **Frontend**: `pnpm dev` → test at http://localhost:3000
2. **Smart contracts**: `cd foundry && forge test -vv`
3. **Linting**: `pnpm lint` (Biome will auto-fix many issues)
4. **Formatting**: `pnpm format` (writes changes automatically)

### Common Gotchas

- **No ESLint/Prettier** — use Biome exclusively (`pnpm lint`, `pnpm format`)
- **No typecheck script** — TypeScript errors will surface during `next build`
- **React Compiler enabled** — avoid manual memoization (useMemo/useCallback) unless necessary
- **Two protocol systems** — don't assume all vaults use the same APIs
- **Confidential tokens** — cUSDC/cRLC require Handle SDK for encryption/decryption
- **Default chain** — most features expect Arbitrum Sepolia (421614)

## Deployed Contracts (Arbitrum Sepolia)

All addresses in `src/lib/nox-types.ts`:

**Base tokens**:
- USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
- RLC: `0x9923eD3cbd90CD78b910c475f9A731A6e0b8C963`

**Confidential tokens (ERC-7984)**:
- cUSDC: `0x1ccec6bc60db15e4055d43dc2531bb7d4e5b808e`
- cRLC: `0x92b23f4a59175415ced5cb37e64a1fc6a9d79af4`

**Vaults (ERC-4626)**:
- cUSDC Vault: `0x75ef70Ea33994a16751ff0b4f7DCF0F94DF1351F`
- cRLC Vault: `0x1955eF9145cCAa643a8Ee61aE3206F0acb632Adf`

**iExec infrastructure**:
- NoxCompute precompile: `0xd464B198f06756a1d00be223634b85E0a731c229`

All contracts verified on Arbiscan.
