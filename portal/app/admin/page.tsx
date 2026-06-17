import { getSupabaseEnvStatus } from "@/lib/env";
import { lookupProfileWithDiagnostics } from "@/lib/profile-lookup";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import { getVpnAgentStatus } from "@/lib/vpn-agent";

export const dynamic = "force-dynamic";

type AdminMessage = "approved-db-only" | "revoked-db-only";

const adminMessages: Record<AdminMessage, string> = {
  "approved-db-only":
    "Approved in portal. VPN profile not provisioned because VPS agent is not connected.",
  "revoked-db-only":
    "Revoked in portal. VPN removal was skipped because VPS agent is not connected."
};

export default async function AdminPage({
  searchParams
}: {
  searchParams?: { message?: string };
}) {
  const supabaseEnvStatus = getSupabaseEnvStatus();

  if (!supabaseEnvStatus.configured) {
    return (
      <main className="shell">
        <section className="panel stack">
          <h1>Admin dashboard</h1>
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
    console.error("UnitedVPN admin auth lookup failed", {
      message: authError.message
    });
  }

  if (!user) {
    return (
      <main className="shell">
        <section className="panel stack">
          <h1>Admin dashboard</h1>
          <p className="notice error">
            You are not signed in. Sign in with an admin account to view this
            page.
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

  const vpnAgentStatus = getVpnAgentStatus();
  const currentProfileLookup = await lookupProfileWithDiagnostics(
    supabase,
    user.id,
    "admin"
  );
  const currentProfile = currentProfileLookup.profile;

  if (!currentProfile) {
    return (
      <main className="shell">
        <section className="panel stack">
          <div>
            <h1>Admin dashboard</h1>
            <p>{user.email}</p>
          </div>
          <p className="notice error">
            We could not verify your UnitedVPN admin profile after login.
          </p>
          <div className="detail-list">
            <div>
              <strong>Current email</strong>
              <span>{user.email}</span>
            </div>
            <div>
              <strong>Profile lookup</strong>
              <span>
                {currentProfileLookup.userClientError ??
                  "No profile row returned."}
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (currentProfile.role !== "admin") {
    return (
      <main className="shell">
        <section className="panel stack">
          <div>
            <h1>Admin dashboard</h1>
            <p>{currentProfile.email || user.email}</p>
          </div>
          <p className="notice error">
            You are signed in, but this account is not authorised for admin
            access.
          </p>
          <div className="detail-list">
            <div>
              <strong>Current user</strong>
              <span>{currentProfile.email || user.email}</span>
            </div>
            <div>
              <strong>Role</strong>
              <span>{currentProfile.role}</span>
            </div>
            <div>
              <strong>Status</strong>
              <span>{currentProfile.status}</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  let profiles: Profile[] = [];
  let profilesError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      profilesError = error.message;
      console.error("UnitedVPN admin profile list lookup failed", {
        code: error.code,
        message: error.message
      });
    } else {
      profiles = data ?? [];
    }
  } catch (error) {
    profilesError =
      error instanceof Error ? error.message : "Unknown admin lookup error.";
    console.error("UnitedVPN admin profile list lookup failed", {
      message: profilesError
    });
  }

  const approvedCount = profiles.filter(
    (profile) => profile.status === "approved"
  ).length;
  const pendingCount = profiles.filter(
    (profile) => profile.status === "pending"
  ).length;
  const revokedCount = profiles.filter(
    (profile) => profile.status === "revoked"
  ).length;
  const message =
    searchParams?.message === "approved-db-only" ||
    searchParams?.message === "revoked-db-only"
      ? adminMessages[searchParams.message]
      : null;

  return (
    <main className="shell">
      <section className="panel stack">
        <div className="row">
          <div>
            <h1>Admin dashboard</h1>
            <p>Current admin: {currentProfile.email || user.email}</p>
          </div>
          <span className="status">{approvedCount}/20 approved</span>
        </div>
        <div className="detail-list">
          <div>
            <strong>Admin email</strong>
            <span>{currentProfile.email || user.email}</span>
          </div>
          <div>
            <strong>Role</strong>
            <span>{currentProfile.role}</span>
          </div>
          <div>
            <strong>Status</strong>
            <span>{currentProfile.status}</span>
          </div>
          <div>
            <strong>Pending users</strong>
            <span>{pendingCount}</span>
          </div>
          <div>
            <strong>Approved users</strong>
            <span>{approvedCount}</span>
          </div>
          <div>
            <strong>Revoked users</strong>
            <span>{revokedCount}</span>
          </div>
        </div>

        {message ? <p className="notice">{message}</p> : null}

        {vpnAgentStatus.configured ? (
          <div className="notice">
            Approving creates exactly one WireGuard profile. Revoking removes
            the peer from the VPS and archives that user&apos;s client files.
          </div>
        ) : (
          <div className="notice">
            VPN provisioning is offline: {vpnAgentStatus.reason} Approve and
            revoke still update portal status, but WireGuard changes are
            skipped until the VPS agent is connected.
          </div>
        )}

        {profilesError ? (
          <p className="notice error">
            Profile list could not be loaded. {profilesError}
          </p>
        ) : null}

        {!profilesError && profiles.length === 0 ? (
          <p className="notice">No UnitedVPN profiles found yet.</p>
        ) : null}

        {!profilesError && profiles.length > 0 ? (
          <div className="notice">
            Pending users: {pendingCount}. Approved users: {approvedCount}.
            Revoked users: {revokedCount}.
          </div>
        ) : null}

        {!profilesError && profiles.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>VPN user</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td>{profile.email}</td>
                  <td>{profile.role}</td>
                  <td>
                    <span className={`status ${profile.status}`}>
                      {profile.status}
                    </span>
                  </td>
                  <td>{profile.vpn_username ?? "-"}</td>
                  <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                  <td>
                    {profile.status === "pending" ? (
                      <form method="post" action="/api/admin/approve">
                        <input type="hidden" name="userId" value={profile.id} />
                        <button type="submit">
                          Approve
                        </button>
                      </form>
                    ) : null}
                    {profile.status === "approved" ? (
                      <form method="post" action="/api/admin/revoke">
                        <input type="hidden" name="userId" value={profile.id} />
                        <button className="danger" type="submit">
                          Revoke
                        </button>
                      </form>
                    ) : null}
                    {profile.status === "revoked" ? <span>-</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </main>
  );
}
