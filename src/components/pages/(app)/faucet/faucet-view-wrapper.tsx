"use client";

import { Suspense } from "react";
import { FaucetView } from "./faucet-view";

export function FaucetViewWrapper() {
  return (
    <Suspense fallback={null}>
      <FaucetView />
    </Suspense>
  );
}
