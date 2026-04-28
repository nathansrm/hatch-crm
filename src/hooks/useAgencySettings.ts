import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/components/hatch-crm/providers/supabase/supabase";

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

async function fetchAgencySettings(): Promise<AgencySettings> {
  try {
    const { data } = await getSupabaseClient()
      .from("agency_settings")
      .select("weekly_capacity_hours, won_goal")
      .eq("id", 1)
      .single();
    const result = data ? (data as AgencySettings) : DEFAULTS;
    _cache = result;
    return result;
  } catch {
    return DEFAULTS;
  }
}

function getAgencySettings(): Promise<AgencySettings> {
  if (!_promise) _promise = fetchAgencySettings();
  return _promise;
}

export const useAgencySettings = (): AgencySettings => {
  const [settings, setSettings] = useState<AgencySettings>(_cache ?? DEFAULTS);

  useEffect(() => {
    if (_cache) return;
    getAgencySettings().then((result) => setSettings(result));
  }, []);

  return settings;
};
