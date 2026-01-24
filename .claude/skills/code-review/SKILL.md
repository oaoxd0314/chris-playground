---
name: code-review
description: Reviews recently written code for maintainability, code smells, and adherence to project conventions. Use after implementing features, fixing bugs, refactoring, or adding components.
---

# Code Review

Proactive code review focusing on project conventions and maintainability.

## Review Workflow

### Step 1: Identify Changed Code

Focus review on:

- New files created
- Functions/components added or modified
- Logic changes

### Step 2: Check Project Conventions

Verify against CLAUDE.md project conventions:

**Must-check items**:

- Named exports (no default exports)
- No comments unless absolutely necessary
- Self-documenting code with clear naming
- Correct state management tool for state type
- TanStack Query for server state
- Drizzle ORM patterns for database
- Zod schema validation

### Step 3: Identify Code Smells

**High priority** (must fix):

- `any` type usage
- Wrong state management tool
- Default exports
- Unnecessary comments
- Missing error handling

**Medium priority** (should fix):

- Deep nesting (3+ levels)
- Long parameter lists (5+)
- Unnecessary state
- Derived state stored instead of computed

**Low priority** (consider):

- Variable naming improvements
- Minor refactoring opportunities

See [references/code-smells.md](references/code-smells.md) for detailed catalog.

### Step 4: Provide Actionable Feedback

For each issue:

1. **Location**: File:line or function name
2. **Issue**: Clear description
3. **Why it matters**: Impact on maintainability/performance/correctness
4. **Suggestion**: Specific fix with code example
5. **Priority**: High / Medium / Low

## Output Format

```
## Code Review Summary

**Files Reviewed:** [list]
**Overall Assessment:** [Good / Needs Improvement / Significant Issues]

---

### High Priority Issues
[Issues that must be fixed before committing]

#### Issue 1: [Title]
- **Location:** file.ts:42
- **Problem:** [Clear description]
- **Impact:** [Why this matters]
- **Fix:** [Specific recommendation with code]

### Medium Priority Issues
[Should fix but not blocking]

### Low Priority Suggestions
[Nice-to-have improvements]

### Positive Observations
[Things done well - reinforce good patterns]

---

## Recommended Actions
1. [Specific action]
2. [Specific action]
```

## Quick Reference

**Common violations**:

- Default export → Use named export
- `any` type → Add proper type
- "what" comment → Remove or explain "why" only
- useState for server data → Use TanStack Query

**Language**: Provide review in **Traditional Chinese (繁體中文)**, but keep:

- Code snippets in English
- Technical terms in English
- File paths in English

## Self-Check

Before finalizing review:

- [ ] Focused on recently changed code only
- [ ] Checked against project conventions (CLAUDE.md)
- [ ] All suggestions are actionable with examples
- [ ] Prioritized issues correctly
- [ ] Included positive feedback
- [ ] Feedback is constructive and professional
