/* ==========================================================================
   RetailOS - Upload any dataset: Excel, Word, PDF, CSV or a Google Sheet link.
   Every source is read in the browser and converted into the same template
   (name, barcode, category, unit, stock, price, cost, shelf_life, daily_sales).
   Barcode is optional: items without one get a code automatically.
   ========================================================================== */

const TEMPLATE_HEAD = ['name', 'barcode (optional)', 'category', 'unit', 'stock', 'price', 'cost', 'shelf_life', 'daily_sales'];

/* ---------- Lazy library loader (only fetched when a matching file is used) ---------- */
const libLoads = {};
function loadLib(key, src, ready) {
  if (ready()) return Promise.resolve();
  if (!libLoads[key]) {
    libLoads[key] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = () => {
        delete libLoads[key];
        rej(new Error('lib'));
      };
      document.head.appendChild(s);
    });
  }
  return libLoads[key];
}

/* "Rice 5kg 10 120" -> ['Rice 5kg', 10, 120]; lines without numbers stay as one cell. */
function splitFreeLine(line) {
  const tokens = String(line).replace(/[|_~*]/g, ' ').replace(/\s+/g, ' ').trim().split(' ');
  const nums = [];
  while (tokens.length > 1) {
    const t = tokens[tokens.length - 1].replace(/^(rs\.?|₹|x)/i, '').replace(/,/g, '');
    if (/^\d+(\.\d+)?$/.test(t)) { nums.unshift(Number(t)); tokens.pop(); }
    else if (/^(rs\.?|₹|x|pcs?|nos?|pkts?|@|-)$/i.test(t)) tokens.pop();
    else break;
  }
  const name = tokens.join(' ').replace(/^\d+[.)]\s*/, '').trim();
  return nums.length && /[a-z]/i.test(name) ? [name, ...nums] : [String(line).trim()];
}

/* Array of text lines (Word paragraphs, OCR lines) -> CSV text. */
function linesToCsv(lines) {
  lines = lines.map((l) => String(l).trim()).filter(Boolean);
  if (lines.filter((l) => /\t|;|\||,/.test(l)).length >= lines.length / 2) return lines.join('\n');
  let rows = lines.map(splitFreeLine);
  const withNums = rows.filter((r) => r.length > 1);
  if (withNums.length) rows = withNums; // drop title lines like "Stock list"
  return toCsv(rows);
}

/* ---------- Readers: each returns CSV text ---------- */
async function excelToCsv(file) {
  await loadLib('xlsx', CFG.XLSX_SCRIPT, () => window.XLSX);
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  for (const name of wb.SheetNames) {
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
    if (csv.replace(/[,\s]/g, '')) return csv;
  }
  return '';
}

