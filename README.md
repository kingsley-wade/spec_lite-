# kiro-lite-specs

A Markdown based requirements → design → tasks workflow for Codex and Claude Code. The npm package installs the same Agent Skill for both tools; it does not run during `npm install`.

## Install from GitHub in a project

```sh
npm install -D github:YOUR_GITHUB_NAME/kiro-lite-specs#v0.1.0
npx kiro-lite-specs install --platform codex,claude --scope project
```

This writes `.agents/skills/kiro-lite-specs` for Codex and `.claude/skills/kiro-lite-specs` for Claude Code. Commit those folders if teammates should get the skill with the repository. To install in your home directory instead, run `npx kiro-lite-specs install --scope user`.

Replace `YOUR_GITHUB_NAME` with the repository owner. Create a GitHub release tag such as `v0.1.0` before using the command above. You can also download or clone this repository and run `node bin/kiro-lite-specs.mjs install --root /path/to/project` locally. npm Registry publication is optional.

Ask either agent to use `kiro-lite-specs` for a feature. The agent writes `requirements.md`, then `design.md`, then `tasks.md`, with user approval at each gate.

## Customize templates

Create `.kiro-lite-specs/config.json` in the project:

```json
{
  "templates": {
    "requirements": "./templates/requirements.md",
    "design": "./templates/design.md",
    "tasks": "./templates/tasks.md"
  }
}
```

Template paths are relative to the config file. You may specify any subset. User defaults go in `~/.config/kiro-lite-specs/config.json`; project settings win when both specify the same template. Run `npx kiro-lite-specs update` after changing configuration. You can also edit installed Skill files directly; updates then stop with a conflict so your edits are preserved. Generated spec documents are never touched by the installer.

## Maintain the installation

```sh
npx kiro-lite-specs doctor
npx kiro-lite-specs update
npx kiro-lite-specs validate specs/my-feature
npx kiro-lite-specs uninstall
```

`doctor`, `update`, and `uninstall` accept the same `--platform`, `--scope`, `--root`, and `--home` options as `install`. `uninstall` removes only files tracked by the installer and refuses to run if any tracked file was edited. The bundled Python validator remains available as `python scripts/validate_spec.py <spec-dir>` inside an installed skill.

The package has no install lifecycle script and does not modify agent directories until you run `install`.
