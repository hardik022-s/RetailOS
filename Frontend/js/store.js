/* ==========================================================================
   RetailOS - Data Store, Persistence, Synchronization & Business Logic
   ========================================================================== */

/* ---------- utility functions ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;
const avg = (a) => (a && a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const isToday = (t) => new Date(t).toDateString() === new Date().toDateString();
const clock = (t) => new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initials(name) {
  if (!name) return 'RK';
  return name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'RK';
}

function qty(n, unit) {
  const noPlural = ['kg', 'g', 'L', 'ml'];
  const formatted = Math.round((n || 0) * 10) / 10;
  return `${formatted} ${unit}${n === 1 || noPlural.includes(unit) ? '' : 's'}`;
}

function weekday(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

/* ---------- retail forecasting & inventory algorithms ---------- */
function trendPct(p) {
  if (!p || !p.history || p.history.length < 14) return 0;
  const last = avg(p.history.slice(-7));
  const prev = avg(p.history.slice(-14, -7));
  return prev ? ((last - prev) / prev) * 100 : 0;
}

function forecastDaily(p) {
  if (p && Array.isArray(p.lgbmForecast) && p.lgbmForecast.length) {
    return avg(p.lgbmForecast);
  }
  if (!p || !p.history || !p.history.length) return 0;
  const t = Math.max(-30, Math.min(50, trendPct(p))) / 100;
  return avg(p.history.slice(-7)) * (1 + t * 0.5);
}

const _lgbmPending = new Set();

async function ensureLgbmForecast(p) {
  if (!p || !net.connected) return null;
  const sig = `${p.price}|${(p.history || []).join(',')}`;
  if (p.lgbmSig === sig && Array.isArray(p.lgbmForecast) && p.lgbmForecast.length === 7) {
    return p.lgbmForecast;
  }
  if (_lgbmPending.has(p.id)) return null;

  _lgbmPending.add(p.id);
  try {
    const res = await api.post('/ai/forecast/', {
      price: p.price,
      history: p.history || [],
    });
    if (res && Array.isArray(res.forecast) && res.forecast.length) {
      p.lgbmForecast = res.forecast;
      p.lgbmModel = res.model || 'LightGBM';
      p.lgbmSig = sig;
      persist();
      renderApp();
      return p.lgbmForecast;
    }
  } catch (err) {
    console.warn('LightGBM forecast fallback to local JS:', err);
  } finally {
    _lgbmPending.delete(p.id);
  }
  return null;
}

function coverDays(p) {
  const f = forecastDaily(p);
  return f ? p.stock / f : Infinity;
}

function runOutLabel(p) {
  if (p.stock <= 0) return 'Out of stock';
  const f = forecastDaily(p);
  if (!f) return 'No recent sales';
  const days = p.stock / f;
  if (days < 1) {
    const t = new Date(Date.now() + days * 14 * 3600e3);
    const close = new Date();
    close.setHours(22, 0, 0, 0);
    return t > close ? 'Tomorrow morning' : `Today ${clock(t.getTime())}`;
  }
  if (days < 2) return 'Tomorrow';
  return `In ${Math.floor(days)} days`;
}

function recommend(p) {
  const f = forecastDaily(p);
  const cover = p.shelfLife <= 2 ? 1 : Math.min(p.shelfLife - 1, 7);
  const target = Math.ceil(f * cover);
  const q = Math.max(0, target - p.stock);
  const needs = f > 0 && p.stock < f * 2 && q > 0;
  const risk = p.shelfLife <= 4 ? 'HIGH' : p.shelfLife <= 10 ? 'MEDIUM' : 'LOW';
  return { f, cover, qty: q, needs, risk, profit: q * (p.price - p.cost), spend: q * p.cost };
}

/* Dead stock = stock on the shelf with (almost) no sales in the last 14 days.
   An item that was added or restocked within the last 14 days has not had time to sell yet, so it is not dead. */
const DEAD_AFTER_MS = 14 * 24 * 3600e3;
const isDead = (p) =>
  p.stock > 0 &&
  p.history.slice(-14).reduce((s, v) => s + v, 0) <= 1 &&
  !(p.stockedAt && Date.now() - p.stockedAt < DEAD_AFTER_MS);
