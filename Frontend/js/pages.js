/* ==========================================================================
   RetailOS - Pages: Intro Landing, Upload Page, Login Modal & Google Auth
   ========================================================================== */

const IMG_PRODUCE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200&h=800';
const IMG_SHELVES = 'https://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200&h=800';
const IMG_CITRUS = 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200&h=800';
const IMG_ABOUT = 'https://images.unsplash.com/photo-1747649970821-5d8a4724ede3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200&h=900';

/* ---------- About Us Section (shared by Intro and Upload) ---------- */
const TEAM = [
  { icon: 'cart', role: 'Frontend & POS UI', body: 'Counter software that keeps billing fast, touch-friendly, and simple.' },
  { icon: 'cpu', role: 'ML & forecasting', body: 'Demand models that learn seasonality, trends and shelf life from every sale.' },
  { icon: 'chat', role: 'AI assistant', body: 'Plain-language answers with charts and one-tap actions for busy shopkeepers.' },
  { icon: 'shield', role: 'Backend & sync', body: 'Secure transaction recording, atomic billing, and real-time inventory adjustment.' },
];

const VALUES = [
  ['Built for the counter', 'Every screen is designed for a shop owner with a queue in front of them.'],
  ['Affordable by default', 'Enterprise-grade insight without enterprise cost or complexity.'],
  ['Less waste, more margin', 'Our success is measured in spoilage avoided and profit protected.'],
];

function aboutUs(tone = 'blush') {
  const border = tone === 'blush' ? 'border-blush-deep' : 'border-line';
  return `<section id="about" class="scroll-mt-20" aria-labelledby="about-title">
    <div class="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div>
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-brand">About us</span>
        <h2 id="about-title" class="mt-4 font-serif text-[40px] leading-tight tracking-tight sm:text-5xl">We build retail intelligence for the stores on every street corner</h2>
        <p class="mt-5 max-w-xl leading-relaxed text-ink/70">RetailOS started with a simple observation: small and mid-sized retailers make hundreds of stocking decisions a week, mostly on instinct. We combine POS billing, machine learning and a conversational assistant so every shopkeeper can order with confidence, waste less and earn more.</p>
        <ul class="mt-8 space-y-4">${VALUES.map(([t, d]) => `
          <li class="flex gap-3"><span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-white">${icon('check', 'size-3')}</span>
          <span class="text-sm"><span class="font-semibold">${t}.</span> <span class="text-ink/65">${d}</span></span></li>`).join('')}</ul>
      </div>
      <div class="relative">
        <div class="overflow-hidden rounded-3xl"><img src="${IMG_ABOUT}" alt="Shopkeeper in his well-stocked store" class="aspect-[4/3] w-full object-cover" /></div>
        <div class="absolute -bottom-6 left-6 rounded-2xl border ${border} bg-white px-5 py-4 shadow-xl shadow-ink/10"><p class="font-serif text-3xl">Our mission</p><p class="mt-0.5 text-sm text-ink/65">Smarter shelves for every independent store.</p></div>
      </div>
    </div>
    <div class="mt-20">
      <h3 class="font-serif text-3xl">The team behind RetailOS</h3>
      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">${TEAM.map((m) => `
        <div class="rounded-3xl border ${border} bg-white p-6"><span class="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">${icon(m.icon, 'size-5')}</span>
        <p class="mt-5 font-semibold">${m.role}</p><p class="mt-1.5 text-sm leading-relaxed text-ink/65">${m.body}</p></div>`).join('')}</div>
    </div>
  </section>`;
}

/* ---------- Intro Page ---------- */
const STORES = [
  { icon: 'store', name: 'Sharma Kirana' },
  { icon: 'leaf', name: 'FreshMart' },
  { icon: 'shield', name: 'DailyNeeds' },
  { icon: 'box', name: 'Annapurna' },
  { icon: 'spark', name: 'Green Basket', cls: 'font-serif text-xl font-normal' },
  { icon: 'grid', name: 'METRO BAZAAR', cls: 'tracking-tight font-extrabold' },
  { icon: 'bolt', name: 'QuickStop' },
];

