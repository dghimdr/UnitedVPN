import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const accessSteps = [
  {
    title: "Request",
    text: "Create an account and request private network access."
  },
  {
    title: "Review",
    text: "Access stays pending until an admin approves the request."
  },
  {
    title: "Connect",
    text: "Approved users receive one WireGuard profile for one device."
  }
];

const devices = [
  {
    title: "iPhone",
    text: "Scan the QR code in the WireGuard app."
  },
  {
    title: "Android",
    text: "Scan the QR code in the WireGuard app."
  },
  {
    title: "Mac",
    text: "WireGuard config download support is planned for desktop setup."
  },
  {
    title: "Windows",
    text: "WireGuard config download support is planned for desktop setup."
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
      <section className="landing-hero">
        <div className="hero-stripes" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">Private WireGuard portal</p>
          <h1>UnitedVPN</h1>
          <p className="hero-kicker">Private access for trusted people.</p>
          <p className="hero-subtitle">
            Secure, simple VPN access through a private network built for
            approved users only.
          </p>
          <div className="hero-actions" aria-label="UnitedVPN account actions">
            <Link className="button landing-primary" href="/signup">
              Request Access
            </Link>
            <Link className="button landing-secondary" href="/login">
              Sign In
            </Link>
          </div>
          <div className="hero-meta" aria-label="Access controls">
            <span>Invite/request only</span>
            <span>Admin approved</span>
            <span>One device</span>
          </div>
        </div>
        <div className="signal-card" aria-label="UnitedVPN access status">
          <div className="signal-topline">
            <span className="signal-dot" />
            Private network
          </div>
          <div className="signal-grid">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="signal-footer">
            <span>Manual approval</span>
            <strong>Approved users only</strong>
          </div>
        </div>
      </section>

      <section className="landing-section split-section">
        <div>
          <p className="eyebrow">What it is</p>
          <h2>Private infrastructure for trusted access.</h2>
        </div>
        <p>
          UnitedVPN is a private WireGuard VPN for a small approved group. It is
          built for controlled access, simple setup, and clear separation
          between requesting access, approval, and connection.
        </p>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <p className="eyebrow">How access works</p>
          <h2>Requests stay gated until approved.</h2>
        </div>
        <div className="landing-grid three">
          {accessSteps.map((step, index) => (
            <article className="landing-card" key={step.title}>
              <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <p className="eyebrow">Supported devices</p>
          <h2>One approved profile per user.</h2>
        </div>
        <div className="landing-grid four">
          {devices.map((device) => (
            <article className="device-card" key={device.title}>
              <h3>{device.title}</h3>
              <p>{device.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section split-section security-note">
        <div>
          <p className="eyebrow">Privacy and security</p>
          <h2>No public access. No automatic approval.</h2>
        </div>
        <p>
          Requests are reviewed before access is granted. The portal does not
          sell VPN service, process payments, or publish server details. Access
          can be revoked by an admin when needed.
        </p>
      </section>

      <section className="landing-cta">
        <p className="eyebrow">Request access</p>
        <h2>Start with an account request.</h2>
        <p>
          If approved, your portal dashboard will show the setup option for your
          device.
        </p>
        <div className="hero-actions">
          <Link className="button landing-primary" href="/signup">
            Request Access
          </Link>
          <Link className="button landing-secondary" href="/login">
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
