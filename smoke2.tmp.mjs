// 冒烟测试 CDP 驱动（临时文件，测完删除）
// T5 渲染到 t5-done 时截图（演播室预设），T6 裁剪导出到 done 收尾。
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const OUT_DIR = 'C:/Users/12280/AppData/Local/Temp/wavecraft-smoke2';
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/t') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><html><body><script type="module" src="/smoke2-bundle.tmp.js"></script></body></html>');
    return;
  }
  if (url === '/smoke2-bundle.tmp.js') {
    res.writeHead(200, { 'content-type': 'text/javascript' });
    res.end(readFileSync('smoke2-bundle.tmp.js'));
    return;
  }
  res.writeHead(404);
  res.end('nf');
});
await new Promise((r) => server.listen(5199, '127.0.0.1', r));

const chrome = spawn(
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1280,720',
    '--remote-debugging-port=9223',
    `--user-data-dir=${OUT_DIR}/profile`,
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets = null;
for (let i = 0; i < 40; i++) {
  await sleep(500);
  try {
    const res = await fetch('http://127.0.0.1:9223/json');
    targets = await res.json();
    if (targets.some((t) => t.type === 'page')) break;
  } catch { /* retry */ }
}
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r, j) => {
  ws.onopen = r;
  ws.onerror = j;
});
let msgId = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
const evalJs = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:5199/t' });

let shotTaken = false;
const t0 = Date.now();
let status = null;
while (Date.now() - t0 < 300000) {
  await sleep(1500);
  status = await evalJs('window.__e2e || null');
  if (status === 't5-done' && !shotTaken) {
    shotTaken = true;
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot.result?.data) {
      writeFileSync(`${OUT_DIR}/studio.png`, Buffer.from(shot.result.data, 'base64'));
      console.log('SCREENSHOT: studio.png');
    }
    await evalJs('window.__go = 1'); // 放行 T6
  }
  if (status === 'done' || status === 'error') break;
}
if (status !== 'done') {
  const err = await evalJs('window.__err || null');
  console.log('TEST_STATUS:', status || 'timeout');
  if (err) console.log('TEST_ERROR:', err);
} else {
  console.log('TEST_RESULT:', await evalJs('JSON.stringify(window.__r)'));
}

try { ws.close(); } catch { /* ignore */ }
spawn('taskkill', ['/F', '/T', '/PID', String(chrome.pid)], { stdio: 'ignore' }).on('error', () => {});
server.close();
console.log('DRIVER_DONE');
process.exit(0);
