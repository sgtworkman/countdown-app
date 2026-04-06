/* ==============================================
   DaysPop PWA — app.js
   All logic: routing, CRUD, countdown, PRO, Stripe
   ============================================== */

// ─── CONSTANTS ───────────────────────────────
const THEMES = [
  { id: 'pink-purple', name: 'Sparkle',  free: true,  gradient: ['#C85FD4', '#FF6B9D'] },
  { id: 'ocean',       name: 'Ocean',    free: true,  gradient: ['#4FC3F7', '#0077B6'] },
  { id: 'sunset',      name: 'Sunset',   free: true,  gradient: ['#FF6B35', '#FF006E'] },
  { id: 'mint',        name: 'Mint',     free: true,  gradient: ['#06D6A0', '#118AB2'] },
  { id: 'gold',        name: 'Gold',     free: false, gradient: ['#FFD166', '#FF9F1C'] },
  { id: 'grape',       name: 'Grape',    free: false, gradient: ['#7B2D8B', '#4A0E8F'] },
  { id: 'dark',        name: 'Midnight', free: false, gradient: ['#1A1A2E', '#16213E'] },
  { id: 'minimal',     name: 'Cloud',    free: false, gradient: ['#F8F9FA', '#E9ECEF'] },
];

const EMOJIS = [
  '✈️','🏖️','🎂','🎄','🎃','🎆','💍','🎓','🏠','🐣',
  '🌸','🎵','⚽','🏋️','🍕','🎮','📚','💼','🚀','🌍',
  '❤️','⭐','🦋','🌈','🎯','🎪','🏆','🎭','🌙','✨'
];

const LIGHT_THEMES = ['minimal', 'gold'];
const MAX_FREE = 3;
const STORAGE_EVENTS   = 'dayspop_events';
const STORAGE_PRO      = 'dayspop_pro';
const STORAGE_SETTINGS = 'dayspop_settings';

// ─── STATE ───────────────────────────────────
let navStack = ['home'];
let detailInterval = null;
let longPressTimer = null;

// ─── DATA LAYER ──────────────────────────────
function getEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_EVENTS)) || []; }
  catch { return []; }
}
function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
  } catch (e) {
    showToast('Storage full — try removing a photo background');
  }
}
function getEvent(id) {
  return getEvents().find(e => e.id === id) || null;
}
function addEvent(ev) {
  const events = getEvents();
  events.push(ev);
  saveEvents(events);
}
function updateEvent(id, data) {
  const events = getEvents();
  const i = events.findIndex(e => e.id === id);
  if (i >= 0) { events[i] = { ...events[i], ...data }; saveEvents(events); }
}
function deleteEvent(id) {
  saveEvents(getEvents().filter(e => e.id !== id));
}
function isPro() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_PRO));
    return d && d.verified === true;
  } catch { return false; }
}
function setPro(sessionId) {
  localStorage.setItem(STORAGE_PRO, JSON.stringify({
    verified: true, sessionId, verifiedAt: new Date().toISOString()
  }));
}
function getSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_SETTINGS)) || { showSeconds: true, use24h: false }; }
  catch { return { showSeconds: true, use24h: false }; }
}
function saveSettings(s) { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(s)); }

// ─── COUNTDOWN MATH ─────────────────────────
function getCountdown(dateStr) {
  const now = new Date();
  const target = new Date(dateStr + 'T00:00:00');
  const diffMs = target - now;
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);
  const totalSeconds = Math.floor(absDiff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isToday = days === 0 && !isPast;
  return { days, hours, minutes, seconds, isPast, isToday };
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function pad(n) { return String(n).padStart(2, '0'); }

// Handle recurring: advance past events to next occurrence (run once on init)
function processRecurring() {
  const events = getEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let changed = false;
  events.forEach(ev => {
    if (!ev.recurring) return;
    const target = new Date(ev.targetDate + 'T00:00:00');
    if (target < today) {
      target.setFullYear(today.getFullYear());
      if (target < today) target.setFullYear(today.getFullYear() + 1);
      ev.targetDate = target.toISOString().split('T')[0];
      changed = true;
    }
  });
  if (changed) saveEvents(events);
}

// Sort: future events nearest first, past events at end
function sortedEvents() {
  const events = getEvents();
  const now = new Date();
  const future = events.filter(e => new Date(e.targetDate + 'T00:00:00') >= now)
    .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
  const past = events.filter(e => new Date(e.targetDate + 'T00:00:00') < now)
    .sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate));
  return [...future, ...past];
}