async function wordToCsv(file) {
  await loadLib('mammoth', CFG.MAMMOTH_SCRIPT, () => window.mammoth);
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tables = [...doc.querySelectorAll('table')].sort((a, b) => b.rows.length - a.rows.length);
  if (tables.length) {
    return toCsv([...tables[0].rows].map((tr) => [...tr.cells].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
  }
  return linesToCsv([...doc.querySelectorAll('p,li')].map((p) => p.textContent));
}

async function pdfToCsv(file) {
  await loadLib('pdfjs', CFG.PDFJS_SCRIPT, () => window.pdfjsLib);
  pdfjsLib.GlobalWorkerOptions.workerSrc = CFG.PDFJS_WORKER;
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const rows = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    const lines = [];
    content.items
      .filter((it) => it.str && it.str.trim())
      .forEach((it) => {
        const y = it.transform[5];
        let ln = lines.find((l) => Math.abs(l.y - y) < 3);
        if (!ln) lines.push((ln = { y, parts: [] }));
        ln.parts.push({ x: it.transform[4], w: it.width, s: it.str });
      });
    lines.sort((a, b) => b.y - a.y).forEach((ln) => {
      const cells = [];
      let end = null;
      ln.parts.sort((a, b) => a.x - b.x).forEach((p) => {
        if (end != null && p.x - end < 6 && cells.length) cells[cells.length - 1] += p.s;
        else cells.push(p.s);
        end = p.x + p.w;
      });
      const clean = cells.map((c) => c.trim()).filter(Boolean);
      if (clean.length > 1) rows.push(clean);
      else if (clean.length) rows.push(splitFreeLine(clean[0]));
    });
  }
  if (rows.length) {
    const multi = rows.filter((r) => r.length > 1);
    return toCsv(multi.length ? multi : rows);
  }
  return pdfScanToCsv(pdf); // scanned PDF: no text layer, read it with OCR
}

async function pdfScanToCsv(pdf) {
  await loadOcr();
  const worker = await Tesseract.createWorker('eng');
  const lines = [];
  for (let n = 1; n <= Math.min(pdf.numPages, 3); n++) {
    const page = await pdf.getPage(n);
    const vp = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    const { data } = await worker.recognize(canvas);
    lines.push(...data.text.split(/\r?\n/).filter((l) => !OCR_SKIP.test(l.trim())));
  }
  await worker.terminate();
  return linesToCsv(lines);
}

/* ---------- Google Sheets ---------- */
function sheetUrls(link) {
  link = String(link || '').trim();
  if (!/^https?:\/\//i.test(link)) return [];
  const gid = (link.match(/[#&?]gid=(\d+)/) || [])[1];
  const pub = link.match(/\/spreadsheets\/d\/e\/([\w-]+)/);
  if (pub) return [`https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub?output=csv${gid ? `&gid=${gid}` : ''}`];
  const m = link.match(/\/spreadsheets\/d\/([\w-]+)/);
  if (!m) return [link]; // a plain link to a .csv file
  const base = `https://docs.google.com/spreadsheets/d/${m[1]}`;
  return [`${base}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`, `${base}/export?format=csv${gid ? `&gid=${gid}` : ''}`];
}

async function sheetToCsv(link) {
  for (const url of sheetUrls(link)) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      if (text.trim() && !/^\s*<(!doctype|html)/i.test(text)) return text;
    } catch { /* try the next address */ }
  }
  throw new Error('sheet');
}

/* ---------- Convert whatever was read into the template ---------- */
const blank = (v) => (v == null ? '' : v);
const templateRows = (rows) => rows.map((r) => [r.name, blank(r.barcode), blank(r.category), blank(r.unit), blank(r.stock), blank(r.price), blank(r.cost), blank(r.shelfLife), blank(r.dailySales)]);

async function loadDataset(source, label, reader) {
  IM.error = '';
  IM.imported = null;
  IM.busy = `Reading ${label}…`;
  renderImport();
  try {
    const csv = await reader();
    const parsed = parseCsv(csv);
    if (!parsed.length) throw new Error('empty');
    const base = String(source).replace(/\.[^.]+$/, '') || 'dataset';
    IM.csvText = toCsv([TEMPLATE_HEAD, ...templateRows(parsed)]);
    IM.fileName = source;
    IM.fromLabel = label;
    IM.file = new File([IM.csvText], `${base}-template.csv`, { type: 'text/csv' });
    IM.rows = parsed;
  } catch (e) {
    IM.error =
      e.message === 'sheet'
        ? 'Could not open this Google Sheet. Set sharing to "Anyone with the link can view" and try again.'
        : e.message === 'lib'
          ? 'Could not load the file reader. Check your internet connection and try again.'
          : 'Could not find any item names in this file. Each row needs an item name (any column order is fine).';
  }
  IM.busy = '';
  renderImport();
}

/* Picks the reader for a file, or an error message for files we cannot read. */
function datasetReader(file) {
  const n = file.name.toLowerCase();
  if (/\.(xlsx|xlsm|xls|ods)$/.test(n)) return { label: 'Excel file', read: () => excelToCsv(file) };
  if (/\.docx$/.test(n)) return { label: 'Word file', read: () => wordToCsv(file) };
  if (/\.pdf$/.test(n)) return { label: 'PDF', read: () => pdfToCsv(file) };
  if (/\.doc$/.test(n)) return { error: 'Old .doc files are not supported. In Word use File > Save As > .docx and upload that.' };
  if (/\.(png|jpe?g|webp|gif|zip|rar)$/.test(n)) return { error: 'Photos go in "Upload dataset from a photo" below. Zip files are not supported.' };
  return { label: 'file', read: () => readFile(file) };
}

/* Replaces the CSV-only handler in import.js */
function handleCsv(file) {
  if (!file) return;
  const r = datasetReader(file);
  if (r.error) {
    IM.error = r.error;
    return renderImport();
  }
  return loadDataset(file.name, r.label, r.read);
}

/* Upload button in the top bar: read, convert to the template and import in one step. */
async function topbarImport(name, label, reader) {
  toast(`Reading ${label}…`);
  try {
    const rows = parseCsv(await reader());
    if (!rows.length) throw new Error('empty');
    const base = String(name).replace(/\.[^.]+$/, '') || 'dataset';
    const file = new File([toCsv([TEMPLATE_HEAD, ...templateRows(rows)])], `${base}-template.csv`, { type: 'text/csv' });
    const r = await act.importRows(rows, { file, kind: 'csv' });
    if (!r) return;
    toast(`${name}: ${r.added} new, ${r.updated} updated`);
    logEntry({ kind: 'csv', text: name, sub: `${r.added} new · ${r.updated} updated`, undo: { addedIds: r.addedIds, before: r.before } });
    renderImport();
  } catch (e) {
    toast(
      e.message === 'sheet'
        ? 'Could not open this Google Sheet. Set sharing to "Anyone with the link can view" and try again.'
        : e.message === 'lib'
          ? 'Could not load the file reader. Check your internet connection and try again.'
          : 'Could not find any item names in this file. Each row needs an item name (any column order is fine).'
    );
  }
}

INP['gs-url'] = (el) => { IM.sheetUrl = el.value; };
SUB['gs-fetch'] = () => {
  const link = (IM.sheetUrl || '').trim();
  if (!/^https?:\/\//i.test(link)) {
    IM.error = 'Paste the full Google Sheet link, starting with https://';
    return renderImport();
  }
  return loadDataset('google-sheet', 'Google Sheet', () => sheetToCsv(link));
};
ACT['csv-download-converted'] = () => downloadFile('retailos-converted-template.csv', IM.csvText || toCsv([TEMPLATE_HEAD]));
