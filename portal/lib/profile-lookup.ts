import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Profile } from "@/lib/supabase/types";

type TypedSupabaseClient = SupabaseClient<
  Database,
  "public",
  "public",
  Database["public"]
>;

export type ProfileLookupDiagnostics = {
  profile: Profile | null;
  userClientProfile: Profile | null;
  serviceRoleProfile: Profile | null;
  userClientError: string | null;
  serviceRoleError: string | null;
  rlsLikelyBlocking: boolean;
};

function errorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return String(error);
}

export async function lookupProfileWithDiagnostics(
  supabase: TypedSupabaseClient,
  userId: string,
  source: "admin" | "dashboard"
): Promise<ProfileLookupDiagnostics> {
  const {
    data: userClientProfile,
    error: userClientLookupError
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  let serviceRoleProfile: Profile | null = null;
  let serviceRoleError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    serviceRoleProfile = data ?? null;
    serviceRoleError = errorMessage(error);
  } catch (error) {
    serviceRoleError = errorMessage(error);
  }

  const userClientError = errorMessage(userClientLookupError);
  const profile = userClientProfile ?? serviceRoleProfile ?? null;
  const rlsLikelyBlocking =
    !userClientProfile && Boolean(serviceRoleProfile) && Boolean(userClientError);

  console.log("UnitedVPN profile lookup diagnostics", {
    source,
    userId,
    userClientReturned: Boolean(userClientProfile),
    userClientError,
    serviceRoleReturned: Boolean(serviceRoleProfile),
    serviceRoleError,
    rlsLikelyBlocking,
    profileReturned: Boolean(profile)
  });

  return {
    profile,
    userClientProfile: userClientProfile ?? null,
    serviceRoleProfile,
    userClientError,
    serviceRoleError,
    rlsLikelyBlocking
  };
}