const PROBLEMS = [
  { icon: 'alert', title: 'Intuition-based restocking', body: 'Reliance on guesswork for stock ordering leads to spoilage on slow days and stockouts on busy ones.' },
  { icon: 'receipt', title: 'Manual data entry & disconnected billing', body: 'Inefficient billing processes with no link between the counter and any predictive tools.' },
  { icon: 'trend', title: 'Inaccessible analytics', body: 'The cost and complexity of enterprise tools keep actionable insights away from small shops.' },
];

const PILLARS = [
  { icon: 'scan', title: 'Zero-friction data capture', body: 'Every transaction deducts stock and logs sales velocity automatically.' },
  { icon: 'cpu', title: 'Predictive intelligence', body: 'An ML engine studies your sales patterns to recommend what, when and how much to restock.' },
  { icon: 'chat', title: 'Conversational decision support', body: 'An AI assistant answers in plain language with visual charts and concrete next steps.' },
];

const MODULES = [
  {
    tag: 'Module 01',
    title: 'Smart POS billing & hardware integration',
    img: IMG_SHELVES,
    alt: 'Packaged goods on store shelves',
    points: [
      ['Dual-mode checkout', 'Manual item selection or barcode scanning.'],
      ['Automated inventory deduction', 'Stock updates in real time on every bill.'],
      ['Digital balance sheet & ledger', 'UPI, cash and khata tracked for you.'],
      ['Stock-in & wastage logging', 'One-tap quick actions keep inventory honest.'],
    ],
  },
  {
    tag: 'Module 02',
    title: 'Predictive restocking & profit engine',
    img: IMG_PRODUCE,
    alt: 'Fresh vegetables at a market stall',
    points: [
      ['Seasonal & monthly rate analysis', 'Forecasts built from historical and live data.'],
      ['Quantity & shelf-life optimisation', 'Reorder quantities that minimise spoilage.'],
      ['Low-stock & dead-stock alerts', 'Timely nudges before it costs you money.'],
    ],
  },
  {
    tag: 'Module 03',
    title: 'Visual AI retail assistant',
    img: IMG_CITRUS,
    alt: 'Citrus fruit displayed in a grocery store',
    points: [
      ['Natural language querying', 'Ask "How much milk is left?" and get an answer.'],
      ['On-demand graphs & numbers', 'Interactive charts right inside the chat.'],
      ['Actionable recommendations', 'Approve the suggested order in one tap.'],
    ],
  },
];

const FLOW = [
  { n: '01', title: 'Checkout', body: 'Seamless billing with automatic stock and sales updates.', icon: 'cart' },
  { n: '02', title: 'Sync', body: 'Secure transaction recording and inventory adjustment.', icon: 'shield' },
  { n: '03', title: 'Analyze', body: 'The ML service processes sales trends for informed decisions.', icon: 'cpu' },
  { n: '04', title: 'Act', body: 'Approve restocks from the dashboard or the AI assistant.', icon: 'bolt' },
];

