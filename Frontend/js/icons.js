/* ==========================================================================
   RetailOS - SVG Icons, Brand Mark and Logos
   ========================================================================== */
const ICON_PATHS = {
  cart: 'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.2-4.2',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8Zm4 12a2 2 0 0 0 4 0',
  scan: 'M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10',
  barcode: 'M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12',
  trash: 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v6m4-6v6',
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6m-6 4h3',
  printer: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7v-7Z',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  box: 'M12 3 3 7.5v9L12 21l9-4.5v-9L12 3ZM3 7.5 12 12l9-4.5M12 12v9',
  trend: 'M3 17 9 11l4 4 8-8m0 0h-5m5 0v5',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h13',
  inbox: 'M4 13h4l1 3h6l1-3h4M4 13l2-8h12l2 8v6H4v-6Zm8-10v7m-3-3 3 3 3-3',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15m-1-1 8-8',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6l1-7Z',
  upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
  download: 'M12 4v12m0 0-4-4m4 4 4-4M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5',
  fileUp: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5m2-18v5h5M14 3l5 5v4m-1 9v-6m0 0-3 3m3-3 3 3',
  camera: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
  check: 'm5 12 5 5 9-10',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  send: 'M4 12 20 4l-4 16-4-7-8-1Zm8 1 8-9',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0m-7 7v2',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  alert: 'M12 4 2.5 20h19L12 4Zm0 6v4m0 3v.01',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4m-4-4h11',
  chat: 'M4 5h16v11H9l-5 4V5Z',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4v4l3 2',
  wallet: 'M4 7h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm0 0 12-3v3m0 6h.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  copy: 'M9 9h10v10H9V9Zm-4 6V5h10',
  share: 'M12 15V3m0 0L8 7m4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  smile: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM9 14s1 1.5 3 1.5 3-1.5 3-1.5M9.5 10h.01m5 0h.01',
  at: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1',
  video: 'M4 7h11v10H4V7Zm11 4 5-3v8l-5-3',
  store: 'M4 9 5.5 4h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a6 6 0 0 0-3-5.2',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4',
  cpu: 'M7 7h10v10H7V7Zm3-4v4m4-4v4m-4 10v4m4-4v4M3 10h4m-4 4h4m10-4h4m-4 4h4',
};

function icon(name, className = 'size-4') {
  const p = ICON_PATHS[name] || '';
  const sized = /(^|\s)(size-|h-|w-)/.test(className) ? className : `size-4 shrink-0 ${className}`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="${sized}" aria-hidden="true"><path d="${p}"></path></svg>`;
}

function brandMark(className = 'size-8') {
  return `<svg viewBox="0 0 40 32" class="${className}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h4l3 15h15"></path><circle cx="11" cy="26" r="2" fill="currentColor"></circle><circle cx="22" cy="26" r="2" fill="currentColor"></circle><rect x="17" y="3" width="20" height="5" rx="1.2"></rect><rect x="17" y="10" width="20" height="5" rx="1.2"></rect><rect x="17" y="17" width="20" height="5" rx="1.2"></rect><path d="M21 5.5h.01M21 12.5h.01M21 19.5h.01" stroke-width="3"></path><path d="M7.5 10h8M8.5 15h7"></path></svg>`;
}

function logo({ light = false, label = 'RetailOS', size = 'md' } = {}) {
  return `<span class="inline-flex items-center ${size === 'lg' ? 'gap-3' : 'gap-2'} ${light ? 'text-white' : 'text-ink'}">${brandMark(size === 'lg' ? 'h-10 w-12' : 'h-6 w-8')}<span class="font-semibold tracking-tight ${size === 'lg' ? 'text-4xl' : 'text-lg'}">${label}</span></span>`;
}
