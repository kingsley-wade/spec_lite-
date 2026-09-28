# Kiro-Lite Specs

[![CI](https://github.com/kingsley-wade/spec_lite-/actions/workflows/ci.yml/badge.svg)](https://github.com/kingsley-wade/spec_lite-/actions/workflows/ci.yml)

A lightweight requirements → design → tasks workflow packaged as one Agent Skill for Codex and Claude Code. The repository also includes a small npm CLI that installs, updates, validates, and safely removes managed copies of the skill.

The GitHub repository is currently named spec_lite-. The npm package, executable, and installed skill are all named kiro-lite-specs.

## Requirements

- Node.js 20 or newer
- npm 9 or newer
- Codex, Claude Code, or both

## Quick install from GitHub

Run this from the project that should receive the skill:

~~~sh
npm exec --yes --package="github:kingsley-wade/spec_lite-#main" -- kiro-lite-specs install --platform codex,claude --scope project
~~~

This creates:

~~~text
.agents/skills/kiro-lite-specs/   # Codex
.claude/skills/kiro-lite-specs/   # Claude Code
~~~

Commit those directories when teammates or cloud sessions should receive the same skill. Use --platform codex or --platform claude to install only one copy.

For a stable release, replace #main with an existing release tag such as #v0.2.0.

## Install as a project dependency

Use this form when the repository should retain the installer as a development dependency:

~~~sh
npm install -D "github:kingsley-wade/spec_lite-#main"
npm exec -- kiro-lite-specs install --platform codex,claude --scope project
~~~

The previous placeholder command using github:YOUR_GITHUB_NAME/kiro-lite-specs does not point to this repository and should not be used.

## User-wide installation

Install into ~/.agents/skills and ~/.claude/skills:

~~~sh
npm exec --yes --package="github:kingsley-wade/spec_lite-#main" -- kiro-lite-specs install --platform codex,claude --scope user
~~~

## Clone or download manually

~~~sh
git clone https://github.com/kingsley-wade/spec_lite-.git
cd spec_lite-
node bin/kiro-lite-specs.mjs install --platform codex,claude --scope project --root /path/to/project
~~~

The canonical skill payload is in skills/kiro-lite-specs. You may also copy that directory directly into a supported skill search path.

## Use the skill

Ask Codex or Claude Code to use kiro-lite-specs for a feature, bugfix, refactor, or new project. The skill guides the agent through:

1. requirements.md
2. design.md
3. tasks.md
4. implementation after approval

Generated specifications are stored under specs/<feature-name>/ unless the repository already uses another convention.

## Manage an installation

~~~sh
npm exec -- kiro-lite-specs doctor
npm exec -- kiro-lite-specs update
npm exec -- kiro-lite-specs validate specs/my-feature
npm exec -- kiro-lite-specs uninstall
~~~

install, update, doctor, and uninstall accept --platform, --scope, --root, and --home. The installer:

- tracks installed files in .kiro-lite-specs-install.json;
- refuses to overwrite locally edited or unmanaged files;
- removes only unchanged files it previously installed;
- never modifies generated specification documents.

## Customize templates

Create .kiro-lite-specs/config.json in a project:

~~~json
{
  "templates": {
    "requirements": "./templates/requirements.md",
    "design": "./templates/design.md",
    "tasks": "./templates/tasks.md"
  }
}
~~~

Paths are relative to the config file. User defaults may be placed in ~/.config/kiro-lite-specs/config.json. Project overrides take precedence for project-scoped installations.

## Repository layout

~~~text
skills/kiro-lite-specs/   Canonical Agent Skill payload
bin/                      Executable entry point
lib/                      Installer and validator
test/                     Unit and package installation tests
.github/workflows/        Continuous integration
~~~

The CLI copies only the canonical skill payload. npm implementation files are not installed into Codex or Claude skill directories.

## Development

~~~sh
npm test
npm run pack:check
~~~

The package test creates a tarball, installs it into a clean temporary project, executes the installed CLI, and verifies both platform directories. CI runs the same checks on Windows and Ubuntu with Node.js 20 and 22.

## Release checklist

1. Update CHANGELOG.md and the package version.
2. Run npm run ci.
3. Commit the release changes.
4. Create and push a matching tag, for example v0.2.0.
5. Verify the tagged GitHub installation command in a clean directory.

Publishing to the npm registry is optional; GitHub tags are sufficient for the documented installation flow.

## License

MIT
