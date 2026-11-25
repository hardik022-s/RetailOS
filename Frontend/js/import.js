/* ==========================================================================
   RetailOS - Data Upload Panel (CSV Import, Photo OCR, Manual Entry)
   ========================================================================== */

const localDateStr = (daysAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const IM = { dragging: false, fileName: '', file: null, rows: [], error: '', imported: null, entries: [], busy: '', sheetUrl: '', csvText: '', fromLabel: '', date: localDateStr(0) };const PH = { status: 'idle', progress: 0, stage: '', preview: '', rows: [], error: '', dragging: false, file: null };
const MU = { name: '', n: '', price: '', more: false, cost: '', category: 'General', shelf: '180', error: '' };

const CATEGORIES = [
  'Dairy & Eggs',
  'Fresh Produce',
  'Bakery',
  'Staples',
  'Snacks',
  'Beverages',
  'Household',
  'Personal Care',
  'General',
];

const tile = 'rounded-3xl border border-line/80 bg-white p-6 sm:p-7';

const logEntry = (e) => {
  IM.entries = [{ ...e, id: uid(), time: Date.now() }, ...IM.entries].slice(0, 8);
};

/* Delete an entry from "Recently added" and take back the data it added:
   new items are removed and items it changed go back to how they were. */
ACT['entry-del'] = (el) => {
  const e = IM.entries.find((x) => x.id === el.dataset.id);
  if (!e) return;
  const msg = 'Delete this entry and the items it added? This cannot be undone.';
  if (!window.confirm(window.i18n ? window.i18n.tr(msg) : msg)) return;
  if (e.undo) {
    const gone = new Set(e.undo.addedIds || []);
    const back = new Map((e.undo.before || []).map((p) => [p.id, p]));
    S.products = S.products.filter((p) => !gone.has(p.id)).map((p) => back.get(p.id) || p);
    UI.cart = UI.cart.filter((l) => !gone.has(l.productId));
    persist();
  }
  IM.entries = IM.entries.filter((x) => x.id !== e.id);
  toast(`Deleted ${e.text}`);
  renderApp();
};

const existingRow = (r) =>
  S.products.some((p) => (r.barcode && p.barcode === r.barcode) || p.name.toLowerCase() === r.name.toLowerCase());

function csvCard() {
  const body =
    IM.rows.length === 0
      ? `<div role="button" tabindex="0" data-act="csv-browse" data-drop="csv" class="mt-4 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition ${IM.dragging ? 'border-brand bg-brand-soft' : 'border-ink/25 bg-canvas/60 hover:border-brand/60 hover:bg-brand-soft/40'}">
          ${icon('fileUp', `size-14 text-ink/60 transition ${IM.dragging ? '-translate-y-1 text-brand' : ''}`)}
          <p class="mt-5 text-base font-semibold">Drag & drop your file here</p>
          <p class="mt-1.5 max-w-md text-sm text-muted">Sales history or inventory from your POS, Excel, Word or PDF. We convert it to our template automatically and match items by barcode or name.</p>
          <p class="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-ink/70">${['CSV', 'Excel', 'Word', 'PDF', 'Google Sheet'].map((t) => `<span class="rounded-full border border-line bg-white px-2.5 py-1">${t}</span>`).join('')}</p>
          <p class="mt-4 flex items-center gap-2 text-xs text-subtle"><span class="font-semibold text-ink/70 underline underline-offset-2">Browse files</span></p>
          ${IM.busy ? `<p class="mt-4 flex items-center gap-2 text-xs font-medium text-brand"><span class="size-3 animate-spin rounded-full border-2 border-brand border-t-transparent"></span>${esc(IM.busy)}</p>` : ''}
          ${IM.imported ? `<p class="mt-4 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">Last import: ${IM.imported.added} new · ${IM.imported.updated} updated</p>` : ''}
          ${IM.error ? `<p class="mt-4 max-w-md text-xs text-danger">${esc(IM.error)}</p>` : ''}
          <input id="csv-input" data-ch="csv-file" type="file" accept=".csv,.tsv,.txt,.xlsx,.xlsm,.xls,.ods,.docx,.pdf,text/csv,text/plain,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document" class="hidden" />
        </div>
        <form data-submit="gs-fetch" class="mt-3 flex flex-col gap-2 sm:flex-row">
          <input data-f="gs-url" data-in="gs-url" value="${esc(IM.sheetUrl)}" placeholder="Or paste a Google Sheet link (shared as Anyone with the link)" class="${field} flex-1" />
          <button type="submit" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep">${icon('download', 'size-4')} Fetch sheet</button>
        </form>`
      : `<div class="mt-4 animate-fade-up">
          <div class="flex items-center justify-between rounded-lg bg-canvas px-3 py-2.5 text-sm">
            <span class="flex items-center gap-2">${icon('file', 'text-brand')}<span class="font-medium">${esc(IM.fileName)}</span><span class="text-muted">· ${IM.rows.length} rows</span></span>
            <button data-act="csv-remove" class="text-xs text-muted hover:text-ink">Remove</button>
          </div>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand">
            <span class="font-medium">${icon('check', 'mr-1 inline size-3.5')}Converted to template format</span>
            <button data-act="csv-download-converted" class="font-semibold underline underline-offset-2">Download converted CSV</button>
          </div>
          <div class="mt-3 max-h-56 overflow-auto rounded-lg border border-line">
            <table class="w-full text-left text-xs">
              <thead class="sticky top-0 bg-white text-subtle">
                <tr>${['Item', 'Barcode (optional)', 'Category', 'Unit', 'Stock', 'Price', 'Cost', 'Status'].map((h) => `<th class="px-3 py-2 font-medium">${h}</th>`).join('')}</tr>
              </thead>
              <tbody class="divide-y divide-line">
                ${IM.rows.map((r) => `<tr>
                  <td class="px-3 py-2 font-medium">${esc(r.name)}</td>
                  <td class="px-3 py-2 font-mono text-muted">${r.barcode ? esc(r.barcode) : '—'}</td>
                  <td class="px-3 py-2">${esc(r.category || 'General')}</td>
                  <td class="px-3 py-2">${esc(r.unit || 'pc')}</td>
                  <td class="px-3 py-2">${r.stock ?? '—'}</td>
                  <td class="px-3 py-2">${r.price != null ? `₹${r.price}` : '—'}</td>
                  <td class="px-3 py-2">${r.cost != null ? `₹${r.cost}` : '—'}</td>
                  <td class="px-3 py-2"><span class="rounded px-1.5 py-0.5 text-[10px] font-medium ${existingRow(r) ? 'bg-amber-soft text-amber' : 'bg-brand-soft text-brand'}">${existingRow(r) ? 'Update' : 'New'}</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <button data-act="csv-import" class="mt-4 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep">
            ${icon('check')} Import ${IM.rows.length} items
          </button>
        </div>`;

return `<section class="${tile} lg:col-span-8">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Upload sales & inventory data</h2>
      <button data-act="csv-template" class="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline">${icon('download', 'size-3.5')} CSV template</button>
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-canvas/70 px-3 py-2">
      <div>
        <label for="csv-date" class="text-xs font-semibold text-ink">Dataset date</label>
        <p class="text-[11px] text-muted">Pick the date this sales sheet belongs to (up to 14 days back)</p>
      </div>
      <input
        id="csv-date"
        data-ch="csv-date"
        type="date"
        value="${esc(IM.date)}"
        max="${localDateStr(0)}"
        min="${localDateStr(14)}"
        class="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink outline-none focus:border-brand"
      />
    </div>
    ${body}
  </section>`;
}

function photoCard() {
  const valid = PH.rows.filter((r) => r.name.trim() && Number(r.qty) > 0).length;
  let inner;
  if (PH.status === 'idle' || PH.status === 'error') {
    inner = `<div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
      <div role="button" tabindex="0" data-act="ph-browse" data-drop="photo" class="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-5 transition ${PH.dragging ? 'border-brand bg-brand-soft' : 'border-ink/20 bg-canvas/60 hover:border-brand/50 hover:bg-brand-soft/40'}">
        <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">${icon('camera', 'size-6')}</span>
        <span><span class="block text-sm font-semibold">Drop a photo or browse</span><span class="block text-xs text-muted">JPG or PNG · clear, well-lit, one item per line works best</span></span>
      </div>
      <button data-act="ph-camera" class="flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep">${icon('camera')} Take photo</button>
      <input id="ph-file" data-ch="ph-file" type="file" accept="image/*" class="hidden" />
      <input id="ph-cam" data-ch="ph-file" type="file" accept="image/*" capture="environment" class="hidden" />
      ${PH.error ? `<p class="text-xs text-danger sm:col-span-2">${esc(PH.error)}</p>` : ''}
    </div>`;
  } else {
    const side = `<div class="relative overflow-hidden rounded-2xl bg-canvas">
      ${PH.preview ? `<img src="${PH.preview}" alt="Uploaded stock list" class="h-full max-h-56 w-full object-cover" />` : ''}
      ${PH.status === 'reading' ? '<span class="absolute inset-x-2 top-1/2 h-0.5 animate-scan bg-brand shadow-[0_0_18px_6px] shadow-brand/40"></span>' : ''}
    </div>`;
    const main =
      PH.status === 'reading'
        ? `<div class="flex flex-col justify-center">
            <p id="ph-stage" class="text-sm font-medium">${esc(PH.stage)}</p>
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div id="ph-bar" class="h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all duration-300" style="width:${Math.max(6, PH.progress)}%"></div>
            </div>
            <p class="mt-2 text-xs text-subtle"><span id="ph-pct">${PH.progress}</span>% · runs privately in your browser</p>
          </div>`
        : `<div class="min-w-0">
            <div class="grid grid-cols-[1fr_70px_80px_28px] gap-2 px-1 text-[11px] font-medium text-subtle"><span>Item</span><span>Qty</span><span>Price ₹</span><span></span></div>
            <ul class="mt-1.5 max-h-56 space-y-1.5 overflow-y-auto pr-1">
              ${PH.rows.map((r) => `
                <li class="grid grid-cols-[1fr_70px_80px_28px] items-center gap-2">
                  <span class="relative">
                    <input data-f="ph-${r.id}-name" data-in="ph-row" data-id="${r.id}" data-k="name" value="${esc(r.name)}" placeholder="Item name" class="w-full rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:bg-white" />
                    <span class="absolute right-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full ${r.matchId ? 'bg-brand' : 'bg-amber'}" title="${r.matchId ? 'Matches an existing item' : 'New item'}"></span>
                  </span>
                  <input data-f="ph-${r.id}-qty" data-in="ph-row" data-id="${r.id}" data-k="qty" type="number" min="0" value="${esc(r.qty)}" class="rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm outline-none focus:border-brand focus:bg-white" />
                  <input data-f="ph-${r.id}-price" data-in="ph-row" data-id="${r.id}" data-k="price" type="number" min="0" value="${esc(r.price)}" class="rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm outline-none focus:border-brand focus:bg-white" />
                  <button data-act="ph-del" data-id="${r.id}" aria-label="Remove row" class="grid size-7 place-items-center rounded-lg text-subtle hover:bg-danger-soft hover:text-danger">${icon('close', 'size-3.5')}</button>
                </li>`).join('')}
            </ul>
            ${PH.error ? `<p class="mt-2 text-xs text-amber">${esc(PH.error)}</p>` : ''}
            <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-4 text-xs text-muted">
                <button data-act="ph-add" class="flex items-center gap-1 font-medium text-brand hover:underline">${icon('plus', 'size-3.5')} Add row</button>
                <span class="flex items-center gap-1.5"><span class="size-1.5 rounded-full bg-brand"></span>existing</span>
                <span class="flex items-center gap-1.5"><span class="size-1.5 rounded-full bg-amber"></span>new</span>
              </div>
              <button data-act="ph-import" class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110">${icon('check')} Import ${valid} items</button>
            </div>
          </div>`;
    inner = `<div class="mt-5 grid gap-5 md:grid-cols-[160px_1fr]">${side}${main}</div>`;
  }
  return `<section class="${tile} lg:col-span-8">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold">Upload dataset from a photo</h2>
        <p class="mt-0.5 text-xs text-subtle">Snap a stock register, handwritten list or supplier bill. We'll read the items for you.</p>
      </div>
      ${PH.status !== 'idle' ? '<button data-act="ph-reset" class="shrink-0 text-xs text-muted hover:text-ink">Start over</button>' : ''}
    </div>
    ${inner}
  </section>`;
}

function recentCard() {
  return `<section class="${tile} lg:col-span-4 lg:row-span-2">
    <h2 class="text-sm font-semibold">Recently added</h2>
    ${IM.entries.length === 0
      ? `<div class="mt-6 flex flex-col items-center py-6 text-center text-sm text-subtle">${icon('inbox', 'mb-3 size-8 text-line')}Uploads, photos and manual entries will appear here.</div>`
      : `<ul class="mt-4 space-y-1">${IM.entries.map((e) => `<li class="flex items-center gap-3 rounded-xl px-2 py-2.5">
          <span class="grid size-8 shrink-0 place-items-center rounded-lg ${e.kind === 'manual' ? 'bg-amber-soft text-amber' : 'bg-brand-soft text-brand'}">${icon(e.kind === 'csv' ? 'file' : e.kind === 'scan' ? 'camera' : 'edit', 'size-4')}</span>
          <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">${esc(e.text)}</span><span class="block truncate text-xs text-subtle">${esc(e.sub)}</span></span>
          <span class="text-[11px] text-subtle">${clock(e.time)}</span>
          <button data-act="entry-del" data-id="${e.id}" title="Delete this entry and the data it added" aria-label="Delete entry" class="grid size-7 shrink-0 place-items-center rounded-lg text-subtle transition hover:bg-danger-soft hover:text-danger">${icon('trash', 'size-4')}</button>
        </li>`).join('')}</ul>`}
  </section>`;
}

function manualCard() {
  const match = S.products.find((p) => p.name.toLowerCase() === MU.name.trim().toLowerCase() || p.barcode === MU.name.trim());
  const f = `mt-1.5 ${field} bg-canvas`;
  return `<section class="${tile} lg:col-span-12">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-sm font-semibold">Manual upload</h2>
        <p class="mt-0.5 text-xs text-subtle">Add stock for an existing item or create a new one</p>
      </div>
      <button type="button" data-act="mu-more" class="text-xs font-medium text-brand hover:underline">${MU.more ? 'Fewer details' : 'More details'}</button>
    </div>
    <form data-submit="manual" class="mt-5">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto] lg:items-end">
        <label class="text-xs font-medium text-muted">Item name or barcode
          <input list="manual-items" data-f="mu-name" data-in="mu" data-k="name" value="${esc(MU.name)}" placeholder="e.g., Amul Butter 100g" class="${f}" />
          <datalist id="manual-items">${S.products.map((p) => `<option value="${esc(p.name)}"></option>`).join('')}</datalist>
        </label>
        <label class="text-xs font-medium text-muted">Quantity
          <input data-f="mu-n" data-in="mu" data-k="n" type="number" min="1" value="${esc(MU.n)}" placeholder="0" class="${f}" />
        </label>
        <label class="text-xs font-medium text-muted">Selling price (₹)
          <input data-f="mu-price" data-in="mu" data-k="price" type="number" min="0" step="0.5" value="${esc(MU.price)}" placeholder="0" class="${f}" />
        </label>
        <label class="text-xs font-medium text-muted">Actual price (₹)
          <input data-f="mu-cost" data-in="mu" data-k="cost" type="number" min="0" step="0.5" value="${esc(MU.cost)}" placeholder="0" class="${f}" />
        </label>
        <button type="submit" class="relative flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-brand to-brand-deep px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110">
          ${icon('plus')} ${match ? 'Add stock' : 'Add item'}${icon('spark', 'absolute -right-1 -top-1 size-8 text-white/20')}
        </button>
      </div>
      ${MU.more
        ? `<div class="mt-4 grid animate-fade-up gap-4 sm:grid-cols-2">
            <label class="text-xs font-medium text-muted">Category<select data-ch="mu" data-k="category" class="${f}">${CATEGORIES.map((c) => `<option ${c === MU.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
            <label class="text-xs font-medium text-muted">Shelf life (days)<input data-f="mu-shelf" data-in="mu" data-k="shelf" type="number" min="1" value="${esc(MU.shelf)}" class="${f}" /></label>
          </div>`
        : ''}
      <p class="mt-3 min-h-4 text-xs">
        ${MU.error
          ? `<span class="text-danger">${esc(MU.error)}</span>`
          : match
          ? `<span class="text-brand">Existing item · ${qty(match.stock, match.unit)} in stock</span>`
          : MU.name.trim()
          ? '<span class="text-muted">New item will be created</span>'
          : ''}
      </p>
    </form>
  </section>`;
}

function importPanel() {
  return `<div class="grid grid-cols-1 gap-6 lg:grid-flow-dense lg:grid-cols-12">${csvCard()}${photoCard()}${recentCard()}${manualCard()}</div>`;
}

function renderImport() {
  const r = $('#import-root');
  if (r) withFocus(() => { r.innerHTML = importPanel(); });
}

/* ---------- CSV Handlers ---------- */
ACT['csv-browse'] = () => $('#csv-input')?.click();
CHG['csv-file'] = (el) => { handleCsv(el.files[0]); el.value = ''; };
CHG['csv-date'] = (el) => { IM.date = el.value || localDateStr(0); };
ACT['csv-import'] = async () => {
  const count = IM.rows.length;
  const r = await act.importRows(IM.rows, { file: IM.file, kind: 'csv', date: IM.date });
  if (!r) return;
  IM.imported = r;
  toast(`Imported ${count} items for ${IM.date} · ${r.added} new, ${r.updated} updated`);
  logEntry({ kind: 'csv', text: IM.fileName, sub: `${IM.date} · ${r.added} new · ${r.updated} updated`, undo: { addedIds: r.addedIds, before: r.before } });
  IM.rows = [];
  IM.file = null;
  IM.csvText = '';
  renderImport();
};
ACT['csv-remove'] = () => { IM.rows = []; IM.file = null; IM.csvText = ''; IM.error = ''; renderImport(); };
ACT['csv-template'] = () =>
  downloadFile(
    'retailos-inventory.csv',
    toCsv([
      ['name', 'barcode (optional)', 'category', 'unit', 'stock', 'price', 'cost', 'shelf_life', 'daily_sales'],
      ...S.products.map((p) => [p.name, p.barcode, p.category, p.unit, p.stock, p.price, p.cost, p.shelfLife, p.history[13]]),
    ])
  );

/* ---------- Photo / OCR Handlers ---------- */
const OCR_SKIP = /^(item|items|qty|quantity|total|subtotal|grand|date|invoice|bill|gst|tax|amount|rate|s\.?no|sr|particulars|description|thank)/i;

function findMatch(name) {
  const n = name.toLowerCase();
  return S.products.find((p) => p.name.toLowerCase() === n) || S.products.find((p) => p.keywords.some((k) => n.includes(k)));
}

function parseOcr(text) {
  let id = 0;
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/[|_~*]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 2 && !OCR_SKIP.test(l))
    .map((line) => {
      const tokens = line.split(' ');
      const nums = [];
      while (tokens.length) {
        const t = tokens[tokens.length - 1].replace(/^(rs\.?|₹|x)/i, '').replace(/[,/-]$/g, '').replace(/,/g, '');
        if (/^\d+(\.\d+)?$/.test(t)) {
          nums.unshift(Number(t));
          tokens.pop();
        } else if (/^(rs\.?|₹|x|pcs?|kg|nos?|pkts?|@)$/i.test(t)) {
          tokens.pop();
        } else break;
      }
      const name = tokens.join(' ').replace(/^\d+[.)]\s*/, '').trim();
      if ((name.match(/[a-z]/gi) || []).length < 2 || nums.length === 0) return null;
      const match = findMatch(name);
      const [q, price] = nums.length >= 2 ? [nums[0], nums[1]] : [nums[0], undefined];
      return {
        id: id++,
        name: match ? match.name : name,
        qty: String(q),
        price: price != null ? String(price) : match ? String(match.price) : '',
        matchId: match && match.id,
      };
    })
    .filter(Boolean);
}

