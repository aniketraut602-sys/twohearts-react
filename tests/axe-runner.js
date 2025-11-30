const { chromium } = require('playwright');
const { injectAxe, getViolations } = require('axe-playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173'); // URL of the preview server

  await injectAxe(page);

  const violations = await getViolations(page);

  await browser.close();

  if (violations.length > 0) {
    console.error('Accessibility violations found:');
    violations.forEach((violation) => {
      console.error(violation);
    });
    process.exit(1);
  }

  console.log('No accessibility violations found.');
})();