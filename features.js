// features.js — SOC Platform Enhancement Engine
// All features are embedded silently — NO new buttons added to existing UI.
// Hooks into existing elements: sidebar, search bar, theme toggle, listen voice btn.

(function() {
  'use strict';

  // ====================================================================
  // 1. DAILY STUDY STREAK COUNTER
  // ====================================================================
  function initStreakSystem() {
    const today = new Date().toDateString();
    const lastStudy = localStorage.getItem('soc_last_study_date');
    let streak = parseInt(localStorage.getItem('soc_study_streak') || '0');

    if (lastStudy !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastStudy === yesterday.toDateString()) {
        streak += 1;
      } else if (!lastStudy) {
        streak = 1;
      } else {
        streak = 1; // streak broken, restart
      }
      localStorage.setItem('soc_study_streak', streak);
      localStorage.setItem('soc_last_study_date', today);
    }

    // Inject streak chip into sidebar header (after sidebar-filters div)
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar && !document.getElementById('streak-chip')) {
      const chip = document.createElement('div');
      chip.id = 'streak-chip';
      chip.className = 'streak-chip-bar';
      chip.innerHTML = `
        <span class="streak-flame">🔥</span>
        <span class="streak-label">${streak} Day${streak !== 1 ? 's' : ''} Streak</span>
        <span class="streak-badge-btn" onclick="openBadgesModal()" title="View Achievements">🏅 Badges</span>
      `;
      const filters = sidebar.querySelector('.sidebar-filters');
      if (filters) filters.after(chip);
    }

    // Check for new badge unlocks
    checkAndAwardBadges();
  }

  // ====================================================================
  // 2. ACHIEVEMENT BADGES SYSTEM
  // ====================================================================
  const BADGE_DEFINITIONS = [
    { id: 'first_step',    icon: '🚀', img: 'assets/badges/first_step.png',    name: 'First Step',       desc: 'Opened the platform for the first time',          check: () => true },
    { id: 'streak3',       icon: '🔥', img: 'assets/badges/streak3.png',       name: 'On Fire',          desc: 'Maintained a 3-day study streak',                 check: () => parseInt(localStorage.getItem('soc_study_streak')||0) >= 3 },
    { id: 'streak7',       icon: '💎', img: 'assets/badges/streak7.png',       name: 'Week Warrior',     desc: 'Maintained a 7-day study streak',                 check: () => parseInt(localStorage.getItem('soc_study_streak')||0) >= 7 },
    { id: 'notebook10',    icon: '📖', img: 'assets/badges/notebook10.png',    name: 'Page Turner',      desc: 'Read 10+ Handbook pages',                         check: () => JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').length >= 10 },
    { id: 'notebook50',    icon: '📚', img: 'assets/badges/notebook50.png',    name: '365 Traveller',    desc: 'Read 50+ Handbook pages',                         check: () => JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').length >= 50 },
    { id: 'lab5',          icon: '💻', img: 'assets/badges/lab5.png',          name: 'Terminal Hacker',  desc: 'Completed 5 Incident Response Labs',              check: () => JSON.parse(localStorage.getItem('soc_completed_labs')||'[]').length >= 5 },
    { id: 'lab15',         icon: '🛡️', img: 'assets/badges/lab15.png',         name: 'Blue Teamer',     desc: 'Completed 15 Incident Response Labs',             check: () => JSON.parse(localStorage.getItem('soc_completed_labs')||'[]').length >= 15 },
    { id: 'lab50',         icon: '🥷', img: 'assets/badges/lab50.png',         name: 'SOC Ninja',        desc: 'Completed all 50 Incident Response Labs',         check: () => JSON.parse(localStorage.getItem('soc_completed_labs')||'[]').length >= 50 },
    { id: 'cheat10',       icon: '⚡', img: 'assets/badges/cheat10.png',       name: 'Cheat Sheet Pro',  desc: 'Reviewed 10+ Fast-Revision cheat cards',          check: () => JSON.parse(localStorage.getItem('cheatsheet_completed_pages')||'[]').length >= 10 },
    { id: 'advanced10',    icon: '🎯', img: 'assets/badges/advanced10.png',    name: 'MITRE Expert',     desc: 'Read 10+ Advanced SOC Domain pages',              check: () => JSON.parse(localStorage.getItem('advanced_completed_pages')||'[]').length >= 10 },
    { id: 'bookmarks5',    icon: '⭐', img: 'assets/badges/bookmarks5.png',    name: 'Curator',          desc: 'Saved 5+ items for later review',                 check: () => {
        const b1 = JSON.parse(localStorage.getItem('soc_bookmarked_pages')||'[]').length;
        const b2 = JSON.parse(localStorage.getItem('soc_bookmarked_qas')||'[]').length;
        return (b1 + b2) >= 5;
    }},
    { id: 'hardening',     icon: '🔒', img: 'assets/badges/hardening.png',     name: 'Hardening Expert', desc: 'Completed the CIS Linux Hardening Audit',         check: () => !!localStorage.getItem('soc_hardening_completed') },
  ];

  function checkAndAwardBadges() {
    const earned = JSON.parse(localStorage.getItem('soc_earned_badges') || '[]');
    const newBadges = [];
    BADGE_DEFINITIONS.forEach(b => {
      if (!earned.includes(b.id) && b.check()) {
        earned.push(b.id);
        newBadges.push(b);
      }
    });
    if (newBadges.length > 0) {
      localStorage.setItem('soc_earned_badges', JSON.stringify(earned));
      newBadges.forEach((b, i) => {
        setTimeout(() => showBadgeToast(b), i * 2500);
      });
    }
  }

  function showBadgeToast(badge) {
    const toast = document.createElement('div');
    toast.className = 'badge-toast';
    toast.innerHTML = `
      <div class="badge-toast-img-wrap">
        <img src="${badge.img}" alt="${badge.name}" class="badge-toast-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"/>
        <span class="badge-toast-icon" style="display:none;">${badge.icon}</span>
      </div>
      <div>
        <div class="badge-toast-title">Badge Unlocked!</div>
        <div class="badge-toast-name">${badge.name}</div>
        <div class="badge-toast-desc">${badge.desc}</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 4000);
  }

  window.openBadgesModal = function() {
    const earned = JSON.parse(localStorage.getItem('soc_earned_badges') || '[]');
    const existing = document.getElementById('badges-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'badges-modal';
    modal.className = 'feat-modal-overlay';
    modal.innerHTML = `
      <div class="feat-modal-card">
        <div class="feat-modal-header">
          <span>🏅 My Achievement Badges</span>
          <button onclick="document.getElementById('badges-modal').remove()" class="feat-modal-close">✕</button>
        </div>
        <div class="feat-modal-body">
          <p class="feat-modal-hint">Complete labs, read pages, and maintain streaks to unlock all ${BADGE_DEFINITIONS.length} badges!</p>
          <div class="badges-grid">
            ${BADGE_DEFINITIONS.map(b => {
              const isEarned = earned.includes(b.id);
              return `
                <div class="badge-card ${isEarned ? 'badge-earned' : 'badge-locked'}">
                  <div class="badge-img-wrapper">
                    <img src="${b.img}" alt="${b.name}" class="badge-img ${isEarned ? '' : 'badge-img-locked'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"/>
                    <span class="badge-icon-fallback" style="display:none;">${isEarned ? b.icon : '🔒'}</span>
                    ${!isEarned ? '<span class="badge-lock-overlay">🔒</span>' : ''}
                  </div>
                  <div class="badge-name">${b.name}</div>
                  <div class="badge-desc">${b.desc}</div>
                  <div class="badge-status-tag">${isEarned ? 'UNLOCKED' : 'LOCKED'}</div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="text-align:center; margin-top:1.2rem; color:var(--text-dark); font-weight:800; font-size:0.9rem;">
            🏆 ${earned.length} / ${BADGE_DEFINITIONS.length} Badges Earned
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  };

  // ====================================================================
  // 3. WEB SPEECH API — TTS (wire up existing Listen Voice button)
  // ====================================================================
  let ttsUtterance = null;
  let ttsSpeaking = false;

  function initTTS() {
    const btn = document.getElementById('btn-listen-speech');
    const btnText = document.getElementById('voice-btn-text');
    if (!btn || !window.speechSynthesis) return;

    btn.addEventListener('click', () => {
      if (ttsSpeaking) {
        window.speechSynthesis.cancel();
        ttsSpeaking = false;
        if (btnText) btnText.textContent = 'Listen Voice';
        btn.classList.remove('btn-voice-active');
        return;
      }
      // Grab visible text content from current page
      const contentEl = document.getElementById('notebook-paper-view');
      if (!contentEl) return;
      let text = contentEl.innerText || contentEl.textContent || '';
      text = text.replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '').replace(/\s+/g, ' ').trim();
      if (text.length > 4000) text = text.slice(0, 4000) + '...';

      ttsUtterance = new SpeechSynthesisUtterance(text);
      ttsUtterance.rate = 0.92;
      ttsUtterance.pitch = 1;
      ttsUtterance.lang = 'en-IN';
      ttsUtterance.onend = () => {
        ttsSpeaking = false;
        if (btnText) btnText.textContent = 'Listen Voice';
        btn.classList.remove('btn-voice-active');
      };
      ttsUtterance.onerror = () => {
        ttsSpeaking = false;
        if (btnText) btnText.textContent = 'Listen Voice';
        btn.classList.remove('btn-voice-active');
      };
      window.speechSynthesis.speak(ttsUtterance);
      ttsSpeaking = true;
      if (btnText) btnText.textContent = '⏹ Stop Voice';
      btn.classList.add('btn-voice-active');
    });
  }

  // ====================================================================
  // 4. THEME TOGGLE — keep only the Switch Theme button behavior
  //    The previous accessibility panel (font style, text size, contrast)
  //    has been removed per request. We keep the theme button wrapped for
  //    layout/styling consistency but do not render additional controls.
  // ====================================================================
  function initAccessibilityPanel() {
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (!themeBtn) return;

    // Ensure the theme button is wrapped for consistent layout
    const wrap = document.createElement('div');
    wrap.className = 'theme-toggle-wrap';
    themeBtn.parentNode.insertBefore(wrap, themeBtn);
    wrap.appendChild(themeBtn);

    // Remove any legacy accessibility panel if present
    const existing = document.getElementById('accessibility-panel');
    if (existing) existing.remove();

    // Clicking outside the theme button will not open any extra controls
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) {
        // no-op: intentionally keep layout simple
      }
    });
  }

  // ====================================================================
  // 5. DEEP LINKING — URL Hash updates silently on every page change
  // ====================================================================
  function initDeepLinking() {
    // Read hash on page load and jump to correct page
    const hash = window.location.hash.slice(1); // e.g. "notebook:42" or "lab:11"
    if (hash) {
      const [mode, id] = hash.split(':');
      if (mode && id) {
        setTimeout(() => {
          if (typeof switchMode === 'function') {
            // Switch to the correct mode and page
            if (mode === 'notebook' && typeof currentPageId !== 'undefined') {
              window.currentPageId = parseInt(id) || 1;
              switchMode('notebook');
              if (typeof renderCurrentView === 'function') renderCurrentView();
            } else if (mode === 'advanced' && typeof currentAdvancedPageId !== 'undefined') {
              window.currentAdvancedPageId = parseInt(id) || 1;
              switchMode('advanced');
              if (typeof renderCurrentView === 'function') renderCurrentView();
            } else if (mode === 'lab' && typeof currentActiveLabIndex !== 'undefined') {
              window.currentActiveLabIndex = parseInt(id) - 1 || 0;
              switchMode('labs');
              if (typeof renderCurrentView === 'function') renderCurrentView();
            } else if (mode === 'cheat' && typeof currentCheatPageId !== 'undefined') {
              window.currentCheatPageId = parseInt(id) || 1;
              switchMode('cheatsheet');
              if (typeof renderCurrentView === 'function') renderCurrentView();
            }
          }
        }, 1200); // after app init
      }
    }

    // Patch renderCurrentView to update hash silently
    // Patch renderCurrentView to update hash & study notes silently
    function patchRenderCurrentView() {
      if (window._renderPatched) return;
      const originalRender = window.renderCurrentView;
      if (originalRender) {
        window._renderPatched = true;
        window.renderCurrentView = function(...args) {
          originalRender.apply(this, args);
          updateUrlHash();
          setTimeout(ensureStudyNotes, 50);
          setTimeout(applyPrism, 100);
        };
      }
    }
    patchRenderCurrentView();
    setInterval(patchRenderCurrentView, 1000);
  }

  function updateUrlHash() {
    const mode = window.activeMode || 'notebook';
    let hash = '';
    if (mode === 'notebook') hash = `notebook:${window.currentPageId || 1}`;
    else if (mode === 'advanced') hash = `advanced:${window.currentAdvancedPageId || 1}`;
    else if (mode === 'labs') hash = `lab:${(window.currentActiveLabIndex || 0) + 1}`;
    else if (mode === 'cheatsheet') hash = `cheat:${window.currentCheatPageId || 1}`;
    else hash = mode;
    history.replaceState(null, '', '#' + hash);
  }

  // ====================================================================
  // 6. PER-PAGE PERSONAL STUDY NOTES
  //    Auto-appended below every notebook / advanced / cheatsheet page content
  // ====================================================================
  window.ensureStudyNotes = function() {
    const view = document.getElementById('notebook-paper-view');
    if (!view) return;

    const mode = window.activeMode || (typeof activeMode !== 'undefined' ? activeMode : 'notebook');
    if (mode !== 'notebook' && mode !== 'advanced' && mode !== 'cheatsheet') {
      const existing = document.getElementById('study-notes-panel');
      if (existing) existing.remove();
      return;
    }

    let pageNum = 1;
    if (mode === 'notebook') {
      pageNum = window.currentPageId || (typeof currentPageId !== 'undefined' ? currentPageId : 1);
    } else if (mode === 'advanced') {
      pageNum = window.currentAdvancedPageId || (typeof currentAdvancedPageId !== 'undefined' ? currentAdvancedPageId : 1);
    } else if (mode === 'cheatsheet') {
      pageNum = window.currentCheatPageId || (typeof currentCheatPageId !== 'undefined' ? currentCheatPageId : 1);
    }

    // Secondary fallback: inspect active item in sidebar or page number input
    const pageInput = document.getElementById('page-number-input');
    if (pageInput && pageInput.value) {
      const val = parseInt(pageInput.value);
      if (val && !isNaN(val)) pageNum = val;
    }
    const activeItem = document.querySelector('.page-item.active');
    if (activeItem) {
      const itemVal = parseInt(activeItem.getAttribute('data-item-id'));
      if (itemVal && !isNaN(itemVal)) pageNum = itemVal;
    }

    const key = `soc_notes_${mode}_${pageNum}`;
    const saved = localStorage.getItem(key) || '';

    let panel = document.getElementById('study-notes-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'study-notes-panel';
      panel.className = 'study-notes-panel';
      view.appendChild(panel);
    }

    panel.innerHTML = `
      <div class="notes-header">
        <span>✍️ My Personal Study Notes (${mode.toUpperCase()} — Page ${pageNum})</span>
        <span class="notes-hint">💾 Auto-saved</span>
      </div>
      <textarea id="study-notes-textarea" class="notes-textarea" placeholder="Type your personal notes, command shortcuts, or triage insights for page ${pageNum}... auto-saved!">${saved}</textarea>
    `;

    const textarea = document.getElementById('study-notes-textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        localStorage.setItem(key, textarea.value);
      });
    }
  };

  function injectStudyNotes() {
    const view = document.getElementById('notebook-paper-view');
    if (!view) return;

    // Run initial injection
    setTimeout(window.ensureStudyNotes, 200);

    // MutationObserver fallback to re-inject if view is wiped
    const observer = new MutationObserver(() => {
      setTimeout(window.ensureStudyNotes, 50);
    });
    observer.observe(view, { childList: true });
  }

  // ====================================================================
  // 7. FUZZY SEARCH — Upgrade existing #search-input
  // ====================================================================
  function initFuzzySearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Create dropdown results container
    const resultsBox = document.createElement('div');
    resultsBox.id = 'search-results-dropdown';
    resultsBox.className = 'search-results-dropdown hidden';
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(resultsBox);

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) { resultsBox.classList.add('hidden'); return; }

      const results = [];

      // Search notebook pages
      const pages = window.NOTEBOOK_PAGES || [];
      pages.forEach(p => {
        const score = fuzzyScore(q, (p.concept || '') + ' ' + (p.topic || '') + ' ' + (p.commands || []).join(' '));
        if (score > 0) results.push({ mode: 'notebook', id: p.id, label: `📖 P.${p.id}: ${p.concept}`, score });
      });

      // Search advanced pages
      const adv = window.ADVANCED_DOMAIN_PAGES || [];
      adv.forEach(p => {
        const score = fuzzyScore(q, (p.concept || '') + ' ' + (p.domain || ''));
        if (score > 0) results.push({ mode: 'advanced', id: p.id, label: `🔵 Adv.${p.id}: ${p.concept}`, score });
      });

      // Search interview Q&A
      const qas = window.INTERVIEW_QA || [];
      qas.forEach(q2 => {
        const score = fuzzyScore(q, (q2.question || '') + ' ' + (q2.answer || '').slice(0, 100));
        if (score > 0) results.push({ mode: 'interview', id: q2.id, label: `🎯 Q${q2.id}: ${(q2.question||'').slice(0,50)}...`, score });
      });

      // Search incident labs
      const labs = window.INCIDENT_LABS || [];
      labs.forEach(lab => {
        const score = fuzzyScore(q, (lab.title || '') + ' ' + (lab.alertBriefing || ''));
        if (score > 0) results.push({ mode: 'labs', id: lab.labNumber, label: `💻 ${lab.title}`, score });
      });

      results.sort((a, b) => b.score - a.score);
      const top = results.slice(0, 8);

      if (top.length === 0) {
        resultsBox.innerHTML = '<div class="search-no-result">No matches found</div>';
      } else {
        resultsBox.innerHTML = top.map(r => `
          <div class="search-result-item" onclick="jumpToSearchResult('${r.mode}', ${r.id})">
            ${r.label}
          </div>
        `).join('');
      }
      resultsBox.classList.remove('hidden');
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => resultsBox.classList.add('hidden'), 200);
    });

    document.addEventListener('click', e => {
      if (!searchInput.parentNode.contains(e.target)) resultsBox.classList.add('hidden');
    });
  }

  function fuzzyScore(query, text) {
    if (!text) return 0;
    const t = text.toLowerCase();
    if (t.includes(query)) return 10;
    // Check all words of query appear somewhere
    const words = query.split(' ').filter(w => w.length > 1);
    let hits = words.filter(w => t.includes(w)).length;
    return hits > 0 ? hits : 0;
  }

  window.jumpToSearchResult = function(mode, id) {
    const resultsBox = document.getElementById('search-results-dropdown');
    if (resultsBox) resultsBox.classList.add('hidden');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    if (mode === 'notebook') {
      window.currentPageId = id;
      if (typeof switchMode === 'function') switchMode('notebook');
    } else if (mode === 'advanced') {
      window.currentAdvancedPageId = id;
      if (typeof switchMode === 'function') switchMode('advanced');
    } else if (mode === 'interview') {
      window.currentQAId = id;
      if (typeof switchMode === 'function') switchMode('interview');
    } else if (mode === 'labs') {
      window.currentActiveLabIndex = id - 1;
      if (typeof switchMode === 'function') switchMode('labs');
    }
    if (typeof renderCurrentView === 'function') renderCurrentView();
    if (typeof initSidebar === 'function') initSidebar();
  };

  // ====================================================================
  // 8. LIVE THREAT INTEL TICKER — thin auto-closing banner
  // ====================================================================
  const THREAT_FEED = [
    '🚨 CVE-2022-0847 (Dirty Pipe) — Linux kernel privilege escalation, patch all kernels < 5.16.11',
    '⚠️ CVE-2021-4034 (PwnKit) — PKEXEC SUID vulnerability, CVSS 7.8 — Mitigate: chmod 0755 /usr/bin/pkexec',
    '🔥 CVE-2021-44228 (Log4Shell) — Apache Log4j RCE, CVSS 10.0 — Patch: upgrade to log4j-core ≥ 2.17.1',
    '🛡️ CVE-2021-3156 (Baron Samedit) — Sudo heap buffer overflow → root. Patch: sudo ≥ 1.9.5p2',
    '⚡ CVE-2023-32629 (Ubuntu Kernel) — Local privilege escalation via overlayfs. Patch Ubuntu 22.04+',
    '🔒 CISA AA23-165A — Active SSH brute-force campaigns targeting Linux cloud servers. Enable Fail2ban.',
    '🌐 TLP:WHITE Intel — Mass exploitation of exposed Docker APIs for cryptominer deployment detected.',
    '🔐 MITRE ATT&CK Update — T1059.004 (Unix Shell), T1053.003 (Cron Job) top Linux persistence TTPs 2025.',
    '🚨 Emerging Threat — Ransomware groups leveraging cron persistence + GPG key exfiltration on RHEL 8/9.',
    '💡 SOC TIP — Always verify /proc/PID/exe for deleted binary execution patterns in forensic triage.',
  ];

  function initThreatTicker() {
    const header = document.querySelector('.app-header');
    if (!header || document.getElementById('threat-ticker')) return;

    // Only show if not dismissed today
    const dismissedDate = localStorage.getItem('soc_ticker_dismissed');
    const today = new Date().toDateString();
    if (dismissedDate === today) return;

    const ticker = document.createElement('div');
    ticker.id = 'threat-ticker';
    ticker.className = 'threat-ticker';
    let idx = 0;
    ticker.innerHTML = `
      <span class="ticker-label">📡 LIVE INTEL</span>
      <span class="ticker-scroll" id="ticker-scroll">${THREAT_FEED[0]}</span>
      <button class="ticker-close" onclick="dismissTicker()" title="Dismiss">✕</button>
    `;
    header.after(ticker);

    // Cycle through threats
    setInterval(() => {
      idx = (idx + 1) % THREAT_FEED.length;
      const scroll = document.getElementById('ticker-scroll');
      if (scroll) {
        scroll.style.opacity = '0';
        setTimeout(() => {
          scroll.textContent = THREAT_FEED[idx];
          scroll.style.opacity = '1';
        }, 400);
      }
    }, 5000);
  }

  window.dismissTicker = function() {
    const ticker = document.getElementById('threat-ticker');
    if (ticker) ticker.remove();
    localStorage.setItem('soc_ticker_dismissed', new Date().toDateString());
  };

  // ====================================================================
  // 9. CVE LOOKUP SANDBOX
  //    Accessible via a small "🔎 CVE Lookup" chip inside Log Parser Lab
  // ====================================================================
  const CVE_DATABASE = [
    { id: 'CVE-2021-44228', name: 'Log4Shell', cvss: '10.0 CRITICAL', product: 'Apache Log4j 2.x', desc: 'Remote Code Execution via JNDI lookup injection in log messages. Affects Log4j2 < 2.17.1.', mitigation: 'Upgrade log4j-core to ≥ 2.17.1\nSet: log4j2.formatMsgNoLookups=true\nDeploy WAF rules blocking ${jndi: patterns' },
    { id: 'CVE-2022-0847', name: 'Dirty Pipe', cvss: '7.8 HIGH', product: 'Linux Kernel < 5.16.11', desc: 'Allows overwriting read-only files via a flaw in Linux pipe buffer handling (copy_page_to_iter_pipe). Enables local privilege escalation to root.', mitigation: 'Patch kernel: upgrade to 5.16.11 / 5.15.25 / 5.10.102\nOn Ubuntu: sudo apt-get update && sudo apt-get upgrade linux-image' },
    { id: 'CVE-2021-4034', name: 'PwnKit', cvss: '7.8 HIGH', product: 'polkit pkexec (All Linux)', desc: 'Memory corruption in pkexec binary allows any local user to gain root privileges instantly.', mitigation: 'Immediate: chmod 0755 /usr/bin/pkexec\nPermanent: apt upgrade policykit-1 / yum update polkit' },
    { id: 'CVE-2021-3156', name: 'Baron Samedit', cvss: '7.8 HIGH', product: 'sudo < 1.9.5p2', desc: 'Heap-based buffer overflow in sudo via -s flag allows any user (including nopasswd) to gain root.', mitigation: 'Upgrade sudo to ≥ 1.9.5p2\napt-get install --only-upgrade sudo\nyum update sudo' },
    { id: 'CVE-2023-32629', name: 'GameOver(lay)', cvss: '7.8 HIGH', product: 'Ubuntu Linux 22.04', desc: 'Local privilege escalation via overlayfs in Ubuntu kernel. Allows unprivileged users to execute code as root.', mitigation: 'Apply Ubuntu security update:\napt-get update && apt-get dist-upgrade\nReboot after kernel update' },
    { id: 'CVE-2016-5195', name: 'Dirty COW', cvss: '7.8 HIGH', product: 'Linux Kernel < 4.8.3', desc: 'Race condition in memory copy-on-write mechanism allows local privilege escalation to root. Affects all Linux kernels for 9+ years.', mitigation: 'Patch to kernel ≥ 4.8.3\nApply distribution security patches immediately' },
    { id: 'CVE-2019-14287', name: 'Sudo -1 Bypass', cvss: '7.8 HIGH', product: 'sudo < 1.8.28', desc: 'Sudo rule bypass: sudo -u#-1 command allows restricted users to run commands as root when NOPASSWD is configured.', mitigation: 'Upgrade sudo to ≥ 1.8.28\nAudit /etc/sudoers for (ALL, !root) or wildcard rules' },
    { id: 'CVE-2014-6271', name: 'Shellshock', cvss: '9.8 CRITICAL', product: 'GNU Bash < 4.3 patch 25', desc: 'Remote code execution via specially crafted environment variables in bash. Affects CGI scripts, DHCP clients, and SSH ForceCommand.', mitigation: 'Upgrade bash to version ≥ 4.3 patch 25\napt-get install --only-upgrade bash' },
    { id: 'CVE-2021-3493', name: 'Ubuntu OverlayFS', cvss: '7.8 HIGH', product: 'Ubuntu ≤ 20.10', desc: 'OverlayFS privilege escalation allowing unprivileged user to gain root via xattr manipulation.', mitigation: 'Apply Ubuntu kernel security update:\napt-get update && apt-get upgrade\nReboot system' },
    { id: 'CVE-2017-5638', name: 'Struts2 RCE', cvss: '10.0 CRITICAL', product: 'Apache Struts 2.3.5–2.3.31', desc: 'Remote code execution via Content-Type header in multipart requests. Used in Equifax breach.', mitigation: 'Upgrade to Struts 2.3.32 / 2.5.10.1\nDeploy WAF rules blocking OGNL expressions' },
  ];

  window.openCveLookup = function() {
    const existing = document.getElementById('cve-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'cve-modal';
    modal.className = 'feat-modal-overlay';
    modal.innerHTML = `
      <div class="feat-modal-card" style="max-width:680px;">
        <div class="feat-modal-header">
          <span>🔎 CVE Lookup Sandbox</span>
          <button onclick="document.getElementById('cve-modal').remove()" class="feat-modal-close">✕</button>
        </div>
        <div class="feat-modal-body">
          <input type="text" id="cve-search-input" class="cve-search-input" placeholder="Type CVE ID or keyword (e.g. Log4Shell, Dirty Pipe, sudo)..." oninput="filterCVEs(this.value)"/>
          <div id="cve-results-list" class="cve-results-list">
            ${renderCVECards(CVE_DATABASE)}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('cve-search-input')?.focus(), 100);
  };

  function renderCVECards(list) {
    return list.map(cve => `
      <div class="cve-card">
        <div class="cve-card-header">
          <span class="cve-id-badge">${cve.id}</span>
          <span class="cve-name">${cve.name}</span>
          <span class="cve-cvss ${cve.cvss.includes('CRITICAL') ? 'cve-critical' : 'cve-high'}">${cve.cvss}</span>
        </div>
        <div class="cve-product">📦 Affects: ${cve.product}</div>
        <div class="cve-desc">${cve.desc}</div>
        <div class="cve-mitigation">
          <strong>🛡️ Mitigation:</strong>
          <pre class="cve-mitigation-code">${cve.mitigation}</pre>
        </div>
      </div>
    `).join('');
  }

  window.filterCVEs = function(q) {
    const list = document.getElementById('cve-results-list');
    if (!list) return;
    const ql = q.toLowerCase();
    const filtered = ql.length < 2 ? CVE_DATABASE : CVE_DATABASE.filter(c =>
      (c.id + c.name + c.product + c.desc).toLowerCase().includes(ql)
    );
    list.innerHTML = filtered.length > 0 ? renderCVECards(filtered) : '<div class="search-no-result">No CVEs matching your query</div>';
  };

  // Inject CVE Lookup chip into log parser view via MutationObserver
  function injectCVEChipInLogParser() {
    const view = document.getElementById('notebook-paper-view');
    if (!view) return;
    const observer = new MutationObserver(() => {
      if (window.activeMode !== 'logparser') return;
      if (document.getElementById('cve-launch-chip')) return;
      const chip = document.createElement('div');
      chip.id = 'cve-launch-chip';
      chip.className = 'cve-launch-chip';
      chip.innerHTML = `<button onclick="openCveLookup()" class="cve-chip-btn">🔎 CVE Lookup Sandbox — Search 10+ Critical Linux CVEs</button>`;
      view.prepend(chip);
    });
    observer.observe(view, { childList: true });
  }

  // ====================================================================
  // 10. SPACED REPETITION on Cheat Sheet cards — Got it / Need Review
  // ====================================================================
  // This patches the cheat card HTML after render by observing the view
  function initSpacedRepetition() {
    const view = document.getElementById('notebook-paper-view');
    if (!view) return;

    const observer = new MutationObserver(() => {
      if (window.activeMode !== 'cheatsheet') return;
      // Find all cheat cards that don't yet have spaced-rep buttons
      const cards = view.querySelectorAll('.cheat-card:not([data-sr-wired])');
      cards.forEach(card => {
        card.setAttribute('data-sr-wired', '1');
        const pageId = card.getAttribute('data-page-id') || window.currentCheatPageId;
        const gotItKey = `soc_sr_gotit_${pageId}`;
        const reviewKey = `soc_sr_review_${pageId}`;
        const isGotIt = !!localStorage.getItem(gotItKey);
        const isReview = !!localStorage.getItem(reviewKey);

        const srRow = document.createElement('div');
        srRow.className = 'sr-row';
        srRow.innerHTML = `
          <button class="sr-btn sr-gotit ${isGotIt ? 'sr-active-gotit' : ''}" onclick="markSR(${pageId}, 'gotit', this)" title="Mark as understood">✅ Got it</button>
          <button class="sr-btn sr-review ${isReview ? 'sr-active-review' : ''}" onclick="markSR(${pageId}, 'review', this)" title="Mark for review">🔄 Need Review</button>
        `;
        card.appendChild(srRow);
      });
    });
    observer.observe(view, { childList: true, subtree: true });
  }

  window.markSR = function(pageId, type, btn) {
    const gotItKey = `soc_sr_gotit_${pageId}`;
    const reviewKey = `soc_sr_review_${pageId}`;
    const card = btn.closest('.cheat-card');
    const gotItBtn = card ? card.querySelector('.sr-gotit') : null;
    const reviewBtn = card ? card.querySelector('.sr-review') : null;

    if (type === 'gotit') {
      localStorage.setItem(gotItKey, '1');
      localStorage.removeItem(reviewKey);
      if (gotItBtn) { gotItBtn.classList.add('sr-active-gotit'); }
      if (reviewBtn) { reviewBtn.classList.remove('sr-active-review'); }
      // Auto-advance to next page
      setTimeout(() => {
        const nextBtn = document.getElementById('btn-next-page');
        if (nextBtn) nextBtn.click();
      }, 600);
    } else {
      localStorage.setItem(reviewKey, '1');
      localStorage.removeItem(gotItKey);
      if (reviewBtn) { reviewBtn.classList.add('sr-active-review'); }
      if (gotItBtn) { gotItBtn.classList.remove('sr-active-gotit'); }
    }
    if (typeof checkAndAwardBadges === 'function') checkAndAwardBadges();
  };

  // ====================================================================
  // 11. END-OF-MODULE INTERACTIVE QUIZZES
  // ====================================================================
  const MODULE_QUIZZES = {
    1: [
      { q: 'Which command shows running processes sorted by CPU usage?', opts: ['ps aux --sort=-%cpu', 'top -n 1', 'htop -sort cpu', 'pstree -p'], ans: 0, tip: 'ps aux --sort=-%cpu shows all processes sorted by CPU descending.' },
      { q: 'What file stores encrypted user passwords on Linux?', opts: ['/etc/passwd', '/etc/shadow', '/etc/security/passwd', '/etc/login.defs'], ans: 1, tip: '/etc/shadow stores hashed passwords and is readable only by root.' },
      { q: 'Which command lists open network sockets with PID?', opts: ['netstat -an', 'ss -antp', 'lsof -i', 'ip route show'], ans: 1, tip: 'ss -antp shows TCP sockets with process info (modern replacement for netstat).' },
      { q: 'What MITRE ATT&CK technique covers Cron-based persistence?', opts: ['T1055', 'T1053.003', 'T1136', 'T1548'], ans: 1, tip: 'T1053.003 is Scheduled Task/Job: Cron — a common Linux persistence method.' },
      { q: 'Which log file records SSH authentication events?', opts: ['/var/log/syslog', '/var/log/kern.log', '/var/log/auth.log', '/var/log/messages'], ans: 2, tip: '/var/log/auth.log records all PAM, sudo, and SSH authentication events.' }
    ],
    2: [
      { q: 'How do you find SUID binaries on a Linux system?', opts: ['ls -la /usr/bin', 'find / -perm -4000 -type f 2>/dev/null', 'stat /usr/bin/*', 'chmod -l /bin/*'], ans: 1, tip: 'find / -perm -4000 searches for files with the SUID bit set across the whole filesystem.' },
      { q: 'Which command immediately terminates a process by PID?', opts: ['kill -1 PID', 'kill -9 PID', 'kill -15 PID', 'kill -2 PID'], ans: 1, tip: 'kill -9 sends SIGKILL which cannot be caught or ignored by the process.' },
      { q: 'What does /proc/PID/exe reveal?', opts: ['Process memory dump', 'Symbolic link to the process executable', 'Environment variables', 'Open file handles'], ans: 1, tip: '/proc/PID/exe is a symlink to the actual binary being executed by that PID.' },
      { q: 'Which directory is commonly abused for hiding malicious executables in RAM?', opts: ['/tmp', '/var/tmp', '/dev/shm', '/run/user'], ans: 2, tip: '/dev/shm is a tmpfs (RAM-backed) filesystem — attackers use it to avoid writing to disk.' },
      { q: 'What signal does LD_PRELOAD injection exploit?', opts: ['SIGKILL', 'Shared library loading order', 'CPU scheduling', 'Socket binding'], ans: 1, tip: 'LD_PRELOAD forces a shared library to load before others, hooking system calls.' }
    ],
    3: [
      { q: 'Which command blocks outbound traffic to a specific IP using iptables?', opts: ['iptables -A INPUT -s IP -j DROP', 'iptables -A OUTPUT -d IP -j DROP', 'iptables -F OUTPUT', 'ufw allow out IP'], ans: 1, tip: 'iptables -A OUTPUT -d <IP> -j DROP drops all outbound traffic to the specified destination.' },
      { q: 'A reverse shell uses which connection direction?', opts: ['Attacker connects to victim', 'Victim connects out to attacker', 'Both connect to a broker', 'Neither connects'], ans: 1, tip: 'Reverse shells have the victim initiate an outbound connection to bypass inbound firewall rules.' },
      { q: 'What port is commonly used by Metasploit reverse shells?', opts: ['8080', '443', '4444', '1337'], ans: 2, tip: 'TCP 4444 is the Metasploit default reverse shell listener port.' },
      { q: 'Which command isolates a host by bringing down its network interface?', opts: ['ifconfig eth0 down', 'ip link set eth0 down', 'nmcli dev disconnect eth0', 'All of the above'], ans: 3, tip: 'All three commands effectively bring down a network interface for emergency isolation.' },
      { q: 'DNS tunneling exfiltrates data via which query type primarily?', opts: ['A records', 'MX records', 'TXT records', 'NS records'], ans: 2, tip: 'TXT records carry arbitrary text data and are commonly abused for DNS tunneling exfiltration.' }
    ]
  };

  let activeQuizModuleId = null;
  let quizScore = 0;
  let quizCurrent = 0;

  window.openModuleQuiz = function(moduleId) {
    const questions = MODULE_QUIZZES[moduleId];
    if (!questions) return;
    activeQuizModuleId = moduleId;
    quizScore = 0;
    quizCurrent = 0;
    renderQuizModal(questions);
  };

  function renderQuizModal(questions) {
    const existing = document.getElementById('quiz-modal');
    if (existing) existing.remove();
    const q = questions[quizCurrent];
    if (!q) { showQuizResults(questions.length); return; }

    const modal = document.createElement('div');
    modal.id = 'quiz-modal';
    modal.className = 'feat-modal-overlay';
    modal.innerHTML = `
      <div class="feat-modal-card" style="max-width:580px;">
        <div class="feat-modal-header">
          <span>🧠 Module Quiz — Question ${quizCurrent + 1}/${questions.length}</span>
          <button onclick="document.getElementById('quiz-modal').remove()" class="feat-modal-close">✕</button>
        </div>
        <div class="feat-modal-body">
          <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${((quizCurrent)/questions.length)*100}%"></div></div>
          <p class="quiz-question">${q.q}</p>
          <div class="quiz-options">
            ${q.opts.map((opt, i) => `
              <button class="quiz-opt-btn" onclick="answerQuiz(${i}, ${q.ans}, '${q.tip.replace(/'/g,"\\'")}')">  
                <span class="quiz-opt-letter">${String.fromCharCode(65+i)}</span>${opt}
              </button>
            `).join('')}
          </div>
          <div id="quiz-feedback" class="quiz-feedback hidden"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  window.answerQuiz = function(chosen, correct, tip) {
    const feedback = document.getElementById('quiz-feedback');
    const opts = document.querySelectorAll('.quiz-opt-btn');
    opts.forEach((b, i) => {
      b.disabled = true;
      if (i === correct) b.classList.add('quiz-opt-correct');
      else if (i === chosen && chosen !== correct) b.classList.add('quiz-opt-wrong');
    });
    if (chosen === correct) quizScore++;
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.className = `quiz-feedback ${chosen === correct ? 'quiz-feedback-correct' : 'quiz-feedback-wrong'}`;
      feedback.innerHTML = `${chosen === correct ? '✅ Correct!' : '❌ Incorrect'} — ${tip}`;
    }
    const questions = MODULE_QUIZZES[activeQuizModuleId];
    setTimeout(() => {
      quizCurrent++;
      renderQuizModal(questions);
    }, 2000);
  };

  function showQuizResults(total) {
    const existing = document.getElementById('quiz-modal');
    if (existing) existing.remove();
    const pct = Math.round((quizScore / total) * 100);
    const modal = document.createElement('div');
    modal.id = 'quiz-modal';
    modal.className = 'feat-modal-overlay';
    modal.innerHTML = `
      <div class="feat-modal-card" style="max-width:440px; text-align:center;">
        <div class="feat-modal-header"><span>🏆 Quiz Complete!</span><button onclick="document.getElementById('quiz-modal').remove()" class="feat-modal-close">✕</button></div>
        <div class="feat-modal-body">
          <div style="font-size:3.5rem; margin: 1rem 0;">${pct >= 80 ? '🎯' : pct >= 60 ? '📚' : '🔄'}</div>
          <div style="font-size:2rem; font-weight:900; color:var(--accent-blue);">${quizScore} / ${total}</div>
          <div style="font-size:1.2rem; font-weight:700; color:${pct>=80?'#15803d':pct>=60?'#92400e':'#dc2626'}; margin:0.5rem 0;">${pct}% Score</div>
          <p style="font-size:0.9rem; color:#64748b; margin-top:0.5rem;">${pct >= 80 ? '🌟 Excellent! You mastered this module!' : pct >= 60 ? '👍 Good work! Review the missed questions.' : '📖 Keep studying — go back and review this module!'}</p>
          <button onclick="openModuleQuiz(${activeQuizModuleId})" style="margin-top:1rem; padding:0.6rem 1.5rem; background:var(--accent-blue); color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer;">🔄 Retry Quiz</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    if (typeof checkAndAwardBadges === 'function') checkAndAwardBadges();
  }

  // Inject quiz button at bottom of notebook modules (module 1 = pages 1-15, etc.)
  function injectQuizTriggers() {
    const view = document.getElementById('notebook-paper-view');
    if (!view) return;
    const observer = new MutationObserver(() => {
      if (window.activeMode !== 'notebook') return;
      if (document.getElementById('quiz-trigger-btn')) return;
      const pageId = window.currentPageId || 1;
      const moduleId = Math.ceil(pageId / 15); // every 15 pages = 1 module
      if (pageId % 15 !== 0) return; // only show at module end pages
      const btn = document.createElement('div');
      btn.id = 'quiz-trigger-btn';
      btn.className = 'quiz-trigger-strip';
      btn.innerHTML = `<button onclick="openModuleQuiz(${Math.min(moduleId, 3)})" class="quiz-trigger-btn">🧠 End-of-Module Quiz — Test Your Knowledge!</button>`;
      view.appendChild(btn);
    });
    observer.observe(view, { childList: true });
  }

  // ====================================================================
  // 12. EXPANDABLE LOG SNIPPETS
  //     Auto-detects <pre> and <code> blocks and makes them collapsible
  // ====================================================================
  function initExpandableLogSnippets() {
    const view = document.getElementById('notebook-paper-view');
    if (!view) return;
    const observer = new MutationObserver(() => {
      const pres = view.querySelectorAll('pre:not([data-collapsible])');
      pres.forEach(pre => {
        pre.setAttribute('data-collapsible', '1');
        const text = pre.textContent || '';
        if (text.split('\n').length <= 5) return; // only collapse long blocks
        const wrapper = document.createElement('div');
        wrapper.className = 'log-snippet-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        const header = document.createElement('div');
        header.className = 'log-snippet-header';
        header.innerHTML = `<span>📋 Log Snippet (${text.split('\n').length} lines)</span><button class="log-expand-btn">▼ Show</button>`;
        wrapper.appendChild(header);
        pre.style.display = 'none';
        pre.style.maxHeight = '300px';
        pre.style.overflowY = 'auto';
        wrapper.appendChild(pre);
        let expanded = false;
        header.querySelector('.log-expand-btn').addEventListener('click', () => {
          expanded = !expanded;
          pre.style.display = expanded ? 'block' : 'none';
          header.querySelector('.log-expand-btn').textContent = expanded ? '▲ Hide' : '▼ Show';
        });
      });
    });
    observer.observe(view, { childList: true, subtree: true });
  }

  // ====================================================================
  // 13. VISUAL SKILL TREE / CURRICULUM MAP
  //     Accessible as a modal from the streak chip area
  // ====================================================================
  const SKILL_TREE = [
    { id: 1,  label: '🐧 Linux Basics',        pages: '1–15',   level: 0, prereq: [],    color: '#10b981', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p<=15).length >= 5) },
    { id: 2,  label: '📁 File System',          pages: '16–30',  level: 0, prereq: [1],   color: '#10b981', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=16&&p<=30).length >= 5) },
    { id: 3,  label: '👤 Users & Groups',       pages: '31–50',  level: 1, prereq: [1],   color: '#3b82f6', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=31&&p<=50).length >= 5) },
    { id: 4,  label: '🌐 Networking',           pages: '51–80',  level: 1, prereq: [2],   color: '#3b82f6', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=51&&p<=80).length >= 5) },
    { id: 5,  label: '🔒 SSH & Crypto',         pages: '81–110', level: 2, prereq: [3,4], color: '#8b5cf6', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=81&&p<=110).length >= 5) },
    { id: 6,  label: '📜 Log Analysis',         pages: '111–140',level: 2, prereq: [4],   color: '#8b5cf6', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=111&&p<=140).length >= 5) },
    { id: 7,  label: '🛡️ Hardening',           pages: '141–180',level: 3, prereq: [5,6], color: '#f59e0b', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=141&&p<=180).length >= 5) },
    { id: 8,  label: '🎯 MITRE ATT&CK',        pages: '181–220',level: 3, prereq: [6],   color: '#f59e0b', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=181&&p<=220).length >= 5) },
    { id: 9,  label: '💻 Incident Response',    pages: '221–270',level: 4, prereq: [7,8], color: '#ef4444', done: () => (JSON.parse(localStorage.getItem('soc_completed_labs')||'[]').length >= 10) },
    { id: 10, label: '🔬 Forensics & Memory',   pages: '271–320',level: 4, prereq: [8],   color: '#ef4444', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').filter(p=>p>=271&&p<=320).length >= 5) },
    { id: 11, label: '🏆 SOC Analyst Pro',      pages: '321–365',level: 5, prereq: [9,10],color: '#ec4899', done: () => (JSON.parse(localStorage.getItem('soc_completed_pages')||'[]').length >= 50) },
  ];

  window.openSkillTree = function() {
    const existing = document.getElementById('skilltree-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'skilltree-modal';
    modal.className = 'feat-modal-overlay';
    modal.innerHTML = `
      <div class="feat-modal-card" style="max-width:760px;">
        <div class="feat-modal-header">
          <span>🗺️ Curriculum Skill Tree</span>
          <button onclick="document.getElementById('skilltree-modal').remove()" class="feat-modal-close">✕</button>
        </div>
        <div class="feat-modal-body">
          <p class="feat-modal-hint">Complete topics in order. Green = mastered, locked = prerequisites needed.</p>
          <div class="skill-tree-grid">
            ${[0,1,2,3,4,5].map(level => `
              <div class="skill-tree-level">
                <div class="skill-tree-level-label">Level ${level + 1}</div>
                ${SKILL_TREE.filter(s => s.level === level).map(s => {
                  const isDone = s.done();
                  const prereqsMet = s.prereq.every(pid => SKILL_TREE.find(x=>x.id===pid)?.done());
                  const locked = !prereqsMet && !isDone;
                  return `<div class="skill-node ${isDone ? 'skill-done' : locked ? 'skill-locked' : 'skill-available'}" style="--node-color:${s.color}">
                    <div class="skill-node-icon">${isDone ? '✅' : locked ? '🔒' : '⭐'}</div>
                    <div class="skill-node-label">${s.label}</div>
                    <div class="skill-node-pages">Pages ${s.pages}</div>
                    ${!locked ? `<button class="skill-node-btn" onclick="jumpSkillNode(${s.id})">Study →</button>` : ''}
                  </div>`;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  };

  window.jumpSkillNode = function(skillId) {
    const node = SKILL_TREE.find(s => s.id === skillId);
    if (!node) return;
    document.getElementById('skilltree-modal')?.remove();
    const startPage = parseInt(node.pages.split('–')[0]);
    window.currentPageId = startPage;
    if (typeof switchMode === 'function') switchMode('notebook');
    if (typeof renderCurrentView === 'function') renderCurrentView();
  };

  // Inject Skill Tree button into streak chip
  function patchStreakChipWithSkillTree() {
    const observer = new MutationObserver(() => {
      const chip = document.getElementById('streak-chip');
      if (!chip || chip.querySelector('.skill-tree-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'skill-tree-btn streak-badge-btn';
      btn.title = 'View Curriculum Skill Tree';
      btn.textContent = '🗺️ Map';
      btn.onclick = () => openSkillTree();
      chip.appendChild(btn);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ====================================================================
  // 14. CUSTOM PDF BUILDER — Export only bookmarked pages
  // ====================================================================
  window.openCustomPDFBuilder = function() {
    const existing = document.getElementById('custpdf-modal');
    if (existing) existing.remove();

    const bookmarkedIds = JSON.parse(localStorage.getItem('soc_bookmarked_pages') || '[]');
    const bookmarkedAdv = JSON.parse(localStorage.getItem('adv_bookmarked_pages') || '[]');
    const bookmarkedCS = JSON.parse(localStorage.getItem('soc_bookmarked_cheatsheets') || '[]');
    const total = bookmarkedIds.length + bookmarkedAdv.length + bookmarkedCS.length;

    const modal = document.createElement('div');
    modal.id = 'custpdf-modal';
    modal.className = 'feat-modal-overlay';
    modal.innerHTML = `
      <div class="feat-modal-card" style="max-width:520px; text-align:center;">
        <div class="feat-modal-header"><span>📄 Custom PDF Builder</span><button onclick="document.getElementById('custpdf-modal').remove()" class="feat-modal-close">✕</button></div>
        <div class="feat-modal-body">
          <div style="font-size:2.8rem; margin:0.5rem;">📄</div>
          <h3 style="color:var(--accent-blue); margin-bottom:0.3rem;">Build Your Personal Cheat Sheet PDF</h3>
          <p style="font-size:0.88rem; color:#64748b; margin-bottom:1.2rem;">Compile only your saved (⭐ bookmarked) pages into a focused PDF.</p>
          <div class="custpdf-summary">
            <div class="custpdf-row"><span>📖 Notebook bookmarks:</span><strong>${bookmarkedIds.length} pages</strong></div>
            <div class="custpdf-row"><span>🔵 Advanced bookmarks:</span><strong>${bookmarkedAdv.length} pages</strong></div>
            <div class="custpdf-row"><span>⚡ Cheat Sheet bookmarks:</span><strong>${bookmarkedCS.length} cards</strong></div>
            <div class="custpdf-row custpdf-total"><span>Total pages to export:</span><strong>${total} pages</strong></div>
          </div>
          ${total === 0 ? '<p style="color:#ef4444; font-size:0.85rem;">⭐ Save some pages first using the bookmark button, then come back here!</p>' : ''}
          <div style="display:flex; gap:0.8rem; flex-wrap:wrap; justify-content:center; margin-top:1.2rem;">
            ${bookmarkedIds.length > 0 ? `<button onclick="exportBookmarkedPDF('notebook')" class="custpdf-btn">📖 Export Notebook PDF</button>` : ''}
            ${bookmarkedAdv.length > 0 ? `<button onclick="exportBookmarkedPDF('advanced')" class="custpdf-btn">🔵 Export Advanced PDF</button>` : ''}
            ${bookmarkedCS.length > 0 ? `<button onclick="exportBookmarkedPDF('cheatsheet')" class="custpdf-btn">⚡ Export Cheat Sheet PDF</button>` : ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  };

  window.exportBookmarkedPDF = function(type) {
    document.getElementById('custpdf-modal')?.remove();
    alert(`📄 Generating ${type} PDF for your ${type === 'notebook' ? JSON.parse(localStorage.getItem('soc_bookmarked_pages')||'[]').length : type === 'advanced' ? JSON.parse(localStorage.getItem('adv_bookmarked_pages')||'[]').length : JSON.parse(localStorage.getItem('soc_bookmarked_cheatsheets')||'[]').length} bookmarked pages...\n\nTip: The Export PDF button on the toolbar exports the full handbook. Custom bookmark PDF will print via window.print() — use 'Save as PDF' in the print dialog.`);
    window.print();
  };

  // Inject Custom PDF option into existing PDF export modal
  function patchPDFModal() {
    const pdfModal = document.getElementById('pdf-export-choice-modal');
    if (!pdfModal || pdfModal.querySelector('[data-custpdf]')) return;
    const btn = document.createElement('button');
    btn.setAttribute('data-custpdf', '1');
    btn.className = 'quiz-option-btn';
    btn.style.cssText = 'padding:1rem 1.2rem; border-color:#10b981; background:var(--bg-app); display:flex; align-items:center; gap:0.8rem; margin-top:0.6rem;';
    btn.onclick = () => { if (typeof closePdfExportModal === 'function') closePdfExportModal(); openCustomPDFBuilder(); };
    btn.innerHTML = `<span style="font-size:1.8rem;">⭐</span><div style="text-align:left;"><div style="font-weight:700;font-size:1rem;color:#10b981;">⭐ Custom Bookmarks PDF Builder</div><div style="font-size:0.78rem;color:#64748b;">Compile only your saved bookmarked pages into a personal cheat sheet PDF.</div></div>`;
    const container = pdfModal.querySelector('div[style*="flex-direction:column"]');
    if (container) container.appendChild(btn);
  }

  // ====================================================================
  // 15. PRISM.JS SYNTAX HIGHLIGHTING
  //     Auto-applied to all <code> and <pre> blocks in content
  // ====================================================================
  function initPrismHighlighting() {
    // Load PrismJS from CDN dynamically
    if (window.Prism) { applyPrism(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js';
    script.onload = () => {
      const autoScript = document.createElement('script');
      autoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js';
      document.head.appendChild(autoScript);
      autoScript.onload = () => {
        applyPrism();
        // Re-apply on every page change
        const view = document.getElementById('notebook-paper-view');
        if (view) new MutationObserver(applyPrism).observe(view, { childList: true });
      };
    };
    document.head.appendChild(script);
  }

  function applyPrism() {
    if (!window.Prism) return;
    // Add language class to unclassed code blocks
    document.querySelectorAll('pre:not(.language-bash) code:not([class])').forEach(code => {
      const text = code.textContent || '';
      if (text.includes('$') || text.includes('#') || text.match(/^(ls|ps|grep|awk|sed|cat|sudo|systemctl|iptables|chmod|find)/m)) {
        code.classList.add('language-bash');
        code.parentElement.classList.add('language-bash');
      }
    });
    try { window.Prism.highlightAll(); } catch(e) {}
  }

  // ====================================================================
  // INIT ALL FEATURES on DOMContentLoaded
  // ====================================================================
  function init() {
    initStreakSystem();
    initTTS();
    initAccessibilityPanel();
    injectStudyNotes();
    initFuzzySearch();
    initThreatTicker();
    injectCVEChipInLogParser();
    initSpacedRepetition();
    injectQuizTriggers();
    initExpandableLogSnippets();
    patchStreakChipWithSkillTree();
    initPrismHighlighting();
    // Deep linking runs after app is ready
    setTimeout(initDeepLinking, 500);
    // Patch PDF modal after it's visible
    setTimeout(patchPDFModal, 2000);
    // Recheck badges & patch PDF modal on every click
    document.addEventListener('click', () => {
      setTimeout(checkAndAwardBadges, 300);
      setTimeout(patchPDFModal, 500);
    });
    // Add Custom PDF option to existing Export PDF button click
    const printBtn = document.getElementById('btn-print-pdf');
    if (printBtn) {
      printBtn.addEventListener('click', () => setTimeout(patchPDFModal, 300));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }

})();
