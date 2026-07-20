<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project

- Root is the Next.js app. `package.json` lives at `/`.
- Path alias `@/*` maps to `./src/*`.
- `pnpm-workspace.yaml` only controls built dependencies — no workspace packages.

## Setup

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Required env vars: `PROJECT_ID` (WalletConnect), `NEXT_PUBLIC_APP_URL`, `CHAINGPT_API_KEY` (optional — contact @vladnazarxyz for free credits).

## Lint & Format

**Biome** (not ESLint/Prettier). No `pnpm typecheck` script exists.

```bash
pnpm lint   # check only
pnpm format # write changes
```

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + React Compiler (`babel-plugin-react-compiler`, enabled in `next.config.ts`)
- Tailwind CSS 4 + PostCSS
- wagmi v2, viem, RainbowKit
- Zustand for state
- **Two protocols coexist**: Nox Protocol (confidential vaults) + LI.FI (general earn/portfolio)

## Key Architecture

### API Proxies (two parallel systems)

| Pattern | Purpose | Proxied upstream |
|---|---|---|
| `src/app/api/nox/{vaults,quote,meta,portfolio}/` | Confidential vault aggregator | Nox Protocol |
| `src/app/api/earn/{vaults,quote,portfolio}/` | General earn | LI.FI (`earn.li.fi/v1`) |
| `src/app/api/lifi/meta/` | Chain/token metadata | LI.FI |

### Nox Protocol (confidential)

- Libs: `src/lib/nox-{vault,meta,quote,handle}.ts`
- Stores: `src/stores/nox-{deposit,withdraw}-store.ts`
- Confidential tokens: cUSDC, cRLC (ERC-7984) on Arbitrum Sepolia (421614)
- Contract addresses in `src/lib/nox-types.ts` → `NOX_CONTRACTS`
- Handle client: `createNoxHandleClientFromWagmi()` / `createNoxHandleClientFromWindow()` from `@/lib/nox-handle`

### LI.FI (general earn, still active)

- Libs: `src/lib/lifi-{earn,meta,quote,portfolio}.ts`
- Stores: `src/stores/deposit-store.ts`, `src/stores/withdraw-store.ts`, `src/stores/portfolio-store.ts`
- Env var: `LIFI_API_KEY` (optional, passed as `x-lifi-api-key` header)

### Portfolio

- `src/lib/portfolio-fetcher.ts` merges LI.FI positions + tracked vault positions (from `src/lib/tracked-vaults.ts`)

### Pages

- All app pages under `src/app/(app)/` (compare/, earn/, portfolio/)
- Default chain: **Arbitrum Sepolia (421614)**