import puppeteer from 'puppeteer';
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const txt = msg.text();
            if (txt.includes('Failed to load resource')) return;
            console.log('BROWSER_ERROR:', txt);
        }
    });

    try {
        await page.goto('http://localhost:5173/');
        // wait for the 'LandingPage' to load. We can just click the first button.
        await page.waitForSelector('button');
        
        await page.evaluate(async () => {
            const form = document.querySelector('form');
            if(form) {
               const btn = form.querySelector('button');
               if(btn) btn.click();
            } else {
               const btn = Array.from(document.querySelectorAll('button')).find(b=>b.innerText.toLowerCase().includes('login')||b.innerText.toLowerCase().includes('enter')||b.innerText.toLowerCase().includes('view'));
               if(btn) btn.click();
            }
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        // click login if it was just a landing screen transition
        await page.evaluate(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(b=>b.innerText.toLowerCase().includes('login')||b.innerText.includes('View Cosmic')||b.innerText.includes('Srikanth'));
            if(btn) btn.click();
        });
        
        await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
        console.error("Puppeteer Script Error:", e.message);
    } finally {
        await browser.close();
    }
})();
