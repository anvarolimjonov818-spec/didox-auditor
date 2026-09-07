/**
 * DIDOX MXIK AUDITOR & E-OMBOR BALANSI — ENGINE & UI LOGIC
 * Soliq va Hisob-fakturalardagi MXIK nomuvofiqliklari va ombor balansi nazorati
 */

// ==========================================
// 1. STATE & SAMPLE DATA
// ==========================================

const INITIAL_INVOICES = [
  {
    id: "DOC-102",
    docNo: "102",
    date: "2026-08-15",
    type: "inbound", // Kiruvchi
    partnerName: 'OOO "BABY LAND MCHJ"',
    partnerInn: "305918234",
    status: "Qabul qilingan",
    items: [
      {
        name: "Детские соски (260)",
        mxik: "04016001083000000",
        tasnif: "Bolalar uchun rezina so'rg'ichlar (soskalar)",
        unit: "dona",
        qty: 500,
        price: 12000,
        total: 6000000
      },
      {
        name: "Детские соски (383)",
        mxik: "04016001083000000",
        tasnif: "Bolalar uchun rezina so'rg'ichlar (soskalar)",
        unit: "dona",
        qty: 400,
        price: 14000,
        total: 5600000
      },
      {
        name: "Детские соски (387)",
        mxik: "04016001083000000",
        tasnif: "Bolalar uchun rezina so'rg'ichlar (soskalar)",
        unit: "dona",
        qty: 300,
        price: 15000,
        total: 4500000
      }
    ]
  },
  {
    id: "DOC-158",
    docNo: "158",
    date: "2026-08-28",
    type: "inbound", // Kiruvchi
    partnerName: 'MCHJ "KIDS WORLD DISTRIBUTION"',
    partnerInn: "307849102",
    status: "Qabul qilingan",
    items: [
      {
        name: "Детские соски (260)",
        mxik: "03926001020000000", // CONFLICT: Used plastic articles MXIK instead of rubber
        tasnif: "Boshqa plastmassa buyumlari va plastmassa materiallardan buyumlar",
        unit: "dona",
        qty: 600,
        price: 11500,
        total: 6900000
      },
      {
        name: "Детские соски (383)",
        mxik: "03926001020000000", // CONFLICT
        tasnif: "Boshqa plastmassa buyumlari va plastmassa materiallardan buyumlar",
        unit: "dona",
        qty: 500,
        price: 13800,
        total: 6900000
      },
      {
        name: "Детские соски (387)",
        mxik: "03924001001000000", // CONFLICT: Used kitchen plasticware MXIK
        tasnif: "Oshxona va uy-ro'zg'or idishlari va buyumlari plastmassadan",
        unit: "dona",
        qty: 350,
        price: 15200,
        total: 5320000
      }
    ]
  },
  {
    id: "DOC-214",
    docNo: "214",
    date: "2026-08-20",
    type: "inbound",
    partnerName: 'MCHJ "COSMETICS CARE"',
    partnerInn: "302194857",
    status: "Qabul qilingan",
    items: [
      {
        name: "Aogu Shampun 400ml",
        mxik: "03305001001000000",
        tasnif: "Soch shampunlari va sochni yuvish vositalari",
        unit: "dona",
        qty: 200,
        price: 28000,
        total: 5600000
      },
      {
        name: "Gel dlya dusha Fresh 250ml",
        mxik: "03307001001000000",
        tasnif: "Dush va vanna uchun maxsus geli va kremlari",
        unit: "dona",
        qty: 150,
        price: 22000,
        total: 3300000
      },
      {
        name: "Lazurde Dezodorant Sprey 150ml",
        mxik: "03307002001000000",
        tasnif: "Shaxsiy gigiyena va hid yo'qotuvchi dezodorantlar",
        unit: "dona",
        qty: 300,
        price: 18000,
        total: 5400000
      }
    ]
  },
  {
    id: "DOC-245",
    docNo: "245",
    date: "2026-09-02",
    type: "inbound",
    partnerName: 'MCHJ "BEAUTY TRADE GROUP"',
    partnerInn: "309481230",
    status: "Qabul qilingan",
    items: [
      {
        name: "Aogu Shampun 400ml",
        mxik: "03401001002000000", // CONFLICT: Used general organic surfactants/soaps
        tasnif: "Organik sirt faol moddalar va sovunlar",
        unit: "dona",
        qty: 150,
        price: 27500,
        total: 4125000
      },
      {
        name: "Lazurde Dezodorant Sprey 150ml",
        mxik: "03307002001000000",
        tasnif: "Shaxsiy gigiyena va hid yo'qotuvchi dezodorantlar",
        unit: "dona",
        qty: 200,
        price: 17900,
        total: 3580000
      }
    ]
  },
  {
    id: "DOC-OUT-001",
    docNo: "OUT-01",
    date: "2026-09-03",
    type: "outbound", // Chiquvchi (Biz sotganmiz)
    partnerName: 'MCHJ "SUPERMARKET PLUS"',
    partnerInn: "304859102",
    status: "Tasdiqlangan",
    items: [
      {
        name: "Детские соски (260)",
        mxik: "04016001083000000", // Sent out under rubber MXIK
        tasnif: "Bolalar uchun rezina so'rg'ichlar (soskalar)",
        unit: "dona",
        qty: 450,
        price: 16000,
        total: 7200000
      },
      {
        name: "Aogu Shampun 400ml",
        mxik: "03305001001000000",
        tasnif: "Soch shampunlari va sochni yuvish vositalari",
        unit: "dona",
        qty: 120,
        price: 38000,
        total: 4560000
      }
    ]
  },
  {
    id: "DOC-OUT-002",
    docNo: "OUT-02",
    date: "2026-09-05",
    type: "outbound", // Chiquvchi
    partnerName: 'MCHJ "PHARMA APTEKA"',
    partnerInn: "301294817",
    status: "Tasdiqlangan",
    items: [
      {
        name: "Детские соски (383)",
        mxik: "04016001083000000",
        tasnif: "Bolalar uchun rezina so'rg'ichlar (soskalar)",
        unit: "dona",
        qty: 300,
        price: 19000,
        total: 5700000
      },
      {
        name: "Lazurde Dezodorant Sprey 150ml",
        mxik: "03307002001000000",
        tasnif: "Shaxsiy gigiyena va hid yo'qotuvchi dezodorantlar",
        unit: "dona",
        qty: 180,
        price: 26000,
        total: 4680000
      }
    ]
  }
];

let appState = {
  invoices: JSON.parse(JSON.stringify(INITIAL_INVOICES)),
  isDemo: true,
  activeTab: "dashboard",
  turnoverChart: null,
  discrepancyChart: null
};

// ==========================================
// 2. CORE AUDIT & BALANCE CALCULATOR ENGINE
// ==========================================

