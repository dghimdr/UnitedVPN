import "./globals.css";
import Link from "next/link";
import { signOut } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "UnitedVPN Portal",
  description: "Private WireGuard access for approved UnitedVPN users"
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link className="brand" href={user ? "/dashboard" : "/"}>
            UnitedVPN Portal
          </Link>
          <nav className="row">
            {user ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/admin">Admin</Link>
                <form action={signOut}>
                  <button className="secondary" type="submit">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link className="button" href="/signup">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