const isExpiring = (p) => p.expQty > 0 && p.expDays <= 2;

function billTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = 0;
  return { subtotal, tax, total: subtotal };
}

const billProfit = (b) => (b.items || []).reduce((s, i) => s + (i.price - i.cost) * i.qty, 0);

/* ---------- CSV Import & Export Utilities ---------- */
/* Flexible CSV reader: any delimiter, any column names/order, header row optional. */
function parseCsvRows(text, delim) {
  const rows = [];
  let row = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(cur.trim()); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur.trim());
      cur = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur.trim());
  if (row.some((v) => v !== '')) rows.push(row);
  return rows;
}

function detectDelimiter(text) {
  const sample = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 15);
  let best = ',';
  let bestScore = 0;
  [',', ';', '\t', '|'].forEach((d) => {
    const counts = sample.map((l) => l.split(d).length - 1).filter((n) => n > 0);
    if (!counts.length) return;
    // The usual number of separators per line; title or note lines with none do not matter.
    const usual = counts.sort((x, y) => counts.filter((n) => n === y).length - counts.filter((n) => n === x).length)[0];
    const score = counts.filter((n) => n === usual).length * 10 + usual;
    if (score > bestScore) { bestScore = score; best = d; }
  });
  return best;
}

/* Checked in this order; each column is claimed by the first field that matches it. */
const csvFieldHints = [
  ['barcode', ['barcode', 'sku', 'ean', 'upc', 'itemcode', 'productcode', 'productid', 'itemid', 'code', 'बारकोड', 'कोड']],
  ['name', ['productname', 'itemname', 'name', 'product', 'item', 'description', 'particular', 'article', 'goods', 'title', 'नाम', 'आइटम', 'सामान', 'उत्पाद', 'विवरण']],
  ['gst', ['gst', 'gstrate', 'taxrate', 'tax', 'vat']],
  ['cost', ['cost', 'costprice', 'purchaseprice', 'buyprice', 'buyingprice', 'actualprice', 'purchase', 'wholesale', 'लागत', 'खरीद']],
  ['price', ['price', 'mrp', 'sellingprice', 'saleprice', 'rate', 'selling', 'retail', 'कीमत', 'दाम', 'मूल्य', 'भाव', 'एमआरपी']],
  ['shelfLife', ['shelflife', 'expirydays', 'expiry', 'shelf']],
  ['dailySales', ['dailysales', 'avgdailysales', 'velocity', 'sold', 'unitssold', 'qtysold', 'sales', 'sale']],
  ['stock', ['stock', 'qty', 'quantity', 'onhand', 'balance', 'inventory', 'available', 'closing', 'count', 'units', 'स्टॉक', 'मात्रा', 'संख्या', 'बचा']],
  ['category', ['category', 'categ', 'department', 'group', 'type', 'section', 'श्रेणी', 'प्रकार', 'कैटेगरी']],
  ['unit', ['unit', 'uom', 'measure', 'इकाई', 'यूनिट']],
];

const csvNum = (v) => {
  if (v == null) return undefined;
  const m = String(v).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
};
const isPureNum = (v) => /^[₹$]?\s*-?\d+(\.\d+)?\s*(%|rs\.?|inr)?$/i.test(String(v).replace(/,/g, '').trim());
const isDateLike = (v) => /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(String(v).trim());

