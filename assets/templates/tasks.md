# Tasks

## Spec Metadata

- Feature: `<feature-slug>`
- Status: `draft | approved | in-progress | complete`
- Last updated: `<YYYY-MM-DD>`
- Requirements source: `requirements.md`
- Design source: `design.md`

## Status Legend

- `[ ]` pending
- `[~]` in progress
- `[x]` completed
- `[!]` blocked

## Execution Rules

- Work only on one `[~]` task at a time.
- Do not start a task until its dependencies are complete.
- Mark a task `[x]` only after recording acceptance evidence.
- If a task changes scope, pause and update the spec before continuing.

## Task Checklist

### 1. Repository Structure

- [ ] 1.1 Establish feature file layout
  - Module: `repository`
  - Goal: Create or confirm the file and folder layout required by the design.
  - Files: `<paths>`
  - Depends on: `requirements approved, design approved`
  - Acceptance evidence: `<tree output, file list, or no-op confirmation>`

### 2. Core Implementation

- [ ] 2.1 Implement core behavior
  - Module: `<module>`
  - Goal: `<implementation goal>`
  - Files: `<paths>`
  - Depends on: `1.1`
  - Acceptance evidence: `<test, command, or inspection result>`

### 3. Integration

- [ ] 3.1 Wire into existing entry points
  - Module: `<module>`
  - Goal: `<integration goal>`
  - Files: `<paths>`
  - Depends on: `2.1`
  - Acceptance evidence: `<smoke test or integration check>`

### 4. Testing

- [ ] 4.1 Add or update tests
  - Module: `tests`
  - Goal: Cover the approved acceptance criteria.
  - Files: `<test paths>`
  - Depends on: `2.1, 3.1`
  - Acceptance evidence: `<test command and result>`

### 5. Documentation

- [ ] 5.1 Update usage or implementation notes
  - Module: `docs`
  - Goal: Document user-visible behavior or developer workflow.
  - Files: `<doc paths>`
  - Depends on: `3.1`
  - Acceptance evidence: `<doc path and summary>`

### 6. Final Verification

- [ ] 6.1 Run final validation
  - Module: `verification`
  - Goal: Prove the work satisfies the approved specs.
  - Files: `requirements.md, design.md, tasks.md`
  - Depends on: `4.1, 5.1`
  - Acceptance evidence: `<commands and results>`

## Approval

- Task checklist approved by user: `no`
