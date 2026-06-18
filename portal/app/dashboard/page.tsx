import { getSupabaseEnvStatus } from "@/lib/env";
import { lookupProfileWithDiagnostics } from "@/lib/profile-lookup";
import { createClient } from "@/lib/supabase/server";
import { getPublicVpnRegions } from "@/lib/vpn-regions";
import { DashboardVpnOnboarding } from "./DashboardVpnOnboarding";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabaseEnvStatus = getSupabaseEnvStatus();

  if (!supabaseEnvStatus.configured) {
    return (
      <main className="shell">
        <section className="panel stack">
          <h1>Your UnitedVPN access</h1>
          <p className="notice error">
            Supabase is not configured for this portal instance.
          </p>
          <div className="detail-list">
            <div>
              <strong>Status</strong>
              <span>Configuration error</span>
            </div>
            <div>
              <strong>Details</strong>
              <span>{supabaseEnvStatus.reason}</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("UnitedVPN dashboard auth lookup failed", {
      message: authError.message
    });
  }

  if (!user) {
    return (
      <main className="shell">
        <section className="panel stack">
          <h1>Your UnitedVPN access</h1>
          <p className="notice error">
            You are not signed in. Sign in to view your UnitedVPN account.
          </p>
          <div className="detail-list">
            <div>
              <strong>Authentication</strong>
              <span>Unauthenticated</span>
            </div>
            <div>
              <strong>Session</strong>
              <span>{authError?.message ?? "No active session found."}</span>
            </div>
          </div>
          <a className="button" href="/auth/login">
            Sign in
          </a>
        </section>
      </main>
    );
  }

  const profileLookup = await lookupProfileWithDiagnostics(
    supabase,
    user.id,
    "dashboard"
  );
  const profile = profileLookup.profile;

  if (!profile) {
    return (
      <main className="shell">
        <section className="panel stack">
          <div>
            <h1>Your UnitedVPN access</h1>
            <p>{user.email}</p>
          </div>
          <p className="notice error">
            We could not load your UnitedVPN profile after login. Your session is
            active, but the profile lookup failed.
          </p>
          <div className="detail-list">
            <div>
              <strong>Current user</strong>
              <span>{user.email}</span>
            </div>
            <div>
              <strong>Profile lookup</strong>
              <span>
                {profileLookup.userClientError ?? "No profile row returned."}
              </span>
            </div>
          </div>
          <a className="button secondary" href="/auth/login">
            Sign in again
          </a>
        </section>
      </main>
    );
  }

  const statusClass = `status ${profile.status}`;
  const hasProvisionedVpnProfile =
    profile.status === "approved" &&
    profile.vpn_username &&
    profile.provisioned_at;
  const approvalDate = profile.approved_at
    ? new Date(profile.approved_at).toLocaleString()
    : "Not approved yet";
  const isApproved = profile.status === "approved";

  if (isApproved) {
    return (
      <main className="dashboard-shell">
        <DashboardVpnOnboarding
          canDownloadVpnConfig={Boolean(hasProvisionedVpnProfile)}
          regions={getPublicVpnRegions()}
          userEmail={profile.email || user.email || "Approved user"}
        />
        {!hasProvisionedVpnProfile ? (
          <p className="notice dashboard-provisioning-notice">
            VPN profile not provisioned yet. Your account is approved, but a
            WireGuard profile is not available yet.
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="panel stack">
        <div className="row">
          <div>
            <h1>Your UnitedVPN access</h1>
            <p>{profile.email || user.email}</p>
          </div>
          <span className={statusClass}>{profile.status}</span>
        </div>
        <div className="detail-list">
          <div>
            <strong>User email</strong>
            <span>{profile.email || user.email}</span>
          </div>
          <div>
            <strong>Role</strong>
            <span>{profile.role}</span>
          </div>
          <div>
            <strong>Current status</strong>
            <span>{profile.status}</span>
          </div>
          <div>
            <strong>Approval state</strong>
            <span>
              {profile.status === "approved"
                ? "Approved"
                : profile.status === "pending"
                  ? "Pending review"
                  : "Revoked"}
            </span>
          </div>
          <div>
            <strong>VPN profile</strong>
            <span>{profile.vpn_username ?? "Not provisioned"}</span>
          </div>
          <div>
            <strong>Approval date</strong>
            <span>{approvalDate}</span>
          </div>
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

      </section>
    </main>
  );
}
