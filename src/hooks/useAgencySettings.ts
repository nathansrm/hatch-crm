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

let _cache: AgencySettings | null = null;
let _promise: Promise<AgencySettings> | null = null;

function fetchAgencySettings(): Promise<AgencySettings> {
  if (_promise) return _promise;
  _promise = getSupabaseClient()
    .from("agency_settings")
    .select("weekly_capacity_hours, won_goal")
    .eq("id", 1)
    .single()
    .then(({ data }) => {
      const result = data ? (data as AgencySettings) : DEFAULTS;
      _cache = result;
      return result;
    })
    .catch(() => DEFAULTS);
  return _promise;
}

export const useAgencySettings = (): AgencySettings => {
  const [settings, setSettings] = useState<AgencySettings>(_cache ?? DEFAULTS);

  useEffect(() => {
    if (_cache) return;
    fetchAgencySettings().then((result) => setSettings(result));
  }, []);

  return settings;
};
