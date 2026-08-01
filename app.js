// SAMRUDH SOC ANALYST - Application Controller

let activeMode = "notebook"; // "notebook" | "interview" | "cover"
let currentPageId = 1;
let currentQAId = 1;
let bookmarkedPages = JSON.parse(localStorage.getItem("soc_bookmarked_pages") || "[]");
let bookmarkedQAs = JSON.parse(localStorage.getItem("soc_bookmarked_qas") || "[]");
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  initPWA();
  initModeTabs();
  initSidebar();
  renderCurrentView();
  setupEventListeners();
  setupMobileNav();
});

// --- MOBILE NAV SETUP ---
function setupMobileNav() {
  const sidebar   = document.getElementById("main-sidebar");
  const overlay   = document.getElementById("sidebar-overlay");

  // Sidebar overlay tap-to-close
  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      overlay.classList.remove("active");
    });
  }

  // Mobile bottom nav buttons
  const mobMenu = document.getElementById("mob-menu-btn");
  const mobPrev = document.getElementById("mob-prev-btn");
  const mobNext = document.getElementById("mob-next-btn");
  const mobPlay = document.getElementById("mob-play-btn");
  const mobTerm = document.getElementById("mob-terminal-btn");

  if (mobMenu) mobMenu.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("active");
  });

  if (mobPrev) mobPrev.addEventListener("click", () => {
    if (activeMode === "notebook" && currentPageId > 1) {
      currentPageId--; renderCurrentView("prev"); updateActiveSidebarItem();
    } else if (activeMode === "interview" && currentQAId > 1) {
      currentQAId--; renderCurrentView("prev"); updateActiveSidebarItem();
    }
  });

  if (mobNext) mobNext.addEventListener("click", () => {
    if (activeMode === "notebook" && currentPageId < NOTEBOOK_PAGES.length) {
      currentPageId++; renderCurrentView("next"); updateActiveSidebarItem();
    } else if (activeMode === "interview" && currentQAId < INTERVIEW_QUESTIONS.length) {
      currentQAId++; renderCurrentView("next"); updateActiveSidebarItem();
    }
  });

  if (mobPlay) mobPlay.addEventListener("click", () => toggleAutoPlay());

  if (mobTerm) mobTerm.addEventListener("click", () => {
    document.getElementById("terminal-modal").classList.remove("hidden");
    document.getElementById("terminal-input").focus();
  });
}



// --- MODE TABS SWITCHER ---
function initModeTabs() {
  document.getElementById("tab-notebook").addEventListener("click", () => switchMode("notebook"));
  document.getElementById("tab-interview").addEventListener("click", () => switchMode("interview"));
  const mitreTab = document.getElementById("tab-mitre");
  if (mitreTab) mitreTab.addEventListener("click", () => switchMode("mitre"));
  const logTab = document.getElementById("tab-logparser");
  if (logTab) logTab.addEventListener("click", () => switchMode("logparser"));
  const hardTab = document.getElementById("tab-hardening");
  if (hardTab) hardTab.addEventListener("click", () => switchMode("hardening"));
  const cheatTab = document.getElementById("tab-cheatsheet");
  if (cheatTab) cheatTab.addEventListener("click", () => switchMode("cheatsheet"));
  const labsTab = document.getElementById("tab-labs");
  if (labsTab) labsTab.addEventListener("click", () => switchMode("labs"));
  document.getElementById("tab-cover").addEventListener("click", () => switchMode("cover"));
}

function switchMode(mode) {
  stopSpeech();
  activeMode = mode;
  document.querySelectorAll(".mode-tab").forEach(tab => tab.classList.remove("active"));

  if (mode === "notebook") {
    document.getElementById("tab-notebook").classList.add("active");
    document.getElementById("page-type-label").innerText = "Page";
    document.getElementById("total-count-label").innerText = NOTEBOOK_PAGES.length;
    document.getElementById("page-number-input").max = NOTEBOOK_PAGES.length;
    document.getElementById("toolbar-controls").style.display = "flex";
  } else if (mode === "interview") {
    document.getElementById("tab-interview").classList.add("active");
    document.getElementById("page-type-label").innerText = "Q&A";
    document.getElementById("total-count-label").innerText = INTERVIEW_QUESTIONS.length;
    document.getElementById("page-number-input").max = INTERVIEW_QUESTIONS.length;
    document.getElementById("toolbar-controls").style.display = "flex";
  } else if (mode === "mitre") {
    const tab = document.getElementById("tab-mitre");
    if (tab) tab.classList.add("active");
    document.getElementById("toolbar-controls").style.display = "none";
  } else if (mode === "logparser") {
    const tab = document.getElementById("tab-logparser");
    if (tab) tab.classList.add("active");
    document.getElementById("toolbar-controls").style.display = "none";
  } else if (mode === "hardening") {
    const tab = document.getElementById("tab-hardening");
    if (tab) tab.classList.add("active");
    document.getElementById("toolbar-controls").style.display = "none";
  } else if (mode === "cheatsheet") {
    const tab = document.getElementById("tab-cheatsheet");
    if (tab) tab.classList.add("active");
    document.getElementById("toolbar-controls").style.display = "none";
  } else if (mode === "labs") {
    const tab = document.getElementById("tab-labs");
    if (tab) tab.classList.add("active");
    document.getElementById("toolbar-controls").style.display = "none";
  } else if (mode === "cover") {
    document.getElementById("tab-cover").classList.add("active");
    document.getElementById("toolbar-controls").style.display = "none";
  }

  initSidebar();
  renderCurrentView();
}


// --- RENDER SIDEBAR CONTENT ---
function initSidebar() {
  const navContainer = document.getElementById("module-nav");
  navContainer.innerHTML = "";

  if (activeMode === "notebook") {
    NOTEBOOK_MODULES.forEach(mod => {
      const modGroup = createSidebarGroup(mod.title, mod.range);
      const pagesInMod = NOTEBOOK_PAGES.filter(p => p.moduleId === mod.id);
      
      pagesInMod.forEach(page => {
        const isSaved = bookmarkedPages.includes(page.id) ? "⭐ " : "";
        const item = createSidebarItem(page.id, `${isSaved}${page.concept}`, `P.${page.id}`, page.id === currentPageId, () => {
          currentPageId = page.id;
          renderCurrentView();
          updateActiveSidebarItem();
        });
        modGroup.appendChild(item);
      });
      navContainer.appendChild(modGroup);
    });
  } else if (activeMode === "interview") {
    INTERVIEW_CATEGORIES.forEach(cat => {
      const catGroup = createSidebarGroup(cat.title, "");
      const qasInCat = INTERVIEW_QUESTIONS.filter(q => q.catId === cat.id);
      
      qasInCat.forEach(qa => {
        const isSaved = bookmarkedQAs.includes(qa.id) ? "⭐ " : "";
        const item = createSidebarItem(qa.id, `${isSaved}${qa.question}`, `Q.${qa.id}`, qa.id === currentQAId, () => {
          currentQAId = qa.id;
          renderCurrentView();
          updateActiveSidebarItem();
        });
        catGroup.appendChild(item);
      });
      navContainer.appendChild(catGroup);
    });
  } else if (activeMode === "cover") {
    navContainer.innerHTML = `
      <div style="padding:1rem; color:var(--text-ink); font-weight:600;">
        🏆 Official SAMRUDH SOC ANALYST Brand Cover & Certification Hub
      </div>
    `;
  }
}

