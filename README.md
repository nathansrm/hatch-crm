# Hatch CRM Template

Client-template CRM baseline for trade and home service businesses. Built on react-admin and Supabase.

## Stack

- React + TypeScript
- react-admin
- Supabase auth, data, storage, and edge functions
- Tailwind CSS + shadcn/ui
- Vite

## Quick Start

```bash
npm install
```

Copy `.env.example` to `.env` and configure:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SB_PUBLISHABLE_KEY=your_publishable_key
```

```bash
npm run dev
```

## Design System

Hatch primitives live at `src/components/hatch-crm/_primitives/`.

Golden reference for the Obsidian chrome pattern: `TaskCreateSheet.tsx` and `TaskEditSheet.tsx`.

## Fork for a Client

1. Fork or copy this repo for the client project.
2. Create a new Supabase project and set the values in `.env`.
3. Keep client-specific branding, copy, and secrets out of the template repo.
4. Run the app locally with `npm run dev` before shipping client changes.
