import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const pillars = [
  {
    title: "Belonging",
    text: "Access is reserved for known people inside a trusted circle."
  },
  {
    title: "Approval",
    text: "Membership begins with review, not automatic entry."
  },
  {
    title: "Loyalty",
    text: "One approved member, one trusted device, revocable when needed."
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
        <p className="hero-index" aria-hidden="true">
          Private access through a trusted network.
        </p>
        <div className="brand-mark" aria-label="UnitedVPN">
          <span>U</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Invitation only</p>
          <h1>UnitedVPN</h1>
          <p className="hero-kicker">
            Private internet access. By invitation only.
          </p>
          <p className="hero-subtitle">A private network for approved members.</p>
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
          <h2>Built around trust, restraint, and membership.</h2>
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
          <h2>Request first. Enter only when approved.</h2>
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
          <h2>A private network, held close.</h2>
        </div>
        <ul className="membership-list">
          <li>Invite only.</li>
          <li>One device per approved member.</li>
          <li>Access can be revoked at any time.</li>
        </ul>
      </section>

      <footer className="landing-footer">
        <div className="footer-copy">
          <span>Exclusive invites only.</span>
          <span>Site built by David Gim.</span>
          <span>Designed by David Gim.</span>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}
