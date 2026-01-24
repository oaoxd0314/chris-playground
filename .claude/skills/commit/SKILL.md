---
name: commit
description: Automatically analyze changes and create organized conventional commits. Use this skill when asked to commit code changes, create commits, or when running /commit.
---

# Auto Commit with Convention

Automatically analyze git changes and create organized, conventional commits.

## Commit Message Format

```
type(scope): description
```

or without scope:

```
type: description
```

### Valid Types

| Type       | Description        | Example                         |
| ---------- | ------------------ | ------------------------------- |
| `feat`     | New feature        | New component, new API endpoint |
| `fix`      | Bug fix            | Resolve hover state issue       |
| `docs`     | Documentation      | Update README, add comments     |
| `style`    | Formatting         | Prettier, fix indentation       |
| `refactor` | Code restructuring | Extract utility, simplify logic |
| `perf`     | Performance        | Optimize render, lazy load      |
| `test`     | Tests              | Add unit tests, E2E tests       |
| `chore`    | Maintenance        | Update dependencies, config     |
| `revert`   | Revert commit      | Revert previous changes         |

**Types must be lowercase.**

### Scope

- Use scope when changes are specific to a module/feature
- Omit scope for project-wide changes
- Derive scope from folder structure (e.g., `src/hooks/` → `hooks`)

## Workflow

### 1. Analyze Changes

```bash
git status --short
git diff --staged
git diff
```

**Decision:**

- Both staged and unstaged → Ask user which to commit
- Only staged → Proceed with staged
- Only unstaged → Ask if should stage all
- No changes → Inform and exit

### 2. Group Changes

Group by logical scope based on file paths:

```
src/components/**    → scope: components
src/hooks/**         → scope: hooks
src/server/**        → scope: server
src/db/**            → scope: db
src/lib/**           → scope: lib
Root/multiple        → no scope
```

**Special cases:**

- Multiple scopes → Split into separate commits
- Root config files → No scope, use `chore:`

### 3. Determine Type

| Changes                 | Type       |
| ----------------------- | ---------- |
| New files, new features | `feat`     |
| Bug fixes               | `fix`      |
| \*.md, docs/            | `docs`     |
| Formatting only         | `style`    |
| Code restructuring      | `refactor` |
| Performance             | `perf`     |
| _.test._ files          | `test`     |
| package.json, configs   | `chore`    |

### 4. Generate Messages

**Rules:**

- Imperative mood: "add" not "added"
- Lowercase descriptions
- Concise but specific
- Max ~72 characters

**Examples:**

```
feat(components): add user profile card
fix(hooks): resolve infinite loop in useQuery
docs: update README with setup instructions
chore: upgrade dependencies
refactor(server): extract validation logic
test(db): add unit tests for user queries
```

### 5. Present Plan

```
📋 Planned commits:

1. feat(components): add user profile card
   Files:
   - src/components/user-profile.tsx

2. fix(hooks): resolve infinite loop
   Files:
   - src/hooks/use-user.ts

───────────────────────────────────────
Total: 2 commits

Proceed? (yes/no)
```

**Always get user confirmation before creating commits.**

### 6. Create Commits

```bash
git add <files>
git commit -m "$(cat <<'EOF'
type(scope): description
EOF
)"
git log -1 --oneline
```

### 7. Edge Cases

| Scenario               | Action          |
| ---------------------- | --------------- |
| No changes             | Inform user     |
| Mixed types same scope | Split commits   |
| Description too long   | Use commit body |
| User wants to edit     | Allow override  |

## Best Practices

### ✅ DO:

- Group logically related changes
- Atomic commits (complete, working change)
- Single responsibility per commit
- Clear descriptions

### ❌ DON'T:

- Mix feat + fix in one commit
- Vague descriptions ("fix bug")
- Past tense ("added" → "add")
- Trailing periods
- Add `Co-Authored-By` lines

## Reference

See [docs/commit-message.md](docs/commit-message.md) for detailed commit convention rules.
