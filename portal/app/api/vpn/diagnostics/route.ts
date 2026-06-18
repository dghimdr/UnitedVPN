import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import {
  callVpnAgent,
  getVpnAgentStatus,
  getVpnAgentTarget,
  VpnAgentError
} from "@/lib/vpn-agent";
import { getVpnAgentAssetPath, getVpnRegionForRequest } from "@/lib/vpn-regions";

const usernamePattern = /^[a-zA-Z0-9_-]{1,32}$/;

function getErrorPayload(error: unknown) {
  if (error instanceof VpnAgentError) {
    return {
      ok: false,
      code: error.code,
      upstreamStatus: error.upstreamStatus,
      targetHost: error.targetHost,
      targetPath: error.targetPath,
      message: error.message
    };
  }

  return {
    ok: false,
    code: "UNKNOWN_ERROR",
    upstreamStatus: null,
    targetHost: null,
    targetPath: null,
    message: error instanceof Error ? error.message : "Unknown error"
  };
}

async function checkHealthz() {
  const target = getVpnAgentTarget("/healthz");

  if (!target.url) {
    return {
      ok: false,
      status: null,
      targetHost: target.host,
      targetPath: target.path,
      error: "VPS_AGENT_BASE_URL is not valid."
    };
  }

  try {
    const response = await fetch(target.url, { cache: "no-store" });
    return {
      ok: response.ok,
      status: response.status,
      targetHost: target.host,
      targetPath: target.path,
      contentType: response.headers.get("content-type")
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      targetHost: target.host,
      targetPath: target.path,
      error: error instanceof Error ? error.message : "Unknown fetch error"
    };
  }
}

export async function GET(request: Request) {
  const adminCheck = await requireAdminApi();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const requestUrl = new URL(request.url);
  const requestedUsername = requestUrl.searchParams.get("username");
  const username = requestedUsername || adminCheck.profile.vpn_username;

  if (!username || !usernamePattern.test(username)) {
    return NextResponse.json(
      {
        error:
          "A valid vpn_username is required. Pass ?username=<vpn_username> as an admin."
      },
      { status: 400 }
    );
  }

  const agentStatus = getVpnAgentStatus();
  const healthz = await checkHealthz();
  const sgRegion = getVpnRegionForRequest("sg");
  const sgConfigPath = getVpnAgentAssetPath({
    region: sgRegion,
    username,
    asset: "config"
  });

  let sgConfig;
  try {
    const body = await callVpnAgent<ArrayBuffer>(sgConfigPath, {
      context: { region: "sg", asset: "config" }
    });
    sgConfig = {
      ok: true,
      status: 200,
      byteLength: body.byteLength,
      targetHost: getVpnAgentTarget(sgConfigPath).host,
      targetPath: getVpnAgentTarget(sgConfigPath).path
    };
  } catch (error) {
    sgConfig = getErrorPayload(error);
  }

  return NextResponse.json(
    {
      ok: agentStatus.configured && healthz.ok && sgConfig.ok,
      agent: {
        configured: agentStatus.configured,
        reason: agentStatus.reason,
        baseUrlPresent: agentStatus.baseUrlPresent,
        baseUrlHost: agentStatus.baseUrlHost,
        baseUrlHasPath: agentStatus.baseUrlHasPath,
        secretPresent: agentStatus.secretPresent,
        secretEnvName: agentStatus.secretEnvName
      },
      checks: {
        healthz,
        sgConfig
      }
    },
    { headers: { "cache-control": "no-store" } }
  );
}