function parseCsv(text) {
  text = String(text || '').replace(/^\uFEFF/, '');
  if (text.startsWith('PK')) return []; // .xlsx is a zip file, not text
  let rows = parseCsvRows(text, detectDelimiter(text));
  if (!rows.length) return [];

  const norm = (h) => String(h).toLowerCase().replace(/[^a-z\u0900-\u097f]/g, '');
  // Title lines or notes above the real heading row (common in Excel/Word/PDF files): start at the row that looks most like headings.
  const headScore = (r) => {
    const hs = r.map(norm);
    return csvFieldHints.filter(([, hints]) => hs.some((h) => h && (hints.includes(h) || hints.some((k) => k.length >= 3 && h.includes(k))))).length;
  };
  let start = 0;
  let best = headScore(rows[0]);
  for (let i = 1; i < Math.min(rows.length, 15); i++) {
    const sc = headScore(rows[i]);
    if (sc >= 2 && sc > best && !rows[i].some(isPureNum)) { best = sc; start = i; }
  }
  if (start === 0 && best < 2) {
    // Headings we do not know by name: the first all-text row, with a few cells, that sits right above rows holding numbers.
    const filled = (r) => r.filter((v) => v !== '').length;
    for (let i = 1; i < Math.min(rows.length - 1, 15); i++) {
      if (filled(rows[i]) >= 2 && filled(rows[i]) > filled(rows[0]) && !rows[i].some(isPureNum) && rows[i + 1].some(isPureNum)) { start = i; break; }
    }
  }
  if (start > 0) rows = rows.slice(start);

  // One column holding lines like "Rice 5kg 10 120": split the trailing numbers into their own columns.
  if (Math.max(...rows.map((r) => r.length)) === 1) {
    const split = rows.map(([line]) => {
      const t = String(line).replace(/\s+/g, ' ').trim().split(' ');
      const nums = [];
      while (t.length > 1 && /^(rs\.?|₹)?\d+(\.\d+)?$/i.test(t[t.length - 1].replace(/,/g, ''))) nums.unshift(t.pop().replace(/^(rs\.?|₹)/i, '').replace(/,/g, ''));
      return nums.length ? [t.join(' '), ...nums.slice(0, 3)] : [String(line)];
    });
    if (split.some((r) => r.length > 1)) rows = split;
  }

  const width = Math.max(...rows.map((r) => r.length));

  // Try to map columns from the first row's headings.
  const col = {};
  const taken = new Set();
  const head = rows[0].map(norm);
  csvFieldHints.forEach(([key, hints]) => {
    let i = head.findIndex((h, idx) => !taken.has(idx) && h && hints.includes(h));
    if (i < 0) i = head.findIndex((h, idx) => !taken.has(idx) && h && hints.some((k) => k.length >= 3 && h.includes(k)));
    if (i >= 0) { col[key] = i; taken.add(i); }
  });
  const hasHeader = Object.keys(col).length > 0 && rows[0].filter((v) => isPureNum(v)).length === 0;
  let data = hasHeader ? rows.slice(1) : rows;
  if (!hasHeader) {
    Object.keys(col).forEach((k) => delete col[k]);
    taken.clear();
    // Unrecognised heading row (all text while the data below has numbers): skip it.
    if (rows.length > 1 && !rows[0].some(isPureNum) && rows[1].some(isPureNum)) data = rows.slice(1);
  }
  if (!data.length) return [];
  // Serial-number / id columns are never stock or price.
  head.forEach((h, i) => { if (/^(s|sr|sl)?(no|num|number)$|^serial|^id$|^index$|^slno$|^srno$/.test(h)) taken.add(i); });

  // Anything still unmapped: look at what the values actually are.
  const colVals = (i) => data.map((r) => r[i]).filter((v) => v != null && v !== '');
  const numericShare = (i) => {
    const v = colVals(i);
    return v.length ? v.filter(isPureNum).length / v.length : 0;
  };
  const textual = (i) => {
    const v = colVals(i);
    return v.length && numericShare(i) < 0.4 && v.filter(isDateLike).length / v.length < 0.5;
  };
  if (col.name == null) {
    let i = [...Array(width).keys()].find((x) => !taken.has(x) && textual(x));
    if (i == null) i = 0;
    col.name = i;
    taken.add(i);
  }
  // Headings we could not read: take stock and price from the remaining number columns, in order.
  if (hasHeader && (col.stock == null || col.price == null)) {
    const spare = [...Array(width).keys()].filter((x) => !taken.has(x) && numericShare(x) >= 0.6);
    ['stock', 'price'].forEach((k) => {
      if (col[k] == null && spare.length) { col[k] = spare.shift(); taken.add(col[k]); }
    });
  }
  // Headerless file: fill stock, price, cost from the number columns in order.
  if (!hasHeader) {
    // A 1,2,3... counter column is a serial number, not data.
    for (let x = 0; x < width; x++) {
      const v = colVals(x).map(Number);
      if (!taken.has(x) && (v.length >= 3 || (v.length === 2 && v[0] === 1)) && v.every((n, i) => n === v[0] + i)) taken.add(x);
    }
    const spare = [...Array(width).keys()].filter((x) => !taken.has(x) && numericShare(x) >= 0.6);
    ['stock', 'price', 'cost'].forEach((k) => {
      if (col[k] == null && spare.length) { col[k] = spare.shift(); taken.add(col[k]); }
    });
  }

  const get = (r, k) => (col[k] != null ? r[col[k]] : undefined);
  return data
    .map((r) => ({
      name: String(get(r, 'name') || '').trim(),
      barcode: get(r, 'barcode') || undefined,
      category: get(r, 'category') || undefined,
      unit: get(r, 'unit') || undefined,
      stock: csvNum(get(r, 'stock')),
      price: csvNum(get(r, 'price')),
      cost: csvNum(get(r, 'cost')),
      gst: csvNum(get(r, 'gst')),
      shelfLife: csvNum(get(r, 'shelfLife')),
      dailySales: csvNum(get(r, 'dailySales')),
    }))
    .filter((r) => r.name && /[a-z\u0900-\u097f]/i.test(r.name) && !/^(grand\s*|sub\s*)?total\b/i.test(r.name));
}

