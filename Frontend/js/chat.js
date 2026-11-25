/* ==========================================================================
   RetailOS - AI Conversational Assistant & Chat Interface
   Connects to Backend LLM (/assistant/chat) when online,
   falls back to local assistantEngine when offline.
   Includes Speech-to-Text, Interactive Chart Cards & One-Tap Actions.
   ========================================================================== */

const CHAT = {
  msgs: [],
  input: '',
  typing: false,
  listening: false,
  done: {},
};

function initChat() {
  CHAT.msgs = [
    {
      id: uid(),
      from: 'ai',
      text: "Welcome to **RetailAI OS**. Upload your store's CSV inventory or add products in **Inventory**, then ask me anything about low stock, margins, or restock planning.",
      actions: [
        { kind: 'nav', view: 'inventory', label: 'Upload Store Dataset' },
      ],
    },
  ];
}
initChat();

const SUGGESTIONS = [
  'Which items are low on stock?',
  'What are our top margin items?',
  'Show me expiring stock risk',
  "Summarize today's sales",
];

function renderRich(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const span = parts
        .map((p) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return `<strong class="font-semibold text-ink">${esc(p.slice(2, -2))}</strong>`;
          }
          return esc(p);
        })
        .join('');
      return `<span class="block">${span}</span>`;
    })
    .join('');
}

function assistantContent() {
  const isOnline = net.connected;
  return `<div class="flex h-full flex-col bg-white">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b border-line px-4 py-3.5">
      <span class="grid size-9 place-items-center rounded-full bg-brand text-white">
        ${icon('spark')}
      </span>
      <div class="flex-1 leading-tight">
        <p class="text-sm font-semibold">AI Assistant</p>
        <p class="flex items-center gap-1.5 text-[11px] ${isOnline ? 'text-brand' : 'text-subtle'}">
          <span class="size-1.5 rounded-full ${isOnline ? 'bg-brand animate-pulse' : 'bg-amber'}"></span>
          ${isOnline ? 'Backend LLM connected' : 'Local AI engine (demo)'}
        </p>
      </div>
      <button data-act="chat-clear" class="text-[11px] text-muted hover:text-ink">Clear</button>
      <button data-act="chat-close" aria-label="Close assistant" class="text-muted hover:text-ink">
        ${icon('close')}
      </button>
    </div>

    <!-- Messages Container -->
    <div id="chat-msgs" class="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      ${CHAT.msgs.length === 0 ? '<p class="pt-10 text-center text-sm text-subtle">Ask anything about your store.</p>' : ''}
      ${CHAT.msgs
        .map((m) => {
          if (m.from === 'me') {
            return `<div class="ml-auto max-w-[85%] animate-fade-up">
              <p class="mb-1 text-right text-[10px] font-medium uppercase tracking-wide text-subtle">You</p>
              <div class="rounded-2xl rounded-br-sm bg-brand px-3.5 py-2.5 text-[13px] leading-relaxed text-white">${esc(m.text)}</div>
            </div>`;
          }

          let chartHtml = '';
          if (m.chart) {
            chartHtml = `<div class="rounded-xl border border-line p-3">
              <p class="mb-2 text-[11px] font-medium text-muted">${esc(m.chart.title)}</p>
              ${barChart({
                data: m.chart.data,
                labels: m.chart.labels,
                highlight: m.chart.highlight,
                predictedFrom: m.chart.predictedFrom,
              })}
            </div>`;
          }

          let tipHtml = '';
          if (m.tip) {
            tipHtml = `<div class="flex gap-2 rounded-xl border border-amber/30 bg-amber-soft/60 px-3 py-2.5 text-[12.5px] leading-relaxed text-ink/85">
              ${icon('bolt', 'mt-0.5 size-3.5 shrink-0 text-amber')}
              <span><strong class="font-semibold">Action: </strong>${renderRich(m.tip)}</span>
            </div>`;
          }

          let actionsHtml = '';
          if (m.actions && m.actions.length > 0) {
            actionsHtml = `<div class="flex flex-wrap gap-2">
              ${m.actions
                .map((a, i) => {
                  const key = `${m.id}-${i}`;
                  const isDone = CHAT.done[key];
                  return `<button
                    data-act="chat-action"
                    data-id="${m.id}"
                    data-idx="${i}"
                    ${isDone ? 'disabled' : ''}
                    class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isDone
                        ? 'bg-brand-soft text-brand'
                        : i === 0
                        ? 'bg-brand text-white hover:bg-brand-deep'
                        : 'border border-line text-ink hover:border-brand/40 hover:text-brand'
                    }">
                    ${icon(isDone ? 'check' : a.kind === 'nav' ? 'arrow' : 'bolt', 'size-3.5')}
                    ${isDone ? 'Done' : esc(a.label)}
                  </button>`;
                })
                .join('')}
            </div>`;
          }

          return `<div class="animate-fade-up space-y-2.5">
            <p class="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-brand">
              ${icon('spark', 'size-3')} RetailAI
            </p>
            <div class="rounded-2xl rounded-tl-sm bg-canvas px-3.5 py-2.5 text-[13px] leading-relaxed text-ink/85">
              ${renderRich(m.text)}
            </div>
            ${chartHtml}
            ${tipHtml}
            ${actionsHtml}
          </div>`;
        })
        .join('')}

      ${CHAT.typing
        ? `<div class="flex w-16 gap-1 rounded-2xl bg-canvas px-4 py-3">
            <span class="size-1.5 animate-bounce rounded-full bg-subtle" style="animation-delay: 0ms"></span>
            <span class="size-1.5 animate-bounce rounded-full bg-subtle" style="animation-delay: 150ms"></span>
            <span class="size-1.5 animate-bounce rounded-full bg-subtle" style="animation-delay: 300ms"></span>
          </div>`
        : ''}
    </div>

    <!-- Suggestions & Prompt Input -->
    <div class="border-t border-line p-3">
      <div class="mb-2.5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        ${SUGGESTIONS.map((s) => `<button data-act="chat-chip" data-q="${esc(s)}" class="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-muted transition hover:border-brand/40 hover:text-brand">${esc(s)}</button>`).join('')}
      </div>
      <form data-submit="chat-send" class="flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-2 py-1.5 focus-within:border-brand focus-within:bg-white">
        <button
          type="button"
          data-act="chat-mic"
          aria-label="Voice input"
          class="grid size-8 place-items-center rounded-lg transition ${CHAT.listening ? 'animate-pulse bg-danger-soft text-danger' : 'text-muted hover:bg-white hover:text-ink'}">
          ${icon('mic')}
        </button>
        <input
          id="chat-input"
          data-f="chat-input"
          data-in="chat-input"
          value="${esc(CHAT.input)}"
          placeholder="${CHAT.listening ? 'Listening…' : 'Ask AI anything…'}"
          class="min-w-0 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-subtle" />
        <button
          type="submit"
          ${dis(!CHAT.input.trim())}
          class="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-deep disabled:opacity-40">
          Send
        </button>
      </form>
    </div>
  </div>`;
}

