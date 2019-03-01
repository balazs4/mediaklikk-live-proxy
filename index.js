const log = require('debug')('mediaklikk');
const puppeteer = require('puppeteer');

const getLink = async (src, streamId, headless) => {
  log('Creating chrome instance');
  const instance = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    defaultViewport: { width: 1600, height: 900 },
    headless: true
  });

  log('Creating page object');
  const page = await instance.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    const type = request.resourceType();
    if (['images', 'font', 'stylesheet'].some(x => x === type)) request.abort();
    else request.continue();
  });

  log(`Opening ${src}`);
  const headless = await page.evaluate(() => navigator.userAgent);
  await page.setUserAgent(headless.replace('HeadlessChrome', 'Chrome'));

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7,hu;q=0.6'
  });
  await page.goto(src);
  await new Promise(resolve => setTimeout(resolve, 5000));
  log(`Screenshoting ${src}`);
  await page.screenshot({ path: `${streamId}.png` });

  log('Closing chrome instance');
  await instance.close();
  return null;
};

module.exports = async (req, res) => {
  const streamId = req.url.split('/')[1];
  if (streamId === 'favicon.ico') return null;
  log(`Looking for '${streamId}'`);
  const src = `http://player.mediaklikk.hu/playernew/player.php?video=${streamId}`;
  const url = await getLink(src, streamId, true);
  log(`Result ${streamId} => ${url}`);
  res.end();
};
