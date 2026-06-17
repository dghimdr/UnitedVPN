import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/auth/login");
  }

  const statusClass = `status ${profile.status}`;

  return (
    <main className="shell">
      <section className="panel stack">
        <div className="row">
          <div>
            <h1>Your UnitedVPN access</h1>
            <p>{profile.email}</p>
          </div>
          <span className={statusClass}>{profile.status}</span>
        </div>

        {profile.status === "pending" ? (
          <p className="notice">
            Your account is pending manual approval. No WireGuard config has
            been created yet.
          </p>
        ) : null}

        {profile.status === "revoked" ? (
          <p className="notice error">
            Your VPN access has been revoked. Any existing WireGuard profile
            should stop connecting.
          </p>
        ) : null}

        {profile.status === "approved" ? (
          <div className="grid two">
            <section className="stack">
              <h2>Phone setup</h2>
              <p>Scan this QR code in the WireGuard iPhone or Android app.</p>
              <img className="qr" src="/api/user/qr" alt="WireGuard QR code" />
            </section>
            <section className="stack">
              <h2>Computer setup</h2>
              <p>Download the WireGuard config for Mac or Windows.</p>
              <a className="button" href="/api/user/config">
                Download .conf
              </a>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