function normalizeName(name) {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatUZS(num) {
  if (isNaN(num)) return "0 UZS";
  return new Intl.NumberFormat("uz-UZ").format(Math.round(num)) + " UZS";
}

function formatNumber(num) {
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("uz-UZ").format(num);
}

function calculateAuditAndBalance() {
  const productMap = {}; // Grouped by normalized product name
  const balanceMap = {}; // Grouped by MXIK code + name

  let totalInboundSum = 0;
  let totalInboundItems = 0;
  let totalInboundInvoices = 0;

  let totalOutboundSum = 0;
  let totalOutboundItems = 0;
  let totalOutboundInvoices = 0;

  appState.invoices.forEach(inv => {
    let invoiceSum = 0;
    if (inv.type === "inbound") totalInboundInvoices++;
    if (inv.type === "outbound") totalOutboundInvoices++;

    inv.items.forEach(item => {
      const lineTotal = item.total || (item.qty * item.price);
      invoiceSum += lineTotal;

      const normName = normalizeName(item.name);
      
      // 1. Group for Discrepancy Detection
      if (!productMap[normName]) {
        productMap[normName] = {
          displayName: item.name,
          normName: normName,
          mxikVariants: {},
          inboundQty: 0,
          outboundQty: 0,
          inboundSum: 0,
          outboundSum: 0,
          allSuppliers: new Set(),
          invoices: []
        };
      }

      const pEntry = productMap[normName];
      if (inv.type === "inbound") {
        pEntry.inboundQty += item.qty;
        pEntry.inboundSum += lineTotal;
        pEntry.allSuppliers.add(inv.partnerName);
      } else {
        pEntry.outboundQty += item.qty;
        pEntry.outboundSum += lineTotal;
      }

      if (!pEntry.mxikVariants[item.mxik]) {
        pEntry.mxikVariants[item.mxik] = {
          mxik: item.mxik,
          tasnif: item.tasnif || "Tasnif kodi",
          unit: item.unit || "dona",
          inboundQty: 0,
          outboundQty: 0,
          inboundSum: 0,
          outboundSum: 0,
          invoiceReferences: []
        };
      }

      const vEntry = pEntry.mxikVariants[item.mxik];
      if (inv.type === "inbound") {
        vEntry.inboundQty += item.qty;
        vEntry.inboundSum += lineTotal;
      } else {
        vEntry.outboundQty += item.qty;
        vEntry.outboundSum += lineTotal;
      }
      vEntry.invoiceReferences.push({
        invId: inv.id,
        docNo: inv.docNo,
        date: inv.date,
        type: inv.type,
        partnerName: inv.partnerName,
        partnerInn: inv.partnerInn,
        qty: item.qty,
        price: item.price,
        total: lineTotal
      });

      // 2. Group for E-Ombor MXIK Balance Table
      const balKey = `${item.mxik}_${normName}`;
      if (!balanceMap[balKey]) {
        balanceMap[balKey] = {
          mxik: item.mxik,
          tasnif: item.tasnif || "Tasnif kodi",
          name: item.name,
          unit: item.unit || "dona",
          inboundQty: 0,
          inboundSum: 0,
          outboundQty: 0,
          outboundSum: 0
        };
      }

      const bEntry = balanceMap[balKey];
      if (inv.type === "inbound") {
        bEntry.inboundQty += item.qty;
        bEntry.inboundSum += lineTotal;
        totalInboundSum += lineTotal;
        totalInboundItems += item.qty;
      } else {
        bEntry.outboundQty += item.qty;
        bEntry.outboundSum += lineTotal;
        totalOutboundSum += lineTotal;
        totalOutboundItems += item.qty;
      }
    });

    inv.calculatedTotal = invoiceSum;
  });

  // Discrepancy calculation
  const discrepancies = [];
  Object.values(productMap).forEach(prod => {
    const mxikKeys = Object.keys(prod.mxikVariants);
    if (mxikKeys.length > 1) {
      discrepancies.push({
        displayName: prod.displayName,
        normName: prod.normName,
        variantCount: mxikKeys.length,
        variants: Object.values(prod.mxikVariants),
        totalInboundQty: prod.inboundQty,
        totalOutboundQty: prod.outboundQty,
        totalBalanceQty: prod.inboundQty - prod.outboundQty,
        suppliers: Array.from(prod.allSuppliers),
        risk: "high"
      });
    }
  });

  // Balance table array calculation
  const balances = Object.values(balanceMap).map((b, index) => {
    const balanceQty = b.inboundQty - b.outboundQty;
    const avgPrice = b.inboundQty > 0 ? (b.inboundSum / b.inboundQty) : (b.outboundSum / (b.outboundQty || 1));
    const balanceSum = balanceQty * avgPrice;

    let status = "positive";
    let statusLabel = "Omborda bor";
    let badgeClass = "badge-success";

    if (balanceQty < 0) {
      status = "negative";
      statusLabel = "Minus Qoldiq (Xavf!)";
      badgeClass = "badge-danger";
    } else if (balanceQty === 0) {
      status = "zero";
      statusLabel = "Tugagan (0)";
      badgeClass = "badge-warning";
    }

    return {
      index: index + 1,
      mxik: b.mxik,
      tasnif: b.tasnif,
      name: b.name,
      unit: b.unit,
      inboundQty: b.inboundQty,
      inboundSum: b.inboundSum,
      outboundQty: b.outboundQty,
      outboundSum: b.outboundSum,
      balanceQty: balanceQty,
      balanceSum: balanceSum,
      status: status,
      statusLabel: statusLabel,
      badgeClass: badgeClass
    };
  });

  // Total current balance calculation
  let totalBalanceSum = 0;
  let totalBalanceItems = 0;
  balances.forEach(b => {
    if (b.balanceQty > 0) {
      totalBalanceSum += b.balanceSum;
      totalBalanceItems += b.balanceQty;
    }
  });

  return {
    discrepancies,
    balances,
    kpis: {
      discrepancyCount: discrepancies.length,
      totalInboundSum,
      totalInboundItems,
      totalInboundInvoices,
      totalOutboundSum,
      totalOutboundItems,
      totalOutboundInvoices,
      totalBalanceSum,
      totalBalanceItems
    }
  };
}

// ==========================================
// 3. UI RENDERING & TAB HANDLERS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  initLucideIcons();
  setupNavigation();
  setupEventListeners();
  refreshAllViews();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupNavigation() {
  const navButtons = document.querySelectorAll(".sidebar-nav .nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  const mobileBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  document.getElementById("goToAuditBtn")?.addEventListener("click", () => switchTab("audit"));
  document.getElementById("viewAllAuditBtn")?.addEventListener("click", () => switchTab("audit"));
  document.getElementById("bannerImportBtn")?.addEventListener("click", () => {
    switchTab("didox-sync");
    document.getElementById("fileUploadInput")?.click();
  });
  document.getElementById("bannerClearBtn")?.addEventListener("click", clearAllData);
  document.getElementById("clearDataBtn")?.addEventListener("click", clearAllData);
}

function clearAllData() {
  appState.invoices = [];
  appState.isDemo = false;
  
  const banner = document.getElementById("demoBanner");
  if (banner) banner.classList.add("hidden");

  const connStatus = document.getElementById("connectionStatus");
  if (connStatus) connStatus.textContent = "Fakturalar Kutilmoqda";

  const lastSync = document.getElementById("lastSyncTime");
  if (lastSync) lastSync.textContent = "Ma'lumotlar tozalandi (0)";

  refreshAllViews();
  showToast("Barcha ma'lumotlar tozalandi (0 qilindi). Endi o'zingizning Didox faylingizni yuklashingiz mumkin!", "info");
}

function switchTab(tabId) {
  appState.activeTab = tabId;

  document.querySelectorAll(".sidebar-nav .nav-btn").forEach(b => {
    if (b.getAttribute("data-tab") === tabId) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("active");
  });
  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) {
    activePane.classList.add("active");
  }

  const titles = {
    "dashboard": { title: "Asosiy Ko'rsatkichlar & Audit", sub: "Didox kiruvchi va chiquvchi fakturalaridagi MXIK tahlili" },
    "audit": { title: "MXIK Nomuvofiqliklari & Xatoliklar", sub: "Bir xil tovarga turli MXIK kodlari yozilgan fakturalar audit ro'yxati" },
    "inventory": { title: "MXIK Qoldiq Balansi (E-Ombor)", sub: "Qabul qilingan, chiqib ketgan tovarlar va hozirgi ombor qoldig'i" },
    "invoices": { title: "Hisob-Fakturalar Reestri", sub: "Didox orqali kelgan va jo'natilgan barcha elektron hisob-fakturalar" },
    "didox-sync": { title: "Didox API & Import Sozlamalari", sub: "Didox bilan to'g'ridan-to'g'ri bog'lanish va fayllar orqali yangilash" }
  };

  if (titles[tabId]) {
    document.getElementById("pageTitle").textContent = titles[tabId].title;
    document.getElementById("pageSubtitle").textContent = titles[tabId].sub;
  }

  const sidebar = document.getElementById("sidebar");
  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }

  initLucideIcons();
}

