const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {pathToFileURL} = require('node:url');

// Usage: node tests/smoke.cjs [page.html]  (default: index.html; 8 s of silence stands in for a song)
function silentWav(seconds = 8, rate = 8000) {
  const data = rate * seconds * 2, buf = Buffer.alloc(44 + data);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + data, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(data, 40);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'viewer-')), 'silent.wav');
  fs.writeFileSync(file, buf);
  return file;
}
const pagePath = path.resolve(process.argv[2] || path.join(__dirname, '..', 'index.html'));
const audioPath = silentWav();

(async () => {
  let browser;
  try { browser = await chromium.launch(); }
  catch (e) { if (/executable.*doesn't exist|browser.*not found|sandbox_host_linux.*|Operation not permitted/i.test(e.message)) process.exit(77); throw e; }
  try {
    const page = await browser.newPage({viewport: {width: 900, height: 1000}});
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('request', req => { if (/^https?:/.test(req.url())) requests.push(req.url()); });
    const fixture = path.join(__dirname, 'fixtures/libkson/Gram_ex.ksh');
    await page.goto(pathToFileURL(pagePath).href);
    await page.locator('#files').setInputFiles(fixture);
    await page.waitForFunction(() => document.querySelector('#title').textContent === 'Gram');
    await page.locator('#start').click();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#play').textContent(), '❚❚ PAUSE');
    assert.notEqual(await page.locator('#time').textContent(), '0:00');
    await page.locator('#play').click();
    await page.locator('#seek').fill('20');
    await page.waitForFunction(() => document.querySelector('#measure').textContent === '20');
    await page.locator('#rate').selectOption('0.5');
    await page.locator('#view').selectOption('flat');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#field3d').isVisible(), false);
    await page.locator('#view').selectOption('3d');
    // Audio after the chart, then replacement while playing.
    await page.locator('#files').setInputFiles(audioPath);
    await page.waitForFunction(() => !document.querySelector('#effects').disabled);
    await page.locator('#start').click();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#effects').isChecked(), true);
    await page.locator('#files').setInputFiles(path.join(__dirname, 'fixtures/libkson/Gram_ch.ksh'));
    await page.waitForFunction(() => document.querySelector('#level').textContent === '13');
    assert.equal(await page.locator('#play').textContent(), '▶ PLAY');
    await page.locator('#start').click();
    await page.waitForTimeout(200);
    await page.locator('#play').click();
    // Exercise every procedural slam variant in real WebAudio, including a silent mute.
    await page.evaluate(() => {
      window.slamStarts = 0;
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function(...args) { window.slamStarts++; return start.apply(this, args); };
    });
    const slams = {format_version:1,meta:{title:'Slams'},beat:{bpm:[[0,120]]},
      note:{laser:[[[0,[[0,[0,1]],[120,[1,0]],[240,[0,1]],[360,[1,0]],[480,[0,1]]]]],[]]},
      audio:{key_sound:{laser:{slam_event:{slam_up:[120],slam_down:[240],slam_swing:[360],slam_mute:[480]}}}}};
    await page.locator('#files').setInputFiles({name:'slams.kson',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(slams))});
    await page.waitForFunction(() => document.querySelector('#title').textContent === 'Slams');
    assert.equal(await page.locator('#slam').isChecked(), true);
    await page.locator('#rate').selectOption('1');
    await page.locator('#start').click();
    await page.waitForTimeout(1200);
    await page.locator('#play').click();
    assert.equal(await page.evaluate(() => window.slamStarts), 4);
    await page.locator('#slam').uncheck();
    // Opaque origin: same HTML and data URL AudioWorklet fallback in a sandboxed iframe.
    await page.goto('about:blank');  // drop the first page's animation loop
    await page.setContent('<iframe sandbox="allow-scripts" style="width:800px;height:950px"></iframe>');
    await page.locator('iframe').evaluate((el, html) => { el.srcdoc = html; }, fs.readFileSync(pagePath, 'utf8'));
    const frame = page.frameLocator('iframe');
    await frame.locator('#files').setInputFiles(audioPath);
    await frame.locator('#files').setInputFiles(fixture);
    await frame.locator('#start').click();
    await page.waitForTimeout(1100);
    assert.equal(await frame.locator('#play').textContent(), '❚❚ PAUSE');
    assert.notEqual(await frame.locator('#time').textContent(), '0:00');
    await frame.locator('#play').click();
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
