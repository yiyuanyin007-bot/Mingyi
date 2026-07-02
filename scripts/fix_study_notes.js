const http = require('http');

function sendRequest(body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port: 10086, path: '/command', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function readChunk(session, key, offset, size) {
  const code = "(() => { const data = localStorage.getItem('" + key + "'); return data.substring(" + offset + ", " + (offset + size) + "); })()";
  const res = await sendRequest({ action: 'evaluate', args: { code }, session });
  return res.data?.value || '';
}

async function writeChunk(session, key, data) {
  const code = "(() => { if (!window._migrationData) window._migrationData = {}; if (!window._migrationData['" + key + "']) window._migrationData['" + key + "'] = ''; window._migrationData['" + key + "'] += " + JSON.stringify(data) + "; return window._migrationData['" + key + "'].length; })()";
  const res = await sendRequest({ action: 'evaluate', args: { code }, session });
  return res.data?.value || 0;
}

async function finalize(session, key) {
  const code = "(() => { const data = window._migrationData && window._migrationData['" + key + "']; if (data) { localStorage.setItem('" + key + "', data); return 'written: ' + data.length; } return 'no data'; })()";
  const res = await sendRequest({ action: 'evaluate', args: { code }, session });
  return res.data?.value || '';
}

async function verify(session, key) {
  const code = "(() => { const data = localStorage.getItem('" + key + "'); return data ? data.length : 0; })()";
  const res = await sendRequest({ action: 'evaluate', args: { code }, session });
  return res.data?.value || 0;
}

async function fix() {
  const session8000 = 'note-recovery-8000';
  const session8100 = 'note-recovery';
  
  // 重置 8100 的 migration buffer
  await sendRequest({ action: 'evaluate', args: { code: 'window._migrationData = {}; "reset"' }, session: session8100 });
  
  const total = 7981;
  const chunkSize = 2000;
  let offset = 0;
  
  console.log('Fixing A01_study_notes (' + total + ' bytes)...');
  while (offset < total) {
    const chunk = await readChunk(session8000, 'A01_study_notes', offset, chunkSize);
    if (!chunk) break;
    await writeChunk(session8100, 'A01_study_notes', chunk);
    offset += chunk.length;
    process.stdout.write('\r  ' + offset + '/' + total + ' (' + Math.round(offset/total*100) + '%)  ');
  }
  console.log();
  
  const r = await finalize(session8100, 'A01_study_notes');
  console.log('  Result:', r);
  const v = await verify(session8100, 'A01_study_notes');
  console.log('  Verified length:', v);
}

fix().catch(console.error);
