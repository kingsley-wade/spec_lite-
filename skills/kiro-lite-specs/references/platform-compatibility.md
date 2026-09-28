# Platform Compatibility

This skill is designed around the common Agent Skills layout:

```text
kiro-lite-specs/
  SKILL.md
  agents/openai.yaml
  assets/
  references/
  scripts/
```

In this repository, the skill directory is stored under skills/kiro-lite-specs/. The npm CLI copies its contents into the selected platform directories without including the CLI implementation itself.

## Claude Code

Install by placing the `kiro-lite-specs` directory in a Claude skills search path, such as a user skills directory. Invoke it by asking for Kiro-like specs, spec mode, or requirements/design/tasks planning.
The npm installer uses `.claude/skills/kiro-lite-specs` for project scope and `~/.claude/skills/kiro-lite-specs` for user scope.

## Codex

Install by placing the `kiro-lite-specs` directory in a Codex skills search path, such as a user skills directory. The `agents/openai.yaml` file provides UI-facing metadata for Codex-compatible skill lists.
The npm installer uses `.agents/skills/kiro-lite-specs` for project scope and `~/.agents/skills/kiro-lite-specs` for user scope.

## opencode

opencode supports Agent Skills-compatible directories. Use one of these project-local paths:

```text
.opencode/skills/kiro-lite-specs/SKILL.md
.claude/skills/kiro-lite-specs/SKILL.md
.agents/skills/kiro-lite-specs/SKILL.md
```

Global definitions can also be installed under user-level opencode, Claude, or agent skills directories. Prefer a project-local path when the spec workflow should travel with the repository.

If a direct skill loader is not available, use `assets/adapters/opencode-agent.md` as an opencode custom agent prompt. That adapter points back to this skill's required workflow and templates.

## Cross-Platform Contract

The stable contract is the three spec files:

- `requirements.md`
- `design.md`
- `tasks.md`

Any agent can continue the work if it reads those files and follows the gates in `SKILL.md`.
