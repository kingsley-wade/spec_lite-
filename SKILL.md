---
name: kiro-lite-specs
description: Use when starting a new project, feature, bugfix, refactor, or milestone and the user wants Kiro-like spec-driven development with requirements.md, design.md, tasks.md, repository tree conventions, interactive approval gates, and checklist-based task execution. Also use when the user asks for "Kiro specs", "spec mode", "three spec docs", "requirements design tasks", or a lightweight cross-agent spec workflow for Claude Code, Codex, or opencode.
metadata:
  short-description: Kiro-like spec workflow with approval gates and task checklists
---

# Kiro-Lite Specs

This skill turns a project or feature request into a lightweight spec-driven workflow that works across Claude Code, Codex, and opencode. It preserves the useful parts of Kiro's spec mode without requiring a specific IDE.

## Non-Negotiable Rules

- Do not edit product code before the user approves all three spec documents and explicitly asks to start implementation.
- Produce specs in this order: `requirements.md`, then `design.md`, then `tasks.md`.
- Iterate with the user at each stage until they are satisfied. If the user revises an earlier document, update downstream documents before implementation.
- `tasks.md` is the execution contract. Implementation must proceed by task order, dependencies, and checklist status.
- Maintain task status in `tasks.md` as work progresses.
- Respect the repository tree conventions unless the existing repo has stronger local rules.
- If a repo has `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, or similar local instructions, read them before drafting specs.

## Output Location

Default location:

```text
specs/<feature-slug>/
  requirements.md
  design.md
  tasks.md
```

If the repository already has a spec location, use the existing convention. If the user names a location, use the user's location.

## Workflow

### 1. Discover Context

Before drafting:

- Inspect the repository tree.
- Read project instructions and existing docs.
- Identify language, framework, test commands, package manager, and current module boundaries.
- Ask one concise clarification question at a time only when the answer materially affects scope or architecture.

For a new empty project, propose a repository tree convention before drafting requirements.

### 2. Requirements Gate

Create or update `requirements.md` using the template in `assets/templates/requirements.md`.

Requirements must include:

- Purpose and scope.
- In-scope and out-of-scope boundaries.
- User stories or actor goals.
- Acceptance criteria, preferably in EARS-like form:
  - `WHEN <event>, THE SYSTEM SHALL <behavior>.`
  - `IF <condition>, THEN THE SYSTEM SHALL <behavior>.`
- Non-functional requirements.
- Open questions or assumptions.

After drafting, summarize the important points and ask:

```text
Please review requirements.md. Should I revise it, or is it approved for design?
```

Do not continue to design until the user approves the requirements.

### 3. Design Gate

Create or update `design.md` using the template in `assets/templates/design.md`.

Design must include:

- Architecture and boundaries.
- Repository tree impact.
- Components or modules.
- Data flow and control flow.
- APIs, interfaces, schemas, or contracts.
- Error handling.
- Testing strategy.
- Risks and tradeoffs.

After drafting, summarize the design and ask:

```text
Please review design.md. Should I revise it, or is it approved for task planning?
```

Do not continue to tasks until the user approves the design.

### 4. Tasks Gate

Create or update `tasks.md` using the template in `assets/templates/tasks.md`.

Tasks must be a full workflow checklist, not loose notes. Cover the whole delivery path:

- Repository structure and scaffolding.
- Core implementation.
- Integrations.
- Tests.
- Documentation or usage updates.
- Validation commands.
- Cleanup and handoff.

Each executable task must include:

- Checkbox status.
- Stable numeric ID.
- Module or area.
- Goal.
- Expected file impact.
- Dependencies.
- Acceptance evidence.

Use these statuses:

```text
- [ ] pending
- [~] in progress
- [x] completed
- [!] blocked
```

After drafting, ask:

```text
Please review tasks.md. Should I revise it, or is the implementation checklist approved?
```

Do not implement until the user approves `tasks.md` and explicitly asks to start.

### 5. Implementation Mode

When the user says to start implementation:

1. Read the latest `requirements.md`, `design.md`, and `tasks.md`.
2. Validate that all three exist and contain required sections.
3. Select the first pending task whose dependencies are complete.
4. Mark it `[~]` before editing files.
5. Implement only the scope of that task.
6. Run the task's acceptance checks when feasible.
7. Mark it `[x]` only with concrete evidence.
8. Mark it `[!]` if blocked and record the blocking reason.
9. Continue to the next task unless the user asked for a checkpoint.

Do not silently change task scope. If implementation discovers a spec mismatch, pause and update the relevant spec with user approval.

## Validation

Use the bundled validator when Python is available:

```bash
python scripts/validate_spec.py specs/<feature-slug>
```

The validator checks for:

- Required three files.
- Required sections.
- Checklist task status markers.
- Dependencies and acceptance evidence fields.
- Remaining unresolved approval markers.

Validation is a guardrail, not a substitute for user approval.

For npm users, `npx kiro-lite-specs validate specs/<feature-slug>` offers the same checks without Python.

## Template customization

When a project has `.kiro-lite-specs/config.json`, use the installed templates in `assets/templates/`; the installer applies project template overrides there. User defaults may be set in `~/.config/kiro-lite-specs/config.json`. Project overrides take precedence. Treat generated spec documents as project files and preserve their local changes.

## Platform Compatibility

This skill is intentionally standard Markdown plus optional Python validation.

- Claude Code: install this directory under a Claude skills directory and invoke by description or name.
- Codex: install this directory under a Codex skills directory and invoke by description or name.
- opencode: install as `.opencode/skills/kiro-lite-specs/SKILL.md`, `.claude/skills/kiro-lite-specs/SKILL.md`, or `.agents/skills/kiro-lite-specs/SKILL.md`; or copy the adapter prompt from `assets/adapters/opencode-agent.md` into an opencode custom agent.

See `references/platform-compatibility.md` for platform notes.

## References

Read these only when needed:

- `references/git-tree-conventions.md` for repository layout rules.
- `references/task-checklist-rules.md` for checklist quality rules.
- `references/platform-compatibility.md` for Claude Code, Codex, and opencode usage notes.
