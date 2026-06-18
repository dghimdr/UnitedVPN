import assert from "node:assert/strict";
import test from "node:test";
import { getVpnAgentStatus, getVpnAgentTarget } from "../lib/vpn-agent.ts";

const originalEnv = { ...process.env } as NodeJS.ProcessEnv;

function resetEnv(overrides: Record<string, string | undefined> = {}) {
  process.env = { ...originalEnv } as NodeJS.ProcessEnv;
  delete process.env.VPS_AGENT_BASE_URL;
  delete process.env.VPS_AGENT_SHARED_SECRET;
  delete process.env.VPS_AGENT_SECRET;

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("requires an agent base URL and secret", () => {
  resetEnv();

  const status = getVpnAgentStatus();

  assert.equal(status.configured, false);
  assert.equal(status.baseUrlPresent, false);
  assert.equal(status.secretPresent, false);
});

test("accepts VPS_AGENT_SHARED_SECRET as the canonical secret env var", () => {
  resetEnv({
    VPS_AGENT_BASE_URL: "http://45.77.251.176:8787",
    VPS_AGENT_SHARED_SECRET: "shared-secret"
  });

  const status = getVpnAgentStatus();

  assert.equal(status.configured, true);
  assert.equal(status.baseUrlHost, "45.77.251.176:8787");
  assert.equal(status.secretEnvName, "VPS_AGENT_SHARED_SECRET");
});

test("accepts VPS_AGENT_SECRET as a backwards-compatible secret env var", () => {
  resetEnv({
    VPS_AGENT_BASE_URL: "http://45.77.251.176:8787",
    VPS_AGENT_SECRET: "shared-secret"
  });

  const status = getVpnAgentStatus();

  assert.equal(status.configured, true);
  assert.equal(status.secretEnvName, "VPS_AGENT_SECRET");
});

test("rejects agent base URLs with a path to avoid duplicate /v1 prefixes", () => {
  resetEnv({
    VPS_AGENT_BASE_URL: "http://45.77.251.176:8787/v1",
    VPS_AGENT_SHARED_SECRET: "shared-secret"
  });

  const status = getVpnAgentStatus();

  assert.equal(status.configured, false);
  assert.equal(status.baseUrlHasPath, true);
  assert.match(status.reason ?? "", /must not include a path/);
});

test("redacts client usernames from diagnostic target paths", () => {
  resetEnv({
    VPS_AGENT_BASE_URL: "http://45.77.251.176:8787",
    VPS_AGENT_SHARED_SECRET: "shared-secret"
  });

  const target = getVpnAgentTarget("/v1/client/david/uk/config");

  assert.equal(target.url, "http://45.77.251.176:8787/v1/client/david/uk/config");
  assert.equal(target.host, "45.77.251.176:8787");
  assert.equal(target.path, "/v1/client/:username/uk/config");
});
