import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

type VpnAccessResult =
  | {
      ok: true;
      profile: Profile;
      vpnUsername: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireApprovedVpnProfile(): Promise<VpnAccessResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not approved" }, { status: 403 })
    };
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.status !== "approved") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not approved" }, { status: 403 })
    };
  }

  if (!profile.vpn_username) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "VPN profile not found" },
        { status: 404 }
      )
    };
  }

  return { ok: true, profile, vpnUsername: profile.vpn_username };
}