function toCsv(rows) {
  return rows
    .map((r) =>
      r
        .map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v))
        .join(',')
    )
    .join('\n');
}

function downloadFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsText(file);
  });
}

/* ---------- Clean Initial State (No Demo Dataset) ---------- */
function createEmptyState() {
  return {
    products: [],
    bills: [],
    pos: [],
    wastage: [],
    notices: [],
    dismissed: [],
    posReady: true,
    nextBill: 1001,
    nextPO: 501,
    userName: '',
    storeName: 'My Retail Store',
  };
}

/* ---------- global state container ---------- */
const STORAGE_KEY = 'retailos-state-v5';

let S = createEmptyState();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

function initLocalState() {
  try {
    // Wipe legacy demo caches from earlier versions
    localStorage.removeItem('retailos-state-v2');
    localStorage.removeItem('retailos-state-v3');
    localStorage.removeItem('retailos-state-v4');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      S = { ...createEmptyState(), ...parsed };
      return;
    }
  } catch (e) {
    /* ignore */
  }
  const prevUser = S && S.userName ? S.userName : '';
  const prevStore = S && S.storeName ? S.storeName : '';
  S = createEmptyState();
  if (prevUser) S.userName = prevUser;
  if (prevStore) S.storeName = prevStore;
}
initLocalState();

const remote = () => net.connected && !!api.token;

async function loadState() {
  initLocalState();

  if (net.connected) {
    try {
      const response = await api.get('/inventory/products/');
      const items = Array.isArray(response)
        ? response
        : response && response.results
        ? response.results
        : [];

      if (items.length > 0) {
        S.products = items.map((p, i) => {
          const shelfLife = Number(p.shelf_life_days ?? 180);
          const stock = Number(p.current_stock ?? 0);
          return {
            id: String(p.id || `sku-${i + 1}`),
            name: p.name,
            category: p.category_name || (typeof p.category === 'string' ? p.category : 'General'),
            unit: p.unit || 'pc',
            price: Number(p.selling_price ?? 0),
            cost: Number(p.cost_price ?? 0),
            gst: Number(p.gst ?? 0),
            stock,
            shelfLife,
            expQty: shelfLife <= 7 ? Math.min(4, stock) : 0,
            expDays: shelfLife <= 7 ? 2 : shelfLife,
            history: Array.isArray(p.history) ? p.history : Array(14).fill(0),
            keywords: [String(p.name || '').toLowerCase()],
            barcode: p.barcode || `SKU-${i + 1}`,
            markdown: 0,
            stockedAt: Date.now(),
          };
        });
        persist();
      }
    } catch (err) {
      console.error('Failed to load inventory from backend:', err);
    }
  }
}

function applyUser(user) {
  if (!user) return;
  if (user.name) S.userName = user.name;
  if (user.store) S.storeName = user.store;
  persist();
}

/* ---------- toast notification system ---------- */
const toasts = [];

function toast(text) {
  const id = uid();
  toasts.push({ id, text, fresh: true });
  if (toasts.length > 3) toasts.shift();
  renderToasts();
  setTimeout(() => {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx >= 0) {
      toasts.splice(idx, 1);
      renderToasts();
    }
  }, 2800);
}

