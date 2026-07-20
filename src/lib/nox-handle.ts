"use client";

import type { HandleClient } from "@iexec-nox/handle";
import { createViemHandleClient } from "@iexec-nox/handle";
import type { Config } from "wagmi";
import { http, createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";

export type HandleClientState = {
  client: HandleClient | null;
  isReady: boolean;
  error: string | null;
};

export async function createNoxHandleClientFromWagmi(
  _config: Config,
  account: `0x${string}`,
): Promise<HandleClient> {
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });
  return createViemHandleClient(walletClient);
}

export async function createNoxHandleClientFromWindow(
  account: `0x${string}`,
): Promise<HandleClient> {
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: custom(window.ethereum),
  });
  return createViemHandleClient(walletClient);
}

export async function encryptAmountWithHandle(
  client: HandleClient,
  amount: bigint,
  _tokenType: string,
  contractAddress: `0x${string}`,
): Promise<{ handle: string; handleProof: string }> {
  return client.encryptInput(amount, "uint256", contractAddress);
}

export async function decryptWithHandle(
  client: HandleClient,
  handle: `0x${string}`,
): Promise<{ value: bigint; decrypted: boolean }> {
  try {
    const result = await client.decrypt(handle);
    return { value: BigInt(result.value as string), decrypted: true };
  } catch {
    return { value: 0n, decrypted: false };
  }
}

export async function publicDecryptWithHandle(
  client: HandleClient,
  handle: `0x${string}`,
): Promise<{ value: bigint; decrypted: boolean }> {
  try {
    const result = await client.publicDecrypt(handle);
    return { value: BigInt(result.value as string), decrypted: true };
  } catch {
    return { value: 0n, decrypted: false };
  }
}

export async function viewHandleACL(
  client: HandleClient,
  handle: `0x${string}`,
): Promise<{ admins: string[]; viewers: string[] }> {
  const acl = await client.viewACL(handle);
  return {
    admins: acl.admins ?? [],
    viewers: acl.viewers ?? [],
  };
}
