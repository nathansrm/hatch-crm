export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      agency_settings: {
        Row: {
          id: number;
          updated_at: string | null;
          weekly_capacity_hours: number;
          won_goal: number;
        };
        Insert: {
          id?: number;
          updated_at?: string | null;
          weekly_capacity_hours?: number;
          won_goal?: number;
        };
        Update: {
          id?: number;
          updated_at?: string | null;
          weekly_capacity_hours?: number;
          won_goal?: number;
        };
        Relationships: [];
      };
      audit_reports: {
        Row: {
          audit_result_id: string | null;
          created_at: string | null;
          id: string;
          last_viewed_at: string | null;
          report_data: Json | null;
          report_type: string | null;
          report_url: string | null;
          shared_with: string[] | null;
          view_count: number | null;
        };
        Insert: {
          audit_result_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_viewed_at?: string | null;
          report_data?: Json | null;
          report_type?: string | null;
          report_url?: string | null;
          shared_with?: string[] | null;
          view_count?: number | null;
        };
        Update: {
          audit_result_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_viewed_at?: string | null;
          report_data?: Json | null;
          report_type?: string | null;
          report_url?: string | null;
          shared_with?: string[] | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_reports_audit_result_id_fkey";
            columns: ["audit_result_id"];
            isOneToOne: false;
            referencedRelation: "audit_results";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_results: {
        Row: {
          business_name: string | null;
          company_id: number | null;
          confidence: number | null;
          contact_id: number | null;
          created_at: string | null;
          findings: Json | null;
          id: string;
          limitations: string[] | null;
          mode: string | null;
          overall_classification: string | null;
          overall_score: number | null;
          results: Json | null;
          source_file_name: string | null;
          source_row_count: number | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          business_name?: string | null;
          company_id?: number | null;
          confidence?: number | null;
          contact_id?: number | null;
          created_at?: string | null;
          findings?: Json | null;
          id?: string;
          limitations?: string[] | null;
          mode?: string | null;
          overall_classification?: string | null;
          overall_score?: number | null;
          results?: Json | null;
          source_file_name?: string | null;
          source_row_count?: number | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          business_name?: string | null;
          company_id?: number | null;
          confidence?: number | null;
          contact_id?: number | null;
          created_at?: string | null;
          findings?: Json | null;
          id?: string;
          limitations?: string[] | null;
          mode?: string | null;
          overall_classification?: string | null;
          overall_score?: number | null;
          results?: Json | null;
          source_file_name?: string | null;
          source_row_count?: number | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_results_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_results_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_results_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_results_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts_summary";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          address: string | null;
          city: string | null;
          company_size: string | null;
          context_links: Json | null;
          country: string | null;
          created_at: string;
          description: string | null;
          external_id: string | null;
          external_source: string | null;
          id: number;
          linkedin_url: string | null;
          logo: Json | null;
          metadata: Json | null;
          name: string;
          phone_number: string | null;
          revenue: string | null;
          sales_id: number | null;
          sector: string | null;
          service_area: string | null;
          size: number | null;
          state_abbr: string | null;
          tax_identifier: string | null;
          tech_maturity: string | null;
          trade_type_id: string | null;
          updated_at: string | null;
          website: string | null;
          zipcode: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          company_size?: string | null;
          context_links?: Json | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          external_id?: string | null;
          external_source?: string | null;
          id?: number;
          linkedin_url?: string | null;
          logo?: Json | null;
          metadata?: Json | null;
          name: string;
          phone_number?: string | null;
          revenue?: string | null;
          sales_id?: number | null;
          sector?: string | null;
          service_area?: string | null;
          size?: number | null;
          state_abbr?: string | null;
          tax_identifier?: string | null;
          tech_maturity?: string | null;
          trade_type_id?: string | null;
          updated_at?: string | null;
          website?: string | null;
          zipcode?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          company_size?: string | null;
          context_links?: Json | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          external_id?: string | null;
          external_source?: string | null;
          id?: number;
          linkedin_url?: string | null;
          logo?: Json | null;
          metadata?: Json | null;
          name?: string;
          phone_number?: string | null;
          revenue?: string | null;
          sales_id?: number | null;
          sector?: string | null;
          service_area?: string | null;
          size?: number | null;
          state_abbr?: string | null;
          tax_identifier?: string | null;
          tech_maturity?: string | null;
          trade_type_id?: string | null;
          updated_at?: string | null;
          website?: string | null;
          zipcode?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "companies_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_trade_type_id_fkey";
            columns: ["trade_type_id"];
            isOneToOne: false;
            referencedRelation: "trade_types";
            referencedColumns: ["id"];
          },
        ];
      };
      configuration: {
        Row: {
          config: Json;
          id: number;
        };
        Insert: {
          config?: Json;
          id?: number;
        };
        Update: {
          config?: Json;
          id?: number;
        };
        Relationships: [];
      };
      contact_notes: {
        Row: {
          attachments: Json[] | null;
          contact_id: number;
          date: string | null;
          id: number;
          sales_id: number | null;
          status: string | null;
          text: string | null;
        };
        Insert: {
          attachments?: Json[] | null;
          contact_id: number;
          date?: string | null;
          id?: number;
          sales_id?: number | null;
          status?: string | null;
          text?: string | null;
        };
        Update: {
          attachments?: Json[] | null;
          contact_id?: number;
          date?: string | null;
          id?: number;
          sales_id?: number | null;
          status?: string | null;
          text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contactNotes_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contactNotes_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contactNotes_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_tags: {
        Row: {
          contact_id: number;
          tag_id: number;
        };
        Insert: {
          contact_id: number;
          tag_id: number;
        };
        Update: {
          contact_id?: number;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_tags_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          avatar: Json | null;
          background: string | null;
          company_id: number | null;
          email_jsonb: Json | null;
          external_id: string | null;
          external_source: string | null;
          first_name: string | null;
          first_seen: string | null;
          gender: string | null;
          has_newsletter: boolean | null;
          id: number;
          last_name: string | null;
          last_seen: string | null;
          lead_source_id: string | null;
          linkedin_url: string | null;
          metadata: Json | null;
          phone_jsonb: Json | null;
          sales_id: number | null;
          status: string | null;
          tags: number[] | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar?: Json | null;
          background?: string | null;
          company_id?: number | null;
          email_jsonb?: Json | null;
          external_id?: string | null;
          external_source?: string | null;
          first_name?: string | null;
          first_seen?: string | null;
          gender?: string | null;
          has_newsletter?: boolean | null;
          id?: number;
          last_name?: string | null;
          last_seen?: string | null;
          lead_source_id?: string | null;
          linkedin_url?: string | null;
          metadata?: Json | null;
          phone_jsonb?: Json | null;
          sales_id?: number | null;
          status?: string | null;
          tags?: number[] | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar?: Json | null;
          background?: string | null;
          company_id?: number | null;
          email_jsonb?: Json | null;
          external_id?: string | null;
          external_source?: string | null;
          first_name?: string | null;
          first_seen?: string | null;
          gender?: string | null;
          has_newsletter?: boolean | null;
          id?: number;
          last_name?: string | null;
          last_seen?: string | null;
          lead_source_id?: string | null;
          linkedin_url?: string | null;
          metadata?: Json | null;
          phone_jsonb?: Json | null;
          sales_id?: number | null;
          status?: string | null;
          tags?: number[] | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_lead_source_id_fkey";
            columns: ["lead_source_id"];
            isOneToOne: false;
            referencedRelation: "lead_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_contacts: {
        Row: {
          contact_id: number;
          deal_id: number;
        };
        Insert: {
          contact_id: number;
          deal_id: number;
        };
        Update: {
          contact_id?: number;
          deal_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "deal_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_contacts_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_contacts_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      };
      deal_notes: {
        Row: {
          attachments: Json[] | null;
          date: string | null;
          deal_id: number;
          id: number;
          sales_id: number | null;
          text: string | null;
          type: string | null;
        };
        Insert: {
          attachments?: Json[] | null;
          date?: string | null;
          deal_id: number;
          id?: number;
          sales_id?: number | null;
          text?: string | null;
          type?: string | null;
        };
        Update: {
          attachments?: Json[] | null;
          date?: string | null;
          deal_id?: number;
          id?: number;
          sales_id?: number | null;
          text?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "dealNotes_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "dealNotes_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      deals: {
        Row: {
          amount: number | null;
          archived_at: string | null;
          category: string | null;
          closed_at: string | null;
          company_id: number | null;
          contact_ids: number[] | null;
          created_at: string;
          description: string | null;
          dm_present: boolean | null;
          expected_closing_date: string | null;
          follow_up_date: string | null;
          hours_wasted_per_week: number | null;
          id: number;
          index: number | null;
          lost_reason: string | null;
          metadata: Json | null;
          name: string;
          primary_bottleneck: string | null;
          project_progress_pct: number | null;
          project_started_at: string | null;
          project_status: string | null;
          projected_hours: number | null;
          response_time_hours: number | null;
          sales_id: number | null;
          software_stack: string[] | null;
          stage: string;
          updated_at: string;
        };
        Insert: {
          amount?: number | null;
          archived_at?: string | null;
          category?: string | null;
          closed_at?: string | null;
          company_id?: number | null;
          contact_ids?: number[] | null;
          created_at?: string;
          description?: string | null;
          dm_present?: boolean | null;
          expected_closing_date?: string | null;
          follow_up_date?: string | null;
          hours_wasted_per_week?: number | null;
          id?: number;
          index?: number | null;
          lost_reason?: string | null;
          metadata?: Json | null;
          name: string;
          primary_bottleneck?: string | null;
          project_progress_pct?: number | null;
          project_started_at?: string | null;
          project_status?: string | null;
          projected_hours?: number | null;
          response_time_hours?: number | null;
          sales_id?: number | null;
          software_stack?: string[] | null;
          stage: string;
          updated_at?: string;
        };
        Update: {
          amount?: number | null;
          archived_at?: string | null;
          category?: string | null;
          closed_at?: string | null;
          company_id?: number | null;
          contact_ids?: number[] | null;
          created_at?: string;
          description?: string | null;
          dm_present?: boolean | null;
          expected_closing_date?: string | null;
          follow_up_date?: string | null;
          hours_wasted_per_week?: number | null;
          id?: number;
          index?: number | null;
          lost_reason?: string | null;
          metadata?: Json | null;
          name?: string;
          primary_bottleneck?: string | null;
          project_progress_pct?: number | null;
          project_started_at?: string | null;
          project_status?: string | null;
          projected_hours?: number | null;
          response_time_hours?: number | null;
          sales_id?: number | null;
          software_stack?: string[] | null;
          stage?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deals_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      favicons_excluded_domains: {
        Row: {
          domain: string;
          id: number;
        };
        Insert: {
          domain: string;
          id?: number;
        };
        Update: {
          domain?: string;
          id?: number;
        };
        Relationships: [];
      };
      intake_leads: {
        Row: {
          address: string | null;
          business_name: string;
          city: string | null;
          created_at: string | null;
          current_draft_status: string | null;
          email: string | null;
          enrichment_summary: string | null;
          id: string;
          idempotency_key: string | null;
          last_outreach_at: string | null;
          metadata: Json | null;
          next_outreach_date: string | null;
          notes: string | null;
          outreach_count: number;
          outreach_draft: string | null;
          outreach_sequence_step: number;
          outreach_subject: string | null;
          phone: string | null;
          promoted_contact_id: number | null;
          region: string | null;
          rejection_reason: string | null;
          sales_id: number | null;
          source: string | null;
          status: string;
          trade_type_id: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          business_name: string;
          city?: string | null;
          created_at?: string | null;
          current_draft_status?: string | null;
          email?: string | null;
          enrichment_summary?: string | null;
          id?: string;
          idempotency_key?: string | null;
          last_outreach_at?: string | null;
          metadata?: Json | null;
          next_outreach_date?: string | null;
          notes?: string | null;
          outreach_count?: number;
          outreach_draft?: string | null;
          outreach_sequence_step?: number;
          outreach_subject?: string | null;
          phone?: string | null;
          promoted_contact_id?: number | null;
          region?: string | null;
          rejection_reason?: string | null;
          sales_id?: number | null;
          source?: string | null;
          status?: string;
          trade_type_id?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          business_name?: string;
          city?: string | null;
          created_at?: string | null;
          current_draft_status?: string | null;
          email?: string | null;
          enrichment_summary?: string | null;
          id?: string;
          idempotency_key?: string | null;
          last_outreach_at?: string | null;
          metadata?: Json | null;
          next_outreach_date?: string | null;
          notes?: string | null;
          outreach_count?: number;
          outreach_draft?: string | null;
          outreach_sequence_step?: number;
          outreach_subject?: string | null;
          phone?: string | null;
          promoted_contact_id?: number | null;
          region?: string | null;
          rejection_reason?: string | null;
          sales_id?: number | null;
          source?: string | null;
          status?: string;
          trade_type_id?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "intake_leads_promoted_contact_id_fkey";
            columns: ["promoted_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "intake_leads_promoted_contact_id_fkey";
            columns: ["promoted_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "intake_leads_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "intake_leads_trade_type_id_fkey";
            columns: ["trade_type_id"];
            isOneToOne: false;
            referencedRelation: "trade_types";
            referencedColumns: ["id"];
          },
        ];
      };
      integration_log: {
        Row: {
          action: string;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          idempotency_key: string | null;
          payload: Json | null;
          result: Json | null;
          source: string;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          idempotency_key?: string | null;
          payload?: Json | null;
          result?: Json | null;
          source: string;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          idempotency_key?: string | null;
          payload?: Json | null;
          result?: Json | null;
          source?: string;
        };
        Relationships: [];
      };
      lead_sources: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      n8n_workflow_runs: {
        Row: {
          completed_at: string | null;
          error: string | null;
          id: string;
          result: Json | null;
          started_at: string | null;
          status: string | null;
          trigger_row_id: string | null;
          trigger_table: string | null;
          workflow_id: string | null;
          workflow_name: string;
        };
        Insert: {
          completed_at?: string | null;
          error?: string | null;
          id?: string;
          result?: Json | null;
          started_at?: string | null;
          status?: string | null;
          trigger_row_id?: string | null;
          trigger_table?: string | null;
          workflow_id?: string | null;
          workflow_name: string;
        };
        Update: {
          completed_at?: string | null;
          error?: string | null;
          id?: string;
          result?: Json | null;
          started_at?: string | null;
          status?: string | null;
          trigger_row_id?: string | null;
          trigger_table?: string | null;
          workflow_id?: string | null;
          workflow_name?: string;
        };
        Relationships: [];
      };
      outreach_steps: {
        Row: {
          body: string | null;
          channel: string;
          created_at: string | null;
          id: number;
          intake_lead_id: string;
          provider_message_id: string | null;
          reply_body: string | null;
          reply_received_at: string | null;
          review_feedback: string | null;
          review_status: string | null;
          run_id: string | null;
          sent_at: string | null;
          sequence_step: number;
          status: string;
          subject: string | null;
        };
        Insert: {
          body?: string | null;
          channel?: string;
          created_at?: string | null;
          id?: number;
          intake_lead_id: string;
          provider_message_id?: string | null;
          reply_body?: string | null;
          reply_received_at?: string | null;
          review_feedback?: string | null;
          review_status?: string | null;
          run_id?: string | null;
          sent_at?: string | null;
          sequence_step: number;
          status?: string;
          subject?: string | null;
        };
        Update: {
          body?: string | null;
          channel?: string;
          created_at?: string | null;
          id?: number;
          intake_lead_id?: string;
          provider_message_id?: string | null;
          reply_body?: string | null;
          reply_received_at?: string | null;
          review_feedback?: string | null;
          review_status?: string | null;
          run_id?: string | null;
          sent_at?: string | null;
          sequence_step?: number;
          status?: string;
          subject?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "outreach_steps_intake_lead_id_fkey";
            columns: ["intake_lead_id"];
            isOneToOne: false;
            referencedRelation: "intake_leads";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          ext: string | null;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          id: string;
          preview: string | null;
          starred: boolean;
          storage_path: string | null;
          tags: string[] | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string | null;
          ext?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          id?: string;
          preview?: string | null;
          starred?: boolean;
          storage_path?: string | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          ext?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          id?: string;
          preview?: string | null;
          starred?: boolean;
          storage_path?: string | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          administrator: boolean;
          avatar: Json | null;
          disabled: boolean;
          email: string;
          first_name: string;
          id: number;
          last_name: string;
          user_id: string;
        };
        Insert: {
          administrator: boolean;
          avatar?: Json | null;
          disabled?: boolean;
          email: string;
          first_name?: string;
          id?: number;
          last_name?: string;
          user_id: string;
        };
        Update: {
          administrator?: boolean;
          avatar?: Json | null;
          disabled?: boolean;
          email?: string;
          first_name?: string;
          id?: number;
          last_name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          color: string;
          id: number;
          name: string;
        };
        Insert: {
          color: string;
          id?: number;
          name: string;
        };
        Update: {
          color?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          contact_id: number;
          done_date: string | null;
          due_date: string | null;
          id: number;
          sales_id: number | null;
          text: string | null;
          type: string | null;
        };
        Insert: {
          contact_id: number;
          done_date?: string | null;
          due_date?: string | null;
          id?: number;
          sales_id?: number | null;
          text?: string | null;
          type?: string | null;
        };
        Update: {
          contact_id?: number;
          done_date?: string | null;
          due_date?: string | null;
          id?: number;
          sales_id?: number | null;
          text?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts_summary";
            referencedColumns: ["id"];
          },
        ];
      };
      trade_types: {
        Row: {
          created_at: string | null;
          display_order: number | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      activity_log: {
        Row: {
          company: Json | null;
          company_id: number | null;
          contact: Json | null;
          contact_note: Json | null;
          date: string | null;
          deal: Json | null;
          deal_note: Json | null;
          id: string | null;
          sales_id: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      companies_summary: {
        Row: {
          address: string | null;
          city: string | null;
          company_size: string | null;
          context_links: Json | null;
          country: string | null;
          created_at: string | null;
          description: string | null;
          external_id: string | null;
          external_source: string | null;
          id: number | null;
          linkedin_url: string | null;
          logo: Json | null;
          metadata: Json | null;
          name: string | null;
          nb_contacts: number | null;
          nb_deals: number | null;
          phone_number: string | null;
          revenue: string | null;
          sales_id: number | null;
          sector: string | null;
          service_area: string | null;
          size: number | null;
          state_abbr: string | null;
          tax_identifier: string | null;
          tech_maturity: string | null;
          trade_type_id: string | null;
          website: string | null;
          zipcode: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "companies_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_trade_type_id_fkey";
            columns: ["trade_type_id"];
            isOneToOne: false;
            referencedRelation: "trade_types";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts_summary: {
        Row: {
          avatar: Json | null;
          background: string | null;
          company_id: number | null;
          company_name: string | null;
          email_fts: string | null;
          email_jsonb: Json | null;
          external_id: string | null;
          external_source: string | null;
          first_name: string | null;
          first_seen: string | null;
          gender: string | null;
          has_newsletter: boolean | null;
          id: number | null;
          last_name: string | null;
          last_seen: string | null;
          lead_source_id: string | null;
          linkedin_url: string | null;
          metadata: Json | null;
          nb_tasks: number | null;
          phone_fts: string | null;
          phone_jsonb: Json | null;
          sales_id: number | null;
          status: string | null;
          tags: number[] | null;
          title: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies_summary";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_lead_source_id_fkey";
            columns: ["lead_source_id"];
            isOneToOne: false;
            referencedRelation: "lead_sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_sales_id_fkey";
            columns: ["sales_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
        ];
      };
      init_state: {
        Row: {
          is_initialized: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_note_attachments_function_url: { Args: never; Returns: string };
      get_user_id_by_email: {
        Args: { email: string };
        Returns: {
          id: string;
        }[];
      };
      is_admin: { Args: never; Returns: boolean };
      merge_contacts: {
        Args: { loser_id: number; winner_id: number };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
