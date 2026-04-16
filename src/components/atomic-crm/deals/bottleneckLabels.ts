export const bottleneckLabels: Record<string, string> = {
  "Lead response speed": "Lead Speed",
  "Estimating turnaround": "Estimating",
  "Job scheduling": "Scheduling",
  "Invoicing delays": "Invoicing",
  "Manual data entry": "Manual Entry",
  "Follow-up process": "Follow-ups",
  "Crew communication": "Crew Comms",
};

export const getBottleneckLabel = (raw: string): string => {
  if (!raw) {
    return "";
  }

  const mapped = bottleneckLabels[raw];
  if (mapped) {
    return mapped;
  }

  return raw.length <= 20 ? raw : `${raw.slice(0, 17).trimEnd()}...`;
};
