# FE Init Project

A personal FE project template with modern tooling and best practices.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Tech Stack

**Core**

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool

**Code Quality**

- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Formatting
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [lint-staged](https://github.com/okonet/lint-staged) - Pre-commit linting

**Libraries**

- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [TanStack Query](https://tanstack.com/query) - Data fetching & state
- [Tailwind CSS v4](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide React](https://lucide.dev/) - Icons
- [Axios](https://axios-http.com/) - HTTP client
- [Zod](https://zod.dev/) - Schema validation
- [Vitest](https://vitest.dev/) - Testing

## Project Structure

```bash
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── shared/          # Shared components
├── features/            # Feature modules
├── hooks/               # Custom React hooks
├── layouts/             # Layout components
├── lib/
│   ├── api/            # API client
│   ├── constants/      # Constants
│   ├── env.ts          # Environment variables
│   └── utils.ts        # Utilities
├── routes/             # TanStack Router routes
├── types/              # Type definitions
└── styles.css          # Global styles
```

## Available Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Lint code
pnpm lint:fix     # Lint and auto-fix
pnpm format       # Format code
pnpm test         # Run tests
```

## Road Map

- [ ] agent base project setting
  - [ ] agent
  - [ ] agent skill
  - [ ] common MCP
- [ ] reference doc and code convention
- [ ] tanstack base api client

## 📄 License

MIT