let ocrScriptPromise = null;
function loadOcr() {
  if (window.Tesseract) return Promise.resolve();
  if (!ocrScriptPromise) {
    ocrScriptPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = CFG.OCR_SCRIPT;
      s.onload = res;
      s.onerror = () => {
        ocrScriptPromise = null;
        rej(new Error('OCR engine script could not be loaded'));
      };
      document.head.appendChild(s);
    });
  }
  return ocrScriptPromise;
}

async function readPhoto(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    PH.error = 'Please choose an image (JPG, PNG or a phone photo).';
    PH.status = 'error';
    return renderImport();
  }
  PH.file = file;
  PH.preview = URL.createObjectURL(file);
  PH.status = 'reading';
  PH.progress = 0;
  PH.error = '';
  PH.stage = 'Loading text recognition…';
  renderImport();

  try {
    await loadOcr();
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          PH.stage = 'Reading items from photo…';
          PH.progress = Math.round(m.progress * 100);
          const bar = $('#ph-bar');
          if (bar) bar.style.width = `${Math.max(6, PH.progress)}%`;
          const pct = $('#ph-pct');
          if (pct) pct.textContent = PH.progress;
          const st = $('#ph-stage');
          if (st) st.textContent = PH.stage;
        }
      },
    });
    const { data } = await worker.recognize(file);
    await worker.terminate();
    const parsed = parseOcr(data.text);
    PH.rows = parsed.length ? parsed : [{ id: 0, name: '', qty: '', price: '' }];
    if (!parsed.length) {
      PH.error = 'We could not find item lines. Add them below or try a sharper photo.';
    }
    PH.status = 'review';
  } catch (e) {
    PH.status = 'error';
    PH.error = 'Text recognition could not start. Check your connection or try entering items below.';
  }
  renderImport();
}

