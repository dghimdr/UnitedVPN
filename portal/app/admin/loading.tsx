export default function AdminLoading() {
  return (
    <main className="shell">
      <section className="panel stack">
        <h1>Admin dashboard</h1>
        <p className="notice">Loading admin profile and UnitedVPN users...</p>
        <div className="detail-list">
          <div>
            <strong>Authentication</strong>
            <span>Checking session</span>
          </div>
          <div>
            <strong>Profiles</strong>
            <span>Loading</span>
          </div>
        </div>
      </section>
    </main>
  );
}
