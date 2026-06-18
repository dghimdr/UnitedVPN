import crypto from "node:crypto";

type AgentMethod = "GET" | "POST";
type VpnAgentStatus = {
  configured: boolean;
  reason: string | null;
  baseUrlPresent: boolean;
  baseUrlHost: string | null;
  baseUrlHasPath: boolean;
  secretPresent: boolean;
  secretEnvName: string | null;
};

export type VpnAgentRequestContext = {
  region?: string;
  asset?: string;
};

export class VpnAgentError extends Error {
  code: string;
  upstreamStatus: number | null;
  targetHost: string | null;
  targetPath: string | null;
  region: string | null;
  asset: string | null;

  constructor({
    message,
    code,
    upstreamStatus = null,
    targetHost = null,
    targetPath = null,
    region = null,
    asset = null
  }: {
    message: string;
    code: string;
    upstreamStatus?: number | null;
    targetHost?: string | null;
    targetPath?: string | null;
    region?: string | null;
    asset?: string | null;
  }) {
    super(message);
    this.name = "VpnAgentError";
    this.code = code;
    this.upstreamStatus = upstreamStatus;
    this.targetHost = targetHost;
    this.targetPath = targetPath;
    this.region = region;
    this.asset = asset;
  }
}

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

function redactClientPath(path: string) {
  return path.replace(
    /^\/v1\/client\/[^/]+(\/(?:sg|uk))?\/(config|qr)$/,
    "/v1/client/:username$1/$2"
  );
}

function resolveVpnAgentSecret() {
  if (process.env.VPS_AGENT_SHARED_SECRET) {
    return {
      value: process.env.VPS_AGENT_SHARED_SECRET,
      envName: "VPS_AGENT_SHARED_SECRET"
    };
  }

  if (process.env.VPS_AGENT_SECRET) {
    return {
      value: process.env.VPS_AGENT_SECRET,
      envName: "VPS_AGENT_SECRET"
    };
  }

  return { value: undefined, envName: null };
}

function getBaseUrlValue() {
  return process.env.VPS_AGENT_BASE_URL?.trim().replace(/\/+$/, "");
}

function getBaseUrlParts(baseUrl: string | undefined) {
  if (!baseUrl) {
    return {
      url: null,
      host: null,
      hasPath: false
    };
  }

  try {
    const parsed = new URL(baseUrl);
    return {
      url: parsed,
      host: parsed.host,
      hasPath: parsed.pathname !== "/"
    };
  } catch {
    return {
      url: null,
      host: null,
      hasPath: false
    };
  }
}

export function getVpnAgentStatus(): VpnAgentStatus {
  const baseUrl = getBaseUrlValue();
  const secret = resolveVpnAgentSecret();
  const baseUrlParts = getBaseUrlParts(baseUrl);

  if (!baseUrl) {
    return {
      configured: false,
      reason: "VPS_AGENT_BASE_URL is not configured.",
      baseUrlPresent: false,
      baseUrlHost: null,
      baseUrlHasPath: false,
      secretPresent: Boolean(secret.value),
      secretEnvName: secret.envName
    };
  }

  if (isPlaceholder(baseUrl)) {
    return {
      configured: false,
      reason: "VPS_AGENT_BASE_URL is still set to a placeholder value.",
      baseUrlPresent: true,
      baseUrlHost: baseUrlParts.host,
      baseUrlHasPath: baseUrlParts.hasPath,
      secretPresent: Boolean(secret.value),
      secretEnvName: secret.envName
    };
  }

  if (!baseUrlParts.url) {
    return {
      configured: false,
      reason: "VPS_AGENT_BASE_URL is not a valid URL.",
      baseUrlPresent: true,
      baseUrlHost: null,
      baseUrlHasPath: false,
      secretPresent: Boolean(secret.value),
      secretEnvName: secret.envName
    };
  }

  if (baseUrlParts.hasPath) {
    return {
      configured: false,
      reason: "VPS_AGENT_BASE_URL must not include a path such as /v1.",
      baseUrlPresent: true,
      baseUrlHost: baseUrlParts.host,
      baseUrlHasPath: true,
      secretPresent: Boolean(secret.value),
      secretEnvName: secret.envName
    };
  }

  if (!secret.value) {
    return {
      configured: false,
      reason: "VPS_AGENT_SHARED_SECRET or VPS_AGENT_SECRET is not configured.",
      baseUrlPresent: true,
      baseUrlHost: baseUrlParts.host,
      baseUrlHasPath: false,
      secretPresent: false,
      secretEnvName: null
    };
  }

  if (isPlaceholder(secret.value)) {
    return {
      configured: false,
      reason: `${secret.envName} is still set to a placeholder value.`,
      baseUrlPresent: true,
      baseUrlHost: baseUrlParts.host,
      baseUrlHasPath: false,
      secretPresent: true,
      secretEnvName: secret.envName
    };
  }

  return {
    configured: true,
    reason: null,
    baseUrlPresent: true,
    baseUrlHost: baseUrlParts.host,
    baseUrlHasPath: false,
    secretPresent: true,
    secretEnvName: secret.envName
  };
}