// ─── THEME HELPERS ───────────────────────────
function getTheme(id) { return THEMES.find(t => t.id === id) || THEMES[0]; }
function gradientCSS(theme) { return `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`; }
function isLightTheme(id) { return LIGHT_THEMES.includes(id); }

// ─── ROUTER ──────────────────────────────────
function navigate(screen, param, back = false) {
  clearDetailInterval();
  const prev = navStack[navStack.length - 1];
  if (!back) {
    navStack.push(screen + (param ? '/' + param : ''));
  }
  const screenId = screen;
  // Render content
  switch (screenId) {
    case 'home': renderHome(); break;
    case 'add': renderAdd(param); break;
    case 'detail': renderDetail(param); break;
    case 'settings': renderSettings(); break;
  }
  // Transition
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(s => { s.classList.remove('active', 'exit'); });
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    if (!back) target.style.transform = '';
    else target.style.transform = 'translateX(-25%)';
    void target.offsetHeight; // reflow
    target.style.transform = '';
    target.classList.add('active');
  }
  // Update hash silently
  const hash = '#' + screen + (param ? '/' + param : '');
  history.replaceState(null, '', hash);
}

function goBack() {
  if (navStack.length > 1) {
    navStack.pop();
    const prev = navStack[navStack.length - 1];
    const [screen, param] = prev.split('/');
    navigate(screen, param, true);
  }
}

function clearDetailInterval() {
  if (detailInterval) { clearInterval(detailInterval); detailInterval = null; }
}

// ─── PRO GATES ───────────────────────────────
function canAddEvent() { return isPro() || getEvents().length < MAX_FREE; }
function canUseTheme(themeId) {
  const t = getTheme(themeId);
  return t.free || isPro();
}