function notice(text, tone) {
  return { id: uid(), text, time: Date.now(), read: false, tone };
}

/* ---------- Business Calculations for Today ---------- */
function useToday() {
  const today = S.bills.filter((b) => isToday(b.time));
  const yesterday = S.bills.filter((b) => {
    const d = new Date(b.time);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return d.toDateString() === y.toDateString();
  });

  const sales = today.reduce((s, b) => s + b.total, 0);
  const subtotal = today.reduce((s, b) => s + b.subtotal, 0);
  const ySales = yesterday.reduce((s, b) => s + b.total, 0);
  const delta = ySales ? ((sales - ySales) / ySales) * 100 : sales ? 100 : 0;
  const profit = today.reduce((s, b) => s + billProfit(b), 0);
  const margin = sales ? (profit / sales) * 100 : 0;

  const pay = {
    UPI: today.filter((b) => b.payment === 'UPI').reduce((s, b) => s + b.total, 0),
    Cash: today.filter((b) => b.payment === 'Cash').reduce((s, b) => s + b.total, 0),
    Khata: today.filter((b) => b.payment === 'Khata').reduce((s, b) => s + b.total, 0),
  };

  const wasteToday = S.wastage.filter((w) => isToday(w.time)).reduce((s, w) => s + w.loss, 0);

  return { sales, subtotal, profit, margin, delta, today, pay, wasteToday };
}

