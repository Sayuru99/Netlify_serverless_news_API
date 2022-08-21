const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async function (event, context) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath,
        headless: true,
    });
    const private = await browser.createIncognitoBrowserContext();
    const page = await private.newPage();

    await page.goto('https://www.helakuru.lk/esana/news/');

    // clicking notification enable button
    //   const cancel = await page.$('.close');
    //   await cancel.click();

      await page.screenshot({ path: "screenshot.png" });

    const t = await page.evaluate(() => {
        const y = Array.from(
            document.querySelectorAll('#news_item_container > div > div > div.col-8 > div > p'),
            p => p.innerText,
        );

        return [y];
    });

    //console.log(t);

    for (let i = 0; i < t.length; i++) {
        x = t[i]
        const results = await page.$$eval('#news_item_container > div > div > div.col-8 > div > p', (news) => {
            return news.map(link => {
                return {
                    text: link.innerText,
                }
            });
        });

        //console.log(results)

        await browser.close();

        return {
            statusCode: 200,
            body: JSON.stringify({
                results
                
            })
        }
    }
}