const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 12'],
  });
  const page = await context.newPage();

  // Start local server or just use file
  const path = require('path');
  const fileUrl = 'file://' + path.resolve('index.html');

  await page.goto(fileUrl);
  await page.waitForTimeout(2000); // Wait for scripts

  await page.screenshot({ path: 'mobile_top.png' });

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'mobile_scrolled.png' });

  await browser.close();
  console.log('Screenshots taken: mobile_top.png, mobile_scrolled.png');
})();
