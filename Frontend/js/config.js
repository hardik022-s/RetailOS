/* ==========================================================================
   RetailOS - Global Configuration
   ========================================================================== */
const CFG = {
  // Backend API base URL (FastAPI / Express / Django / Flask)
  API_BASE: window.RETAILOS_API_BASE || 'https://retailos-tv8v.onrender.com/api',

  // Google OAuth 2.0 Client ID for Google Identity Services (MUST BE IN QUOTES)
  GOOGLE_CLIENT_ID: window.RETAILOS_GOOGLE_CLIENT_ID || '293346691358-e253db2d8ik5lqbhaedh2f9j3vqtjvh3.apps.googleusercontent.com',

  // CDN scripts
  GOOGLE_SCRIPT: 'https://accounts.google.com/gsi/client',
  OCR_SCRIPT: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  XLSX_SCRIPT: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  MAMMOTH_SCRIPT: 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
  PDFJS_SCRIPT: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  PDFJS_WORKER: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',

  // Timeout for backend connectivity ping (ms)
  HEALTH_TIMEOUT: 15000,
};