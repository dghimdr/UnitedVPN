export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

type EnvStatus = {
  configured: boolean;
  reason: string | null;
};

export function getSupabaseEnvStatus(): EnvStatus {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {
      configured: false,
      reason: "NEXT_PUBLIC_SUPABASE_URL is not configured."
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      configured: false,
      reason: "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured."
    };
  }

  return { configured: true, reason: null };
}
