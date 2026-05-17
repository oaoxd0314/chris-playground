---
name: mobile-view
description: Guide for choosing between CSS responsive classes vs. JS breakpoint hooks when implementing mobile/desktop UI branches in this Next.js codebase. This skill should be used when writing `if (isMobile) return <Mobile/>` patterns, adding `useBreakPointDown` / `useMediaQuery` calls, introducing a mobile-specific layout to an existing page, or whenever a component needs to render different markup on mobile vs. desktop. Trigger phrases include "mobile view", "responsive layout", "mobile vs desktop", "use breakpoint", "useMediaQuery", "useBreakPointDown", "mobile branch", "render different on mobile".
---

# Mobile / Desktop Branching Guideline

This skill teaches how to render mobile vs. desktop UI without introducing SSR hydration flicker. Apply it whenever a component needs different markup on mobile and desktop, especially in pages under `apps/user-portal` and `apps/supervisor-portal` (Next.js App Router).

## Background: why naive JS branching causes a desktop flash on mobile

`'use client'` **does not disable SSR**. It marks a module as a Client Component, but the first HTML for that component is still rendered on the server. `window` does not exist there.

The existing `useMediaQuery` (and therefore `useBreakPointDown`) returns `false` during SSR because `typeof window === 'undefined'`. So on the server, **every** mobile/desktop branch resolves to the desktop side. The resulting flow on a phone:

1. Server renders desktop branch → HTML sent to browser.
2. Browser hydrates with the same desktop tree.
3. `useEffect` runs, `matchMedia` reports mobile, React re-renders the mobile tree.
4. User sees a desktop sidebar / wide layout flash for one frame, then mobile.

Concretely the trap looks like this:

```tsx
const isMobile = useBreakPointDown('md')
return isMobile ? <Mobile /> : <Desktop />
```

On SSR: `isMobile === false` → ships Desktop HTML → mobile phones flicker on hydration.

**Avoid this pattern for any branch that is large enough to be visible on first paint.**

## Decision Tree

```
Need different markup on mobile vs. desktop?
│
├─ Both branches are lightweight (a few divs, a skeleton, a small button row)
│  → Use **CSS dual-render**. Render both, hide one with Tailwind responsive
│    classes. No JS, no flicker.
│
└─ Branches are heavy / structurally different
   (full Mobile vs. Desktop trees, each with their own hooks, queries, state)
   → Use the **playground `useIsMobile` hook** (or an equivalent scoped helper).
     Accept that hard-refreshing on the inner page will briefly show desktop
     before swapping to mobile; do not try to fix this at the SSR layer with
     UA sniffing or by mutating global hooks.
```

The shorthand: lightweight things use CSS; heavy things use a scoped JS hook and accept a known edge-case flicker.

## Pattern A — CSS dual-render (default for lightweight cases)

Render both layouts. Hide one with Tailwind responsive utilities. The server emits both fragments in the HTML; the browser's CSS decides which is visible at the moment HTML is parsed. There is no JS round-trip and no flicker.

### Skeleton / index page

```tsx
return (
  <>
    {/* mobile */}
    <div className="h-full p-4 md:hidden">
      <Skeleton className="h-full w-full" />
    </div>
    {/* desktop */}
    <div className="hidden h-full flex-col md:flex">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="shrink-0 border-r p-6">
          <Skeleton className="h-full w-[382px]" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  </>
)
```

### Header with desktop-only content

```tsx
return (
  <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
    <PlaygroundModelSelect />
    <div className="hidden items-center gap-2 md:flex">
      <DesktopOnlyLinks />
    </div>
  </div>
)
```

Notes:

- Prefer `hidden md:flex` (or `md:block`, etc.) over `md:hidden` + a duplicate desktop tree placed elsewhere. Keep both branches adjacent so future maintainers can see them together.
- Do **not** import `useBreakPointDown` in these files. The whole point is removing the JS dependency.
- The Tailwind breakpoint string (`md:`, `lg:`, etc.) must match what the rest of the page uses. Today the playground uses `md`.

## Pattern B — Scoped `useIsMobile` hook (for heavy switching)