/* ---------- Action Handlers (Dual Mode: Local & Backend Sync) ---------- */
const act = {
  async checkout(cart, payment, customer) {
    if (!customer || !customer.trim()) {
      toast('Customer name is required to complete checkout', 'error');
      return null;
    }
    
    const items = [];
    for (const line of cart) {
      const p = S.products.find((x) => x.id === line.productId);
      if (!p || line.qty <= 0) continue;
      if (line.qty > p.stock) {
        toast(`Only ${qty(p.stock, p.unit)} of ${p.name} in stock`);
        return null;
      }
      items.push({
        productId: p.id,
        name: p.name,
        unit: p.unit,
        qty: line.qty,
        price: p.price,
        cost: p.cost,
        gst: p.gst,
      });
    }
    if (!items.length) return null;

    let bill = null;
    if (remote()) {
      try {
        bill = await api.post('/bills/checkout', { items, payment, customer: customer || undefined });
      } catch (e) {
        toast('Backend sync failed, saved locally.');
      }
    }

    if (!bill) {
      bill = {
        id: uid(),
        no: S.nextBill++,
        time: Date.now(),
        items,
        ...billTotals(items),
        payment,
        customer: customer || undefined,
        settled: false,
      };
    }

    // Deduct stock and update notices locally
    const alerts = [];
    S.products = S.products.map((p) => {
      const line = items.find((i) => i.productId === p.id);
      if (!line) return p;
      const stock = Math.max(0, p.stock - line.qty);
      const next = { ...p, stock, expQty: Math.min(p.expQty, stock) };
      if (recommend(next).needs && !recommend(p).needs) {
        alerts.push(notice(`${p.name} dropped to ${qty(stock, p.unit)}. Restock suggested.`, 'danger'));
      }
      return next;
    });

    S.bills.push(bill);
    S.notices = [...alerts, ...S.notices];
    persist();
    return bill;
  },

  async raisePO(productId, q) {
    const p = S.products.find((x) => x.id === productId);
    if (!p || q <= 0) return;

    let po = null;
    if (remote()) {
      try {
        po = await api.post('/orders/po', { productId, qty: q, cost: q * p.cost });
      } catch (e) {
        // Fallback to local
      }
    }

    if (!po) {
      po = {
        id: uid(),
        no: S.nextPO++,
        productId,
        qty: q,
        cost: q * p.cost,
        time: Date.now(),
        status: 'Pending',
      };
    }

    S.pos.unshift(po);
    S.notices.unshift(notice(`PO #${po.no} approved: ${qty(q, p.unit)} of ${p.name}.`, 'brand'));
    persist();
    toast(`PO approved: ${qty(q, p.unit)} of ${p.name}`);
    renderApp();
    return po;
  },

  async receivePO(poId) {
    const po = S.pos.find((x) => x.id === poId);
    if (!po || po.status === 'Received') return;
    const p = S.products.find((x) => x.id === po.productId);

    if (remote()) {
      try {
        await api.post(`/orders/po/${poId}/receive`);
      } catch (e) {
        // local fallback
      }
    }

    po.status = 'Received';
    if (p) { p.stock += po.qty; p.stockedAt = Date.now(); }
    persist();
    toast(`Delivery received: +${p ? qty(po.qty, p.unit) : po.qty} ${p ? p.name : ''}`);
    renderApp();
  },

  async stockIn(productId, q) {
    const p = S.products.find((x) => x.id === productId);
    if (!p || q <= 0) return;

    if (remote()) {
      try {
        await api.post(`/products/${productId}/stock-in`, { qty: q });
      } catch (e) {
        // local fallback
      }
    }

    p.stock += q;
    p.stockedAt = Date.now();
    persist();
    toast(`Stocked in ${qty(q, p.unit)} of ${p.name}`);
    renderApp();
  },

  async logWastage(productId, q, reason) {
    const p = S.products.find((x) => x.id === productId);
    if (!p || q <= 0) return;
    const real = Math.min(q, p.stock);

    let entry = null;
    if (remote()) {
      try {
        entry = await api.post('/wastage', { productId, qty: real, reason, loss: real * p.cost });
      } catch (e) {
        // local fallback
      }
    }

    if (!entry) {
      entry = { id: uid(), productId, qty: real, reason, time: Date.now(), loss: real * p.cost };
    }

    p.stock -= real;
    p.expQty = Math.max(0, Math.min(p.expQty - real, p.stock));
    S.wastage.unshift(entry);
    persist();
    toast(`Logged ${qty(real, p.unit)} of ${p.name} as ${reason.toLowerCase()}`);
    renderApp();
  },

  async dismiss(productId) {
    if (remote()) {
      try { await api.post('/recommendations/dismiss', { productId }); } catch { /* ignore */ }
    }
    S.dismissed.push(productId);
    persist();
    renderApp();
    return true;
  },

  async saveProduct(prod) {
    if (remote()) {
      try {
        const res = await api.post('/products', prod);
        if (res && res.id) prod = res;
      } catch {
        // local fallback
      }
    }

    const idx = S.products.findIndex((x) => x.id === prod.id);
    if (prod.stock > 0 && (idx < 0 || prod.stock > S.products[idx].stock)) prod = { ...prod, stockedAt: Date.now() };
    if (idx >= 0) S.products[idx] = prod;
    else S.products.push(prod);

    persist();
    toast(`${prod.name} saved`);
    renderApp();
    return true;
  },

async importRows(rows, meta = {}) {
    let added = 0;
    let updated = 0;
    const addedIds = [];
    const before = [];

    // Map selected date to history slot: 0 = today, 1 = yesterday (index 13) ... 14 = 14 days ago (index 0)
    let daysAgo = null;
    if (meta.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(`${meta.date}T00:00:00`);
      if (!isNaN(target.getTime())) {
        daysAgo = Math.round((today - target) / 86400000);
      }
    }
    const histIdx = daysAgo != null && daysAgo >= 1 && daysAgo <= 14 ? 14 - daysAgo : null;

    if (remote() && meta.file) {
      try {
        const fd = new FormData();
        fd.append('file', meta.file);
        fd.append('kind', meta.kind || 'csv');
        if (meta.date) fd.append('date', meta.date);
        const res = await api.upload('/import', fd);
        if (res && res.products) {
          S.products = res.products;
          persist();
          renderApp();
          return { added: res.added || 0, updated: res.updated || 0 };
        }
      } catch {
        // Fallback to local import processing
      }
    }

    const todayBillItems = [];

    rows.forEach((r) => {
      const daily = r.dailySales != null ? Number(r.dailySales) : null;
      const idx = S.products.findIndex(
        (p) => (r.barcode && p.barcode === r.barcode) || p.name.toLowerCase() === r.name.toLowerCase()
      );

      if (idx >= 0) {
        const p = S.products[idx];
        before.push(JSON.parse(JSON.stringify(p)));

        let nextHistory = [...(p.history && p.history.length === 14 ? p.history : Array(14).fill(0))];
        if (daily != null) {
          if (histIdx != null) nextHistory[histIdx] = daily;
          else if (daysAgo == null) nextHistory = [...nextHistory.slice(1), daily];
        }

        S.products[idx] = {
          ...p,
          stockedAt: r.stock != null && r.stock > p.stock ? Date.now() : p.stockedAt,
          stock: r.stock != null ? r.stock : p.stock,
          price: r.price != null ? r.price : p.price,
          cost: r.cost != null ? r.cost : p.cost,
          gst: r.gst != null ? r.gst : p.gst,
          category: r.category || p.category,
          history: nextHistory,
        };

        if (daysAgo === 0 && daily > 0) {
          const cur = S.products[idx];
          todayBillItems.push({
            productId: cur.id,
            name: cur.name,
            unit: cur.unit,
            price: cur.price,
            cost: cur.cost,
            gst: cur.gst,
            qty: daily,
          });
        }
        updated++;
      } else {
        const newId = uid();
        addedIds.push(newId);

        const nextHistory = Array(14).fill(0);
        if (daily != null && histIdx != null) {
          nextHistory[histIdx] = daily;
        }

        const newProd = {
          id: newId,
          stockedAt: Date.now(),
          name: r.name,
          category: r.category || 'General',
          unit: r.unit || 'pc',
          barcode: r.barcode || `890199${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`,
          price: r.price != null ? r.price : 0,
          cost: r.cost != null ? r.cost : (r.price || 0) * 0.8,
          gst: r.gst != null ? r.gst : 0,
          stock: r.stock != null ? r.stock : 0,
          shelfLife: r.shelfLife || 180,
          expQty: 0,
          expDays: r.shelfLife || 180,
          history: nextHistory,
          keywords: [r.name.toLowerCase().split(/\s+/)[0]],
          markdown: 0,
        };
        S.products.push(newProd);

        if (daysAgo === 0 && daily > 0) {
          todayBillItems.push({
            productId: newProd.id,
            name: newProd.name,
            unit: newProd.unit,
            price: newProd.price,
            cost: newProd.cost,
            gst: newProd.gst,
            qty: daily,
          });
        }
        added++;
      }
    });

    if (daysAgo === 0 && todayBillItems.length > 0) {
      S.bills.push({
        id: uid(),
        no: S.nextBill++,
        time: Date.now(),
        items: todayBillItems,
        ...billTotals(todayBillItems),
        payment: 'Cash',
        customer: `CSV Import (${meta.date})`,
        settled: true,
      });
    }

    persist();
    renderApp();
    return { added, updated, addedIds, before };
  },

  async settleKhata(billId) {
    const b = S.bills.find((x) => x.id === billId);
    if (!b) return;

    if (remote()) {
      try { await api.post(`/bills/${billId}/settle`); } catch { /* ignore */ }
    }

    b.settled = true;
    persist();
    toast(`Bill #${b.no} settled`);
    renderApp();
  },

  async markRead() {
    if (remote()) {
      try { await api.post('/notices/mark-read'); } catch { /* ignore */ }
    }
    S.notices.forEach((n) => (n.read = true));
    persist();
    renderTopbar();
  },

  togglePos() {
    S.posReady = !S.posReady;
    persist();
    toast(S.posReady ? 'POS Scanner Ready' : 'POS Paused');
    renderApp();
  },

  async markdown(productId, pct) {
    const p = S.products.find((x) => x.id === productId);
    if (!p) return;

    if (remote()) {
      try { await api.post(`/products/${productId}/markdown`, { markdown: pct }); } catch { /* ignore */ }
    }

    if (pct > 0 && !p.markdown) {
      p.origPrice = p.price;
      p.price = Math.round(p.price * (1 - pct / 100) * 100) / 100;
      p.markdown = pct;
      toast(`Applied ${pct}% discount on ${p.name}`);
    } else if (pct === 0 && p.markdown) {
      p.price = p.origPrice || p.price;
      p.markdown = 0;
      toast(`Removed markdown from ${p.name}`);
    }
    persist();
    renderApp();
  },

  async setUserName(name) {
    S.userName = name.trim();
    if (remote()) {
      try { await api.post('/store/profile', { userName: S.userName, storeName: S.storeName }); } catch { /* ignore */ }
    }
    persist();
    return true;
  },
};
