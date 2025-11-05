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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      content_earnings: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          creator_id: string
          id: string
          last_calculated_at: string | null
          total_earnings_usd: number | null
          total_views: number | null
          updated_at: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          creator_id: string
          id?: string
          last_calculated_at?: string | null
          total_earnings_usd?: number | null
          total_views?: number | null
          updated_at?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          creator_id?: string
          id?: string
          last_calculated_at?: string | null
          total_earnings_usd?: number | null
          total_views?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_one_fkey"
            columns: ["participant_one"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_two_fkey"
            columns: ["participant_two"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      library_notes: {
        Row: {
          created_at: string
          description: string | null
          download_count: number | null
          education_level: string
          file_path: string
          file_size_bytes: number | null
          file_type: string
          form: string | null
          id: string
          status: string | null
          subject: string
          title: string
          updated_at: string
          uploader_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          education_level: string
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          form?: string | null
          id?: string
          status?: string | null
          subject: string
          title: string
          updated_at?: string
          uploader_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number | null
          education_level?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          form?: string | null
          id?: string
          status?: string | null
          subject?: string
          title?: string
          updated_at?: string
          uploader_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      library_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          education_level: string
          file_path: string
          file_size_bytes: number | null
          form: string | null
          id: string
          status: string | null
          subject: string
          thumbnail_path: string | null
          title: string
          updated_at: string
          uploader_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          education_level: string
          file_path: string
          file_size_bytes?: number | null
          form?: string | null
          id?: string
          status?: string | null
          subject: string
          thumbnail_path?: string | null
          title: string
          updated_at?: string
          uploader_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          education_level?: string
          file_path?: string
          file_size_bytes?: number | null
          form?: string | null
          id?: string
          status?: string | null
          subject?: string
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          uploader_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      library_views: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          view_duration_seconds: number | null
          viewer_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          view_duration_seconds?: number | null
          viewer_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          view_duration_seconds?: number | null
          viewer_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          sender_id: string
          status: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          sender_id: string
          status?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          platform_fee_usd: number
          status: string
          student_id: string
          subscription_id: string | null
          teacher_id: string
          teacher_payout_usd: number
          updated_at: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          platform_fee_usd: number
          status?: string
          student_id: string
          subscription_id?: string | null
          teacher_id: string
          teacher_payout_usd: number
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          platform_fee_usd?: number
          status?: string
          student_id?: string
          subscription_id?: string | null
          teacher_id?: string
          teacher_payout_usd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          post_type: string | null
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          post_type?: string | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          post_type?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          consent_date: string | null
          consent_location: boolean | null
          consent_parental: boolean | null
          consent_privacy: boolean | null
          consent_verification: boolean | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          consent_date?: string | null
          consent_location?: boolean | null
          consent_parental?: boolean | null
          consent_privacy?: boolean | null
          consent_verification?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          consent_date?: string | null
          consent_location?: boolean | null
          consent_parental?: boolean | null
          consent_privacy?: boolean | null
          consent_verification?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          communication: number | null
          created_at: string
          id: string
          punctuality: number | null
          rating: number
          student_id: string
          subject_knowledge: number | null
          teacher_id: string
          teaching_quality: number | null
        }
        Insert: {
          comment?: string | null
          communication?: number | null
          created_at?: string
          id?: string
          punctuality?: number | null
          rating: number
          student_id: string
          subject_knowledge?: number | null
          teacher_id: string
          teaching_quality?: number | null
        }
        Update: {
          comment?: string | null
          communication?: number | null
          created_at?: string
          id?: string
          punctuality?: number | null
          rating?: number
          student_id?: string
          subject_knowledge?: number | null
          teacher_id?: string
          teaching_quality?: number | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          media_type: string
          media_url: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type: string
          media_url: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          education_level: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          location_address: string | null
          location_city: string | null
          preferred_lesson_type: string | null
          residence_lat: number | null
          residence_lng: number | null
          status: string | null
          subject_selections: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          education_level?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id: string
          location_address?: string | null
          location_city?: string | null
          preferred_lesson_type?: string | null
          residence_lat?: number | null
          residence_lng?: number | null
          status?: string | null
          subject_selections?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          education_level?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          location_address?: string | null
          location_city?: string | null
          preferred_lesson_type?: string | null
          residence_lat?: number | null
          residence_lng?: number | null
          status?: string | null
          subject_selections?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string
          created_at: string
          id: string
          level: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          level?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          level?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          duration: string | null
          education_level: string | null
          id: string
          lesson_type: string | null
          price_usd: number | null
          status: string | null
          student_id: string
          subject: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          education_level?: string | null
          id?: string
          lesson_type?: string | null
          price_usd?: number | null
          status?: string | null
          student_id: string
          subject?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          education_level?: string | null
          id?: string
          lesson_type?: string | null
          price_usd?: number | null
          status?: string | null
          student_id?: string
          subject?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          doc_type: string | null
          file_path: string
          id: string
          status: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          doc_type?: string | null
          file_path: string
          id?: string
          status?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          doc_type?: string | null
          file_path?: string
          id?: string
          status?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_subjects: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          subject_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          subject_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          approved: boolean
          availability_schedule: Json | null
          business_lat: number | null
          business_lng: number | null
          created_at: string
          curriculum: string | null
          experience_years: number | null
          id: string
          lesson_location: string | null
          location_address: string | null
          location_city: string | null
          price_usd: number | null
          qualification_details: Json | null
          qualifications: string[] | null
          rating: number | null
          specializations: string[] | null
          status: string | null
          subjects: string[] | null
          teaching_methodology: string | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          availability_schedule?: Json | null
          business_lat?: number | null
          business_lng?: number | null
          created_at?: string
          curriculum?: string | null
          experience_years?: number | null
          id: string
          lesson_location?: string | null
          location_address?: string | null
          location_city?: string | null
          price_usd?: number | null
          qualification_details?: Json | null
          qualifications?: string[] | null
          rating?: number | null
          specializations?: string[] | null
          status?: string | null
          subjects?: string[] | null
          teaching_methodology?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          availability_schedule?: Json | null
          business_lat?: number | null
          business_lng?: number | null
          created_at?: string
          curriculum?: string | null
          experience_years?: number | null
          id?: string
          lesson_location?: string | null
          location_address?: string | null
          location_city?: string | null
          price_usd?: number | null
          qualification_details?: Json | null
          qualifications?: string[] | null
          rating?: number | null
          specializations?: string[] | null
          status?: string | null
          subjects?: string[] | null
          teaching_methodology?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_note_earnings: {
        Args: { _creator_id: string; _note_id: string }
        Returns: number
      }
      calculate_video_earnings: {
        Args: { _creator_id: string; _video_id: string }
        Returns: number
      }
      get_creator_total_earnings: {
        Args: { _creator_id: string }
        Returns: {
          note_count: number
          total_earnings: number
          total_note_earnings: number
          total_video_earnings: number
          total_views: number
          video_count: number
        }[]
      }
      get_teacher_income_projection: {
        Args: { _teacher_id: string }
        Returns: {
          group_students: number
          monthly_revenue: number
          one_on_one_students: number
          teacher_share: number
        }[]
      }
      get_teachers_nearby_by_subject: {
        Args: { _limit?: number; _student_id: string; _subject: string }
        Returns: {
          distance_km: number
          full_name: string
          location_city: string
          rating: number
          teacher_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