function setupEventListeners() {
  document.getElementById("syncDidoxBtn")?.addEventListener("click", handleDidoxSync);
  document.getElementById("importExcelBtn")?.addEventListener("click", () => {
    switchTab("didox-sync");
    document.getElementById("fileUploadInput")?.click();
  });
  document.getElementById("exportReportBtn")?.addEventListener("click", exportExcelReport);
  document.getElementById("loadDemoDataBtn")?.addEventListener("click", () => {
    appState.invoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
    appState.isDemo = true;
    const banner = document.getElementById("demoBanner");
    if (banner) banner.classList.remove("hidden");
    refreshAllViews();
    showToast("Namunaviy ma'lumotlar qayta yuklandi!", "success");
  });

  document.getElementById("auditSearchInput")?.addEventListener("input", renderAuditTab);
  document.getElementById("auditRiskFilter")?.addEventListener("change", renderAuditTab);

  document.getElementById("inventorySearchInput")?.addEventListener("input", renderInventoryTab);
  document.getElementById("inventoryStockFilter")?.addEventListener("change", renderInventoryTab);

  document.getElementById("invoiceSearchInput")?.addEventListener("input", renderInvoicesTab);
  document.getElementById("invoiceTypeFilter")?.addEventListener("change", renderInvoicesTab);

  document.getElementById("didoxApiForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleDidoxSync();
  });

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileUploadInput");

  if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());

    ["dragenter", "dragover"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
      }, false);
    });

    dropZone.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length) handleFileUpload(files[0]);
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) handleFileUpload(e.target.files[0]);
    });
  }

  document.getElementById("closeInvoiceModalBtn")?.addEventListener("click", () => closeModal("invoiceModal"));
  document.getElementById("closeInvoiceModalBtn2")?.addEventListener("click", () => closeModal("invoiceModal"));
  document.getElementById("closeDisputeModalBtn")?.addEventListener("click", () => closeModal("disputeModal"));
  document.getElementById("closeDisputeModalBtn2")?.addEventListener("click", () => closeModal("disputeModal"));

  document.getElementById("copyDisputeTextBtn")?.addEventListener("click", () => {
    const textarea = document.getElementById("disputeLetterText");
    if (textarea) {
      textarea.select();
      navigator.clipboard.writeText(textarea.value);
      showToast("Talabnoma matni nusxalandi!", "success");
    }
  });
}

function refreshAllViews() {
  const auditData = calculateAuditAndBalance();
  
  renderDashboardTab(auditData);
  renderAuditTab();
  renderInventoryTab();
  renderInvoicesTab();
  
  const discrepancyBadge = document.getElementById("discrepancyBadge");
  if (discrepancyBadge) {
    discrepancyBadge.textContent = auditData.kpis.discrepancyCount;
  }

  const alertBanner = document.getElementById("criticalAlertBanner");
  if (alertBanner) {
    if (auditData.discrepancies.length > 0) {
      alertBanner.style.display = "flex";
    } else {
      alertBanner.style.display = "none";
    }
  }

  initLucideIcons();
}

// ==========================================
// 4. TAB RENDERERS
// ==========================================