function heroVisual() {
  const tasks = ['Approve PO: White Eggs × 12 crates', 'Reorder Amul Milk × 45 pkts', 'Discount Masti Dahi before expiry', 'Log tomato wastage'];
  const bars = [[34, 14], [26, 10], [40, 16], [36, 12], [48, 20], [58, 22], [44, 18], [40, 15], [46, 17], [52, 19], [60, 24]];
  return `<div class="relative mx-auto h-[400px] w-full max-w-[480px] sm:h-[360px]">
    <div class="absolute right-0 top-0 w-[86%] animate-fade-up rounded-xl border border-blush-deep bg-white/95 p-4 shadow-[0_10px_30px_-12px] shadow-ink/15 [animation-delay:100ms]">
      <div class="flex items-center justify-between text-[13px]"><span class="font-medium">Today's restock tasks</span><span class="text-[11px] text-muted">1 of 4 approved</span></div>
      <div class="mt-3 h-[3px] rounded-full bg-blush-deep"><div class="h-full w-[22%] rounded-full bg-brand"></div></div>
      <ul class="mt-2 divide-y divide-blush-deep/70 text-[11.5px] text-ink/75">${tasks.map((t, i) => `
        <li class="flex items-center justify-between py-2.5"><span class="flex items-center gap-2.5">
          <span class="grid size-3.5 place-items-center rounded-full border ${i === 0 ? 'border-brand bg-brand text-white' : 'border-ink/20'}">${i === 0 ? icon('check', 'size-2.5') : ''}</span>
          <span class="${i === 0 ? 'text-muted line-through' : ''}">${t}</span></span>
          ${i === 1 ? `<span class="flex -space-x-1">${['bg-amber-soft', 'bg-blush-deep', 'bg-amber'].map((c) => `<span class="size-3.5 rounded-full border border-white ${c}"></span>`).join('')}</span>` : '<span class="size-2.5 rounded-full bg-blush-deep"></span>'}</li>`).join('')}</ul>
    </div>
    <div class="absolute left-0 top-[74px] w-[62%] animate-fade-up rounded-xl border border-blush-deep bg-white p-3 shadow-[0_12px_30px_-10px] shadow-ink/20 [animation-delay:250ms]">
      <div class="flex items-center gap-2 text-[12px]"><span class="rounded-md bg-blush-deep px-1.5 py-0.5 font-medium text-brand">/ask</span>How much milk is left?</div>
      <div class="mt-3 flex items-center gap-3 text-ink/60">${icon('plus', 'size-3.5')}<span class="text-[11px] font-semibold">A</span>${icon('smile', 'size-3.5')}${icon('at', 'size-3.5')}<span class="h-3 w-px bg-line"></span>${icon('video', 'size-3.5')}${icon('mic', 'size-3.5')}${icon('send', 'ml-auto size-3.5')}</div>
    </div>
    <div class="absolute bottom-0 left-[6%] w-[54%] animate-fade-up rounded-xl border border-blush-deep bg-white p-3.5 shadow-[0_12px_30px_-10px] shadow-ink/20 [animation-delay:400ms]">
      <p class="text-[11.5px] font-medium">Sales by category</p>
      <div class="mt-1 flex gap-3 text-[9.5px] text-muted"><span class="flex items-center gap-1"><span class="size-1.5 rounded-sm bg-brand"></span>Dairy</span><span class="flex items-center gap-1"><span class="size-1.5 rounded-sm bg-amber"></span>Produce</span></div>
      <div class="mt-3 flex h-24 items-end gap-1.5 border-l border-line pl-1.5">${bars.map(([a, b]) => `<div class="flex flex-1 flex-col justify-end"><div class="bg-amber" style="height:${b * 1.1}px"></div><div class="bg-brand" style="height:${a * 0.95}px"></div></div>`).join('')}</div>
    </div>
    <div class="absolute bottom-6 right-[2%] w-[56%] animate-fade-up rounded-xl border border-blush-deep bg-white p-3.5 shadow-[0_14px_34px_-10px] shadow-ink/25 [animation-delay:550ms]">
      <span class="inline-block rounded-md bg-amber-soft px-2 py-1 text-[11px] font-medium text-ink/80">Amul Taaza Milk — expiring</span>
      <dl class="mt-3 space-y-2 text-[11px]"><div class="flex justify-between"><dt class="text-ink/70">Stock left</dt><dd class="font-medium">14 pkts</dd></div><div class="flex justify-between"><dt class="text-ink/70">Run-out</dt><dd class="font-medium">Today, 5:30 PM</dd></div></dl>
      <div class="mt-3 rounded-md border border-line py-2 text-center text-[11px] font-medium">Approve PO (45 pkts)</div>
    </div>
  </div>`;
}

