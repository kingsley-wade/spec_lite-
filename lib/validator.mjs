import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const sections = {
  'requirements.md': ['# Requirements', '## Purpose', '## Scope', '## Functional Requirements', '## Approval'],
  'design.md': ['# Design', '## Overview', '## Repository Tree Impact', '## Architecture', '## Testing Strategy', '## Approval'],
  'tasks.md': ['# Tasks', '## Status Legend', '## Execution Rules', '## Task Checklist', '## Approval'],
};

export async function validateSpec(dir) {
  const errors = [];
  const contents = {};
  for (const [name, required] of Object.entries(sections)) {
    try {
      contents[name] = await readFile(join(dir, name), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        errors.push(`missing required file: ${name}`);
        continue;
      }
      throw error;
    }
    for (const section of required) {
      if (!contents[name].includes(section)) errors.push(`${name}: missing section ${section}`);
    }
    if (/<[^>\n]+>|\b(?:TBD|TODO)\b/i.test(contents[name])) errors.push(`${name}: unresolved placeholder or TODO`);
  }
  if (contents['tasks.md']) {
    const tasks = contents['tasks.md'];
    if (!/^- \[(?: |~|x|!)\] \d+(?:\.\d+)+ .+/m.test(tasks)) errors.push('tasks.md: no valid checklist tasks');
    for (const field of ['Module', 'Goal', 'Files', 'Depends on', 'Acceptance evidence']) {
      if (!new RegExp(`^\\s+- ${field}:\\s+.+`, 'm').test(tasks)) errors.push(`tasks.md: missing task field ${field}`);
    }
    if ((tasks.match(/^- \[~\] /gm) || []).length > 1) errors.push('tasks.md: more than one task in progress');
  }
  return errors;
}
