import { useCreate, useGetList, useUpdate } from "ra-core";
import type { ChangeEvent, MouseEvent } from "react";
import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Edit,
  FileText,
  Plus,
  Search,
  Send,
  Star,
  X,
} from "lucide-react";
import { getSupabaseClient } from "@/components/atomic-crm/providers/supabase/supabase";

const ALLOWED_RESOURCE_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
].join(",");

type ResourceCategory = "all" | "sales" | "onboarding" | "templates" | "internal";
type ResourceValueCategory = Exclude<ResourceCategory, "all">;

type ResourceRecord = {
  id: string;
  user_id?: string | null;
  title: string;
  description: string;
  desc: string;
  category: ResourceValueCategory;
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  ext: string;
  size: string;
  updated: string;
  tags: string[];
  starred: boolean;
  preview: string;
  created_at: string;
  updated_at: string;
  type: "document" | "template";
};

const CATEGORIES: { key: ResourceCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sales", label: "Sales" },
  { key: "onboarding", label: "Onboarding" },
  { key: "templates", label: "Templates" },
  { key: "internal", label: "Internal" },
];

const EXT_COLORS: Record<string, string> = {
  md: "#4DC8E8",
  docx: "#A78BFA",
  pdf: "#F5B84A",
  xlsx: "#34D399",
};

const DETAIL_INPUT_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 7,
  padding: "9px 12px",
  color: "#ECEEF5",
  fontSize: 13,
  width: "100%",
  outline: "none",
};

const fmtRel = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
};