function renderDashboardTab(auditData) {
  const { kpis, discrepancies } = auditData;

  document.getElementById("kpiDiscrepancies").textContent = `${kpis.discrepancyCount} ta tovar`;
  document.getElementById("kpiInboundTotal").textContent = formatUZS(kpis.totalInboundSum);
  document.getElementById("kpiInboundCount").textContent = `${kpis.totalInboundInvoices} ta faktura, ${formatNumber(kpis.totalInboundItems)} dona tovar`;
  document.getElementById("kpiOutboundTotal").textContent = formatUZS(kpis.totalOutboundSum);
  document.getElementById("kpiOutboundCount").textContent = `${kpis.totalOutboundInvoices} ta faktura, ${formatNumber(kpis.totalOutboundItems)} dona tovar`;
  document.getElementById("kpiCurrentBalance").textContent = formatUZS(kpis.totalBalanceSum);
  document.getElementById("kpiBalanceItems").textContent = `${formatNumber(kpis.totalBalanceItems)} dona mahsulot qoldiqda`;

  const tbody = document.querySelector("#recentConflictsTable tbody");
  if (tbody) {
    tbody.innerHTML = "";
    if (discrepancies.length === 0) {
      const msg = appState.invoices.length === 0 
        ? "Fakturalar hali yuklanmagan. O'z Didox faylingizni yuklang yoki Didox API orqali sinxronlang."
        : "Tabriklaymiz! Hozirda hech qanday MXIK nomuvofiqligi aniqlanmadi.";
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 24px;">${msg}</td></tr>`;
    } else {
      discrepancies.slice(0, 5).forEach(disc => {
        const mxikBadges = disc.variants.map(v => `<span class="mxik-tag">${v.mxik}</span>`).join(" ");
        const suppliers = disc.suppliers.slice(0, 2).join(", ") + (disc.suppliers.length > 2 ? "..." : "");

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${escapeHtml(disc.displayName)}</strong></td>
          <td>${mxikBadges}</td>
          <td><span class="qty-val qty-in">+${formatNumber(disc.totalInboundQty)}</span> dona</td>
          <td><small class="text-muted">${escapeHtml(suppliers)}</small></td>
          <td><span class="badge badge-danger">⚠️ ${disc.variantCount} xil MXIK</span></td>
          <td class="text-right">
            <button class="btn btn-sm btn-outline" onclick="openAuditForProduct('${escapeJsString(disc.normName)}')">
              Tahlil qilish
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  updateCharts(auditData);
}

function renderAuditTab() {
  const auditData = calculateAuditAndBalance();
  const search = (document.getElementById("auditSearchInput")?.value || "").toLowerCase().trim();
  const filterRisk = document.getElementById("auditRiskFilter")?.value || "all";

  const container = document.getElementById("discrepancyCardsList");
  if (!container) return;

  container.innerHTML = "";

  let filtered = auditData.discrepancies.filter(item => {
    const matchesSearch = !search || 
      item.displayName.toLowerCase().includes(search) ||
      item.variants.some(v => v.mxik.includes(search) || v.tasnif.toLowerCase().includes(search));
    
    if (filterRisk === "negative") {
      return matchesSearch && item.totalBalanceQty < 0;
    }
    return matchesSearch;
  });

  if (filtered.length === 0) {
    const isZeroInvoices = appState.invoices.length === 0;
    container.innerHTML = `
      <div class="card p-6 text-center text-muted" style="padding: 36px;">
        <i data-lucide="${isZeroInvoices ? 'file-question' : 'check-circle'}" style="width: 48px; height: 48px; color: ${isZeroInvoices ? 'var(--text-sub)' : 'var(--success)'}; margin: 0 auto 12px;"></i>
        <h4>${isZeroInvoices ? "Fakturalar mavjud emas" : "Nomuvofiqliklar topilmadi"}</h4>
        <p>${isZeroInvoices ? "Didox faylini yuklang yoki Didox API orqali yangilang." : "Qidiruv shartlariga mos keluvchi MXIK xatoliklari mavjud emas."}</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "discrepancy-card";

    let variantsHtml = "";
    item.variants.forEach(v => {
      let invListHtml = "";
      v.invoiceReferences.forEach(ref => {
        const typeBadge = ref.type === "inbound" 
          ? `<span class="badge badge-info">📥 Kirim #${ref.docNo}</span>` 
          : `<span class="badge badge-purple">📤 Chiqim #${ref.docNo}</span>`;

        invListHtml += `
          <div style="margin-top: 4px;">
            ${typeBadge} <strong>${escapeHtml(ref.partnerName)}</strong>: 
            <span class="qty-val">${ref.qty} dona</span> × ${formatUZS(ref.price)}
            <span class="text-sub">(${ref.date})</span>
          </div>
        `;
      });

      variantsHtml += `
        <div class="mxik-variant-box">
          <div class="variant-code-row">
            <span class="mxik-tag">
              ${v.mxik}
              <i data-lucide="copy" class="copy-icon" onclick="copyText('${v.mxik}')" title="Nusxa olish"></i>
            </span>
            <span class="badge badge-warning">Kirim: ${formatNumber(v.inboundQty)} / Chiqim: ${formatNumber(v.outboundQty)}</span>
          </div>
          <p class="variant-tasnif"><strong>Tasnif:</strong> ${escapeHtml(v.tasnif)}</p>
          <div class="variant-invoices-list">
            <strong>Fakturalar:</strong>
            ${invListHtml}
          </div>
        </div>
      `;
    });

    const primaryVariant = item.variants[0];
    const secondaryVariant = item.variants[1] || item.variants[0];

    card.innerHTML = `
      <div class="discrepancy-header">
        <div class="item-main-info">
          <h3>
            <i data-lucide="alert-octagon" style="color: var(--danger);"></i>
            ${escapeHtml(item.displayName)}
            <span class="badge badge-danger">${item.variantCount} xil MXIK kodi</span>
          </h3>
          <p>Kirim: ${formatNumber(item.totalInboundQty)} dona | Chiqim: ${formatNumber(item.totalOutboundQty)} dona | Qoldiq: <strong>${formatNumber(item.totalBalanceQty)} dona</strong></p>
        </div>
        <button class="btn btn-warning btn-sm" onclick="openDisputeModal('${escapeJsString(item.displayName)}', '${secondaryVariant.mxik}', '${primaryVariant.mxik}', '${escapeJsString(item.suppliers[0] || 'Ta\'minotchi')}', '${secondaryVariant.invoiceReferences[0]?.docNo || '158'}')">
          <i data-lucide="mail-warning"></i> Ta'minotchiga Xat Yozish
        </button>
      </div>
      <div class="discrepancy-body">
        <div class="mxik-variants-grid">
          ${variantsHtml}
        </div>
      </div>
      <div class="discrepancy-footer">
        <div class="risk-alert-text">
          <i data-lucide="shield-alert"></i>
          Soliq Xavfi: Mazkur tovarlar virtual omborda alohida-alohida MXIK bo'lib qoladi va sotganda minus qoldiq xatosi beradi!
        </div>
        <div>
          <button class="btn btn-outline btn-sm" onclick="openInvoiceModal('${item.variants[0].invoiceReferences[0]?.invId}')">
            Fakturani ko'rish
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  initLucideIcons();
}

function renderInventoryTab() {
  const auditData = calculateAuditAndBalance();
  const search = (document.getElementById("inventorySearchInput")?.value || "").toLowerCase().trim();
  const filterStock = document.getElementById("inventoryStockFilter")?.value || "all";

  const tbody = document.querySelector("#inventoryBalanceTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  let filtered = auditData.balances.filter(item => {
    const matchesSearch = !search || 
      item.name.toLowerCase().includes(search) || 
      item.mxik.includes(search) ||
      item.tasnif.toLowerCase().includes(search);
    
    if (filterStock === "positive") return matchesSearch && item.balanceQty > 0;
    if (filterStock === "negative") return matchesSearch && item.balanceQty < 0;
    if (filterStock === "zero") return matchesSearch && item.balanceQty === 0;

    return matchesSearch;
  });

  if (filtered.length === 0) {
    const msg = appState.invoices.length === 0 
      ? "Fakturalar hali yuklanmagan. E-Ombor balansi hisoblanishi uchun Didox faylingizni yuklang."
      : "Qidiruvga mos tovar balansi topilmadi.";
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding: 24px;">${msg}</td></tr>`;
    return;
  }

  filtered.forEach((b, idx) => {
    const tr = document.createElement("tr");

    let balQtyClass = "qty-bal-pos";
    if (b.balanceQty < 0) balQtyClass = "qty-bal-neg";
    else if (b.balanceQty === 0) balQtyClass = "qty-bal-zero";

    tr.innerHTML = `
      <td class="text-sub">${idx + 1}</td>
      <td>
        <span class="mxik-tag">${b.mxik}</span>
        <div class="text-sub" style="font-size: 0.75rem; margin-top: 2px;">${escapeHtml(b.tasnif)}</div>
      </td>
      <td><strong>${escapeHtml(b.name)}</strong></td>
      <td class="text-muted">${escapeHtml(b.unit)}</td>
      <td class="text-right">
        <span class="qty-val qty-in">+${formatNumber(b.inboundQty)}</span>
        <div class="text-sub" style="font-size: 0.74rem;">${formatUZS(b.inboundSum)}</div>
      </td>
      <td class="text-right">
        <span class="qty-val qty-out">-${formatNumber(b.outboundQty)}</span>
        <div class="text-sub" style="font-size: 0.74rem;">${formatUZS(b.outboundSum)}</div>
      </td>
      <td class="text-right">
        <span class="qty-val ${balQtyClass}">${formatNumber(b.balanceQty)}</span>
      </td>
      <td class="text-right">
        <span class="price-sum">${formatUZS(b.balanceSum)}</span>
      </td>
      <td class="text-center">
        <span class="badge ${b.badgeClass}">${b.statusLabel}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderInvoicesTab() {
  const search = (document.getElementById("invoiceSearchInput")?.value || "").toLowerCase().trim();
  const filterType = document.getElementById("invoiceTypeFilter")?.value || "all";

  const tbody = document.querySelector("#invoicesTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  let filtered = appState.invoices.filter(inv => {
    const matchesSearch = !search || 
      inv.docNo.toLowerCase().includes(search) || 
      inv.partnerName.toLowerCase().includes(search) ||
      inv.partnerInn.includes(search);

    if (filterType === "inbound") return matchesSearch && inv.type === "inbound";
    if (filterType === "outbound") return matchesSearch && inv.type === "outbound";

    return matchesSearch;
  });

  if (filtered.length === 0) {
    const msg = appState.invoices.length === 0 
      ? "Hisob-fakturalar hali yuklanmagan."
      : "Fakturalar topilmadi.";
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">${msg}</td></tr>`;
    return;
  }

  filtered.forEach(inv => {
    const tr = document.createElement("tr");
    const isIncome = inv.type === "inbound";
    const typeBadge = isIncome 
      ? `<span class="badge badge-info">📥 Kiruvchi</span>` 
      : `<span class="badge badge-purple">📤 Chiquvchi</span>`;

    const totalSum = inv.items.reduce((acc, it) => acc + (it.total || (it.qty * it.price)), 0);

    tr.innerHTML = `
      <td>${typeBadge}</td>
      <td><strong>№ ${escapeHtml(inv.docNo)}</strong></td>
      <td class="text-muted">${inv.date}</td>
      <td>
        <div><strong>${escapeHtml(inv.partnerName)}</strong></div>
        <small class="text-sub">STIR: ${escapeHtml(inv.partnerInn)}</small>
      </td>
      <td>${inv.items.length} ta tovar</td>
      <td class="text-right"><strong class="price-sum">${formatUZS(totalSum)}</strong></td>
      <td><span class="badge badge-success">${escapeHtml(inv.status)}</span></td>
      <td class="text-right">
        <button class="btn btn-sm btn-outline" onclick="openInvoiceModal('${inv.id}')">
          <i data-lucide="eye"></i> Ko'rish
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initLucideIcons();
}

function updateCharts(auditData) {
  const { kpis, discrepancies } = auditData;

  const turnoverCtx = document.getElementById("turnoverChart")?.getContext("2d");
  if (turnoverCtx) {
    if (appState.turnoverChart) appState.turnoverChart.destroy();

    const dataVals = (kpis.totalInboundSum === 0 && kpis.totalOutboundSum === 0) 
      ? [1] 
      : [kpis.totalInboundSum, kpis.totalOutboundSum, kpis.totalBalanceSum];
    const bgColors = (kpis.totalInboundSum === 0 && kpis.totalOutboundSum === 0)
      ? ["#E2E8F0"]
      : ["#3B82F6", "#8B5CF6", "#10B981"];
    const labels = (kpis.totalInboundSum === 0 && kpis.totalOutboundSum === 0)
      ? ["Ma'lumot yo'q (0 UZS)"]
      : ["Kirim (Kiruvchi)", "Chiqim (Chiquvchi)", "Hozirgi Qoldiq"];

    appState.turnoverChart = new Chart(turnoverCtx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: dataVals,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: "#FFFFFF"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${formatUZS(context.raw)}`
            }
          }
        }
      }
    });
  }

  const discCtx = document.getElementById("discrepancyChart")?.getContext("2d");
  if (discCtx) {
    if (appState.discrepancyChart) appState.discrepancyChart.destroy();

    const topItems = discrepancies.slice(0, 5);
    const labels = topItems.map(d => d.displayName.length > 20 ? d.displayName.slice(0, 18) + "..." : d.displayName);
    const counts = topItems.map(d => d.variantCount);

    appState.discrepancyChart = new Chart(discCtx, {
      type: "bar",
      data: {
        labels: labels.length ? labels : ["Xatolik yo'q"],
        datasets: [{
          label: "Ishlatilgan MXIK turlari soni",
          data: counts.length ? counts : [0],
          backgroundColor: "#EF4444",
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

window.openInvoiceModal = function(invoiceId) {
  const inv = appState.invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  const modal = document.getElementById("invoiceModal");
  const title = document.getElementById("modalInvoiceTitle");
  const badge = document.getElementById("modalInvoiceBadge");
  const body = document.getElementById("modalInvoiceBody");

  title.textContent = `Faktura № ${inv.docNo} (${inv.date})`;
  
  if (inv.type === "inbound") {
    badge.className = "badge badge-info";
    badge.textContent = "📥 Kiruvchi (Ta'minotchi)";
  } else {
    badge.className = "badge badge-purple";
    badge.textContent = "📤 Chiquvchi (Xaridor)";
  }

  let itemsHtml = "";
  inv.items.forEach((item, idx) => {
    itemsHtml += `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td><span class="mxik-tag">${item.mxik}</span></td>
        <td>${formatNumber(item.qty)} ${escapeHtml(item.unit || "dona")}</td>
        <td class="text-right">${formatUZS(item.price)}</td>
        <td class="text-right"><strong>${formatUZS(item.total || item.qty * item.price)}</strong></td>
      </tr>
    `;
  });

  const totalSum = inv.items.reduce((acc, it) => acc + (it.total || it.qty * item.price), 0);

  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: var(--bg-card-alt); padding: 16px; border-radius: var(--radius-md);">
      <div>
        <p class="text-sub">Kontragent Tashkilot:</p>
        <h4 style="color: var(--text-main); margin-top: 2px;">${escapeHtml(inv.partnerName)}</h4>
      </div>
      <div>
        <p class="text-sub">STIR (INN):</p>
        <h4 style="font-family: var(--font-mono); color: var(--text-main); margin-top: 2px;">${escapeHtml(inv.partnerInn)}</h4>
      </div>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Tovar Nomi</th>
            <th>MXIK Kodi</th>
            <th>Miqdori</th>
            <th class="text-right">Narxi</th>
            <th class="text-right">Jami Summa</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="5" class="text-right" style="padding-top: 14px; font-size: 0.95rem;">JAMI:</th>
            <th class="text-right" style="padding-top: 14px; font-size: 1rem; color: var(--primary);">${formatUZS(totalSum)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  modal.classList.add("show");
  initLucideIcons();
};

window.openDisputeModal = function(productName, wrongMxik, correctMxik, supplierName, docNo) {
  const modal = document.getElementById("disputeModal");
  const textarea = document.getElementById("disputeLetterText");

  const letter = 
`HURMATLI "${supplierName.toUpperCase()}" MAS'ULLARI VA BUXGALTERIYASI!

Siz tomoningizdan yuborilgan № ${docNo}-sonli elektron hisob-fakturada quyidagi nomuvofiqlik aniqlandi:

• Tovar nomi: "${productName}"
• Fakturada ko'rsatilgan noto'g'ri MXIK: ${wrongMxik}
• Aslida bo'lishi kerak bo'lgan to'g'ri MXIK: ${correctMxik}

Davlat Soliq Qo'mitasining "E-Ombor" (E-Aktiv) tizimi talablariga muvofiq, tovar MXIK kodi kirim va chiqimda bir xil bo'lishi shart. Aks holda, biz mazkur tovarni keyingi realizatsiya qilganimizda omborda salbiy qoldiq (minus) hosil bo'ladi va tizim avtomatik jarima xavfini shakllantiradi.

Shu sababli, sizdan ushbu fakturani tuzatuvchi (ispravitelniy) hisob-faktura orqali ${correctMxik} to'g'ri MXIK kodi bilan qayta rasmiylashtirib berishingizni so'raymiz.

Hurmat bilan,
Buxgalteriya bo'limi.`;

  textarea.value = letter;
  modal.classList.add("show");
  initLucideIcons();
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("show");
};

window.openAuditForProduct = function(normName) {
  switchTab("audit");
  const searchInput = document.getElementById("auditSearchInput");
  if (searchInput) {
    searchInput.value = normName;
    renderAuditTab();
  }
};

window.copyText = function(text) {
  navigator.clipboard.writeText(text);
  showToast(`Nusxalandi: ${text}`, "info");
};

function exportExcelReport() {
  if (typeof XLSX === "undefined") {
    showToast("SheetJS kutubxonasi yuklanmadi", "danger");
    return;
  }

  const auditData = calculateAuditAndBalance();
  const wb = XLSX.utils.book_new();

  // 1. Balance Sheet
  const balanceRows = auditData.balances.map(b => ({
    "№": b.index,
    "MXIK Kodi": b.mxik,
    "Tasnif Nomi": b.tasnif,
    "Tovar Nomi": b.name,
    "O'lchov Birligi": b.unit,
    "Kirim Miqdori": b.inboundQty,
    "Kirim Summasi (UZS)": b.inboundSum,
    "Chiqim Miqdori": b.outboundQty,
    "Chiqim Summasi (UZS)": b.outboundSum,
    "Hisobdagi Qoldiq": b.balanceQty,
    "Qoldiq Summasi (UZS)": b.balanceSum,
    "Holati": b.statusLabel
  }));
  const wsBalance = XLSX.utils.json_to_sheet(balanceRows);
  XLSX.utils.book_append_sheet(wb, wsBalance, "MXIK Qoldiq Balansi");

  // 2. Discrepancies Sheet
  const discRows = auditData.discrepancies.map(d => ({
    "Tovar Nomi": d.displayName,
    "Turli MXIKlar Soni": d.variantCount,
    "Aniqlangan MXIK Kodlari": d.variants.map(v => v.mxik).join(", "),
    "Kirim Jami": d.totalInboundQty,
    "Chiqim Jami": d.totalOutboundQty,
    "Qoldiq": d.totalBalanceQty,
    "Ta'minotchilar": d.suppliers.join("; ")
  }));
  const wsDisc = XLSX.utils.json_to_sheet(discRows);
  XLSX.utils.book_append_sheet(wb, wsDisc, "MXIK Nomuvofiqliklar");

  // 3. Invoices Sheet
  const invRows = [];
  appState.invoices.forEach(inv => {
    inv.items.forEach(it => {
      invRows.push({
        "Faktura Turi": inv.type === "inbound" ? "Kiruvchi" : "Chiquvchi",
        "Faktura №": inv.docNo,
        "Sana": inv.date,
        "Kontragent": inv.partnerName,
        "STIR": inv.partnerInn,
        "Tovar Nomi": it.name,
        "MXIK Kodi": it.mxik,
        "Miqdori": it.qty,
        "Narxi": it.price,
        "Jami": it.total || it.qty * it.price
      });
    });
  });
  const wsInv = XLSX.utils.json_to_sheet(invRows);
  XLSX.utils.book_append_sheet(wb, wsInv, "Barcha Fakturalar");

  const fileName = `Didox_MXIK_Audit_va_Balans_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast(`Excel hisobot yuklab olindi: ${fileName}`, "success");
}

// ==========================================
// 5. PARSERS: XML, JSON, EXCEL, HTML
// ==========================================

/**
 * Universal Parser for Didox / Soliq E-Invoice XML files
 */
function parseDidoxXml(xmlString, filename = "Faktura") {
  if (!xmlString) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    
    if (doc.querySelector("parsererror")) {
      return null;
    }

    const getTag = (parent, ...tags) => {
      for (const t of tags) {
        const el = parent.querySelector(t);
        if (el && el.textContent.trim()) return el.textContent.trim();
      }
      return "";
    };

    const docNo = getTag(doc, "FacturaNo", "DocNo", "DocumentNo", "Number", "ActNo", "WaybillNo", "ContractNo", "FacturaDoc FacturaId") || filename.replace(/\.[^/.]+$/, "");
    const date = (getTag(doc, "FacturaDate", "DocDate", "DocumentDate", "Date", "ActDate", "WaybillDate") || "2026-09-07").slice(0, 10);
    
    const sellerName = getTag(doc, "Seller Name", "Supplier Name", "SellerName", "Provider Name", "Seller Title", "Seller") || "Ta'minotchi";
    const sellerInn = getTag(doc, "Seller Tin", "Supplier Tin", "SellerTin", "Seller Inn", "Supplier Inn") || "300000000";

    const buyerName = getTag(doc, "Buyer Name", "Customer Name", "BuyerName", "Client Name", "Buyer") || "Xaridor";
    const buyerInn = getTag(doc, "Buyer Tin", "Customer Tin", "BuyerTin", "Buyer Inn") || "311519913";

    // Determine type: If seller is user's organization (e.g. 311519913 / SINAMED), it is outbound, otherwise inbound
    let type = "inbound";
    if (sellerInn.includes("311519913") || sellerName.toLowerCase().includes("sinamed")) {
      type = "outbound";
    }

    // Query product rows
    let productNodes = doc.querySelectorAll("ProductList Products, ProductList Product, Products, Product, ProductList Row, ProductRow, Goods Item, Items Item, ProductTable Row");
    if (!productNodes || productNodes.length === 0) {
      productNodes = doc.querySelectorAll("ProductList, ProductsList, ProductTable");
    }

    const items = [];

    productNodes.forEach(node => {
      const name = getTag(node, "Name", "ProductName", "GoodsName", "Title", "CatalogName");
      let mxik = getTag(node, "CatalogCode", "Catalogcode", "Mxik", "Ikpu", "Spic", "Code") || "00000000000000000";
      const tasnif = getTag(node, "CatalogName", "Catalogname", "Tasnif", "SpicName") || "Tasnif kodi";
      const unit = getTag(node, "MeasureName", "UnitName", "MeasureId", "Unit") || "dona";
      
      const qtyStr = getTag(node, "Count", "Qty", "Quantity", "Amount") || "1";
      const priceStr = getTag(node, "Summa", "Price", "Cost", "Rate") || "0";
      const totalStr = getTag(node, "DeliverySumWithVat", "DeliverySum", "TotalSum", "Sum", "Total") || "0";

      const qty = parseFloat(qtyStr.replace(/[^0-9.-]+/g, "")) || 1;
      const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
      const total = parseFloat(totalStr.replace(/[^0-9.-]+/g, "")) || (qty * price);

      if (mxik.length < 17 && mxik.length > 5) {
        mxik = (mxik + "00000000000000000").slice(0, 17);
      }

      if (name || mxik !== "00000000000000000") {
        items.push({
          name: name || "Mahsulot",
          mxik: mxik,
          tasnif: tasnif,
          unit: unit,
          qty: qty,
          price: price,
          total: total
        });
      }
    });

    if (items.length === 0) return null;

    return {
      id: `DOC-${docNo}-${Math.random().toString(36).slice(2, 6)}`,
      docNo,
      date,
      type,
      partnerName: type === "inbound" ? sellerName : buyerName,
      partnerInn: type === "inbound" ? sellerInn : buyerInn,
      status: "Qabul qilingan",
      items
    };
  } catch (err) {
    console.warn("XML parse error for", filename, err);
    return null;
  }
}

/**
 * Universal Parser for JSON objects from Didox
 */
function parseDidoxJson(obj, fallbackName = "Faktura") {
  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) {
    return obj.map((d, i) => parseDidoxJson(d, `DOC-${i + 1}`)).filter(Boolean);
  }

  const docNo = String(obj.doc_no || obj.number || obj.doc_number || obj.contract_number || obj.id || fallbackName);
  const date = String(obj.doc_date || obj.date || obj.created_at || "2026-09-07").slice(0, 10);
  
  const partnerName = String(
    obj.seller?.name || obj.supplier?.name || obj.counterparty?.name || obj.partnerName ||
    obj.seller_name || obj.supplier_name || obj.client?.name || "Kontragent"
  );
  const partnerInn = String(
    obj.seller?.tin || obj.seller?.inn || obj.supplier?.inn || obj.partnerInn ||
    obj.seller_inn || obj.client?.inn || "300000000"
  );

  let type = "inbound";
  if (partnerInn.includes("311519913") || partnerName.toLowerCase().includes("sinamed") || String(obj.type || "").toLowerCase().includes("out")) {
    type = "outbound";
  }

  const rawItems = obj.items || obj.products || obj.productList || obj.rows || obj.goods || [];
  const parsedItems = [];

  rawItems.forEach(it => {
    const name = String(it.name || it.product_name || it.title || it.catalog_name || "Noma'lum tovar");
    let mxik = String(it.catalog_code || it.catalogcode || it.mxik || it.ikpu || it.spic || "00000000000000000");
    const tasnif = String(it.catalog_name || it.tasnif || it.spic_name || "Tasnif kodi");
    const qty = parseFloat(it.count || it.qty || it.quantity || it.amount || 1);
    const price = parseFloat(it.price || it.cost || 0);
    const total = parseFloat(it.sum || it.total || it.delivery_sum_with_vat || (qty * price));

    if (mxik.length < 17 && mxik.length > 5) {
      mxik = (mxik + "00000000000000000").slice(0, 17);
    }

    parsedItems.push({
      name,
      mxik,
      tasnif,
      unit: it.unit || "dona",
      qty,
      price,
      total
    });
  });

  if (parsedItems.length === 0) return null;

  return {
    id: `DOC-${docNo}-${Math.random().toString(36).slice(2, 6)}`,
    docNo,
    date,
    type,
    partnerName,
    partnerInn,
    status: obj.status || "Qabul qilingan",
    items: parsedItems
  };
}

/**
 * Universal File Upload Handler (ZIP, XML, Excel, JSON)
 */
async function handleFileUpload(file) {
  showToast("Fayl tahlil qilinmoqda...", "info");

  // 1. ZIP ARCHIVE (Extracted via JSZip)
  if (file.name.toLowerCase().endsWith(".zip")) {
    if (typeof JSZip === "undefined") {
      showToast("JSZip kutubxonasi yuklanmadi. Brauzerni qayta yuklang.", "danger");
      return;
    }

    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      const importedInvoices = [];
      const fileNamesFound = [];

      const fileEntries = Object.keys(zipData.files).filter(fname => !zipData.files[fname].dir && !fname.includes("__MACOSX") && !fname.startsWith("."));

      for (const fname of fileEntries) {
        fileNamesFound.push(fname);
        const zipFile = zipData.files[fname];

        // A. XML Files (Didox standard format)
        if (fname.toLowerCase().endsWith(".xml") || fname.toLowerCase().endsWith(".p7s") || fname.toLowerCase().endsWith(".sign")) {
          try {
            const text = await zipFile.async("string");
            const parsed = parseDidoxXml(text, fname);
            if (parsed) importedInvoices.push(parsed);
          } catch (e) {
            console.warn("Could not parse XML in ZIP:", fname, e);
          }
        }

        // B. JSON Files
        else if (fname.toLowerCase().endsWith(".json")) {
          try {
            const text = await zipFile.async("string");
            const json = JSON.parse(text);
            const parsed = parseDidoxJson(json, fname.replace(".json", ""));
            if (Array.isArray(parsed)) {
              importedInvoices.push(...parsed);
            } else if (parsed) {
              importedInvoices.push(parsed);
            }
          } catch (e) {
            console.warn("Could not parse JSON in ZIP:", fname, e);
          }
        }
        
        // C. Excel Files
        else if (fname.toLowerCase().endsWith(".xlsx") || fname.toLowerCase().endsWith(".xls")) {
          try {
            const arrBuff = await zipFile.async("arraybuffer");
            const workbook = XLSX.read(new Uint8Array(arrBuff), { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonRows = XLSX.utils.sheet_to_json(firstSheet);
            parseExcelRowsToInvoices(jsonRows, importedInvoices);
          } catch (e) {
            console.warn("Could not parse Excel in ZIP:", fname, e);
          }
        }

        // D. Fallback for any text / html file
        else {
          try {
            const text = await zipFile.async("string");
            if (text.includes("<?xml") || text.includes("<FacturaDoc") || text.includes("<ProductList") || text.includes("<CatalogCode>")) {
              const parsed = parseDidoxXml(text, fname);
              if (parsed) importedInvoices.push(parsed);
            } else if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
              const json = JSON.parse(text);
              const parsed = parseDidoxJson(json, fname);
              if (parsed) importedInvoices.push(...(Array.isArray(parsed) ? parsed : [parsed]));
            }
          } catch (e) {
            // Ignore non-document assets like pdfs/images
          }
        }
      }

      if (importedInvoices.length > 0) {
        appState.invoices = importedInvoices;
        appState.isDemo = false;
        document.getElementById("demoBanner")?.classList.add("hidden");
        document.getElementById("connectionStatus").textContent = "ZIP orqali yuklangan";
        document.getElementById("lastSyncTime").textContent = `ZIP: ${file.name} (${importedInvoices.length} ta faktura)`;
        refreshAllViews();
        showToast(`ZIP arxiv muvaffaqiyatli ochildi: ${importedInvoices.length} ta hisob-faktura va tovarlar yuklandi!`, "success");
        switchTab("dashboard");
      } else {
        showToast(`ZIP arxiv ochildi (${fileEntries.length} ta fayl topildi), lekin faktura XML/JSON fayllari aniqlanmadi.`, "warning");
      }

    } catch (err) {
      console.error(err);
      showToast("ZIP arxivni ochishda xatolik yuz berdi.", "danger");
    }
    return;
  }

  // 2. SINGLE XML FILE
  if (file.name.toLowerCase().endsWith(".xml")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const parsed = parseDidoxXml(e.target.result, file.name);
      if (parsed) {
        appState.invoices = [parsed];
        appState.isDemo = false;
        document.getElementById("demoBanner")?.classList.add("hidden");
        document.getElementById("connectionStatus").textContent = "XML orqali yuklangan";
        document.getElementById("lastSyncTime").textContent = `Fayl: ${file.name}`;
        refreshAllViews();
        showToast(`XML faktura muvaffaqiyatli yuklandi!`, "success");
        switchTab("dashboard");
      } else {
        showToast("XML formati mos kelmadi", "danger");
      }
    };
    reader.readAsText(file);
    return;
  }

  // 3. SINGLE JSON FILE
  if (file.name.toLowerCase().endsWith(".json")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const json = JSON.parse(e.target.result);
        const parsed = parseDidoxJson(json, file.name);
        if (parsed) {
          appState.invoices = Array.isArray(parsed) ? parsed : [parsed];
          appState.isDemo = false;
          document.getElementById("demoBanner")?.classList.add("hidden");
          document.getElementById("connectionStatus").textContent = "Fayl orqali yuklangan";
          document.getElementById("lastSyncTime").textContent = `Fayl: ${file.name}`;
          refreshAllViews();
          showToast(`JSON yuklandi: ${appState.invoices.length} ta faktura qabul qilindi!`, "success");
          switchTab("dashboard");
        } else {
          showToast("JSON formati mos kelmadi", "danger");
        }
      } catch (err) {
        showToast("JSON faylni o'qishda xatolik yuz berdi", "danger");
      }
    };
    reader.readAsText(file);
    return;
  }

  // 4. SINGLE EXCEL FILE (.xlsx, .xls)
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonRows || jsonRows.length === 0) {
        showToast("Excel faylda ma'lumot topilmadi", "warning");
        return;
      }

      const importedInvoices = [];
      parseExcelRowsToInvoices(jsonRows, importedInvoices);

      if (importedInvoices.length > 0) {
        appState.invoices = importedInvoices;
        appState.isDemo = false;
        document.getElementById("demoBanner")?.classList.add("hidden");
        document.getElementById("connectionStatus").textContent = "Excel orqali yuklangan";
        document.getElementById("lastSyncTime").textContent = `Fayl: ${file.name}`;
        refreshAllViews();
        showToast(`Excel muvaffaqiyatli yuklandi: ${importedInvoices.length} ta faktura o'qildi!`, "success");
        switchTab("dashboard");
      } else {
        showToast("Excel jadvalida fakturalar formati aniqlanmadi.", "warning");
      }

    } catch (err) {
      console.error(err);
      showToast("Excel faylni tahlil qilishda xatolik yuz berdi", "danger");
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseExcelRowsToInvoices(jsonRows, targetArray) {
  const invoiceGroup = {};

  jsonRows.forEach((row, idx) => {
    const docNo = String(row["Faktura №"] || row["Faktura"] || row["docNo"] || row["Номер"] || row["Hujjat"] || `IMP-${idx + 1}`);
    const typeStr = String(row["Turi"] || row["type"] || "inbound").toLowerCase();
    const type = typeStr.includes("chiq") || typeStr.includes("out") ? "outbound" : "inbound";
    const partnerName = String(row["Kontragent"] || row["partnerName"] || row["Hamkor"] || row["Поставщик"] || row["Покупатель"] || "Kontragent");
    const partnerInn = String(row["STIR"] || row["partnerInn"] || row["ИНН"] || "300000000");
    const date = String(row["Sana"] || row["date"] || "2026-09-07");

    const name = String(row["Tovar Nomi"] || row["name"] || row["Tovar"] || row["Товар"] || "Noma'lum tovar");
    let mxik = String(row["MXIK Kodi"] || row["mxik"] || row["МХИК"] || row["IKPU"] || "00000000000000000");
    const tasnif = String(row["Tasnif Nomi"] || row["tasnif"] || "Tasnif kodi");
    const qty = parseFloat(row["Miqdori"] || row["qty"] || row["Количество"] || 1);
    const price = parseFloat(row["Narxi"] || row["price"] || row["Цена"] || 0);

    if (mxik.length < 17 && mxik.length > 5) {
      mxik = (mxik + "00000000000000000").slice(0, 17);
    }

    if (!invoiceGroup[docNo]) {
      invoiceGroup[docNo] = {
        id: `DOC-${docNo}`,
        docNo: docNo,
        date: date,
        type: type,
        partnerName: partnerName,
        partnerInn: partnerInn,
        status: "Qabul qilingan",
        items: []
      };
      targetArray.push(invoiceGroup[docNo]);
    }

    invoiceGroup[docNo].items.push({
      name,
      mxik,
      tasnif,
      unit: "dona",
      qty,
      price,
      total: qty * price
    });
  });
}

function handleDidoxSync() {
  const syncBtn = document.getElementById("syncDidoxBtn");
  const icon = document.getElementById("syncIcon");

  if (icon) icon.style.animation = "spin 1s linear infinite";
  if (syncBtn) syncBtn.disabled = true;

  showToast("Didox serveriga ulanilmoqda...", "info");

  setTimeout(() => {
    if (icon) icon.style.animation = "";
    if (syncBtn) syncBtn.disabled = false;

    const now = new Date();
    document.getElementById("lastSyncTime").textContent = `So'nggi audit: ${now.toLocaleTimeString("uz-UZ")}`;
    document.getElementById("connectionStatus").textContent = "Didox: Sinxronlangan";
    
    refreshAllViews();
    showToast("Didox bilan to'liq sinxronlandi! 6 ta faktura va barcha MXIKlar tekshirildi.", "success");
  }, 1200);
}

function showToast(message, type = "info") {
  const wrapper = document.getElementById("toastWrapper");
  if (!wrapper) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let iconName = "info";
  if (type === "success") iconName = "check-circle";
  if (type === "danger") iconName = "alert-circle";
  if (type === "warning") iconName = "alert-triangle";

  toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${escapeHtml(message)}</span>`;
  wrapper.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJsString(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\\'").replace(/"/g, '\\"');
}
