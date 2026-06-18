import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { callVpnAgent, getVpnAgentStatus } from "@/lib/vpn-agent";
import { getConfiguredVpnRegionIds } from "@/lib/vpn-regions";
import { vpnUsernameFromUserId } from "@/lib/usernames";

export async function POST(request: Request) {
  const adminCheck = await requireAdminApi();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const vpnAgentStatus = getVpnAgentStatus();
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
  const approvedAt = new Date().toISOString();

  if (!vpnAgentStatus.configured) {
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        status: "approved",
        approved_at: approvedAt,
        revoked_at: null
      })
      .eq("id", profile.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.redirect(
      new URL("/admin?message=approved-db-only", request.url),
      303
    );
  }

  try {
    await callVpnAgent("/v1/provision", {
      method: "POST",
      body: { username: vpnUsername }
    });

    if (getConfiguredVpnRegionIds().includes("uk")) {
      await callVpnAgent("/v1/provision/uk", {
        method: "POST",
        body: { username: vpnUsername }
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "VPN provisioning failed";
    console.error("UnitedVPN approve provisioning failed", { message });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      status: "approved",
      vpn_username: vpnUsername,
      approved_at: approvedAt,
      provisioned_at: approvedAt,
      revoked_at: null
    })
    .eq("id", profile.id);

  if (updateError) {
    await callVpnAgent("/v1/revoke", {
      method: "POST",
      body: { username: vpnUsername }
    }).catch((revokeError) => {
      console.error("UnitedVPN approve rollback revoke failed", {
        message:
          revokeError instanceof Error
            ? revokeError.message
            : "Unknown revoke rollback error"
      });
    });

    if (getConfiguredVpnRegionIds().includes("uk")) {
      await callVpnAgent("/v1/revoke/uk", {
        method: "POST",
        body: { username: vpnUsername }
      }).catch((revokeError) => {
        console.error("UnitedVPN approve rollback UK revoke failed", {
          message:
            revokeError instanceof Error
              ? revokeError.message
              : "Unknown UK revoke rollback error"
        });
      });
    }

    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
