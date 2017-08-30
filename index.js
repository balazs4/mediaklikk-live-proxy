const log = require('debug')('mediaklikk');
const phantom = require('phantom');

const getLink = async src => {
  log('Creating phantom instance');
  const instance = await phantom.create([
    '--ignore-ssl-errors=yes',
    '--load-images=no'
  ]);

  log('Creating page object');
  const page = await instance.createPage();

  log(`Opening ${src}`);
  await page.open(src);

  log('Extracting content');
  const content = await page.property('content');

  const [rawLink] = content.match(/(http:.*\.m3u8)/g);
  const link = rawLink.replace(/\\\//g, '/');
  log(`Found link ${link}`);

  log('Closing phantom instance');
  await instance.exit();
  return link;
};

module.exports = async (req, res) => {
  const streamId = req.url.split('/')[1];
  if (streamId === 'favicon.ico') return null;
  log(`Looking for '${streamId}'`);
  const src = `http://player.mediaklikk.hu/playernew/player.php?video={streamId}`;
  const url = await getLink(src);
  log(`Result ${streamId} => ${url}`);

  res.writeHead(302, {
    Location: url.replace('index.m3u8', '02.m3u8')
  });
  res.end();
};
