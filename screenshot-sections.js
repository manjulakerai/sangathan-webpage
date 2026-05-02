const puppeteer = require('puppeteer');
const path = require('path');

const sections = [
  { id: 'nav-hero', selector: '.hero', name: '01-hero' },
  { id: 'definition', selector: '.definition', name: '02-definition' },
  { id: 'about', selector: '#about', name: '03-about' },
  { id: 'event', selector: '#event', name: '04-event' },
  { id: 'directions', selector: '#directions', name: '05-getting-here' },
  { id: 'emergency', selector: '#emergency', name: '06-emergency-medical' },
  { id: 'watch-live', selector: '#watch-live', name: '07-watch-from-home' },
  { id: 'temples', selector: '#temples', name: '08-temples' },
  { id: 'things-to-do', selector: '#things-to-do', name: '09-things-to-do' },
  { id: 'whats-on', selector: '#whats-on', name: '10-whats-on' },
  { id: 'gallery', selector: '#gallery', name: '11-saints-gallery' },
  { id: 'travel', selector: '#travel', name: '12-travel-assistance' },
  { id: 'mobile', selector: '#mobile', name: '13-staying-connected' },
  { id: 'rsvp', selector: '#rsvp', name: '14-register' },
  { id: 'get-involved', selector: '#get-involved', name: '15-get-involved' },
  { id: 'contact', selector: '#contact', name: '16-contact' },
  { id: 'footer', selector: '.footer', name: '17-footer' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const filePath = 'file://' + path.resolve(__dirname, 'outputs/index.html');
  await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  const outDir = path.resolve(__dirname, 'outputs/screenshots');

  for (const section of sections) {
    try {
      const el = await page.$(section.selector);
      if (el) {
        await el.screenshot({ path: path.join(outDir, section.name + '.png') });
        console.log('Captured: ' + section.name);
      } else {
        console.log('Not found: ' + section.selector);
      }
    } catch (e) {
      console.log('Error on ' + section.name + ': ' + e.message);
    }
  }

  // Full page screenshot
  await page.screenshot({
    path: path.join(outDir, '00-full-page.png'),
    fullPage: true
  });
  console.log('Captured: full page');

  // Generate PDF in landscape, chopping tall screenshots into page-sized chunks
  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: 1440, height: 900 });

  const fs = require('fs');
  const { createCanvas, loadImage } = require('canvas');

  const screenshots = fs.readdirSync(outDir)
    .filter(f => f.endsWith('.png') && f !== '00-full-page.png')
    .sort();

  // A4 landscape: 297mm x 210mm. With 5mm margins each side: 287mm x 200mm usable.
  // At 150 DPI: 287mm = 1695px usable width, 200mm = 1181px usable height.
  const USABLE_W = 1695;
  const USABLE_H = 1181;

  let imagesHtml = '';

  for (const file of screenshots) {
    const img = await loadImage(path.join(outDir, file));
    const label = file.replace(/^\d+-/, '').replace('.png', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Scale image so width fills USABLE_W
    const scale = USABLE_W / img.width;
    const scaledH = Math.round(img.height * scale);

    if (scaledH <= USABLE_H) {
      // Fits on one page
      const imgData = fs.readFileSync(path.join(outDir, file));
      const base64 = imgData.toString('base64');
      imagesHtml += `
        <div class="section-page">
          <h2>${label}</h2>
          <img src="data:image/png;base64,${base64}" style="width:${USABLE_W}px;" />
        </div>`;
    } else {
      // Chop into chunks
      const chunkSrcH = Math.floor(USABLE_H / scale); // height in source pixels per chunk
      const numChunks = Math.ceil(img.height / chunkSrcH);

      for (let i = 0; i < numChunks; i++) {
        const sy = i * chunkSrcH;
        const sh = Math.min(chunkSrcH, img.height - sy);
        const canvasW = img.width;
        const canvasH = sh;

        const canvas = createCanvas(canvasW, canvasH);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, sy, canvasW, sh, 0, 0, canvasW, sh);

        const chunkBase64 = canvas.toBuffer('image/png').toString('base64');
        const pageLabel = numChunks > 1 ? `${label} (${i + 1}/${numChunks})` : label;

        imagesHtml += `
          <div class="section-page">
            <h2>${pageLabel}</h2>
            <img src="data:image/png;base64,${chunkBase64}" style="width:${USABLE_W}px;" />
          </div>`;
      }
    }
  }

  const html = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, sans-serif; background: #fff; }
  .section-page { page-break-after: always; padding: 0; text-align: center; }
  .section-page:last-child { page-break-after: avoid; }
  .section-page h2 { font-size: 14px; margin: 4px 0; color: #5C2248; }
  .section-page img { display: block; margin: 0 auto; }
</style></head><body>${imagesHtml}</body></html>`;

  await pdfPage.setContent(html, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await pdfPage.pdf({
    path: path.resolve(__dirname, 'outputs/sangathan-parva-website.pdf'),
    landscape: true,
    format: 'A4',
    printBackground: true,
    margin: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' }
  });
  console.log('Generated landscape PDF with chunked pages');

  await browser.close();
  console.log('Done!');
})();