function introPage() {
  const nav = [['Problem', '#problem'], ['Solution', '#solution'], ['Modules', '#modules'], ['Workflow', '#workflow'], ['Technology', '#tech'], ['About us', '#about']];
  return `<div class="min-h-screen bg-blush">
    <a href="#workflow" class="block bg-blush-deep py-2 text-center text-[13px] font-medium text-ink/85 transition hover:text-ink">What if your shelves restocked themselves… before you opened? <span aria-hidden="true">→</span></a>
    <header class="sticky top-0 z-30 bg-blush/85 backdrop-blur-md"><div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">${logo()}
      <nav class="hidden items-center gap-7 text-sm text-ink/85 md:flex">${nav.map(([l, h]) => `<a href="${h}" class="transition hover:text-brand">${l}</a>`).join('')}</nav>
      <button data-act="open-login" class="rounded-full bg-blush-deep px-6 py-2.5 text-sm font-medium transition hover:brightness-95">Login</button></div></header>
    <section class="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-16 pt-12 lg:grid-cols-[1fr_1fr] lg:pt-20">
      <div class="animate-fade-up">
        <span class="rounded-md border border-blush-deep bg-white/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/70">Retail intelligence</span>
        <h1 class="mt-6 font-serif text-[52px] leading-[1.02] tracking-tight text-ink sm:text-[64px]">Built for retailers who are done with guesswork</h1>
        <p class="mt-6 max-w-md text-[15px] leading-relaxed text-ink/75">A comprehensive billing, automated inventory, and predictive restocking platform for small-to-mid-sized retailers, engineered to optimise profit margins and reduce waste.</p>
        <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/80">${['Smart POS billing', 'Demand forecasting', 'AI assistant'].map((t) => `<li class="flex items-center gap-2"><span class="grid size-5 place-items-center rounded-full bg-brand text-white">${icon('check', 'size-3')}</span>${t}</li>`).join('')}</ul>
      </div>${heroVisual()}
    </section>
    <section aria-label="Retailers using RetailOS" class="mx-auto max-w-6xl px-6 pb-14"><div class="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 text-ink/70">${STORES.map((s) => `<span class="flex items-center gap-2 text-lg font-semibold ${s.cls || ''}">${icon(s.icon, 'size-4.5')}${s.name}</span>`).join('')}</div></section>
    <div class="mx-auto max-w-6xl border-t border-blush-deep"></div>
    <section id="problem" class="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <h2 class="max-w-3xl font-serif text-[40px] leading-tight tracking-tight sm:text-5xl">Designed for margins, shelves, and speed</h2>
      <p class="mt-4 max-w-xl text-ink/70">Retailers lose money every day to three problems that enterprise software never solved for the corner store.</p>
      <div class="mt-12 grid gap-5 md:grid-cols-3">${PROBLEMS.map((p) => `<article class="rounded-2xl border border-blush-deep bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"><span class="grid size-10 place-items-center rounded-lg bg-blush-deep text-brand">${icon(p.icon, 'size-5')}</span><h3 class="mt-6 text-lg font-semibold">${p.title}</h3><p class="mt-2 text-sm leading-relaxed text-ink/65">${p.body}</p></article>`).join('')}</div>
    </section>
    <section id="solution" class="scroll-mt-20 bg-white"><div class="mx-auto grid max-w-6xl gap-14 px-6 py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div class="overflow-hidden rounded-3xl"><img src="${IMG_PRODUCE}" alt="Fresh vegetables and produce" class="aspect-[5/4] w-full object-cover transition duration-700 hover:scale-105" /></div>
      <div><span class="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Proposed solution</span>
        <h2 class="mt-4 font-serif text-[40px] leading-tight tracking-tight sm:text-5xl">A closed-loop AI retail ecosystem</h2>
        <p class="mt-4 text-ink/70">POS billing, machine-learning demand forecasting and a conversational assistant, working together so data capture and restocking decisions happen on their own.</p>
        <div class="mt-10 space-y-6">${PILLARS.map((p) => `<div class="flex gap-4"><span class="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">${icon(p.icon, 'size-5')}</span><div><h3 class="font-semibold">${p.title}</h3><p class="mt-1 text-sm text-ink/65">${p.body}</p></div></div>`).join('')}</div>
      </div></div>
    </section>
    <section id="modules" class="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Key features</span>
      <h2 class="mt-4 max-w-2xl font-serif text-[40px] leading-tight tracking-tight sm:text-5xl">Three modules, one store brain</h2>
      <div class="mt-12 grid gap-6 lg:grid-cols-3">${MODULES.map((m) => `<article class="group overflow-hidden rounded-2xl border border-blush-deep bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
        <div class="overflow-hidden"><img src="${m.img}" alt="${m.alt}" class="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" /></div>
        <div class="p-7"><span class="text-xs font-medium text-muted">${m.tag}</span><h3 class="mt-2 font-serif text-[28px] leading-tight">${m.title}</h3>
        <ul class="mt-5 space-y-3">${m.points.map(([t, d]) => `<li class="flex gap-2.5 text-sm">${icon('check', 'mt-0.5 size-4 shrink-0 text-brand')}<span><span class="font-medium">${t}.</span> <span class="text-ink/65">${d}</span></span></li>`).join('')}</ul></div></article>`).join('')}</div>
    </section>
    <section id="workflow" class="scroll-mt-20 bg-white"><div class="mx-auto max-w-6xl px-6 py-24">
      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-brand">End-to-end workflow</span>
      <h2 class="mt-4 max-w-2xl font-serif text-[40px] leading-tight tracking-tight sm:text-5xl">From the counter to the supplier, automatically</h2>
      <ol class="relative mt-14 grid gap-8 md:grid-cols-4"><span class="absolute left-0 right-0 top-5 hidden h-px bg-blush-deep md:block" aria-hidden="true"></span>${FLOW.map((s) => `<li class="relative"><span class="relative grid size-10 place-items-center rounded-full border border-blush-deep bg-white text-brand">${icon(s.icon)}</span><p class="mt-5 font-serif text-xl text-muted">${s.n}</p><h3 class="mt-1 text-lg font-semibold">${s.title}</h3><p class="mt-1.5 text-sm text-ink/65">${s.body}</p></li>`).join('')}</ol>
    </div></section>
    <section id="tech" class="mx-auto max-w-6xl scroll-mt-20 px-6 py-24"><div class="grid gap-10 rounded-3xl bg-night p-10 text-white sm:p-14 lg:grid-cols-2 lg:items-center">
      <div><span class="text-xs font-semibold uppercase tracking-[0.14em] text-amber">Tech stack</span><h2 class="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Fast at the counter. Smart behind it.</h2><p class="mt-4 text-white/65">A fast POS front end, backed by a forecasting service and a conversational AI layer, all connected to your barcode hardware.</p></div>
      <div class="flex flex-wrap gap-3">${['POS & barcode hardware', 'ML demand forecasting', 'Conversational AI', 'Digital ledger & khata', 'Secure sync'].map((t) => `<span class="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85">${t}</span>`).join('')}</div>
    </div></section>
    <div class="bg-white"><div class="mx-auto max-w-6xl px-6 py-24">${aboutUs('blush')}</div></div>
    <footer class="border-t border-blush-deep"><div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink/60 sm:flex-row">${logo()}<p>© 2026 RetailOS · Retail Intelligence Framework</p></div></footer>
  </div>`;
}

