import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user, profile };
}

type RequireAdminApiResult =
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: User;
      profile: Profile;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireAdminApi(): Promise<RequireAdminApiResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("UnitedVPN API admin check failed", {
      userFound: Boolean(user),
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      profileFound: false,
      profileId: null,
      profileEmail: null,
      profileRole: null,
      profileStatus: null,
      supabaseErrorCode: userError?.name ?? null,
      supabaseErrorMessage: userError?.message ?? null
    });

    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    console.error("UnitedVPN API admin check failed", {
      userFound: true,
      userId: user.id,
      userEmail: user.email ?? null,
      profileFound: Boolean(profile),
      profileId: profile?.id ?? null,
      profileEmail: profile?.email ?? null,
      profileRole: profile?.role ?? null,
      profileStatus: profile?.status ?? null,
      supabaseErrorCode: profileError?.code ?? null,
      supabaseErrorMessage: profileError?.message ?? null
    });

    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    };
  }

  return { ok: true, supabase, user, profile };
}
