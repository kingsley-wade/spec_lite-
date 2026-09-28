import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const projectRoot = process.cwd();
const npmCli = process.env.npm_execpath;

async function runNpm(args, options) {
  if (!npmCli) throw new Error('npm_execpath is required to run package tests');
  return exec(process.execPath, [npmCli, ...args], options);
}

test('packed GitHub-style package installs and runs in a clean project', async (t) => {
  const temp = await mkdtemp(join(tmpdir(), 'kiro-lite-specs-package-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const cache = join(temp, 'npm-cache');
  const env = { ...process.env, npm_config_cache: cache };

  const { stdout } = await runNpm(['pack', '--json', '--pack-destination', temp], { cwd: projectRoot, env });
  const [packed] = JSON.parse(stdout);
  const paths = packed.files.map((file) => file.path);
  assert.ok(paths.includes('skills/kiro-lite-specs/SKILL.md'));
  assert.ok(paths.includes('bin/kiro-lite-specs.mjs'));
  assert.ok(!paths.includes('SKILL.md'));

  await runNpm(['init', '-y'], { cwd: temp, env });
  await runNpm(['install', '--save-dev', '--ignore-scripts', '--no-audit', '--no-fund', join(temp, packed.filename)], { cwd: temp, env });
  await exec(process.execPath, [join(temp, 'node_modules', 'kiro-lite-specs', 'bin', 'kiro-lite-specs.mjs'), 'install', '--platform', 'codex,claude', '--scope', 'project'], { cwd: temp, env });

  assert.match(await readFile(join(temp, '.agents', 'skills', 'kiro-lite-specs', 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
  assert.match(await readFile(join(temp, '.claude', 'skills', 'kiro-lite-specs', 'SKILL.md'), 'utf8'), /Kiro-Lite Specs/);
});
