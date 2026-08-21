import { chromium } from 'playwright';
import { DECKS, fileUrl } from './decks.mjs';

// The structural signature is the tag/class tree with all text stripped.
// Two mirror-twin decks must produce byte-identical signatures; only the
// :root token block, font declarations, <title>, and text content may differ,
// none of which appear here.
function signature() {
  const lines = [];
  const walk = (el, depth) => {
    const cls = String(el.className || '').trim().split(/\s+/).filter(Boolean).sort().join('.');
    lines.push('  '.repeat(depth) + el.tagName.toLowerCase() + (cls ? '.' + cls : ''));
    [...el.children].forEach((c) => walk(c, depth + 1));
  };
  [...document.body.children].forEach((c) => walk(c, 0));
  return lines;
}

const browser = await chromium.launch();
const sigs = [];

for (const deck of DECKS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  await page.goto(fileUrl(deck.file));
  sigs.push({ name: deck.name, lines: await page.evaluate(signature) });
  await page.close();
}

await browser.close();

const [a, b] = sigs;
const max = Math.max(a.lines.length, b.lines.length);
const diffs = [];
for (let i = 0; i < max; i++) {
  if (a.lines[i] !== b.lines[i]) diffs.push({ line: i + 1, a: a.lines[i] ?? '(none)', b: b.lines[i] ?? '(none)' });
}

if (diffs.length) {
  console.error(`FAIL structural parity: ${diffs.length} differing node(s)`);
  console.error(`     ${a.name}: ${a.lines.length} nodes | ${b.name}: ${b.lines.length} nodes`);
  for (const d of diffs.slice(0, 10)) {
    console.error(`     line ${d.line}\n       ${a.name}: ${d.a}\n       ${b.name}: ${d.b}`);
  }
  process.exit(1);
}

console.log(`PASS structural parity: ${a.lines.length} nodes identical in both decks`);
process.exit(0);