function createSidebarGroup(title, range) {
  const grp = document.createElement("div");
  grp.className = "module-group";
  grp.innerHTML = `<div class="module-title">${title} ${range ? `(${range})` : ''}</div>`;
  return grp;
}

function createSidebarItem(id, labelText, badgeText, isActive, onClick) {
  const item = document.createElement("div");
  item.className = `page-item ${isActive ? 'active' : ''}`;
  item.setAttribute("data-item-id", id);
  item.innerHTML = `<span>${labelText}</span><span class="page-num">${badgeText}</span>`;
  item.addEventListener("click", onClick);
  return item;
}

function updateActiveSidebarItem() {
  const targetId = activeMode === "notebook" ? currentPageId : currentQAId;
  document.querySelectorAll(".page-item").forEach(item => {
    const id = parseInt(item.getAttribute("data-item-id"));
    if (id === targetId) {
      item.classList.add("active");
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.classList.remove("active");
    }
  });
}

// --- RENDER MAIN VIEW AREA (WITH 3D PAGE FLIP ANIMATION) ---
function renderCurrentView(direction = "next") {
  const container = document.getElementById("notebook-paper-view");

  // 3D Book Page Flip Animation
  container.classList.remove("page-flip-next", "page-flip-prev");
  void container.offsetWidth; // Force reflow
  container.classList.add(direction === "next" ? "page-flip-next" : "page-flip-prev");
  setTimeout(() => container.classList.remove("page-flip-next", "page-flip-prev"), 450);

  if (activeMode === "notebook") {
    const page = NOTEBOOK_PAGES.find(p => p.id === currentPageId);
    if (page) {
      document.getElementById("page-number-input").value = currentPageId;
      updateBookmarkButtonState(currentPageId);
      container.innerHTML = generatePageHTML(page);
    }
  } else if (activeMode === "interview") {
    const qa = INTERVIEW_QUESTIONS.find(q => q.id === currentQAId);
    if (qa) {
      document.getElementById("page-number-input").value = currentQAId;
      updateBookmarkButtonState(currentQAId);
      container.innerHTML = generateInterviewQAHTML(qa);
    }
  } else if (activeMode === "mitre") {
    container.innerHTML = generateMitreMatrixHTML();
  } else if (activeMode === "logparser") {
    container.innerHTML = generateLogParserHTML();
  } else if (activeMode === "hardening") {
    container.innerHTML = generateHardeningHTML();
  } else if (activeMode === "cheatsheet") {
    container.innerHTML = generateCheatSheetHTML();
  } else if (activeMode === "labs") {
    container.innerHTML = generateIncidentLabsHTML();
  } else if (activeMode === "cover") {
    container.innerHTML = generateBrandCoverHTML();
  }

  updateActiveSidebarItem();
}

// --- GENERATE PAGE HTML (WITH BRAND WATERMARK, PUBLISHED AUTHOR HEROES, SOC TIPS & VISUALS) ---
function generatePageHTML(page) {
  const isFirstPage = page.id === 1;
  const isLastPage = page.id === 365;

  return `
    <article class="ruled-paper">
      <img src="logo.png" alt="SAMRUDH SOC" class="brand-watermark-stamp" />

      ${isFirstPage ? `
        <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.15)); border: 2px solid var(--accent-blue); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
          <img src="logo.png" style="width: 80px; height: 80px; margin-bottom: 0.5rem;" />
          <h1 style="font-family: 'Outfit', sans-serif; color: var(--accent-blue); font-size: 1.8rem; margin: 0;">📖 SAMRUDH SOC ANALYST — 365-PAGE MASTER HANDBOOK</h1>
          <p style="font-weight: 700; color: var(--text-ink); margin-top: 0.4rem;">OFFICIAL PUBLISHED HANDBOOK FOR LINUX & BLUE TEAM SECURITY OPERATIONS</p>
          <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 0.8rem; font-size: 0.85rem;">
            <span style="background: var(--bg-app); border: 1px solid var(--card-border); padding: 0.3rem 0.8rem; border-radius: 20px;">📚 365 Master Pages</span>
            <span style="background: var(--bg-app); border: 1px solid var(--card-border); padding: 0.3rem 0.8rem; border-radius: 20px;">🗣️ Telugu + English Mix</span>
            <span style="background: var(--bg-app); border: 1px solid var(--card-border); padding: 0.3rem 0.8rem; border-radius: 20px;">🛡️ Tier-1 SOC Analyst Ready</span>
          </div>
        </div>
      ` : ''}

      ${isLastPage ? `
        <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(34, 197, 94, 0.18)); border: 2px solid #eab308; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.2rem;">🏆 🎓 🛡️</div>
          <h1 style="font-family: 'Outfit', sans-serif; color: #eab308; font-size: 2rem; margin: 0;">OFFICIAL CERTIFICATION & GRADUATION BLUEPRINT</h1>
          <p style="font-weight: 700; color: var(--text-ink); margin-top: 0.4rem;">CONGRATULATIONS ON MASTERING ALL 365 PAGES OF THE LINUX SOC CURRICULUM!</p>
          <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 0.8rem; font-size: 0.85rem;">
            <span style="background: #eab308; color: #000; font-weight: bold; padding: 0.4rem 1rem; border-radius: 20px;">SEAL OF COMPLETION</span>
            <span style="background: #22c55e; color: #fff; font-weight: bold; padding: 0.4rem 1rem; border-radius: 20px;">BLUE TEAM TIER-1 CERTIFIED</span>
          </div>
        </div>
      ` : ''}

      <header class="page-header-row">
        <div class="concept-title-box">
          <h2>${page.concept}</h2>
          <span class="concept-tag">${getModuleName(page.moduleId)}</span>
        </div>
        <div class="page-stamp">PAGE ${page.id}</div>
      </header>

      <div class="section-block">
        <div class="section-label">💡 SIMPLE EXPLANATION (TELUGU-ENGLISH)</div>
        <p class="handwritten-text">"${page.explanation}"</p>
      </div>

      <div class="section-block">
        <div class="section-label">⚡ WHY IT MATTERS (SOC PERSPECTIVE)</div>
        <p class="handwritten-text">"${page.whyItMatters}"</p>
      </div>

      <div class="section-block">
        <div class="section-label">💻 LINUX COMMAND & SYNTAX</div>
        <div class="syntax-box">SYNTAX: ${escapeHTML(page.syntax)}</div>
        <div class="cmd-box">$ ${escapeHTML(page.command)}</div>
      </div>

      <div class="section-block">
        <div class="section-label">🖥️ TERMINAL EXAMPLE & OUTPUT</div>
        <div class="cmd-box">${escapeHTML(page.example)}</div>
        <p class="handwritten-text">"${page.cmdExplanation}"</p>
      </div>

      <div class="section-block">
        <div class="section-label">🛡️ SOC WORKFLOW & INCIDENT USE CASE</div>
        <p class="handwritten-text">"${page.socUse}"</p>
      </div>

      ${page.id % 15 === 0 ? VISUAL_DIAGRAMS.webshellFlow : ''}
      ${page.id % 20 === 0 ? VISUAL_DIAGRAMS.killchain : ''}

      ${page.noteVisual ? `
        <div class="section-block">
          <div class="section-label">✏️ HANDWRITTEN VISUAL DIAGRAM / SUMMARY</div>
          <div class="diagram-box">${escapeHTML(page.noteVisual)}</div>
        </div>
      ` : ''}

      <div class="pro-tip-box" style="margin-bottom: 1rem;">
        💡 <strong>SOC ANALYST PRO-TIP:</strong> ${escapeHTML(page.remember)}
      </div>

      <div class="sticky-note">
        "🧪 <strong>TRY IT PRACTICAL EXERCISE:</strong> Open terminal, run <code>${escapeHTML(page.command)}</code>, and observe output log timestamps."
      </div>
    </article>
  `;
}



