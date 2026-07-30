import { FeaturesSection } from "./features-section";
import { FooterSection } from "./footer-section";
import { HeroSection } from "./hero-section";
import { LandingNavbar } from "./landing-navbar";
import { PublicLedgerSection } from "./public-ledger-section";

export function LandingPage() {
  return (
    <div className="flex w-full flex-col">
      <LandingNavbar />
      <main className="grow">
        <HeroSection />
        <PublicLedgerSection />
        <FeaturesSection />
      </main>
      <FooterSection />
    </div>
  );
}
