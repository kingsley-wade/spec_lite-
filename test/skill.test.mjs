import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(process.cwd(), 'skills', 'kiro-lite-specs');

test('canonical skill has concise discovery metadata and complete resources', async () => {
  const skill = await readFile(join(root, 'SKILL.md'), 'utf8');
  const frontmatter = skill.match(/^---\n([\s\S]+?)\n---/);
  assert.ok(frontmatter, 'SKILL.md must start with YAML frontmatter');
  assert.match(frontmatter[1], /^name: kiro-lite-specs$/m);

  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1];
  assert.ok(description?.startsWith('Use when '));
  assert.ok(description.length <= 500);
  assert.doesNotMatch(description, /requirements\.md|design\.md|tasks\.md/);

  for (const relative of [
    'agents/openai.yaml',
    'assets/templates/requirements.md',
    'assets/templates/design.md',
    'assets/templates/tasks.md',
    'references/platform-compatibility.md',
    'scripts/validate_spec.py',
  ]) {
    await access(join(root, relative));
  }
});