// --- GENERATE INTERVIEW Q&A HTML ---
function generateInterviewQAHTML(qa) {
  return `
    <article class="interview-card">
      <img src="logo.png" alt="SAMRUDH SOC" class="brand-watermark-stamp" />

      <header class="page-header-row">
        <div class="concept-title-box">
          <h2 style="font-size:1.3rem;">${escapeHTML(qa.question)}</h2>
          <span class="concept-tag">QUESTION #${qa.id}</span>
        </div>
      </header>

      <div class="qa-intent-box">
        🎯 <strong>INTERVIEWER INTENT:</strong> ${escapeHTML(qa.intent)}
      </div>

      <div class="section-block">
        <div class="section-label">🗣️ TELUGU-ENGLISH EXPLANATION (EASY UNDERSTANDING)</div>
        <p class="handwritten-text">"${qa.explanation}"</p>
      </div>

      <div class="section-block">
        <div class="section-label">💬 IDEAL ENGLISH ANSWER TO SPEAK IN INTERVIEW</div>
        <div class="qa-ideal-box">"${escapeHTML(qa.idealAnswer)}"</div>
      </div>

      <div class="section-block">
        <div class="section-label">💻 REAL-WORLD SCENARIO / LOG COMMAND</div>
        <div class="cmd-box">${escapeHTML(qa.example)}</div>
      </div>

      <div class="pro-tip-box">
        💡 <strong>PRO-TIP TO STAND OUT:</strong> ${escapeHTML(qa.proTip)}
      </div>
    </article>
  `;
}

// --- GENERATE BRAND COVER PAGE HTML ---
function generateBrandCoverHTML() {
  return `
    <article class="brand-cover-page">
      <img src="logo.png" alt="SAMRUDH SOC ANALYST" class="cover-logo-hero" />
      <h1 class="cover-title">SAMRUDH SOC ANALYST</h1>
      <p class="cover-subtitle">BLUE TEAM READY — 365-PAGE NOTEBOOK & 200+ INTERVIEW Q&A</p>
      
      <div class="cover-badge-row">
        <span class="cover-badge">🐧 Linux Security</span>
        <span class="cover-badge">🔎 Log Forensics</span>
        <span class="cover-badge">🛡️ Incident Response</span>
        <span class="cover-badge">🎯 200+ Interview Q&A</span>
      </div>

      <div class="cover-profile-links" style="display:flex; justify-content:center; gap:0.8rem; margin:1.8rem 0 1rem 0; flex-wrap:wrap;">
        <a href="https://github.com/Samrudh2006" target="_blank" rel="noopener noreferrer" class="profile-pill btn-github" style="padding:0.5rem 1.2rem; font-size:0.95rem;">
          <svg class="profile-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>GitHub: @Samrudh2006</span>
        </a>
        <a href="https://www.linkedin.com/in/satyasamrudh" target="_blank" rel="noopener noreferrer" class="profile-pill btn-linkedin" style="padding:0.5rem 1.2rem; font-size:0.95rem;">
          <svg class="profile-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/></svg>
          <span>LinkedIn: Satya Samrudh</span>
        </a>
        <a href="mailto:samrudhdwivedula12@gmail.com" class="profile-pill btn-email" style="padding:0.5rem 1.2rem; font-size:0.95rem;">
          <svg class="profile-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          <span>Mail: samrudhdwivedula12@gmail.com</span>
        </a>
      </div>

      <p style="font-family:var(--font-hand); font-size:1.4rem; color:var(--text-ink); margin-top:1.5rem;">
        "Naaku easy ga ardham avvali → Command ela work chustham → Practical SOC lo apply chestham → Interview lo crack chestham!"
      </p>
    </article>
  `;
}

