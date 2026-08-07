export type UserRole = "admin" | "supervisor" | "operario";
export type PalletStatus = "open" | "closed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: UserRole;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          role?: UserRole;
          active?: boolean;
        };
        Update: {
          username?: string;
          role?: UserRole;
          active?: boolean;
        };
        Relationships: [];
      };
      pallets: {
        Row: {
          id: string;
          pallet_number: number;
          opened_by: string;
          opened_at: string;
          status: PalletStatus;
          closed_at: string | null;
        };
        Insert: {
          opened_by: string;
        };
        Update: {
          status?: PalletStatus;
          closed_at?: string | null;
        };
        Relationships: [];
      };
      pallet_labels: {
        Row: {
          id: string;
          pallet_id: string;
          ean13: string;
          scanned_by: string;
          scanned_at: string;
        };
        Insert: {
          pallet_id: string;
          ean13: string;
          scanned_by: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      pallet_summary: {
        Row: {
          id: string;
          pallet_number: number;
          opened_by: string;
          opened_at: string;
          status: PalletStatus;
          closed_at: string | null;
          label_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      pallet_status: PalletStatus;
    };
  };
}