const phReset = () => {
  PH.status = 'idle';
  PH.rows = [];
  PH.preview = '';
  PH.error = '';
  PH.file = null;
  renderImport();
};

ACT['ph-browse'] = () => $('#ph-file')?.click();
ACT['ph-camera'] = () => $('#ph-cam')?.click();
CHG['ph-file'] = (el) => { readPhoto(el.files[0]); el.value = ''; };
ACT['drop-photo'] = (el, e) => {
  if (e.type === 'dragover') {
    if (!PH.dragging) { PH.dragging = true; renderImport(); }
    return;
  }
  PH.dragging = false;
  if (e.type === 'drop') readPhoto(e.dataTransfer.files[0]);
  else renderImport();
};
ACT['ph-reset'] = phReset;
ACT['ph-add'] = () => {
  PH.rows = [...PH.rows, { id: Date.now(), name: '', qty: '', price: '' }];
  renderImport();
};
ACT['ph-del'] = (el) => {
  PH.rows = PH.rows.filter((r) => String(r.id) !== el.dataset.id);
  renderImport();
};
INP['ph-row'] = (el) => {
  const r = PH.rows.find((x) => String(x.id) === el.dataset.id);
  if (!r) return;
  r[el.dataset.k] = el.value;
  if (el.dataset.k === 'name') {
    const m = findMatch(el.value);
    r.matchId = m && m.id;
    renderImport();
  } else {
    const b = $('[data-act="ph-import"]');
    if (b) b.lastChild.textContent = ` Import ${PH.rows.filter((x) => x.name.trim() && Number(x.qty) > 0).length} items`;
  }
};