function getModuleName(modId) {
  const mod = NOTEBOOK_MODULES.find(m => m.id === modId);
  return mod ? mod.title : `Module ${modId}`;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Page Switchers
  document.getElementById("btn-prev-page").addEventListener("click", () => {
    if (activeMode === "notebook" && currentPageId > 1) {
      currentPageId--;
      renderCurrentView("prev");
      updateActiveSidebarItem();
    } else if (activeMode === "interview" && currentQAId > 1) {
      currentQAId--;
      renderCurrentView("prev");
      updateActiveSidebarItem();
    }
  });

  document.getElementById("btn-next-page").addEventListener("click", () => {
    if (activeMode === "notebook" && currentPageId < NOTEBOOK_PAGES.length) {
      currentPageId++;
      renderCurrentView("next");
      updateActiveSidebarItem();
    } else if (activeMode === "interview" && currentQAId < INTERVIEW_QUESTIONS.length) {
      currentQAId++;
      renderCurrentView("next");
      updateActiveSidebarItem();
    }
  });

  // Toggle Sidebar Listener
  const toggleBtn = document.getElementById("btn-toggle-sidebar");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleSidebar);
  }

  // Auto Play Slideshow Listener
  const playBtn = document.getElementById("btn-play-slideshow");
  if (playBtn) {
    playBtn.addEventListener("click", toggleAutoPlay);
  }

  // Voice Speech Synthesis Listener
  const listenBtn = document.getElementById("btn-listen-speech");
  if (listenBtn) {
    listenBtn.addEventListener("click", toggleSpeech);
  }

  document.getElementById("page-number-input").addEventListener("change", (e) => {
    const val = parseInt(e.target.value);
    if (activeMode === "notebook") {
      if (val >= 1 && val <= NOTEBOOK_PAGES.length) {
        const dir = val > currentPageId ? "next" : "prev";
        currentPageId = val;
        renderCurrentView(dir);
        updateActiveSidebarItem();
      }
    } else if (activeMode === "interview") {
      if (val >= 1 && val <= INTERVIEW_QUESTIONS.length) {
        const dir = val > currentQAId ? "next" : "prev";
        currentQAId = val;
        renderCurrentView(dir);
        updateActiveSidebarItem();
      }
    }
  });


  document.getElementById("search-input").addEventListener("input", (e) => {
    filterSidebar(e.target.value.toLowerCase().trim());
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentFilter = e.target.getAttribute("data-filter");
      filterSidebar(document.getElementById("search-input").value.toLowerCase().trim());
    });
  });

  document.getElementById("btn-bookmark").addEventListener("click", () => {
    if (activeMode === "notebook") {
      toggleBookmark(currentPageId, bookmarkedPages, "soc_bookmarked_pages");
    } else if (activeMode === "interview") {
      toggleBookmark(currentQAId, bookmarkedQAs, "soc_bookmarked_qas");
    }
    updateBookmarkButtonState(activeMode === "notebook" ? currentPageId : currentQAId);
    initSidebar();
  });

  document.getElementById("btn-theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("theme-cyber");
  });

  document.getElementById("btn-print-pdf").addEventListener("click", () => {
    prepareFullPrintContainer();
    window.print();
  });

  document.getElementById("btn-terminal-open").addEventListener("click", () => {
    document.getElementById("terminal-modal").classList.remove("hidden");
    document.getElementById("terminal-input").focus();
  });

  document.getElementById("btn-terminal-close").addEventListener("click", () => {
    document.getElementById("terminal-modal").classList.add("hidden");
  });

  document.getElementById("terminal-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleTerminalCommand(e.target.value);
      e.target.value = "";
    }
  });

  // --- KEYBOARD NAVIGATION (Book Reading Mode) ---
  document.addEventListener("keydown", (e) => {
    const terminalOpen = !document.getElementById("terminal-modal").classList.contains("hidden");
    if (terminalOpen) return; // Don't hijack when terminal is open

    const pageInput = document.getElementById("page-number-input");
    if (document.activeElement === pageInput) return;

    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      if (activeMode === "notebook" && currentPageId < NOTEBOOK_PAGES.length) {
        currentPageId++; renderCurrentView("next"); updateActiveSidebarItem();
      } else if (activeMode === "interview" && currentQAId < INTERVIEW_QUESTIONS.length) {
        currentQAId++; renderCurrentView("next"); updateActiveSidebarItem();
      }
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      if (activeMode === "notebook" && currentPageId > 1) {
        currentPageId--; renderCurrentView("prev"); updateActiveSidebarItem();
      } else if (activeMode === "interview" && currentQAId > 1) {
        currentQAId--; renderCurrentView("prev"); updateActiveSidebarItem();
      }
    } else if (e.key === " ") {
      e.preventDefault();
      toggleAutoPlay(); // Spacebar toggles auto-play
    } else if (e.key === "b" || e.key === "B") {
      toggleSidebar(); // B key collapses/expands sidebar
    }
  });
}

function toggleBookmark(id, list, storageKey) {
  const index = list.indexOf(id);
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(id);
  }
  localStorage.setItem(storageKey, JSON.stringify(list));
}

function updateBookmarkButtonState(id) {
  const btn = document.getElementById("btn-bookmark");
  const isBookmarked = activeMode === "notebook" ? bookmarkedPages.includes(id) : bookmarkedQAs.includes(id);
  if (isBookmarked) {
    btn.classList.add("bookmarked");
    btn.innerText = "⭐ Saved";
  } else {
    btn.classList.remove("bookmarked");
    btn.innerText = "⭐ Save Item";
  }
}

function filterSidebar(query) {
  document.querySelectorAll(".page-item").forEach(item => {
    const pId = parseInt(item.getAttribute("data-item-id"));
    let matchesSearch = false;

    if (activeMode === "notebook") {
      const page = NOTEBOOK_PAGES.find(p => p.id === pId);
      matchesSearch = !query || page.concept.toLowerCase().includes(query) || page.command.toLowerCase().includes(query);
    } else if (activeMode === "interview") {
      const qa = INTERVIEW_QUESTIONS.find(q => q.id === pId);
      matchesSearch = !query || qa.question.toLowerCase().includes(query) || qa.idealAnswer.toLowerCase().includes(query);
    }

    const isBookmarked = activeMode === "notebook" ? bookmarkedPages.includes(pId) : bookmarkedQAs.includes(pId);
    const matchesFilter = (currentFilter === "all") || (currentFilter === "bookmarked" && isBookmarked);

    if (matchesSearch && matchesFilter) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// (renderCurrentView unified above — duplicate removed)

// --- SLIDESHOW AUTO PLAY CONTROLLER ---
let autoPlayInterval = null;

function toggleAutoPlay() {
  const playBtn = document.getElementById("btn-play-slideshow");
  const playBtnText = document.getElementById("play-btn-text");

  if (autoPlayInterval) {
    // Stop Auto Play
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    playBtn.classList.remove("playing");
    playBtnText.innerText = "Auto Play (5s)";
  } else {
    // Start Auto Play
    playBtn.classList.add("playing");
    playBtnText.innerText = "⏸️ Pause Play";

    autoPlayInterval = setInterval(() => {
      if (activeMode === "notebook") {
        if (currentPageId < NOTEBOOK_PAGES.length) {
          currentPageId++; renderCurrentView("next"); updateActiveSidebarItem();
        } else { toggleAutoPlay(); } // Stop at last page
      } else if (activeMode === "interview") {
        if (currentQAId < INTERVIEW_QUESTIONS.length) {
          currentQAId++; renderCurrentView("next"); updateActiveSidebarItem();
        } else { toggleAutoPlay(); }
      }
    }, 5000);
  }
}


// --- SIDEBAR TOGGLE CONTROLLER ---
function toggleSidebar() {
  const isMobile = window.innerWidth <= 768;
  const sidebar = document.getElementById("main-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const mainContainer = document.querySelector(".main-container");
  const toggleText = document.getElementById("sidebar-toggle-text");

  if (isMobile) {
    // Mobile: slide drawer in/out
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("active");
  } else {
    // Desktop: collapse sidebar into zero-width
    mainContainer.classList.toggle("sidebar-collapsed");
    const isCollapsed = mainContainer.classList.contains("sidebar-collapsed");
    toggleText.innerText = isCollapsed ? "Show Sidebar" : "Hide Sidebar";
  }
}


function prepareFullPrintContainer() {
  const pdfContainer = document.getElementById("full-pdf-container");
  pdfContainer.innerHTML = generateBrandCoverHTML();

  if (activeMode === "notebook") {
    NOTEBOOK_PAGES.forEach(page => pdfContainer.innerHTML += generatePageHTML(page));
  } else if (activeMode === "interview") {
    INTERVIEW_QUESTIONS.forEach(qa => pdfContainer.innerHTML += generateInterviewQAHTML(qa));
  }
}

function handleTerminalCommand(cmdStr) {
  const outputDiv = document.getElementById("terminal-output");
  const trimmed = cmdStr.trim();
  const line = document.createElement("div");
  line.className = "term-cmd-line";
  line.innerHTML = `<span class="term-prompt">kali@soc-workstation:~$</span> ${escapeHTML(trimmed)}`;
  outputDiv.appendChild(line);

  const res = document.createElement("div");
  res.className = "term-response";
  const lower = trimmed.toLowerCase();

  if (lower === "pwd") res.innerText = "/home/analyst";
  else if (lower === "whoami") res.innerText = "kali";
  else if (lower === "id") res.innerText = "uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)";
  else if (lower.startsWith("ls")) res.innerText = "total 32\n-rw-r--r-- 1 kali kali 850 Aug 1 auth.log\n-rwxr-xr-x 1 kali kali 1200 Aug 1 triage.sh";
  else if (lower.startsWith("ps")) res.innerText = "USER PID %CPU %MEM COMMAND\nroot 1 0.0 0.1 /sbin/init\nwww-data 8812 99.0 1.2 python3 /tmp/.miner.py";
  else if (lower.startsWith("ss")) res.innerText = "Netid State Recv-Q Send-Q Local:Port Peer:Port Process\ntcp LISTEN 0 128 0.0.0.0:4444 users:((\"nc\",pid=4512))";
  else if (lower === "clear") { outputDiv.innerHTML = ""; return; }
  else if (lower === "help") res.innerText = "Supported demo commands: pwd, whoami, id, ls, ps aux, ss -tulpn, clear, help";
  else if (trimmed === "") return;
  else res.innerText = `bash: ${trimmed}: command executed in SAMRUDH SOC demo environment.`;

  outputDiv.appendChild(res);
  document.getElementById("terminal-body").scrollTop = document.getElementById("terminal-body").scrollHeight;
}

// --- PWA INSTALL & SERVICE WORKER CONTROLLER ---
let deferredPwaPrompt = null;

function initPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        console.log("PWA ServiceWorker registered:", reg.scope);
      }).catch((err) => {
        console.warn("PWA ServiceWorker error:", err);
      });
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    const pwaBtn = document.getElementById("btn-pwa-install");
    if (pwaBtn) pwaBtn.style.display = "inline-flex";
  });

  const pwaBtn = document.getElementById("btn-pwa-install");
  if (pwaBtn) {
    pwaBtn.addEventListener('click', () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        deferredPwaPrompt.userChoice.then(() => {
          deferredPwaPrompt = null;
          pwaBtn.style.display = "none";
        });
      }
    });
  }
}

