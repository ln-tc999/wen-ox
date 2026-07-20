import { parseAbi } from "viem";

export const NOX_YIELD_VAULT_ABI = parseAbi([
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function asset() view returns (address)",
  "function convertToShares(uint256 assets) view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function previewDeposit(uint256 assets) view returns (uint256)",
  "function previewRedeem(uint256 shares) view returns (uint256)",
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function mint(uint256 shares, address receiver) returns (uint256)",
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function yieldAccumulated() view returns (uint256)",
  "function estimatedAPY() view returns (uint256)",
  "function depositYield(uint256 amount)",
]);

export type NoxYieldVaultConfig = {
  cUSDC_VAULT: `0x${string}`;
  cRLC_VAULT: `0x${string}`;
};

export const NOX_YIELD_VAULTS: NoxYieldVaultConfig = {
  cUSDC_VAULT: "0x75ef70Ea33994a16751ff0b4f7DCF0F94DF1351F",
  cRLC_VAULT: "0x1955eF9145cCAa643a8Ee61aE3206F0acb632Adf",
};
