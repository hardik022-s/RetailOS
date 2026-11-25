/* ==========================================================================
   RetailOS - Dashboard Shell: Top Bar, Sidebar, Greeting & Modals
   ========================================================================== */

const VIEW_TITLES = {
  dashboard: ['Overview', 'Your store at a glance'],
  import: ['Data upload', 'Upload CSVs, scan deliveries and update store details'],
  pos: ['POS billing', 'Scan or select items. Stock updates automatically.'],
  inventory: ['Inventory', 'Stock levels, shelf life and quick adjustments'],
  forecast: ['Forecasts', 'Demand predictions and restock recommendations'],
  ledger: ['Ledger', 'Bills, collections and khata'],
  daily: ['Daily sales', 'Sales for today, yesterday and every day before'],
  wastage: ['Wastage', 'Expiring stock, markdowns and the wastage log'],
};

const NAV = [
  { view: 'dashboard', icon: 'home', label: 'Overview' },
  { view: 'import', icon: 'upload', label: 'Data upload' },
  { view: 'pos', icon: 'cart', label: 'POS billing' },
  { view: 'inventory', icon: 'box', label: 'Inventory' },
  { view: 'forecast', icon: 'trend', label: 'Forecasts' },
  { view: 'ledger', icon: 'book', label: 'Ledger' },
  { view: 'daily', icon: 'clock', label: 'Daily sales' },
  { view: 'wastage', icon: 'leaf', label: 'Wastage' },
];

const TB = { q: '', focused: false, bellOpen: false, upOpen: false, sheet: '' };
const TB_FORMATS = [
  ['CSV', '.csv,.tsv,.txt,text/csv,text/plain'],
  ['Excel', '.xlsx,.xlsm,.xls,.ods'],
  ['Word', '.docx'],
  ['PDF', '.pdf,application/pdf'],
];
const GR = { editing: false, draft: '' };

/* ---------- Dashboard Shell (Rendered into #app) ---------- */
function dashboardShell() {
  return `<div class="animate-fade-in">
    <div class="flex h-screen flex-col bg-canvas">
      <div id="topbar"></div>
      <div class="flex min-h-0 flex-1">
        <aside class="hidden w-60 shrink-0 overflow-y-auto border-r border-line bg-white lg:block" id="sidebar-d"></aside>
        <main id="main-scroll" class="min-w-0 flex-1 overflow-y-auto">
          <div id="main" class="mx-auto max-w-[1180px] px-5 py-8 lg:px-10 lg:py-10"></div>
        </main>
        <aside id="chat-d" class="hidden w-[360px] shrink-0 border-l border-line xl:block"></aside>
      </div>
      <div id="mobile-menu"></div>
      <div id="chat-fab"></div>
      <div id="chat-m"></div>
    </div>
  </div>`;
}

/* ---------- Sidebar Component ---------- */
function pendingCount() {
  return pendingRecs(S).length;
}

function sidebar(mobile) {
  const recCount = pendingCount();
  const wasteCount = S.products.filter((p) => p.expQty > 0 && p.expDays <= 2).length;
  const cartCount = UI.cart.reduce((n, l) => n + l.qty, 0);
  const last = S.bills[S.bills.length - 1];
  const quick = [
    ['plus', 'Scan Delivery', 'scan', ''],
    ['minus', 'Log Wastage', 'waste', ''],
    ['printer', 'Last Receipt', 'receipt', last ? last.id : ''],
  ];

  return `<div class="flex h-full flex-col px-3 py-4">
    <nav class="flex flex-col gap-1">
      ${NAV.map((n) => {
        const active = UI.view === n.view;
        const badge = n.view === 'forecast' ? recCount : n.view === 'pos' ? cartCount : n.view === 'wastage' ? wasteCount : 0;
        return `<button data-act="nav" data-view="${n.view}" ${mobile ? 'data-close="1"' : ''} ${active ? 'aria-current="page"' : ''} class="flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition ${active ? 'bg-brand text-white shadow-sm shadow-brand/30' : 'text-ink/65 hover:bg-canvas hover:text-ink'}">
          ${icon(n.icon, 'size-[18px]')}
          <span class="flex-1 text-left">${n.label}</span>
          ${badge > 0 ? `<span class="rounded-full px-1.5 text-[10px] font-semibold ${active ? 'bg-white/20' : n.view === 'wastage' ? 'bg-amber-soft text-amber' : 'bg-brand-soft text-brand'}">${badge}</span>` : ''}
        </button>`;
      }).join('')}
    </nav>
    <div class="my-5 border-t border-line"></div>
    <p class="px-3.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-subtle">Quick actions</p>
    <div class="mt-2 flex flex-col gap-0.5">
      ${quick
        .map(
          ([ic, l, type, id]) =>
            `<button data-act="quick" data-type="${type}" data-id="${id}" ${mobile ? 'data-close="1"' : ''} class="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-ink/60 transition hover:bg-canvas hover:text-brand">${icon(ic, 'size-4')}${l}</button>`
        )
        .join('')}
    </div>
    <div class="mt-auto flex items-center gap-2.5 border-t border-line px-1 pt-4">
      <span class="grid size-8 place-items-center rounded-full bg-amber-soft text-xs font-semibold text-amber">${esc(initials(S.userName))}</span>
      <div class="min-w-0 flex-1 leading-tight">
        <p class="truncate text-sm font-medium">${esc(S.userName || 'Store owner')}</p>
        <p class="text-[11px] text-subtle">Owner</p>
      </div>
      <button data-act="logout" aria-label="Sign out" title="Sign out" class="grid size-8 place-items-center rounded-lg text-subtle transition hover:bg-canvas hover:text-ink">${icon('logout')}</button>
    </div>
  </div>`;
}

