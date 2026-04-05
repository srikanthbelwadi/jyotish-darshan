const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.goto('http://localhost:4000', {waitUntil: 'networkidle0'});
    await page.type('#cityInput', 'Lon');
    await new Promise(r => setTimeout(r, 1000));
    await page.select('#langSelect', 'kn');
    await new Promise(r => setTimeout(r, 1000));
    await browser.close();
})();
