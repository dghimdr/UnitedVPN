import { VpnGuide } from "../VpnGuide";
import { GuideHeader } from "./GuideHeader";

export default function GuidePage() {
  return (
    <main className="shell">
      <section className="panel stack">
        <GuideHeader />
        <VpnGuide />
      </section>
    </main>
  );
}
