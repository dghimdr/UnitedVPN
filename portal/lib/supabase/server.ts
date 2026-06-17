import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { requiredEnv } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };
type TypedSupabaseClient = SupabaseClient<
  Database,
  "public",
  "public",
  Database["public"]
>;

export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient<Database, "public", Database["public"]>(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Middleware refreshes auth cookies when Server Components cannot.
          }
        }
      }
    }
  ) as unknown as TypedSupabaseClient;
}
