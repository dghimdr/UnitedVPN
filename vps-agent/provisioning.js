const regionPattern = /^(sg|uk)$/;

export function envFlagEnabled(value) {
  return value === "true";
}

export function validateRegion(region) {
  if (!regionPattern.test(region)) {
    throw new Error("Invalid VPN region");
  }
}

export function getProvisionScripts({
  enableUkProvisioning,
  region = "all"
}) {
  if (region === "sg") {
    return ["add-user.sh"];
  }

  if (region === "uk") {
    return ["add-uk-user.sh"];
  }

  const scripts = ["add-user.sh"];
  if (enableUkProvisioning) {
    scripts.push("add-uk-user.sh");
  }

  return scripts;
}

export function getRevokeScripts({ enableUkProvisioning, region = "all" }) {
  if (region === "sg") {
    return ["remove-user.sh"];
  }

  if (region === "uk") {
    return ["remove-uk-user.sh"];
  }

  const scripts = ["remove-user.sh"];
  if (enableUkProvisioning) {
    scripts.push("remove-uk-user.sh");
  }

  return scripts;
}

export function getRegionClientsDir({
  region,
  clientsDir,
  regionClientsDirs
}) {
  validateRegion(region);

  const regionDir = regionClientsDirs[region] ?? (region === "sg" ? clientsDir : undefined);
  if (!regionDir) {
    throw new Error("VPN region is not configured");
  }

  return regionDir;
}

export function isBenignProvisionError(message) {
  return /user already exists/i.test(message);
}

export function isBenignRevokeError(message) {
  return /user not found/i.test(message);
}