When mobile and desktop variants are entire subtrees with their own data fetching, mounting both via CSS doubles the runtime cost. In that case, render one tree at a time with a scoped hook.

The playground has exactly this hook:

```ts
// apps/user-portal/src/app/user-console/ie/playground/_content/hooks/use-is-mobile.ts
'use client'

import { useBreakPointDown } from '@alison-ui/react/hooks/use-break-points'

export function useIsMobile(): boolean {
  return useBreakPointDown('md') ?? false
}
```

Consumer code stays clean — pure `boolean`, no three-state plumbing:

```tsx
const isMobile = useIsMobile()
if (isMobile) return <Mobile />
return <Desktop />
```

Rules for this pattern:

- Centralize the breakpoint choice in one hook per feature area. Do not call `useBreakPointDown('md')` directly across many sibling components — future tweaks (e.g. switching to `lg`) should be a one-file change.
- **Never** modify the global `useMediaQuery` / `useBreakPointDown` to "solve" SSR by changing their return type. They are consumed by `alison-ui` primitives (sidebar, select, multi-select) whose context types expect `boolean`. Changing the global signature creates ripple coercion everywhere.
- Accept the residual flicker that only happens on hard-refresh of an inner route: SSR renders desktop, client hydrates, then swaps to mobile. Index pages and navigations between inner routes are not affected because either CSS dual-render handles them or the route was reached via client-side navigation (the hook already has the right answer before paint).

## What NOT to do

- ❌ Change `packages/alison-ui/src/hooks/use-media-query/index.ts` to return `boolean | undefined`. This forces every existing consumer to add `?? false` or a third branch.
- ❌ Add `?? false` boundary coercions in `alison-ui` components or in `apps/user-portal/src/components/banner-slider`. Keep playground SSR concerns inside playground.
- ❌ Use UA sniffing / cookie hints to give SSR a "real" `isMobile` answer. The complexity is not worth it for the rare hard-refresh-on-inner-page case.
- ❌ Wrap routes in `dynamic(() => import(...), { ssr: false })` just to dodge the issue. That trades flicker for a blank-then-paint and adds a chunk request. Only consider this if a stakeholder explicitly asks to eliminate the inner-page flicker.
- ❌ Use `if (typeof window === 'undefined') return null` patterns to gate the first render. They produce empty server HTML and defeat the point of SSR.
- ❌ Sprinkle `useBreakPointDown('md')` calls in many siblings within the same feature area. Wrap once in a scoped hook.

## Concrete reference: playground implementation

The playground in this repo (`apps/user-portal/src/app/user-console/ie/playground/`) is the canonical example of both patterns coexisting:

- **Pattern A (CSS dual-render):**
  - `multi-modal/page.tsx`, `llm/page.tsx`, `workflow/page.tsx` (index skeleton pages)
  - `_content/media-playground-header.tsx`, `workflow/_content/workflow-playground-header.tsx` (desktop-only header links)
- **Pattern B (scoped `useIsMobile` hook):**
  - `_content/hooks/use-is-mobile.ts` (the hook itself — single source of truth)
  - `llm/_content/model-playground/index.tsx`
  - `llm/_content/model-playground/prompt/prompt-input-section/index.tsx`
  - `_content/media-playground/model-playground/index.tsx`
  - `_content/media-playground/model-playground/request-panel/index.tsx`
  - `workflow/_content/workflow-console-playground-page.tsx`

Mirror these patterns when adding new responsive UI elsewhere. If introducing the same split in a new feature area, create a feature-scoped `useIsMobile` next to the consumers (e.g. `apps/user-portal/src/app/.../<feature>/_content/hooks/use-is-mobile.ts`) — do not import the playground's hook across feature boundaries.

## Quick self-check before committing responsive UI

1. Are both branches **lightweight markup** that could just live in HTML? → Pattern A.
2. Do mobile and desktop trees each have their own queries, effects, or state? → Pattern B with a scoped hook.
3. Did the change touch `packages/alison-ui` or other shared packages to make this work? → Stop, redesign. The fix should be inside the feature area.
4. Is there a `useBreakPointDown('md')` call in a file that does not own the feature's responsive decision? → Wrap it in (or move to) the feature's `useIsMobile` hook.
