import type { Metadata } from "next";
import { PortfolioView } from "@/components/pages/(app)";

export const metadata: Metadata = {
  title: "iEx AI | Portfolio",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