ACT.nav = (el) => {
  if (el.dataset.close) UI.menuOpen = false;
  go(el.dataset.view);
};

ACT.quick = (el) => {
  if (el.dataset.close) {
    UI.menuOpen = false;
    renderMobileMenu();
  }
  if (el.dataset.pid) {
    return openModal({ type: el.dataset.type, productId: el.dataset.pid });
  }
  openModal({ type: el.dataset.type, billId: el.dataset.id || undefined });
};

/* ---------- Top Bar Component ---------- */
function searchResults() {
  const term = TB.q.trim().toLowerCase();
  return term
    ? S.products
        .filter((p) => p.name.toLowerCase().includes(term) || p.barcode.includes(term) || p.category.toLowerCase().includes(term))
        .slice(0, 6)
    : [];
}

function topbar() {
  const results = searchResults();
  const unread = S.notices.filter((n) => !n.read).length;
  const term = TB.q.trim();

  return `<header class="sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-md lg:px-5">
    <button data-act="menu-open" aria-label="Open menu" class="grid size-9 place-items-center rounded-lg text-muted hover:bg-canvas lg:hidden">
      ${icon('menu')}
    </button>
    <button data-act="nav" data-view="dashboard" class="flex shrink-0 items-center gap-2.5">
      <span class="grid size-9 place-items-center rounded-lg bg-brand text-white">${brandMark('h-4.5 w-6')}</span>
      <span class="hidden text-left leading-tight sm:block">
        <span class="block text-[15px] font-semibold">RetailAI OS</span>
        <span class="block text-[10.5px] text-subtle">${esc(S.storeName)}</span>
      </span>
    </button>
    <div class="relative mx-auto w-full max-w-xl">
      ${icon('barcode', 'absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle')}
      <input id="search" data-f="search" data-in="tb-search" value="${esc(TB.q)}" placeholder="Scan barcode or search item" class="w-full rounded-lg border border-line bg-canvas py-2 pl-9 pr-16 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10" />
      <kbd class="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-white px-1.5 py-0.5 text-[10px] text-subtle sm:block">Ctrl+F</kbd>
      ${TB.focused && term
        ? `<div class="absolute inset-x-0 top-full mt-1.5 animate-fade-in overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-ink/10">
            ${results.length === 0
              ? `<p class="px-4 py-3 text-sm text-muted">No items match “${esc(TB.q)}”.</p>`
              : results
                  .map(
                    (p) => `
              <button data-md="tb-pick" data-id="${p.id}" class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-canvas">
                <span class="min-w-0">
                  <span class="block truncate font-medium">${esc(p.name)}</span>
                  <span class="text-xs text-subtle">${esc(p.barcode)} · ${qty(p.stock, p.unit)} in stock</span>
                </span>
                <span class="flex shrink-0 items-center gap-2 text-xs">
                  <span class="font-semibold">${inr(p.price)}</span>
                  <span class="rounded-md bg-brand-soft px-2 py-1 font-medium text-brand">Add to bill</span>
                </span>
              </button>`
                  )
                  .join('')}
          </div>`
        : ''}
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <div id="tb-up" class="relative hidden md:block">
        <button data-act="tb-upload" class="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium transition hover:border-brand/40 hover:text-brand">
          ${icon('plus')} Upload file
        </button>
        ${TB.upOpen
          ? `<div class="absolute right-0 top-full z-40 mt-2 w-72 animate-pop rounded-xl border border-line bg-white p-2 shadow-xl shadow-ink/10">
              <p class="px-2 pb-1.5 pt-1 text-[11px] font-medium text-subtle">Any layout works, we convert it to the template</p>
              ${TB_FORMATS.map(([label, accept]) => `<button data-act="tb-pick" data-label="${label}" data-accept="${accept}" class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-canvas">${icon('file', 'size-4 text-brand')}${label}</button>`).join('')}
              <form data-submit="tb-gs" class="mt-1 border-t border-line px-1 pb-1 pt-2.5">
                <label class="text-[11px] font-medium text-muted">Google Sheet
                  <input data-f="tb-gs" data-in="tb-gs" value="${esc(TB.sheet)}" placeholder="Paste the sheet link" class="${field} mt-1 py-2" />
                </label>
                <button type="submit" class="${btnPrimary} mt-2 w-full py-2">${icon('download', 'size-4')} Fetch sheet</button>
              </form>
            </div>`
          : ''}
      </div>

      <!-- Notification Bell -->
      <div id="bell" class="relative">
        <button data-act="tb-bell" aria-label="Notifications (${unread} unread)" class="relative grid size-9 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
          ${icon('bell', 'size-[18px]')}
          ${unread > 0 ? `<span class="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">${unread}</span>` : ''}
        </button>
        ${TB.bellOpen
          ? `<div class="absolute right-0 top-full mt-2 w-80 animate-pop overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-ink/10">
              <div class="flex items-center justify-between border-b border-line px-4 py-3">
                <p class="text-sm font-semibold">Notifications</p>
                <button data-act="tb-read" class="text-xs font-medium text-brand hover:underline">Mark all read</button>
              </div>
              <ul class="max-h-80 divide-y divide-line overflow-y-auto">
                ${S.notices.slice(0, 12).map((n) => `<li class="flex gap-3 px-4 py-3 text-sm ${n.read ? 'opacity-60' : ''}">
                  <span class="mt-1.5 size-2 shrink-0 rounded-full ${n.tone === 'danger' ? 'bg-danger' : n.tone === 'amber' ? 'bg-amber' : 'bg-brand'}"></span>
                  <span><span class="block leading-snug">${esc(n.text)}</span><span class="text-xs text-subtle">${clock(n.time)}</span></span>
                </li>`).join('')}
              </ul>
            </div>`
          : ''}
      </div>

      <!-- POS State Toggle -->
      <button data-act="tb-pos" title="Toggle POS status" class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${S.posReady ? 'border-brand/20 bg-brand-soft text-brand' : 'border-line bg-canvas text-muted'}">
        <span class="relative size-2 rounded-full ${S.posReady ? 'bg-brand' : 'bg-subtle'}">
          ${S.posReady ? '<span class="absolute inset-0 animate-ping rounded-full bg-brand/60"></span>' : ''}
        </span>
        <span class="hidden sm:inline">${S.posReady ? 'POS Ready' : 'POS Paused'}</span>
      </button>
    </div>
  </header>`;
}