/* ---------- Upload Page ---------- */
function uploadPage() {
  const steps = ['Sign in', 'Upload data', 'Dashboard'];
  return `<div class="min-h-screen bg-canvas">
    <header class="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-white/90 px-5 py-3 backdrop-blur-md lg:px-8">
      <span class="flex items-center gap-2 font-semibold">${brandMark('h-6 w-8')} RetailAI OS</span>
      <ol class="mx-auto hidden items-center gap-3 text-xs font-medium sm:flex">${steps.map((s, i) => `<li class="flex items-center gap-3"><span class="flex items-center gap-2 ${i <= 1 ? 'text-ink' : 'text-subtle'}">
        <span class="grid size-5 place-items-center rounded-full text-[10px] ${i === 0 ? 'bg-brand text-white' : i === 1 ? 'border-2 border-brand text-brand' : 'border border-line'}">${i === 0 ? icon('check', 'size-3') : i + 1}</span>${s}</span>${i < steps.length - 1 ? '<span class="h-px w-8 bg-line"></span>' : ''}</li>`).join('')}</ol>
      <div class="ml-auto flex items-center gap-3"><span class="grid size-8 place-items-center rounded-full bg-amber-soft text-xs font-semibold text-amber">${esc(initials(S.userName))}</span>
        <button data-act="logout" aria-label="Sign out" class="text-muted hover:text-ink">${icon('logout')}</button></div>
    </header>
    <main class="mx-auto max-w-6xl animate-fade-up px-5 py-8 lg:px-8">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 class="font-serif text-4xl tracking-tight">Set up your store data</h1><p class="mt-1 text-sm text-muted">Upload past sales or stock, scan a delivery, and confirm your store details.</p></div>
        <button data-act="to-dashboard" class="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110">Continue to dashboard ${icon('arrow')}</button>
      </div>
      <div id="import-root"></div>
    </main>
    <div class="mt-12 border-t border-line bg-white"><div class="mx-auto max-w-6xl px-5 py-24 lg:px-8">${aboutUs('canvas')}</div></div>
    <footer class="border-t border-line bg-white py-8 text-center text-sm text-muted">© 2026 RetailOS · Retail Intelligence Framework</footer>
  </div>`;
}

