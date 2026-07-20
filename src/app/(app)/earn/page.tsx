import type { Metadata } from "next";
import { EarnView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "Wen-Ox | Earn",
};

export default function EarnPage() {
  return <EarnView />;
}
