const log = require('debug')('mediaklikk');
const puppeteer = require('puppeteer');

const getLink = async src => {
  log('Creating chrome instance');
  const instance = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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
  await page.goto(src);

  log('Extracting content');
  const uri = await page.evaluate(() => {
    const content = document.body.innerHTML;
    const regex = /"file": "([\s\S]*.m3u8)/g;
    const [_, file] = regex.exec(content);
    const uri = file.replace(/\\/g, '');
    return uri;
  });
  log(uri);

  const link = `http:${uri}`;
  log(`Found link ${link}`);

  log('Closing chrome instance');
  await instance.close();
  return link;
};

module.exports = async (req, res) => {
  const streamId = req.url.split('/')[1];
  if (streamId === 'favicon.ico') return null;
  log(`Looking for '${streamId}'`);
  const src = `http://player.mediaklikk.hu/playernew/player.php?video=${streamId}`;
  const url = await getLink(src);
  log(`Result ${streamId} => ${url}`);
  const Location = url.replace(
    'index.m3u8',
    streamId === 'mtv4live' ? 'VID_854x480_HUN.m3u8' : '02.m3u8'
  );
  res.writeHead(302, { Location });
  res.end();
};
