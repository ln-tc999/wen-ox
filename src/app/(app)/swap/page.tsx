import type { Metadata } from "next";
import { SwapView } from "@/components/pages/(app)/swap";

export const metadata: Metadata = {
  title: "Wen-Ox | Swap",
  description: "Private token swaps with Nox Protocol encryption",
};

export default function SwapPage() {
  return <SwapView />;
}
