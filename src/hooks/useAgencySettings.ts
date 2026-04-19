import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/components/atomic-crm/providers/supabase/supabase";

export type AgencySettings = {
  weekly_capacity_hours: number;
  won_goal: number;
};

const DEFAULTS: AgencySettings = {
  weekly_capacity_hours: 40,
  won_goal: 10,
};

export const useAgencySettings = (): AgencySettings => {
  const [settings, setSettings] = useState<AgencySettings>(DEFAULTS);

  useEffect(() => {
    getSupabaseClient()
      .from("agency_settings")
      .select("weekly_capacity_hours, won_goal")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as AgencySettings);
      });
  }, []);

  return settings;
};