// --- TEXT-TO-SPEECH (VOICE NOTES) CONTROLLER ---
let isSpeaking = false;
let currentSpeechUtterance = null;

function toggleSpeech() {
  if (!('speechSynthesis' in window)) {
    alert("Text-to-Speech is not supported in this browser.");
    return;
  }

  const voiceBtn = document.getElementById("btn-listen-speech");
  const voiceBtnText = document.getElementById("voice-btn-text");

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    if (voiceBtn) {
      voiceBtn.classList.remove("speaking");
      voiceBtnText.innerText = "Listen Voice";
    }
  } else {
    let textToSpeak = "";
    if (activeMode === "notebook") {
      const page = NOTEBOOK_PAGES.find(p => p.id === currentPageId);
      if (page) {
        const cleanExplanation = page.simpleExplanation ? page.simpleExplanation.replace(/<[^>]*>?/gm, '') : '';
        textToSpeak = `Page ${page.id}. ${page.concept}. Command: ${page.command}. ${cleanExplanation}`;
      }
    } else if (activeMode === "interview") {
      const qa = INTERVIEW_QUESTIONS.find(q => q.id === currentQAId);
      if (qa) {
        const cleanAnswer = qa.idealAnswer ? qa.idealAnswer.replace(/<[^>]*>?/gm, '') : '';
        textToSpeak = `Question ${qa.id}. ${qa.question}. Answer: ${cleanAnswer}`;
      }
    }

    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    currentSpeechUtterance = new SpeechSynthesisUtterance(textToSpeak);
    currentSpeechUtterance.rate = 0.95;
    currentSpeechUtterance.pitch = 1.0;

    currentSpeechUtterance.onstart = () => {
      isSpeaking = true;
      if (voiceBtn) {
        voiceBtn.classList.add("speaking");
        voiceBtnText.innerText = "Pause Voice";
      }
    };

    currentSpeechUtterance.onend = () => {
      isSpeaking = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("speaking");
        voiceBtnText.innerText = "Listen Voice";
      }
    };

    currentSpeechUtterance.onerror = () => {
      isSpeaking = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("speaking");
        voiceBtnText.innerText = "Listen Voice";
      }
    };

    window.speechSynthesis.speak(currentSpeechUtterance);
  }
}

function stopSpeech() {
  if ('speechSynthesis' in window && isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    const voiceBtn = document.getElementById("btn-listen-speech");
    const voiceBtnText = document.getElementById("voice-btn-text");
    if (voiceBtn) {
      voiceBtn.classList.remove("speaking");
      voiceBtnText.innerText = "Listen Voice";
    }
  }
}

// --- JUMP TO PAGE HELPER ---
function jumpToPage(pageId) {
  switchMode("notebook");
  currentPageId = pageId;
  renderCurrentView();
  updateActiveSidebarItem();
}

