import type { Metadata } from "next";
import { PortfolioView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "Wen-Ox | Portfolio",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
