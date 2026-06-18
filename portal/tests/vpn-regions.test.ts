import assert from "node:assert/strict";
import test from "node:test";
import {
  getPublicVpnRegions,
  getVpnRegionForRequest,
  isVpnRegionConfigured
} from "../lib/vpn-regions.ts";

const originalEnv = { ...process.env } as NodeJS.ProcessEnv;

function resetEnv(overrides: Record<string, string | undefined> = {}) {
  process.env = { ...originalEnv, ...overrides } as NodeJS.ProcessEnv;
}

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("defaults missing region requests to Singapore", () => {
  resetEnv();

  const region = getVpnRegionForRequest(null);

  assert.equal(region.id, "sg");
  assert.equal(region.profileName, "UNITEDVPN Singapore");
});

test("rejects unsupported region values", () => {
  resetEnv();

  assert.throws(
    () => getVpnRegionForRequest("us"),
    /Unsupported VPN region/
  );
});

test("only marks UK configured when enabled and required UK env vars exist", () => {
  resetEnv({
    ENABLE_UK_REGION: "true",
    WG_UK_ENDPOINT_HOST: "45.63.96.40",
    WG_UK_ENDPOINT_PORT: "51820",
    WG_UK_SERVER_PUBLIC_KEY: "uk-public-key",
    WG_UK_VPN_SUBNET: "10.9.0.0/24"
  });

  const uk = getVpnRegionForRequest("uk");

  assert.equal(isVpnRegionConfigured(uk), true);
});

test("keeps UK disabled when the enable flag is false", () => {
  resetEnv({
    ENABLE_UK_REGION: "false",
    WG_UK_ENDPOINT_HOST: "45.63.96.40",
    WG_UK_ENDPOINT_PORT: "51820",
    WG_UK_SERVER_PUBLIC_KEY: "uk-public-key",
    WG_UK_VPN_SUBNET: "10.9.0.0/24"
  });

  const uk = getVpnRegionForRequest("uk");

  assert.equal(isVpnRegionConfigured(uk), false);
});

test("exposes public region metadata without server public keys", () => {
  resetEnv({
    ENABLE_UK_REGION: "true",
    WG_UK_ENDPOINT_HOST: "45.63.96.40",
    WG_UK_SERVER_PUBLIC_KEY: "uk-public-key",
    WG_UK_VPN_SUBNET: "10.9.0.0/24"
  });

  const regions = getPublicVpnRegions();
  const uk = regions.find((region) => region.id === "uk");

  assert.equal(uk?.displayName, "United Kingdom");
  assert.equal(uk?.enabled, true);
  assert.equal("serverPublicKey" in (uk ?? {}), false);
});
