import { NextResponse } from "next/server";
import { requireApprovedVpnProfile } from "@/lib/vpn-access";
import { callVpnAgent } from "@/lib/vpn-agent";
import {
  getVpnAgentAssetPath,
  getVpnRegionForRequest,
  isVpnRegionConfigured,
  type VpnRegionId
} from "@/lib/vpn-regions";

type VpnAsset = "config" | "qr";

function statusFromAgentError(error: unknown) {
  if (!(error instanceof Error)) {
    return 502;
  }

  const match = error.message.match(/^VPN agent (\d+):/);
  return match ? Number(match[1]) : 502;
}

function messageFromAgentError(error: unknown, regionId: VpnRegionId) {
  if (error instanceof Error && error.message.includes("VPN agent 404")) {
    return regionId === "uk"
      ? "UK VPN profile is not ready yet. Please contact admin."
      : "VPN profile is not ready yet. Please contact admin.";
  }

  return error instanceof Error ? error.message : "VPN profile request failed.";
}

export async function getVpnAssetResponse({
  asset,
  request,
  regionId
}: {
  asset: VpnAsset;
  request: Request;
  regionId?: VpnRegionId;
}) {
  const access = await requireApprovedVpnProfile();
  if (!access.ok) {
    return access.response;
  }

  let region;
  try {
    region = getVpnRegionForRequest(
      regionId ?? new URL(request.url).searchParams.get("region")
    );
  } catch {
    return NextResponse.json(
      { error: "Unsupported VPN region" },
      { status: 400 }
    );
  }

  if (!isVpnRegionConfigured(region)) {
    return NextResponse.json(
      {
        error:
          region.id === "uk"
            ? "UK VPN profile is not ready yet. Please contact admin."
            : "VPN region is not configured yet."
      },
      { status: 503 }
    );
  }

  try {
    const body = await callVpnAgent<ArrayBuffer>(
      getVpnAgentAssetPath({
        region,
        username: access.vpnUsername,
        asset
      })
    );

    if (asset === "qr") {
      return new NextResponse(body, {
        headers: {
          "content-type": "image/png",
          "cache-control": "no-store"
        }
      });
    }

    return new NextResponse(body, {
      headers: {
        "content-type": "application/x-wireguard-profile",
        "content-disposition": `attachment; filename="${access.vpnUsername}-${region.id}.conf"`,
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: messageFromAgentError(error, region.id) },
      { status: statusFromAgentError(error) }
    );
  }
}
