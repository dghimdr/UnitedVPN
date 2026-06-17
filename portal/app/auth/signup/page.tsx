import Link from "next/link";
import { signUp } from "@/lib/actions";

export default function SignUpPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="shell">
      <section className="panel stack">
        <h1>Request UnitedVPN access</h1>
        <p>
          Accounts start pending. An admin approves trusted users before a VPN
          profile is created.
        </p>
        {searchParams.error ? (
          <p className="notice error">{searchParams.error}</p>
        ) : null}
        <form className="stack" action={signUp}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <button type="submit">Create account</button>
        </form>
        <p>
          Already approved? <Link href="/auth/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
