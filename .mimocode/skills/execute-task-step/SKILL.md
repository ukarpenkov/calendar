---
name: execute-task-step
description: >
  Execute the next uncompleted step from a tasks.md file. Reads the task file,
  finds the first step with status "не выполнено", implements the code changes,
  runs tests, and marks the step as completed. Supports both calendar and lichka
  project conventions.
---

# Execute Task Step

Executes the next pending step from a task-tracking markdown file and marks it done.

## When to use

- User says "выполни этот шаг", "давай к этому шагу", "выполни следующий шаг",
  "давай выполним задачу", "к этой задаче", "выполни ответственно"
- User points to a specific step number: "выполни шаг 5"
- User shares a tasks.md file and says "давай"

## Procedure

### 1. Locate the task file

Default paths (check in order):
- `docs/vacation/tasks.md` (this project)
- `docs/tasks/promted-tasks.md` (lichka project)
- Any `.md` file the user references with `@` or explicit path

If no file is specified, ask the user which task file to use.

### 2. Find the next step

Parse the markdown for the first section matching pattern:
```
## Шаг N. <title>
**Статус:** не выполнено
```

Or checkbox pattern:
```
- [ ] **N.N <title>**
```

If the user specified a step number, jump to that step instead.

### 3. Read project rules from the file header

The task file contains "Общие правила" that apply to every step. **Read and follow them.**
Key rules typically include:
- Language: TypeScript, React Native (not Kotlin/Java)
- Architecture: feature-sliced (`src/entities/`, `src/features/`, `src/pages/`, `src/shared/`)
- DB: SQLite via `@op-engineering/op-sqlite`, queries via `db.execute()`
- Tests: Jest + `better-sqlite3` in-memory (`:memory:`)
- UI: `StyleSheet.create()`, no external UI libraries

### 4. Read existing code context

Before implementing, read:
- The specific files mentioned in the step's "Что сделать" section
- Related barrel exports (`index.ts` files)
- Existing test files if extending

### 5. Implement the step

Follow the step's instructions precisely:
- Create/modify files as specified
- Follow the exact code patterns shown in the step
- Respect the "Общие правила" from the file header

### 6. Run tests

After implementation, run:
```bash
npx jest --passWithNoTests
```

If tests fail, fix them before proceeding. If snapshot tests are needed:
```bash
npx jest <test-file> -u
```

### 7. Mark step as completed

Edit the task file to update the step's status:
- Markdown status: `**Статус:** не выполнено` → `**Статус:** выполнено ✅`
- Checkbox: `- [ ] **N.N**` → `- [x] **N.N**`

### 8. Report completion

Summarize what was done:
- Files created/modified
- Tests run and results
- Any issues encountered

## Important notes

- Never modify `DayType` or existing calendar logic unless the step explicitly says to
- React hooks must be declared before any early returns (Rules of Hooks)
- When creating new components, follow the existing style in the project
- If a step references a file path, verify it exists before editing
- The step's "Что сделать" section is the authoritative implementation guide
