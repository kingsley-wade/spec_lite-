#!/usr/bin/env node
import { run } from '../lib/cli.mjs';

run(process.argv.slice(2)).catch((error) => {
  console.error(`kiro-lite-specs: ${error.message}`);
  process.exitCode = 1;
});
