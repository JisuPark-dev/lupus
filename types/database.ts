export interface Message {
  id: number;
  content: string;
  member_id: number;
  created_at: string;
}

export interface Member {
  id: number;
  kakao_id: string;
  nickname: string;
  profile_image: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          id: number;
          content: string;
          member_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          content: string;
          member_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          content?: string;
          member_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_member_id_fkey';
            columns: ['member_id'];
            referencedRelation: 'members';
            referencedColumns: ['id'];
          }
        ];
      };
      members: {
        Row: {
          id: number;
          kakao_id: string;
          nickname: string;
          profile_image: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          kakao_id: string;
          nickname: string;
          profile_image?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          kakao_id?: string;
          nickname?: string;
          profile_image?: string | null;
          email?: string | null;
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
