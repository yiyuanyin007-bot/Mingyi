const http = require('http');

function sendRequest(body) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 10086,
      path: '/command',
      method: 'POST',
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

async function migrate() {
  const session8000 = 'note-recovery-8000';
  const session8100 = 'note-recovery';
  
  await sendRequest({ action: 'evaluate', args: { code: 'window._migrationData = {}; "init"' }, session: session8100 });
  
  console.log('Migrating A01_card_notes from 8000 to 8100...');
  const total1 = 45514;
  const chunkSize = 2000;
  let offset = 0;
  
  while (offset < total1) {
    const chunk = await readChunk(session8000, 'A01_card_notes', offset, chunkSize);
    if (!chunk) break;
    await writeChunk(session8100, 'A01_card_notes', chunk);
    offset += chunk.length;
    process.stdout.write('\r  ' + offset + '/' + total1 + ' (' + Math.round(offset/total1*100) + '%)  ');
  }
  console.log();
  
  const r1 = await finalize(session8100, 'A01_card_notes');
  console.log('  Result:', r1);
  const v1 = await verify(session8100, 'A01_card_notes');
  console.log('  Verified length:', v1);
  
  console.log('Migrating A01_study_notes from 8000 to 8100...');
  const total2 = 4426;
  offset = 0;
  
  while (offset < total2) {
    const chunk = await readChunk(session8000, 'A01_study_notes', offset, chunkSize);
    if (!chunk) break;
    await writeChunk(session8100, 'A01_study_notes', chunk);
    offset += chunk.length;
    process.stdout.write('\r  ' + offset + '/' + total2 + ' (' + Math.round(offset/total2*100) + '%)  ');
  }
  console.log();
  
  const r2 = await finalize(session8100, 'A01_study_notes');
  console.log('  Result:', r2);
  const v2 = await verify(session8100, 'A01_study_notes');
  console.log('  Verified length:', v2);
  
  console.log('\nMigration complete!');
  console.log('Card notes:', v1, 'bytes (expected 45514)');
  console.log('Study notes:', v2, 'bytes (expected 4426)');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