// ─── RENDER: HOME ────────────────────────────
function renderHome() {
  const el = document.getElementById('screen-home');
  const events = sortedEvents();
  const pro = isPro();

  let html = `
    <div class="header">
      <div class="header-left">
        <a href="https://dayspop.com" class="header-logo-link" title="Back to DaysPop.com">
          <img src="dayspop-logo.jpg" alt="DaysPop" class="header-logo">
          <span class="header-title">DaysPop<span class="header-version">v1.0.5</span></span>
        </a>
        ${pro ? '<span class="header-pro">PRO</span>' : ''}
      </div>
      <button class="header-btn" onclick="navigate('settings')" aria-label="Settings">⚙️</button>
    </div>
    <div class="home-content">
  `;

  if (events.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-sparkle">✨</div>
        <div class="empty-title">Add your first countdown</div>
        <div class="empty-sub">Tap the + button to count down to something amazing</div>
        <button class="empty-btn" onclick="handleAddTap()">+ New Countdown</button>
      </div>
    `;
  } else {
    // Free limit banner
    if (!pro && events.length >= MAX_FREE) {
      html += `
        <div class="free-banner" onclick="showPaywall()">
          <span class="free-banner-text">You've hit the free limit. Upgrade to PRO →</span>
          <span class="free-banner-arrow">✨</span>
        </div>
      `;
    }
    html += '<div class="card-list">';
    events.forEach((ev, i) => {
      const theme = getTheme(ev.themeId);
      const cd = getCountdown(ev.targetDate);
      const light = isLightTheme(ev.themeId);
      html += `
        <div class="countdown-card ${light ? 'card-light' : ''} ${cd.isPast ? 'card-past' : ''}"
             style="background: ${gradientCSS(theme)}; animation-delay: ${i * 0.06}s"
             onclick="navigate('detail', '${ev.id}')"
             ontouchstart="lpStart(event, '${ev.id}')"
             ontouchend="lpEnd()" ontouchcancel="lpEnd()"
             onmousedown="lpStart(event, '${ev.id}')"
             onmouseup="lpEnd()" onmouseleave="lpEnd()">
          ${ev.photoDataUrl ? `<div class="card-photo-bg" style="background-image:url(${ev.photoDataUrl})"></div>` : ''}
          <div class="card-content">
            <div class="card-top">
              <span class="card-emoji">${ev.emoji}</span>
              <span class="card-name">${escHTML(ev.name)}</span>
              ${ev.recurring ? '<span class="card-recurring">🔄</span>' : ''}
            </div>
            <span class="card-number">${cd.days}</span>
            <span class="card-label">${cd.isPast ? 'days ago' : (cd.isToday ? "It's today!" : 'days away')}</span>
            <div class="card-date">${formatDate(ev.targetDate)}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;

  // Show/hide FAB
  document.getElementById('fab').style.display = 'flex';
}

// ─── RENDER: ADD / EDIT ──────────────────────
function renderAdd(eventId) {
  const el = document.getElementById('screen-add');
  const editing = eventId ? getEvent(eventId) : null;
  const pro = isPro();

  // Default values
  const name = editing ? editing.name : '';
  const date = editing ? editing.targetDate : '';
  const emoji = editing ? editing.emoji : '✨';
  const themeId = editing ? editing.themeId : 'pink-purple';
  const photo = editing ? editing.photoDataUrl : null;
  const recurring = editing ? editing.recurring : false;

  let html = `
    <div class="header">
      <button class="header-btn header-back" onclick="goBack()">←</button>
      <div class="header-left">
        <span class="header-title">${editing ? 'Edit Countdown' : 'New Countdown'}</span>
      </div>
    </div>
    <div class="add-content">
      <div class="form-group">
        <label class="form-label">Event Name</label>
        <input class="form-input" type="text" id="input-name" maxlength="40"
               placeholder="Beach Vacation, Birthday..." value="${escAttr(name)}"
               oninput="updateCharCount()">
        <div class="char-count" id="char-count">${name.length}/40</div>
      </div>

      <div class="form-group">
        <label class="form-label">Target Date</label>
        <input class="form-input" type="date" id="input-date" value="${date}">
      </div>

      <div class="form-group">
        <label class="form-label">Emoji</label>
        <div class="emoji-grid">
          ${EMOJIS.map(e => `
            <button class="emoji-btn ${e === emoji ? 'selected' : ''}" type="button"
                    onclick="selectEmoji(this, '${e}')">${e}</button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Color Theme</label>
        <div class="theme-row">
          ${THEMES.map(t => `
            <div class="theme-swatch-wrap">
              <div class="theme-swatch ${t.id === themeId ? 'selected' : ''}"
                   style="background: ${gradientCSS(t)}"
                   onclick="selectTheme('${t.id}', ${!t.free})">
                ${!t.free && !pro ? '<div class="theme-lock">🔒</div>' : ''}
              </div>
              <div class="theme-name">${t.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Photo Background ${!pro ? '· PRO' : ''}</label>
        <div class="photo-picker" id="photo-picker" onclick="${pro ? 'pickPhoto()' : 'showPaywall()'}">
          ${photo
            ? `<img src="${photo}" class="photo-preview" alt="Photo">
               <div style="flex:1">
                 <div class="photo-picker-text">Photo selected</div>
                 <div class="photo-picker-sub">Tap to change</div>
               </div>
               <button class="photo-remove" onclick="event.stopPropagation(); removePhoto()">✕</button>`
            : `<span class="photo-picker-icon">📷</span>
               <div>
                 <div class="photo-picker-text">${pro ? 'Add photo background' : 'PRO feature — tap to upgrade'}</div>
                 <div class="photo-picker-sub">${pro ? 'From your camera roll' : 'Unlock with DaysPop PRO'}</div>
               </div>`
          }
        </div>
        <input type="file" id="photo-file-input" accept="image/*" onchange="handlePhotoSelected(event)">
      </div>

      <div class="form-group">
        <div class="toggle-row">
          <div class="toggle-info">
            <div class="toggle-label-text">Repeat Annually ${!pro ? '· PRO' : ''}</div>
            <div class="toggle-sub">Auto-reset after the date passes</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="input-recurring" ${recurring ? 'checked' : ''}
                   onchange="handleRecurringToggle(this)" ${!pro && !recurring ? 'disabled' : ''}>
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>
        </div>
      </div>

      <button class="btn-save" id="btn-save" onclick="handleSave('${eventId || ''}')"
              ${!name || !date ? 'disabled' : ''}>
        ${editing ? 'Save Changes' : 'Create Countdown ✨'}
      </button>
      ${editing ? `<button class="btn-delete" onclick="confirmDelete('${eventId}')">Delete Countdown</button>` : ''}
    </div>
  `;
  el.innerHTML = html;
  document.getElementById('fab').style.display = 'none';

  // Live validation — listen for both 'input' and 'change' events
  // Mobile date pickers (especially iOS Safari) fire 'change' not 'input'
  const nameInput = document.getElementById('input-name');
  const dateInput = document.getElementById('input-date');
  nameInput.addEventListener('input', validateAddForm);
  dateInput.addEventListener('input', validateAddForm);
  dateInput.addEventListener('change', validateAddForm);
}

function validateAddForm() {
  const name = document.getElementById('input-name')?.value?.trim();
  const date = document.getElementById('input-date')?.value;
  const btn = document.getElementById('btn-save');
  if (btn) btn.disabled = !name || !date;
}

function updateCharCount() {
  const len = document.getElementById('input-name')?.value?.length || 0;
  const el = document.getElementById('char-count');
  if (el) el.textContent = `${len}/40`;
}

// ─── FORM HANDLERS ───────────────────────────
let selectedEmoji = '✨';
let selectedTheme = 'pink-purple';
let selectedPhoto = null;

function selectEmoji(btn, emoji) {
  selectedEmoji = emoji;
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function selectTheme(id, isProTheme) {
  if (isProTheme && !isPro()) { showPaywall(); return; }
  selectedTheme = id;
  // Update selection visually without re-rendering the entire form
  document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('selected'));
  document.querySelectorAll('.theme-swatch-wrap').forEach(wrap => {
    const swatch = wrap.querySelector('.theme-swatch');
    const name = wrap.querySelector('.theme-name');
    if (name && name.textContent === getTheme(id).name) {
      swatch.classList.add('selected');
    }
  });
}

function pickPhoto() {
  document.getElementById('photo-file-input')?.click();
}

function handlePhotoSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  // Compress image to prevent localStorage overflow
  const img = new Image();
  const reader = new FileReader();
  reader.onload = function(ev) {
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const MAX = 600; // max dimension
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
      else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      selectedPhoto = canvas.toDataURL('image/jpeg', 0.7);
      // Update photo picker area without re-rendering entire form
      updatePhotoPicker();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  selectedPhoto = null;
  updatePhotoPicker();
}

function updatePhotoPicker() {
  const pro = isPro();
  const picker = document.getElementById('photo-picker');
  if (!picker) return;
  if (selectedPhoto) {
    picker.onclick = pro ? pickPhoto : showPaywall;
    picker.innerHTML = `
      <img src="${selectedPhoto}" class="photo-preview" alt="Photo">
      <div style="flex:1">
        <div class="photo-picker-text">Photo selected</div>
        <div class="photo-picker-sub">Tap to change</div>
      </div>
      <button class="photo-remove" onclick="event.stopPropagation(); removePhoto()">✕</button>`;
  } else {
    picker.onclick = pro ? pickPhoto : showPaywall;
    picker.innerHTML = `
      <span class="photo-picker-icon">📷</span>
      <div>
        <div class="photo-picker-text">${pro ? 'Add photo background' : 'PRO feature — tap to upgrade'}</div>
        <div class="photo-picker-sub">${pro ? 'From your camera roll' : 'Unlock with DaysPop PRO'}</div>
      </div>`;
  }
}

function handleRecurringToggle(checkbox) {
  if (!isPro()) { checkbox.checked = false; showPaywall(); }
}

function handleSave(eventId) {
  const name = document.getElementById('input-name')?.value?.trim();
  const date = document.getElementById('input-date')?.value;
  const recurring = document.getElementById('input-recurring')?.checked || false;

  if (!name || !date) return;

  if (eventId) {
    // Edit
    updateEvent(eventId, {
      name, targetDate: date, emoji: selectedEmoji,
      themeId: selectedTheme, photoDataUrl: selectedPhoto, recurring
    });
    showToast('Countdown updated ✨');
  } else {
    // New
    addEvent({
      id: crypto.randomUUID(),
      name, targetDate: date, emoji: selectedEmoji,
      themeId: selectedTheme, photoDataUrl: selectedPhoto, recurring,
      createdAt: new Date().toISOString()
    });
    showToast('Countdown created ✨');
  }
  goBack();
}

// ─── RENDER: DETAIL ──────────────────────────
function renderDetail(eventId) {
  const el = document.getElementById('screen-detail');
  const ev = getEvent(eventId);
  if (!ev) { goBack(); return; }

  const theme = getTheme(ev.themeId);
  const light = isLightTheme(ev.themeId);
  const cd = getCountdown(ev.targetDate);
  const settings = getSettings();

  let html = `
    <div class="detail-bg" style="background: ${gradientCSS(theme)}">
      ${ev.photoDataUrl ? `<div class="detail-photo-bg" style="background-image:url(${ev.photoDataUrl})"></div>` : ''}
    </div>
    <div class="${light ? 'detail-light' : ''}">
      <div class="detail-header">
        <button class="header-btn" onclick="goBack()">←</button>
        <button class="header-btn" onclick="handleEditTap('${ev.id}')">✏️</button>
      </div>
      <div class="detail-body">
        <div class="detail-emoji">${ev.emoji}</div>
        <div class="detail-name">${escHTML(ev.name)}</div>
        <div class="countdown-display">
          <span class="countdown-big-num" id="detail-days">${cd.days}</span>
          <span class="countdown-big-label">${cd.isPast ? 'days ago' : (cd.isToday ? '' : 'days')}</span>
        </div>
        ${cd.isToday ? '<div class="detail-past-badge">🎉 It\'s today!</div>' : ''}
        ${cd.isPast ? '<div class="detail-past-badge">This event has passed</div>' : ''}
        ${!cd.isPast && !cd.isToday && settings.showSeconds ? `
          <div class="countdown-ticker" id="detail-ticker">
            <div class="ticker-unit"><span class="ticker-num" id="tick-h">${pad(cd.hours)}</span><span class="ticker-label">hours</span></div>
            <span class="ticker-colon">:</span>
            <div class="ticker-unit"><span class="ticker-num" id="tick-m">${pad(cd.minutes)}</span><span class="ticker-label">min</span></div>
            <span class="ticker-colon">:</span>
            <div class="ticker-unit"><span class="ticker-num" id="tick-s">${pad(cd.seconds)}</span><span class="ticker-label">sec</span></div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  el.innerHTML = html;
  document.getElementById('fab').style.display = 'none';

  // Live ticker
  if (!cd.isPast && settings.showSeconds) {
    detailInterval = setInterval(() => {
      const c = getCountdown(ev.targetDate);
      const daysEl = document.getElementById('detail-days');
      const hEl = document.getElementById('tick-h');
      const mEl = document.getElementById('tick-m');
      const sEl = document.getElementById('tick-s');
      if (daysEl) daysEl.textContent = c.days;
      if (hEl) hEl.textContent = pad(c.hours);
      if (mEl) mEl.textContent = pad(c.minutes);
      if (sEl) {
        sEl.textContent = pad(c.seconds);
        sEl.classList.remove('pulse');
        void sEl.offsetHeight;
        sEl.classList.add('pulse');
      }
    }, 1000);
  }
}

function handleEditTap(eventId) {
  const ev = getEvent(eventId);
  if (ev) {
    selectedEmoji = ev.emoji;
    selectedTheme = ev.themeId;
    selectedPhoto = ev.photoDataUrl || null;
    navigate('add', eventId);
  }
}

// ─── RENDER: SETTINGS ────────────────────────
function renderSettings() {
  const el = document.getElementById('screen-settings');
  const pro = isPro();
  const settings = getSettings();

  let html = `
    <div class="header">
      <button class="header-btn header-back" onclick="goBack()">←</button>
      <div class="header-left">
        <span class="header-title">Settings</span>
      </div>
    </div>
    <div class="settings-content">
      ${!pro ? `
        <div class="settings-upgrade" onclick="showPaywall()">
          <div class="settings-upgrade-title">✨ Upgrade to DaysPop PRO</div>
          <div class="settings-upgrade-sub">Unlimited countdowns, all themes, photos & more — $2.99</div>
        </div>
      ` : ''}

      <div class="settings-section">
        <div class="settings-section-title">Account</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">Status</span>
            ${pro
              ? '<span class="settings-pro-badge">✨ PRO</span>'
              : '<span class="settings-row-value">Free</span>'
            }
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Restore Purchase</span>
            <button class="settings-btn" onclick="restorePurchase()">Restore</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">Display</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">Show Seconds</span>
            <label class="toggle">
              <input type="checkbox" ${settings.showSeconds ? 'checked' : ''}
                     onchange="toggleSetting('showSeconds', this.checked)">
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">24-Hour Format</span>
            <label class="toggle">
              <input type="checkbox" ${settings.use24h ? 'checked' : ''}
                     onchange="toggleSetting('use24h', this.checked)">
              <div class="toggle-track"></div>
              <div class="toggle-thumb"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">About</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">Version</span>
            <span class="settings-row-value" style="color:#C85FD4;font-weight:700;">v1.0.5</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Privacy Policy</span>
            <a href="https://dayspop.com/privacy" class="settings-btn" style="text-decoration:none" target="_blank">View</a>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Support</span>
            <a href="mailto:support@dayspop.com" class="settings-btn" style="text-decoration:none">Email</a>
          </div>
        </div>
      </div>

      <div class="settings-version">DaysPop v1.0.5 · Made with 💜</div>
    </div>
  `;
  el.innerHTML = html;
  document.getElementById('fab').style.display = 'none';
}

function toggleSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  saveSettings(s);
}

// ─── PAYWALL ─────────────────────────────────
function showPaywall() {
  const overlay = document.getElementById('paywall');
  overlay.innerHTML = `
    <div class="paywall-sheet">
      <div class="paywall-handle"></div>
      <div class="paywall-icon">✨</div>
      <div class="paywall-title">Unlock DaysPop PRO</div>
      <div class="paywall-subtitle">One time. Forever. No subscription.</div>
      <ul class="paywall-features">
        <li><span>✅</span> Unlimited countdowns (you have ${MAX_FREE} free)</li>
        <li><span>✅</span> All 8 beautiful themes</li>
        <li><span>✅</span> Custom photo backgrounds</li>
        <li><span>✅</span> Recurring annual events</li>
        <li><span>✅</span> Support indie development ❤️</li>
      </ul>
      <button class="paywall-buy" onclick="startCheckout()">Unlock for $2.99</button>
      <button class="paywall-restore" onclick="hidePaywall(); restorePurchase();">Restore Purchase</button>
      <button class="paywall-dismiss" onclick="hidePaywall()">Maybe Later</button>
    </div>
  `;
  overlay.classList.add('active');
}

function hidePaywall() {
  document.getElementById('paywall').classList.remove('active');
}

// ─── STRIPE ──────────────────────────────────
async function startCheckout() {
  try {
    const res = await fetch('/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        successUrl: window.location.origin + '/?pro_success=1',
        cancelUrl: window.location.origin + '/?pro_cancel=1',
      })
    });
    if (!res.ok) throw new Error('Not configured');
    const { url } = await res.json();
    if (url) window.location.href = url;
    else throw new Error('No URL');
  } catch (e) {
    hidePaywall();
    showToast('PRO coming soon! 🚀');
  }
}

