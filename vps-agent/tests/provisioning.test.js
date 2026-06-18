import assert from "node:assert/strict";
import test from "node:test";
import {
  getProvisionScripts,
  getRevokeScripts,
  getRegionClientsDir,
  isBenignProvisionError,
  isBenignRevokeError
} from "../provisioning.js";

test("keeps default provisioning Singapore-only", () => {
  assert.deepEqual(getProvisionScripts({ enableUkProvisioning: false }), [
    "add-user.sh"
  ]);
});

test("adds UK provisioning only when explicitly enabled", () => {
  assert.deepEqual(getProvisionScripts({ enableUkProvisioning: true }), [
    "add-user.sh",
    "add-uk-user.sh"
  ]);
});

test("supports UK-only provisioning for existing approved users", () => {
  assert.deepEqual(
    getProvisionScripts({ enableUkProvisioning: false, region: "uk" }),
    ["add-uk-user.sh"]
  );
});

test("keeps default revoke Singapore-only unless UK provisioning is enabled", () => {
  assert.deepEqual(getRevokeScripts({ enableUkProvisioning: false }), [
    "remove-user.sh"
  ]);
  assert.deepEqual(getRevokeScripts({ enableUkProvisioning: true }), [
    "remove-user.sh",
    "remove-uk-user.sh"
  ]);
});

test("requires an explicit UK clients directory for UK asset serving", () => {
  assert.throws(
    () =>
      getRegionClientsDir({
        region: "uk",
        clientsDir: "/etc/wireguard/clients",
        regionClientsDirs: { sg: "/etc/wireguard/clients" }
      }),
    /VPN region is not configured/
  );
});

test("defaults UK asset serving to /etc/wireguard/clients-uk when env is absent", () => {
  assert.equal(
    getRegionClientsDir({
      region: "uk",
      clientsDir: "/etc/wireguard/clients",
      regionClientsDirs: {
        sg: "/etc/wireguard/clients",
        uk: "/etc/wireguard/clients-uk"
      }
    }),
    "/etc/wireguard/clients-uk"
  );
});

test("treats duplicate provision and missing revoke as idempotent script outcomes", () => {
  assert.equal(isBenignProvisionError("UK user already exists: david"), true);
  assert.equal(isBenignRevokeError("UK user not found: david"), true);
  assert.equal(isBenignProvisionError("Required command not found: wg"), false);
  assert.equal(isBenignRevokeError("Invalid username"), false);
});
