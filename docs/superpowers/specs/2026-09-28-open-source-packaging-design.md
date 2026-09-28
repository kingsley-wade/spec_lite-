# Kiro-Lite Specs Open-Source Packaging Design

## Goal

Make the repository installable from GitHub as both a conventional Agent Skill and an npm-executed installer for Codex and Claude Code.

## Root Cause

The published README used a placeholder repository path that did not match the actual GitHub repository. Existing tests covered only the installer's internal file-copy behavior, so they did not detect broken public install commands or packaging layout regressions.

## Repository Layout

The canonical skill payload lives under skills/kiro-lite-specs/:

~~~text
skills/kiro-lite-specs/
  SKILL.md
  agents/openai.yaml
  assets/
  references/
  scripts/
bin/
lib/
test/
.github/workflows/ci.yml
~~~

The npm installer copies only the canonical payload into platform-specific skill directories. CLI code, tests, and package metadata remain outside the installed skill.

## Installation Contract

- Codex project scope: .agents/skills/kiro-lite-specs
- Codex user scope: ~/.agents/skills/kiro-lite-specs
- Claude project scope: .claude/skills/kiro-lite-specs
- Claude user scope: ~/.claude/skills/kiro-lite-specs
- GitHub installation supports both a project dev dependency and a one-shot npm exec --package command.

## Compatibility

Existing managed installations remain readable because their manifest format and installed paths do not change. Update, doctor, uninstall, template overrides, and local-edit protection retain their current behavior.

## Testing

- Unit tests verify project and user installation paths, update safety, template overrides, doctor, uninstall, and validation.
- Package tests create the npm tarball, inspect its contents, install it into a clean temporary project, execute its binary, and verify both platform skill directories.
- CI runs tests and the package dry-run on Windows and Ubuntu with supported Node versions.

## Release

Version 0.2.0 documents the layout migration and corrected GitHub install commands. The repository can later be renamed to kiro-lite-specs without changing the package or installed skill name.