const formatSize = (bytes: number | null | undefined) => {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 104857.6) / 10} MB`;
};

const normalizeCategory = (
  category: string | null | undefined,
): ResourceValueCategory => {
  if (
    category === "sales"
    || category === "onboarding"
    || category === "templates"
  ) {
    return category;
  }
  return "internal";
};

const mapResource = (raw: any): ResourceRecord => {
  const category = normalizeCategory(raw?.category);
  const updatedAt =
    raw?.updated_at || raw?.created_at || new Date().toISOString();
  const description =
    typeof raw?.description === "string" ? raw.description : "";
  const fileSize =
    typeof raw?.file_size === "number"
      ? raw.file_size
      : typeof raw?.file_size === "string"
        ? Number(raw.file_size)
        : null;
  const ext =
    typeof raw?.ext === "string" && raw.ext.length > 0
      ? raw.ext
      : typeof raw?.file_name === "string" && raw.file_name.includes(".")
        ? raw.file_name.split(".").pop() || ""
        : "";

  return {
    id: String(raw?.id ?? ""),
    user_id: raw?.user_id ?? null,
    title:
      typeof raw?.title === "string" && raw.title.length > 0
        ? raw.title
        : "Untitled resource",
    description,
    desc: description,
    category,
    storage_path: raw?.storage_path ?? null,
    file_name: raw?.file_name ?? null,
    file_size: fileSize,
    file_type: raw?.file_type ?? null,
    ext,
    size: formatSize(fileSize),
    updated: updatedAt,
    tags: Array.isArray(raw?.tags)
      ? raw.tags.filter((tag: unknown): tag is string => typeof tag === "string")
      : [],
    starred: Boolean(raw?.starred),
    preview: typeof raw?.preview === "string" ? raw.preview : "",
    created_at: raw?.created_at ?? updatedAt,
    updated_at: updatedAt,
    type: category === "templates" ? "template" : "document",
  };
};

const getFunctionErrorMessage = async (error: any) => {
  try {
    const data = await error?.context?.json();
    if (typeof data?.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch {
    // Ignore context parsing failures
  }

  return typeof error?.message === "string" && error.message.length > 0
    ? error.message
    : "Something went wrong.";
};

export const ResourcesPage = () => {
  const isDemo = import.meta.env.VITE_IS_DEMO === "true";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [selectedContact, setSelectedContact] = useState<{ id: string | number; first_name: string; last_name: string; email: string } | null>(null);
  const [contactQuery, setContactQuery] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] =
    useState<ResourceValueCategory>("internal");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: rawResources, isPending } = useGetList("resources", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "created_at", order: "DESC" },
  });
  const [create] = useCreate();
  const [update] = useUpdate();
  const { data: contactSuggestions } = useGetList("contacts", {
    pagination: { page: 1, perPage: 8 },
    sort: { field: "last_name", order: "ASC" },
    filter: contactQuery.length >= 2 ? { q: contactQuery } : {},
  });

  const resources = (rawResources ?? []).map(mapResource);
  const selected =
    resources.find((resource) => resource.id === selectedId) ?? null;

  const filtered = resources.filter((resource) => {
    const matchCat = category === "all" || resource.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q
      || resource.title.toLowerCase().includes(q)
      || resource.desc.toLowerCase().includes(q)
      || resource.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const starred = filtered.filter((resource) => resource.starred);
  const rest = filtered.filter((resource) => !resource.starred);
  const actionUnavailableTitle = isDemo ? "Not available in demo" : undefined;

  const handleSelect = (resource: ResourceRecord) => {
    setSelectedId(resource.id);
    setEditing(false);
    setCopied(false);
  };

  const handleUploadClick = () => {
    if (isDemo) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isDemo) {
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userError || !userId) {
        console.error("resources.auth.error", userError);
        return;
      }

      const storagePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase
        .storage.from("resources")
        .upload(storagePath, file);

      if (uploadError) {
        console.error("resources.upload.error", uploadError);
        return;
      }

      const createdResource = await create(
        "resources",
        {
          data: {
            user_id: userId,
            title: file.name,
            category: "internal",
            storage_path: storagePath,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            ext: file.name.split(".").pop() || "",
            tags: [],
            starred: false,
          },
        },
        { returnPromise: true },
      );

      if (createdResource?.id) {
        setSelectedId(String(createdResource.id));
      }
    } catch (error) {
      console.error("resources.create.error", error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleToggleStar = async (
    event: MouseEvent<HTMLButtonElement>,
    resource: ResourceRecord,
  ) => {
    event.stopPropagation();

    try {
      await update(
        "resources",
        {
          id: resource.id,
          data: {
            starred: !resource.starred,
            updated_at: new Date().toISOString(),
          },
          previousData: resource,
        },
        { returnPromise: true },
      );
    } catch (error) {
      console.error("resources.star.error", error);
    }
  };

  const handleOpenSend = () => {
    if (isDemo || !selected) return;
    setSendOpen(true);
    setSendLoading(false);
    setSendError("");
    setToEmail("");
    setSelectedContact(null);
    setContactQuery("");
    setSendSubject(selected.title);
    setSendMessage("");
  };

  const handleSend = async () => {
    if (isDemo || !selected) return;

    setSendLoading(true);
    setSendError("");

    try {
      const { error } = await getSupabaseClient().functions.invoke(
        "send-resource",
        {
          body: {
            resource_id: selected.id,
            to_email: toEmail,
            subject: sendSubject,
            message: sendMessage,
          },
        },
      );

      if (error) {
        setSendError(await getFunctionErrorMessage(error));
        setSendLoading(false);
        return;
      }

      setSendOpen(false);
      setSendLoading(false);
    } catch (error) {
      setSendError(await getFunctionErrorMessage(error));
      setSendLoading(false);
    }
  };

  const handleCopy = async () => {
    if (isDemo || !selected?.storage_path) return;

    try {
      const { data } = await getSupabaseClient()
        .storage.from("resources")
        .createSignedUrl(selected.storage_path, 3600);

      if (data?.signedUrl) {
        await navigator.clipboard.writeText(data.signedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("resources.copy.error", error);
    }
  };

  const handleEditStart = () => {
    if (!selected) return;
    setEditing(true);
    setEditTitle(selected.title);
    setEditDesc(selected.description);
    setEditCategory(selected.category);
  };

  const handleEditCancel = () => {
    setEditing(false);
    if (!selected) return;
    setEditTitle(selected.title);
    setEditDesc(selected.description);
    setEditCategory(selected.category);
  };

  const handleEditSave = async () => {
    if (!selected) return;

    try {
      await update(
        "resources",
        {
          id: selected.id,
          data: {
            title: editTitle,
            description: editDesc,
            category: editCategory,
            updated_at: new Date().toISOString(),
          },
          previousData: selected,
        },
        { returnPromise: true },
      );
      setEditing(false);
    } catch (error) {
      console.error("resources.edit.error", error);
    }
  };

  return (
    <>
      <div
        style={{ display: "flex", flex: 1, minHeight: 0, background: "#060A16" }}
      >
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          <div style={{ padding: "24px 28px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#4DC8E8",
                  fontWeight: 700,
                }}
              >
                Library
              </span>
              <span
                style={{
                  height: 1,
                  width: 24,
                  background: "rgba(77,200,232,0.4)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: '"Manrope Variable", ui-sans-serif',
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#ECEEF5",
                  }}
                >
                  Resources
                </h1>
                <p
                  style={{ margin: "4px 0 0", color: "#6B7494", fontSize: 13 }}
                >
                  Sales scripts, onboarding packages, templates, and client
                  materials
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    width: 220,
                  }}
                >
                  <Search size={14} color="#4A5270" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search resources..."
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#ECEEF5",
                      fontSize: 13,
                      width: "100%",
                    }}
                  />
                </div>
                <button
                  onClick={handleUploadClick}
                  disabled={uploading || isDemo}
                  title={actionUnavailableTitle}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "#4DC8E8",
                    color: "#061022",
                    borderRadius: 7,
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: "none",
                    cursor: uploading || isDemo ? "not-allowed" : "pointer",
                    opacity: uploading || isDemo ? 0.75 : 1,
                  }}
                >
                  <Plus size={14} strokeWidth={2.5} />{" "}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 7,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: category === c.key ? "#ECEEF5" : "#6B7494",
                    background:
                      category === c.key
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    border:
                      category === c.key
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {c.label}{" "}
                  <span
                    style={{
                      fontFamily: '"JetBrains Mono", ui-monospace',
                      fontSize: 10.5,
                      color: category === c.key ? "#4DC8E8" : "#4A5270",
                    }}
                  >
                    {
                      resources.filter(
                        (resource) =>
                          c.key === "all" || resource.category === c.key,
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "0 28px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {isPending ? (
              <div
                style={{
                  padding: "60px 0",
                  textAlign: "center",
                  color: "#4A5270",
                  fontSize: 14,
                }}
              >
                Loading resources...
              </div>
            ) : (
              <>
                {starred.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <Star size={12} color="#F5B84A" fill="#F5B84A" />
                      <span
                        style={{
                          fontSize: 10.5,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#4A5270",
                          fontWeight: 700,
                        }}
                      >
                        Pinned
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {starred.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          selectedId={selectedId}
                          onSelect={handleSelect}
                          onToggleStar={handleToggleStar}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {rest.length > 0 && (
                  <div>
                    {starred.length > 0 && (
                      <div
                        style={{
                          fontSize: 10.5,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "#4A5270",
                          fontWeight: 700,
                          marginBottom: 12,
                        }}
                      >
                        All resources
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {rest.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          selectedId={selectedId}
                          onSelect={handleSelect}
                          onToggleStar={handleToggleStar}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div
                    style={{
                      padding: "60px 0",
                      textAlign: "center",
                      color: "#4A5270",
                      fontSize: 14,
                    }}
                  >
                    No resources match your search.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {selected && (
          <div
            style={{
              width: 380,
              flexShrink: 0,
              background: "#0A0F1A",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "20px 22px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ flex: 1, marginRight: 12 }}>
                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <select
                      value={editCategory}
                      onChange={(e) =>
                        setEditCategory(normalizeCategory(e.target.value))}
                      style={DETAIL_INPUT_STYLE}
                    >
                      {CATEGORIES.filter((option) => option.key !== "all").map(
                        (option) => (
                          <option
                            key={option.key}
                            value={option.key}
                            style={{ color: "#061022" }}
                          >
                            {option.label}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        ...DETAIL_INPUT_STYLE,
                        fontFamily: '"Manrope Variable", ui-sans-serif',
                        fontSize: 17,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                      }}
                    />
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      style={{ ...DETAIL_INPUT_STYLE, resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleEditSave}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "9px 0",
                          borderRadius: 8,
                          background: "#4DC8E8",
                          color: "#061022",
                          fontWeight: 700,
                          fontSize: 12.5,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        style={{
                          padding: "9px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.03)",
                          color: "#6B7494",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: 9.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#4DC8E8",
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {selected.category}
                    </div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: '"Manrope Variable", ui-sans-serif',
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#ECEEF5",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                      }}
                    >
                      {selected.title}
                    </h2>
                    <div
                      style={{ fontSize: 12, color: "#6B7494", marginTop: 4 }}
                    >
                      {selected.desc}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setEditing(false);
                }}
                style={{
                  color: "#6B7494",
                  padding: 4,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 20,
                flexShrink: 0,
              }}
            >
              {[
                ["Type", selected.ext ? selected.ext.toUpperCase() : "FILE"],
                ["Size", selected.size],
                ["Updated", fmtRel(selected.updated)],
              ].map(([k, v]) => (
                <div key={k}>
                  <div
                    style={{
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#4A5270",
                      fontWeight: 700,
                      marginBottom: 3,
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "#ECEEF5",
                      fontWeight: 500,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "14px 22px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                onClick={handleOpenSend}
                disabled={isDemo}
                title={actionUnavailableTitle}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 0",
                  borderRadius: 8,
                  background: "#4DC8E8",
                  color: "#061022",
                  fontWeight: 700,
                  fontSize: 12.5,
                  border: "none",
                  cursor: isDemo ? "not-allowed" : "pointer",
                  opacity: isDemo ? 0.6 : 1,
                }}
              >
                <Send size={13} strokeWidth={2.5} /> Send to client
              </button>
              <button
                onClick={handleCopy}
                disabled={isDemo}
                title={actionUnavailableTitle}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#6B7494",
                  cursor: isDemo ? "not-allowed" : "pointer",
                  opacity: isDemo ? 0.6 : 1,
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleEditStart}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#6B7494",
                  cursor: "pointer",
                }}
              >
                <Edit size={14} />
              </button>
            </div>

            <div style={{ padding: "16px 22px", flex: 1, overflowY: "auto" }}>
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#4A5270",
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Preview
              </div>
              {selected.preview ? (
                <pre
                  style={{
                    margin: 0,
                    fontFamily: '"JetBrains Mono", ui-monospace',
                    fontSize: 11.5,
                    color: "#6B7494",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    padding: "14px 16px",
                  }}
                >
                  {selected.preview}
                </pre>
              ) : selected.storage_path ? (
                <div style={{ color: "#4A5270", fontSize: 12 }}>
                  {isDemo
                    ? "No preview available. Download links are not available in demo."
                    : "No preview available. Use Copy to get a download link."}
                </div>
              ) : (
                <pre
                  style={{
                    margin: 0,
                    fontFamily: '"JetBrains Mono", ui-monospace',
                    fontSize: 11.5,
                    color: "#6B7494",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    padding: "14px 16px",
                  }}
                >
                  {selected.preview}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {sendOpen && selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: 420,
              background: "#0A0F1A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily: '"Manrope Variable", ui-sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: "#ECEEF5",
              }}
            >
              Send to Client
            </div>
            <div style={{ fontSize: 12, color: "#6B7494", marginTop: 4 }}>
              {selected.title}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 18,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#4A5270",
                    fontWeight: 700,
                  }}
                >
                  To
                </span>
                {selectedContact ? (
                  <div
                    style={{
                      ...DETAIL_INPUT_STYLE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span style={{ color: "#ECEEF5", fontSize: 13 }}>
                      {selectedContact.first_name} {selectedContact.last_name}
                      <span style={{ color: "#4A5270", marginLeft: 8 }}>{selectedContact.email}</span>
                    </span>
                    <button
                      onClick={() => { setSelectedContact(null); setToEmail(""); setContactQuery(""); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#4A5270", padding: 0, display: "flex" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <input
                      autoFocus
                      placeholder="Search contacts..."
                      value={contactQuery}
                      onChange={(e) => setContactQuery(e.target.value)}
                      style={DETAIL_INPUT_STYLE}
                    />
                    {contactQuery.length >= 2 && Array.isArray(contactSuggestions) && contactSuggestions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 4px)",
                          left: 0,
                          right: 0,
                          background: "#0F1627",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          overflow: "hidden",
                          zIndex: 10,
                        }}
                      >
                        {contactSuggestions.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedContact({ id: c.id, first_name: c.first_name, last_name: c.last_name, email: c.email });
                              setToEmail(c.email);
                              setContactQuery("");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              padding: "10px 14px",
                              background: "none",
                              border: "none",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span style={{ color: "#ECEEF5", fontSize: 13 }}>
                              {c.first_name} {c.last_name}
                            </span>
                            <span style={{ color: "#4A5270", fontSize: 12 }}>{c.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#4A5270",
                    fontWeight: 700,
                  }}
                >
                  Subject
                </span>
                <input
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                  style={DETAIL_INPUT_STYLE}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#4A5270",
                    fontWeight: 700,
                  }}
                >
                  Message
                </span>
                <textarea
                  rows={4}
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  style={{ ...DETAIL_INPUT_STYLE, resize: "vertical" }}
                />
              </label>
            </div>

            {sendError ? (
              <div style={{ marginTop: 14, fontSize: 12, color: "#F87171" }}>
                {sendError}
              </div>
            ) : null}

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}
            >
              <button
                onClick={() => {
                  setSendOpen(false);
                  setSendError("");
                }}
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#6B7494",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sendLoading || isDemo}
                title={actionUnavailableTitle}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 14px",
                  background: "#4DC8E8",
                  color: "#061022",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 12.5,
                  border: "none",
                  cursor: sendLoading || isDemo ? "not-allowed" : "pointer",
                  opacity: sendLoading || isDemo ? 0.75 : 1,
                }}
              >
                {sendLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_RESOURCE_FILE_TYPES}
        disabled={isDemo}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

const ResourceCard = ({
  resource,
  selectedId,
  onSelect,
  onToggleStar,
}: {
  resource: ResourceRecord;
  selectedId: string | null;
  onSelect: (resource: ResourceRecord) => void;
  onToggleStar: (
    event: MouseEvent<HTMLButtonElement>,
    resource: ResourceRecord,
  ) => void;
}) => {
  const color = EXT_COLORS[resource.ext] ?? "#9AA3BE";
  const isActive = selectedId === resource.id;

  return (
    <div
      onClick={() => onSelect(resource)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 10,
        background: isActive ? "#131B2E" : "#0D1424",
        border: isActive
          ? "1px solid rgba(77,200,232,0.3)"
          : "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 9,
          flexShrink: 0,
          background: `${color}12`,
          border: `1px solid ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {resource.type === "template" ? (
          <Copy size={16} color={color} strokeWidth={1.8} />
        ) : (
          <FileText size={16} color={color} strokeWidth={1.8} />
        )}
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 700,
            color,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          .{resource.ext || "file"}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "#ECEEF5",
              fontFamily: '"Manrope Variable", ui-sans-serif',
            }}
          >
            {resource.title}
          </span>
          <button
            onClick={(event) => onToggleStar(event, resource)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: resource.starred ? "#F5B84A" : "#4A5270",
            }}
          >
            <Star
              size={12}
              color={resource.starred ? "#F5B84A" : "#4A5270"}
              fill={resource.starred ? "#F5B84A" : "none"}
            />
          </button>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6B7494",
            marginBottom: 6,
            lineHeight: 1.4,
          }}
        >
          {resource.desc}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {resource.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4A5270",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "2px 7px",
                borderRadius: 3,
              }}
            >
              {tag}
            </span>
          ))}
          <span
            style={{
              fontSize: 11,
              color: "#4A5270",
              marginLeft: "auto",
              fontFamily: '"JetBrains Mono", ui-monospace',
            }}
          >
            {resource.size} - {fmtRel(resource.updated)}
          </span>
        </div>
      </div>
    </div>
  );
};

ResourcesPage.path = "/resources";
