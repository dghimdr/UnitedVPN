import crypto from "node:crypto";
import { requiredEnv } from "@/lib/env";

type AgentMethod = "GET" | "POST";

export async function callVpnAgent<T>(
  path: string,
  options: { method?: AgentMethod; body?: unknown } = {}
): Promise<T> {
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
