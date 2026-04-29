// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "build",
      "lib",
      "esm",
      "prism.js",
      "packages/create-react-admin/templates/**",
      ".github",
      ".supabase-e2e",
      ".supabase-e2e/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/node_modules/**", "**/dist/**", "**/.astro/**"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "max-lines": [
        "warn",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name='style'] Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Raw hex colors are not allowed in JSX style props. Use a CSS variable via var(--token-name). See src/index.css for available tokens.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}/]",
          message:
            "Raw hex colors are not allowed in JSX style props. Use a CSS variable via var(--token-name). See src/index.css for available tokens.",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
  {
    files: [
      "src/components/admin/*.{ts,tsx}",
      "src/hooks/*.{ts,tsx}",
      "src/lib/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
  {
    files: ["src/components/ui/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
  {
    // Existing monoliths/generator outputs. Keep max-lines active everywhere
    // else so new work does not add to this cleanup queue.
    files: [
      "src/components/admin/data-table.tsx",
      "src/components/admin/filter-form.tsx",
      "src/components/hatch-crm/contacts/ContactListContent.tsx",
      "src/components/hatch-crm/dashboard/widgets/ActiveProjectsGrid.tsx",
      "src/components/hatch-crm/dashboard/widgets/HandoffQueue.tsx",
      "src/components/hatch-crm/intake/IntakeList.tsx",
      "src/components/hatch-crm/misc/useImportFromJson.ts",
      "src/components/hatch-crm/providers/commons/englishCrmMessages.ts",
      "src/components/hatch-crm/providers/commons/frenchCrmMessages.ts",
      "src/components/hatch-crm/providers/fakerest/dataProvider.ts",
      "src/components/hatch-crm/providers/fakerest/internal/supabaseAdapter.test.ts",
      "src/components/hatch-crm/providers/supabase/dataProvider.ts",
      "src/components/hatch-crm/reports/ReportsPage.tsx",
      "src/components/hatch-crm/resources/ResourcesPage.tsx",
      "src/components/hatch-crm/settings/SettingsPage.tsx",
      "src/components/hatch-crm/settings/SettingsPageMobile.tsx",
      "src/components/hatch-crm/tasks/TasksPage.tsx",
      "src/components/ui/sidebar.tsx",
      "src/types/supabase.ts",
      "supabase/functions/postmark/addNoteToContact.test.ts",
      "supabase/functions/send-outreach/index.ts",
    ],
    rules: {
      "max-lines": "off",
    },
  },
  storybook.configs["flat/recommended"],
);