INP['tb-search'] = (el) => { TB.q = el.value; renderTopbar(); };
MD['tb-pick'] = (el) => {
  addToCart(el.dataset.id);
  TB.q = '';
  renderTopbar();
  const s = $('#search');
  if (s) s.blur();
};
ACT['tb-bell'] = () => { TB.bellOpen = !TB.bellOpen; renderTopbar(); };
ACT['tb-read'] = () => act.markRead();
ACT['tb-pos'] = () => act.togglePos();
ACT['tb-upload'] = () => { TB.upOpen = !TB.upOpen; renderTopbar(); };
ACT['tb-pick'] = (el) => {
  TB.upOpen = false;
  renderTopbar();
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = el.dataset.accept;
  input.onchange = () => {
    const f = input.files[0];
    if (!f) return;
    const r = datasetReader(f);
    if (r.error) return toast(r.error);
    topbarImport(f.name, r.label, r.read);
  };
  input.click();
};
INP['tb-gs'] = (el) => { TB.sheet = el.value; };
SUB['tb-gs'] = () => {
  const link = TB.sheet.trim();
  if (!/^https?:\/\//i.test(link)) return toast('Paste the full Google Sheet link, starting with https://');
  TB.upOpen = false;
  renderTopbar();
  topbarImport('google-sheet', 'Google Sheet', () => sheetToCsv(link));
};
ACT['menu-open'] = () => { UI.menuOpen = true; withAnim(renderMobileMenu); };
ACT['menu-close'] = () => { UI.menuOpen = false; renderMobileMenu(); };

document.addEventListener('focusin', (e) => {
  if (TB_RENDERING) return;
  if (e.target.id === 'search' && !TB.focused) {
    TB.focused = true;
    renderTopbar();
  }
});

document.addEventListener('focusout', (e) => {
  if (TB_RENDERING) return;
  if (e.target.id === 'search') {
    setTimeout(() => {
      if (document.activeElement && document.activeElement.id === 'search') return;
      TB.focused = false;
      renderTopbar();
    }, 150);
  }
});

document.addEventListener('mousedown', (e) => {
  if (TB.bellOpen && !e.target.closest('#bell')) {
    TB.bellOpen = false;
    renderTopbar();
  }
  if (TB.upOpen && !e.target.closest('#tb-up')) {
    TB.upOpen = false;
    renderTopbar();
  }
});

document.addEventListener('keydown', (e) => {
  if (UI.page !== 'dashboard') return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    $('#search')?.focus();
  }
  if (e.target.id === 'search') {
    const results = searchResults();
    if (e.key === 'Enter' && results[0]) {
      const term = TB.q.trim().toLowerCase();
      addToCart((results.find((r) => r.barcode === term) || results[0]).id);
      TB.q = '';
      renderTopbar();
    }
    if (e.key === 'Escape') {
      TB.q = '';
      renderTopbar();
    }
  }
});

