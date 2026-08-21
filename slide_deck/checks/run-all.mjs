import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const CHECKS = ['overflow.mjs', 'parity.mjs', 'terminology.mjs', 'filenames.mjs'];

let failed = 0;
for (const check of CHECKS) {
  console.log(`\n=== ${check} ===`);
  const r = spawnSync(process.execPath, [join(here, check)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}

console.log(failed ? `\n${failed} of ${CHECKS.length} check(s) failed` : `\nall ${CHECKS.length} checks passed`);
process.exit(failed ? 1 : 0);
