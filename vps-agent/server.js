import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { constants as fsConstants, createReadStream, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  envFlagEnabled,
  getProvisionScripts,
  getRegionClientsDir,
  getRevokeScripts,
  isBenignProvisionError,
  isBenignRevokeError
} from "./provisioning.js";

const port = Number(process.env.PORT ?? 8787);
const sharedSecret = requiredEnv("UNITEDVPN_SHARED_SECRET");
const repoDir = process.env.UNITEDVPN_REPO_DIR ?? "/opt/UnitedVPN";
const clientsDir = process.env.WIREGUARD_CLIENTS_DIR ?? "/etc/wireguard/clients";
const regionClientsDirs = {
  sg: process.env.WIREGUARD_SG_CLIENTS_DIR ?? clientsDir,
  uk: process.env.WIREGUARD_UK_CLIENTS_DIR ?? "/etc/wireguard/clients-uk"
};
const enableUkProvisioning = envFlagEnabled(process.env.ENABLE_UK_PROVISIONING);
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES ?? 4096);
const allowedSkewSeconds = 300;
const usernamePattern = /^[a-zA-Z0-9_-]{1,32}$/;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store"
  });
  res.end(body);
}

function safeCompare(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifySignature(req, body) {
  const timestamp = req.headers["x-unitedvpn-timestamp"];
  const signature = req.headers["x-unitedvpn-signature"];

  if (typeof timestamp !== "string" || typeof signature !== "string") {
    return false;
  }

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNumber) > allowedSkewSeconds) {
    return false;
  }

  const payload = `${timestamp}.${req.method}.${new URL(req.url, "http://localhost").pathname}.${body}`;
  const expected = crypto
    .createHmac("sha256", sharedSecret)
    .update(payload)
    .digest("hex");

  return safeCompare(expected, signature);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function validateUsername(username) {
  if (typeof username !== "string" || !usernamePattern.test(username)) {
    throw new Error("Invalid username");
  }
}

function runScript(scriptName, username, options = {}) {
  validateUsername(username);

  return new Promise((resolve, reject) => {
    const child = spawn("sudo", ["bash", path.join(repoDir, "scripts", scriptName), username], {
      cwd: repoDir,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout });
      } else if (
        options.allowExisting &&
        isBenignProvisionError(stderr || stdout)
      ) {
        resolve({ stdout });
      } else if (
        options.allowMissing &&
        isBenignRevokeError(stderr || stdout)
      ) {
        resolve({ stdout });
      } else {
        reject(new Error(stderr || stdout || `Script exited with ${code}`));
      }
    });
  });
}

async function sendFile(res, username, extension, contentType, region = "sg") {
  validateUsername(username);
  const selectedClientsDir = getRegionClientsDir({
    region,
    clientsDir,
    regionClientsDirs
  });
  const filePath = path.join(selectedClientsDir, username, `${username}.${extension}`);
  const resolved = path.resolve(filePath);
  const allowedPrefix = path.resolve(selectedClientsDir) + path.sep;

  if (!resolved.startsWith(allowedPrefix)) {
    sendJson(res, 400, { error: "Invalid path" });
    return;
  }

  try {
    await fs.access(resolved, fsConstants.R_OK);
  } catch {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  createReadStream(resolved).pipe(res);
}

export async function handle(req, res) {
  if (req.url === "/healthz") {
    sendJson(res, 200, { ok: true });
    return;
  }

  let body = "";
  try {
    body = await readBody(req);
  } catch {
    sendJson(res, 413, { error: "Request body too large" });
    return;
  }

  if (!verifySignature(req, body)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  const url = new URL(req.url, "http://localhost");

  try {
    if (req.method === "POST" && url.pathname === "/v1/provision") {
      const { username } = JSON.parse(body || "{}");
      const scripts = getProvisionScripts({ enableUkProvisioning });
      for (const scriptName of scripts) {
        await runScript(scriptName, username, { allowExisting: true });
      }
      sendJson(res, 200, { ok: true, username, regions: enableUkProvisioning ? ["sg", "uk"] : ["sg"] });
      return;
    }

    const regionalProvisionMatch = url.pathname.match(/^\/v1\/provision\/(sg|uk)$/);
    if (req.method === "POST" && regionalProvisionMatch) {
      const { username } = JSON.parse(body || "{}");
      const region = regionalProvisionMatch[1];
      const scripts = getProvisionScripts({
        enableUkProvisioning,
        region
      });
      for (const scriptName of scripts) {
        await runScript(scriptName, username, { allowExisting: true });
      }
      sendJson(res, 200, { ok: true, username, regions: [region] });
      return;
    }

    if (req.method === "POST" && url.pathname === "/v1/revoke") {
      const { username } = JSON.parse(body || "{}");
      const scripts = getRevokeScripts({ enableUkProvisioning });
      for (const scriptName of scripts) {
        await runScript(scriptName, username, { allowMissing: true });
      }
      sendJson(res, 200, { ok: true, username, regions: enableUkProvisioning ? ["sg", "uk"] : ["sg"] });
      return;
    }

    const regionalRevokeMatch = url.pathname.match(/^\/v1\/revoke\/(sg|uk)$/);
    if (req.method === "POST" && regionalRevokeMatch) {
      const { username } = JSON.parse(body || "{}");
      const region = regionalRevokeMatch[1];
      const scripts = getRevokeScripts({
        enableUkProvisioning,
        region
      });
      for (const scriptName of scripts) {
        await runScript(scriptName, username, { allowMissing: true });
      }
      sendJson(res, 200, { ok: true, username, regions: [region] });
      return;
    }

    const configMatch = url.pathname.match(/^\/v1\/client\/([a-zA-Z0-9_-]{1,32})\/config$/);
    if (req.method === "GET" && configMatch) {
      await sendFile(res, configMatch[1], "conf", "application/octet-stream");
      return;
    }

    const regionalConfigMatch = url.pathname.match(
      /^\/v1\/client\/([a-zA-Z0-9_-]{1,32})\/(sg|uk)\/config$/
    );
    if (req.method === "GET" && regionalConfigMatch) {
      await sendFile(
        res,
        regionalConfigMatch[1],
        "conf",
        "application/octet-stream",
        regionalConfigMatch[2]
      );
      return;
    }

    const qrMatch = url.pathname.match(/^\/v1\/client\/([a-zA-Z0-9_-]{1,32})\/qr$/);
    if (req.method === "GET" && qrMatch) {
      await sendFile(res, qrMatch[1], "png", "image/png");
      return;
    }

    const regionalQrMatch = url.pathname.match(
      /^\/v1\/client\/([a-zA-Z0-9_-]{1,32})\/(sg|uk)\/qr$/
    );
    if (req.method === "GET" && regionalQrMatch) {
      await sendFile(
        res,
        regionalQrMatch[1],
        "png",
        "image/png",
        regionalQrMatch[2]
      );
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    sendJson(res, 500, { error: message });
  }
}

export function createUnitedVpnAgentServer() {
  return http.createServer(handle);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  const server = createUnitedVpnAgentServer();
  console.log(`UnitedVPN agent listening on 127.0.0.1:${port} from ${currentFile}`);
  server.listen(port, "127.0.0.1");
}