/* ---------- Greeting Component (Overview Header) ---------- */
function greeting(action) {
  const t = useToday();
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const line =
    t.delta > 3
      ? `Sales are up ${Math.round(t.delta)}% on yesterday. Nice going, let's keep the shelves full.`
      : t.today.length > 0
      ? `${t.today.length} bills done so far. Here's everything you need for a smooth day at the counter.`
      : 'Your shelves, sales and smart suggestions are ready whenever you are.';
  const askName = !S.userName || GR.editing;

  return `<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <p class="text-sm text-muted">${hello} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      ${askName
        ? `<form data-submit="greet" class="mt-2 flex flex-wrap items-center gap-3">
            <h1 class="font-serif text-4xl leading-tight tracking-tight">Hello,</h1>
            <input id="gr-name" data-f="gr-name" data-in="gr" value="${esc(GR.draft)}" placeholder="what should we call you?" aria-label="Your name" class="w-64 border-b-2 border-brand/40 bg-transparent pb-1 font-serif text-3xl tracking-tight outline-none placeholder:text-subtle focus:border-brand" />
            <button type="submit" ${dis(!GR.draft.trim())} class="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-40">Save</button>
            ${GR.editing ? '<button type="button" data-act="gr-cancel" class="text-sm text-muted hover:text-ink">Cancel</button>' : ''}
          </form>`
        : `<h1 class="group mt-1 flex items-center gap-3 font-serif text-4xl leading-tight tracking-tight">
            Hello, ${esc(S.userName.split(' ')[0])}
            <button data-act="gr-edit" aria-label="Change your name" class="grid size-8 place-items-center rounded-full text-subtle opacity-0 transition hover:bg-white hover:text-ink group-hover:opacity-100 focus:opacity-100">${icon('edit', 'size-4')}</button>
          </h1>`}
      <p class="mt-2 max-w-xl text-[15px] text-ink/65">${line}</p>
    </div>
    ${action}
  </div>`;
}

INP.gr = (el) => {
  GR.draft = el.value;
  const b = el.form.querySelector('button[type=submit]');
  if (b) b.disabled = !GR.draft.trim();
};
ACT['gr-edit'] = () => {
  GR.draft = S.userName;
  GR.editing = true;
  renderMain();
  $('#gr-name')?.focus();
};
ACT['gr-cancel'] = () => {
  GR.editing = false;
  renderMain();
};
SUB.greet = async () => {
  if (!GR.draft.trim()) return;
  const ok = await act.setUserName(GR.draft);
  if (!ok) return;
  GR.editing = false;
  renderApp();
  toast(`Nice to meet you, ${GR.draft.trim().split(' ')[0]}!`);
};

/* ---------- Main Content View Router ---------- */
function mainContent() {
  const ask = !UI.chatOpen
    ? `<button data-act="chat-open" class="hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/80 transition hover:border-brand/40 hover:text-brand xl:flex">${icon('spark', 'text-brand')} Ask AI assistant</button>`
    : '';

  const [title, sub] = VIEW_TITLES[UI.view];
  const head =
    UI.view === 'dashboard'
      ? greeting(ask)
      : `<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><h1 class="font-serif text-4xl leading-tight tracking-tight">${title}</h1><p class="mt-1 text-sm text-muted">${sub}</p></div>
          ${ask}
        </div>`;

  const body = {
    dashboard: overviewView,
    pos: posView,
    inventory: inventoryView,
    forecast: forecastView,
    ledger: ledgerView,
    daily: dailySalesView,
    import: () => `<div id="import-root">${importPanel()}</div>`,
    wastage: wastageView,
  }[UI.view]();

  return `<div class="${an('animate-fade-up')}">${head}${body}</div>`;
}

/* ---------- Region Renderers ---------- */
let TB_RENDERING = false;
function renderTopbar() {
  const r = $('#topbar');
  if (!r) return;
  TB_RENDERING = true;
  try { withFocus(() => { r.innerHTML = topbar(); }); } finally { TB_RENDERING = false; }
}