ACT['to-dashboard'] = () => {
  UI.view = 'dashboard';
  setPage('dashboard');
};

/* ==========================================================================
   Login Modal + Authentication (Email / Phone / Google)
   ========================================================================== */
const LG = {
  tab: 'email',
  mode: 'signin',
  ident: '',
  password: '',
  store: '',
  name: '',
  error: '',
  info: '',
  loading: false,
};

function loginValidate() {
  if (LG.mode !== 'forgot' && !LG.name.trim()) return 'Please tell us your name.';
  if (LG.mode !== 'forgot' && !LG.name.trim()) return 'Please tell us your name.';
  if (LG.tab === 'email' && !/^\S+@\S+\.\S+$/.test(LG.ident)) return 'Enter a valid email address.';
  if (LG.tab === 'phone' && !/^\+?\d[\d\s-]{9,}$/.test(LG.ident)) return 'Enter a valid 10-digit phone number.';
  if (LG.mode !== 'forgot' && LG.password.length < 6) return 'Password must be at least 6 characters.';
  if (LG.mode === 'signup' && !LG.store.trim()) return 'Enter your store name.';
  return '';
}

function loginModal() {
  const input = 'mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-ink/50 focus:ring-4 focus:ring-ink/5';
  const m = LG.mode;
  return `<div class="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="login-title">
    <div data-act="login-close" class="absolute inset-0 ${an('animate-fade-in')} bg-ink/40 backdrop-blur-sm"></div>
    <div class="relative grid w-full max-w-5xl ${an('animate-pop')} overflow-hidden rounded-2xl bg-white shadow-2xl shadow-ink/30 md:min-h-[580px] md:grid-cols-[1fr_1.03fr]">
      <button type="button" data-act="login-close" aria-label="Close" class="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white">${icon('close')}</button>
      <form data-submit="login" class="flex flex-col items-center justify-center px-8 py-12 sm:px-14" novalidate>
        <div class="w-full max-w-[268px]">
          <div class="flex flex-col items-center text-center">${logo({ size: 'lg' })}<p id="login-title" class="mt-3 text-sm text-ink/80">${m === 'signup' ? 'Create your store account.' : m === 'forgot' ? 'Reset your password.' : 'Sign in to manage your retail operations.'}</p></div>
          <div class="mt-6 grid grid-cols-2 rounded-full bg-canvas p-1 text-[13px]">${['email', 'phone'].map((t) => `<button type="button" data-act="login-tab" data-tab="${t}" class="rounded-full py-1.5 transition ${LG.tab === t ? 'bg-ink/90 text-white shadow-sm' : 'text-muted hover:text-ink'}">${t === 'email' ? 'Email Address' : 'Phone Number'}</button>`).join('')}</div>
          ${m !== 'forgot' ? `<div class="mt-4"><label for="uname" class="text-xs text-ink/80">Your name</label><input id="uname" data-f="uname" data-in="lg-name" value="${esc(LG.name)}" autocomplete="given-name" placeholder="e.g., Rajesh" class="${input}" /></div>` : ''}
          ${m === 'signup' ? `<div class="mt-4"><label for="store" class="text-xs text-ink/80">Store name</label><input id="store" data-f="store" data-in="lg-store" value="${esc(LG.store)}" placeholder="e.g., Sharma General Store" class="${input}" /></div>` : ''}
          <div class="mt-4"><label for="ident" class="text-xs text-ink/80">${LG.tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
            <input id="ident" data-f="ident" data-in="lg-ident" value="${esc(LG.ident)}" type="${LG.tab === 'email' ? 'email' : 'tel'}" autocomplete="${LG.tab === 'email' ? 'email' : 'tel'}" placeholder="${LG.tab === 'email' ? 'e.g., alex@retailos.com' : 'e.g., 98765 43210'}" class="${input}" /></div>
          ${m !== 'forgot' ? `<div class="mt-3"><div class="flex items-center justify-between"><label for="pw" class="text-xs text-ink/80">Password</label>
            ${m === 'signin' ? '<button type="button" data-act="login-forgot" class="text-[11px] text-ink/70 hover:text-ink hover:underline">Forgot password?</button>' : ''}</div>
            <input id="pw" data-f="pw" data-in="lg-pw" type="password" value="${esc(LG.password)}" autocomplete="${m === 'signup' ? 'new-password' : 'current-password'}" placeholder="••••••••" class="${input}" /></div>` : ''}
          ${LG.error ? `<p class="mt-3 text-xs text-danger" role="alert">${esc(LG.error)}</p>` : ''}
          ${LG.info ? `<p class="mt-3 text-xs text-brand">${esc(LG.info)}</p>` : ''}
          <button type="submit" ${dis(LG.loading)} class="mt-5 flex w-full items-center justify-center rounded-md bg-ink/90 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-ink disabled:opacity-70">
            ${LG.loading ? '<span class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>' : m === 'signup' ? 'Create Account' : m === 'forgot' ? 'Send Reset Link' : 'Sign In'}</button>
          <div class="my-3 flex items-center gap-3 text-xs text-muted"><span class="h-px flex-1 bg-line"></span> or <span class="h-px flex-1 bg-line"></span></div>
          <button type="button" data-act="login-google" ${dis(LG.loading)} class="flex w-full items-center justify-center gap-2.5 rounded-md border border-line py-2.5 text-sm text-ink transition hover:bg-canvas">
            <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5Z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9.2l3.5-2.7Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7C7 7.7 9.3 5.9 12 5.9Z"/></svg>Continue with Google</button>
          <p class="mt-5 text-center text-[11px] text-ink/70">${m === 'signup' ? 'Already have an account? ' : "Don't have an account? "}<button type="button" data-act="login-switch" class="font-semibold text-ink hover:underline">${m === 'signup' ? 'Sign in' : 'Sign up'}</button></p>
        </div>
      </form>
      <div class="relative hidden bg-night md:block"><img src="assets/login-visual.png" alt="RetailOS predictive demand, restock alerts, POS status and AI assistant" class="absolute inset-0 size-full object-cover object-right" /></div>
    </div>
  </div>`;
}

