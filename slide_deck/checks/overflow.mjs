import { chromium } from 'playwright';
import { DECKS, fileUrl } from './decks.mjs';

const VIEWPORTS = [
  { width: 1440, height: 810 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 1280, height: 620 },
];

// Runs in the page. Activates each slide in turn and reports anything that
// escapes the viewport. Checks r.top < 0 as well as scrollHeight because the
// slides are flex-centred, so overflow escapes upward too and scrollHeight
// only ever measures downward overflow.
function probe(notesOpen) {
  const slides = [...document.querySelectorAll('.slide')];
  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const findings = [];

  slides.forEach((slide, i) => {
    slides.forEach((s) => s.classList.remove('on'));
    slide.classList.add('on');
    slide.getBoundingClientRect();

    if (slide.scrollHeight - slide.clientHeight > 1) {
      findings.push({ slide: i + 1, kind: 'slide-scrolls', detail: `${slide.scrollHeight - slide.clientHeight}px` });
    }

    slide.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      // A panel that scrolls its own content is allowed to exceed its box.
      if (el.closest('[data-scrollable]')) return;
      if (r.bottom > VH + 1 || r.top < -1 || r.right > VW + 1 || r.left < -1) {
        findings.push({
          slide: i + 1,
          kind: 'clipped',
          notesOpen,
          el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/)[0] : ''),
          box: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
          text: (el.textContent || '').trim().slice(0, 60),
        });
      }
    });
  });

  return findings;
}

const browser = await chromium.launch();
let failures = 0;

for (const deck of DECKS) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport });
    await page.goto(fileUrl(deck.file));

    for (const notesOpen of [false, true]) {
      if (notesOpen) {
        await page.keyboard.press('n');
        const hasPanel = await page.evaluate(() => !!document.querySelector('[data-notes-panel]'));
        if (!hasPanel) continue; // deck has no notes layer yet
      }
      const findings = await page.evaluate(probe, notesOpen);
      const label = `${deck.name} @ ${viewport.width}x${viewport.height}${notesOpen ? ' (notes open)' : ''}`;
      if (findings.length) {
        failures += findings.length;
        console.error(`FAIL ${label}`);
        for (const f of findings.slice(0, 6)) console.error('     ', JSON.stringify(f));
      } else {
        console.log(`PASS ${label}`);
      }
      if (notesOpen) await page.keyboard.press('n');
    }

    await page.close();
  }
}

await browser.close();
console.log(failures ? `\noverflow: ${failures} finding(s)` : '\noverflow: clean');
process.exit(failures ? 1 : 0);
