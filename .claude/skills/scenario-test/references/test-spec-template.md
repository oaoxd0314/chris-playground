# Test Spec Template

Use this format when authoring the test spec in Step 2 of the workflow. Present the filled-in spec to the user for confirmation before running anything.

## Header

```
**Test Spec — <Feature Name>**

Source:
  - Plan: <path under ~/.claude/plans/, or "user-provided">
  - Figma: <frame URL, or "n/a">
  - Base URL: <e.g., http://localhost:5173>

Global Preconditions:
  - <auth cookies / localStorage / feature flag values that apply to all scenarios>
  - <dev server running? mocks active?>
```

## Per-Scenario Block

```
Scenario <n>: <user goal in present tense, e.g., "User opens the LLM playground and sees the model selector">

  Pre:
    - <state required before this scenario, e.g., "feature.model-detail flag = true">
    - <fixtures or mocks that must be active>

  Steps:
    1. Navigate to <path>
    2. <user action, e.g., 'Click button "Generate"'>
    3. <user action, e.g., 'Type "Hello" into prompt textarea'>
    4. ...

  Assertions:
    - URL contains <pattern>
    - <element by role/name/text> is visible
    - <element by role/name/text> contains text "<expected>"
    - <network request to <path>> made with status 200 (only when payload matters)

  Tear down:
    - <only if scenario leaves state that affects others; usually "none">
```

## Filled Example

```
**Test Spec — Playground (LLM tab)**

Source:
  - Plan: ~/.claude/plans/snappy-fluttering-wombat.md
  - Figma: n/a
  - Base URL: http://localhost:5173

Global Preconditions:
  - Auth cookie: dev-token=<value>
  - Feature flag: feature.model-detail = true
  - Mocked: GET /get_public_artifacts returns mockPublicArtifactsResponse
  - Mocked: POST /client-api/chat returns SSE stream "Hello! How can I help you?"

Scenario 1: User lands on LLM playground and sees core controls

  Pre:
    - Global preconditions only

  Steps:
    1. Navigate to /user-console/playground/llm/3e23bf2a-2353-4ad5-9e9a-ad04014e329f

  Assertions:
    - Tabs "LLM" and "Multimodal" are visible (role=tab)
    - Model selector button is visible and shows "MiMo V2.5 Pro"
    - Prompt textarea is visible
    - Button "Generate" is visible and is the primary CTA
    - Button "Clear History" is visible

Scenario 2: User sends a prompt and sees the streamed response

  Pre:
    - Global preconditions
    - On /user-console/playground/llm/3e23bf2a-2353-4ad5-9e9a-ad04014e329f

  Steps:
    1. Type "Hi there" into prompt textarea
    2. Click button "Generate"

  Assertions:
    - Response area contains text "Hello! How can I help you?"
    - Button "Generate" returns to enabled state after stream ends

Scenario 3: User navigates from model-hub to playground with consistent model identity

  Pre:
    - Global preconditions

  Steps:
    1. Navigate to /user-console/ie/model-hub
    2. Click link with text "MiMo V2.5 Pro"
    3. Wait for model detail page (URL contains /user-console/ie/model-hub/LLM/<artifactId>)
    4. Click button or link "Try it now"

  Assertions:
    - URL is /user-console/playground/llm/3e23bf2a-2353-4ad5-9e9a-ad04014e329f
    - Model selector shows "MiMo V2.5 Pro" (cross-page consistency check)
```

## Notes for Authors

- **Steps are user actions, not API calls.** "Click button X" not "send POST to /chat".
- **Assertions reference what is visible.** Prefer `text="..."` over CSS classes.
- **Cross-page flow scenarios are the most valuable** — they catch routing and identity bugs unit tests miss. Always include at least one when the plan describes navigation between features.
- **One scenario should be runnable from a cold browser state.** If it depends on Scenario N-1, mark it explicitly in `Pre` — but prefer rewriting it to be independent.
