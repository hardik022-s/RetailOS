/* ==========================================================================
   RetailOS - API Client & Network Status Management
   ========================================================================== */
const NOT_CONNECTED = 'Backend API is not connected. Running in demo mode with local storage.';

class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const net = {
  checked: false,
  connected: false,
  demo: true,

  async check(silent = false) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), CFG.HEALTH_TIMEOUT || 2000);
      const res = await fetch(`${CFG.API_BASE}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(id);

      const wasConnected = this.connected;
      if (res && res.ok) {
        this.connected = true;
        this.demo = false;
      } else {
        this.connected = false;
        this.demo = true;
      }
      this.checked = true;

      if (!silent || wasConnected !== this.connected) {
        window.dispatchEvent(new CustomEvent('net-changed', { detail: { connected: this.connected, demo: this.demo } }));
      }
      return this.connected;
    } catch {
      this.connected = false;
      this.demo = true;
      this.checked = true;
      if (!silent) {
        window.dispatchEvent(new CustomEvent('net-changed', { detail: { connected: false, demo: true } }));
      }
      return false;
    }
  },
};

const api = {
  token: localStorage.getItem('retailos_token') || '',

  setToken(t) {
    this.token = t || '';
    if (t) localStorage.setItem('retailos_token', t);
    else localStorage.removeItem('retailos_token');
  },

  headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', Accept: 'application/json', ...extra };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  },

  async request(method, path, body = null, isUpload = false) {
    const url = `${CFG.API_BASE}${path.startsWith('/') ? path : '/' + path}`;
    const opts = { method, headers: {} };

    if (this.token) opts.headers.Authorization = `Bearer ${this.token}`;

    if (body) {
      if (isUpload) {
        opts.body = body; // FormData
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.headers.Accept = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }

    try {
      const res = await fetch(url, opts);
      if (res.status === 401) {
        this.setToken('');
        window.dispatchEvent(new CustomEvent('session-expired'));
        throw new ApiError('Session expired. Please sign in again.', 401);
      }

      let data = null;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json().catch(() => null);
      } else {
        data = await res.text().catch(() => null);
      }

      if (!res.ok) {
        const msg = (data && (data.detail || data.message || data.error)) || `API Error ${res.status}`;
        throw new ApiError(msg, res.status, data);
      }

      // Successful request confirms backend is reachable
      if (!net.connected) {
        net.connected = true;
        net.demo = false;
        window.dispatchEvent(new CustomEvent('net-changed', { detail: { connected: true, demo: false } }));
      }

      return data;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      // Network failure / connection refused
      net.connected = false;
      net.demo = true;
      window.dispatchEvent(new CustomEvent('net-changed', { detail: { connected: false, demo: true } }));
      throw new ApiError(NOT_CONNECTED, 0);
    }
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  del(path) { return this.request('DELETE', path); },
  upload(path, formData) { return this.request('POST', path, formData, true); },
  health() { return net.check(); },
};