function renderSidebars() {
  const r = $('#sidebar-d');
  if (r) r.innerHTML = sidebar(false);
  renderMobileMenu();
}

function renderMobileMenu() {
  const r = $('#mobile-menu');
  if (!r) return;
  r.innerHTML = UI.menuOpen
    ? `<div class="fixed inset-0 z-40 lg:hidden">
        <div data-act="menu-close" class="absolute inset-0 ${an('animate-fade-in')} bg-ink/30"></div>
        <div class="absolute inset-y-0 left-0 w-64 ${an('animate-fade-in')} bg-white shadow-xl">${sidebar(true)}</div>
      </div>`
    : '';
}

function renderMain() {
  const r = $('#main');
  if (!r) return;
  withFocus(() => { r.innerHTML = mainContent(); });
  mountCharts(ANIM);
}

function renderApp() {
  if (UI.page === 'upload') return renderImport();
  if (UI.page !== 'dashboard') return;
  renderTopbar();
  renderSidebars();
  renderMain();
  renderChatShell();
  renderModal();
}

function renderPage() {
  const app = $('#app');
  if (UI.page === 'intro') {
    app.innerHTML = `<div class="${an('animate-fade-in')}">${introPage()}</div>`;
  } else if (UI.page === 'upload') {
    app.innerHTML = `<div class="${an('animate-fade-in')}">${uploadPage()}</div>`;
    renderImport();
  } else {
    app.innerHTML = dashboardShell();
    renderApp();
    renderChat();
  }
  document.body.style.overflow = UI.loginOpen ? 'hidden' : '';
  mountCharts(ANIM);
}

/* ==========================================================================
   Modals: Scan Delivery, Log Wastage, Receipt, Stock In, Product Add/Edit
   ========================================================================== */
const MS = {}; // Working state of open modal

function openModal(m) {
  UI.modal = m;
  if (m.type === 'scan') Object.assign(MS, { code: '', n: 1 });
  if (m.type === 'waste') {
    const list = [...S.products].sort((a, b) => b.expQty - a.expQty);
    const id = m.productId || (list[0] && list[0].id) || '';
    const p = S.products.find((x) => x.id === id);
    Object.assign(MS, { id, n: (p && p.expQty) || 1, reason: 'Expired' });
  }
  if (m.type === 'stockin') MS.n = 10;
  if (m.type === 'product') {
    const ex = S.products.find((x) => x.id === m.productId);
    MS.p = ex
      ? { ...ex }
      : {
          id: uid(),
          name: '',
          category: 'Staples',
          unit: 'pack',
          barcode: `890199${String(Math.floor(Math.random() * 1e7)).padStart(7, '0')}`,
          price: 0,
          cost: 0,
          gst: 0,
          stock: 0,
          shelfLife: 180,
          expQty: 0,
          expDays: 180,
          history: Array(14).fill(0),
          keywords: [],
        };
  }
  withAnim(renderModal);
  if (m.type === 'scan') $('#scan-code')?.focus();
}

function closeModal() {
  UI.modal = null;
  renderModal();
}

function printReceipt(b) {
  const w = window.open('', '_blank', 'width=380,height=600');
  if (!w) return;
  const rows = b.items
    .map(
      (i) =>
        `<tr><td>${esc(i.name)}<br><small>${i.qty} × ₹${i.price}</small></td><td style="text-align:right">₹${(i.qty * i.price).toFixed(2)}</td></tr>`
    )
    .join('');
  w.document.write(
    `<html><head><title>Bill #${b.no}</title><style>body{font-family:ui-monospace,monospace;font-size:12px;padding:16px}table{width:100%;border-collapse:collapse}td{padding:4px 0;border-bottom:1px dashed #ccc}h2,p{text-align:center;margin:4px 0}</style></head><body><h2>${esc(S.storeName)}</h2><p>Bill #${b.no} · ${new Date(b.time).toLocaleString('en-IN')}</p><table>${rows}</table><p style="text-align:right"><b>Total ₹${b.total.toFixed(2)}</b><br>Paid via ${b.payment}</p><p>Thank you, visit again!</p><script>window.print()<\/script></body></html>`
  );
  w.document.close();
}

