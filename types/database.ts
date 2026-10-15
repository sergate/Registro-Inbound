export type UserRole = "admin" | "supervisor" | "operario";
export type PalletStatus = "open" | "closed";

// Respuesta de la funcion despachar_etiqueta() de la base.
export type DespacharResultado =
  | { resultado: "ok" }
  | { resultado: "no_ingresada" }
  | { resultado: "despacho_invalido" }
  | { resultado: "ingreso_abierto"; pallet_numero: number }
  | {
      resultado: "ya_despachada";
      despacho_numero: number;
      operario: string;
      fecha: string;
    };

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
      despachos: {
        Row: {
          id: string;
          numero: number;
          opened_by: string;
          opened_at: string;
          status: PalletStatus;
          closed_at: string | null;
          destino: string | null;
          referencia: string | null;
        };
        Insert: {
          opened_by: string;
          destino?: string | null;
          referencia?: string | null;
        };
        Update: {
          status?: PalletStatus;
          closed_at?: string | null;
        };
        Relationships: [];
      };
      despacho_etiquetas: {
        Row: {
          id: string;
          despacho_id: string;
          pallet_label_id: string;
          scanned_by: string;
          scanned_at: string;
        };
        // Las cajas solo entran por la funcion despachar_etiqueta().
        Insert: Record<string, never>;
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
    Functions: {
      despachar_etiqueta: {
        Args: { p_despacho_id: string; p_ean13: string };
        Returns: DespacharResultado;
      };
    };
    Enums: {
      user_role: UserRole;
      pallet_status: PalletStatus;
    };
  };
}
