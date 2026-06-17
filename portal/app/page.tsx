import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const trustIndicators = [
  "Invite-only",
  "Admin Approved",
  "One Device",
  "Singapore Network"
];

const principles = [
  {
    title: "Belonging",
    text: "Access is reserved for approved members inside a trusted network."
  },
  {
    title: "Approval",
    text: "Membership begins with review, not automatic entry."
  },
  {
    title: "Loyalty",
    text: "One approved member. One trusted device. Revocable when necessary."
  }
];

const accessSteps = [
  {
    title: "Request Access",
    text: "Submit your request to join the network."
  },
  {
    title: "Review",
    text: "Applications are reviewed manually."
  },
  {
    title: "Connect",
    text: "Scan your QR code and connect in seconds."
  }
];

const benefits = [
  {
    title: "Private Access",
    text: "Traffic exits through a private Singapore network."
  },
  {
    title: "Trusted Devices",
    text: "One member. One device."
  },
  {
    title: "Secure Onboarding",
    text: "QR-based setup for mobile devices."
  },
  {
    title: "Admin Controlled",
    text: "Access can be approved or revoked."
  },
  {
    title: "No Public Access",
    text: "Membership is not open to everyone."
  },
  {
    title: "Minimal by Design",
    text: "No ads. No upsells. No noise."
  }
];

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
      <div className="ambient ambient-hero" aria-hidden="true" />
      <div className="ambient ambient-diagonal" aria-hidden="true" />

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
          <div className="trust-strip" aria-label="UnitedVPN trust indicators">
            {trustIndicators.map((indicator) => (
              <span key={indicator}>{indicator}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section editorial-section">
        <div className="section-heading">
          <p className="eyebrow">Why UnitedVPN</p>
          <h2>Membership over scale.</h2>
          <p>
            UnitedVPN is built around trust, approval, and accountability.
          </p>
        </div>
        <div className="pillar-list">
          {principles.map((principle) => (
            <article className="pillar-item" key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section access-section">
        <div className="section-heading">
          <p className="eyebrow">How UnitedVPN works</p>
          <h2>Simple by design.</h2>
        </div>
        <ol className="access-track">
          {accessSteps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <Link className="button landing-primary section-cta" href="/signup">
          Request Access
        </Link>
      </section>

      <section className="landing-section benefits-section">
        <div className="section-heading">
          <p className="eyebrow">Membership benefits</p>
          <h2>What membership includes.</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section status-section">
        <div className="section-heading">
          <p className="eyebrow">Network Status</p>
          <h2>Private operations, visible at a glance.</h2>
        </div>
        <div className="status-board" aria-label="UnitedVPN network status">
          <div className="status-board-header">
            <span>Singapore Node</span>
            <strong>Online</strong>
          </div>
          <dl className="status-metrics">
            <div>
              <dt>Status</dt>
              <dd>Online</dd>
            </div>
            <div>
              <dt>Member Capacity</dt>
              <dd>Current / 20</dd>
            </div>
            <div>
              <dt>Uptime</dt>
              <dd>99.9%</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-copy">
          <strong>UnitedVPN</strong>
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
