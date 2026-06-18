import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable, Writable } from "node:stream";
import test from "node:test";

const secret = "test-secret";
const originalEnv = { ...process.env };

function signedHeaders({ method, pathname, body = "" }) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${timestamp}.${method}.${pathname}.${body}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return {
    "x-unitedvpn-timestamp": timestamp,
    "x-unitedvpn-signature": signature
  };
}

async function createAsset(root, username, extension, content) {
  const userDir = path.join(root, username);
  await mkdir(userDir, { recursive: true });
  await writeFile(path.join(userDir, `${username}.${extension}`), content);
}

class TestResponse extends Writable {
  statusCode = 200;
  headers = {};
  chunks = [];

  _write(chunk, _encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    this.headers = headers;
  }

  end(chunk) {
    if (chunk) {
      this.chunks.push(Buffer.from(chunk));
    }
    super.end();
  }

  text() {
    return Buffer.concat(this.chunks).toString("utf8");
  }

  json() {
    return JSON.parse(this.text());
  }
}

async function withHandler(callback) {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "unitedvpn-agent-"));
  const sgDir = path.join(tempRoot, "clients");
  const ukDir = path.join(tempRoot, "clients-uk");
  await createAsset(sgDir, "david", "conf", "sg-conf");
  await createAsset(sgDir, "david", "png", "sg-png");
  await createAsset(ukDir, "david", "conf", "uk-conf");
  await createAsset(ukDir, "david", "png", "uk-png");

  process.env = {
    ...originalEnv,
    UNITEDVPN_SHARED_SECRET: secret,
    WIREGUARD_CLIENTS_DIR: sgDir,
    WIREGUARD_SG_CLIENTS_DIR: sgDir,
    WIREGUARD_UK_CLIENTS_DIR: ukDir
  };

  const moduleUrl = `../server.js?test=${Date.now()}-${Math.random()}`;
  const { handle } = await import(moduleUrl);

  try {
    await callback(handle);
  } finally {
    process.env = { ...originalEnv };
  }
}

async function get(handle, pathname) {
  const req = Readable.from([]);
  req.method = "GET";
  req.url = pathname;
  req.headers = signedHeaders({ method: "GET", pathname });

  const res = new TestResponse();
  const finished = new Promise((resolve) => res.on("finish", resolve));
  await handle(req, res);
  await finished;
  return res;
}

test("serves Singapore config route from Singapore clients directory", async () => {
  await withHandler(async (handle) => {
    const response = await get(handle, "/v1/client/david/config");

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["content-type"], "application/octet-stream");
    assert.equal(response.text(), "sg-conf");
  });
});

test("serves Singapore QR route from Singapore clients directory", async () => {
  await withHandler(async (handle) => {
    const response = await get(handle, "/v1/client/david/qr");

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["content-type"], "image/png");
    assert.equal(response.text(), "sg-png");
  });
});

test("serves UK config route from UK clients directory", async () => {
  await withHandler(async (handle) => {
    const response = await get(handle, "/v1/client/david/uk/config");

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["content-type"], "application/octet-stream");
    assert.equal(response.text(), "uk-conf");
  });
});

test("serves UK QR route from UK clients directory", async () => {
  await withHandler(async (handle) => {
    const response = await get(handle, "/v1/client/david/uk/qr");

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["content-type"], "image/png");
    assert.equal(response.text(), "uk-png");
  });
});

test("unknown users return 404", async () => {
  await withHandler(async (handle) => {
    const response = await get(handle, "/v1/client/unknown/uk/config");

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), { error: "Not found" });
  });
});
