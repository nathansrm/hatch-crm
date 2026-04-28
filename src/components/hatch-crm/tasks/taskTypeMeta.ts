import {
  AlertCircle,
  Briefcase,
  Calendar,
  ClipboardList,
  FileText,
  Mail,
  Phone,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type TaskTypeMeta = {
  icon: LucideIcon;
  label: string;
  accentClass: string;
  bgClass: string;
};

export const TASK_TYPE_META: Record<string, TaskTypeMeta> = {
  call: {
    icon: Phone,
    label: "Call",
    accentClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
  },
  email: {
    icon: Mail,
    label: "Email",
    accentClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  "site-visit": {
    icon: Briefcase,
    label: "Site Visit",
    accentClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
  },
  demo: {
    icon: Sparkles,
    label: "Demo",
    accentClass: "text-sky-400",
    bgClass: "bg-sky-500/10",
  },
  "follow-up": {
    icon: Users,
    label: "Follow-up",
    accentClass: "text-violet-400",
    bgClass: "bg-violet-500/10",
  },
  "audit-call": {
    icon: ClipboardList,
    label: "Audit Call",
    accentClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
  },
  proposal: {
    icon: FileText,
    label: "Proposal",
    accentClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  meeting: {
    icon: Calendar,
    label: "Meeting",
    accentClass: "text-indigo-400",
    bgClass: "bg-indigo-500/10",
  },
};

export const FALLBACK_TASK_META: TaskTypeMeta = {
  icon: AlertCircle,
  label: "Task",
  accentClass: "text-muted-foreground",
  bgClass: "bg-muted/40",
};

export const getTaskMeta = (type: string | null | undefined): TaskTypeMeta =>
  (type != null && TASK_TYPE_META[type]) || FALLBACK_TASK_META;
