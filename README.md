# LinkedIn Search — Frontend

  React + Vite frontend for LinkedIn Profile Search.

  ## Stack
  - React 18 + TypeScript
  - Vite
  - Tailwind CSS (LinkedIn-inspired palette)
  - TanStack React Query
  - Wouter (routing)
  - Shadcn/ui components
  - Framer Motion
  - Lucide Icons

  ## Features
  - Skills and designation search boxes
  - Total count with subset navigation (1K profiles per subset)
  - Profile cards grid with relevance score badges
  - Full profile detail modal (experience, education, skills)
  - 20 profiles per page with pagination
  - Loading skeletons and empty/error states

  ## Setup
  ```bash
  npm install
  npm run dev
  ```

  ## Environment
  Expects the API server running at `/api`. Update `vite.config.ts` proxy if needed.
  