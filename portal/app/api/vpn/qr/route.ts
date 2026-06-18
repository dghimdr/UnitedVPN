import { NextResponse } from "next/server";
import { requireApprovedVpnProfile } from "@/lib/vpn-access";
import { callVpnAgent } from "@/lib/vpn-agent";
import {
  getVpnAgentAssetPath,
  getVpnRegionForRequest,
  isVpnRegionConfigured
} from "@/lib/vpn-regions";

export async function GET(request: Request) {
  const access = await requireApprovedVpnProfile();
  if (!access.ok) {
    return access.response;
  }

  let region;
  try {
    region = getVpnRegionForRequest(
      new URL(request.url).searchParams.get("region")
    );
  } catch {
    return NextResponse.json(
      { error: "Unsupported VPN region" },
      { status: 400 }
    );
  }

  if (!isVpnRegionConfigured(region)) {
    return NextResponse.json(
      { error: "VPN region is not configured yet" },
      { status: 503 }
    );
  }

  const png = await callVpnAgent<ArrayBuffer>(
    getVpnAgentAssetPath({
      region,
      username: access.vpnUsername,
      asset: "qr"
    })
  );

  return new NextResponse(png, {
    headers: {
      "content-type": "image/png",
      "cache-control": "no-store"
    }
  });
}