function renderLogin() {
  const root = $('#login-root');
  if (!root) return;
  if (!UI.loginOpen) {
    root.innerHTML = '';
    document.body.style.overflow = '';
    return;
  }
  document.body.style.overflow = 'hidden';
  withFocus(() => { root.innerHTML = loginModal(); });
}

function openLogin() {
  if (UI.page !== 'intro') return;
  UI.loginOpen = true;
  LG.name = LG.name || S.userName;
  withAnim(renderLogin);
}

ACT['open-login'] = openLogin;
ACT['login-close'] = () => { UI.loginOpen = false; renderLogin(); };
ACT['login-tab'] = (el) => { LG.tab = el.dataset.tab; LG.ident = ''; LG.error = ''; renderLogin(); };
ACT['login-forgot'] = () => { LG.mode = 'forgot'; LG.error = ''; renderLogin(); };
ACT['login-switch'] = () => { LG.mode = LG.mode === 'signup' ? 'signin' : 'signup'; LG.error = ''; renderLogin(); };

INP['lg-name'] = (el) => (LG.name = el.value);
INP['lg-store'] = (el) => (LG.store = el.value);
INP['lg-ident'] = (el) => (LG.ident = el.value);
INP['lg-pw'] = (el) => (LG.password = el.value);

async function finishLogin(res) {
  if (res && res.token) api.setToken(res.token);
  if (res && res.user) applyUser(res.user);
  if (LG.name.trim() && !S.userName) S.userName = LG.name.trim();
  await loadState();
  UI.loginOpen = false;
  LG.loading = false;
  LG.password = '';
  renderLogin();
  setPage('upload');
}

