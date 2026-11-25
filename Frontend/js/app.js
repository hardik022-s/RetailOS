/* ==========================================================================
   RetailOS - Application Bootstrapper & Lifecycle Controller
   ========================================================================== */

(async function initApp() {
  // 1. Initial network connectivity check
  await net.check(true);

  // 2. Load stored or remote state
  await loadState();

  // 3. Render initial view
  renderPage();
  renderNet();
  renderToasts();

  // 4. Auto-popup login modal after 6 seconds on the intro page (as in original prototype)
  setTimeout(() => {
    if (UI.page === 'intro' && !introTimerArmed && !api.token) {
      introTimerArmed = true;
      openLogin();
    }
  }, 6000);

  // 5. Responsive chat drawer alignment
  window.addEventListener('resize', () => {
    if (UI.page === 'dashboard') {
      renderChatShell();
    }
  });

  // 6. Hardware Barcode Scanner Listener
  let barcodeBuffer = '';
  let lastKeyTime = Date.now();

  window.addEventListener('keydown', async (e) => {
    // Ignore input if the cashier is intentionally typing in a search box or chat input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastKeyTime;
    lastKeyTime = currentTime;

    // Human typing is slow (>40ms). Hardware scanners type instantly.
    // If the time between keystrokes is too long, reset the buffer.
    if (timeDiff > 40) {
      barcodeBuffer = '';
    }

    // Capture standard alphanumeric keys
    if (e.key.length === 1) {
      barcodeBuffer += e.key;
    }

    // Scanners send an 'Enter' keystroke at the very end of the barcode
    if (e.key === 'Enter' && barcodeBuffer.length >= 8) {
      const scannedCode = barcodeBuffer;
      barcodeBuffer = ''; // Clear buffer immediately to prevent duplicate ghost scans

      try {
        // Fetch product directly from Django's PostgreSQL database
        const response = await api.get(`/inventory/products/?barcode=${scannedCode}`);
        
        // Assuming your DRF backend returns paginated results
        if (response && response.results && response.results.length > 0) {
          const product = response.results[0];
          
          // Add to cart using your global helper
          if (typeof addToCart === 'function') {
            addToCart(product.id);
          }
          
          toast(`Scanned: ${product.name}`);
          renderApp();
        }else {
          toast(`Barcode not found in database: ${scannedCode}`, 'error');
        }
      } catch (error) {
        console.error("Scanner API Error:", error);
        toast("Error connecting to inventory database", 'error');
      }
    }
  });

  // 6. Periodic health check to auto-detect when user starts backend server
  setInterval(async () => {
    if (!net.connected) {
      const isUp = await net.check(true);
      if (isUp) {
        toast('Connected to backend API!');
        await loadState();
        renderApp();
      }
    }
  }, 10000);
})();
