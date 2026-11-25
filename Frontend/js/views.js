/* ==========================================================================
   RetailOS - Dashboard Views: Overview, POS, Inventory, Forecast, Ledger, Wastage
   ========================================================================== */

const cap = (s) => (s ? s.replace(/^./, (c) => c.toUpperCase()) : '');

const OV = { showAll: false };
const PS = { mode: 'scan', code: '', cat: 'All', payment: 'UPI', customer: '', flash: '' };
const IV = { filter: 'All', q: '' };
const FC = { sel: null };
const LD = { tab: 'bills' };

// --- NEW: Django POS Checkout Integration ---
async function handleCheckout() {
  // S.cart is assuming your global store holds cart items in S.cart
  // PS.payment holds 'UPI', 'Cash', etc. from line 8
  const payload = {
    payment_method: PS.payment, 
    items: S.cart.map(item => ({
      product_id: item.id,
      quantity: item.qty
    }))
  };

  try {
    const invoice = await api.post('pos/invoices/', payload);
    toast(`Bill saved successfully! Total: ₹${invoice.total_amount}`);
    
    // Clear cart and update UI
    S.cart = []; 
    renderApp();
  } catch (error) {
    toast("Checkout failed. Stock was not deducted.", 'error');
  }
}

/* ---------- Overview View ---------- */
function overviewView() {
  const t = useToday();
  const tileCls = 'rounded-3xl border';
  const hoverTile = 'transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5';

  const recs = S.products
    .map((p) => ({
      p,
      r: recommend(p),
      po: S.pos.find((o) => o.productId === p.id && o.status === 'Pending'),
    }))
    .filter(({ p, r, po }) => (r.needs || po) && !S.dismissed.includes(p.id))
    .sort((a, b) => a.p.stock / (a.r.f || 1) - b.p.stock / (b.r.f || 1));

  const open = recs.filter((x) => !x.po);
  const lowStock = S.products.filter((p) => recommend(p).needs);
  const expiring = S.products.filter(isExpiring).sort((a, b) => b.expQty - a.expQty);
  const riskValue = expiring.reduce((s, p) => s + p.expQty * p.cost, 0);
  const top = [...S.products]
    .filter((p) => avg(p.history.slice(-7)) >= 1)
    .sort((a, b) => trendPct(b) - trendPct(a))[0];

  const urgent = open.filter(({ p, r }) => p.stock / (r.f || 1) < 1);
  const days = Array.from({ length: 7 }, (_, k) => 7 + k);
  const actualDays = days.map((d) => S.products.reduce((s, p) => s + (p.history[d] || 0) * p.price, 0));
  const fRev = S.products.reduce((s, p) => s + forecastDaily(p) * p.price, 0);
  const actual = [...actualDays, null, null, null];
  const predicted = [
    ...days.map((d) => S.products.reduce((s, p) => s + avg(p.history.slice(d - 7, d)) * p.price, 0)),
    fRev,
    fRev * 1.06,
    fRev * 1.12,
  ];
  const labels = [...days.map((_, k) => weekday(k - 7)), 'Today', weekday(1), weekday(2)];
  const visible = OV.showAll ? recs : recs.slice(0, 3);
  const payRows = [
    ['UPI', t.pay.UPI, 'bg-brand'],
    ['Cash', t.pay.Cash, 'bg-amber'],
    ['Khata', t.pay.Khata, 'bg-danger'],
  ];
  const lastBill = t.today[t.today.length - 1];
  const n = urgent.length || open.length;

  return `<div class="grid grid-cols-1 gap-6 md:grid-cols-6 xl:grid-cols-12">
    <!-- Morning Briefing Card -->
    <section class="relative overflow-hidden rounded-3xl bg-night p-8 text-white md:col-span-6 xl:col-span-8">
      <div class="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/45 blur-3xl"></div>
      <div class="relative flex h-full flex-col">
        <p class="flex items-center gap-2 text-xs text-white/55">${icon('spark', 'size-3.5 text-amber')} Morning briefing · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        <p class="mt-4 max-w-xl font-serif text-3xl leading-snug">${top ? `${esc(top.name.split(' (')[0])} demand is up <em class="text-amber">+${Math.round(trendPct(top))}%</em> this week. ` : ''}${open.length ? `${n} item${n > 1 ? 's' : ''} need restocking before 6 PM.` : 'All items are stocked for today.'}</p>
        <div class="mt-auto flex flex-wrap gap-3 pt-8">
          ${open.length > 0 ? `<button data-act="ov-approve-all" class="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-amber-soft">${icon('bolt')} Approve all ${open.length} orders</button>` : ''}
          <button data-act="nav" data-view="forecast" class="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">View forecasts ${icon('arrow')}</button>
        </div>
      </div>
    </section>

    <!-- Today's Sales KPI -->
    <button data-act="nav" data-view="ledger" class="${tileCls} border-tint-mint-edge bg-tint-mint ${hoverTile} flex flex-col p-7 text-left md:col-span-6 xl:col-span-4">
      <span class="text-xs font-medium text-muted">Today's sales</span>
      <p class="mt-3 text-[40px] font-semibold leading-none tracking-tight">${inr(t.sales)}</p>
      <p class="mt-2 text-sm text-muted">Selling price ${inr(t.sales)} · Actual price ${inr(t.sales - t.profit)}</p>
      <div class="mt-auto w-full pt-6">${sparkline(actualDays)}</div>
    </button>

    <!-- Profit KPI -->
    <button data-act="nav" data-view="ledger" class="${tileCls} border-tint-sand-edge bg-tint-sand ${hoverTile} p-7 text-left md:col-span-2 xl:col-span-4">
      <span class="text-xs font-medium text-muted">Profit</span>
      <p class="mt-3 text-3xl font-semibold tracking-tight">${inr(t.profit)}</p>
    </button>

    <!-- Low Stock KPI -->
    <button data-act="nav" data-view="forecast" class="${tileCls} border-tint-blush-edge bg-tint-blush ${hoverTile} p-7 text-left md:col-span-2 xl:col-span-4">
      <span class="text-xs font-medium text-muted">Low stock</span>
      <p class="mt-3 text-3xl font-semibold tracking-tight">${lowStock.length} items</p>
      <p class="mt-1.5 truncate text-sm text-danger">${lowStock.length ? esc(lowStock.slice(0, 3).map((p) => cap(p.keywords[0])).join(', ')) : 'All stocked'}</p>
    </button>

    <!-- Wastage Risk KPI -->
    <button data-act="nav" data-view="wastage" class="${tileCls} border-tint-amber-edge bg-tint-amber ${hoverTile} p-7 text-left md:col-span-2 xl:col-span-4">
      <span class="text-xs font-medium text-muted">Wastage risk</span>
      <p class="mt-3 text-3xl font-semibold tracking-tight">${expiring[0] ? `${qty(expiring[0].expQty, expiring[0].unit)} ${esc(cap(expiring[0].keywords[0]))}` : 'None'}</p>
      <p class="mt-1.5 text-sm text-amber">${expiring.length ? `Expiring &lt;24h · ${inr(riskValue)} at risk` : 'Nothing expiring'}</p>
    </button>

    <!-- Inventory Grid (Placed where Restock Recommendations was) -->
    <section class="${tileCls} border-line/80 bg-white flex flex-col md:col-span-6 xl:col-span-7 xl:row-span-2">
      <div class="flex items-center justify-between px-7 pb-3 pt-7">
        <div>
          <h2 class="font-semibold">Inventory</h2>
          <p class="mt-0.5 text-xs text-subtle">${S.products.length} items · ${lowStock.length} low stock</p>
        </div>
        <button data-act="nav" data-view="inventory" class="text-sm font-medium text-brand hover:underline">See all</button>
      </div>
      <div class="flex-1 overflow-x-auto px-3 pb-5">
        <table class="w-full text-left text-sm">
          <thead class="text-xs text-subtle">
            <tr class="border-b border-line">
              ${['Item', 'Stock', 'Selling price', 'Actual price', 'Profit', 'Status'].map((h) => `<th class="px-4 py-2.5 font-medium">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            ${S.products.slice(0, 6).map((p) => {
              const s = stockStatus(p);
              const unitProfit = p.price - p.cost;
              return `<tr class="transition hover:bg-canvas/60">
                <td class="px-4 py-3">
                  <p class="font-medium">${esc(p.name)}</p>
                  <p class="text-xs text-subtle">${esc(p.category)}</p>
                </td>
                <td class="px-4 py-3 font-medium">${qty(p.stock, p.unit)}</td>
                <td class="px-4 py-3">${inr(p.price)}</td>
                <td class="px-4 py-3 text-muted">${inr(p.cost)}</td>
                <td class="px-4 py-3 font-medium ${unitProfit >= 0 ? 'text-brand' : 'text-danger'}">${inr(unitProfit)}</td>
                <td class="px-4 py-3"><span class="rounded-full px-2.5 py-1 text-[11px] font-medium ${s.cls}">${s.label}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Restock Recommendations (Placed where Actual vs AI Predicted was) -->
    <section class="${tileCls} border-tint-sky-edge bg-tint-sky flex flex-col p-7 md:col-span-6 xl:col-span-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold">Restock recommendations</h2>
          <p class="mt-0.5 text-xs text-subtle">AI engine · ${open.length} awaiting approval</p>
        </div>
        <button data-act="nav" data-view="forecast" class="text-sm font-medium text-brand hover:underline">See all</button>
      </div>
      ${recs.length === 0
        ? '<p class="flex flex-1 items-center justify-center py-10 text-sm text-muted">All caught up. No restocks needed.</p>'
        : `<ul class="mt-4 flex-1 divide-y divide-tint-sky-edge/70">${visible
            .map(({ p, r, po }) => {
              const short = p.shelfLife <= 4;
              return `<li class="py-3.5 first:pt-0 last:pb-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium">${esc(p.name)}</p>
                    <p class="mt-0.5 text-xs text-muted">${qty(p.stock, p.unit)} left · ${short ? `runs out <span class="text-danger">${runOutLabel(p).toLowerCase()}</span>` : `${qty(Math.round(r.f * 7), p.unit)} needed this week`}</p>
                  </div>
                  ${short ? `<span class="shrink-0 rounded-full bg-amber-soft px-2 py-0.5 text-[10px] font-medium text-amber">${p.shelfLife}-day shelf life</span>` : ''}
                </div>
                <div class="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <p class="text-xs text-ink/75">Order <strong class="font-semibold text-ink">${qty(r.qty || (po && po.qty) || 0, p.unit)}</strong>
                    <span class="text-muted"> · ${short ? `every ${r.cover} day${r.cover > 1 ? 's' : ''}` : `${inr(r.profit)} profit`}</span>
                  </p>
                  ${po
                    ? `<span class="flex items-center gap-2 text-xs">
                        <span class="flex items-center gap-1 font-medium text-brand">${icon('check')} PO #${po.no} sent</span>
                        <button data-act="po-receive" data-id="${po.id}" class="text-muted underline-offset-2 hover:text-ink hover:underline">Mark received</button>
                      </span>`
                    : `<span class="flex items-center gap-1.5">
                        <button data-act="ov-ignore" data-id="${p.id}" class="rounded-full px-2.5 py-1 text-xs text-muted transition hover:bg-white hover:text-ink">Ignore</button>
                        <button data-act="ov-approve" data-id="${p.id}" data-qty="${r.qty}" class="rounded-full bg-brand px-3.5 py-1 text-xs font-medium text-white transition hover:bg-brand-deep">Approve</button>
                      </span>`}
                </div>
              </li>`;
            })
            .join('')}</ul>`}
      ${recs.length > 3
        ? `<button data-act="ov-more" class="mt-4 w-full rounded-full border border-tint-sky-edge bg-white/70 py-1.5 text-xs font-medium text-muted transition hover:bg-white hover:text-ink">${OV.showAll ? 'Show less' : `Show ${recs.length - 3} more`}</button>`
        : ''}
    </section>

    <!-- Today's Collections Breakdown -->
    <section class="${tileCls} border-tint-lilac-edge bg-tint-lilac flex flex-col p-7 md:col-span-6 xl:col-span-5">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">Today's collections</h2>
        <button data-act="nav" data-view="ledger" class="text-sm font-medium text-brand hover:underline">Ledger</button>
      </div>
      <div class="mt-6 flex h-2 gap-1 overflow-hidden rounded-full">
        ${payRows.map(([l, v, c]) => `<div class="${c} rounded-full transition-all duration-700" style="width:${t.sales ? (v / t.sales) * 100 : 0}%"></div>`).join('')}
      </div>
      <ul class="mt-5 space-y-3 text-sm">
        ${payRows.map(([l, v, c]) => `<li class="flex items-center justify-between">
          <span class="flex items-center gap-2.5 text-ink/70"><span class="size-2 rounded-full ${c}"></span>${l}</span>
          <span class="font-medium">${inr(v)} <span class="ml-1 text-xs font-normal text-subtle">${t.sales ? Math.round((v / t.sales) * 100) : 0}%</span></span>
        </li>`).join('')}
      </ul>
      ${lastBill ? `<button data-act="quick" data-type="receipt" data-id="${lastBill.id}" class="mt-6 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-left text-sm transition hover:bg-brand-soft/60"><span class="text-muted">Last bill #${lastBill.no} · ${clock(lastBill.time)}</span><span class="flex items-center gap-1.5 font-medium">${inr(lastBill.total)} ${icon('arrow', 'size-3.5')}</span></button>` : ''}
    </section>
  </div>`;
}

ACT['ov-approve-all'] = async () => {
  const open = S.products
    .map((p) => ({
      p,
      r: recommend(p),
      po: S.pos.find((o) => o.productId === p.id && o.status === 'Pending'),
    }))
    .filter(({ p, r, po }) => (r.needs || po) && !S.dismissed.includes(p.id) && !po);
  for (const { p, r } of open) {
    await act.raisePO(p.id, r.qty);
  }
};
ACT['ov-approve'] = (el) => act.raisePO(el.dataset.id, Number(el.dataset.qty));
ACT['ov-ignore'] = async (el) => {
  const p = S.products.find((x) => x.id === el.dataset.id);
  if (await act.dismiss(el.dataset.id) && p) toast(`Ignored ${p.name} for today`);
};
ACT['ov-more'] = () => { OV.showAll = !OV.showAll; renderMain(); };

/* ---------- POS Billing View ---------- */
function posView() {
  const money = (n) => `₹${(n || 0).toFixed(2)}`;
  const billNow = new Date();
  const cats = ['All', ...new Set(S.products.map((p) => p.category))];
  const list = S.products.filter((p) => PS.cat === 'All' || p.category === PS.cat);
  const lines = UI.cart
    .map((l) => ({ l, p: S.products.find((p) => p.id === l.productId) }))
    .filter((x) => x.p);
  const totals = billTotals(
    lines.map(({ l, p }) => ({
      productId: p.id,
      name: p.name,
      unit: p.unit,
      qty: l.qty,
      price: p.price,
      cost: p.cost,
      gst: p.gst,
    }))
  );

  return `<div class="grid gap-6 xl:grid-cols-[1fr_360px]">
    <div class="space-y-4">
      <div class="${card} p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="grid grid-cols-2 rounded-lg bg-canvas p-1 text-sm font-medium">
            ${['scan', 'manual'].map((m) => `<button data-act="pos-mode" data-mode="${m}" class="flex items-center gap-2 rounded-md px-4 py-1.5 transition ${PS.mode === m ? 'bg-white text-ink shadow-sm' : 'text-muted'}">${icon(m === 'scan' ? 'barcode' : 'grid')}${m === 'scan' ? 'Barcode scan' : 'Manual select'}</button>`).join('')}
          </div>
          <span class="flex items-center gap-2 text-xs font-medium ${S.posReady ? 'text-brand' : 'text-danger'}">
            <span class="size-2 rounded-full ${S.posReady ? 'bg-brand' : 'bg-danger'}"></span>
            ${S.posReady ? 'Scanner connected' : 'POS paused. Turn on POS Ready to bill.'}
          </span>
        </div>
        ${PS.mode === 'scan'
          ? `<div class="mt-4">
              <form data-submit="pos-scan" class="relative">
                ${icon('barcode', 'absolute left-3 top-1/2 size-5 -translate-y-1/2 text-brand')}
                <input id="scan-input" data-f="scan-input" data-in="pos-code" value="${esc(PS.code)}" placeholder="Scan barcode or type name, then press Enter" class="${field} py-3 pl-11 text-base" />
              </form>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Try:</span>
                ${S.products.slice(0, 4).map((p) => `<button data-act="pos-add" data-id="${p.id}" class="rounded border border-line px-2 py-0.5 font-mono hover:border-brand/40 hover:text-brand">${esc(p.barcode)}</button>`).join('')}
                ${PS.flash ? `<span class="ml-auto animate-fade-in font-medium text-brand">${esc(PS.flash)}</span>` : ''}
              </div>
            </div>`
          : ''}
      </div>

      <!-- Category Filter Pills -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        ${cats.map((c) => `<button data-act="pos-cat" data-cat="${esc(c)}" class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${PS.cat === c ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:text-ink'}">${esc(c)}</button>`).join('')}
      </div>

      <!-- Product Tiles -->
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
        ${list.map((p) => {
          const inCart = (UI.cart.find((l) => l.productId === p.id) || {}).qty || 0;
          const out = p.stock - inCart <= 0;
          return `<button ${dis(out)} data-act="pos-add" data-id="${p.id}" class="${card} group relative p-3.5 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
            ${inCart > 0 ? `<span class="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-brand text-[10px] font-semibold text-white">${inCart}</span>` : ''}
            <p class="text-[10px] font-medium uppercase tracking-wide text-subtle">${esc(p.category)}</p>
            <p class="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-snug">${esc(p.name)}</p>
            <div class="mt-2 flex items-end justify-between">
              <span class="font-semibold">${inr(p.price)}</span>
              <span class="text-[11px] ${p.stock < 10 ? 'text-danger' : 'text-subtle'}">${out ? 'Out of stock' : `${p.stock} left`}</span>
            </div>
          </button>`;
        }).join('')}
      </div>
    </div>

    <!-- Active Cart Sidebar: the current bill, laid out like a printed bill -->
    <aside class="${card} flex h-fit flex-col xl:sticky xl:top-4">
      <div class="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 class="font-semibold">Current bill</h2>
        ${lines.length > 0 ? '<button data-act="pos-clear" class="text-xs text-muted hover:text-danger">Clear</button>' : ''}
      </div>
      <div class="px-5 pt-4">
        <div class="rounded-xl border border-dashed border-ink/25 bg-canvas/60 px-4 py-4 font-mono text-xs">
          <p class="text-center text-sm font-bold uppercase tracking-wide">${esc(S.storeName)}</p>
          <p class="text-center text-[10px] uppercase tracking-widest text-subtle">Retail invoice</p>
          <div class="my-3 border-t border-dashed border-ink/25"></div>
          <div class="space-y-0.5">
            <div class="flex justify-between gap-3"><span class="text-muted">Bill No</span><span class="font-semibold">#${S.nextBill}</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted">Date</span><span>${billNow.toLocaleDateString('en-IN')}</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted">Time</span><span>${clock(billNow)}</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted">Customer</span><span id="bill-cust" class="truncate">${PS.customer.trim() ? esc(PS.customer.trim()) : 'Walk-in'}</span></div>
          </div>
          <div class="my-3 border-t border-dashed border-ink/25"></div>
          <div class="grid grid-cols-[1fr_auto_auto] gap-x-3 text-[10px] font-semibold uppercase tracking-wide text-subtle">
            <span>Item</span><span class="w-[76px] text-center">Qty</span><span class="w-16 text-right">Amount</span>
          </div>
          <div class="my-2 border-t border-dashed border-ink/25"></div>
          ${lines.length === 0
            ? `<div class="py-8 text-center font-sans text-sm text-subtle">${icon('cart', 'mx-auto mb-2 size-7')}Scan or tap items to start a bill</div>`
            : `<div class="max-h-[34vh] space-y-2.5 overflow-y-auto">${lines
                .map(
                  ({ l, p }, n) => `
              <div class="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                <div class="min-w-0">
                  <p class="break-words text-[13px] font-medium leading-snug">${n + 1}. ${esc(p.name)}</p>
                  <p class="text-[10px] text-subtle">${money(p.price)} each</p>
                </div>
                <div class="flex w-[76px] items-center justify-between rounded-md border border-line bg-white">
                  <button data-act="pos-qty" data-id="${p.id}" data-d="-1" aria-label="Decrease" class="grid size-6 place-items-center text-muted hover:text-ink">${icon('minus', 'size-3')}</button>
                  <span class="text-center text-[13px] font-semibold">${l.qty}</span>
                  <button data-act="pos-qty" data-id="${p.id}" data-d="1" aria-label="Increase" class="grid size-6 place-items-center text-muted hover:text-ink">${icon('plus', 'size-3')}</button>
                </div>
                <span class="w-16 text-right text-[13px] font-semibold">${money(p.price * l.qty)}</span>
              </div>`
                )
                .join('')}</div>`}
          <div class="my-3 border-t border-dashed border-ink/25"></div>
          <div class="space-y-0.5">
            <div class="flex justify-between"><span class="text-muted">Total items</span><span>${lines.length}</span></div>
            <div class="flex justify-between"><span class="text-muted">Total qty</span><span>${lines.reduce((n, x) => n + x.l.qty, 0)}</span></div>
            <div class="flex justify-between"><span class="text-muted">Subtotal</span><span>${money(totals.subtotal)}</span></div>
            ${totals.tax > 0 ? `<div class="flex justify-between"><span class="text-muted">GST</span><span>${money(totals.tax)}</span></div>` : ''}
          </div>
          <div class="my-2 border-t-2 border-double border-ink/30"></div>
          <div class="flex items-center justify-between text-base font-bold"><span>Grand total</span><span>${money(totals.total)}</span></div>
          <div class="mt-1 flex justify-between text-[11px]"><span class="text-muted">Payment mode</span><span class="font-semibold">${PS.payment}</span></div>
          <div class="my-3 border-t border-dashed border-ink/25"></div>
          <p class="text-center text-[11px] text-subtle">Thank you, visit again!</p>
        </div>
      </div>
      <div class="space-y-3 px-5 py-4">
        <div class="grid grid-cols-3 gap-1.5 rounded-lg bg-canvas p-1 text-xs font-semibold">
          ${['UPI', 'Cash', 'Khata'].map((m) => `<button data-act="pos-pay" data-m="${m}" class="rounded-md py-2 transition ${PS.payment === m ? 'bg-white text-brand shadow-sm' : 'text-muted'}">${m}</button>`).join('')}
        </div>
        <input data-f="pos-cust" data-in="pos-cust" value="${esc(PS.customer)}" placeholder="${PS.payment === 'Khata' ? 'Customer name (required)' : 'Customer name (optional)'}" class="${field}" />
        <button data-act="pos-charge" ${dis(!lines.length || !S.posReady)} class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40">
          ${icon('check')} Charge ${inr(totals.total)} · ${PS.payment}
        </button>
      </div>
    </aside>
  </div>`;
}

ACT['pos-mode'] = (el) => {
  PS.mode = el.dataset.mode;
  renderMain();
  if (PS.mode === 'scan') $('#scan-input')?.focus();
};
ACT['pos-cat'] = (el) => { PS.cat = el.dataset.cat; renderMain(); };
ACT['pos-pay'] = (el) => { PS.payment = el.dataset.m; renderMain(); };
ACT['pos-add'] = (el) => addToCart(el.dataset.id);
ACT['pos-clear'] = () => { UI.cart = []; renderApp(); };
ACT['pos-qty'] = (el) => {
  const p = S.products.find((x) => x.id === el.dataset.id);
  const cur = (UI.cart.find((l) => l.productId === el.dataset.id) || {}).qty || 0;
  const q = cur + Number(el.dataset.d);
  if (!p) return;
  if (q > p.stock) return toast(`Only ${qty(p.stock, p.unit)} of ${p.name} in stock`);
  UI.cart = q <= 0 ? UI.cart.filter((l) => l.productId !== p.id) : UI.cart.map((l) => (l.productId === p.id ? { ...l, qty: q } : l));
  renderApp();
};
INP['pos-code'] = (el) => (PS.code = el.value);
INP['pos-cust'] = (el) => {
  PS.customer = el.value;
  const c = $('#bill-cust');
  if (c) c.textContent = el.value.trim() || 'Walk-in';
};
SUB['pos-scan'] = () => {
  const c = PS.code.trim().toLowerCase();
  if (!c) return;
  const p = S.products.find((x) => x.barcode === c) || S.products.find((x) => x.name.toLowerCase().includes(c));
  if (!p) PS.flash = `No item for “${PS.code}”`;
  else {
    addToCart(p.id);
    PS.flash = `Added ${p.name}`;
  }
  PS.code = '';
  renderMain();
  setTimeout(() => {
    PS.flash = '';
    if (UI.view === 'pos') renderMain();
  }, 1600);
};

ACT['pos-charge'] = async () => {
  if (PS.payment === 'Khata' && !PS.customer.trim()) return toast('Enter the customer name for a khata bill');
  const bill = await act.checkout(UI.cart, PS.payment, PS.customer.trim());
  if (!bill) return;
  UI.cart = [];
  PS.customer = '';
  renderApp();
  toast(`Bill #${bill.no} saved · ${inr(bill.total)} · stock updated`);
  openModal({ type: 'receipt', billId: bill.id });
};

/* ---------- Inventory View ---------- */
function stockStatus(p) {
  if (p.stock <= 0) return { label: 'Out of stock', cls: 'bg-danger-soft text-danger' };
  if (recommend(p).needs) return { label: 'Low stock', cls: 'bg-danger-soft text-danger' };
  if (isExpiring(p)) return { label: `${p.expQty} expiring`, cls: 'bg-amber-soft text-amber' };
  if (isDead(p)) return { label: 'Dead stock', cls: 'bg-canvas text-muted' };
  return { label: 'Healthy', cls: 'bg-brand-soft text-brand' };
}

function inventoryView() {
  const counts = {
    All: S.products.length,
    'Low stock': S.products.filter((p) => recommend(p).needs || p.stock <= 0).length,
    Expiring: S.products.filter(isExpiring).length,
    'Dead stock': S.products.filter(isDead).length,
  };
  const rows = S.products.filter((p) => {
    if (IV.q && !`${p.name} ${p.barcode} ${p.category}`.toLowerCase().includes(IV.q.toLowerCase())) return false;
    if (IV.filter === 'Low stock') return recommend(p).needs || p.stock <= 0;
    if (IV.filter === 'Expiring') return isExpiring(p);
    if (IV.filter === 'Dead stock') return isDead(p);
    return true;
  });
  const value = S.products.reduce((s, p) => s + p.stock * p.cost, 0);
  const actBtn = (title, a, extra, ic, hov) =>
    `<button title="${title}" data-act="${a}" ${extra} class="grid size-8 place-items-center rounded-lg text-muted ${hov}">${icon(ic)}</button>`;

  return `<div class="space-y-6">
    <div class="grid gap-6 sm:grid-cols-3">
      ${[['Stock value (cost)', inr(value)], ['Low stock', String(counts['Low stock'])], ['Expiring ≤ 2 days', String(counts.Expiring)]]
        .map(
          ([l, v]) => `
      <div class="${card} p-6">
        <p class="text-xs font-medium text-muted">${l}</p>
        <p class="mt-2 text-3xl font-semibold tracking-tight">${v}</p>
      </div>`
        )
        .join('')}
    </div>

    <div class="${card}">
      <div class="flex flex-wrap items-center gap-3 border-b border-line px-6 py-5">
        <div class="flex gap-1 rounded-lg bg-canvas p-1 text-xs font-medium">
          ${Object.keys(counts)
            .map(
              (f) => `
          <button data-act="iv-filter" data-f="${f}" class="rounded-md px-3 py-1.5 transition ${IV.filter === f ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}">
            ${f} <span class="text-subtle">${counts[f]}</span>
          </button>`
            )
            .join('')}
        </div>
        <div class="relative ml-auto w-full sm:w-60">
          ${icon('search', 'absolute left-3 top-1/2 -translate-y-1/2 text-subtle')}
          <input data-f="iv-q" data-in="iv-q" value="${esc(IV.q)}" placeholder="Filter items" class="${field} py-2 pl-9" />
        </div>
        <button data-act="iv-export" class="${btnGhost}">${icon('download')} Export</button>
        <button data-act="iv-add" class="${btnPrimary}">${icon('plus')} Add item</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead class="text-xs text-subtle">
            <tr class="border-b border-line">
              ${['Item', 'Stock', 'Selling price', 'Actual price', 'Profit', 'Status', ''].map((h) => `<th class="px-6 py-3.5 font-medium">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            ${rows
              .map((p) => {
                const s = stockStatus(p);
                const unitProfit = p.price - p.cost;
                return `<tr class="group transition hover:bg-canvas/60">
                  <td class="px-6 py-4">
                    <p class="font-medium">${esc(p.name)}</p>
                    <p class="text-xs text-subtle">${esc(p.category)}</p>
                  </td>
                  <td class="px-6 py-4 font-medium">${qty(p.stock, p.unit)}</td>
                  <td class="px-6 py-4">${inr(p.price)}</td>
                  <td class="px-6 py-4 text-muted">${inr(p.cost)}</td>
                  <td class="px-6 py-4 font-medium ${unitProfit >= 0 ? 'text-brand' : 'text-danger'}">${inr(unitProfit)}</td>
                  <td class="px-6 py-4"><span class="rounded-full px-2.5 py-1 text-[11px] font-medium ${s.cls}">${s.label}</span></td>
                  <td class="px-6 py-4">
                    <div class="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                      ${actBtn('Stock in', 'quick', `data-type="stockin" data-pid="${p.id}"`, 'plus', 'hover:bg-brand-soft hover:text-brand')}
                      ${actBtn('Log wastage', 'quick', `data-type="waste" data-pid="${p.id}"`, 'minus', 'hover:bg-danger-soft hover:text-danger')}
                      ${actBtn('Add to bill', 'pos-add', `data-id="${p.id}"`, 'cart', 'hover:bg-canvas hover:text-ink')}
                      ${actBtn('Edit', 'quick', `data-type="product" data-pid="${p.id}"`, 'edit', 'hover:bg-canvas hover:text-ink')}
                    </div>
                  </td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>
        ${rows.length === 0 ? '<p class="py-10 text-center text-sm text-muted">No items match.</p>' : ''}
      </div>
    </div>
  </div>`;
}

ACT['iv-filter'] = (el) => { IV.filter = el.dataset.f; renderMain(); };
INP['iv-q'] = (el) => { IV.q = el.value; renderMain(); };
ACT['iv-add'] = () => openModal({ type: 'product' });
ACT['iv-export'] = () =>
  downloadFile(
    'inventory.csv',
    toCsv([
      ['name', 'barcode', 'category', 'unit', 'stock', 'price', 'cost'],
      ...S.products.map((p) => [p.name, p.barcode, p.category, p.unit, p.stock, p.price, p.cost]),
    ])
  );

/* ---------- Forecast View ---------- */
const SEASONAL = {
  'Dairy & Eggs': [1.05, 1, 0.95, 0.9, 0.88, 0.92, 0.98, 1, 1.05, 1.15, 1.12, 1.1],
  'Fresh Produce': [0.95, 0.92, 1, 1.05, 1.1, 1.08, 0.95, 0.92, 1, 1.05, 1.02, 0.98],
  Beverages: [0.7, 0.8, 1, 1.3, 1.5, 1.3, 1, 0.95, 0.9, 0.9, 0.8, 0.75],
};
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function forecastView() {
  const sorted = [...S.products].sort(
    (a, b) => Number(recommend(b).needs) - Number(recommend(a).needs) || trendPct(b) - trendPct(a)
  );
  const p = S.products.find((x) => x.id === FC.sel) || sorted[0];
  if (!p) return '';

  // Trigger live LightGBM prediction from Django (cached by price + history)
  ensureLgbmForecast(p);
  const hasLgbm = Array.isArray(p.lgbmForecast) && p.lgbmForecast.length === 7;

  const r = recommend(p);
  const f = forecastDaily(p);
  const tomorrowVal = hasLgbm ? p.lgbmForecast[0] : f;
  const total7Val = hasLgbm ? p.lgbmForecast.reduce((s, v) => s + v, 0) : f * 7;

  const labels = [
    ...Array.from({ length: 7 }, (_, i) => weekday(i - 7)),
    'Today',
    ...Array.from({ length: 6 }, (_, i) => weekday(i + 1)),
  ];
  const actual = [...p.history.slice(-7), null, ...Array(6).fill(null)];
  const predicted = [
    ...p.history.slice(-7).map((_, i) => avg(p.history.slice(i, i + 7))),
    ...(hasLgbm
      ? p.lgbmForecast
      : Array.from({ length: 7 }, (_, i) => f * (1 + (i % 7 === 5 || i % 7 === 6 ? 0.15 : 0)))),
  ];
  const season = (SEASONAL[p.category] || Array(12).fill(1).map((v, i) => v + Math.sin(i / 2) * 0.05)).map((m) =>
    Math.round(avg(p.history) * 30 * m)
  );
  const pending = S.pos.filter((o) => o.productId === p.id && o.status === 'Pending');

  return `<div class="grid gap-6 xl:grid-cols-[280px_1fr]">
    <aside class="${card} h-fit overflow-hidden">
      <p class="border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wider text-subtle">Items · sorted by urgency</p>
      <ul class="max-h-[70vh] overflow-y-auto">
        ${sorted
          .map((x) => {
            const xr = recommend(x);
            const tp = Math.round(trendPct(x));
            return `<li>
              <button data-act="fc-sel" data-id="${x.id}" class="flex w-full items-center justify-between gap-2 border-l-2 px-4 py-2.5 text-left text-sm transition ${x.id === p.id ? 'border-brand bg-brand-soft/50' : 'border-transparent hover:bg-canvas'}">
                <span class="truncate">${esc(x.name)}</span>
                ${xr.needs ? '<span class="size-2 shrink-0 rounded-full bg-danger"></span>' : `<span class="text-[11px] text-subtle">${tp >= 0 ? '+' : ''}${tp}%</span>`}
              </button>
            </li>`;
          })
          .join('')}
      </ul>
    </aside>

    <div class="space-y-6">
      <section class="${card} p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-xs text-subtle">${esc(p.category)} · ${esc(p.barcode)}${hasLgbm ? ' · <span class="font-semibold text-brand">LightGBM Live</span>' : ''}</p>
            <h2 class="mt-0.5 font-serif text-3xl">${esc(p.name)}</h2>
          </div>
          ${pending.length
            ? `<span class="flex items-center gap-1.5 rounded-lg bg-brand-soft px-3 py-2 text-sm font-semibold text-brand">${icon('check')} PO #${pending[0].no} pending</span>`
            : `<button ${dis(r.qty <= 0)} data-act="ov-approve" data-id="${p.id}" data-qty="${r.qty}" class="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-40">
                ${icon('bolt')} ${r.qty > 0 ? `Approve PO (${qty(r.qty, p.unit)})` : 'No order needed'}
              </button>`}
        </div>
        <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          ${[['In stock', qty(p.stock, p.unit)], ['Tomorrow', qty(Math.round(tomorrowVal), p.unit)], ['7-day forecast', qty(Math.round(total7Val), p.unit)], ['Run-out', runOutLabel(p)]]
            .map(
              ([l, v]) => `
          <div class="rounded-xl bg-canvas p-3">
            <p class="text-[11px] text-muted">${l}</p>
            <p class="mt-0.5 text-sm font-semibold">${v}</p>
          </div>`
            )
            .join('')}
        </div>
        <div class="mt-6">${lineChart({ labels, actual, predicted, format: (n) => qty(Math.round(n), p.unit) })}</div>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="${card} p-6">
          <h3 class="text-sm font-semibold">Seasonal & monthly rate</h3>
          <p class="text-xs text-subtle">Expected monthly units based on historical seasonality</p>
          <div class="mt-4">${barChart({ data: season, labels: MONTHS, highlight: new Date().getMonth() })}</div>
        </section>

        <section class="${card} p-6">
          <h3 class="text-sm font-semibold">Quantity & shelf-life optimisation</h3>
          <ul class="mt-4 space-y-3 text-sm">
            <li class="flex justify-between"><span class="text-muted">Shelf life</span><strong>${p.shelfLife} days</strong></li>
            <li class="flex justify-between"><span class="text-muted">Optimal cover</span><strong>${r.cover} day${r.cover > 1 ? 's' : ''}</strong></li>
            <li class="flex justify-between"><span class="text-muted">Suggested batch</span><strong>${qty(Math.ceil(f * r.cover), p.unit)}</strong></li>
            <li class="flex justify-between"><span class="text-muted">Order now</span><strong>${qty(r.qty, p.unit)} · ${inr(r.spend)}</strong></li>
            <li class="flex justify-between"><span class="text-muted">Expected profit</span><strong class="text-brand">${inr(r.profit)}</strong></li>
          </ul>
          <p class="mt-4 rounded-lg bg-amber-soft/70 px-3 py-2.5 text-xs leading-relaxed text-ink/80">
            ${p.shelfLife <= 4 ? `Order smaller batches every ${r.cover} day${r.cover > 1 ? 's' : ''} to keep spoilage under 5%.` : `Long shelf life: one weekly order of ${qty(Math.ceil(f * 7), p.unit)} minimises delivery costs.`}
          </p>
        </section>
      </div>

      <section class="${card}">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 class="text-sm font-semibold">Purchase orders</h3>
          <span class="text-xs text-subtle">${S.pos.filter((o) => o.status === 'Pending').length} pending</span>
        </div>
        ${S.pos.length === 0
          ? '<p class="px-5 py-8 text-center text-sm text-muted">No purchase orders yet. Approve a recommendation to create one.</p>'
          : `<ul class="divide-y divide-line">${S.pos
              .map((o) => {
                const op = S.products.find((x) => x.id === o.productId);
                return `<li class="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span>
                    <span class="font-medium">PO #${o.no}</span> · ${esc(op && op.name)} · ${op ? qty(o.qty, op.unit) : o.qty}
                    <span class="block text-xs text-subtle">${inr(o.cost)} · ${new Date(o.time).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                  </span>
                  ${o.status === 'Pending' ? `<button data-act="po-receive" data-id="${o.id}" class="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-brand/40 hover:text-brand">Mark received</button>` : '<span class="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">Received</span>'}
                </li>`;
              })
              .join('')}</ul>`}
      </section>
    </div>
  </div>`;
}

ACT['fc-sel'] = (el) => { FC.sel = el.dataset.id; renderMain(); };


/* ---------- Daily sales records (today, yesterday, day before yesterday ...) ---------- */
function dayName(k) {
  const d = new Date();
  d.setDate(d.getDate() - k);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

/** Records for today and the last 14 days. Pass a product to get that item only. */
function dailyRecords(prod) {
  const prods = prod ? [prod] : S.products;
  const rows = [];
  for (let k = 0; k <= 14; k++) {
    const d = new Date();
    d.setDate(d.getDate() - k);
    let units = 0, sales = 0, bills = null;
    if (k === 0) {
      const todayBills = S.bills.filter((b) => isToday(b.time));
      bills = todayBills.length;
      todayBills.forEach((b) => b.items.forEach((i) => {
        if (prod && i.productId !== prod.id) return;
        units += i.qty;
        sales += i.price * i.qty;
      }));
      if (!prod) sales = todayBills.reduce((s, b) => s + b.total, 0);
    } else {
      prods.forEach((p) => {
        const h = p.history || [];
        const v = h[h.length - k];
        if (v != null) { units += v; sales += v * p.price; }
      });
    }
    rows.push({ k, date: d, label: dayName(k), units, sales, bills });
  }
  return rows.map((r, i) => {
    const prev = rows[i + 1];
    return { ...r, delta: prev && prev.sales ? ((r.sales - prev.sales) / prev.sales) * 100 : null };
  });
}

function dailyRecordsTable(prod) {
  const rows = dailyRecords(prod).filter(
    (r) => r.units > 0 || r.sales > 0 || (r.bills && r.bills > 0)
  );
  if (rows.length === 0) {
    return `<div class="py-10 text-center text-sm text-subtle">
      No daily sales recorded yet. Upload a dataset with a date or complete a POS sale to see records here.
    </div>`;
  }
  const unitLabel = prod ? prod.unit + 's' : 'items';
  return `<div class="overflow-x-auto">
    <table class="w-full min-w-[560px] text-left text-sm">
      <thead class="text-xs text-subtle">
        <tr class="border-b border-line">${['Day', 'Date', prod ? 'Units sold' : 'Items sold', 'Sales', 'vs previous day', ''].map((h) => `<th class="px-4 py-2.5 font-medium">${h}</th>`).join('')}</tr>
      </thead>
      <tbody class="divide-y divide-line">
        ${rows.map((r) => `
          <tr data-act="ds-day" data-k="${r.k}" title="View items sold" class="cursor-pointer transition hover:bg-brand-soft/50">
            <td class="px-4 py-2.5 font-medium">${r.label}</td>
            <td class="px-4 py-2.5 text-muted">${r.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
            <td class="px-4 py-2.5 text-muted">${Math.round(r.units * 10) / 10}${prod ? ' ' + prod.unit : ''}</td>
            <td class="px-4 py-2.5 font-semibold">${inr(r.sales)}</td>
            <td class="px-4 py-2.5 ${r.delta == null ? 'text-subtle' : r.delta >= 0 ? 'text-brand' : 'text-danger'}">${r.delta == null ? '–' : `${r.delta >= 0 ? '+' : ''}${Math.round(r.delta)}%`}</td>
            <td class="px-4 py-2.5 text-right text-subtle">${icon('arrow', 'size-4')}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

/* ---------- Daily Sales View (separate nav section) ---------- */
const DS = { sel: 'all' };

function dailySalesView() {
  const prod = DS.sel === 'all' ? null : S.products.find((x) => x.id === DS.sel) || null;
  const rows = dailyRecords(prod);
  const today = rows[0], yest = rows[1], before = rows[2];
  const week = rows.slice(1, 8).reduce((s, r) => s + r.sales, 0);
  const kpis = [
    ['Today so far', inr(today.sales), `${Math.round(today.units * 10) / 10} ${prod ? prod.unit + 's' : 'items'} sold`],
    ['Yesterday', inr(yest.sales), yest.delta == null ? '' : `${yest.delta >= 0 ? '+' : ''}${Math.round(yest.delta)}% vs day before`],
    ['Day before yesterday', inr(before.sales), `${Math.round(before.units * 10) / 10} ${prod ? prod.unit + 's' : 'items'} sold`],
    ['Last 7 days (excl. today)', inr(week), `Avg ${inr(week / 7)} per day`],
  ];
  return `<div class="space-y-6">
    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      ${kpis.map(([l, v, s]) => `
      <div class="${card} p-6">
        <p class="text-xs text-muted">${l}</p>
        <p class="mt-1 text-xl font-semibold">${v}</p>
        <p class="text-xs text-subtle">${s}</p>
      </div>`).join('')}
    </div>
    <section class="${card}">
      <div class="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <label class="flex items-center gap-2 text-xs font-medium text-muted">Show
          <select data-ch="ds-sel" class="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand">
            <option value="all" ${DS.sel === 'all' ? 'selected' : ''}>All items</option>
            ${[...S.products].sort((a, b) => a.name.localeCompare(b.name)).map((p) => `<option value="${p.id}" ${DS.sel === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
          </select>
        </label>
        <button data-act="ds-export" class="${btnGhost} ml-auto">${icon('download')} Export CSV</button>
      </div>
      ${dailyRecordsTable(prod)}
    </section>
  </div>`;
}

CHG['ds-sel'] = (el) => { DS.sel = el.value; renderMain(); };

/** Items sold on day k (0 = today): quantity, selling price and actual (cost) price. */
function dayItems(k, prod) {
  if (k === 0) {
    const map = new Map();
    S.bills.filter((b) => isToday(b.time)).forEach((b) => b.items.forEach((i) => {
      if (prod && i.productId !== prod.id) return;
      const m = map.get(i.productId) || { name: i.name, unit: i.unit, qty: 0, sell: 0, cost: 0 };
      m.qty += i.qty;
      m.sell += i.price * i.qty;
      m.cost += (i.cost || 0) * i.qty;
      map.set(i.productId, m);
    }));
    return [...map.values()].map((m) => ({ ...m, profit: m.sell - m.cost })).sort((a, b) => b.sell - a.sell);
  }
  return (prod ? [prod] : S.products)
    .map((p) => {
      const h = p.history || [];
      const v = h[h.length - k];
      return v > 0 ? { name: p.name, unit: p.unit, qty: v, sell: v * p.price, cost: v * p.cost, profit: v * (p.price - p.cost) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.sell - a.sell);
}

ACT['ds-day'] = (el) => openModal({ type: 'day', k: Number(el.dataset.k) });
ACT['ds-export'] = () => {
  const prod = DS.sel === 'all' ? null : S.products.find((x) => x.id === DS.sel) || null;
  downloadFile(
    `daily-sales-${new Date().toISOString().slice(0, 10)}.csv`,
    toCsv([
      ['day', 'date', 'items_sold', 'sales'],
      ...dailyRecords(prod).map((r) => [r.label, r.date.toLocaleDateString('en-IN'), Math.round(r.units * 10) / 10, r.sales.toFixed(2)]),
    ])
  );
};

/* ---------- Ledger View ---------- */
function ledgerView() {
  const t = useToday();
  const tax = t.today.reduce((s, b) => s + b.tax, 0);
  const cogs = t.today.reduce((s, b) => s + b.items.reduce((n, i) => n + i.cost * i.qty, 0), 0);
  const itemsSoldToday = t.today.reduce((s, b) => s + b.items.reduce((n, i) => n + i.qty, 0), 0);
  const khata = S.bills.filter((b) => b.payment === 'Khata');
  const outstanding = khata.filter((b) => !b.settled).reduce((s, b) => s + b.total, 0);
  const slabs = [0, 5, 12, 18, 28].map((rate) => {
    const items = t.today.flatMap((b) => b.items).filter((i) => i.gst === rate);
    const taxable = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { rate, taxable, tax: (taxable * rate) / 100 };
  });

  const last24 = [...S.bills].reverse().slice(0, 24);
  const wasteToday = S.wastage.filter((w) => isToday(w.time));
  const payCls = { UPI: 'bg-brand-soft text-brand', Cash: 'bg-amber-soft text-amber', Khata: 'bg-danger-soft text-danger' };
  const tabs = [['bills', 'Last 24 auto-bills'], ['khata', 'Khata'], ['wastage', 'Wastage log']];

  let body = '';
  if (LD.tab === 'bills') {
    body = `<div class="overflow-x-auto">
      <table class="w-full min-w-[560px] text-left text-sm">
        <thead class="text-xs text-subtle">
          <tr class="border-b border-line">${['Bill', 'Time', 'Items', 'Payment', 'Total', ''].map((h) => `<th class="px-4 py-2.5 font-medium">${h}</th>`).join('')}</tr>
        </thead>
        <tbody class="divide-y divide-line">
          ${last24.map((b) => `
            <tr class="hover:bg-canvas/60">
              <td class="px-4 py-2.5 font-medium">#${b.no}</td>
              <td class="px-4 py-2.5 text-muted">${clock(b.time)}</td>
              <td class="max-w-56 truncate px-4 py-2.5 text-muted">${esc(b.items.map((i) => i.name.split(' (')[0]).join(', '))}</td>
              <td class="px-4 py-2.5"><span class="rounded-md px-2 py-0.5 text-[11px] font-medium ${payCls[b.payment]}">${b.payment}</span></td>
              <td class="px-4 py-2.5 font-semibold">${inr(b.total)}</td>
              <td class="px-4 py-2.5 text-right"><button data-act="quick" data-type="receipt" data-id="${b.id}" class="text-xs font-medium text-brand hover:underline">Receipt</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  } else if (LD.tab === 'khata') {
    body = `<ul class="divide-y divide-line">
      ${khata.length === 0 ? '<li class="py-10 text-center text-sm text-muted">No khata bills.</li>' : ''}
      ${[...khata].reverse().map((b) => `
        <li class="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span>
            <span class="font-medium">${esc(b.customer || 'Walk-in')}</span>
            <span class="block text-xs text-subtle">Bill #${b.no} · ${clock(b.time)}</span>
          </span>
          <span class="flex items-center gap-3">
            <span class="font-semibold">${inr(b.total)}</span>
            ${b.settled ? '<span class="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">Settled</span>' : `<button data-act="settle" data-id="${b.id}" class="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep">Settle</button>`}
          </span>
        </li>`).join('')}
    </ul>`;
  } else if (LD.tab === 'wastage') {
    body = `<ul class="divide-y divide-line">
      ${S.wastage.length === 0 ? `<li class="py-10 text-center text-sm text-muted">No wastage logged. <button data-act="quick" data-type="waste" class="font-medium text-brand hover:underline">Log wastage</button></li>` : ''}
      ${S.wastage.map((w) => {
        const p = S.products.find((x) => x.id === w.productId);
        return `<li class="flex items-center justify-between px-4 py-3 text-sm">
          <span><span class="font-medium">${esc(p && p.name)}</span> × ${w.qty}<span class="block text-xs text-subtle">${esc(w.reason)} · ${clock(w.time)}</span></span>
          <span class="font-semibold text-danger">−${inr(w.loss)}</span>
        </li>`;
      }).join('')}
    </ul>`;
  }

  return `<div class="space-y-6">
    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      ${[
        ['Total sales', inr(t.sales), `${t.today.length} bills today`],
        ['Cash & UPI collected', inr(t.pay.UPI + t.pay.Cash), `UPI ${inr(t.pay.UPI)} · Cash ${inr(t.pay.Cash)}`],
        ['Items sold today', `${itemsSoldToday} items`, `Across ${t.today.length} bills today`],
        ['Khata outstanding', inr(outstanding), `${khata.filter((b) => !b.settled).length} open accounts`],
      ]
        .map(
          ([l, v, s]) => `
      <div class="${card} p-6">
        <p class="text-xs text-muted">${l}</p>
        <p class="mt-1 text-xl font-semibold">${v}</p>
        <p class="text-xs text-subtle">${s}</p>
      </div>`
        )
        .join('')}
    </div>

    <div class="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section class="${card}">
        <div class="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div class="flex gap-1 rounded-lg bg-canvas p-1 text-xs font-medium">
            ${tabs.map(([k, l]) => `<button data-act="ld-tab" data-tab="${k}" class="rounded-md px-3 py-1.5 transition ${LD.tab === k ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}">${l}</button>`).join('')}
          </div>
          <button data-act="ld-export" class="${btnGhost} ml-auto">${icon('download')} Export CSV</button>
        </div>
        ${body}
      </section>

      <div class="space-y-6">
        <section class="${card} p-6">
          <h3 class="text-sm font-semibold">Today's balance sheet</h3>
          <dl class="mt-4 space-y-2.5 text-sm">
            <div class="flex justify-between"><dt class="text-muted">Total selling price</dt><dd>${inr(t.subtotal)}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Total actual price</dt><dd>−${inr(cogs)}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Wastage loss</dt><dd class="text-danger">−${inr(wasteToday.reduce((s, w) => s + w.loss, 0))}</dd></div>
            <div class="flex justify-between border-t border-line pt-2.5 font-semibold"><dt>Total profit</dt><dd class="text-brand">${inr(t.profit - t.wasteToday)}</dd></div>
          </dl>
        </section>

        <section class="${card} p-6">
          <h3 class="text-sm font-semibold">Payment breakdown</h3>
          <dl class="mt-4 space-y-2.5 text-sm">
            <div class="flex justify-between"><dt class="text-muted">UPI</dt><dd class="font-medium">${inr(t.pay.UPI)}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Cash</dt><dd class="font-medium">${inr(t.pay.Cash)}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Khata</dt><dd class="font-medium">${inr(t.pay.Khata)}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  </div>`;
}

ACT['ld-tab'] = (el) => { LD.tab = el.dataset.tab; renderMain(); };
ACT.settle = (el) => act.settleKhata(el.dataset.id);
ACT['ld-export'] = () =>
  downloadFile(
    `bills-${new Date().toISOString().slice(0, 10)}.csv`,
    toCsv([
      ['bill', 'time', 'items', 'total', 'payment', 'customer'],
      ...S.bills.map((b) => [
        b.no,
        new Date(b.time).toLocaleString('en-IN'),
        b.items.length,
        b.total.toFixed(2),
        b.payment,
        b.customer || '',
      ]),
    ])
  );

/* ---------- Wastage View ---------- */
function wastageView() {
  const t = useToday();
  const atRisk = S.products
    .filter((p) => p.expQty > 0 && p.expDays <= 3)
    .sort((a, b) => a.expDays - b.expDays || b.expQty * b.cost - a.expQty * a.cost);
  const riskValue = atRisk.reduce((s, p) => s + p.expQty * p.cost, 0);
  const today = S.wastage.filter((w) => isToday(w.time));
  const cogs = t.today.reduce((s, b) => s + b.items.reduce((n, i) => n + i.cost * i.qty, 0), 0);
  const todayLoss = today.reduce((s, w) => s + w.loss, 0);
  const rate = cogs ? (todayLoss / cogs) * 100 : 0;
  const reasons = ['Expired', 'Damaged', 'Spoiled', 'Theft / missing', 'Other'];
  const byReason = reasons.map((r) =>
    Math.round(S.wastage.filter((w) => w.reason === r).reduce((s, w) => s + w.loss, 0))
  );

  const perishables = S.products.filter((p) => p.shelfLife <= 7 && recommend(p).f > 0);
  const kpis = [
    { l: 'Value at risk', v: inr(riskValue), s: `${atRisk.length} items expire within 3 days`, tone: 'text-amber' },
    { l: 'Wasted today', v: inr(todayLoss), s: `${today.length} entries logged`, tone: 'text-danger' },
    { l: 'Waste rate', v: `${rate.toFixed(1)}%`, s: rate < 3 ? 'Healthy · target under 3%' : 'Above 3% target', tone: rate < 3 ? 'text-brand' : 'text-danger' },
  ];

  return `<div class="grid grid-cols-1 gap-6 md:grid-cols-6 xl:grid-cols-12">
    ${kpis.map((k) => `<div class="${card} p-6 md:col-span-2 xl:col-span-4"><span class="text-xs font-medium text-muted">${k.l}</span><p class="mt-2 text-3xl font-semibold tracking-tight">${k.v}</p><p class="mt-1 text-sm ${k.tone}">${k.s}</p></div>`).join('')}

    <section class="${card} overflow-hidden md:col-span-6 xl:col-span-8 xl:row-span-2">
      <div class="flex items-center justify-between px-6 pb-2 pt-6">
        <div>
          <h2 class="font-semibold">Expiring soon</h2>
          <p class="mt-0.5 text-xs text-subtle">Clear it with a markdown, or write it off</p>
        </div>
        <button data-act="quick" data-type="waste" class="${btnPrimary}">${icon('minus')} Log wastage</button>
      </div>
      ${atRisk.length === 0
        ? '<p class="px-5 py-12 text-center text-sm text-muted">Nothing is close to expiry. Nice work.</p>'
        : `<ul class="divide-y divide-line">${atRisk
            .map(
              (p) => `
          <li class="flex flex-wrap items-center gap-4 px-6 py-5">
            <span class="grid size-11 shrink-0 place-items-center rounded-xl text-center text-[10px] font-semibold leading-tight ${p.expDays <= 1 ? 'bg-danger-soft text-danger' : 'bg-amber-soft text-amber'}">${p.expDays <= 1 ? '&lt;24h' : `${p.expDays}d`}</span>
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 font-medium">${esc(p.name)}${p.markdown ? `<span class="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">${p.markdown}% off</span>` : ''}</p>
              <p class="text-xs text-muted">${qty(p.expQty, p.unit)} expiring of ${qty(p.stock, p.unit)} · ${inr(p.expQty * p.cost)} at cost · now ${inr(p.price)}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              ${p.markdown ? `<button data-act="wa-markdown" data-id="${p.id}" data-pct="0" class="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-ink">Remove discount</button>` : `<button data-act="wa-markdown" data-id="${p.id}" data-pct="15" class="rounded-full bg-amber-soft px-3.5 py-1.5 text-xs font-semibold text-amber hover:brightness-95">15% off</button>`}
              <button data-act="quick" data-type="waste" data-pid="${p.id}" class="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted hover:bg-danger-soft hover:text-danger">Write off</button>
            </div>
          </li>`
            )
            .join('')}</ul>`}
    </section>

    <section class="${card} p-6 md:col-span-3 xl:col-span-4">
      <h3 class="text-sm font-semibold">Loss by reason (₹)</h3>
      <div class="mt-4">${byReason.some((v) => v > 0) ? barChart({ data: byReason, labels: ['Expired', 'Damaged', 'Spoiled', 'Theft', 'Other'], highlight: byReason.indexOf(Math.max(...byReason)), format: inr }) : '<p class="py-10 text-center text-sm text-muted">Log wastage to see the breakdown.</p>'}</div>
    </section>

    <section class="${card} p-6 md:col-span-3 xl:col-span-4">
      <h3 class="flex items-center gap-2 text-sm font-semibold">${icon('spark', 'text-amber')} Shelf-life order tuning</h3>
      <p class="text-xs text-subtle">Order sizes that keep perishables fresh</p>
      <ul class="mt-4 divide-y divide-line">
        ${perishables
          .map((p) => {
            const r = recommend(p);
            return `<li class="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span class="min-w-0">
                <span class="block truncate font-medium">${esc(p.name)}</span>
                <span class="text-xs text-subtle">Shelf life ${p.shelfLife}d · sells ${Math.round(r.f)}/day</span>
              </span>
              <span class="shrink-0 rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand">${qty(Math.ceil(r.f * r.cover), p.unit)} every ${r.cover}d</span>
            </li>`;
          })
          .join('')}
      </ul>
    </section>

    <section class="${card} overflow-hidden md:col-span-6 xl:col-span-12">
      <div class="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 class="text-sm font-semibold">Wastage log</h3>
        <span class="text-xs text-subtle">${S.wastage.length} entries</span>
      </div>
      ${S.wastage.length === 0
        ? '<p class="px-5 py-10 text-center text-sm text-muted">No wastage logged yet.</p>'
        : `<ul class="max-h-80 divide-y divide-line overflow-y-auto">${S.wastage
            .map((w) => {
              const p = S.products.find((x) => x.id === w.productId);
              return `<li class="flex items-center justify-between px-5 py-3 text-sm">
                <span>
                  <span class="font-medium">${esc(p && p.name)}</span> × ${w.qty}
                  <span class="block text-xs text-subtle">${esc(w.reason)} · ${new Date(w.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${clock(w.time)}</span>
                </span>
                <span class="font-semibold text-danger">−${inr(w.loss)}</span>
              </li>`;
            })
            .join('')}</ul>`}
    </section>
  </div>`;
}

ACT['wa-markdown'] = (el) => act.markdown(el.dataset.id, Number(el.dataset.pct));
