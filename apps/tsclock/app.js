const locale = require("locale");
const storage = require('Storage');

const is12Hour = (storage.readJSON("setting.json", 1) || {})["12hour"];
const color = (storage.readJSON("tsclock.json", 1) || {})["color"] || 65504 /* yellow */;


/**********************************************/
const scale = g.getWidth() / 176;

const screen = {
  width: g.getWidth(),
  height: g.getHeight() - 24,
};

const center = {
  x: screen.width / 2,
  y: screen.height / 2,
};

function d02(value) {
  return ('0' + value).substr(-2);
}

function renderRect(g) {
  g.fillRect(center.x + 35 * scale, center.y - 70 * scale, center.x + 88 * scale, center.y + 90 * scale);
}

function renderText(g) {
  const now = new Date();

  const hour = d02(now.getHours() - (is12Hour && now.getHours() > 12 ? 12 : 0));
  const minutes = d02(now.getMinutes());
  const day = d02(now.getDate());
  const month = d02(now.getMonth() + 1);
  const year = now.getFullYear();

  const month2 = locale.month(now, 3);
  const dow = locale.dow(now, 3);

  /* draw time */
  g.setFontAlign(1, 0).setFont("Vector", 95 * scale);
  g.drawString(hour, center.x + 35 * scale, center.y - 31 * scale);
  g.drawString(minutes, center.x + 35 * scale, center.y + 46 * scale);

  /* draw sidebar */
  g.setFontAlign(1, 0).setFont("Vector", 18 * scale);
  g.drawString(dow, center.x + 80 * scale, center.y - 42 * scale);
  g.drawString(day,center.x + 75 * scale, center.y - 20 * scale)
  g.drawString(month2, center.x + 80 * scale, center.y + 1 * scale);
  g.drawString(year, center.x + 85 * scale, center.y + 35 * scale);

}

const buf = Graphics.createArrayBuffer(screen.width, screen.height, 1, {
  msb: true
});

function draw() {

  const img = {
    width: screen.width,
    height: screen.height,
    transparent: 0,
    bpp: 1,
    buffer: buf.buffer
  };

  // clear screen area
  g.clearRect(0, 24, g.getWidth(), g.getHeight());

  // render outside text with sidebar
  buf.clear();
  renderText(buf.setColor(1));
  renderRect(buf.setColor(0));
  g.setColor(color).drawImage(img, 0, 24);

  // render sidebar with inside text
  buf.clear();
  renderRect(buf.setColor(1));
  renderText(buf.setColor(0));
  g.setColor(color).drawImage(img, 0, 24);
}


/* Minute Ticker *************************************/

let ticker;

function stopTick() {
  if (ticker) {
    clearTimeout(ticker);
    ticker = undefined;
  }
}

function startTick(run) {
  stopTick();
  run();
  ticker = setTimeout(() => startTick(run), 60000 - (Date.now() % 60000));
  // ticker = setTimeout(() => startTick(run), 3000);
}

/* Init **********************************************/

g.clear();
startTick(draw);

Bangle.on('lcdPower', (on) => {
  if (on) {
    startTick(draw);
  } else {
    stopTick();
  }
});

Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.setUI("clock");
