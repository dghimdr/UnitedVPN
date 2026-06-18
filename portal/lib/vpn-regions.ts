export const vpnRegionIds = ["sg", "uk"] as const;

export type VpnRegionId = (typeof vpnRegionIds)[number];

export type VpnRegion = {
  id: VpnRegionId;
  displayName: string;
  displayNameKo: string;
  profileName: string;
  endpointHost: string | undefined;
  endpointPort: string;
  serverPublicKey: string | undefined;
  vpnSubnet: string | undefined;
};

export type PublicVpnRegion = Pick<
  VpnRegion,
  "id" | "displayName" | "displayNameKo" | "profileName"
> & {
  enabled: boolean;
};

const defaultWireGuardPort = "51820";

function envFlagEnabled(name: string) {
  return process.env[name] === "true";
}

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getVpnRegions(): Record<VpnRegionId, VpnRegion> {
  return {
    sg: {
      id: "sg",
      displayName: "Singapore",
      displayNameKo: "싱가포르",
      profileName: "UNITEDVPN Singapore",
      endpointHost: process.env.WG_SG_ENDPOINT_HOST,
      endpointPort: process.env.WG_SG_ENDPOINT_PORT || defaultWireGuardPort,
      serverPublicKey: process.env.WG_SG_SERVER_PUBLIC_KEY,
      vpnSubnet: process.env.WG_SG_VPN_SUBNET
    },
    uk: {
      id: "uk",
      displayName: "United Kingdom",
      displayNameKo: "영국",
      profileName: "UNITEDVPN UK",
      endpointHost: process.env.WG_UK_ENDPOINT_HOST,
      endpointPort: process.env.WG_UK_ENDPOINT_PORT || defaultWireGuardPort,
      serverPublicKey: process.env.WG_UK_SERVER_PUBLIC_KEY,
      vpnSubnet: process.env.WG_UK_VPN_SUBNET
    }
  };
}

export function isVpnRegionId(value: string | null): value is VpnRegionId {
  return vpnRegionIds.includes(value as VpnRegionId);
}

export function getVpnRegionForRequest(value: string | null): VpnRegion {
  const regionId = value || "sg";

  if (!isVpnRegionId(regionId)) {
    throw new Error(`Unsupported VPN region: ${regionId}`);
  }

  return getVpnRegions()[regionId];
}

export function isVpnRegionConfigured(region: VpnRegion) {
  if (region.id === "sg") {
    return true;
  }

  return (
    envFlagEnabled("ENABLE_UK_REGION") &&
    hasValue(region.endpointHost) &&
    hasValue(region.serverPublicKey) &&
    hasValue(region.vpnSubnet)
  );
}

export function getPublicVpnRegions(): PublicVpnRegion[] {
  return vpnRegionIds.map((id) => {
    const region = getVpnRegions()[id];

    return {
      id: region.id,
      displayName: region.displayName,
      displayNameKo: region.displayNameKo,
      profileName: region.profileName,
      enabled: isVpnRegionConfigured(region)
    };
  });
}

export function getConfiguredVpnRegionIds(): VpnRegionId[] {
  return vpnRegionIds.filter((id) => isVpnRegionConfigured(getVpnRegions()[id]));
}

export function getVpnAgentAssetPath({
  region,
  username,
  asset
}: {
  region: VpnRegion;
  username: string;
  asset: "config" | "qr";
}) {
  const safeUsername = encodeURIComponent(username);

  if (region.id === "sg") {
    return `/v1/client/${safeUsername}/${asset}`;
  }

  return `/v1/client/${safeUsername}/${region.id}/${asset}`;
}

export function getVpnPortalAssetPath({
  region,
  asset
}: {
  region: Pick<VpnRegion, "id">;
  asset: "config" | "qr";
}) {
  if (region.id === "sg") {
    return `/api/vpn/${asset}`;
  }

  return `/api/vpn/${region.id}/${asset}`;
}
