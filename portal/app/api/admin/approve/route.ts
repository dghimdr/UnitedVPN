import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { callVpnAgent } from "@/lib/vpn-agent";
import { vpnUsernameFromUserId } from "@/lib/usernames";

export async function POST(request: Request) {
  await requireAdmin();
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

  if (profile.status === "approved") {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");

  if ((count ?? 0) >= 20) {
    return NextResponse.json(
      { error: "UnitedVPN is at the 20 user limit" },
      { status: 409 }
    );
  }

  const vpnUsername = profile.vpn_username ?? vpnUsernameFromUserId(profile.id);

  await callVpnAgent("/v1/provision", {
    method: "POST",
    body: { username: vpnUsername }
  });

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      status: "approved",
      vpn_username: vpnUsername,
      approved_at: new Date().toISOString(),
      provisioned_at: new Date().toISOString(),
      revoked_at: null
    })
    .eq("id", profile.id);

  if (updateError) {
    await callVpnAgent("/v1/revoke", {
      method: "POST",
      body: { username: vpnUsername }
    }).catch(() => undefined);

    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
