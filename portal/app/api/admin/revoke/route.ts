import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { callVpnAgent, getVpnAgentStatus } from "@/lib/vpn-agent";

export async function POST(request: Request) {
  await requireAdmin();
  const vpnAgentStatus = getVpnAgentStatus();

  if (!vpnAgentStatus.configured) {
    return NextResponse.json(
      { error: vpnAgentStatus.reason ?? "VPS agent is not configured" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "");
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (profile.vpn_username) {
    try {
      await callVpnAgent("/v1/revoke", {
        method: "POST",
        body: { username: profile.vpn_username }
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "VPN revocation failed";
      console.error("UnitedVPN revoke failed", { message });
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString()
    })
    .eq("id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
