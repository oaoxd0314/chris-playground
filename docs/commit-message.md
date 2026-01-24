# Commit Message Convention

## Commit Message Format

```
type(scope): description
```

or

```
type: description
```

**Required Components:**

- `type`: Commit type (lowercase, see allowed types below)
- `scope`: (Optional) Module/feature name derived from folder structure
- `description`: Clear, concise description in imperative mood

### Allowed Types

Only the following types are permitted:

| Type         | Description                                                                     |
| ------------ | ------------------------------------------------------------------------------- |
| **feat**     | 新增/修改功能 (feature)                                                         |
| **fix**      | 修補 bug (bug fix)                                                              |
| **docs**     | 文件 (documentation)                                                            |
| **style**    | 格式 (不影響程式碼運行的變動 white-space, formatting, missing semi colons, etc) |
| **refactor** | 重構 (既不是新增功能，也不是修補 bug 的程式碼變動)                              |
| **perf**     | 改善效能 (A code change that improves performance)                              |
| **test**     | 增加測試 (when adding missing tests)                                            |
| **chore**    | 建構程序或輔助工具的變動 (maintain)                                             |
| **revert**   | 撤銷回覆先前的 commit 例如：revert: type(scope): subject (回覆版本：xxxx)       |

**Important:** Types must be lowercase.

### Scope

Derive scope from folder structure:

- `src/components/**` → `components`
- `src/hooks/**` → `hooks`
- `src/server/**` → `server`
- `src/db/**` → `db`
- `src/lib/**` → `lib`
- Root files or multiple areas → omit scope

### Examples

**Feature:**

```
feat(components): add user profile card
feat(hooks): add useLocalStorage hook
feat(server): add user authentication endpoint
```

**Bug Fix:**

```
fix(components): resolve button hover state issue
fix(hooks): fix infinite loop in useQuery
fix(db): correct migration script
```

**Refactoring:**

```
refactor(server): extract validation logic
refactor(components): simplify form handling
```

**Chore:**

```
chore: update dependencies
chore(db): add seed data script
```

**Testing:**

```
test(hooks): add unit tests for useUser
test(server): add API endpoint tests
```

**Documentation:**

```
docs: update README with setup instructions
docs(components): add JSDoc comments
```

**Performance:**

```
perf(components): optimize list rendering with virtualization
perf(server): add response caching
```

**Style:**

```
style: format code with prettier
style(components): fix indentation
```

## Best Practices

### DO:

- ✅ Use lowercase for type (feat, fix, docs, etc.)
- ✅ Include scope when the change is specific to a module
- ✅ Omit scope for project-wide changes
- ✅ Write clear, concise descriptions
- ✅ Use imperative mood ("add feature" not "added feature")
- ✅ Keep the first line under 100 characters

### DON'T:

- ❌ Use uppercase types (Feat, Fix, etc.)
- ❌ Use multiple types in one commit
- ❌ Write vague descriptions like "fix bug" or "update code"
- ❌ Use past tense ("added" instead of "add")
- ❌ Include trailing periods in the subject line

## Special Cases

### Multiple Related Changes

If your commit addresses multiple concerns, consider splitting into separate commits:

```bash
# Instead of:
git commit -m "feat(components): add feature and fix bug"

# Do:
git commit -m "feat(components): add new feature"
git commit -m "fix(components): fix related bug"
```

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the commit body:

```
refactor(server): update API response structure

BREAKING CHANGE: The user API now returns `userId` instead of `user_id`.
Update all components consuming user data.
```

### Project-Wide Changes

For changes affecting the entire project, omit the scope:

```
chore: update dependencies
docs: update README
```
