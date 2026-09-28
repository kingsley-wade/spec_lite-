import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { install, doctor, uninstall } from '../lib/installer.mjs';
import { validateSpec } from '../lib/validator.mjs';

const canonicalSkill = join(process.cwd(), 'skills', 'kiro-lite-specs');

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'kiro-lite-specs-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = join(root, 'project');
  const home = join(root, 'home');
  await mkdir(project);
  await mkdir(home);
  return { root: project, home, scope: 'project', platforms: ['codex', 'claude'] };
}

test('installs both agents and preserves edited files across update and uninstall', async (t) => {
  assert.match(await readFile(join(canonicalSkill, 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
  const options = await fixture(t);
  await install(options);
  const codex = join(options.root, '.agents', 'skills', 'kiro-lite-specs');
  const claude = join(options.root, '.claude', 'skills', 'kiro-lite-specs');
  assert.match(await readFile(join(codex, 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
  assert.match(await readFile(join(claude, 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
  await install(options);
  await writeFile(join(codex, 'SKILL.md'), 'local edit');
  await assert.rejects(install(options, { update: true }), /changed or removed locally/);
  await assert.rejects(uninstall(options), /local changes prevent uninstall/);
  assert.match((await doctor(options)).join('\n'), /changed files/);
  assert.match(await readFile(join(claude, 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
  assert.equal(await readFile(join(codex, 'SKILL.md'), 'utf8'), 'local edit');
});

test('installs user-scoped skills into each platform home directory', async (t) => {
  const options = { ...await fixture(t), scope: 'user' };
  await install(options);
  assert.match(await readFile(join(options.home, '.agents', 'skills', 'kiro-lite-specs', 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
  assert.match(await readFile(join(options.home, '.claude', 'skills', 'kiro-lite-specs', 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
});

test('project template overrides user defaults and update refreshes managed copies', async (t) => {
  const options = await fixture(t);
  const userConfig = join(options.home, '.config', 'kiro-lite-specs');
  const projectConfig = join(options.root, '.kiro-lite-specs');
  await mkdir(userConfig, { recursive: true });
  await mkdir(projectConfig, { recursive: true });
  await writeFile(join(userConfig, 'requirements.md'), 'user template');
  await writeFile(join(userConfig, 'config.json'), JSON.stringify({ templates: { requirements: './requirements.md' } }));
  await writeFile(join(projectConfig, 'requirements.md'), 'project template');
  await writeFile(join(projectConfig, 'config.json'), JSON.stringify({ templates: { requirements: './requirements.md' } }));
  await install(options);
  const template = join(options.root, '.agents', 'skills', 'kiro-lite-specs', 'assets', 'templates', 'requirements.md');
  assert.equal(await readFile(template, 'utf8'), 'project template');
  await writeFile(join(projectConfig, 'requirements.md'), 'updated project template');
  await install(options, { update: true });
  assert.equal(await readFile(template, 'utf8'), 'updated project template');
  assert.match((await doctor(options)).join('\n'), /healthy/);
  await uninstall(options);
  await assert.rejects(readFile(template), /ENOENT/);
  assert.equal(await readFile(join(projectConfig, 'requirements.md'), 'utf8'), 'updated project template');
});

test('unmanaged installation is never overwritten', async (t) => {
  const options = await fixture(t);
  const skill = join(options.root, '.agents', 'skills', 'kiro-lite-specs');
  await mkdir(skill, { recursive: true });
  await writeFile(join(skill, 'SKILL.md'), 'existing');
  await assert.rejects(install(options), /unmanaged skill/);
  assert.equal(await readFile(join(skill, 'SKILL.md'), 'utf8'), 'existing');
});

test('Node validator accepts a completed spec and rejects placeholders', async (t) => {
  const options = await fixture(t);
  const dir = join(options.root, 'specs');
  await mkdir(dir);
  await writeFile(join(dir, 'requirements.md'), '# Requirements\n## Purpose\n## Scope\n## Functional Requirements\n## Approval\n');
  await writeFile(join(dir, 'design.md'), '# Design\n## Overview\n## Repository Tree Impact\n## Architecture\n## Testing Strategy\n## Approval\n');
  await writeFile(join(dir, 'tasks.md'), '# Tasks\n## Status Legend\n## Execution Rules\n## Task Checklist\n- [ ] 1.1 Work\n  - Module: core\n  - Goal: work\n  - Files: file.js\n  - Depends on: none\n  - Acceptance evidence: test\n## Approval\n');
  assert.deepEqual(await validateSpec(dir), []);
  await writeFile(join(dir, 'requirements.md'), '# Requirements\nTODO');
  assert.match((await validateSpec(dir)).join('\n'), /placeholder or TODO/);
});
