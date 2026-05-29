import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to http://localhost:5173...");
  await page.goto('http://localhost:5173');

  console.log("Clicking the 'Generator 🚀' navigation button...");
  await page.getByRole('button', { name: 'Generator' }).click();

  console.log("Filling the prompt textarea...");
  await page.getByRole('textbox').fill('A decentralized voting app using React and Solidity');

  console.log("Waiting for 'Generate Stack' button...");
  const generateButton = page.getByRole('button', { name: 'Generate Stack' });
  await generateButton.waitFor({ state: 'visible' });

  console.log("Clicking 'Generate Stack'...");
  await generateButton.click();

  console.log("Taking screenshot of the loading state...");
  await page.screenshot({ path: '/home/jules/verification/screenshots/loading-state-real.png' });

  console.log("Screenshot saved!");
  await browser.close();
})();
