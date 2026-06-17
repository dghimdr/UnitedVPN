import Link from "next/link";
import { signIn } from "@/lib/actions";

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="shell">
      <section className="panel stack">
        <h1>Log in</h1>
        {searchParams.error ? (
          <p className="notice error">{searchParams.error}</p>
        ) : null}
        <form className="stack" action={signIn}>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit">Log in</button>
        </form>
        <p>
          Need access? <Link href="/auth/signup">Request an account</Link>
        </p>
      </section>
    </main>
  );
}
