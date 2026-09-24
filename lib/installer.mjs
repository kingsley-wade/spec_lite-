import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir, mkdir, writeFile, unlink, rmdir, lstat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillName = 'kiro-lite-specs';
const manifestName = '.kiro-lite-specs-install.json';
const sourceEntries = ['SKILL.md', 'agents', 'assets', 'references', 'scripts'];
const templateNames = ['requirements', 'design', 'tasks'];
const version = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8')).version;

const hash = (data) => createHash('sha256').update(data).digest('hex');

async function filesUnder(path, prefix = '') {
  const items = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const relative = join(prefix, entry.name);
    if (entry.isDirectory()) items.push(...await filesUnder(join(path, entry.name), relative));
    else if (entry.isFile()) items.push(relative);
    else throw new Error(`unsupported source entry: ${relative}`);
  }
  return items;
}

async function loadConfig(path) {
  if (!existsSync(path)) return {};
  const config = JSON.parse(await readFile(path, 'utf8'));
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error(`invalid config: ${path}`);
  if (config.templates !== undefined && (!config.templates || typeof config.templates !== 'object' || Array.isArray(config.templates))) {
    throw new Error(`templates must be an object in ${path}`);
  }
  const result = {};
  for (const [name, relative] of Object.entries(config.templates || {})) {
    if (!templateNames.includes(name) || typeof relative !== 'string' || !relative) {
      throw new Error(`invalid template override ${name} in ${path}`);
    }
    result[name] = resolve(dirname(path), relative);
  }
  return result;
}

async function desiredFiles(options) {
  const paths = ['SKILL.md'];
  for (const entry of sourceEntries.slice(1)) paths.push(...await filesUnder(join(packageRoot, entry), entry));
  const desired = new Map();
  for (const relative of paths) desired.set(relative.replaceAll('\\', '/'), await readFile(join(packageRoot, relative)));
  const userConfig = join(options.home, '.config', skillName, 'config.json');
  const projectConfig = join(options.root, '.kiro-lite-specs', 'config.json');
  const overrides = { ...await loadConfig(userConfig), ...(options.scope === 'project' ? await loadConfig(projectConfig) : {}) };
  for (const [name, path] of Object.entries(overrides)) {
    desired.set(`assets/templates/${name}.md`, await readFile(path));
  }
  return desired;
}

function targets(options) {
  const base = options.scope === 'project' ? options.root : options.home;
  return options.platforms.map((platform) => ({
    platform,
    path: join(base, platform === 'codex' ? '.agents' : '.claude', 'skills', skillName),
  }));
}

async function readManifest(target) {
  const path = join(target, manifestName);
  if (!existsSync(path)) return null;
  const manifest = JSON.parse(await readFile(path, 'utf8'));
  if (manifest.skill !== skillName || !manifest.files || typeof manifest.files !== 'object') {
    throw new Error(`invalid installation manifest: ${path}`);
  }
  return manifest;
}

async function fileHash(path) {
  if (!existsSync(path)) return null;
  const stat = await lstat(path);
  if (!stat.isFile()) return 'not-a-regular-file';
  return hash(await readFile(path));
}

async function preflight(target, desired, update) {
  const manifest = await readManifest(target.path);
  if (update && !manifest) throw new Error(`not a managed installation: ${target.path}`);
  const conflicts = [];
  if (!manifest && existsSync(target.path) && (await readdir(target.path)).length) {
    conflicts.push(`${target.path} already contains an unmanaged skill`);
  }
  if (manifest) {
    const all = new Set([...Object.keys(manifest.files), ...desired.keys()]);
    for (const relative of all) {
      const current = await fileHash(join(target.path, relative));
      const previous = manifest.files[relative];
      if (previous && current !== previous) conflicts.push(`${target.path}/${relative} was changed or removed locally`);
      if (!previous && current !== null) conflicts.push(`${target.path}/${relative} is an unmanaged file`);
    }
  }
  if (conflicts.length) throw new Error(`installation conflict:\n- ${conflicts.join('\n- ')}`);
  return { ...target, manifest };
}

export async function install(options, { update = false } = {}) {
  const desired = await desiredFiles(options);
  const plans = [];
  for (const target of targets(options)) plans.push(await preflight(target, desired, update));
  const result = [];
  for (const plan of plans) {
    for (const relative of Object.keys(plan.manifest?.files || {})) {
      if (!desired.has(relative)) await unlink(join(plan.path, relative));
    }
    const hashes = {};
    for (const [relative, data] of desired) {
      const path = join(plan.path, relative);
      await mkdir(dirname(path), { recursive: true });
      if (await fileHash(path) !== hash(data)) await writeFile(path, data);
      hashes[relative] = hash(data);
    }
    await writeFile(join(plan.path, manifestName), JSON.stringify({ skill: skillName, version, files: hashes }, null, 2) + '\n');
    result.push(`${plan.platform}: ${plan.path} (version ${version})`);
  }
  return result;
}

export async function doctor(options) {
  const result = [];
  for (const target of targets(options)) {
    const manifest = await readManifest(target.path);
    if (!manifest) {
      result.push(`${target.platform}: missing installation at ${target.path}`);
      continue;
    }
    const changed = [];
    for (const [relative, expected] of Object.entries(manifest.files)) {
      if (await fileHash(join(target.path, relative)) !== expected) changed.push(relative);
    }
    result.push(changed.length
      ? `${target.platform}: changed files: ${changed.join(', ')}`
      : `${target.platform}: healthy (version ${manifest.version}) at ${target.path}`);
  }
  return result;
}

export async function uninstall(options) {
  const plans = [];
  for (const target of targets(options)) {
    const manifest = await readManifest(target.path);
    if (!manifest) throw new Error(`not a managed installation: ${target.path}`);
    const changed = [];
    for (const [relative, expected] of Object.entries(manifest.files)) {
      if (await fileHash(join(target.path, relative)) !== expected) changed.push(relative);
    }
    if (changed.length) throw new Error(`local changes prevent uninstall at ${target.path}: ${changed.join(', ')}`);
    plans.push({ ...target, manifest });
  }
  for (const plan of plans) {
    for (const relative of Object.keys(plan.manifest.files)) await unlink(join(plan.path, relative));
    await unlink(join(plan.path, manifestName));
    for (const entry of sourceEntries.slice(1)) {
      const dir = join(plan.path, entry);
      if (existsSync(dir)) await removeEmptyDirectories(dir);
    }
    await rmdir(plan.path).catch((error) => { if (error.code !== 'ENOTEMPTY') throw error; });
  }
  return plans.map((plan) => `${plan.platform}: uninstalled from ${plan.path}`);
}

async function removeEmptyDirectories(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.isDirectory()) await removeEmptyDirectories(join(path, entry.name));
  }
  await rmdir(path).catch((error) => { if (error.code !== 'ENOTEMPTY') throw error; });
}