function scanModal() {
  const pending = S.pos.filter((p) => p.status === 'Pending');
  const c = MS.code.trim();
  const match = S.products.find(
    (p) => p.barcode === c || (c.length > 2 && p.name.toLowerCase().includes(c.toLowerCase()))
  );
  return modalShell({
    title: 'Scan delivery',
    subtitle: 'Receive purchase orders or scan items to stock in',
    width: 'max-w-2xl',
    body: `<div class="grid gap-6 md:grid-cols-2">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-subtle">Pending purchase orders</p>
        ${pending.length === 0
          ? '<p class="mt-3 rounded-lg bg-canvas px-4 py-6 text-center text-sm text-muted">No pending POs. Approve one from the dashboard.</p>'
          : `<ul class="mt-3 space-y-2">${pending
              .map((po) => {
                const p = S.products.find((x) => x.id === po.productId);
                return `<li class="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
                  <div class="min-w-0"><p class="truncate text-sm font-medium">${esc(p && p.name)}</p><p class="text-xs text-subtle">PO #${po.no} · ${p ? qty(po.qty, p.unit) : po.qty} · ${inr(po.cost)}</p></div>
                  <button data-act="po-receive" data-id="${po.id}" class="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep">Receive</button>
                </li>`;
              })
              .join('')}</ul>`}
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-subtle">Scan or enter barcode</p>
        <input id="scan-code" data-f="scan-code" data-in="ms" data-k="code" value="${esc(MS.code)}" placeholder="Barcode or item name" class="mt-3 ${field}" />
        ${MS.code ? `<p class="mt-1.5 text-xs ${match ? 'text-brand' : 'text-danger'}">${match ? `${esc(match.name)} · ${qty(match.stock, match.unit)} in stock` : 'No matching item'}</p>` : ''}
        <div class="mt-3 flex gap-2">
          <input data-f="scan-n" data-in="ms" data-k="n" type="number" min="1" value="${MS.n}" class="${field} w-24" aria-label="Quantity" />
          <button data-act="scan-stockin" ${dis(!match)} class="${btnPrimary} flex-1">${icon('plus')} Stock in</button>
        </div>
      </div>
    </div>`,
  });
}

