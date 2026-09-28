# Git Tree Conventions

Use these conventions when a repository does not already define stronger local rules.

## Default Spec Layout

```text
specs/
  <feature-slug>/
    requirements.md
    design.md
    tasks.md
```

Use kebab-case for `<feature-slug>`.

## Project Layout Principles

- Keep feature code near existing domain boundaries.
- Do not create a new top-level directory when an existing module owns the behavior.
- Keep tests next to the repo's established test location.
- Keep generated artifacts out of source directories unless the project already does so.
- Keep specs in `specs/`, not hidden tool directories, so every agent and human can read them.

## Required Design Mapping

`design.md` must identify:

- New files.
- Modified files.
- Deleted files, if any.
- Test files.
- Documentation files.
- Generated or derived artifacts.

## Recommended Generic Layout

For a new app or library with no existing structure:

```text
<repo-root>/
  specs/
  src/
  tests/
  docs/
  scripts/
```

Adapt this to the language ecosystem:

- Python: `src/<package>/`, `tests/`, `pyproject.toml`.
- Node or TypeScript: `src/`, `tests/` or `__tests__/`, `package.json`.
- Go: package directories, `*_test.go`, `go.mod`.
- Rust: `src/`, `tests/`, `Cargo.toml`.

## Drift Rule

If implementation changes the intended tree, update `design.md` and the affected task before continuing.

