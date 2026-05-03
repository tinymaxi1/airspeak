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
      admin_actions: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          id: string
          ip_address: string | null
          metadata: Json | null
          row_id: string | null
          table_name: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          row_id?: string | null
          table_name?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          row_id?: string | null
          table_name?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      airlines: {
        Row: {
          cabin_interview: Json | null
          country_emoji: string | null
          created_at: string
          created_by: string | null
          destinations: number | null
          fleet_size: number | null
          ground_interview: Json | null
          hiring_status: string | null
          hub: string | null
          iata_code: string | null
          id: string
          insider_tip_tr: string | null
          name: string
          pilot_interview: Json | null
          prestige: number | null
          region: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          student_interview: Json | null
          technician_interview: Json | null
          tier: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cabin_interview?: Json | null
          country_emoji?: string | null
          created_at?: string
          created_by?: string | null
          destinations?: number | null
          fleet_size?: number | null
          ground_interview?: Json | null
          hiring_status?: string | null
          hub?: string | null
          iata_code?: string | null
          id?: string
          insider_tip_tr?: string | null
          name: string
          pilot_interview?: Json | null
          prestige?: number | null
          region?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          student_interview?: Json | null
          technician_interview?: Json | null
          tier?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cabin_interview?: Json | null
          country_emoji?: string | null
          created_at?: string
          created_by?: string | null
          destinations?: number | null
          fleet_size?: number | null
          ground_interview?: Json | null
          hiring_status?: string | null
          hub?: string | null
          iata_code?: string | null
          id?: string
          insider_tip_tr?: string | null
          name?: string
          pilot_interview?: Json | null
          prestige?: number | null
          region?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          student_interview?: Json | null
          technician_interview?: Json | null
          tier?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          category: string
          data_type: string
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          data_type: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          data_type?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      aviation_glossary: {
        Row: {
          abbreviation: string | null
          audio_url: string | null
          category: string
          created_at: string
          definition_en: string | null
          definition_tr: string | null
          difficulty: number
          example_usage: string | null
          frequency: number
          icao_reference: string | null
          id: string
          image_url: string | null
          ipa: string | null
          is_public: boolean
          is_verified: boolean
          pos: string | null
          related_terms: string[]
          source: string
          tags: Json
          term_en: string
          term_tr: string | null
          updated_at: string
        }
        Insert: {
          abbreviation?: string | null
          audio_url?: string | null
          category: string
          created_at?: string
          definition_en?: string | null
          definition_tr?: string | null
          difficulty?: number
          example_usage?: string | null
          frequency?: number
          icao_reference?: string | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          is_public?: boolean
          is_verified?: boolean
          pos?: string | null
          related_terms?: string[]
          source?: string
          tags?: Json
          term_en: string
          term_tr?: string | null
          updated_at?: string
        }
        Update: {
          abbreviation?: string | null
          audio_url?: string | null
          category?: string
          created_at?: string
          definition_en?: string | null
          definition_tr?: string | null
          difficulty?: number
          example_usage?: string | null
          frequency?: number
          icao_reference?: string | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          is_public?: boolean
          is_verified?: boolean
          pos?: string | null
          related_terms?: string[]
          source?: string
          tags?: Json
          term_en?: string
          term_tr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          code: string
          condition_type: string
          condition_value: number
          created_at: string
          created_by: string | null
          description_en: string | null
          description_tr: string | null
          icon_emoji: string
          icon_url: string | null
          id: string
          is_active: boolean
          name_en: string | null
          name_tr: string
          rarity: string
          sort: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          code: string
          condition_type: string
          condition_value: number
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_tr?: string | null
          icon_emoji: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_tr: string
          rarity?: string
          sort?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          code?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_tr?: string | null
          icon_emoji?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_tr?: string
          rarity?: string
          sort?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          description: string | null
          description_tr: string | null
          icon: string | null
          id: string
          name: string
          name_tr: string
          order: number
          role_key: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          icon?: string | null
          id?: string
          name: string
          name_tr: string
          order?: number
          role_key: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          description_tr?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_tr?: string
          order?: number
          role_key?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      championships: {
        Row: {
          awarded_at: string
          championship_type: Database["public"]["Enums"]["league_season_type"]
          id: string
          level_tier: string | null
          period_number: number
          role: string | null
          snapshot_xp: number
          user_id: string
          year: number
        }
        Insert: {
          awarded_at?: string
          championship_type: Database["public"]["Enums"]["league_season_type"]
          id?: string
          level_tier?: string | null
          period_number: number
          role?: string | null
          snapshot_xp: number
          user_id: string
          year: number
        }
        Update: {
          awarded_at?: string
          championship_type?: Database["public"]["Enums"]["league_season_type"]
          id?: string
          level_tier?: string | null
          period_number?: number
          role?: string | null
          snapshot_xp?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          metadata: Json | null
          reason: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      community_banned_words: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          severity: string
          word: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          severity?: string
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          severity?: string
          word?: string
        }
        Relationships: []
      }
      community_bookmarks: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          deleted_at: string | null
          depth: number
          edited_at: string | null
          id: string
          parent_comment_id: string | null
          post_id: string
          reaction_count: number
          status: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          depth?: number
          edited_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id: string
          reaction_count?: number
          status?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          depth?: number
          edited_at?: string | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          reaction_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      community_group_members: {
        Row: {
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          group_id: string
          id: string
          joined_at: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          banner_url: string | null
          capacity: number
          created_at: string
          created_by: string
          description: string | null
          emoji: string
          id: string
          member_count: number
          name: string
          post_count: number
          privacy: string
          secret_passcode_hash: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          capacity?: number
          created_at?: string
          created_by: string
          description?: string | null
          emoji?: string
          id?: string
          member_count?: number
          name: string
          post_count?: number
          privacy?: string
          secret_passcode_hash?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          capacity?: number
          created_at?: string
          created_by?: string
          description?: string | null
          emoji?: string
          id?: string
          member_count?: number
          name?: string
          post_count?: number
          privacy?: string
          secret_passcode_hash?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_hashtags: {
        Row: {
          created_at: string
          last_used_at: string
          tag: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          last_used_at?: string
          tag: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          last_used_at?: string
          tag?: string
          usage_count?: number
        }
        Relationships: []
      }
      community_mentions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          mentioned_user_id: string
          mentioner_user_id: string
          notified: boolean
          post_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_user_id: string
          mentioner_user_id: string
          notified?: boolean
          post_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_user_id?: string
          mentioner_user_id?: string
          notified?: boolean
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          pushed: boolean
          read_at: string | null
          snippet: string | null
          target_id: string
          target_type: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          pushed?: boolean
          read_at?: string | null
          snippet?: string | null
          target_id: string
          target_type: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          pushed?: boolean
          read_at?: string | null
          snippet?: string | null
          target_id?: string
          target_type?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      community_post_hashtags: {
        Row: {
          post_id: string
          tag: string
        }
        Insert: {
          post_id: string
          tag: string
        }
        Update: {
          post_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_hashtags_tag_fkey"
            columns: ["tag"]
            isOneToOne: false
            referencedRelation: "community_hashtags"
            referencedColumns: ["tag"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comment_count: number
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          group_id: string
          id: string
          image_urls: string[]
          pinned: boolean
          reaction_count: number
          status: string
        }
        Insert: {
          author_id: string
          comment_count?: number
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          group_id: string
          id?: string
          image_urls?: string[]
          pinned?: boolean
          reaction_count?: number
          status?: string
        }
        Update: {
          author_id?: string
          comment_count?: number
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          group_id?: string
          id?: string
          image_urls?: string[]
          pinned?: boolean
          reaction_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      competition_entries: {
        Row: {
          competition_id: string
          id: string
          joined_at: string
          progress_data: Json | null
          rank: number | null
          rank_calculated_at: string | null
          rewards_granted: boolean
          score: number
          user_id: string
        }
        Insert: {
          competition_id: string
          id?: string
          joined_at?: string
          progress_data?: Json | null
          rank?: number | null
          rank_calculated_at?: string | null
          rewards_granted?: boolean
          score?: number
          user_id: string
        }
        Update: {
          competition_id?: string
          id?: string
          joined_at?: string
          progress_data?: Json | null
          rank?: number | null
          rank_calculated_at?: string | null
          rewards_granted?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_rewards: {
        Row: {
          competition_id: string
          entry_id: string | null
          granted_at: string
          id: string
          rank: number | null
          reward_type: string
          reward_value: Json | null
          user_id: string
        }
        Insert: {
          competition_id: string
          entry_id?: string | null
          granted_at?: string
          id?: string
          rank?: number | null
          reward_type: string
          reward_value?: Json | null
          user_id: string
        }
        Update: {
          competition_id?: string
          entry_id?: string | null
          granted_at?: string
          id?: string
          rank?: number | null
          reward_type?: string
          reward_value?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_rewards_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_rewards_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "competition_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_tr: string | null
          end_date: string
          entry_cost_coin: number
          icon_emoji: string
          id: string
          is_premium: boolean
          name: string
          name_tr: string | null
          prize_pool: Json
          resolved_at: string | null
          rules: Json
          slug: string
          start_date: string
          status: string
          target_level_tier: string | null
          target_role: string | null
          theme: string
          type: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_tr?: string | null
          end_date: string
          entry_cost_coin?: number
          icon_emoji?: string
          id?: string
          is_premium?: boolean
          name: string
          name_tr?: string | null
          prize_pool?: Json
          resolved_at?: string | null
          rules?: Json
          slug: string
          start_date: string
          status?: string
          target_level_tier?: string | null
          target_role?: string | null
          theme: string
          type: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_tr?: string | null
          end_date?: string
          entry_cost_coin?: number
          icon_emoji?: string
          id?: string
          is_premium?: boolean
          name?: string
          name_tr?: string | null
          prize_pool?: Json
          resolved_at?: string | null
          rules?: Json
          slug?: string
          start_date?: string
          status?: string
          target_level_tier?: string | null
          target_role?: string | null
          theme?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_flags: {
        Row: {
          comment: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_note: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_note?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_note?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          row_id: string
          snapshot: Json
          status_after: Database["public"]["Enums"]["content_status"] | null
          status_before: Database["public"]["Enums"]["content_status"] | null
          table_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          row_id: string
          snapshot: Json
          status_after?: Database["public"]["Enums"]["content_status"] | null
          status_before?: Database["public"]["Enums"]["content_status"] | null
          table_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          row_id?: string
          snapshot?: Json
          status_after?: Database["public"]["Enums"]["content_status"] | null
          status_before?: Database["public"]["Enums"]["content_status"] | null
          table_name?: string
        }
        Relationships: []
      }
      content_translations: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          field_name: string
          id: string
          is_machine_translated: boolean
          language_code: string
          reviewed_at: string | null
          translator: string
          updated_at: string
          value: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          field_name: string
          id?: string
          is_machine_translated?: boolean
          language_code: string
          reviewed_at?: string | null
          translator?: string
          updated_at?: string
          value: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          field_name?: string
          id?: string
          is_machine_translated?: boolean
          language_code?: string
          reviewed_at?: string | null
          translator?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          ads_watched: number
          ai_conversations: number
          day: string
          hearts_refilled_via_ad: number
          lessons_completed: number
          oral_attempts: number
          pronunciation_attempts: number
          user_id: string
          vocab_lookups: number
        }
        Insert: {
          ads_watched?: number
          ai_conversations?: number
          day?: string
          hearts_refilled_via_ad?: number
          lessons_completed?: number
          oral_attempts?: number
          pronunciation_attempts?: number
          user_id: string
          vocab_lookups?: number
        }
        Update: {
          ads_watched?: number
          ai_conversations?: number
          day?: string
          hearts_refilled_via_ad?: number
          lessons_completed?: number
          oral_attempts?: number
          pronunciation_attempts?: number
          user_id?: string
          vocab_lookups?: number
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          error: string | null
          file_url: string | null
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error?: string | null
          file_url?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error?: string | null
          file_url?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_export_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dialogues: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          lesson_id: string
          lines_json: Json
          micro_lesson: string | null
          micro_lesson_tr: string | null
          order: number
          situation: string
          situation_tr: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          lesson_id: string
          lines_json?: Json
          micro_lesson?: string | null
          micro_lesson_tr?: string | null
          order?: number
          situation: string
          situation_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          lesson_id?: string
          lines_json?: Json
          micro_lesson?: string | null
          micro_lesson_tr?: string | null
          order?: number
          situation?: string
          situation_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialogues_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_question_attempts: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          section_id: string
          selected_option: string | null
          simulation_id: string
          time_seconds: number | null
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          section_id: string
          selected_option?: string | null
          simulation_id: string
          time_seconds?: number | null
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          section_id?: string
          selected_option?: string | null
          simulation_id?: string
          time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_question_attempts_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "exam_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          exam_id: string
          id: string
          order: number
          question_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          exam_id: string
          id?: string
          order?: number
          question_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          exam_id?: string
          id?: string
          order?: number
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_simulations: {
        Row: {
          band_score: number | null
          completed_at: string | null
          duration_seconds: number | null
          exam_id: string
          id: string
          passed: boolean | null
          score_percent: number | null
          section_breakdown: Json | null
          set_id: string | null
          started_at: string
          status: string
          user_id: string
          weakness_summary_tr: string | null
        }
        Insert: {
          band_score?: number | null
          completed_at?: string | null
          duration_seconds?: number | null
          exam_id: string
          id?: string
          passed?: boolean | null
          score_percent?: number | null
          section_breakdown?: Json | null
          set_id?: string | null
          started_at?: string
          status?: string
          user_id: string
          weakness_summary_tr?: string | null
        }
        Update: {
          band_score?: number | null
          completed_at?: string | null
          duration_seconds?: number | null
          exam_id?: string
          id?: string
          passed?: boolean | null
          score_percent?: number | null
          section_breakdown?: Json | null
          set_id?: string | null
          started_at?: string
          status?: string
          user_id?: string
          weakness_summary_tr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description_tr: string | null
          duration_minutes: number
          has_speaking: boolean
          has_writing: boolean
          id: string
          level: string
          order: number
          pass_score: number
          question_count: number
          role: string
          slug: string
          title: string
          title_tr: string | null
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description_tr?: string | null
          duration_minutes?: number
          has_speaking?: boolean
          has_writing?: boolean
          id?: string
          level: string
          order?: number
          pass_score?: number
          question_count?: number
          role: string
          slug: string
          title: string
          title_tr?: string | null
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description_tr?: string | null
          duration_minutes?: number
          has_speaking?: boolean
          has_writing?: boolean
          id?: string
          level?: string
          order?: number
          pass_score?: number
          question_count?: number
          role?: string
          slug?: string
          title?: string
          title_tr?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          alt_correct_ids: Json | null
          audio_url: string | null
          context: string | null
          context_tr: string | null
          correct_id: string | null
          correct_order: Json | null
          created_at: string
          created_by: string | null
          detailed_explanation_tr: string | null
          difficulty: number
          explanation: string | null
          explanation_tr: string | null
          id: string
          image_url: string | null
          is_true: boolean | null
          lesson_id: string
          options: Json | null
          pairs: Json | null
          prompt: string | null
          prompt_tr: string | null
          slug: string | null
          sort: number
          status: Database["public"]["Enums"]["content_status"]
          target_text: string | null
          transcript: string | null
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at: string
          updated_by: string | null
          vocab_term_id: string | null
        }
        Insert: {
          alt_correct_ids?: Json | null
          audio_url?: string | null
          context?: string | null
          context_tr?: string | null
          correct_id?: string | null
          correct_order?: Json | null
          created_at?: string
          created_by?: string | null
          detailed_explanation_tr?: string | null
          difficulty?: number
          explanation?: string | null
          explanation_tr?: string | null
          id?: string
          image_url?: string | null
          is_true?: boolean | null
          lesson_id: string
          options?: Json | null
          pairs?: Json | null
          prompt?: string | null
          prompt_tr?: string | null
          slug?: string | null
          sort: number
          status?: Database["public"]["Enums"]["content_status"]
          target_text?: string | null
          transcript?: string | null
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
          updated_by?: string | null
          vocab_term_id?: string | null
        }
        Update: {
          alt_correct_ids?: Json | null
          audio_url?: string | null
          context?: string | null
          context_tr?: string | null
          correct_id?: string | null
          correct_order?: Json | null
          created_at?: string
          created_by?: string | null
          detailed_explanation_tr?: string | null
          difficulty?: number
          explanation?: string | null
          explanation_tr?: string | null
          id?: string
          image_url?: string | null
          is_true?: boolean | null
          lesson_id?: string
          options?: Json | null
          pairs?: Json | null
          prompt?: string | null
          prompt_tr?: string | null
          slug?: string | null
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          target_text?: string | null
          transcript?: string | null
          type?: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
          updated_by?: string | null
          vocab_term_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_vocab_term_id_fkey"
            columns: ["vocab_term_id"]
            isOneToOne: false
            referencedRelation: "vocab_terms"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_backup_pre_v2: {
        Row: {
          alt_correct_ids: Json | null
          audio_url: string | null
          context: string | null
          context_tr: string | null
          correct_id: string | null
          created_at: string | null
          created_by: string | null
          detailed_explanation_tr: string | null
          difficulty: number | null
          explanation: string | null
          explanation_tr: string | null
          id: string | null
          image_url: string | null
          lesson_id: string | null
          options: Json | null
          prompt: string | null
          prompt_tr: string | null
          slug: string | null
          sort: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          type: string | null
          updated_at: string | null
          updated_by: string | null
          vocab_term_id: string | null
        }
        Insert: {
          alt_correct_ids?: Json | null
          audio_url?: string | null
          context?: string | null
          context_tr?: string | null
          correct_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detailed_explanation_tr?: string | null
          difficulty?: number | null
          explanation?: string | null
          explanation_tr?: string | null
          id?: string | null
          image_url?: string | null
          lesson_id?: string | null
          options?: Json | null
          prompt?: string | null
          prompt_tr?: string | null
          slug?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vocab_term_id?: string | null
        }
        Update: {
          alt_correct_ids?: Json | null
          audio_url?: string | null
          context?: string | null
          context_tr?: string | null
          correct_id?: string | null
          created_at?: string | null
          created_by?: string | null
          detailed_explanation_tr?: string | null
          difficulty?: number | null
          explanation?: string | null
          explanation_tr?: string | null
          id?: string | null
          image_url?: string | null
          lesson_id?: string | null
          options?: Json | null
          prompt?: string | null
          prompt_tr?: string | null
          slug?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          type?: string | null
          updated_at?: string | null
          updated_by?: string | null
          vocab_term_id?: string | null
        }
        Relationships: []
      }
      flow_config: {
        Row: {
          created_at: string
          description: string
          description_tr: string | null
          editable: boolean
          id: string
          rule_key: string
          rule_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description: string
          description_tr?: string | null
          editable?: boolean
          id?: string
          rule_key: string
          rule_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          description_tr?: string | null
          editable?: boolean
          id?: string
          rule_key?: string
          rule_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      glossary_translations: {
        Row: {
          created_at: string
          definition_value: string | null
          glossary_id: string
          id: string
          language_code: string
          term_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          definition_value?: string | null
          glossary_id: string
          id?: string
          language_code: string
          term_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          definition_value?: string | null
          glossary_id?: string
          id?: string
          language_code?: string
          term_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "glossary_translations_glossary_id_fkey"
            columns: ["glossary_id"]
            isOneToOne: false
            referencedRelation: "aviation_glossary"
            referencedColumns: ["id"]
          },
        ]
      }
      icao4_questions: {
        Row: {
          audio_url: string | null
          context: string | null
          correct_id: string
          created_at: string
          created_by: string | null
          explanation_tr: string | null
          id: string
          level: string
          options: Json
          question: string
          question_tr: string | null
          section: string
          set_no: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audio_url?: string | null
          context?: string | null
          correct_id: string
          created_at?: string
          created_by?: string | null
          explanation_tr?: string | null
          id?: string
          level: string
          options: Json
          question: string
          question_tr?: string | null
          section: string
          set_no: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audio_url?: string | null
          context?: string | null
          correct_id?: string
          created_at?: string
          created_by?: string | null
          explanation_tr?: string | null
          id?: string
          level?: string
          options?: Json
          question?: string
          question_tr?: string | null
          section?: string
          set_no?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      interview_questions: {
        Row: {
          airline_slug: string | null
          category: string
          category_id: string | null
          created_at: string
          created_by: string | null
          detailed_explanation_tr: string | null
          difficulty: number
          follow_up_questions: Json | null
          good_answer_points_tr: Json | null
          id: string
          question: string
          question_tr: string | null
          red_flags_tr: Json | null
          role: string
          slug: string
          star_template_tr: string | null
          status: Database["public"]["Enums"]["content_status"]
          tips_tr: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          airline_slug?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          detailed_explanation_tr?: string | null
          difficulty?: number
          follow_up_questions?: Json | null
          good_answer_points_tr?: Json | null
          id?: string
          question: string
          question_tr?: string | null
          red_flags_tr?: Json | null
          role: string
          slug: string
          star_template_tr?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tips_tr?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          airline_slug?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          detailed_explanation_tr?: string | null
          difficulty?: number
          follow_up_questions?: Json | null
          good_answer_points_tr?: Json | null
          id?: string
          question?: string
          question_tr?: string | null
          red_flags_tr?: Json | null
          role?: string
          slug?: string
          star_template_tr?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tips_tr?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      league_groups: {
        Row: {
          class_tier: Database["public"]["Enums"]["league_class"]
          created_at: string
          id: string
          level_tier: string | null
          member_count: number
          role: string | null
          season_id: string
        }
        Insert: {
          class_tier: Database["public"]["Enums"]["league_class"]
          created_at?: string
          id?: string
          level_tier?: string | null
          member_count?: number
          role?: string | null
          season_id: string
        }
        Update: {
          class_tier?: Database["public"]["Enums"]["league_class"]
          created_at?: string
          id?: string
          level_tier?: string | null
          member_count?: number
          role?: string | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_groups_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "league_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      league_memberships: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          promotion_status: Database["public"]["Enums"]["league_promotion_status"]
          rank: number | null
          updated_at: string
          user_id: string
          week_xp: number
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          promotion_status?: Database["public"]["Enums"]["league_promotion_status"]
          rank?: number | null
          updated_at?: string
          user_id: string
          week_xp?: number
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          promotion_status?: Database["public"]["Enums"]["league_promotion_status"]
          rank?: number | null
          updated_at?: string
          user_id?: string
          week_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "league_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      league_rewards: {
        Row: {
          granted_at: string
          group_id: string | null
          id: string
          rank: number | null
          reward_type: string
          reward_value: Json | null
          season_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          group_id?: string | null
          id?: string
          rank?: number | null
          reward_type: string
          reward_value?: Json | null
          season_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          group_id?: string | null
          id?: string
          rank?: number | null
          reward_type?: string
          reward_value?: Json | null
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_rewards_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "league_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "league_rewards_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "league_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      league_seasons: {
        Row: {
          closed_at: string | null
          created_at: string
          end_date: string
          id: string
          period_number: number
          season_type: Database["public"]["Enums"]["league_season_type"]
          start_date: string
          status: string
          year: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          end_date: string
          id?: string
          period_number: number
          season_type: Database["public"]["Enums"]["league_season_type"]
          start_date: string
          status?: string
          year: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          end_date?: string
          id?: string
          period_number?: number
          season_type?: Database["public"]["Enums"]["league_season_type"]
          start_date?: string
          status?: string
          year?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          created_by: string | null
          estimated_minutes: number
          id: string
          is_premium: boolean
          number: number
          slug: string
          sort: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr: string | null
          type: Database["public"]["Enums"]["lesson_type"]
          unit_id: string
          updated_at: string
          updated_by: string | null
          xp: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estimated_minutes?: number
          id?: string
          is_premium?: boolean
          number: number
          slug: string
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr?: string | null
          type: Database["public"]["Enums"]["lesson_type"]
          unit_id: string
          updated_at?: string
          updated_by?: string | null
          xp?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estimated_minutes?: number
          id?: string
          is_premium?: boolean
          number?: number
          slug?: string
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          title_tr?: string | null
          type?: Database["public"]["Enums"]["lesson_type"]
          unit_id?: string
          updated_at?: string
          updated_by?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons_backup_pre_v2: {
        Row: {
          created_at: string | null
          created_by: string | null
          estimated_minutes: number | null
          id: string | null
          is_premium: boolean | null
          number: number | null
          slug: string | null
          sort: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string | null
          title_tr: string | null
          type: Database["public"]["Enums"]["lesson_type"] | null
          unit_id: string | null
          updated_at: string | null
          updated_by: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          estimated_minutes?: number | null
          id?: string | null
          is_premium?: boolean | null
          number?: number | null
          slug?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string | null
          title_tr?: string | null
          type?: Database["public"]["Enums"]["lesson_type"] | null
          unit_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          estimated_minutes?: number | null
          id?: string | null
          is_premium?: boolean | null
          number?: number | null
          slug?: string | null
          sort?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string | null
          title_tr?: string | null
          type?: Database["public"]["Enums"]["lesson_type"] | null
          unit_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      limited_offers: {
        Row: {
          audience: string
          banner_color: string | null
          body_en: string | null
          body_tr: string
          code: string
          created_at: string
          created_by: string | null
          discount_percent: number | null
          ends_at: string
          id: string
          is_active: boolean
          lifetime_price_try: number | null
          monthly_price_try: number | null
          priority: number
          push_body_tr: string | null
          push_title_tr: string | null
          starts_at: string
          title_en: string | null
          title_tr: string
          updated_at: string
          yearly_price_try: number | null
        }
        Insert: {
          audience?: string
          banner_color?: string | null
          body_en?: string | null
          body_tr: string
          code: string
          created_at?: string
          created_by?: string | null
          discount_percent?: number | null
          ends_at: string
          id?: string
          is_active?: boolean
          lifetime_price_try?: number | null
          monthly_price_try?: number | null
          priority?: number
          push_body_tr?: string | null
          push_title_tr?: string | null
          starts_at: string
          title_en?: string | null
          title_tr: string
          updated_at?: string
          yearly_price_try?: number | null
        }
        Update: {
          audience?: string
          banner_color?: string | null
          body_en?: string | null
          body_tr?: string
          code?: string
          created_at?: string
          created_by?: string | null
          discount_percent?: number | null
          ends_at?: string
          id?: string
          is_active?: boolean
          lifetime_price_try?: number | null
          monthly_price_try?: number | null
          priority?: number
          push_body_tr?: string | null
          push_title_tr?: string | null
          starts_at?: string
          title_en?: string | null
          title_tr?: string
          updated_at?: string
          yearly_price_try?: number | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          badge: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_tr: string | null
          id: string
          number: number
          reward_xp: number
          role: string
          slug: string
          sort: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_tr?: string | null
          id?: string
          number: number
          reward_xp?: number
          role: string
          slug: string
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_tr?: string | null
          id?: string
          number?: number
          reward_xp?: number
          role?: string
          slug?: string
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          title_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          body: string
          channel: string
          data: Json
          delivered_at: string | null
          error: string | null
          id: string
          read_at: string | null
          sent_at: string
          tapped_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          channel?: string
          data?: Json
          delivered_at?: string | null
          error?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string
          tapped_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          data?: Json
          delivered_at?: string | null
          error?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string
          tapped_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oral_exam_attempts: {
        Row: {
          attempted_at: string
          audio_path: string | null
          band_score: number | null
          confidence_score: number | null
          duration_seconds: number | null
          error: string | null
          estimated_cost_usd: number | null
          evaluated_at: string | null
          examiner_model: string | null
          feedback_tr: string | null
          id: string
          needs_review: boolean
          prompt_id: string
          provider: string | null
          review_reason: string | null
          review_requested_at: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rubric: Json | null
          simulation_id: string
          tokens_in: number | null
          tokens_out: number | null
          transcript: string | null
          user_id: string | null
        }
        Insert: {
          attempted_at?: string
          audio_path?: string | null
          band_score?: number | null
          confidence_score?: number | null
          duration_seconds?: number | null
          error?: string | null
          estimated_cost_usd?: number | null
          evaluated_at?: string | null
          examiner_model?: string | null
          feedback_tr?: string | null
          id?: string
          needs_review?: boolean
          prompt_id: string
          provider?: string | null
          review_reason?: string | null
          review_requested_at?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rubric?: Json | null
          simulation_id: string
          tokens_in?: number | null
          tokens_out?: number | null
          transcript?: string | null
          user_id?: string | null
        }
        Update: {
          attempted_at?: string
          audio_path?: string | null
          band_score?: number | null
          confidence_score?: number | null
          duration_seconds?: number | null
          error?: string | null
          estimated_cost_usd?: number | null
          evaluated_at?: string | null
          examiner_model?: string | null
          feedback_tr?: string | null
          id?: string
          needs_review?: boolean
          prompt_id?: string
          provider?: string | null
          review_reason?: string | null
          review_requested_at?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rubric?: Json | null
          simulation_id?: string
          tokens_in?: number | null
          tokens_out?: number | null
          transcript?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oral_exam_attempts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "oral_exam_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oral_exam_attempts_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "exam_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      oral_exam_prompts: {
        Row: {
          active: boolean
          context: string | null
          created_at: string
          difficulty_hint: string
          expected_topics: Json
          follow_ups: Json
          id: string
          image_hint: string | null
          prompt: string
          task_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          context?: string | null
          created_at?: string
          difficulty_hint: string
          expected_topics?: Json
          follow_ups?: Json
          id: string
          image_hint?: string | null
          prompt: string
          task_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          context?: string | null
          created_at?: string
          difficulty_hint?: string
          expected_topics?: Json
          follow_ups?: Json
          id?: string
          image_hint?: string | null
          prompt?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      oral_prompts: {
        Row: {
          created_at: string
          created_by: string | null
          cues_tr: Json | null
          id: string
          image_url: string | null
          level: string
          preparation_seconds: number
          prompt: string | null
          prompt_tr: string | null
          slug: string
          speaking_seconds: number
          status: Database["public"]["Enums"]["content_status"]
          task_type: string
          updated_at: string
          updated_by: string | null
          vocabulary_tr: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cues_tr?: Json | null
          id?: string
          image_url?: string | null
          level: string
          preparation_seconds?: number
          prompt?: string | null
          prompt_tr?: string | null
          slug: string
          speaking_seconds?: number
          status?: Database["public"]["Enums"]["content_status"]
          task_type: string
          updated_at?: string
          updated_by?: string | null
          vocabulary_tr?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cues_tr?: Json | null
          id?: string
          image_url?: string | null
          level?: string
          preparation_seconds?: number
          prompt?: string | null
          prompt_tr?: string | null
          slug?: string
          speaking_seconds?: number
          status?: Database["public"]["Enums"]["content_status"]
          task_type?: string
          updated_at?: string
          updated_by?: string | null
          vocabulary_tr?: Json | null
        }
        Relationships: []
      }
      placement_questions: {
        Row: {
          category: string | null
          context: string | null
          correct_id: string
          created_at: string
          created_by: string | null
          dimension: string
          format: string | null
          id: string
          level: string
          options: Json
          question: string
          question_tr: string | null
          roles: Json
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          updated_by: string | null
          weight: number
        }
        Insert: {
          category?: string | null
          context?: string | null
          correct_id: string
          created_at?: string
          created_by?: string | null
          dimension: string
          format?: string | null
          id?: string
          level: string
          options: Json
          question: string
          question_tr?: string | null
          roles?: Json
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Update: {
          category?: string | null
          context?: string | null
          correct_id?: string
          created_at?: string
          created_by?: string | null
          dimension?: string
          format?: string | null
          id?: string
          level?: string
          options?: Json
          question?: string
          question_tr?: string | null
          roles?: Json
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_hours: number[]
          admin_role: string | null
          avatar_url: string | null
          aviation_experience_years: number | null
          ban_reason: string | null
          banned_at: string | null
          base_airport: string | null
          bio_long: string | null
          bio_short: string | null
          callsign: string | null
          city: string | null
          coins: number
          community_follower_count: number
          community_following_count: number
          community_post_count: number
          company: string | null
          country: string | null
          created_at: string
          current_league_class:
            | Database["public"]["Enums"]["league_class"]
            | null
          current_streak: number
          daily_goal_minutes: number
          deletion_requested_at: string | null
          facebook: string | null
          full_name: string | null
          highest_league_class:
            | Database["public"]["Enums"]["league_class"]
            | null
          hints_inventory: number
          icao_english_level: string | null
          id: string
          instagram: string | null
          is_admin: boolean
          is_moderator: boolean
          is_profile_public: boolean
          is_student: boolean
          kvkk_accepted_at: string | null
          last_active_at: string
          lesson_skips_inventory: number
          level: string | null
          linkedin_url: string | null
          longest_streak: number
          marketing_consent: boolean
          marketing_consent_at: string | null
          mention_privacy: string
          month_start: string
          month_xp: number
          monthly_goal_lessons: number
          package_type: string
          position: string | null
          premium_until: string | null
          profile_completion_percent: number
          revenuecat_app_user_id: string | null
          role: string | null
          streak_freezes_inventory: number
          student_verified: boolean
          subscription_status: string
          terms_accepted_at: string | null
          timezone: string
          total_xp: number
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_used: boolean
          twitter: string | null
          updated_at: string
          username: string | null
          website: string | null
          week_start: string
          week_xp: number
          weekly_goal_xp: number
          xp_boost_until: string | null
          youtube: string | null
        }
        Insert: {
          active_hours?: number[]
          admin_role?: string | null
          avatar_url?: string | null
          aviation_experience_years?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          base_airport?: string | null
          bio_long?: string | null
          bio_short?: string | null
          callsign?: string | null
          city?: string | null
          coins?: number
          community_follower_count?: number
          community_following_count?: number
          community_post_count?: number
          company?: string | null
          country?: string | null
          created_at?: string
          current_league_class?:
            | Database["public"]["Enums"]["league_class"]
            | null
          current_streak?: number
          daily_goal_minutes?: number
          deletion_requested_at?: string | null
          facebook?: string | null
          full_name?: string | null
          highest_league_class?:
            | Database["public"]["Enums"]["league_class"]
            | null
          hints_inventory?: number
          icao_english_level?: string | null
          id: string
          instagram?: string | null
          is_admin?: boolean
          is_moderator?: boolean
          is_profile_public?: boolean
          is_student?: boolean
          kvkk_accepted_at?: string | null
          last_active_at?: string
          lesson_skips_inventory?: number
          level?: string | null
          linkedin_url?: string | null
          longest_streak?: number
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          mention_privacy?: string
          month_start?: string
          month_xp?: number
          monthly_goal_lessons?: number
          package_type?: string
          position?: string | null
          premium_until?: string | null
          profile_completion_percent?: number
          revenuecat_app_user_id?: string | null
          role?: string | null
          streak_freezes_inventory?: number
          student_verified?: boolean
          subscription_status?: string
          terms_accepted_at?: string | null
          timezone?: string
          total_xp?: number
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_used?: boolean
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          week_start?: string
          week_xp?: number
          weekly_goal_xp?: number
          xp_boost_until?: string | null
          youtube?: string | null
        }
        Update: {
          active_hours?: number[]
          admin_role?: string | null
          avatar_url?: string | null
          aviation_experience_years?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          base_airport?: string | null
          bio_long?: string | null
          bio_short?: string | null
          callsign?: string | null
          city?: string | null
          coins?: number
          community_follower_count?: number
          community_following_count?: number
          community_post_count?: number
          company?: string | null
          country?: string | null
          created_at?: string
          current_league_class?:
            | Database["public"]["Enums"]["league_class"]
            | null
          current_streak?: number
          daily_goal_minutes?: number
          deletion_requested_at?: string | null
          facebook?: string | null
          full_name?: string | null
          highest_league_class?:
            | Database["public"]["Enums"]["league_class"]
            | null
          hints_inventory?: number
          icao_english_level?: string | null
          id?: string
          instagram?: string | null
          is_admin?: boolean
          is_moderator?: boolean
          is_profile_public?: boolean
          is_student?: boolean
          kvkk_accepted_at?: string | null
          last_active_at?: string
          lesson_skips_inventory?: number
          level?: string | null
          linkedin_url?: string | null
          longest_streak?: number
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          mention_privacy?: string
          month_start?: string
          month_xp?: number
          monthly_goal_lessons?: number
          package_type?: string
          position?: string | null
          premium_until?: string | null
          profile_completion_percent?: number
          revenuecat_app_user_id?: string | null
          role?: string | null
          streak_freezes_inventory?: number
          student_verified?: boolean
          subscription_status?: string
          terms_accepted_at?: string | null
          timezone?: string
          total_xp?: number
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_used?: boolean
          twitter?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
          week_start?: string
          week_xp?: number
          weekly_goal_xp?: number
          xp_boost_until?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          app_version: string | null
          created_at: string
          device_name: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_name?: string | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_name?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_log: {
        Row: {
          bucket: string
          id: number
          identity: string
          occurred_at: string
        }
        Insert: {
          bucket: string
          id?: never
          identity: string
          occurred_at?: string
        }
        Update: {
          bucket?: string
          id?: never
          identity?: string
          occurred_at?: string
        }
        Relationships: []
      }
      revenue_events: {
        Row: {
          amount_try: number | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          source: string | null
          tier: string | null
          user_id: string
        }
        Insert: {
          amount_try?: number | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          source?: string | null
          tier?: string | null
          user_id: string
        }
        Update: {
          amount_try?: number | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          source?: string | null
          tier?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          audio_intro_url: string | null
          category: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          difficulty: number
          estimated_minutes: number
          goal: string | null
          goal_tr: string | null
          id: string
          initial_message: string | null
          is_premium: boolean
          role: string | null
          setup: string | null
          setup_tr: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audio_intro_url?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: number
          estimated_minutes?: number
          goal?: string | null
          goal_tr?: string | null
          id?: string
          initial_message?: string | null
          is_premium?: boolean
          role?: string | null
          setup?: string | null
          setup_tr?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audio_intro_url?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: number
          estimated_minutes?: number
          goal?: string | null
          goal_tr?: string | null
          id?: string
          initial_message?: string | null
          is_premium?: boolean
          role?: string | null
          setup?: string | null
          setup_tr?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          title_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      squadron_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          squadron_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          squadron_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          squadron_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squadron_members_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "squadron_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squadron_members_squadron_id_fkey"
            columns: ["squadron_id"]
            isOneToOne: false
            referencedRelation: "squadrons"
            referencedColumns: ["id"]
          },
        ]
      }
      squadrons: {
        Row: {
          banner_url: string | null
          capacity: number
          created_at: string
          created_by: string
          description: string | null
          emoji: string
          id: string
          is_public: boolean
          member_count: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          capacity?: number
          created_at?: string
          created_by: string
          description?: string | null
          emoji?: string
          id?: string
          is_public?: boolean
          member_count?: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          capacity?: number
          created_at?: string
          created_by?: string
          description?: string | null
          emoji?: string
          id?: string
          is_public?: boolean
          member_count?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_streak: number
          frozen_until: string | null
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          frozen_until?: string | null
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          frozen_until?: string | null
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suspicious_flags: {
        Row: {
          detail: Json | null
          flagged_at: string
          flagged_by: string | null
          id: string
          reason: string
          resolution: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
        }
        Insert: {
          detail?: Json | null
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          reason: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
        }
        Update: {
          detail?: Json | null
          flagged_at?: string
          flagged_by?: string | null
          id?: string
          reason?: string
          resolution?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      terms: {
        Row: {
          active: boolean
          audio_file: string | null
          context_sentence: string | null
          context_sentence_tr: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          lesson_id: string
          notes_tr: string | null
          order: number
          pronunciation: string | null
          term: string
          term_tr: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          audio_file?: string | null
          context_sentence?: string | null
          context_sentence_tr?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          lesson_id: string
          notes_tr?: string | null
          order?: number
          pronunciation?: string | null
          term: string
          term_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          audio_file?: string | null
          context_sentence?: string | null
          context_sentence_tr?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          lesson_id?: string
          notes_tr?: string | null
          order?: number
          pronunciation?: string | null
          term?: string
          term_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          badge: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_tr: string | null
          id: string
          module_id: string
          number: number
          slug: string
          sort: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_tr?: string | null
          id?: string
          module_id: string
          number: number
          slug: string
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          title_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_tr?: string | null
          id?: string
          module_id?: string
          number?: number
          slug?: string
          sort?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          title_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addons: {
        Row: {
          access_type: string
          addon_key: string
          created_at: string
          expires_at: string | null
          granted_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_type: string
          addon_key: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_type?: string
          addon_key?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_addons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_categories: {
        Row: {
          access_type: string
          category_id: string
          created_at: string
          expires_at: string | null
          granted_at: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_type: string
          category_id: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_type?: string
          category_id?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          number: string | null
          sort: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          number?: string | null
          sort?: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          number?: string | null
          sort?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_education: {
        Row: {
          created_at: string
          degree: string | null
          field: string | null
          graduation_year: number | null
          id: string
          school: string
          sort: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          field?: string | null
          graduation_year?: number | null
          id?: string
          school: string
          sort?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          field?: string | null
          graduation_year?: number | null
          id?: string
          school?: string
          sort?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exam_results: {
        Row: {
          answers_json: Json
          created_at: string
          exam_id: string
          id: string
          passed: boolean
          score: number
          taken_at: string
          user_id: string
        }
        Insert: {
          answers_json?: Json
          created_at?: string
          exam_id: string
          id?: string
          passed: boolean
          score: number
          taken_at?: string
          user_id: string
        }
        Update: {
          answers_json?: Json
          created_at?: string
          exam_id?: string
          id?: string
          passed?: boolean
          score?: number
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exam_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exam_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          position: string
          sort: number
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          position: string
          sort?: number
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          position?: string
          sort?: number
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          attempts: number
          completed_at: string
          is_perfect: boolean | null
          lesson_id: string
          score: number
          time_spent: number | null
          updated_at: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          attempts?: number
          completed_at?: string
          is_perfect?: boolean | null
          lesson_id: string
          score?: number
          time_spent?: number | null
          updated_at?: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          attempts?: number
          completed_at?: string
          is_perfect?: boolean | null
          lesson_id?: string
          score?: number
          time_spent?: number | null
          updated_at?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_placement_results: {
        Row: {
          attempt_number: number
          created_at: string
          grammar_score: number | null
          listening_score: number | null
          next_test_allowed_at: string
          overall_level: string | null
          questions_answered: number
          reading_score: number | null
          recommended_start_lesson_id: string | null
          taken_at: string
          test_duration_seconds: number | null
          updated_at: string
          user_id: string
          vocabulary_score: number | null
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          grammar_score?: number | null
          listening_score?: number | null
          next_test_allowed_at?: string
          overall_level?: string | null
          questions_answered?: number
          reading_score?: number | null
          recommended_start_lesson_id?: string | null
          taken_at?: string
          test_duration_seconds?: number | null
          updated_at?: string
          user_id: string
          vocabulary_score?: number | null
        }
        Update: {
          attempt_number?: number
          created_at?: string
          grammar_score?: number | null
          listening_score?: number | null
          next_test_allowed_at?: string
          overall_level?: string | null
          questions_answered?: number
          reading_score?: number | null
          recommended_start_lesson_id?: string | null
          taken_at?: string
          test_duration_seconds?: number | null
          updated_at?: string
          user_id?: string
          vocabulary_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_placement_results_recommended_start_lesson_id_fkey"
            columns: ["recommended_start_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          language: string
          notif_community: boolean
          notif_league: boolean
          notif_offers: boolean
          notif_oral: boolean
          notif_placement: boolean
          notif_streak: boolean
          notifications_enabled: boolean
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          sound_enabled: boolean
          study_reminder_hour: number | null
          theme: string
          tts_auto_play: boolean
          tts_speed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language?: string
          notif_community?: boolean
          notif_league?: boolean
          notif_offers?: boolean
          notif_oral?: boolean
          notif_placement?: boolean
          notif_streak?: boolean
          notifications_enabled?: boolean
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          sound_enabled?: boolean
          study_reminder_hour?: number | null
          theme?: string
          tts_auto_play?: boolean
          tts_speed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          language?: string
          notif_community?: boolean
          notif_league?: boolean
          notif_offers?: boolean
          notif_oral?: boolean
          notif_placement?: boolean
          notif_streak?: boolean
          notifications_enabled?: boolean
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          sound_enabled?: boolean
          study_reminder_hour?: number | null
          theme?: string
          tts_auto_play?: boolean
          tts_speed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "active_premium_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_type_ratings: {
        Row: {
          aircraft_type: string
          certified_date: string | null
          created_at: string
          hours: number | null
          id: string
          sort: number
          updated_at: string
          user_id: string
        }
        Insert: {
          aircraft_type: string
          certified_date?: string | null
          created_at?: string
          hours?: number | null
          id?: string
          sort?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          aircraft_type?: string
          certified_date?: string | null
          created_at?: string
          hours?: number | null
          id?: string
          sort?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp_summary: {
        Row: {
          current_iso_week: number | null
          current_year: number | null
          current_year_month: string | null
          last_activity_at: string | null
          month_xp: number
          total_xp: number
          updated_at: string
          user_id: string
          week_xp: number
          year_xp: number
        }
        Insert: {
          current_iso_week?: number | null
          current_year?: number | null
          current_year_month?: string | null
          last_activity_at?: string | null
          month_xp?: number
          total_xp?: number
          updated_at?: string
          user_id: string
          week_xp?: number
          year_xp?: number
        }
        Update: {
          current_iso_week?: number | null
          current_year?: number | null
          current_year_month?: string | null
          last_activity_at?: string | null
          month_xp?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
          week_xp?: number
          year_xp?: number
        }
        Relationships: []
      }
      vocab_terms: {
        Row: {
          audio_url: string | null
          category: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          definition: string | null
          definition_tr: string | null
          difficulty: number
          example: string | null
          example_tr: string | null
          id: string
          ipa: string | null
          is_premium: boolean
          pos: string | null
          role: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: Json
          term: string
          term_tr: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          definition?: string | null
          definition_tr?: string | null
          difficulty?: number
          example?: string | null
          example_tr?: string | null
          id?: string
          ipa?: string | null
          is_premium?: boolean
          pos?: string | null
          role?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: Json
          term: string
          term_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          definition?: string | null
          definition_tr?: string | null
          difficulty?: number
          example?: string | null
          example_tr?: string | null
          id?: string
          ipa?: string | null
          is_premium?: boolean
          pos?: string | null
          role?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: Json
          term?: string
          term_tr?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vocab_terms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_premium_users: {
        Row: {
          current_tier: string | null
          days_remaining: number | null
          full_name: string | null
          id: string | null
          last_event: string | null
          premium_until: string | null
          username: string | null
        }
        Insert: {
          current_tier?: never
          days_remaining?: never
          full_name?: string | null
          id?: string | null
          last_event?: never
          premium_until?: string | null
          username?: string | null
        }
        Update: {
          current_tier?: never
          days_remaining?: never
          full_name?: string | null
          id?: string | null
          last_event?: never
          premium_until?: string | null
          username?: string | null
        }
        Relationships: []
      }
      admin_actions_view: {
        Row: {
          action: string | null
          actor_id: string | null
          actor_name: string | null
          actor_username: string | null
          created_at: string | null
          diff: Json | null
          id: string | null
          metadata: Json | null
          row_id: string | null
          table_name: string | null
          target_user_id: string | null
          target_username: string | null
        }
        Relationships: []
      }
      ai_daily_cost: {
        Row: {
          attempts: number | null
          claude_attempts: number | null
          day: string | null
          gpt_attempts: number | null
          mock_attempts: number | null
          total_cost_usd: number | null
          total_tokens_in: number | null
          total_tokens_out: number | null
        }
        Relationships: []
      }
      content_flag_counts: {
        Row: {
          content_id: string | null
          content_type: string | null
          last_flagged_at: string | null
          pending_count: number | null
          total_count: number | null
        }
        Relationships: []
      }
      monthly_user_stats: {
        Row: {
          accuracy_avg: number | null
          lessons_count: number | null
          month_start: string | null
          perfect_count: number | null
          total_seconds: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
      oral_review_queue: {
        Row: {
          attempted_at: string | null
          audio_path: string | null
          avatar_url: string | null
          band_score: number | null
          confidence_score: number | null
          duration_seconds: number | null
          error: string | null
          evaluated_at: string | null
          examiner_model: string | null
          feedback_tr: string | null
          full_name: string | null
          id: string | null
          prompt_id: string | null
          provider: string | null
          queue_reason: string | null
          review_reason: string | null
          review_requested_at: string | null
          review_status: string | null
          rubric: Json | null
          simulation_id: string | null
          transcript: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oral_exam_attempts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "oral_exam_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oral_exam_attempts_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "exam_simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      squadron_leaderboard: {
        Row: {
          emoji: string | null
          id: string | null
          is_public: boolean | null
          member_count: number | null
          name: string | null
          rank: number | null
          slug: string | null
          total_week_xp: number | null
          total_xp: number | null
        }
        Relationships: []
      }
      suspicious_xp_view: {
        Row: {
          avg_time_24h: number | null
          device_count: number | null
          full_name: string | null
          lessons_24h: number | null
          reasons: string[] | null
          suspicion_score: number | null
          user_id: string | null
          username: string | null
          xp_1h: number | null
          xp_24h: number | null
        }
        Relationships: []
      }
      weekly_user_stats: {
        Row: {
          accuracy_avg: number | null
          lessons_count: number | null
          perfect_count: number | null
          total_seconds: number | null
          total_xp: number | null
          user_id: string | null
          week_start: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_coins: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_source?: string
        }
        Returns: Json
      }
      apply_streak_freeze: { Args: never; Returns: Json }
      approve_community_join: {
        Args: { p_approve?: boolean; p_member_id: string }
        Returns: Json
      }
      are_friends: { Args: { p_a: string; p_b: string }; Returns: boolean }
      assign_user_to_league: {
        Args: {
          p_default_class?: Database["public"]["Enums"]["league_class"]
          p_user_id?: string
        }
        Returns: Json
      }
      auto_check_community_text: { Args: { p_content: string }; Returns: Json }
      award_badge: { Args: { p_code: string }; Returns: Json }
      ban_community_member: {
        Args: { p_group_id: string; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      bump_daily_usage: {
        Args: { amount?: number; field: string }
        Returns: undefined
      }
      bump_last_active: { Args: never; Returns: undefined }
      bump_user_xp: {
        Args: {
          p_lesson_id: string
          p_score: number
          p_time_spent?: number
          p_xp: number
        }
        Returns: Json
      }
      can_read_group: { Args: { p_group_id: string }; Returns: boolean }
      can_read_post: { Args: { p_post_id: string }; Returns: boolean }
      can_take_placement: { Args: { p_user_id?: string }; Returns: Json }
      cancel_account_deletion: { Args: never; Returns: Json }
      check_ai_daily_cost: { Args: never; Returns: Json }
      check_community_rate_limit: {
        Args: { p_action_type: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_bucket: string
          p_identity: string
          p_max: number
          p_window_seconds: number
        }
        Returns: Json
      }
      claim_offer: { Args: { p_code: string }; Returns: Json }
      create_community_comment: {
        Args: {
          p_content: string
          p_parent_comment_id?: string
          p_post_id: string
        }
        Returns: Json
      }
      create_community_group: {
        Args: {
          p_capacity?: number
          p_description?: string
          p_emoji?: string
          p_name: string
          p_passcode?: string
          p_privacy?: string
          p_slug: string
        }
        Returns: Json
      }
      create_community_post: {
        Args: { p_content: string; p_group_id: string; p_image_urls?: string[] }
        Returns: Json
      }
      create_squadron: {
        Args: {
          p_description?: string
          p_emoji?: string
          p_is_public?: boolean
          p_name: string
          p_slug: string
        }
        Returns: Json
      }
      delete_community_comment: {
        Args: { p_comment_id: string }
        Returns: Json
      }
      delete_community_post: { Args: { p_post_id: string }; Returns: Json }
      edit_community_comment: {
        Args: { p_comment_id: string; p_content: string }
        Returns: Json
      }
      edit_community_post: {
        Args: { p_content: string; p_image_urls?: string[]; p_post_id: string }
        Returns: Json
      }
      expire_finished_trials: { Args: never; Returns: number }
      extract_hashtags: { Args: { p_content: string }; Returns: string[] }
      extract_mentions: { Args: { p_content: string }; Returns: string[] }
      finalize_placement: {
        Args: {
          p_questions_answered?: number
          p_scores: Json
          p_test_duration_seconds?: number
        }
        Returns: Json
      }
      get_account_deletion_status: { Args: never; Returns: Json }
      get_active_count_24h: { Args: never; Returns: number }
      get_active_offers: {
        Args: never
        Returns: {
          audience: string
          banner_color: string
          body_en: string
          body_tr: string
          code: string
          discount_percent: number
          ends_at: string
          id: string
          lifetime_price_try: number
          monthly_price_try: number
          priority: number
          starts_at: string
          title_en: string
          title_tr: string
          yearly_price_try: number
        }[]
      }
      get_bucket_stats: {
        Args: never
        Returns: {
          bucket_id: string
          file_count: number
          total_size_bytes: number
        }[]
      }
      get_effective_pricing: { Args: { p_offer_code?: string }; Returns: Json }
      get_glossary_categories: {
        Args: never
        Returns: {
          category: string
          term_count: number
        }[]
      }
      get_next_placement_question: {
        Args: {
          p_answered_ids: string[]
          p_consecutive_correct: number
          p_consecutive_wrong: number
          p_current_level?: string
          p_dimension: string
          p_last_correct: boolean
          p_session_id: string
        }
        Returns: Json
      }
      get_peer_comparison: { Args: { p_user_id?: string }; Returns: Json }
      get_posts_by_hashtag: {
        Args: { p_limit?: number; p_tag: string }
        Returns: {
          author_id: string
          comment_count: number
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          group_id: string
          id: string
          image_urls: string[]
          pinned: boolean
          reaction_count: number
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "community_posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_revisions: {
        Args: { limit_count?: number; target_id: string; target_table: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          snapshot: Json
          status_after: Database["public"]["Enums"]["content_status"]
          status_before: Database["public"]["Enums"]["content_status"]
        }[]
      }
      get_trending_hashtags: {
        Args: { p_limit?: number; p_window_days?: number }
        Returns: {
          last_used_at: string
          tag: string
          usage_count: number
        }[]
      }
      get_unread_count: { Args: never; Returns: Json }
      get_user_community_posts: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          author_id: string
          comment_count: number
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          group_id: string
          id: string
          image_urls: string[]
          pinned: boolean
          reaction_count: number
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "community_posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_goals_progress: { Args: { p_user_id?: string }; Returns: Json }
      has_admin_role: { Args: { min_role: string }; Returns: boolean }
      hide_community_comment: {
        Args: { p_comment_id: string; p_unhide?: boolean }
        Returns: Json
      }
      hide_community_post: {
        Args: { p_post_id: string; p_unhide?: boolean }
        Returns: Json
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_banned_user: { Args: { target_user_id?: string }; Returns: boolean }
      is_following_user: { Args: { p_target_id: string }; Returns: boolean }
      is_group_member: {
        Args: { p_group_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_group_staff: {
        Args: { p_group_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_moderator_user: { Args: { p_uid?: string }; Returns: boolean }
      is_premium_user: { Args: { target_user_id?: string }; Returns: boolean }
      join_community_group: {
        Args: { p_group_id: string; p_passcode?: string }
        Returns: Json
      }
      join_competition: { Args: { p_competition_id: string }; Returns: Json }
      join_squadron: { Args: { p_squadron_id: string }; Returns: Json }
      leave_community_group: { Args: { p_group_id: string }; Returns: Json }
      leave_squadron: { Args: { p_squadron_id: string }; Returns: Json }
      log_admin_action: {
        Args: {
          p_action: string
          p_diff?: Json
          p_metadata?: Json
          p_row_id?: string
          p_table_name?: string
          p_target_user_id?: string
        }
        Returns: string
      }
      mark_community_notifications_read: {
        Args: { p_ids?: string[] }
        Returns: Json
      }
      mark_notification_tapped: { Args: { p_id: string }; Returns: Json }
      mark_notifications_read: { Args: { p_ids?: string[] }; Returns: Json }
      migrate_local_coins: {
        Args: {
          p_local_coins: number
          p_local_freezes?: number
          p_local_hints?: number
        }
        Returns: Json
      }
      next_league_class: {
        Args: { p_class: Database["public"]["Enums"]["league_class"] }
        Returns: Database["public"]["Enums"]["league_class"]
      }
      parse_comment_content: { Args: { p_comment_id: string }; Returns: Json }
      parse_post_content: { Args: { p_post_id: string }; Returns: Json }
      pin_community_post: {
        Args: { p_pin?: boolean; p_post_id: string }
        Returns: Json
      }
      placement_shift_level: {
        Args: { p_delta: number; p_level: string }
        Returns: string
      }
      prev_league_class: {
        Args: { p_class: Database["public"]["Enums"]["league_class"] }
        Returns: Database["public"]["Enums"]["league_class"]
      }
      purchase_shop_item: {
        Args: {
          p_boost_minutes?: number
          p_cost: number
          p_inventory_count?: number
          p_inventory_field?: string
          p_item_id: string
        }
        Returns: Json
      }
      purge_rate_limit_log: { Args: never; Returns: number }
      purge_stale_push_tokens: { Args: never; Returns: number }
      react_community: {
        Args: { p_kind: string; p_target_id: string; p_target_type: string }
        Returns: Json
      }
      recalc_competition_ranks: { Args: never; Returns: Json }
      record_signup_consents: {
        Args: { p_kvkk: boolean; p_marketing?: boolean; p_terms: boolean }
        Returns: Json
      }
      report_community_content: {
        Args: {
          p_comment?: string
          p_reason: string
          p_target_id: string
          p_target_type: string
        }
        Returns: Json
      }
      request_account_deletion: { Args: never; Returns: Json }
      request_data_export: { Args: never; Returns: Json }
      request_oral_review: {
        Args: { p_attempt_id: string; p_reason: string }
        Returns: Json
      }
      resolve_competition: { Args: { p_competition_id: string }; Returns: Json }
      resolve_oral_review: {
        Args: {
          p_action: string
          p_attempt_id: string
          p_new_band?: number
          p_new_rubric?: Json
          p_note?: string
        }
        Returns: Json
      }
      respond_friend_request: {
        Args: { p_accept: boolean; p_friendship_id: string }
        Returns: Json
      }
      rotate_active_weekly_league: { Args: never; Returns: Json }
      rotate_monthly_championships: { Args: never; Returns: Json }
      rotate_yearly_championships: { Args: never; Returns: Json }
      search_community_posts: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          author_id: string
          comment_count: number
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          group_id: string
          id: string
          image_urls: string[]
          pinned: boolean
          reaction_count: number
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "community_posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_glossary: {
        Args: {
          p_abbreviations_only?: boolean
          p_category?: string
          p_lang?: string
          p_limit?: number
          p_max_difficulty?: number
          p_min_difficulty?: number
          p_offset?: number
          p_query?: string
        }
        Returns: {
          abbreviation: string
          audio_url: string
          category: string
          definition_en: string
          definition_tr: string
          difficulty: number
          example_usage: string
          frequency: number
          icao_reference: string
          id: string
          ipa: string
          is_verified: boolean
          pos: string
          term_en: string
          term_tr: string
        }[]
      }
      send_friend_request: { Args: { p_username: string }; Returns: Json }
      set_marketing_consent: { Args: { p_enabled: boolean }; Returns: Json }
      set_user_moderator: {
        Args: { p_is_moderator: boolean; p_user_id: string }
        Returns: Json
      }
      should_send_notification: {
        Args: { p_category: string; p_user_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      spend_coins: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_source?: string
        }
        Returns: Json
      }
      start_new_weekly_season: { Args: never; Returns: string }
      start_oral_attempt: {
        Args: { p_prompt_id: string; p_simulation_id: string }
        Returns: Json
      }
      start_trial: { Args: never; Returns: Json }
      submit_oral_attempt: {
        Args: {
          p_attempt_id: string
          p_duration_seconds: number
          p_transcript: string
        }
        Returns: Json
      }
      tick_competitions: { Args: never; Returns: Json }
      toggle_community_bookmark: { Args: { p_post_id: string }; Returns: Json }
      toggle_community_follow: { Args: { p_target_id: string }; Returns: Json }
      update_user_goals: {
        Args: {
          p_daily_minutes?: number
          p_monthly_lessons?: number
          p_weekly_xp?: number
        }
        Returns: Json
      }
      user_dow_activity: {
        Args: { p_days?: number; p_tz?: string; p_user_id?: string }
        Returns: {
          dow: number
          lessons_count: number
        }[]
      }
      user_hourly_activity: {
        Args: { p_days?: number; p_tz?: string; p_user_id?: string }
        Returns: {
          hour: number
          lessons_count: number
        }[]
      }
      user_matches_audience: { Args: { p_audience: string }; Returns: boolean }
    }
    Enums: {
      content_status: "draft" | "review" | "published" | "archived"
      exercise_type:
        | "matching"
        | "fill_blank"
        | "listening"
        | "speaking"
        | "ordering"
        | "true_false"
      league_class:
        | "bronze"
        | "silver"
        | "gold"
        | "sapphire"
        | "ruby"
        | "emerald"
        | "diamond"
      league_promotion_status: "promoted" | "demoted" | "stable" | "pending"
      league_season_type: "weekly" | "monthly" | "yearly"
      lesson_type:
        | "vocabulary"
        | "dialogue"
        | "listening"
        | "pronunciation"
        | "quiz"
        | "reading"
        | "speaking"
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
      content_status: ["draft", "review", "published", "archived"],
      exercise_type: [
        "matching",
        "fill_blank",
        "listening",
        "speaking",
        "ordering",
        "true_false",
      ],
      league_class: [
        "bronze",
        "silver",
        "gold",
        "sapphire",
        "ruby",
        "emerald",
        "diamond",
      ],
      league_promotion_status: ["promoted", "demoted", "stable", "pending"],
      league_season_type: ["weekly", "monthly", "yearly"],
      lesson_type: [
        "vocabulary",
        "dialogue",
        "listening",
        "pronunciation",
        "quiz",
        "reading",
        "speaking",
      ],
    },
  },
} as const
