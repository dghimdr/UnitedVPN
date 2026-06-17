import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <section className="panel stack">
        <h1>Private UnitedVPN access</h1>
        <p>
          Sign up with your email. An admin approves trusted friends and family
          manually before any WireGuard configuration is created.
        </p>
        <div className="row">
          <Link className="button" href="/auth/signup">
            Request access
          </Link>
          <Link className="button secondary" href="/auth/login">
            I already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
