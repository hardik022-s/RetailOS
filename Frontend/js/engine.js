/* ==========================================================================
   RetailOS - Local Assistant Engine (Demo Mode & Fallback)
   When backend is connected, POST /assistant/chat calls the LLM service.
   When backend is offline, this deterministic NLP engine answers queries.
   ========================================================================== */

function findProduct(q, products) {
  const s = q.toLowerCase();
  return products.find((p) => p.keywords.some((k) => s.includes(k)) || s.includes(p.name.toLowerCase()));
}

function pendingRecs(c) {
  return c.products
    .map((p) => ({ p, r: recommend(p) }))
    .filter(
      ({ p, r }) =>
        r.needs &&
        !c.dismissed.includes(p.id) &&
        !c.pos.some((o) => o.productId === p.id && o.status === 'Pending')
    );
}

function answer(q, c) {
  const s = q.toLowerCase();
  const p = findProduct(s, c.products);
  const today = c.bills.filter((b) => isToday(b.time));

  if (p && !/top|best/.test(s)) {
    const r = recommend(p);
    const f = forecastDaily(p);
    const soldToday = today.reduce(
      (n, b) => n + b.items.filter((i) => i.productId === p.id).reduce((a, i) => a + i.qty, 0),
      0
    );
    const hist = p.history.slice(-4);
    const exp = isExpiring(p)
      ? ` Note: **${qty(p.expQty, p.unit)}** expire within ${p.expDays === 1 ? '24h' : `${p.expDays} days`}.`
      : '';
    const actions = [];
    if (r.qty > 0) actions.push({ kind: 'po', productId: p.id, qty: r.qty, label: `Add ${r.qty} to Order` });
    if (isExpiring(p)) actions.push({ kind: 'waste', productId: p.id, label: 'Log wastage' });

    return {
      text: `You have **${qty(p.stock, p.unit)}** of ${p.name} left (${soldToday} sold today). At the current pace it runs out **${runOutLabel(p)}**. Tomorrow's forecast is **${qty(Math.round(f), p.unit)}**, trend ${trendPct(p) >= 0 ? '▲ +' : '▼ '}${Math.round(trendPct(p))}% this week.${exp}`,
      chart: {
        title: `${p.name.split(' (')[0]} · units/day (dashed = AI prediction)`,
        data: [...hist, Math.round(f)],
        labels: [weekday(-4), weekday(-3), weekday(-2), weekday(-1), weekday(1)],
        predictedFrom: 4,
      },
      tip:
        r.qty > 0
          ? `Order **${qty(r.qty, p.unit)}** ${p.shelfLife <= 2 ? `every ${Math.max(1, r.cover)} day${r.cover > 1 ? 's' : ''} to avoid spoilage` : 'today'}, enough for ${r.cover} day${r.cover > 1 ? 's' : ''} of demand. Est. profit ${inr(r.profit)}.`
          : `Stock covers about ${Math.floor(p.stock / (f || 1))} days. No order needed yet.`,
      actions,
    };
  }

  if (/restock|reorder|order|low|buy|purchase|need/.test(s)) {
    const recs = pendingRecs(c).sort((a, b) => a.p.stock / (a.r.f || 1) - b.p.stock / (b.r.f || 1));
    if (!recs.length) {
      return {
        text: 'All items are covered for now. No open restock recommendations.',
        actions: [{ kind: 'nav', view: 'forecast', label: 'Open AI Forecast' }],
      };
    }
    const list = recs
      .slice(0, 4)
      .map(({ p, r }) => `• **${p.name}**: order ${qty(r.qty, p.unit)} (runs out ${runOutLabel(p).toLowerCase()})`)
      .join('\n');
    return {
      text: `${recs.length} item${recs.length > 1 ? 's' : ''} need restocking:\n${list}`,
      chart: {
        title: 'Days of stock left',
        data: recs.slice(0, 5).map(({ p, r }) => Math.round((p.stock / (r.f || 1)) * 10) / 10),
        labels: recs.slice(0, 5).map(({ p }) => p.name.split(' ')[0]),
      },
      tip: `Approving all costs about ${inr(recs.reduce((n, x) => n + x.r.spend, 0))} and protects ${inr(recs.reduce((n, x) => n + x.r.qty * x.p.price, 0))} in sales.`,
      actions: [
        { kind: 'approveAll', label: `Approve all ${recs.length} POs` },
        { kind: 'nav', view: 'forecast', label: 'Review in AI Forecast' },
      ],
    };
  }

  if (/waste|wastage|expir|spoil|discount/.test(s)) {
    const exp = c.products.filter(isExpiring).sort((a, b) => b.expQty * b.cost - a.expQty * a.cost);
    const loss = c.wastage.reduce((n, w) => n + w.loss, 0);
    const risk = exp.reduce((n, p) => n + p.expQty * p.cost, 0);
    return {
      text: exp.length
        ? `**${inr(risk)}** of stock is at risk of expiring:\n${exp.map((p) => `• ${p.name}: ${qty(p.expQty, p.unit)} within ${p.expDays === 1 ? '24h' : `${p.expDays} days`}`).join('\n')}\nWastage logged so far: ${inr(loss)}.`
        : `Nothing is close to expiry. Wastage logged so far: ${inr(loss)}.`,
      chart: exp.length
        ? {
            title: 'Value at risk (₹)',
            data: exp.map((p) => Math.round(p.expQty * p.cost)),
            labels: exp.map((p) => p.name.split(' ')[0]),
            highlight: 0,
          }
        : undefined,
      tip: exp.length
        ? `Put ${exp[0].name} on a 15% discount near the counter. It usually clears in 3 to 4 hours.`
        : undefined,
      actions: exp.length
        ? [
            { kind: 'waste', productId: exp[0].id, label: `Log ${exp[0].name.split(' ')[0]} wastage` },
            { kind: 'nav', view: 'inventory', label: 'View expiring items' },
          ]
        : [],
    };
  }

  if (/best|top|selling|popular|fast/.test(s)) {
    const ranked = [...c.products]
      .sort((a, b) => avg(b.history.slice(-7)) * b.price - avg(a.history.slice(-7)) * a.price)
      .slice(0, 5);
    return {
      text: `Your top sellers by revenue this week: ${ranked.map((p, i) => `${i + 1}. **${p.name}**`).join(', ')}.`,
      chart: {
        title: 'Avg revenue / day (₹)',
        data: ranked.map((p) => Math.round(avg(p.history.slice(-7)) * p.price)),
        labels: ranked.map((p) => p.name.split(' ')[0]),
        highlight: 0,
      },
      tip: `Keep ${ranked[0].name} at eye level near billing and never below ${Math.ceil(forecastDaily(ranked[0]) * 1.5)} units.`,
    };
  }

  if (/dead|slow|not selling|stuck/.test(s)) {
    const dead = c.products.filter(isDead);
    return {
      text: dead.length
        ? `${dead.length} dead-stock item${dead.length > 1 ? 's' : ''}: ${dead.map((p) => `**${p.name}** (${qty(p.stock, p.unit)}, ${inr(p.stock * p.cost)} locked)`).join(', ')}.`
        : 'No dead stock. Everything sold in the last 14 days.',
      tip: dead.length ? 'Bundle it with a fast mover or offer 20% off. Stop reordering until it clears.' : undefined,
      actions: [{ kind: 'nav', view: 'inventory', label: 'Open inventory' }],
    };
  }

  if (/khata|udhar|credit|owe/.test(s)) {
    const open = c.bills.filter((b) => b.payment === 'Khata' && !b.settled);
    return {
      text: open.length
        ? `Outstanding khata: **${inr(open.reduce((n, b) => n + b.total, 0))}** across ${open.length} bills (${[...new Set(open.map((b) => b.customer || 'Walk-in'))].join(', ')}).`
        : 'No outstanding khata. All credit is settled.',
      actions: [{ kind: 'nav', view: 'ledger', label: 'Open Ledger' }],
    };
  }

  if (/sale|revenue|earn|profit|margin|today|ledger|upi|cash|gst|how much/.test(s)) {
    const sales = today.reduce((n, b) => n + b.total, 0);
    const profit = today.reduce((n, b) => n + billProfit(b), 0);
    const hours = Array.from({ length: 7 }, (_, i) => 8 + i * 2);
    const byHour = hours.map((h) =>
      today
        .filter((b) => {
          const hr = new Date(b.time).getHours();
          return hr >= h && hr < h + 2;
        })
        .reduce((n, b) => n + b.total, 0)
    );
    const upi = today.filter((b) => b.payment === 'UPI').reduce((n, b) => n + b.total, 0);
    return {
      text: `Today so far: **${inr(sales)}** in sales from ${today.length} bills, estimated profit **${inr(profit)}**. UPI makes up ${sales ? Math.round((upi / sales) * 100) : 0}% of collections.`,
      chart: {
        title: 'Sales by time of day (₹)',
        data: byHour.map(Math.round),
        labels: hours.map((h) => `${h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`),
        highlight: byHour.indexOf(Math.max(...byHour)),
      },
      actions: [{ kind: 'nav', view: 'ledger', label: 'View ledger' }],
    };
  }

  return {
    text: 'I can look up stock, forecasts, sales, wastage and khata. Try asking:\n• "How much milk is left?"\n• "What should I restock today?"\n• "Which items are expiring?"\n• "What are my top sellers?"',
  };
}
