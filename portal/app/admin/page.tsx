import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const approvedCount =
    profiles?.filter((profile) => profile.status === "approved").length ?? 0;

  return (
    <main className="shell">
      <section className="panel stack">
        <div className="row">
          <div>
            <h1>Admin dashboard</h1>
            <p>Approve trusted users and revoke VPN access immediately.</p>
          </div>
          <span className="status">{approvedCount}/20 approved</span>
        </div>
        <div className="notice">
          Approving creates exactly one WireGuard profile. Revoking removes the
          peer from the VPS and archives that user&apos;s client files.
        </div>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>VPN user</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.email}</td>
                <td>
                  <span className={`status ${profile.status}`}>
                    {profile.status}
                  </span>
                </td>
                <td>{profile.vpn_username ?? "-"}</td>
                <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                <td>
                  {profile.status === "pending" ? (
                    <form method="post" action={`/api/admin/approve`}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <button type="submit">Approve</button>
                    </form>
                  ) : null}
                  {profile.status === "approved" ? (
                    <form method="post" action={`/api/admin/revoke`}>
                      <input type="hidden" name="userId" value={profile.id} />
                      <button className="danger" type="submit">
                        Revoke
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
