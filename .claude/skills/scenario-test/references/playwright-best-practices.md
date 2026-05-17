# Playwright Best Practices (Condensed)

Source: https://playwright.dev/docs/best-practices

These rules apply to the **scenario design** and **assertions** in this skill, even though no Playwright code is generated. They define what makes a scenario stable and meaningful when driven through puppeteer/chrome-devtools MCPs.

## Locators — Prefer User-Facing Attributes

Order of preference for selecting elements:

1. **Role + name** — `getByRole('button', { name: 'Generate' })`. Maps to ARIA role and accessible name. Most resilient to refactors.
2. **Visible text** — `getByText('Welcome back')`. Use for unique copy on the page.
3. **Label** — `getByLabel('Email')`. For form inputs associated with `<label>`.
4. **Placeholder** — `getByPlaceholder('Enter your email')`. For inputs without a label.
5. **Alt text** — `getByAltText('Company logo')`. For meaningful images.
6. **Title** — `getByTitle('Close')`. Last resort before test ids.
7. **Test id** — `getByTestId('submit-btn')`. Use only when the others are impossible.

Avoid:

- CSS class chains (`.btn.btn-primary.active`) — break on style refactors.
- XPath traversals — brittle and unreadable.
- `nth-child` indexing — brittle to DOM reorder.

When using puppeteer MCP (which takes CSS selectors), translate the role/text intent into a stable selector:

- Buttons → `'button:has-text("Generate")'` or `'[role="button"]:has-text("Generate")'`
- Links → `'a:has-text("Try it now")'`
- Inputs → `'input[aria-label="Email"]'` or `'input[name="email"]'`
- Use `mcp__chrome-devtools__take_snapshot` to inspect the accessibility tree when the right selector is unclear.

## Assertions — Test What the User Sees

Assert on observable, user-facing state:

- Visible text appearing or disappearing
- URL / pathname changes
- Element role and accessible name
- Form value reflected in the input
- Network call made with expected payload (when verifying a submit triggers an API)

Do **not** assert on:

- Internal component state, props, or hooks
- Redux / Zustand store contents
- CSS class names (unless they encode user-visible state like `aria-pressed`)
- Implementation details that can change without affecting the user

## Web-First Assertions — Auto-Wait

Playwright's `expect(locator).toBeVisible()` auto-retries until the condition holds or times out. When driving through puppeteer MCP, achieve equivalent reliability by:

- Using `mcp__chrome-devtools__wait_for` to wait for selector / text before asserting.
- Polling via `puppeteer_evaluate` returning the readable state, retrying on timeout.
- Never use raw `setTimeout`-style sleeps to "let the page settle" — they hide flakiness.

## Test Isolation

Each scenario must:

- Start from a known route via `puppeteer_navigate`.
- Set its own preconditions (cookies, localStorage, feature flags) before navigation.
- Not depend on side effects from a previous scenario.

If state must persist across scenarios (e.g., expensive login), document it explicitly in the spec and reset between unrelated scenarios.

## Avoid Testing Third Parties

Do not exercise third-party UIs (OAuth providers, Stripe checkout, Google Maps). Mock the boundary by intercepting network requests — typically done at the dev server / mock layer per the session plan, not by the skill itself. If the plan documents fixtures, set them via `puppeteer_evaluate` (cookies/localStorage) or rely on the dev server already serving mocks.

## Scenario Granularity

- **Happy path first.** One scenario per primary user goal (load, submit, navigate-to-detail, etc.).
- **Critical error paths next.** Only the failure modes the plan calls out as user-visible (network error message, validation error). Skip exhaustive permutations — those belong in unit tests.
- **One assertion theme per scenario.** A scenario that asserts both "form submits" and "list re-renders with new item" is fine. A scenario that bundles five unrelated checks is not.

## Common Anti-Patterns

| Anti-pattern                                 | Why it fails                        | Replacement                              |
| -------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `puppeteer_evaluate(() => store.getState())` | Couples test to internal state      | Assert on rendered text/URL              |
| Selector via `.css-1abc2d`                   | Generated class, changes on rebuild | Role/name selector                       |
| Sleep 2s, then click                         | Hides race conditions               | `wait_for` selector/text                 |
| Assert on `<div class="active">`             | Style detail                        | Assert on visible text or `aria-current` |
| One scenario per assertion                   | Slow, noisy report                  | Group related assertions per user goal   |
