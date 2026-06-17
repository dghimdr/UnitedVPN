import { NextResponse } from "next/server";
import { requireApprovedVpnProfile } from "@/lib/vpn-access";
import { callVpnAgent } from "@/lib/vpn-agent";

export async function GET() {
  const access = await requireApprovedVpnProfile();
  if (!access.ok) {
    return access.response;
  }

  const config = await callVpnAgent<ArrayBuffer>(
    `/v1/client/${encodeURIComponent(access.vpnUsername)}/config`
  );

  return new NextResponse(config, {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="${access.vpnUsername}.conf"`,
      "cache-control": "no-store"
    }
  });
}
