/**
 * SEC+ 701 CTF — flag grader (Google Apps Script, bound to a Google Sheet).
 *
 * Students submit lab flags from the game page. Each submission becomes a row
 * in the "Submissions" tab marked correct or wrong, and the "Gradebook" tab is
 * rebuilt with one row per student and a score out of 8.
 *
 * INSTRUCTOR COPY: the ANSWER_KEY below holds the real flags.
 * Keep it private. Do not commit it to the public repository.
 */

const ANSWER_KEY = {
  // lab id      flag
  recon:     'SEC701{recon_14a68443}',
  integrity: 'SEC701{integrity_ae1a66f5}',
  phish:     'SEC701{phish_ea6a8487}',
  ssh:       'SEC701{ssh_78e29eba}',
  harden:    'SEC701{harden_52a014cd}',
  webshell:  'SEC701{webshell_76308e39}',
  risk:      'SEC701{risk_e097d93b}',
  dns:       'SEC701{dns_ca57ae78}',
};

const LAB_NAMES = {
  recon: 'Attack Surface Recon',
  integrity: 'Trust, but Verify',
  phish: 'Dissect the Phish',
  ssh: 'Brute Force at 2 A.M.',
  harden: 'Harden the Edge Server',
  webshell: 'Web Shell Hunt',
  risk: 'Audit the Risk Register',
  dns: 'Data Leaving by DNS',
};
const LAB_ORDER = Object.keys(LAB_NAMES);
const SUB_HEADERS = ['Time', 'Student', 'Lab', 'Flag submitted', 'Result', 'Game handle'];

/** Students' submissions arrive here (POST from the game page). */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let data;
    try { data = JSON.parse(e.postData.contents); } catch (err) { return reply({ok: false, error: 'bad request'}); }
    const name = clean(data.name, 60).replace(/\s+/g, ' ');
    const handle = clean(data.handle, 20);
    const flags = (Array.isArray(data.flags) ? data.flags : []).slice(0, 20).map(f => clean(f, 80)).filter(String);
    if (name.length < 2) return reply({ok: false, error: 'missing name'});
    if (!flags.length) return reply({ok: false, error: 'no flags'});

    const sheet = tab('Submissions', SUB_HEADERS);
    const now = new Date();
    const results = flags.map(flag => {
      const m = /^SEC701\{([a-z]+)_[0-9a-f]{8}\}$/i.exec(flag);
      const lab = m ? m[1].toLowerCase() : '';
      const key = ANSWER_KEY[lab] || '';
      const ok = !!key && key.toLowerCase() === flag.toLowerCase();
      sheet.appendRow([now, safe(name), LAB_NAMES[lab] || '(unknown)', safe(flag), ok ? '✅ correct' : '❌ wrong', safe(handle)]);
      return {flag: flag, lab: LAB_NAMES[lab] || null, ok: ok};
    });
    rebuildGradebook();
    return reply({ok: true, results: results});
  } finally {
    lock.releaseLock();
  }
}

/** Open the web app URL in a browser to check it is running. */
function doGet() {
  const missing = LAB_ORDER.filter(k => !ANSWER_KEY[k]);
  return reply({ok: true, service: 'SEC+ 701 CTF grader', answerKeyComplete: missing.length === 0, missing: missing});
}

/** Run once from the Apps Script editor to create the tabs (optional; doPost also creates them). */
function setup() {
  tab('Submissions', SUB_HEADERS);
  rebuildGradebook();
}

/** One row per student: a ✅ for each lab with at least one correct flag, then the total. */
function rebuildGradebook() {
  const subs = tab('Submissions', SUB_HEADERS);
  const rows = subs.getLastRow() > 1 ? subs.getRange(2, 1, subs.getLastRow() - 1, 5).getValues() : [];
  const students = {};
  rows.forEach(([time, student, labName, , result]) => {
    const id = String(student).replace(/^'/, '').trim();
    if (!id) return;
    const k = id.toLowerCase();
    const s = students[k] || (students[k] = {name: id, solved: {}, last: time});
    if (time > s.last) s.last = time;
    const lab = LAB_ORDER.find(x => LAB_NAMES[x] === labName);
    if (lab && String(result).indexOf('✅') === 0) s.solved[lab] = true;
  });
  const header = ['Student'].concat(LAB_ORDER.map(k => LAB_NAMES[k]), ['Score (of 8)', 'Last submission']);
  const out = Object.keys(students).sort().map(k => {
    const s = students[k];
    const marks = LAB_ORDER.map(lab => (s.solved[lab] ? '✅' : ''));
    return [safe(s.name)].concat(marks, [marks.filter(String).length, s.last]);
  });
  const gb = tab('Gradebook', header);
  gb.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (gb.getLastRow() > 1) gb.getRange(2, 1, gb.getLastRow() - 1, gb.getLastColumn()).clearContent();
  if (out.length) gb.getRange(2, 1, out.length, header.length).setValues(out);
}

// ── helpers ──
function tab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}
function clean(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max); }
/** Stop spreadsheet formula injection: text starting with = + - @ is stored as plain text. */
function safe(v) { const s = String(v); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function reply(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
