/* ==========================================================================
   RetailOS - UI Plumbing: State, Delegation, Focus, Toasts & Modals
   ========================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const UI = {
  page: 'intro',
  view: 'dashboard',
  modal: null,
  cart: [],
  menuOpen: false,
  chatOpen: window.innerWidth >= 1536,
  loginOpen: false,
};

const ACT = {};   // click handlers      <button data-act="name">
const MD = {};    // mousedown handlers  <button data-md="name">
const INP = {};   // input handlers      <input data-in="name">
const CHG = {};   // change handlers     <select data-ch="name">
const SUB = {};   // submit handlers     <form data-submit="name">

let ANIM = false;
const an = (c) => (ANIM ? c : '');
const withAnim = (fn) => {
  ANIM = true;
  try { fn(); } finally { ANIM = false; }
};

/* Shared class strings */
const field = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/10';
const card = 'rounded-3xl border border-line/80 bg-white';
const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-50';
const btnGhost = 'inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink transition hover:border-brand/40 hover:text-brand disabled:opacity-50';
const dis = (c) => (c ? 'disabled' : '');

/** Re-renders while keeping the focused field (and caret position) when the DOM is rebuilt. */
function withFocus(fn) {
  const a = document.activeElement;
  const key = a && a.dataset && a.dataset.f;
  let s = null, e = null;
  if (key) {
    try { s = a.selectionStart; e = a.selectionEnd; } catch { /* ignore */ }
  }
  fn();
  if (key) {
    const n = $$(`[data-f="${key}"]`).find((x) => x.offsetParent !== null);
    if (n) {
      n.focus();
      try { if (s != null) n.setSelectionRange(s, e); } catch { /* ignore */ }
    }
  }
}

/* ---------- Event Delegation ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el, e);
});

document.addEventListener('mousedown', (e) => {
  const el = e.target.closest('[data-md]');
  if (el && MD[el.dataset.md]) MD[el.dataset.md](el, e);
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-in]');
  if (el && INP[el.dataset.in]) INP[el.dataset.in](el, e);
});

document.addEventListener('change', (e) => {
  const el = e.target.closest('[data-ch]');
  if (el && CHG[el.dataset.ch]) CHG[el.dataset.ch](el, e);
});

document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-submit]');
  if (f && SUB[f.dataset.submit]) {
    e.preventDefault();
    SUB[f.dataset.submit](f, e);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && UI.modal) closeModal();
});

// Drag & drop zones: <div data-drop="name">
['dragover', 'dragleave', 'drop'].forEach((t) =>
  document.addEventListener(t, (e) => {
    const el = e.target.closest('[data-drop]');
    if (el && ACT['drop-' + el.dataset.drop]) {
      e.preventDefault();
      ACT['drop-' + el.dataset.drop](el, e);
    }
  })
);

/* ---------- Toasts & Backend Status Banner ---------- */
function renderToasts() {
  const r = $('#toast-root');
  if (!r) return;
  r.innerHTML = `<div class="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">${toasts
    .map(
      (t) => `
    <div class="flex ${t.fresh ? 'animate-pop' : ''} items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-xl">
      ${icon('check', 'size-4 text-amber')}
      ${esc(t.text)}
    </div>`
    )
    .join('')}</div>`;
  toasts.forEach((t) => (t.fresh = false));
}

function renderNet() {
  const r = $('#net-root');
  if (!r) return;
  if (!net.checked || net.connected) {
    r.innerHTML = '';
    return;
  }
  r.innerHTML = `<div class="fixed bottom-4 left-4 z-[70] flex items-center gap-2.5 rounded-full border border-amber/30 bg-amber-soft px-3.5 py-2 text-xs font-medium text-ink shadow-lg">
    <span class="size-2 rounded-full bg-amber"></span>
    ${net.demo ? 'Backend not connected · showing demo data' : 'Backend not connected'}
    <button data-act="net-retry" class="ml-1 font-semibold text-brand hover:underline">Retry</button>
  </div>`;
}

window.addEventListener('net-changed', renderNet);

ACT['net-retry'] = async () => {
  toast('Checking backend connection...');
  const ok = await net.check();
  if (ok) {
    toast('Connected to backend API!');
    await loadState();
    renderApp();
  } else {
    toast(`Backend not reachable at ${CFG.API_BASE}`);
  }
};

/* ---------- Modal Shell ---------- */
function modalShell({ title, subtitle = '', body, width = 'max-w-lg' }) {
  return `<div class="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
    <div data-act="modal-close" class="absolute inset-0 ${an('animate-fade-in')} bg-ink/30 backdrop-blur-[2px]"></div>
    <div class="relative w-full ${width} max-h-[90vh] ${an('animate-pop')} overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-ink/20">
      <div class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <h2 class="font-semibold">${title}</h2>
          ${subtitle ? `<p class="mt-0.5 text-xs text-muted">${subtitle}</p>` : ''}
        </div>
        <button data-act="modal-close" aria-label="Close" class="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
          ${icon('close')}
        </button>
      </div>
      <div class="p-6">${body}</div>
    </div>
  </div>`;
}

ACT['modal-close'] = () => closeModal();

/* ---------- Navigation & Cart Helpers ---------- */
function go(v) {
  UI.view = v;
  withAnim(renderApp);
  const m = $('#main-scroll');
  if (m) m.scrollTo({ top: 0, behavior: 'smooth' });
}

function setPage(p) {
  UI.page = p;
  window.scrollTo({ top: 0 });
  withAnim(renderPage);
}

function addToCart(productId, n = 1) {
  const p = S.products.find((x) => x.id === productId);
  if (!p) return;
  const inCart = (UI.cart.find((l) => l.productId === productId) || {}).qty || 0;
  if (inCart + n > p.stock) {
    toast(`Only ${qty(p.stock, p.unit)} of ${p.name} in stock`);
    return;
  }
  UI.cart = UI.cart.some((l) => l.productId === productId)
    ? UI.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + n } : l))
    : [...UI.cart, { productId, qty: n }];

  if (UI.view !== 'pos') {
    UI.view = 'pos';
    toast(`Added ${p.name} to bill`);
    withAnim(renderApp);
  } else {
    renderApp();
  }
}
