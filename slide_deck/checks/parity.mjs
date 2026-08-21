import { chromium } from 'playwright';
import { DECKS, fileUrl } from './decks.mjs';

// The structural signature is the tag/class/attribute tree with text stripped.
// Two mirror-twin decks must produce identical signatures.
//
// Attribute NAMES are always compared, so a missing aria-label or a stray
// attribute is caught. Attribute VALUES are compared only for the structural
// ones, because href/aria-label/title carry human-readable text and the spec
// permits text to differ where terminology genuinely differs.
//
// Everything this function needs must be declared INSIDE it: page.evaluate
// serializes it with toString() and runs it in the browser context, where the
// Node-side module scope does not exist.
function signature() {
  const STRUCTURAL_ATTRS = ['id', 'data-number', 'data-section'];
  const lines = [];

  const walk = (el, depth) => {
    // el.className is an SVGAnimatedString inside <svg> and stringifies to
    // "[object SVGAnimatedString]", destroying the comparison. getAttribute is
    // uniform across HTML and SVG.
    const cls = (el.getAttribute('class') || '')
      .trim().split(/\s+/).filter(Boolean).sort().join('.');

    const attrNames = [...el.attributes]
      .map((a) => a.name)
      .filter((n) => n !== 'class')
      .sort()
      .join(',');

    const structural = STRUCTURAL_ATTRS
      .filter((a) => el.hasAttribute(a))
      .map((a) => `${a}=${el.getAttribute(a)}`)
      .join(',');

    lines.push(
      '  '.repeat(depth) +
        el.tagName.toLowerCase() +
        (cls ? '.' + cls : '') +
        (attrNames ? ` [${attrNames}]` : '') +
        (structural ? ` {${structural}}` : '')
    );

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
