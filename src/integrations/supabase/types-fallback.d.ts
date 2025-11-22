// Ambient module declaration to provide a temporary fallback for Supabase types
// This does NOT create the actual generated file, but satisfies TypeScript until
// Lovable Cloud provides src/integrations/supabase/types.ts automatically.
// Safe to remove once the generated types file exists.

declare module "./types" {
  export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

  export type Database = {
    public: {
      Tables: Record<string, any>;
      Views: Record<string, any>;
      Functions: Record<string, any>;
      Enums: Record<string, any>;
      CompositeTypes: Record<string, any>;
    };
  };
}
