import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { callVpnAgent } from "@/lib/vpn-agent";

export async function GET() {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || profile?.status !== "approved" || !profile.vpn_username) {
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  const config = await callVpnAgent<ArrayBuffer>(
    `/v1/client/${encodeURIComponent(profile.vpn_username)}/config`
  );

  return new NextResponse(config, {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${profile.vpn_username}.conf"`,
      "cache-control": "no-store"
    }
  });
}