function renderChatShell() {
  const docked = $('#chat-d');
  const fab = $('#chat-fab');
  const modal = $('#chat-m');

  if (docked) {
    if (UI.chatOpen && window.innerWidth >= 1280) {
      docked.style.display = 'block';
      docked.innerHTML = assistantContent();
    } else {
      docked.style.display = 'none';
      docked.innerHTML = '';
    }
  }

  if (fab) {
    fab.innerHTML =
      !UI.chatOpen
        ? `<button data-act="chat-open" aria-label="Open AI Assistant" class="fixed bottom-6 right-6 z-40 grid size-13 place-items-center rounded-full bg-brand text-white shadow-2xl shadow-brand/40 transition hover:scale-105 hover:bg-brand-deep">
            ${icon('spark', 'size-6')}
          </button>`
        : '';
  }

  if (modal) {
    if (UI.chatOpen && window.innerWidth < 1280) {
      modal.innerHTML = `<div class="fixed inset-0 z-50 flex justify-end">
        <div data-act="chat-close" class="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"></div>
        <div class="relative h-full w-full max-w-md bg-white shadow-2xl animate-fade-in">
          ${assistantContent()}
        </div>
      </div>`;
    } else {
      modal.innerHTML = '';
    }
  }

  mountCharts();
  scrollChat();
}

function renderChat() {
  renderChatShell();
}

