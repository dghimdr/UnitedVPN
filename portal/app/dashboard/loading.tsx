export default function DashboardLoading() {
  return (
    <main className="shell">
      <section className="panel stack">
        <h1>Your UnitedVPN access</h1>
        <p className="notice">Loading your UnitedVPN account...</p>
        <div className="detail-list">
          <div>
            <strong>Authentication</strong>
            <span>Checking session</span>
          </div>
          <div>
            <strong>Profile</strong>
            <span>Loading</span>
          </div>
        </div>
      </section>
    </main>
  );
}
