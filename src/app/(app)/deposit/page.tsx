import type { Metadata } from "next";
import { DepositView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "Wen-Ox | Deposit & Withdraw",
  description:
    "Deposit into confidential vaults or withdraw your funds from Wen-Ox.",
};

export default function DepositPage() {
  return <DepositView />;
}
