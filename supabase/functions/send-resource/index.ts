import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

interface SendResourcePayload {
  resource_id?: string;
  to_email?: string;
  subject?: string;
  message?: string;
}

interface ResourceRow {
  id: string;
  title: string;
  storage_path: string | null;
  file_name: string | null;
  file_type: string | null;
}

interface JwtPayload {
  sub?: string;
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });

const toBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");

    return JSON.parse(atob(normalizedPayload)) as JwtPayload;
  } catch {
    return null;
  }
};

Deno.serve((req) =>
  OptionsMiddleware(req, async (request) => {
    try {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
      }

      const authorization = request.headers.get("Authorization");
      if (!authorization?.startsWith("Bearer ")) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const token = authorization.slice("Bearer ".length).trim();
      const callerUuid = decodeJwtPayload(token)?.sub?.trim();

      if (!callerUuid) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      let body: SendResourcePayload;
      try {
        body = (await request.json()) as SendResourcePayload;
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
      }

      const resourceId = body.resource_id?.trim();
      const toEmail = body.to_email?.trim();

      if (!resourceId || !toEmail) {
        return jsonResponse(
          { error: "resource_id and to_email are required" },
          400,
        );
      }

      const { data: resourceData, error: resourceError } = await supabaseAdmin
        .from("resources")
        .select("*")
        .eq("id", resourceId)
        .eq("user_id", callerUuid)
        .single();

      if (resourceError) {
        const status = resourceError.code === "PGRST116" ? 403 : 500;
        return jsonResponse(
          {
            error:
              status === 403 ? "Forbidden" : resourceError.message,
          },
          status,
        );
      }

      const resource = resourceData as ResourceRow;
      let attachments:
        | Array<{ Name: string; Content: string; ContentType: string }>
        | undefined;

      if (resource.storage_path) {
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage.from("resources")
          .download(resource.storage_path);

        if (downloadError || !fileData) {
          return jsonResponse(
            {
              error: downloadError?.message ?? "Failed to download resource",
            },
            500,
          );
        }

        const fileBuffer = await fileData.arrayBuffer();
        attachments = [
          {
            Name: resource.file_name || resource.title,
            Content: toBase64(fileBuffer),
            ContentType: resource.file_type || "application/octet-stream",
          },
        ];
      }

      const postmarkResponse = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token":
            Deno.env.get("POSTMARK_SERVER_TOKEN") ?? "",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          From: Deno.env.get("POSTMARK_FROM_ADDRESS") ?? "",
          To: toEmail,
          Subject: body.subject ?? resource.title,
          TextBody: body.message ?? "",
          HtmlBody: `<p>${(body.message ?? "").replace(/\n/g, "<br>")}</p>`,
          MessageStream:
            Deno.env.get("POSTMARK_OUTREACH_STREAM") ?? "outbound",
          ...(attachments ? { Attachments: attachments } : {}),
        }),
      });

      if (!postmarkResponse.ok) {
        return jsonResponse(
          { error: await postmarkResponse.text() },
          postmarkResponse.status,
        );
      }

      return jsonResponse({ success: true });
    } catch (error) {
      console.error("send-resource failed", error);
      return jsonResponse(
        { error: error instanceof Error ? error.message : "Internal server error" },
        500,
      );
    }
  })
);
