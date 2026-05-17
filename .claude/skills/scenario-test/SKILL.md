---
name: scenario-test
description: This skill should be used when the user asks to "run scenario test", "scenario test the feature", "validate UI flow", "test the page", "manually e2e", "smoke test the feature", or any request to interactively exercise a web UI through puppeteer + chrome-devtools MCPs without generating Playwright `.spec.ts` files. Reads test scenarios from session plans in `~/.claude/plans/` or from user-supplied specs, and optionally enriches scenarios with figma MCP for design-driven cases. The agent itself is the test runner; output is a confirmed test spec, an execution log, and a pass/fail report — not committed test code.
---

# Scenario-Based UI Validation

Drive a real browser through puppeteer + chrome-devtools MCPs to exercise a feature end-to-end, using a structured test spec derived from a session plan or explicit user input. Do **not** create Playwright spec files, install testing deps, or modify the project codebase.

## When to Apply

Trigger this skill when any of the following hold:

- User asks to e2e test, validate, or smoke-test a feature in the browser.
- A plan under `~/.claude/plans/` defines routes, expected UI, fixtures, or feature flags that warrant an interactive run.
- Design fidelity matters and a Figma URL is referenced — figma MCP can supply expected text/layout.

## Workflow

### Step 1 — Source the Test Inputs

Collect inputs in this order, stop when enough is available:

1. **Explicit user message** — scenarios, acceptance criteria, or a URL the user just typed.
2. **Session plan** — search `~/.claude/plans/` for a plan that matches the current task (newest plan referencing the feature usually wins). Extract from the plan:
   - Routes / paths under test
   - Expected UI elements and copy
   - Mock fixtures, feature flags, cookies, auth state
   - Cross-page flows
3. **Figma MCP** — optional. Use when the plan or user references a Figma frame, or when verifying design fidelity (visible text, layout order, copy). Pull only the relevant frame, not whole files.

If none of the above yields a workable scope, ask the user for: target URL, expected user steps, expected observable outcomes. Do not start clicking blindly.

### Step 2 — Build the Test Spec

Author scenarios following `references/test-spec-template.md`. Apply the locator and assertion rules in `references/playwright-best-practices.md`:

- Use **user-facing locators**: role + accessible name, visible text, label, placeholder. Avoid CSS class chains and test ids unless the plan dictates them.
- Assert **observable outcomes**: visible text, URL, role state. Do not assert on internal component state, Redux store, or implementation details.
- Keep scenarios **independent**: each scenario navigates from a clean state and sets its own preconditions.
- Cover the **happy path first**, then critical error paths the plan calls out. Skip exhaustive edge cases — that is unit-test territory.

### Step 3 — Confirm With User

Present scenarios as a numbered list **before** running anything. Use this shape:

```
**Test Spec — <Feature Name>**

Scenario 1: <user goal in present tense>
- Pre: <auth / flag / mock / fixture>
- Steps: <user-facing actions>
- Assert: <observable outcomes>

Scenario 2: ...
```

Wait for confirmation or revisions. If the user says "go", proceed. Otherwise iterate.

### Step 4 — Execute via Puppeteer MCP

Drive the browser primarily with `mcp__puppeteer__*` tools:

| Action                         | Tool                                   |
| ------------------------------ | -------------------------------------- |
| Navigate                       | `mcp__puppeteer__puppeteer_navigate`   |
| Click                          | `mcp__puppeteer__puppeteer_click`      |
| Type into a field              | `mcp__puppeteer__puppeteer_fill`       |
| Select option                  | `mcp__puppeteer__puppeteer_select`     |
| Hover                          | `mcp__puppeteer__puppeteer_hover`      |
| Read DOM / set cookies / flags | `mcp__puppeteer__puppeteer_evaluate`   |
| Capture visual state           | `mcp__puppeteer__puppeteer_screenshot` |

When puppeteer alone cannot answer "why did this fail", switch to `mcp__chrome-devtools__*` for diagnostics:

| Need                                       | Tool                                                 |
| ------------------------------------------ | ---------------------------------------------------- |
| JS errors / warnings                       | `list_console_messages`, `get_console_message`       |
| Verify backend calls / payloads / status   | `list_network_requests`, `get_network_request`       |
| Stable locator discovery                   | `take_snapshot` (accessibility tree)                 |
| Performance trace                          | `performance_start_trace` / `performance_stop_trace` |
| DOM evaluation in DevTools-controlled page | `evaluate_script`                                    |

Rules during execution:

- Run scenarios sequentially, one per fresh navigation.
- Set feature flags / auth cookies via `puppeteer_evaluate` before navigating to gated routes when the plan documents them.
- Capture a screenshot at the assertion point of each scenario for the report.
- On the first failure within a scenario, gather diagnostics (console + network) before moving on.

### Step 5 — Report

Output one block per scenario in this format:

```
✓ Scenario 1: <title>
  Steps:    <numbered list>
  Assertions: PASS
  Screenshot: <reference>

✗ Scenario 2: <title>
  Failed at:  <step number / action>
  Expected:   <what assertion expected>
  Observed:   <what actually happened>
  Console:    <relevant errors, if any>
  Network:    <relevant failed requests, if any>
  Screenshot: <reference>
```

Close the report with:

- **Pass count**: `N / total scenarios passed`.
- **UI flow summary**: 3–6 sentences describing what an end user would experience walking through the feature.
- **Suggested next steps**: only if failures were found (file a bug, fix specific code path, re-run after change).

## What This Skill Does Not Do

- Does not create or modify `.spec.ts`, `playwright.config.ts`, or any test file in the repo.
- Does not install dependencies or alter `package.json`.
- Does not commit, push, or open MRs.
- Does not run the project's existing automated test suite — for that, use the project's test runner directly.

## Reference Files

- `references/playwright-best-practices.md` — condensed locator + assertion rules from playwright.dev/docs/best-practices.
- `references/test-spec-template.md` — canonical scenario template to fill in during Step 2.
