// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { server } from "typescript";

// https://astro.build/config
export default defineConfig({
  base: "/hatch-crm/doc/",
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: "assets",
  },
  integrations: [
    starlight({
      title: "Hatch CRM",
      favicon: "./favicon.svg",
      customCss: ["./src/styles/global.css"],
      logo: {
        dark: "./public/hatch-theory-horizontal-dark.png",
        light: "./public/hatch-theory-horizontal-light.png",
      },
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:title",
            content: "Hatch CRM Documentation",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:description",
            content: "A full-featured CRM toolkit for personalized solutions.",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:type",
            content: "website",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:url",
            content: "https://hatchtheory.com/hatch-crm/doc",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content:
              "https://hatchtheory.com/hatch-crm/img/hatch-crm-banner.png",
          },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/hatchtheory/hatch-crm",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          link: "/",
        },
        {
          label: "Users Documentation",
          items: [
            "users/user-management",
            "users/settings",
            "users/import-data",
            "users/merging-contacts",
            "users/inbound-email",
            "users/mobile-app",
            "users/mcp-server",
          ],
        },
        {
          label: "Developers Documentation",
          autogenerate: { directory: "developers" },
        },
        {
          label: "What's New",
          link: "https://github.com/hatchtheory/hatch-crm/releases",
          attrs: { target: "_blank" },
        },
      ],
    }),
  ],
});