ACT['ph-import'] = async () => {
  const valid = PH.rows.filter((r) => r.name.trim() && Number(r.qty) > 0);
  if (!valid.length) {
    PH.error = 'Add at least one item with a quantity.';
    return renderImport();
  }
  const res = await act.importRows(
    valid.map((r) => {
      const p = S.products.find((x) => x.id === r.matchId);
      return {
        name: p ? p.name : r.name.trim(),
        stock: (p ? p.stock : 0) + Number(r.qty),
        price: Number(r.price) > 0 ? Number(r.price) : p && p.price,
        unit: p ? p.unit : 'pc',
      };
    }),
    { file: PH.file, kind: 'scan' }
  );
  if (!res) return;
  toast(`Photo imported · ${res.updated} restocked, ${res.added} new`);
  logEntry({ kind: 'scan', text: 'Photo dataset', sub: `${valid.length} items · ${res.added} new`, undo: { addedIds: res.addedIds, before: res.before } });
  phReset();
};

/* ---------- Manual Entry Form Handlers ---------- */
INP.mu = (el) => {
  MU[el.dataset.k] = el.value;
  if (el.dataset.k === 'name') {
    const p = S.products.find((x) => x.name.toLowerCase() === el.value.trim().toLowerCase());
    if (p) {
      MU.price = String(p.price);
      MU.cost = String(p.cost);
      MU.category = p.category;
    }
  }
  renderImport();
};

