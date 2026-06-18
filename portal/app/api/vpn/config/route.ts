import { getVpnAssetResponse } from "../assets";

export async function GET(request: Request) {
  return getVpnAssetResponse({ asset: "config", request });
}
