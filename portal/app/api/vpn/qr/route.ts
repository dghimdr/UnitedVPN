import { NextResponse } from "next/server";
import { requireApprovedVpnProfile } from "@/lib/vpn-access";
import { callVpnAgent } from "@/lib/vpn-agent";

export async function GET() {
  const access = await requireApprovedVpnProfile();
  if (!access.ok) {
    return access.response;
  }

  const png = await callVpnAgent<ArrayBuffer>(
    `/v1/client/${encodeURIComponent(access.vpnUsername)}/qr`
  );

  return new NextResponse(png, {
    headers: {
      "content-type": "image/png",
      "cache-control": "no-store"
    }
  });
}