CHG.mu = (el) => { MU[el.dataset.k] = el.value; };
ACT['mu-more'] = () => { MU.more = !MU.more; renderImport(); };

SUB.manual = async () => {
  const match = S.products.find(
    (p) => p.name.toLowerCase() === MU.name.trim().toLowerCase() || p.barcode === MU.name.trim()
  );
  const q = Number(MU.n), pr = Number(MU.price);
  const bad = (m) => { MU.error = m; renderImport(); };

  if (!MU.name.trim()) return bad('Enter an item name or barcode.');
  if (!q || q <= 0) return bad('Enter a quantity greater than 0.');
  if (!match && (!pr || pr <= 0)) return bad('Enter a selling price for the new item.');
  MU.error = '';

  if (match) {
    const snapshot = JSON.parse(JSON.stringify(match));
    const cs = Number(MU.cost);
    if ((pr > 0 && pr !== match.price) || (cs > 0 && cs !== match.cost)) {
      await act.saveProduct({ ...match, price: pr > 0 ? pr : match.price, cost: cs > 0 ? cs : match.cost });
    }
    await act.stockIn(match.id, q);
    logEntry({ kind: 'manual', text: match.name, sub: `+${qty(q, match.unit)} stocked in`, undo: { before: [snapshot] } });
  } else {
    const sl = Number(MU.shelf) || 180;
    const newId = uid();
    const ok = await act.saveProduct({
      id: newId,
      name: MU.name.trim(),
      category: MU.category,
      unit: 'pc',
      barcode: `890199${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`,
      price: pr,
      cost: Number(MU.cost) || Math.round(pr * 0.8 * 100) / 100,
      gst: 0,
      stock: q,
      shelfLife: sl,
      expQty: 0,
      expDays: sl,
      history: Array(14).fill(0),
      keywords: [MU.name.trim().toLowerCase().split(/\s+/)[0]],
      markdown: 0,
    });
    if (!ok) return;
    logEntry({ kind: 'manual', text: MU.name.trim(), sub: `New item · ${q} pcs at ${inr(pr)}`, undo: { addedIds: [newId] } });
  }

  MU.name = '';
  MU.n = '';
  MU.price = '';
  MU.cost = '';
  renderImport();
};
