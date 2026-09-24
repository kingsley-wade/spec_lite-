# Task Checklist Rules

`tasks.md` is the execution contract. It must be specific enough that an agent can execute one task without re-planning the whole project.

## Required Task Shape

Each task must use this form:

```markdown
- [ ] 2.1 Implement parser boundary
  - Module: `parser`
  - Goal: Parse approved input format into the internal model.
  - Files: `src/parser.ts, tests/parser.test.ts`
  - Depends on: `1.1`
  - Acceptance evidence: `npm test -- parser.test.ts passes`
```

## Checklist Quality Bar

Good tasks are:

- Atomic enough to complete in one focused edit pass.
- Ordered by dependency.
- Mapped to modules and files.
- Verifiable by command, test, inspection, or artifact.
- Written as implementation actions, not vague intentions.

Poor tasks:

- "Build the feature."
- "Add tests."
- "Fix bugs."
- "Clean up."
- "Make it work."

## Required Phases

Every task list should cover these phases unless explicitly not applicable:

1. Repository structure or no-op confirmation.
2. Core implementation.
3. Integration.
4. Tests.
5. Documentation or usage notes.
6. Final verification and cleanup.

## Execution Discipline

- Exactly one task should be `[~]` at a time.
- Do not mark `[x]` without evidence.
- If blocked, mark `[!]` and record the exact blocker under acceptance evidence.
- If a task becomes too large, split it and ask the user to approve the updated `tasks.md`.
