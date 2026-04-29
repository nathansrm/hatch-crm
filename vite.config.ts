import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import createHtmlPlugin from "vite-plugin-simple-html";
import { VitePWA } from "vite-plugin-pwa";

const manualChunks = (id: string) => {
  if (!id.includes("node_modules")) {
    return undefined;
  }

  if (
    id.includes("/node_modules/react/") ||
    id.includes("/node_modules/react-dom/") ||
    id.includes("/node_modules/scheduler/") ||
    id.includes("/node_modules/react-is/") ||
    id.includes("/node_modules/use-sync-external-store/")
  ) {
    return "vendor-react";
  }

  if (id.includes("/react-router") || id.includes("/@remix-run/")) {
    return "vendor-router";
  }

  if (
    id.includes("/ra-core/") ||
    id.includes("/ra-i18n-polyglot/") ||
    id.includes("/ra-language-") ||
    id.includes("/ra-supabase-") ||
    id.includes("/ra-data-fakerest/")
  ) {
    return "vendor-react-admin";
  }

  if (
    id.includes("/@supabase/") ||
    id.includes("/@tanstack/") ||
    id.includes("/fakerest/")
  ) {
    return "vendor-data";
  }

  if (
    id.includes("/@radix-ui/") ||
    id.includes("/@floating-ui/") ||
    id.includes("/lucide-react/") ||
    id.includes("/vaul/") ||
    id.includes("/sonner/") ||
    id.includes("/cmdk/")
  ) {
    return "vendor-ui";
  }

  if (id.includes("/@hello-pangea/dnd/") || id.includes("/@dnd-kit/")) {
    return "vendor-dnd";
  }

  if (
    id.includes("/@nivo/") ||
    id.includes("/recharts/") ||
    id.includes("/d3-")
  ) {
    return "vendor-charts";
  }

  if (
    id.includes("/marked/") ||
    id.includes("/dompurify/") ||
    id.includes("/react-dropzone/") ||
    id.includes("/cropperjs/") ||
    id.includes("/react-cropper/")
  ) {
    return "vendor-rich-content";
  }

  if (id.includes("/faker/")) {
    return "vendor-demo-data";
  }

  return "vendor-misc";
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: process.env.NODE_ENV !== "CI",
      filename: "./dist/stats.html",
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          mainScript: `src/main.tsx`,
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
      },
      manifest: false, // Use existing manifest.json from public/
    }),
  ],
  define:
    process.env.NODE_ENV === "production" && process.env.VITE_SUPABASE_URL
      ? {
          "import.meta.env.VITE_IS_DEMO": JSON.stringify(
            process.env.VITE_IS_DEMO,
          ),
          "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
            process.env.VITE_SUPABASE_URL,
          ),
          "import.meta.env.VITE_SB_PUBLISHABLE_KEY": JSON.stringify(
            process.env.VITE_SB_PUBLISHABLE_KEY,
          ),
          "import.meta.env.VITE_INBOUND_EMAIL": JSON.stringify(
            process.env.VITE_INBOUND_EMAIL,
          ),
          "import.meta.env.VITE_ATTACHMENTS_BUCKET": JSON.stringify(
            process.env.VITE_ATTACHMENTS_BUCKET,
          ),
        }
      : undefined,
  base: "./",
  esbuild: {
    keepNames: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  optimizeDeps: {
    include: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@supabase/supabase-js",
      "@tanstack/query-async-storage-persister",
      "@tanstack/react-query",
      "@tanstack/react-query-persist-client",
      "class-variance-authority",
      "clsx",
      "cmdk",
      "date-fns",
      "date-fns/locale",
      "date-fns/startOfToday",
      "date-fns/endOfToday",
      "date-fns/endOfTomorrow",
      "date-fns/endOfWeek",
      "diacritic",
      "dompurify",
      "faker/locale/en",
      "faker/locale/en_US",
      "inflection",
      "jsonexport/dist",
      "lodash",
      "lodash/get",
      "lodash/get.js",
      "lodash/isEqual",
      "lodash/isObject",
      "lodash/matches",
      "lodash/pickBy",
      "lucide-react",
      "marked",
      "papaparse",
      "query-string",
      "ra-core",
      "ra-data-fakerest",
      "ra-i18n-polyglot",
      "ra-language-english",
      "ra-language-french",
      "ra-supabase-core",
      "ra-supabase-language-english",
      "ra-supabase-language-french",
      "react-cropper",
      "react-dom/client",
      "react-dropzone",
      "react-error-boundary",
      "react-hook-form",
      "react-router",
      "react-router-dom",
      "sonner",
      "tailwind-merge",
      "vaul",
    ],
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