// --- MITRE ATT&CK INTERACTIVE MATRIX DATA & RENDERER ---
const MITRE_ATTACK_MATRIX = [
  {
    tactic: "Initial Access",
    icon: "🚪",
    techniques: [
      { id: "T1190", name: "Exploit Public Application", desc: "Exploiting web servers or public services.", pageId: 136 },
      { id: "T1078", name: "Valid Accounts", desc: "Using stolen credentials or default SSH logins.", pageId: 86 }
    ]
  },
  {
    tactic: "Execution",
    icon: "⚙️",
    techniques: [
      { id: "T1059.004", name: "Unix Shell Execution", desc: "Executing malicious commands via Bash/sh.", pageId: 166 },
      { id: "T1053.003", name: "Cron Job Persistence", desc: "Scheduling persistence via crontab.", pageId: 111 }
    ]
  },
  {
    tactic: "Persistence",
    icon: "📌",
    techniques: [
      { id: "T1543.002", name: "systemd Service Backdoor", desc: "Creating malicious systemd unit files.", pageId: 115 },
      { id: "T1546.004", name: ".bashrc Profile Hijack", desc: "Adding shell aliases or startup scripts.", pageId: 170 }
    ]
  },
  {
    tactic: "Privilege Escalation",
    icon: "🔓",
    techniques: [
      { id: "T1548.001", name: "SUID Executable Abuse", desc: "Abusing GTFOBins SUID binary permissions.", pageId: 95 },
      { id: "T1548.002", name: "Sudoers Misconfiguration", desc: "NOPASSWD sudo privilege escalation.", pageId: 100 }
    ]
  },
  {
    tactic: "Defense Evasion",
    icon: "🥷",
    techniques: [
      { id: "T1070.002", name: "Clear Linux System Logs", desc: "Wiping /var/log/auth.log or .bash_history.", pageId: 196 },
      { id: "T1562.001", name: "Disable Firewall", desc: "Stopping ufw, iptables, or firewalld.", pageId: 140 }
    ]
  },
  {
    tactic: "Credential Access",
    icon: "🔑",
    techniques: [
      { id: "T1003.008", name: "/etc/shadow Hash Dumping", desc: "Reading password hashes from shadow file.", pageId: 90 },
      { id: "T1555", name: "Credentials in Files", desc: "Searching for cleartext API keys or passphrases.", pageId: 168 }
    ]
  },
  {
    tactic: "Discovery",
    icon: "🔎",
    techniques: [
      { id: "T1083", name: "File & Directory Discovery", desc: "Enumerating system paths using find/ls.", pageId: 61 },
      { id: "T1057", name: "Process Discovery", desc: "Listing running processes via ps aux / top.", pageId: 112 },
      { id: "T1049", name: "Network Connections", desc: "Analyzing listening ports via ss -tulpn.", pageId: 142 }
    ]
  },
  {
    tactic: "Exfiltration",
    icon: "📡",
    techniques: [
      { id: "T1048", name: "Exfiltration Over Protocol", desc: "Transferring sensitive data over DNS/HTTP.", pageId: 150 }
    ]
  }
];

