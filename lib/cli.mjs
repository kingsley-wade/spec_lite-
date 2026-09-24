import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { install, doctor, uninstall } from './installer.mjs';
import { validateSpec } from './validator.mjs';

const usage = `Usage: kiro-lite-specs <command> [options]

Commands:
  install       Install the skill into selected agent directories
  update        Update a managed installation, preserving local edits
  doctor        Check installed files and report local changes
  uninstall     Remove only unchanged files managed by this CLI
  validate DIR  Validate requirements.md, design.md and tasks.md

Options for install, update, doctor and uninstall:
  --platform codex,claude   One or both platforms (default: both)
  --scope project|user      Installation scope (default: project)
  --root DIR                Project root (default: current directory)
  --home DIR                User home (default: system home)

The installer never overwrites edited files. Use project or user config at
.kiro-lite-specs/config.json or ~/.config/kiro-lite-specs/config.json.`;

function parse(args) {
  const [command, ...rest] = args;
  const options = { platform: 'codex,claude', scope: 'project', root: process.cwd(), home: homedir() };
  const positional = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (!['platform', 'scope', 'root', 'home'].includes(key) || !rest[i + 1] || rest[i + 1].startsWith('--')) {
      throw new Error(`invalid option ${arg}\n${usage}`);
    }
    options[key] = rest[++i];
  }
  if (!['project', 'user'].includes(options.scope)) throw new Error('scope must be project or user');
  const platforms = [...new Set(options.platform.split(',').map((x) => x.trim()))];
  if (!platforms.length || platforms.some((x) => !['codex', 'claude'].includes(x))) {
    throw new Error('platform must be codex, claude, or codex,claude');
  }
  return { command, options: { ...options, root: resolve(options.root), home: resolve(options.home), platforms }, positional };
}

export async function run(args) {
  if (!args.length || args.includes('--help') || args.includes('-h')) {
    console.log(usage);
    return;
  }
  const { command, options, positional } = parse(args);
  if (command === 'validate') {
    if (positional.length !== 1) throw new Error('validate requires one spec directory');
    const errors = await validateSpec(resolve(positional[0]));
    if (errors.length) throw new Error(`validation failed:\n- ${errors.join('\n- ')}`);
    console.log(`Spec validation passed: ${resolve(positional[0])}`);
    return;
  }
  if (positional.length) throw new Error(`unexpected argument: ${positional[0]}`);
  if (command === 'install' || command === 'update') {
    const result = await install(options, { update: command === 'update' });
    result.forEach((line) => console.log(line));
  } else if (command === 'doctor') {
    const result = await doctor(options);
    result.forEach((line) => console.log(line));
    if (result.some((line) => line.includes('changed') || line.includes('missing'))) process.exitCode = 1;
  } else if (command === 'uninstall') {
    const result = await uninstall(options);
    result.forEach((line) => console.log(line));
  } else {
    throw new Error(`unknown command: ${command}\n${usage}`);
  }
}