SUB.login = async () => {
  const err = loginValidate();
  LG.error = err;
  LG.info = '';
  if (err) return renderLogin();

  // Demo mode (no backend connected)
  if (net.demo) {
    if (LG.mode === 'forgot') {
      LG.info = `A reset link has been sent to ${LG.ident}.`;
      LG.mode = 'signin';
      return renderLogin();
    }
    LG.loading = true;
    renderLogin();
    S.userName = LG.name.trim();
    if (LG.mode === 'signup') S.storeName = LG.store.trim();
    persist();
    return setTimeout(() => finishLogin(null), 800);
  }

  // Live Backend connected
  LG.loading = true;
  renderLogin();
  try {
    const isUp = await api.health();
    if (!isUp) throw new ApiError(NOT_CONNECTED, 0);

    const body = {
      method: LG.tab,
      identifier: LG.ident.trim(),
      password: LG.password,
      name: LG.name.trim(),
    };

    if (LG.mode === 'forgot') {
      await api.post('/auth/forgot', { method: LG.tab, identifier: LG.ident.trim() });
      LG.info = `A reset link has been sent to ${LG.ident}.`;
      LG.mode = 'signin';
      LG.loading = false;
      return renderLogin();
    }

    const endpoint = LG.mode === 'signup' ? '/auth/signup' : '/auth/login';
    const payload = LG.mode === 'signup' ? { ...body, store: LG.store.trim() } : body;
    const res = await api.post(endpoint, payload);
    await finishLogin(res);
  } catch (e) {
    LG.loading = false;
    LG.error = e.status === 0 ? NOT_CONNECTED : e.message || 'Could not sign in.';
    renderLogin();
  }
};

/* ---------- Google Sign-In (GIS Integration) ---------- */
let googleScriptPromise = null;
function loadGoogle() {
  if (window.google && window.google.accounts) return Promise.resolve();
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = CFG.GOOGLE_SCRIPT;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => {
        googleScriptPromise = null;
        reject(new Error('Could not load Google Sign-In script.'));
      };
      document.head.appendChild(s);
    });
  }
  return googleScriptPromise;
}

ACT['login-google'] = async () => {
  LG.error = '';
  LG.info = '';

  if (net.demo) {
    LG.loading = true;
    renderLogin();
    return setTimeout(() => finishLogin(null), 800);
  }

  if (!(await api.health())) {
    LG.error = NOT_CONNECTED;
    return renderLogin();
  }

  if (!CFG.GOOGLE_CLIENT_ID) {
    LG.error = 'Google Sign-In is not configured. Set GOOGLE_CLIENT_ID in js/config.js.';
    return renderLogin();
  }

  try {
    await loadGoogle();
    const client = google.accounts.oauth2.initCodeClient({
      client_id: CFG.GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback: async (r) => {
        if (r.error || !r.code) {
          LG.loading = false;
          LG.error = 'Google Sign-In was cancelled.';
          return renderLogin();
        }
        LG.loading = true;
        renderLogin();
        try {
          const res = await api.post('/auth/google', { code: r.code });
          await finishLogin(res);
        } catch (e) {
          LG.loading = false;
          LG.error = e.status === 0 ? NOT_CONNECTED : e.message || 'Google Sign-In failed.';
          renderLogin();
        }
      },
      error_callback: () => {
        LG.loading = false;
        LG.error = 'Google Sign-In was cancelled.';
        renderLogin();
      },
    });
    client.requestCode();
  } catch (e) {
    LG.error = e.message;
    renderLogin();
  }
};

/* ---------- Session & Logout ---------- */
let introTimerArmed = false;

async function logout(silent = false) {
  if (remote() && api.token && !silent) {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
  }
  api.setToken('');
  UI.loginOpen = false;
  UI.modal = null;
  UI.cart = [];
  UI.view = 'dashboard';
  UI.menuOpen = false;
  introTimerArmed = false;
  renderLogin();
  renderModal();
  setPage('intro');
}

ACT.logout = () => logout();

window.addEventListener('session-expired', () => {
  if (UI.page !== 'intro') {
    logout(true);
    toast('Session expired. Please sign in again.');
  }
});
