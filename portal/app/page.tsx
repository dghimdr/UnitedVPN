import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const accessSteps = [
  {
    title: "Request",
    text: "Create an account with your email and a password."
  },
  {
    title: "Review",
    text: "Access stays pending until an admin approves the request."
  },
  {
    title: "Connect",
    text: "Approved users receive one WireGuard device profile."
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
    text: "Config download support is planned for desktop setup."
  },
  {
    title: "Windows",
    text: "Config download support is planned for desktop setup."
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
        <div className="hero-copy">
          <p className="eyebrow">UnitedVPN private portal</p>
          <h1>Private access. Simple setup. Built for people I trust.</h1>
          <p className="hero-subtitle">
            A focused WireGuard access portal for trusted users, with manual
            approval before any VPN profile is created.
          </p>
          <div className="hero-actions" aria-label="UnitedVPN account actions">
            <Link className="button landing-primary" href="/signup">
              Request Access
            </Link>
            <Link className="button landing-secondary" href="/login">
              Sign In
            </Link>
          </div>
        </div>
        <div className="signal-card" aria-label="UnitedVPN access status">
          <div className="signal-topline">
            <span className="signal-dot" />
            Invite only
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
            <strong>1 device</strong>
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
          built for controlled access, simple setup, and a clear separation
          between request, approval, and connection.
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
