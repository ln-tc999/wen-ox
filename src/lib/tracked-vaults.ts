const STORAGE_KEY = "wen_ox_tracked_vaults";

const KNOWN_VAULTS: Omit<TrackedVault, "depositedAt">[] = [
  {
    chainId: 42161,
    vaultAddress: "0x0000000f2eB9f69274678c76222B35eEc7588a65",
    protocolName: "yo-protocol",
    tokenSymbol: "USDC",
    tokenDecimals: 6,
    tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    vaultName: "yoVaultUSD",
  },
  {
    chainId: 421614,
    vaultAddress: "0x75ef70Ea33994a16751ff0b4f7DCF0F94DF1351F",
    protocolName: "nox-protocol",
    tokenSymbol: "cUSDC",
    tokenDecimals: 6,
    tokenAddress: "0x1ccec6bc60db15e4055d43dc2531bb7d4e5b808e",
    vaultName: "Nox cUSDC Vault",
  },
  {
    chainId: 421614,
    vaultAddress: "0x1955eF9145cCAa643a8Ee61aE3206F0acb632Adf",
    protocolName: "nox-protocol",
    tokenSymbol: "cRLC",
    tokenDecimals: 9,
    tokenAddress: "0x92b23f4a59175415ced5cb37e64a1fc6a9d79af4",
    vaultName: "Nox cRLC Vault",
  },
  {
    chainId: 421614,
    vaultAddress: "0x53B18389Aa9c4Bf6FA9b3E065a2c142b77C88b82",
    protocolName: "nox-protocol",
    tokenSymbol: "cWETH",
    tokenDecimals: 18,
    tokenAddress: "0x051eb756A880908a37147aE4d564A1977F700de1",
    vaultName: "Nox cWETH Vault",
  },
];

export type TrackedVault = {
  chainId: number;
  vaultAddress: string;
  protocolName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAddress?: string;
  vaultName: string;
  depositedAt: number;
};

export function getTrackedVaults(): TrackedVault[] {
  let userVaults: TrackedVault[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) userVaults = JSON.parse(raw) as TrackedVault[];
  } catch {}

  const keys = new Set(
    userVaults.map((v) => `${v.chainId}-${v.vaultAddress.toLowerCase()}`),
  );

  for (const known of KNOWN_VAULTS) {
    const key = `${known.chainId}-${known.vaultAddress.toLowerCase()}`;
    if (!keys.has(key)) {
      userVaults.push({ ...known, depositedAt: 0 });
    }
  }

  return userVaults;
}

export function addTrackedVault(
  vault: Omit<TrackedVault, "depositedAt">,
): void {
  try {
    const existing = getTrackedVaults();
    const key = `${vault.chainId}-${vault.vaultAddress.toLowerCase()}`;
    const alreadyTracked = existing.some(
      (v) => `${v.chainId}-${v.vaultAddress.toLowerCase()}` === key,
    );
    if (alreadyTracked) return;
    const next = [...existing, { ...vault, depositedAt: Date.now() }].slice(
      -50,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

export function removeTrackedVault(
  chainId: number,
  vaultAddress: string,
): void {
  try {
    const existing = getTrackedVaults();
    const key = `${chainId}-${vaultAddress.toLowerCase()}`;
    const next = existing.filter(
      (v) => `${v.chainId}-${v.vaultAddress.toLowerCase()}` !== key,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}