async function checkProReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('pro_success') && params.get('session_id')) {
    try {
      const res = await fetch(`/verify-pro?session_id=${params.get('session_id')}`);
      const { verified } = await res.json();
      if (verified) {
        setPro(params.get('session_id'));
        showProSuccess();
      }
    } catch (e) {
      // Verification failed — don't grant PRO without confirmation
      showToast('Could not verify purchase. Please try restoring.');
    }
    window.history.replaceState({}, '', window.location.pathname);
  }
}

async function restorePurchase() {
  const proData = localStorage.getItem(STORAGE_PRO);
  if (proData) {
    try {
      const d = JSON.parse(proData);
      if (d.sessionId) {
        const res = await fetch(`/verify-pro?session_id=${d.sessionId}`);
        const { verified } = await res.json();
        if (verified) {
          setPro(d.sessionId);
          showToast('PRO restored! ✨');
          navigate('home');
          return;
        }
      }
    } catch {}
  }
  showToast('No purchase found');
}

function showProSuccess() {
  const root = document.getElementById('pro-success-root');
  // Confetti particles
  let confetti = '';
  const colors = ['#C85FD4', '#FF6B9D', '#FFD166', '#4FC3F7', '#06D6A0', '#FF6B35'];
  for (let i = 0; i < 40; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100;
    const delay = Math.random() * 0.8;
    confetti += `<div class="confetti-particle" style="background:${c};left:${x}%;top:-10px;animation-delay:${delay}s"></div>`;
  }
  root.innerHTML = `
    <div class="pro-success">
      ${confetti}
      <div class="pro-success-inner">
        <div class="pro-success-sparkle">🎉</div>
        <div class="pro-success-title">Welcome to PRO!</div>
        <div class="pro-success-sub">All features unlocked. Enjoy!</div>
        <button class="pro-success-btn" onclick="dismissProSuccess()">Let's Go ✨</button>
      </div>
    </div>
  `;
}