function scrollChat() {
  setTimeout(() => {
    const list = $('#chat-msgs');
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, 40);
}

/* ---------- Query Execution (Backend LLM / LightGBM with local fallback) ---------- */
async function askAI(q) {
  if (!q.trim()) return;
  const userMsg = { id: uid(), from: 'me', text: q };
  CHAT.msgs.push(userMsg);
  CHAT.input = '';
  CHAT.typing = true;
  renderChat();

  let aiRes = null;

  // If backend is connected, query Django & LightGBM
  if (net.connected && !net.demo) {
    try {
      const resp = await api.post('/assistant/chat', {
        query: q,
        store: {
          storeName: S.storeName,
          userName: S.userName,
          productsCount: S.products.length,
          salesToday: useToday().sales,
        },
      });

      if (resp && resp.text) {
        // Standard RetailOS assistant response ({ text, chart, tip, actions })
        aiRes = resp;
      } else if (resp && resp.predicted_7_day_demand != null) {
        // Raw LightGBM model response format
        const demand = resp.predicted_7_day_demand;
        const orderQty = resp.recommended_order_quantity || Math.max(0, demand - 14);
        aiRes = {
          text: `LightGBM M5 Forecast for **${q}**: Predicted 7-day demand is **${demand} units**.`,
          tip: `Recommended restock order: **${orderQty} units** to prevent stockouts.`,
          actions: [{ kind: 'nav', view: 'forecast', label: 'Open AI Forecast' }],
        };
      }
    } catch (e) {
      toast('AI Engine offline, falling back to local mode');
    }
  }

  // Fallback to local intelligent assistant engine (engine.js)
  if (!aiRes) {
    await new Promise((r) => setTimeout(r, 600));
    aiRes = answer(q, S);
  }

  CHAT.typing = false;
  CHAT.msgs.push({ id: uid(), from: 'ai', ...aiRes });
  renderChat();
}


/* ---------- Chat Event Handlers ---------- */
INP['chat-input'] = (el) => {
  CHAT.input = el.value;
  const btn = el.form?.querySelector('button[type="submit"]');
  if (btn) btn.disabled = !CHAT.input.trim();
};

SUB['chat-send'] = () => {
  askAI(CHAT.input);
};

ACT['chat-chip'] = (el) => {
  askAI(el.dataset.q);
};

ACT['chat-open'] = () => {
  UI.chatOpen = true;
  renderApp();
  setTimeout(() => $('#chat-input')?.focus(), 100);
};

ACT['chat-close'] = () => {
  UI.chatOpen = false;
  renderApp();
};

ACT['chat-clear'] = () => {
  CHAT.msgs = [];
  renderChat();
};

ACT['chat-action'] = (el) => {
  const msgId = el.dataset.id;
  const idx = Number(el.dataset.idx);
  const msg = CHAT.msgs.find((m) => m.id === msgId);
  if (!msg || !msg.actions || !msg.actions[idx]) return;

  const a = msg.actions[idx];
  const key = `${msgId}-${idx}`;

  if (a.kind === 'po') {
    act.raisePO(a.productId, a.qty);
  } else if (a.kind === 'approveAll') {
    const recs = pendingRecs(S);
    recs.forEach(({ p, r }) => act.raisePO(p.id, r.qty));
  } else if (a.kind === 'nav') {
    go(a.view);
    if (window.innerWidth < 1280) UI.chatOpen = false;
    renderApp();
    return;
  } else if (a.kind === 'waste') {
    openModal({ type: 'waste', productId: a.productId });
    return;
  }

  CHAT.done[key] = true;
  renderChat();
};

/* ---------- Speech Recognition (Voice Input) ---------- */
ACT['chat-mic'] = () => {
  const SpeechCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechCtor) {
    toast('Voice input is not supported in this browser');
    return;
  }

  const rec = new SpeechCtor();
  rec.lang = 'en-IN';
  rec.interimResults = false;

  rec.onresult = (e) => {
    const spoken = e.results[0][0].transcript;
    if (spoken) askAI(spoken);
  };
  rec.onend = () => {
    CHAT.listening = false;
    renderChat();
  };
  rec.onerror = () => {
    CHAT.listening = false;
    renderChat();
  };

  CHAT.listening = true;
  renderChat();
  rec.start();
};