function wasteModal() {
  const list = [...S.products].sort((a, b) => b.expQty - a.expQty);
  const p = S.products.find((x) => x.id === MS.id);
  return modalShell({
    title: 'Log wastage',
    subtitle: 'Removes stock and records the loss in the ledger',
    body: `
      <label class="text-xs font-medium text-muted">Item
        <select data-ch="ms-waste-item" class="mt-1.5 ${field}">
          ${list.map((x) => `<option value="${x.id}" ${x.id === MS.id ? 'selected' : ''}>${esc(x.name)} · ${qty(x.stock, x.unit)}${x.expQty ? ` (${x.expQty} expiring)` : ''}</option>`).join('')}
        </select>
      </label>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <label class="text-xs font-medium text-muted">Quantity<input data-f="waste-n" data-in="ms" data-k="n" type="number" min="1" ${p ? `max="${p.stock}"` : ''} value="${MS.n}" class="mt-1.5 ${field}" /></label>
        <label class="text-xs font-medium text-muted">Reason<select data-ch="ms" data-k="reason" class="mt-1.5 ${field}">${['Expired', 'Damaged', 'Spoiled', 'Theft / missing', 'Other'].map((r) => `<option ${r === MS.reason ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
      </div>
      ${p ? `<p class="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">Estimated loss: <strong>${inr(Math.min(MS.n, p.stock) * p.cost)}</strong> at cost price</p>` : ''}
      <div class="mt-6 flex justify-end gap-2">
        <button data-act="modal-close" class="${btnGhost}">Cancel</button>
        <button data-act="waste-save" ${dis(!p || p.stock === 0)} class="${btnPrimary}">${icon('minus')} Log wastage</button>
      </div>`,
  });
}

function receiptModal() {
  const b = S.bills.find((x) => x.id === (UI.modal && UI.modal.billId)) || S.bills[S.bills.length - 1];
  if (!b) return modalShell({ title: 'Receipt', body: '<p class="text-sm text-muted">No bills yet.</p>' });
  return modalShell({
    title: `Receipt · Bill #${b.no}`,
    subtitle: `${new Date(b.time).toLocaleDateString('en-IN')} at ${clock(b.time)}`,
    width: 'max-w-sm',
    body: `
      <div class="rounded-xl border border-dashed border-line bg-canvas/60 p-5 font-mono text-xs">
        <p class="text-center text-sm font-semibold">${esc(S.storeName)}</p>
        <div class="my-3 border-t border-dashed border-line"></div>
        ${b.items
          .map(
            (i) => `<div class="flex justify-between gap-2 py-1">
              <span>${esc(i.name)}<span class="block text-subtle">${i.qty} × ₹${i.price}</span></span>
              <span>₹${(i.qty * i.price).toFixed(2)}</span>
            </div>`
          )
          .join('')}
        <div class="my-3 border-t border-dashed border-line"></div>
        <div class="mt-1 flex justify-between text-sm font-semibold"><span>Total</span><span>₹${b.total.toFixed(2)}</span></div>
        <p class="mt-2 text-subtle">Paid via ${b.payment}${b.customer ? ` · ${esc(b.customer)}` : ''}</p>
      </div>
      <div class="mt-5 flex gap-2">
        <button data-act="modal-close" class="${btnGhost} flex-1">Close</button>
        <button data-act="receipt-print" data-id="${b.id}" class="${btnPrimary} flex-1">${icon('printer')} Print</button>
      </div>`,
  });
}

function dayModal() {
  const k = (UI.modal && UI.modal.k) || 0;
  const prod = DS.sel === 'all' ? null : S.products.find((x) => x.id === DS.sel) || null;
  const d = new Date();
  d.setDate(d.getDate() - k);
  const items = dayItems(k, prod);
  const sell = items.reduce((n, i) => n + i.sell, 0);
  const cost = items.reduce((n, i) => n + i.cost, 0);
  const profit = sell - cost;
  const units = items.reduce((n, i) => n + i.qty, 0);
  const margin = sell ? Math.round((profit / sell) * 100) : 0;
  const tiles = [
    ['Total selling price', inr(sell), `${items.length} ${items.length === 1 ? 'item' : 'items'} sold`, 'border-tint-mint-edge bg-tint-mint', 'text-ink'],
    ['Total actual price', inr(cost), 'What the stock cost you', 'border-tint-sand-edge bg-tint-sand', 'text-ink'],
    ['Total profit', inr(profit), `${margin}% margin`, 'border-tint-sky-edge bg-tint-sky', profit >= 0 ? 'text-brand' : 'text-danger'],
    ['Units sold', String(Math.round(units * 10) / 10), prod ? prod.name : 'All items', 'border-tint-lilac-edge bg-tint-lilac', 'text-ink'],
  ];
  const rows = items.length
    ? `<div class="overflow-x-auto"><table class="w-full min-w-[460px] text-left text-sm">
        <thead class="text-xs text-subtle"><tr class="border-b border-line">${['Item', 'Selling price', 'Actual price', 'Profit'].map((h, i) => `<th class="px-4 py-2.5 font-medium ${i ? 'text-right' : ''}">${h}</th>`).join('')}</tr></thead>
        <tbody class="divide-y divide-line">
          ${items.map((i) => `<tr>
            <td class="px-4 py-2.5"><span class="font-medium">${esc(i.name)}</span><span class="block text-xs text-subtle">${Math.round(i.qty * 10) / 10} ${esc(i.unit)} × ${inr(i.sell / i.qty)}</span></td>
            <td class="px-4 py-2.5 text-right font-semibold">${inr(i.sell)}</td>
            <td class="px-4 py-2.5 text-right text-muted">${inr(i.cost)}</td>
            <td class="px-4 py-2.5 text-right font-semibold ${i.profit >= 0 ? 'text-brand' : 'text-danger'}">${inr(i.profit)}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr class="border-t border-line bg-canvas/60 font-semibold">
          <td class="px-4 py-2.5">Total</td>
          <td class="px-4 py-2.5 text-right">${inr(sell)}</td>
          <td class="px-4 py-2.5 text-right">${inr(cost)}</td>
          <td class="px-4 py-2.5 text-right ${profit >= 0 ? 'text-brand' : 'text-danger'}">${inr(profit)}</td>
        </tr></tfoot>
      </table></div>`
    : '<p class="py-10 text-center text-sm text-muted">No sales recorded for this day.</p>';
  return modalShell({
    title: `${dayName(k)} · ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`,
    subtitle: 'Items sold on this day',
    width: 'max-w-3xl',
    body: `<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        ${tiles.map(([l, v, sub, cls, vc]) => `<div class="rounded-2xl border p-4 ${cls}"><p class="text-xs text-muted">${l}</p><p class="mt-1 text-xl font-semibold ${vc}">${v}</p><p class="mt-0.5 truncate text-xs text-subtle">${esc(sub)}</p></div>`).join('')}
      </div>
      <div class="mt-3 overflow-hidden rounded-2xl border border-line">${rows}</div>
      <div class="mt-5 flex"><button data-act="modal-close" class="${btnGhost} ml-auto">Close</button></div>`,
  });
}

function stockinModal() {
  const p = S.products.find((x) => x.id === (UI.modal && UI.modal.productId));
  if (!p) return '';
  return modalShell({
    title: `Stock in · ${esc(p.name)}`,
    subtitle: `Currently ${qty(p.stock, p.unit)}`,
    width: 'max-w-sm',
    body: `
      <label class="text-xs font-medium text-muted">Quantity received (${esc(p.unit)})
        <input data-f="si-n" data-in="ms" data-k="n" type="number" min="1" value="${MS.n}" class="mt-1.5 ${field}" />
      </label>
      <p class="mt-3 text-sm text-muted">New stock: <strong class="text-ink">${qty(p.stock + MS.n, p.unit)}</strong> · cost ${inr(MS.n * p.cost)}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button data-act="modal-close" class="${btnGhost}">Cancel</button>
        <button data-act="stockin-save" class="${btnPrimary}">${icon('plus')} Stock in</button>
      </div>`,
  });
}

function productModal() {
  const p = MS.p,
    existing = S.products.find((x) => x.id === (UI.modal && UI.modal.productId));
  const num = (k, label) =>
    `<label class="text-xs font-medium text-muted">${label}<input data-f="pf-${k}" data-in="pf" data-k="${k}" data-num="1" type="number" min="0" value="${p[k]}" class="mt-1.5 ${field}" /></label>`;

  return modalShell({
    title: existing ? 'Edit item' : 'Add item',
    body: `<div class="grid grid-cols-2 gap-3">
      <label class="col-span-2 text-xs font-medium text-muted">Item name<input data-f="pf-name" data-in="pf" data-k="name" value="${esc(p.name)}" class="mt-1.5 ${field}" placeholder="e.g., Fortune Sunflower Oil 1L" /></label>
      <label class="text-xs font-medium text-muted">Category<select data-ch="pf" data-k="category" class="mt-1.5 ${field}">${CATEGORIES.map((c) => `<option ${c === p.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="text-xs font-medium text-muted">Unit<input data-f="pf-unit" data-in="pf" data-k="unit" value="${esc(p.unit)}" class="mt-1.5 ${field}" /></label>
      <label class="col-span-2 text-xs font-medium text-muted">Barcode<input data-f="pf-barcode" data-in="pf" data-k="barcode" value="${esc(p.barcode)}" class="mt-1.5 ${field}" /></label>
      ${num('price', 'Selling price (₹)')}${num('cost', 'Actual price (₹)')}${num('stock', 'Stock')}${num('shelfLife', 'Shelf life (days)')}
    </div>
    <div class="mt-6 flex justify-end gap-2">
      <button data-act="modal-close" class="${btnGhost}">Cancel</button>
      <button data-act="product-save" ${dis(!(p.name.trim() && p.price > 0))} class="${btnPrimary}">${icon('check')} Save</button>
    </div>`,
  });
}

function renderModal() {
  const r = $('#modal-root');
  if (!r) return;
  const m = UI.modal;
  withFocus(() => {
    r.innerHTML =
      !m || UI.page !== 'dashboard'
        ? ''
        : {
            scan: scanModal,
            waste: wasteModal,
            receipt: receiptModal,
            day: dayModal,
            stockin: stockinModal,
            product: productModal,
          }[m.type]();
  });
}

INP.ms = (el) => {
  MS[el.dataset.k] = el.dataset.k === 'n' ? Math.max(1, Number(el.value)) : el.value;
  renderModal();
};
CHG.ms = (el) => {
  MS[el.dataset.k] = el.value;
  renderModal();
};
CHG['ms-waste-item'] = (el) => {
  MS.id = el.value;
  const p = S.products.find((x) => x.id === el.value);
  MS.n = (p && p.expQty) || 1;
  renderModal();
};

INP.pf = (el) => {
  MS.p[el.dataset.k] = el.dataset.num ? Number(el.value) : el.value;
  const b = $('[data-act="product-save"]');
  if (b) b.disabled = !(MS.p.name.trim() && MS.p.price > 0);
};
CHG.pf = (el) => { MS.p[el.dataset.k] = el.value; };

ACT['po-receive'] = (el) => act.receivePO(el.dataset.id);
ACT['scan-stockin'] = async () => {
  const c = MS.code.trim();
  const match = S.products.find(
    (p) => p.barcode === c || (c.length > 2 && p.name.toLowerCase().includes(c.toLowerCase()))
  );
  if (!match) return;
  await act.stockIn(match.id, MS.n);
  MS.code = '';
  MS.n = 1;
  renderModal();
};
ACT['waste-save'] = async () => {
  await act.logWastage(MS.id, MS.n, MS.reason);
  closeModal();
};
ACT['stockin-save'] = async () => {
  await act.stockIn(UI.modal.productId, MS.n);
  closeModal();
};
ACT['product-save'] = async () => {
  const p = MS.p;
  const ok = await act.saveProduct({
    ...p,
    keywords: p.keywords && p.keywords.length ? p.keywords : [p.name.toLowerCase().split(/\s+/)[0]],
  });
  if (ok) closeModal();
};
ACT['receipt-print'] = (el) => {
  const b = S.bills.find((x) => x.id === el.dataset.id);
  if (b) printReceipt(b);
};