function dismissProSuccess() {
  document.getElementById('pro-success-root').innerHTML = '';
  navigate('home');
}

// ─── CONFIRM DIALOG ──────────────────────────
function confirmDelete(eventId) {
  const root = document.getElementById('confirm-root');
  root.innerHTML = `
    <div class="confirm-overlay" onclick="dismissConfirm(event)">
      <div class="confirm-box" onclick="event.stopPropagation()">
        <div class="confirm-title">Delete Countdown?</div>
        <div class="confirm-msg">This can't be undone. Your countdown will be gone forever.</div>
        <div class="confirm-btns">
          <button class="confirm-cancel" onclick="dismissConfirm()">Cancel</button>
          <button class="confirm-ok" onclick="doDelete('${eventId}')">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function dismissConfirm(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('confirm-root').innerHTML = '';
}

function doDelete(eventId) {
  deleteEvent(eventId);
  dismissConfirm();
  showToast('Countdown deleted');
  // Go back to home
  navStack = ['home'];
  navigate('home');
}

// ─── LONG PRESS ──────────────────────────────
function lpStart(e, eventId) {
  longPressTimer = setTimeout(() => {
    confirmDelete(eventId);
  }, 500);
}
function lpEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

// ─── ADD BUTTON ──────────────────────────────
function handleAddTap() {
  if (!canAddEvent()) {
    showPaywall();
    return;
  }
  selectedEmoji = '✨';
  selectedTheme = 'pink-purple';
  selectedPhoto = null;
  navigate('add');
}

// ─── TOAST ───────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ─── SPARKLE CANVAS ──────────────────────────
function initSparkles() {
  const canvas = document.getElementById('sparkles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const sparkles = [];
  const COUNT = 25;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Sparkle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2.5 + 0.8;
      this.opacity = Math.random() * 0.35 + 0.05;
      this.speed = Math.random() * 0.25 + 0.08;
      this.phase = Math.random() * Math.PI * 2;
      this.color = Math.random() > 0.5
        ? `rgba(236, 72, 153, ALPHA)`
        : `rgba(168, 85, 247, ALPHA)`;
    }
    update() {
      this.phase += 0.018;
      this.y -= this.speed;
      this.x += Math.sin(this.phase) * 0.25;
      this.currentAlpha = this.opacity * ((Math.sin(this.phase * 3) + 1) / 2);
      if (this.y < -10) { this.y = canvas.height + 10; this.x = Math.random() * canvas.width; }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentAlpha;
      ctx.fillStyle = this.color.replace('ALPHA', '1');
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - s * 2);
      ctx.quadraticCurveTo(this.x + s * 0.3, this.y - s * 0.3, this.x + s * 2, this.y);
      ctx.quadraticCurveTo(this.x + s * 0.3, this.y + s * 0.3, this.x, this.y + s * 2);
      ctx.quadraticCurveTo(this.x - s * 0.3, this.y + s * 0.3, this.x - s * 2, this.y);
      ctx.quadraticCurveTo(this.x - s * 0.3, this.y - s * 0.3, this.x, this.y - s * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < COUNT; i++) sparkles.push(new Sparkle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparkles.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// ─── UTILITIES ───────────────────────────────
function escHTML(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ─── SERVICE WORKER ──────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// ─── INIT ────────────────────────────────────
function init() {
  initSparkles();
  registerSW();
  processRecurring();
  checkProReturn();
  navigate('home');
}

// Expose functions to global scope for onclick handlers
window.navigate = navigate;
window.goBack = goBack;
window.handleAddTap = handleAddTap;
window.handleEditTap = handleEditTap;
window.handleSave = handleSave;
window.selectEmoji = selectEmoji;
window.selectTheme = selectTheme;
window.pickPhoto = pickPhoto;
window.handlePhotoSelected = handlePhotoSelected;
window.removePhoto = removePhoto;
window.handleRecurringToggle = handleRecurringToggle;
window.updateCharCount = updateCharCount;
window.showPaywall = showPaywall;
window.hidePaywall = hidePaywall;
window.startCheckout = startCheckout;
window.restorePurchase = restorePurchase;
window.dismissProSuccess = dismissProSuccess;
window.confirmDelete = confirmDelete;
window.dismissConfirm = dismissConfirm;
window.doDelete = doDelete;
window.lpStart = lpStart;
window.lpEnd = lpEnd;
window.toggleSetting = toggleSetting;
window.updatePhotoPicker = updatePhotoPicker;

document.addEventListener('DOMContentLoaded', init);