function generateMitreMatrixHTML() {
  return `
    <article class="mitre-matrix-wrapper">
      <div class="mitre-matrix-header">
        <h2>🗺️ MITRE ATT&CK Interactive Linux SOC Matrix</h2>
        <p style="color:var(--text-dark); font-size:0.92rem; margin-top:0.4rem;">
          Click any MITRE technique card below to jump directly to the corresponding 365-Page Handbook page for triage & threat hunting!
        </p>
      </div>

      <div class="mitre-grid">
        ${MITRE_ATTACK_MATRIX.map(col => `
          <div class="mitre-column">
            <div class="mitre-tactic-title">${col.icon} ${col.tactic}</div>
            ${col.techniques.map(tech => `
              <div class="mitre-tech-card" onclick="jumpToPage(${tech.pageId})">
                <span class="mitre-tech-id">${tech.id}</span>
                <div class="mitre-tech-name">${tech.name}</div>
                <div class="mitre-tech-desc">${tech.desc}</div>
                <div style="font-size:0.75rem; color:var(--accent-blue); margin-top:0.5rem; font-weight:700;">
                  ➡️ Open Page P.${tech.pageId}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

// --- 1. SIEM LOG PARSER LAB ENGINE ---
const SAMPLE_LOGS = {
  bruteforce: `Aug 01 14:22:01 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54122 ssh2
Aug 01 14:22:03 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54124 ssh2
Aug 01 14:22:05 kali sshd[4512]: Failed password for invalid user admin from 192.168.1.105 port 54128 ssh2
Aug 01 14:22:09 kali sshd[4512]: Accepted password for root from 192.168.1.105 port 54132 ssh2
Aug 01 14:22:10 kali systemd-logind[900]: New session 42 of user root.`,

  privesc: `Aug 01 15:10:12 kali sudo: analyst : TTY=pts/0 ; PWD=/home/analyst ; USER=root ; COMMAND=/usr/bin/find . -exec /bin/sh \\;
Aug 01 15:10:14 kali kernel: [ 4512.981] pkexec[9812]: SUID binary executed by uid 1000
Aug 01 15:10:15 kali shadow: Password hash changed for user root via passwd`,

  webshell: `Aug 01 16:05:00 kali apache2[1200]: 10.0.0.45 - - [01/Aug/2026:16:05:00] "GET /uploads/shell.php?cmd=cat%20/etc/shadow HTTP/1.1" 200 1420
Aug 01 16:05:05 kali apache2[1200]: 10.0.0.45 - - [01/Aug/2026:16:05:05] "POST /uploads/shell.php HTTP/1.1" 200 4500
Aug 01 16:05:10 kali kernel: [ 5200.12] nc[14512]: Outbound TCP connection to 10.0.0.45:4444 established`
};

function generateLogParserHTML() {
  return `
    <article class="logparser-wrapper">
      <div style="text-align:center; margin-bottom:1.5rem;">
        <h2 style="color:var(--accent-blue); font-size:1.6rem; margin-bottom:0.4rem;">🔍 SIEM Log Parser & Threat Detection Lab</h2>
        <p style="color:var(--text-dark); font-size:0.9rem;">
          Paste raw Linux logs below or select a preset incident sample to run automated threat triage!
        </p>
      </div>

      <div class="log-preset-bar">
        <span style="font-weight:700; font-size:0.85rem; align-self:center; color:var(--text-ink);">Load Preset:</span>
        <button class="btn-preset" onclick="loadSampleLog('bruteforce')">🚨 SSH Brute Force</button>
        <button class="btn-preset" onclick="loadSampleLog('privesc')">🔓 SUID PrivEsc</button>
        <button class="btn-preset" onclick="loadSampleLog('webshell')">🐍 Web Shell & Reverse Shell</button>
      </div>

      <textarea id="log-input-area" class="log-textarea" placeholder="Paste /var/log/auth.log or syslog here..."></textarea>
      
      <div style="text-align:center; margin-top:0.5rem;">
        <button class="btn-action btn-cyber" onclick="runLogTriage()" style="padding:0.6rem 1.8rem; font-size:1rem;">
          <span class="icon">🔍</span><span> Run Threat Detection Engine</span>
        </button>
      </div>

      <div id="log-triage-results" style="display:none; margin-top:1.5rem;"></div>
    </article>
  `;
}

function loadSampleLog(preset) {
  const area = document.getElementById("log-input-area");
  if (area && SAMPLE_LOGS[preset]) {
    area.value = SAMPLE_LOGS[preset];
  }
}

function runLogTriage() {
  const raw = document.getElementById("log-input-area").value;
  const resultsDiv = document.getElementById("log-triage-results");
  if (!raw.trim()) { alert("Please paste log lines or select a sample preset first!"); return; }

  const lines = raw.split("\n");
  let threatCount = 0;
  let detectedThreats = [];

  const processedLines = lines.map(line => {
    let lower = line.toLowerCase();
    let isHigh = false;
    let isMed = false;

    if (lower.includes("failed password") || lower.includes("shell.php") || lower.includes("sudo:") || lower.includes("suid") || lower.includes("accepted password for root")) {
      isHigh = true;
      threatCount++;
      if (lower.includes("failed password") && !detectedThreats.includes("SSH Brute Force Attempt")) detectedThreats.push("SSH Brute Force Attempt (T1110)");
      if (lower.includes("shell.php") && !detectedThreats.includes("Web Shell Command Execution")) detectedThreats.push("Web Shell Execution (T1505.003)");
      if (lower.includes("sudo:") && !detectedThreats.includes("Sudo Escalation Abuse")) detectedThreats.push("Sudo PrivEsc Abuse (T1548.002)");
      if (lower.includes("suid") && !detectedThreats.includes("SUID Binary Execution")) detectedThreats.push("SUID Binary Abuse (T1548.001)");
    } else if (lower.includes("invalid user") || lower.includes("connection established") || lower.includes("session")) {
      isMed = true;
      threatCount++;
    }

    const cssClass = isHigh ? 'log-line threat-high' : isMed ? 'log-line threat-medium' : 'log-line';
    return `<div class="${cssClass}">${escapeHTML(line)}</div>`;
  }).join('');

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = `
    <div style="background:var(--paper-bg); border:2px solid var(--card-border); border-radius:12px; padding:1.2rem; margin-bottom:1rem;">
      <h3 style="color:${threatCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}; font-size:1.2rem; margin-bottom:0.5rem;">
        ${threatCount > 0 ? `🚨 Threat Detection Result: ${threatCount} Anomalies Detected!` : `✅ Log Stream Clean — No Immediate High Severity Threats`}
      </h3>
      ${detectedThreats.length > 0 ? `
        <div style="margin-bottom:0.8rem;">
          <strong style="color:var(--text-ink);">Mapped MITRE TTPs:</strong>
          <div style="display:flex; gap:0.4rem; margin-top:0.3rem; flex-wrap:wrap;">
            ${detectedThreats.map(t => `<span class="cover-badge" style="background:#fee2e2; color:#991b1b; border:1px solid #f87171;">${t}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      <div style="font-family:var(--font-hand); font-size:1.1rem; color:var(--text-ink); background:var(--bg-app); padding:0.8rem; border-radius:8px;">
        💡 <strong>Telugu-English Triage Tip:</strong> Ee log file lo high severity lines red lo highlight chesam. SOC Analyst triage lo first SSH Failed count check cheyali, user account compromise nunchi IP block ('fail2ban') & SUID binaries revoke cheyali!
      </div>
    </div>

    <div class="log-output-box">
      ${processedLines}
    </div>
  `;
}


// --- 2. CIS-STYLE HARDENING CHECKLIST ---
const HARDENING_ITEMS = [
  { id: "h1", cat: "User & Access Security", text: "Disable Root SSH Direct Login in /etc/ssh/sshd_config (PermitRootLogin no)", cmd: "sudo sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config" },
  { id: "h2", cat: "User & Access Security", text: "Enforce SSH Protocol 2 and Disable Empty Passwords", cmd: "sudo sed -i 's/#PermitEmptyPasswords.*/PermitEmptyPasswords no/' /etc/ssh/sshd_config" },
  { id: "h3", cat: "User & Access Security", text: "Set Strict Permissions on /etc/shadow (chmod 600 & chown root:root)", cmd: "sudo chmod 600 /etc/shadow && sudo chown root:root /etc/shadow" },
  { id: "h4", cat: "Network & Firewall", text: "Enable UFW Firewall with Default Deny Incoming Rules", cmd: "sudo ufw default deny incoming && sudo ufw default allow outgoing && sudo ufw enable" },
  { id: "h5", cat: "Network & Firewall", text: "Disable IP Forwarding in sysctl.conf (net.ipv4.ip_forward = 0)", cmd: "sudo sysctl -w net.ipv4.ip_forward=0" },
  { id: "h6", cat: "File System Security", text: "Audit All SUID/SGID Binaries for GTFOBins Privilege Escalation Vectors", cmd: "find / -type f \\( -perm -4000 -o -perm -2000 \\) -ls 2>/dev/null" },
  { id: "h7", cat: "File System Security", text: "Mount /tmp directory with noexec, nosuid, nodev flags in /etc/fstab", cmd: "sudo mount -o remount,noexec,nosuid,nodev /tmp" },
  { id: "h8", cat: "Logging & Auditd", text: "Enable Auditd Rules for Monitoring /etc/passwd and /etc/shadow Changes", cmd: "sudo auditctl -w /etc/shadow -p wa -k shadow_changes" }
];

function generateHardeningHTML() {
  const savedChecks = JSON.parse(localStorage.getItem("soc_hardening_checks") || "[]");
  const checkedCount = savedChecks.length;
  const pct = Math.round((checkedCount / HARDENING_ITEMS.length) * 100);

  return `
    <article class="hardening-wrapper">
      <div class="score-card">
        <h2 style="font-size:1.5rem; margin-bottom:0.3rem;">🛡️ CIS Linux Security Hardening Score</h2>
        <div style="font-size:2.4rem; font-weight:800; margin:0.4rem 0;"><span id="hardening-score-text">${pct}</span>%</div>
        <p style="font-size:0.9rem; opacity:0.9;">Completed <span id="hardening-count">${checkedCount}</span> of ${HARDENING_ITEMS.length} Audit Control Rules</p>
        <div class="score-bar-bg">
          <div id="hardening-score-fill" class="score-bar-fill" style="width:${pct}%;"></div>
        </div>
      </div>

      <div class="checklist-group">
        ${HARDENING_ITEMS.map(item => {
          const isChecked = savedChecks.includes(item.id);
          return `
            <div class="checklist-item" onclick="toggleHardeningCheck('${item.id}')">
              <input type="checkbox" id="chk-${item.id}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleHardeningCheck('${item.id}')" />
              <div style="flex:1;">
                <div style="font-size:0.75rem; font-weight:700; color:var(--accent-blue); text-transform:uppercase;">${item.cat}</div>
                <div style="font-weight:700; font-size:0.92rem; color:var(--text-dark); margin:0.2rem 0;">${item.text}</div>
                <div style="font-family:var(--font-mono); font-size:0.76rem; color:#64748b; background:var(--paper-bg); padding:0.3rem 0.6rem; border-radius:6px; border:1px solid var(--card-border); margin-top:0.3rem; display:flex; justify-content:space-between; align-items:center;">
                  <code>${escapeHTML(item.cmd)}</code>
                  <button class="btn-copy-cmd" onclick="event.stopPropagation(); copyCmdToClipboard('${escapeHTML(item.cmd)}')">📋 Copy</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </article>
  `;
}

function toggleHardeningCheck(id) {
  let saved = JSON.parse(localStorage.getItem("soc_hardening_checks") || "[]");
  const idx = saved.indexOf(id);
  if (idx > -1) saved.splice(idx, 1);
  else saved.push(id);
  localStorage.setItem("soc_hardening_checks", JSON.stringify(saved));

  const pct = Math.round((saved.length / HARDENING_ITEMS.length) * 100);
  const scoreText = document.getElementById("hardening-score-text");
  const countText = document.getElementById("hardening-count");
  const scoreFill = document.getElementById("hardening-score-fill");
  const chkBox = document.getElementById(`chk-${id}`);

  if (chkBox) chkBox.checked = saved.includes(id);
  if (scoreText) scoreText.innerText = pct;
  if (countText) countText.innerText = saved.length;
  if (scoreFill) scoreFill.style.width = `${pct}%`;
}


// --- 3. 1-CLICK CHEAT SHEET GENERATOR ---
const CHEAT_SHEET_COMMANDS = [
  { cat: "File Forensics", cmd: "grep -rnw '/var/log/' -e 'FAILED'", desc: "Search recursively for FAILED events in all logs." },
  { cat: "File Forensics", cmd: "find / -mtime -1 -type f 2>/dev/null", desc: "Find all files modified in the last 24 hours." },
  { cat: "Process Triage", cmd: "ps aux --sort=-%cpu | head -n 10", desc: "List top 10 highest CPU-consuming processes." },
  { cat: "Process Triage", cmd: "ls -la /proc/<PID>/exe", desc: "Find true execution path of suspicious process PID." },
  { cat: "Network Triage", cmd: "ss -tulpn | grep LISTEN", desc: "List all active listening TCP/UDP ports & PIDs." },
  { cat: "Network Triage", cmd: "lsof -i :4444", desc: "Identify process connected to specific port 4444." },
  { cat: "Permission Audit", cmd: "find / -perm -4000 -type f 2>/dev/null", desc: "Scan for all SUID binaries on Linux system." },
  { cat: "Log Analysis", cmd: "awk '{print $1}' /var/log/auth.log | sort | uniq -c | sort -nr", desc: "Count and rank top remote IP addresses in logs." }
];

function generateCheatSheetHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.5rem;">
        <h2 style="color:var(--accent-blue); font-size:1.6rem; margin-bottom:0.4rem;">📑 1-Click Interactive Linux SOC Command Cheat Sheet</h2>
        <p style="color:var(--text-dark); font-size:0.9rem;">
          Essential Linux commands for Blue Teaming, Forensic Triage, & Log Analysis. Click 📋 Copy to use instantly!
        </p>
      </div>

      <div class="cheatsheet-grid">
        ${CHEAT_SHEET_COMMANDS.map(c => `
          <div class="cmd-card">
            <button class="btn-copy-cmd" onclick="copyCmdToClipboard('${escapeHTML(c.cmd)}')">📋 Copy</button>
            <div style="font-size:0.75rem; font-weight:700; color:var(--accent-blue); text-transform:uppercase; margin-bottom:0.3rem;">${c.cat}</div>
            <div style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--accent-red); margin-bottom:0.4rem; padding-right:3rem;">
              ${escapeHTML(c.cmd)}
            </div>
            <div style="font-size:0.8rem; color:#64748b;">${c.desc}</div>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

function copyCmdToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Copied command to clipboard:\n${text}`);
  }).catch(() => {
    alert(`Command: ${text}`);
  });
}


// --- 4. INCIDENT RESPONSE SCENARIO LABS ---
const INCIDENT_LABS = [
  {
    id: "lab1",
    title: "Lab 1: Rogue Cryptominer Process Triage",
    desc: "A CPU usage alert spiked to 99%. Analyst notices a process running under /tmp/.miner.py.",
    question: "Which Linux command should you run to verify the executable binary location of PID 8812?",
    options: [
      "ls -la /proc/8812/exe",
      "cat /etc/passwd",
      "uname -a",
      "chmod 777 /tmp"
    ],
    answer: 0,
    explanation: "Correct! /proc/<PID>/exe points to the exact file executable path on Linux."
  },
  {
    id: "lab2",
    title: "Lab 2: Unauthorized SSH Key Injection",
    desc: "An attacker gained access and injected a persistent SSH public key for persistence.",
    question: "In which file would an attacker add their public key for passwordless SSH access?",
    options: [
      "/var/log/auth.log",
      "~/.ssh/authorized_keys",
      "/etc/sudoers",
      "/tmp/key.txt"
    ],
    answer: 1,
    explanation: "Correct! ~/.ssh/authorized_keys stores trusted public keys for SSH authentication."
  }
];

function generateIncidentLabsHTML() {
  return `
    <article class="hardening-wrapper">
      <div style="text-align:center; margin-bottom:1.5rem;">
        <h2 style="color:var(--accent-blue); font-size:1.6rem; margin-bottom:0.4rem;">🎯 Interactive Linux SOC Incident Response Labs</h2>
        <p style="color:var(--text-dark); font-size:0.9rem;">
          Test your real-world triage skills across actual Blue Team incident scenarios!
        </p>
      </div>

      ${INCIDENT_LABS.map(lab => `
        <div class="lab-card">
          <h3 style="color:var(--accent-blue); font-size:1.15rem; margin-bottom:0.4rem;">${lab.title}</h3>
          <p style="color:var(--text-dark); font-size:0.88rem; margin-bottom:0.8rem;">${lab.desc}</p>
          <div style="font-weight:700; font-size:0.92rem; color:var(--text-ink); margin-bottom:0.8rem;">❓ ${lab.question}</div>
          
          <div id="opts-${lab.id}">
            ${lab.options.map((opt, i) => `
              <button class="quiz-option-btn" onclick="checkLabAnswer('${lab.id}', ${i}, ${lab.answer}, '${escapeHTML(lab.explanation)}')">
                ${String.fromCharCode(65 + i)}) ${escapeHTML(opt)}
              </button>
            `).join('')}
          </div>

          <div id="feedback-${lab.id}" style="display:none; margin-top:0.8rem; padding:0.8rem; border-radius:8px; font-weight:700; font-size:0.88rem;"></div>
        </div>
      `).join('')}
    </article>
  `;
}

function checkLabAnswer(labId, selectedOpt, correctOpt, explanation) {
  const feedbackDiv = document.getElementById(`feedback-${labId}`);
  const optsContainer = document.getElementById(`opts-${labId}`);

  if (optsContainer) {
    const btns = optsContainer.getElementsByTagName("button");
    for (let i = 0; i < btns.length; i++) {
      if (i === correctOpt) {
        btns[i].className = "quiz-option-btn correct";
      } else if (i === selectedOpt) {
        btns[i].className = "quiz-option-btn wrong";
      }
    }
  }

  if (feedbackDiv) {
    feedbackDiv.style.display = "block";
    if (selectedOpt === correctOpt) {
      feedbackDiv.style.background = "rgba(74, 222, 128, 0.2)";
      feedbackDiv.style.color = "#166534";
      feedbackDiv.innerHTML = `🎉 Correct! ${explanation}`;
    } else {
      feedbackDiv.style.background = "rgba(248, 113, 113, 0.2)";
      feedbackDiv.style.color = "#991b1b";
      feedbackDiv.innerHTML = `❌ Incorrect. Try reviewing the correct answer highlighted above!`;
    }
  }
}
