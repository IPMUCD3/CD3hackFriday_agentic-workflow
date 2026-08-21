import { chromium } from 'playwright';
import { DECKS, fileUrl } from './decks.mjs';

const VIEWPORTS = [
  { width: 1440, height: 810 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 1280, height: 620 },
];

// Runs in the page. Activates slide `i` and reports anything that escapes the
// viewport. Checks r.top < 0 as well as scrollHeight because the slides are
// flex-centred, so overflow escapes upward too and scrollHeight only ever
// measures downward overflow.
function probeSlide(i) {
  const slides = [...document.querySelectorAll('.slide')];
  slides.forEach((s) => s.classList.remove('on'));
  const slide = slides[i];
  slide.classList.add('on');
  slide.getBoundingClientRect();

  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const findings = [];

  if (slide.scrollHeight - slide.clientHeight > 1) {
    findings.push({ slide: i + 1, kind: 'slide-scrolls', detail: `${slide.scrollHeight - slide.clientHeight}px` });
  }

  slide.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (r.bottom > VH + 1 || r.top < -1 || r.right > VW + 1 || r.left < -1) {
      findings.push({
        slide: i + 1,
        kind: 'clipped',
        el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/)[0] : ''),
        box: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
        text: (el.textContent || '').trim().slice(0, 60),
      });
    }
  });

  return findings;
}

// Runs in the page. The notes panel is a SIBLING of the slides, so probeSlide's
// descendant walk can never reach it. Assert positively: it must be open, sit
// inside the viewport, and scroll its own overflow instead of clipping it.
// Also re-check the active slide, since an open panel must not push it around.
function probePanel(i) {
  const findings = [];
  const panel = document.querySelector('[data-notes-panel]');
  if (!panel) return [{ slide: i + 1, kind: 'notes-panel-missing' }];

  const cs = getComputedStyle(panel);
  if (cs.display === 'none') return [{ slide: i + 1, kind: 'notes-panel-did-not-open' }];

  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const r = panel.getBoundingClientRect();

  if (r.bottom > VH + 1 || r.top < -1 || r.right > VW + 1 || r.left < -1) {
    findings.push({
      slide: i + 1,
      kind: 'notes-panel-clipped',
      box: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
    });
  }

  if (panel.scrollHeight - panel.clientHeight > 1 && !/(auto|scroll)/.test(cs.overflowY)) {
    findings.push({
      slide: i + 1,
      kind: 'notes-panel-clips-content',
      detail: `${panel.scrollHeight - panel.clientHeight}px hidden, overflow-y: ${cs.overflowY}`,
    });
  }

  const slide = [...document.querySelectorAll('.slide')][i];
  if (slide && slide.scrollHeight - slide.clientHeight > 1) {
    findings.push({ slide: i + 1, kind: 'slide-scrolls', detail: `${slide.scrollHeight - slide.clientHeight}px` });
  }

  return findings;
}

const browser = await chromium.launch();
let failures = 0;

function report(label, findings) {
  if (findings.length) {
    failures += findings.length;
    console.error(`FAIL ${label}`);
    for (const f of findings.slice(0, 6)) console.error('     ', JSON.stringify(f));
  } else {
    console.log(`PASS ${label}`);
  }
}

for (const deck of DECKS) {
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({ viewport });
    await page.goto(fileUrl(deck.file));
    const slideCount = await page.evaluate(() => document.querySelectorAll('.slide').length);

    // Pass 1 -- notes closed. Activate each slide by class and walk its descendants.
    const findings1 = [];
    for (let i = 0; i < slideCount; i++) {
      findings1.push(...(await page.evaluate(probeSlide, i)));
    }
    report(`${deck.name} @ ${viewport.width}x${viewport.height}`, findings1);

    // Pass 2 -- notes open. Reload so pass 1's slide/class churn can't leak in,
    // then drive the deck's own keyboard navigation so renderNotes() actually runs.
    await page.reload();
    await page.keyboard.press('n');
    const hasPanel = await page.evaluate(() => !!document.querySelector('[data-notes-panel]'));
    if (hasPanel) {
      const findings2 = [];
      for (let i = 0; i < slideCount; i++) {
        findings2.push(...(await page.evaluate(probePanel, i)));
        if (i < slideCount - 1) await page.keyboard.press('ArrowRight');
      }
      report(`${deck.name} @ ${viewport.width}x${viewport.height} (notes open)`, findings2);
    } // else: deck has no notes layer yet -- skip pass 2 entirely

    await page.close();
  }
}

await browser.close();
console.log(failures ? `\noverflow: ${failures} finding(s)` : '\noverflow: clean');
process.exit(failures ? 1 : 0);
