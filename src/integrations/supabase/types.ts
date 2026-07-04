export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.1" }
  public: {
    Tables: {
      // ─── blog_images ──────────────────────────────────────────────────────
      blog_images: {
        Row: {
          id: number; storage_path: string; storage_url: string;
          original_url: string | null; alt_text: string; caption: string;
          description: string; file_name: string; width: number | null;
          height: number | null; file_size: number | null; mime_type: string;
          is_webp_converted: boolean; has_thumbnail: boolean;
          import_session_id: string | null; created_at: string;
        }
        Insert: {
          id?: number; storage_path: string; storage_url: string;
          original_url?: string | null; alt_text?: string; caption?: string;
          description?: string; file_name?: string; width?: number | null;
          height?: number | null; file_size?: number | null; mime_type?: string;
          is_webp_converted?: boolean; has_thumbnail?: boolean;
          import_session_id?: string | null; created_at?: string;
        }
        Update: Partial<Database['public']['Tables']['blog_images']['Insert']>
        Relationships: []
      }
      // ─── blog_categories ─────────────────────────────────────────────────
      blog_categories: {
        Row: { id: number; name: string; slug: string; created_at: string }
        Insert: { id?: number; name: string; slug: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['blog_categories']['Insert']>
        Relationships: []
      }
      // ─── blog_tags ───────────────────────────────────────────────────────
      blog_tags: {
        Row: { id: number; name: string; slug: string; created_at: string }
        Insert: { id?: number; name: string; slug: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['blog_tags']['Insert']>
        Relationships: []
      }
      // ─── blog_authors ────────────────────────────────────────────────────
      blog_authors: {
        Row: {
          id: number; name: string; slug: string; avatar_url: string;
          designation: string; bio: string; social_links: Json; created_at: string;
        }
        Insert: {
          id?: number; name: string; slug: string; avatar_url?: string;
          designation?: string; bio?: string; social_links?: Json; created_at?: string;
        }
        Update: Partial<Database['public']['Tables']['blog_authors']['Insert']>
        Relationships: []
      }
      // ─── blog_posts ──────────────────────────────────────────────────────
      blog_posts: {
        Row: {
          id: number; wp_id: number | null; title: string; slug: string;
          permalink: string; content_html: string; excerpt: string;
          featured_image_id: number | null; author_id: number | null;
          publish_date: string | null; publish_at: string | null; unpublish_at: string | null;
          reading_time: number; status: 'draft' | 'published' | 'scheduled' | 'archived';
          seo_title: string; meta_description: string; canonical_url: string;
          focus_keyphrase: string; og_title: string; og_description: string;
          og_image_id: number | null; twitter_title: string; twitter_description: string;
          twitter_image_id: number | null; display_order: number; search_index: string | null;
          seo_score: number; view_count: number; deleted_at: string | null; deleted_by: string | null;
          import_session_id: string | null; created_at: string; updated_at: string;
        }
        Insert: {
          id?: number; wp_id?: number | null; title: string; slug: string;
          permalink?: string; content_html?: string; excerpt?: string;
          featured_image_id?: number | null; author_id?: number | null;
          publish_date?: string | null; publish_at?: string | null; unpublish_at?: string | null;
          reading_time?: number; status?: 'draft' | 'published' | 'scheduled' | 'archived';
          seo_title?: string; meta_description?: string; canonical_url?: string;
          focus_keyphrase?: string; og_title?: string; og_description?: string;
          og_image_id?: number | null; twitter_title?: string; twitter_description?: string;
          twitter_image_id?: number | null; display_order?: number; seo_score?: number;
          view_count?: number; deleted_at?: string | null; deleted_by?: string | null;
          import_session_id?: string | null; created_at?: string; updated_at?: string;
        }
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
        Relationships: [
          { foreignKeyName: 'blog_posts_featured_image_id_fkey'; columns: ['featured_image_id']; referencedRelation: 'blog_images'; referencedColumns: ['id'] },
          { foreignKeyName: 'blog_posts_author_id_fkey'; columns: ['author_id']; referencedRelation: 'blog_authors'; referencedColumns: ['id'] },
        ]
      }
      // ─── blog_post_categories ────────────────────────────────────────────
      blog_post_categories: {
        Row: { post_id: number; category_id: number }
        Insert: { post_id: number; category_id: number }
        Update: { post_id?: number; category_id?: number }
        Relationships: [
          { foreignKeyName: 'blog_post_categories_post_id_fkey'; columns: ['post_id']; referencedRelation: 'blog_posts'; referencedColumns: ['id'] },
          { foreignKeyName: 'blog_post_categories_category_id_fkey'; columns: ['category_id']; referencedRelation: 'blog_categories'; referencedColumns: ['id'] },
        ]
      }
      // ─── blog_post_tags ──────────────────────────────────────────────────
      blog_post_tags: {
        Row: { post_id: number; tag_id: number }
        Insert: { post_id: number; tag_id: number }
        Update: { post_id?: number; tag_id?: number }
        Relationships: [
          { foreignKeyName: 'blog_post_tags_post_id_fkey'; columns: ['post_id']; referencedRelation: 'blog_posts'; referencedColumns: ['id'] },
          { foreignKeyName: 'blog_post_tags_tag_id_fkey'; columns: ['tag_id']; referencedRelation: 'blog_tags'; referencedColumns: ['id'] },
        ]
      }
      // ─── blog_faqs ───────────────────────────────────────────────────────
      blog_faqs: {
        Row: { id: number; post_id: number; question: string; answer: string; order_index: number; created_at: string }
        Insert: { id?: number; post_id: number; question: string; answer: string; order_index?: number; created_at?: string }
        Update: Partial<Database['public']['Tables']['blog_faqs']['Insert']>
        Relationships: [{ foreignKeyName: 'blog_faqs_post_id_fkey'; columns: ['post_id']; referencedRelation: 'blog_posts'; referencedColumns: ['id'] }]
      }
      // ─── blog_related_posts ──────────────────────────────────────────────
      blog_related_posts: {
        Row: { post_id: number; related_post_id: number }
        Insert: { post_id: number; related_post_id: number }
        Update: { post_id?: number; related_post_id?: number }
        Relationships: []
      }
      // ─── blog_revisions ──────────────────────────────────────────────────
      blog_revisions: {
        Row: {
          id: number; post_id: number; version_number: number; content_html: string;
          seo_title: string; meta_description: string; slug: string; canonical_url: string;
          updated_by: string; change_notes: string; snapshot: Json; created_at: string;
        }
        Insert: {
          id?: number; post_id: number; version_number?: number; content_html?: string;
          seo_title?: string; meta_description?: string; slug?: string; canonical_url?: string;
          updated_by?: string; change_notes?: string; snapshot?: Json; created_at?: string;
        }
        Update: Partial<Database['public']['Tables']['blog_revisions']['Insert']>
        Relationships: [{ foreignKeyName: 'blog_revisions_post_id_fkey'; columns: ['post_id']; referencedRelation: 'blog_posts'; referencedColumns: ['id'] }]
      }
      // ─── blog_url_checks ─────────────────────────────────────────────────
      blog_url_checks: {
        Row: {
          id: number; post_id: number | null; url: string; url_type: string;
          status: 'valid' | 'redirect' | 'broken' | 'empty'; http_code: number | null;
          error_message: string | null; checked_at: string;
        }
        Insert: {
          id?: number; post_id?: number | null; url: string; url_type?: string;
          status?: 'valid' | 'redirect' | 'broken' | 'empty'; http_code?: number | null;
          error_message?: string | null; checked_at?: string;
        }
        Update: Partial<Database['public']['Tables']['blog_url_checks']['Insert']>
        Relationships: []
      }
      // ─── blog_redirects ──────────────────────────────────────────────────
      blog_redirects: {
        Row: {
          id: number; old_url: string; new_url: string; redirect_type: number;
          is_active: boolean; source: string; created_at: string;
        }
        Insert: {
          id?: number; old_url: string; new_url: string; redirect_type?: number;
          is_active?: boolean; source?: string; created_at?: string;
        }
        Update: Partial<Database['public']['Tables']['blog_redirects']['Insert']>
        Relationships: []
      }
      // ─── blog_content_blocks ─────────────────────────────────────────────
      blog_content_blocks: {
        Row: { id: number; name: string; block_type: string; content: Json; is_global: boolean; created_at: string }
        Insert: { id?: number; name: string; block_type: string; content?: Json; is_global?: boolean; created_at?: string }
        Update: Partial<Database['public']['Tables']['blog_content_blocks']['Insert']>
        Relationships: []
      }
      // ─── blog_slug_history ───────────────────────────────────────────────
      blog_slug_history: {
        Row: { id: number; post_id: number; old_slug: string; new_slug: string; redirect_created: boolean; changed_at: string; changed_by: string }
        Insert: { id?: number; post_id: number; old_slug: string; new_slug: string; redirect_created?: boolean; changed_at?: string; changed_by?: string }
        Update: Partial<Database['public']['Tables']['blog_slug_history']['Insert']>
        Relationships: []
      }
      // ─── blog_link_map ───────────────────────────────────────────────────
      blog_link_map: {
        Row: { id: number; source_post_id: number; target_post_id: number | null; target_url: string; link_text: string; is_internal: boolean; created_at: string }
        Insert: { id?: number; source_post_id: number; target_post_id?: number | null; target_url: string; link_text?: string; is_internal?: boolean; created_at?: string }
        Update: Partial<Database['public']['Tables']['blog_link_map']['Insert']>
        Relationships: []
      }
      // ─── blog_user_roles ─────────────────────────────────────────────────
      blog_user_roles: {
        Row: { id: number; user_id: string; email: string; role: 'super_admin' | 'editor' | 'author' | 'seo_manager' | 'content_reviewer'; created_at: string; created_by: string }
        Insert: { id?: number; user_id: string; email: string; role?: 'super_admin' | 'editor' | 'author' | 'seo_manager' | 'content_reviewer'; created_at?: string; created_by?: string }
        Update: Partial<Database['public']['Tables']['blog_user_roles']['Insert']>
        Relationships: []
      }
      // ─── blog_activity_log ───────────────────────────────────────────────
      blog_activity_log: {
        Row: { id: number; user_email: string; action: string; resource_type: string; resource_id: number | null; resource_title: string; metadata: Json; created_at: string }
        Insert: { id?: number; user_email?: string; action: string; resource_type?: string; resource_id?: number | null; resource_title?: string; metadata?: Json; created_at?: string }
        Update: Partial<Database['public']['Tables']['blog_activity_log']['Insert']>
        Relationships: []
      }
      // ─── cms_settings ────────────────────────────────────────────────────
      cms_settings: {
        Row: { key: string; value: string; updated_at: string }
        Insert: { key: string; value?: string; updated_at?: string }
        Update: { key?: string; value?: string; updated_at?: string }
        Relationships: []
      }
      // ─── Keep existing tables ─────────────────────────────────────────────
      case_studies: {
        Row: {
          id: number; slug: string; company: string; industry: string; category: string;
          tagline: string; excerpt: string; hero_image: string; logo: string; read_time: string;
          published_date: string; metrics: Json; challenge: string; solution: string;
          outcome: string; sections: Json; testimonial: Json; features_used: string[];
          use_case: string[]; display_order: number; created_at: string;
        }
        Insert: {
          id?: number; slug: string; company: string; industry: string; category: string;
          tagline: string; excerpt: string; hero_image: string; logo: string; read_time: string;
          published_date: string; metrics?: Json; challenge: string; solution: string;
          outcome: string; sections?: Json; testimonial?: Json; features_used?: string[];
          use_case?: string[]; display_order?: number; created_at?: string;
        }
        Update: Partial<Database['public']['Tables']['case_studies']['Insert']>
        Relationships: []
      }
      pricing_plans: {
        Row: {
          id: number; name: string; monthly_price: number; yearly_price: number;
          description: string; features: string[]; popular: boolean; display_order: number; created_at: string;
        }
        Insert: {
          id?: number; name: string; monthly_price?: number; yearly_price?: number;
          description: string; features?: string[]; popular?: boolean; display_order?: number; created_at?: string;
        }
        Update: Partial<Database['public']['Tables']['pricing_plans']['Insert']>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      increment_blog_views: { Args: { post_id: number }; Returns: void }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: { Enums: {} },
} as const