function getFetchErrorCode(error: unknown) {
  if (!(error instanceof Error)) {
    return "FETCH_FAILED";
  }

  const cause = "cause" in error ? error.cause : null;
  if (
    cause &&
    typeof cause === "object" &&
    "code" in cause &&
    typeof cause.code === "string"
  ) {
    return cause.code;
  }

  return error.name || "FETCH_FAILED";
}

export function getVpnAgentTarget(path: string) {
  const baseUrl = getBaseUrlValue();
  const parts = getBaseUrlParts(baseUrl);

  if (!baseUrl || !parts.url) {
    return {
      url: null,
      host: parts.host,
      path: redactClientPath(path)
    };
  }

  return {
    url: `${baseUrl}${path}`,
    host: parts.host,
    path: redactClientPath(path)
  };
}

export async function callVpnAgent<T>(
  path: string,
  options: { method?: AgentMethod; body?: unknown; context?: VpnAgentRequestContext } = {}
): Promise<T> {
  const status = getVpnAgentStatus();
  const target = getVpnAgentTarget(path);
  const context = options.context ?? {};

  if (!status.configured) {
    console.error("UnitedVPN agent request blocked by configuration", {
      code: "VPN_AGENT_CONFIG_ERROR",
      reason: status.reason,
      baseUrlPresent: status.baseUrlPresent,
      baseUrlHost: status.baseUrlHost,
      baseUrlHasPath: status.baseUrlHasPath,
      secretPresent: status.secretPresent,
      secretEnvName: status.secretEnvName,
      targetPath: target.path,
      region: context.region ?? null,
      asset: context.asset ?? null
    });

    throw new VpnAgentError({
      message: status.reason ?? "VPS agent is not configured.",
      code: "VPN_AGENT_CONFIG_ERROR",
      targetHost: status.baseUrlHost,
      targetPath: target.path,
      region: context.region,
      asset: context.asset
    });
  }

  const method = options.method ?? "GET";
  const body = options.body ? JSON.stringify(options.body) : "";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = resolveVpnAgentSecret();
  if (!secret.value) {
    throw new VpnAgentError({
      message: "VPS agent secret is not configured.",
      code: "VPN_AGENT_CONFIG_ERROR",
      targetHost: target.host,
      targetPath: target.path,
      region: context.region,
      asset: context.asset
    });
  }

  const signaturePayload = `${timestamp}.${method}.${path}.${body}`;
  const signature = crypto
    .createHmac("sha256", secret.value)
    .update(signaturePayload)
    .digest("hex");

  console.info("UnitedVPN agent request", {
    method,
    targetHost: target.host,
    targetPath: target.path,
    baseUrlPresent: status.baseUrlPresent,
    secretPresent: status.secretPresent,
    secretEnvName: status.secretEnvName,
    region: context.region ?? null,
    asset: context.asset ?? null
  });

  let response: Response;
  try {
    response = await fetch(target.url ?? "", {
      method,
      headers: {
        "content-type": "application/json",
        "x-unitedvpn-timestamp": timestamp,
        "x-unitedvpn-signature": signature
      },
      body: body || undefined,
      cache: "no-store"
    });
  } catch (error) {
    const code = getFetchErrorCode(error);
    console.error("UnitedVPN agent fetch failed", {
      code,
      targetHost: target.host,
      targetPath: target.path,
      region: context.region ?? null,
      asset: context.asset ?? null,
      message: error instanceof Error ? error.message : "Unknown fetch error"
    });

    throw new VpnAgentError({
      message: `VPN agent fetch failed: ${code}`,
      code,
      targetHost: target.host,
      targetPath: target.path,
      region: context.region,
      asset: context.asset
    });
  }

  if (!response.ok) {
    const text = await response.text();
    console.error("UnitedVPN agent upstream error", {
      code: "VPN_AGENT_UPSTREAM_ERROR",
      upstreamStatus: response.status,
      targetHost: target.host,
      targetPath: target.path,
      region: context.region ?? null,
      asset: context.asset ?? null,
      responsePreview: text.slice(0, 300)
    });

    throw new VpnAgentError({
      message: `VPN agent ${response.status}: ${text}`,
      code: "VPN_AGENT_UPSTREAM_ERROR",
      upstreamStatus: response.status,
      targetHost: target.host,
      targetPath: target.path,
      region: context.region,
      asset: context.asset
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.arrayBuffer()) as T;
}
