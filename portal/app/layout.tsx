import "./globals.css";
import { getSupabaseEnvStatus } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { LanguageProvider } from "./language-provider";
import { Topbar } from "./Topbar";

export const metadata = {
  title: "UnitedVPN Portal",
  description: "Private WireGuard access for approved UnitedVPN users"
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const supabaseEnvStatus = getSupabaseEnvStatus();
  let user = null;

  if (supabaseEnvStatus.configured) {
    try {
      const supabase = await createClient();
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();
      user = currentUser;
    } catch (error) {
      console.error("UnitedVPN layout auth lookup failed", {
        message:
          error instanceof Error ? error.message : "Unknown auth lookup error"
      });
    }
  } else {
    console.error("UnitedVPN layout auth lookup skipped", {
      message: supabaseEnvStatus.reason
    });
  }

  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Topbar isAuthenticated={Boolean(user)} />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
