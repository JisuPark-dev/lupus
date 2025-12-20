import type { LogType, LogData } from './logs';
import type { MedicationCategory } from './medications';
import type { UserHospital } from './hospitals';

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
      health_logs: {
        Row: {
          id: string;
          member_id: number;
          log_date: string;
          log_type: LogType;
          data: LogData;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: number;
          log_date: string;
          log_type: LogType;
          data?: LogData;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: number;
          log_date?: string;
          log_type?: LogType;
          data?: LogData;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'health_logs_member_id_fkey';
            columns: ['member_id'];
            referencedRelation: 'members';
            referencedColumns: ['id'];
          }
        ];
      };
      medications: {
        Row: {
          id: string;
          member_id: number;
          name: string;
          category: MedicationCategory;
          dose: string | null;
          frequency: string | null;
          start_date: string;
          end_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: number;
          name: string;
          category: MedicationCategory;
          dose?: string | null;
          frequency?: string | null;
          start_date: string;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: number;
          name?: string;
          category?: MedicationCategory;
          dose?: string | null;
          frequency?: string | null;
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'medications_member_id_fkey';
            columns: ['member_id'];
            referencedRelation: 'members';
            referencedColumns: ['id'];
          }
        ];
      };
      user_hospitals: {
        Row: UserHospital;
        Insert: {
          id?: string;
          member_id: number;
          name: string;
          start_date: string;
          end_date?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: number;
          name?: string;
          start_date?: string;
          end_date?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_hospitals_member_id_fkey';
            columns: ['member_id'];
            referencedRelation: 'members';
            referencedColumns: ['id'];
          }
        ];
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
