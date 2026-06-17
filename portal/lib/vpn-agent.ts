import crypto from "node:crypto";
import { requiredEnv } from "@/lib/env";

type AgentMethod = "GET" | "POST";
type VpnAgentStatus = {
  configured: boolean;
  reason: string | null;
};

function isPlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    normalized.includes("example.com") ||
    normalized.includes("placeholder") ||
    normalized.includes("changeme") ||
    normalized.includes("replace-me")
  );
}

export function getVpnAgentStatus(): VpnAgentStatus {
  const baseUrl = process.env.VPS_AGENT_BASE_URL;
  const secret = process.env.VPS_AGENT_SHARED_SECRET;

  if (!baseUrl) {
    return {
      configured: false,
      reason: "VPS_AGENT_BASE_URL is not configured."
    };
  }

  if (isPlaceholder(baseUrl)) {
    return {
      configured: false,
      reason: "VPS_AGENT_BASE_URL is still set to a placeholder value."
    };
  }

  if (!secret) {
    return {
      configured: false,
      reason: "VPS_AGENT_SHARED_SECRET is not configured."
    };
  }

  if (isPlaceholder(secret)) {
    return {
      configured: false,
      reason: "VPS_AGENT_SHARED_SECRET is still set to a placeholder value."
    };
  }

  return { configured: true, reason: null };
}

export async function callVpnAgent<T>(
  path: string,
  options: { method?: AgentMethod; body?: unknown } = {}
): Promise<T> {
  const status = getVpnAgentStatus();

  if (!status.configured) {
    throw new Error(status.reason ?? "VPS agent is not configured.");
  }

  const method = options.method ?? "GET";
  const body = options.body ? JSON.stringify(options.body) : "";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = requiredEnv("VPS_AGENT_SHARED_SECRET");
  const signaturePayload = `${timestamp}.${method}.${path}.${body}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signaturePayload)
    .digest("hex");

  const response = await fetch(`${requiredEnv("VPS_AGENT_BASE_URL")}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-unitedvpn-timestamp": timestamp,
      "x-unitedvpn-signature": signature
    },
    body: body || undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`VPN agent ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.arrayBuffer()) as T;
}
