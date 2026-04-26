export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      confessions: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          votes: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          votes?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          votes?: number
        }
        Relationships: []
      }
      deleted_emails: {
        Row: {
          deleted_at: string
          email: string
        }
        Insert: {
          deleted_at?: string
          email: string
        }
        Update: {
          deleted_at?: string
          email?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          created_at: string
          distractions: number
          duration_minutes: number
          id: string
          session_date: string
          silence_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          distractions?: number
          duration_minutes: number
          id?: string
          session_date?: string
          silence_score: number
          user_id: string
        }
        Update: {
          created_at?: string
          distractions?: number
          duration_minutes?: number
          id?: string
          session_date?: string
          silence_score?: number
          user_id?: string
        }
        Relationships: []
      }
      mock_scores: {
        Row: {
          chemistry: number | null
          created_at: string
          id: string
          math_or_bio: number | null
          physics: number | null
          test_date: string
          test_name: string
          total: number | null
          user_id: string
        }
        Insert: {
          chemistry?: number | null
          created_at?: string
          id?: string
          math_or_bio?: number | null
          physics?: number | null
          test_date?: string
          test_name: string
          total?: number | null
          user_id: string
        }
        Update: {
          chemistry?: number | null
          created_at?: string
          id?: string
          math_or_bio?: number | null
          physics?: number | null
          test_date?: string
          test_name?: string
          total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          class_level: string | null
          coaching: string | null
          created_at: string
          current_marks: number | null
          exam_date: string | null
          id: string
          strong_subjects: string[] | null
          study_hours: number | null
          target_exam: string | null
          target_rank: string | null
          thinking_style: string | null
          user_id: string
          weak_subjects: string[] | null
        }
        Insert: {
          class_level?: string | null
          coaching?: string | null
          created_at?: string
          current_marks?: number | null
          exam_date?: string | null
          id?: string
          strong_subjects?: string[] | null
          study_hours?: number | null
          target_exam?: string | null
          target_rank?: string | null
          thinking_style?: string | null
          user_id: string
          weak_subjects?: string[] | null
        }
        Update: {
          class_level?: string | null
          coaching?: string | null
          created_at?: string
          current_marks?: number | null
          exam_date?: string | null
          id?: string
          strong_subjects?: string[] | null
          study_hours?: number | null
          target_exam?: string | null
          target_rank?: string | null
          thinking_style?: string | null
          user_id?: string
          weak_subjects?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_banned: boolean
          is_deleted: boolean
          onboarding_complete: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_banned?: boolean
          is_deleted?: boolean
          onboarding_complete?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_banned?: boolean
          is_deleted?: boolean
          onboarding_complete?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      time_capsules: {
        Row: {
          created_at: string
          id: string
          message: string
          unlock_date: string
          unlocked: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          unlock_date: string
          unlocked?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          unlock_date?: string
          unlocked?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wrong_answers: {
        Row: {
          buried_at: string
          correct_answer: string | null
          defeated: boolean
          id: string
          mistake_type: string | null
          question: string
          resurrected_at: string | null
          subject: string | null
          topic: string | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          buried_at?: string
          correct_answer?: string | null
          defeated?: boolean
          id?: string
          mistake_type?: string | null
          question: string
          resurrected_at?: string | null
          subject?: string | null
          topic?: string | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          buried_at?: string
          correct_answer?: string | null
          defeated?: boolean
          id?: string
          mistake_type?: string | null
          question?: string
          resurrected_at?: string | null
          subject?: string | null
          topic?: string | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      confessions_public: {
        Row: {
          content: string | null
          created_at: string | null
          id: string | null
          votes: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          votes?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string | null
          votes?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_user: { Args: { _target: string }; Returns: undefined }
      admin_set_ban: {
        Args: { _banned: boolean; _target: string }
        Returns: undefined
      }
      delete_own_account: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
