export function vpnUsernameFromUserId(userId: string) {
  return `u_${userId.replace(/-/g, "").slice(0, 20)}`;
}
