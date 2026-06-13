---
name: write-report
description: >
  Generate a daily development report summarizing what was accomplished in the
  current session. Writes a markdown file to docs/reports/ with a date-based
  filename. Covers code changes, tests, and decisions made.
---

# Write Report

Generates a structured daily development report and saves it to `docs/reports/`.

## When to use

- User says "напиши отчет по всему сделанному за сегодня"
- User says "напиши отчет" or "что мы сделали сегодня"
- End of a productive session when you want to document progress

## Procedure

### 1. Gather session context

Review what was done in the current session:
- Files created, modified, deleted
- Tests written or run
- Decisions made
- Issues encountered and resolved

### 2. Generate report content

Format as markdown with these sections:

```markdown
# <Short description of work>

**Date:** YYYY-MM-DD
**Session:** <session_id or brief context>

## What was done
- Bullet list of completed tasks

## Files changed
- List of files with brief description of changes

## Tests
- Tests written, run, results

## Notes
- Any important decisions or caveats
```

### 3. Save to docs/reports/

Filename format: `YYYY-MM-DD-<kebab-case-description>.md`

Examples:
- `2026-04-12-settings-version-4-0.md`
- `2026-03-27-step-13-production-ready.md`
- `2026-06-13-vacation-widget-update.md`

### 4. Report the path

Tell the user where the report was saved.

## Important notes

- Keep reports concise — bullet points, not essays
- Focus on WHAT changed and WHY, not HOW (the code speaks for itself)
- Include test results if tests were run
- If multiple unrelated tasks were done, consider separate reports per task
