# Code Review Skill Changelog

Tracks changes to the code-review guidelines. Check this file to ensure reviews follow the latest standards.

## Format

```markdown
## [YYYY-MM-DD] - Category

### Changed

- What changed

### Why

- Reason for change
```

---

## [2026-06-17] - Skills / Patterns / React

### Added

- 5-step workflow with a copy-paste progress checklist
- **Step 2: pattern detection** — auto-load the right skill/doc (tanstack-start, mobile-view, gen-unit-test, gen-storybook) or read the right doc (form, list, composition)
- **Single Source rule** — flag the same domain concept rendered/computed/validated/gated in 2+ places as High priority
- **Section-break gap audit** — flag `flex`/`grid` containers missing an explicit `gap` between distinct sections
- Code-smell catalog additions: inline `renderXxx` in component body, stable-reference dep trap (`useMemo([table])`), suspicious default fallbacks, unneeded memo in plain components, switch statement, deep relative imports
- Server function / ORM / DB is treated as **flag-for-confirmation**, NOT a violation — there's no backend scenario yet, but the project isn't opposed to adding one later (per owner). This intentionally diverges from CLAUDE.md's literal "Do not introduce server functions, ORMs, or databases"
- New reference files: `trigger-rules.md`, `review-process.md`, `project-conventions.md`
- New `examples/review-examples.md` (project-specific examples)

### Changed

- State-management table now reflects this project's tools: TanStack Query for server/in-memory data, Zustand for global client UI
- Conventions now index into this repo's `docs/` (00-common, 01-typescript, 02-react, 03-file-structure, 04-component/composition, pattern/form, pattern/list)

### Why

- Ported the structure and review heuristics from the frontend-yorozuya code-review skill, but rewrote every convention to match this project's actual stack and docs

### Notes (intentionally NOT ported)

The source skill targets a different (monorepo) project. The following were dropped or adapted because they don't apply here:

- `logger` from `@repo/libs/logger` and the console-vs-logger rule — this project has no logger
- `@alison-ui` / `@product-ui` / `@repo` import hierarchy — replaced with the `@/` alias + `src/components/ui` (shadcn) / `src/components/shared` / `src/features` structure
- `yup` → `zod`
- Cross-portal sharing / `base-ui` skills, and the `form` / `list-guideline` skills — **do not exist** in this repo. Form and list guidance lives in `docs/pattern/` (and is noted there as not-yet-localized)
- `docs/ux-bug-taxonomy.md` and the dated spacing memory the source cited — don't exist here; the gap-audit guidance was kept but generalized

---

## Categories

Naming · Structure · Patterns · TypeScript · React · State · Testing · Performance · Skills · Docs
