export type UserStatus = "pending" | "approved" | "revoked";
export type UserRole = "user" | "admin";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          status: UserStatus;
          vpn_username: string | null;
          approved_at: string | null;
          provisioned_at: string | null;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          status?: UserStatus;
          vpn_username?: string | null;
          approved_at?: string | null;
          provisioned_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          status?: UserStatus;
          vpn_username?: string | null;
          approved_at?: string | null;
          provisioned_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_status: UserStatus;
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
