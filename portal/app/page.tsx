import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const pillars = [
  {
    title: "Private",
    text: "A closed network for known members, not a public VPN service."
  },
  {
    title: "Approved",
    text: "Every account is reviewed before access is granted."
  },
  {
    title: "Secure",
    text: "WireGuard access for trusted devices with admin-controlled status."
  }
];

const accessSteps = ["Request Access", "Review", "Approval", "Connect"];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="landing">
      <section className="club-hero">
        <div className="motion-line" aria-hidden="true" />
        <div className="brand-mark" aria-label="UnitedVPN">
          <span>UV</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Private membership network</p>
          <h1>UnitedVPN</h1>
          <p className="hero-kicker">
            Private internet access. By invitation only.
          </p>
          <p className="hero-subtitle">
            A private network built for approved members, trusted devices, and
            secure access anywhere.
          </p>
          <div className="hero-actions" aria-label="UnitedVPN account actions">
            <Link className="button landing-primary" href="/signup">
              Request Access
            </Link>
            <Link className="button landing-secondary" href="/login">
              Member Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section editorial-section">
        <div className="section-heading">
          <p className="eyebrow">Why UnitedVPN</p>
          <h2>Access is limited by design.</h2>
        </div>
        <div className="pillar-list">
          {pillars.map((pillar) => (
            <article className="pillar-item" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section access-section">
        <div className="section-heading">
          <p className="eyebrow">How access works</p>
          <h2>Simple steps. No automatic entry.</h2>
        </div>
        <ol className="access-track">
          {accessSteps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section membership-section">
        <div>
          <p className="eyebrow">Membership</p>
          <h2>Private by default.</h2>
        </div>
        <ul className="membership-list">
          <li>Invite only.</li>
          <li>One device per approved member.</li>
          <li>Access can be revoked at any time.</li>
        </ul>
      </section>

      <footer className="landing-footer">
        <span>UnitedVPN</span>
        <span>Private access for approved members.</span>
      </footer>
    </main>
  );
}
