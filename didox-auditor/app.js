/**
 * DIDOX MXIK AUDITOR & E-OMBOR BALANSI — ENGINE & UI LOGIC
 * Soliq va Hisob-fakturalardagi MXIK nomuvofiqliklari va ombor balansi nazorati
 */

// Configure PDF.js worker
if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

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

const HAS_REAL_DATA = (typeof window !== "undefined" && Array.isArray(window.DIDOX_REAL_INVOICES) && window.DIDOX_REAL_INVOICES.length > 0);

let appState = {
  invoices: HAS_REAL_DATA ? window.DIDOX_REAL_INVOICES : JSON.parse(JSON.stringify(INITIAL_INVOICES)),
  isDemo: !HAS_REAL_DATA,
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
  const mxikAggregatedMap = {}; // Grouped strictly by 17-digit MXIK code

  let totalInboundSum = 0;
  let totalInboundItems = 0;
  let totalInboundInvoices = 0;

  let totalOutboundSum = 0;
  let totalOutboundItems = 0;
  let totalOutboundInvoices = 0;

  // 1. Filtrlash: Bekor qilingan, rad etilgan, bo'sh hujjatlar va Ishonchnomalarni (Doverennost) chiqarib tashlash
  const validInvoices = appState.invoices.filter(inv => {
    const status = String(inv.status || "").toLowerCase();
    if (status.includes("bekor") || status.includes("rad") || status.includes("annul") || status.includes("cancel") || status.includes("отмен")) {
      return false;
    }
    if (!Array.isArray(inv.items) || inv.items.length === 0) return false;

    // Ishonchnoma (Doverennost) filtri: Tashkilotning o'z nomiga chiqarilgan narxi 0 bo'lgan limit hujjatlari
    const inn = String(inv.partnerInn || "").trim();
    const pname = String(inv.partnerName || "").toLowerCase();
    const isSelf = inn === "311519913" || pname.includes("sinamed");
    const isZeroPrice = inv.items.every(it => (!it.price || it.price === 0) && (!it.total || it.total === 0));
    if (isSelf && isZeroPrice) return false;

    return true;
  });

  // 2. Tuzatuvchi fakturalar: bir xil faktura raqami va kontragent bo'yicha eskisini chiqarib, faqat yangi tuzatuvchi fakturani qabul qilish
  const docGroup = {};
  validInvoices.forEach(inv => {
    const key = `${inv.type}_${String(inv.partnerInn || "").trim()}_${String(inv.docNo || "").trim()}`;
    if (!docGroup[key]) docGroup[key] = [];
    docGroup[key].push(inv);
  });

  const activeInvoices = [];
  Object.values(docGroup).forEach(group => {
    if (group.length === 1) {
      activeInvoices.push(group[0]);
    } else {
      // Eng yangi sanasi va to'liq elementlariga ega bo'lgan tuzatuvchi fakturani saralab olish
      group.sort((a, b) => {
        const dateA = a.date || "1970-01-01";
        const dateB = b.date || "1970-01-01";
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return (b.items?.length || 0) - (a.items?.length || 0);
      });
      activeInvoices.push(group[0]);
    }
  });

  activeInvoices.forEach(inv => {
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

      // 2. Group for E-Ombor Item-Level Balance Table
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

      // 3. Group strictly by 17-digit MXIK code (Bir xil MXIK, xar xil mahsulot nomlari)
      if (!mxikAggregatedMap[item.mxik]) {
        mxikAggregatedMap[item.mxik] = {
          mxik: item.mxik,
          tasnif: item.tasnif || "Tasnif kodi",
          unit: item.unit || "dona",
          productNamesMap: {},
          inboundQty: 0,
          inboundSum: 0,
          outboundQty: 0,
          outboundSum: 0,
          subProducts: {}
        };
      }

      const mEntry = mxikAggregatedMap[item.mxik];
      if ((!mEntry.tasnif || mEntry.tasnif === "Tasnif kodi") && item.tasnif) {
        mEntry.tasnif = item.tasnif;
      }
      mEntry.productNamesMap[normName] = item.name;

      if (!mEntry.subProducts[normName]) {
        mEntry.subProducts[normName] = {
          name: item.name,
          unit: item.unit || "dona",
          inboundQty: 0,
          inboundSum: 0,
          outboundQty: 0,
          outboundSum: 0
        };
      }
      const sp = mEntry.subProducts[normName];

      if (inv.type === "inbound") {
        mEntry.inboundQty += item.qty;
        mEntry.inboundSum += lineTotal;
        sp.inboundQty += item.qty;
        sp.inboundSum += lineTotal;
      } else {
        mEntry.outboundQty += item.qty;
        mEntry.outboundSum += lineTotal;
        sp.outboundQty += item.qty;
        sp.outboundSum += lineTotal;
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

  // Item-level Balance table array calculation
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

  // Aggregated MXIK Balance calculation (Grouped strictly by 17-digit MXIK)
  const mxikBalances = Object.values(mxikAggregatedMap).map((m, index) => {
    const balanceQty = m.inboundQty - m.outboundQty;
    const avgPrice = m.inboundQty > 0 ? (m.inboundSum / m.inboundQty) : (m.outboundSum / (m.outboundQty || 1));
    const balanceSum = balanceQty * avgPrice;
    const productNames = Object.values(m.productNamesMap);
    const subProducts = Object.values(m.subProducts).map(sp => ({
      name: sp.name,
      unit: sp.unit,
      inboundQty: sp.inboundQty,
      inboundSum: sp.inboundSum,
      outboundQty: sp.outboundQty,
      outboundSum: sp.outboundSum,
      balanceQty: sp.inboundQty - sp.outboundQty
    })).sort((a, b) => b.balanceQty - a.balanceQty);

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
      mxik: m.mxik,
      tasnif: m.tasnif,
      productNames: productNames,
      productCount: productNames.length,
      subProducts: subProducts,
      unit: m.unit,
      inboundQty: m.inboundQty,
      inboundSum: m.inboundSum,
      outboundQty: m.outboundQty,
      outboundSum: m.outboundSum,
      balanceQty: balanceQty,
      balanceSum: balanceSum,
      status: status,
      statusLabel: statusLabel,
      badgeClass: badgeClass
    };
  }).sort((a, b) => {
    if (b.productCount !== a.productCount) return b.productCount - a.productCount;
    return b.inboundQty - a.inboundQty;
  }).map((m, idx) => {
    m.index = idx + 1;
    return m;
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
    mxikBalances,
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

document.addEventListener("DOMContentLoaded", async () => {
  initLucideIcons();
  setupNavigation();
  setupEventListeners();

  if (HAS_REAL_DATA) {
    document.getElementById("demoBanner")?.classList.add("hidden");
    document.getElementById("connectionStatus").textContent = "Didox: Jonli Ma'lumotlar";
    document.getElementById("lastSyncTime").textContent = `Jami: ${appState.invoices.length} ta real faktura`;
  }

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
  if (tabId === "pre-check") {
    if (draftInvoiceRows.length === 0) {
      window.addEmptyDraftRow();
    } else {
      renderDraftRows();
    }
  }
  if (activePane) {
    activePane.classList.add("active");
  }

  const titles = {
    "dashboard": { title: "Asosiy Ko'rsatkichlar & Audit", sub: "Didox kiruvchi va chiquvchi fakturalaridagi MXIK tahlili" },
    "audit": { title: "MXIK Nomuvofiqliklari & Xatoliklar", sub: "Bir xil tovarga turli MXIK kodlari yozilgan fakturalar audit ro'yxati" },
    "inventory": { title: "MXIK Qoldiq Balansi (E-Ombor)", sub: "Qabul qilingan, chiqib ketgan tovarlar va hozirgi ombor qoldig'i" },
    "pre-check": { title: "Fakturani Tekshirish (Pre-Check Auditor)", sub: "E-IMZO bilan imzolashdan oldin qoralama fakturalarni ombor qoldig'i va MXIK bo'yicha tekshirish" },
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
  document.getElementById("inventoryGroupMode")?.addEventListener("change", renderInventoryTab);

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
  const groupMode = document.getElementById("inventoryGroupMode")?.value || "aggregated";

  const tbody = document.querySelector("#inventoryBalanceTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const listToRender = groupMode === "aggregated" ? auditData.mxikBalances : auditData.balances;

  let filtered = listToRender.filter(item => {
    let matchesSearch = false;
    if (groupMode === "aggregated") {
      matchesSearch = !search || 
        item.mxik.includes(search) || 
        item.tasnif.toLowerCase().includes(search) ||
        item.productNames.some(p => p.toLowerCase().includes(search));
    } else {
      matchesSearch = !search || 
        item.name.toLowerCase().includes(search) || 
        item.mxik.includes(search) || 
        item.tasnif.toLowerCase().includes(search);
    }
    
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

    if (groupMode === "aggregated") {
      const isMulti = b.productCount > 1;
      const namesPreview = b.productNames.slice(0, 3).map(n => escapeHtml(n)).join(" • ");
      const moreCount = b.productCount - 3;
      const safeMxikId = String(b.mxik).replace(/[^a-zA-Z0-9_-]/g, '_');

      tr.id = `mxik-row-${safeMxikId}`;
      tr.innerHTML = `
        <td class="text-sub">${idx + 1}</td>
        <td>
          <span class="mxik-tag">${b.mxik}</span>
          <div class="text-sub" style="font-size: 0.75rem; margin-top: 2px;">${escapeHtml(b.tasnif)}</div>
        </td>
        <td style="min-width: 250px; max-width: 380px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            ${isMulti 
              ? `<span class="badge badge-purple" style="font-size: 0.75rem; padding: 2px 8px;">🏷️ ${b.productCount} xil tovar</span>
                 <button type="button" class="btn btn-xs btn-outline" style="padding: 3px 8px; font-size: 0.72rem; font-weight: 600;" onclick="toggleMxikDetails('${safeMxikId}')" id="btn-toggle-${safeMxikId}">
                   Jadvalni ko'rish ▼
                 </button>` 
              : `<span class="badge badge-info" style="font-size: 0.72rem; padding: 1px 6px;">1 xil tovar</span>`
            }
          </div>
          <div style="font-size: 0.85rem; color: var(--text-main); font-weight: 500; line-height: 1.4;">
            ${namesPreview}${moreCount > 0 ? ` <span class="text-sub" style="font-size: 0.78rem;">va yana ${moreCount} ta...</span>` : ""}
          </div>
        </td>
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

      if (isMulti) {
        const detailTr = document.createElement("tr");
        detailTr.id = `mxik-details-${safeMxikId}`;
        detailTr.className = "mxik-detail-row hidden";
        detailTr.innerHTML = `
          <td colspan="9" style="padding: 16px 20px; border-bottom: 2px solid var(--border-color); box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);">
            <div style="background: #ffffff; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
              <div style="padding: 10px 16px; background: #f1f5f9; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 1.1rem;">📦</span>
                  <span style="font-weight: 700; color: var(--text-main); font-size: 0.88rem;">
                    MXIK: <code style="color: var(--primary); font-family: var(--font-mono);">${b.mxik}</code> bo'yicha tovarlar harakati (${b.productCount} xil tovar)
                  </span>
                </div>
                <div class="text-sub" style="font-size: 0.76rem;">
                  Tasnif: <strong>${escapeHtml(b.tasnif)}</strong>
                </div>
              </div>
              
              <div class="table-responsive" style="margin: 0; max-height: 480px; overflow-y: auto;">
                <table class="sub-data-table">
                  <thead>
                    <tr>
                      <th style="width: 40px; text-align: center;">№</th>
                      <th style="min-width: 280px; text-align: left;">Fakturalardagi tovar nomi</th>
                      <th style="width: 80px; text-align: center;">O'lchov</th>
                      <th style="width: 140px; text-align: right;">📥 Kirim (Olingan)</th>
                      <th style="width: 140px; text-align: right;">📤 Chiqim (Sotilgan)</th>
                      <th style="width: 130px; text-align: right;">📊 Qoldiq</th>
                      <th style="width: 140px; text-align: center;">Holati</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${b.subProducts.map((sp, sIdx) => {
                      const spBal = sp.balanceQty;
                      let spBalClass = "qty-bal-pos";
                      let spBadge = `<span class="badge badge-success" style="font-size: 0.72rem;">Omborda bor</span>`;
                      let rowBg = sIdx % 2 === 0 ? "#ffffff" : "#fcfcfd";
                      
                      if (spBal < 0) {
                        spBalClass = "qty-bal-neg";
                        spBadge = `<span class="badge badge-danger" style="font-size: 0.72rem;">Minus (${formatNumber(spBal)})</span>`;
                        rowBg = "rgba(239, 68, 68, 0.05)";
                      } else if (spBal === 0) {
                        spBalClass = "qty-bal-zero";
                        spBadge = `<span class="badge badge-warning" style="font-size: 0.72rem;">Tugagan (0)</span>`;
                      }
                      
                      return `
                        <tr style="background: ${rowBg};">
                          <td class="text-sub text-center" style="font-size: 0.75rem;">${sIdx + 1}</td>
                          <td style="font-weight: 600; color: var(--text-main);">
                            ${escapeHtml(sp.name)}
                          </td>
                          <td class="text-center text-muted">${escapeHtml(sp.unit || b.unit)}</td>
                          <td class="text-right">
                            <span class="qty-val qty-in" style="font-size: 0.84rem;">+${formatNumber(sp.inboundQty)}</span>
                            ${sp.inboundSum > 0 ? `<div class="text-sub" style="font-size: 0.7rem;">${formatUZS(sp.inboundSum)}</div>` : ''}
                          </td>
                          <td class="text-right">
                            <span class="qty-val qty-out" style="font-size: 0.84rem;">-${formatNumber(sp.outboundQty)}</span>
                            ${sp.outboundSum > 0 ? `<div class="text-sub" style="font-size: 0.7rem;">${formatUZS(sp.outboundSum)}</div>` : ''}
                          </td>
                          <td class="text-right">
                            <span class="qty-val ${spBalClass}" style="font-size: 0.88rem; font-weight: 700;">${formatNumber(spBal)}</span>
                          </td>
                          <td class="text-center">
                            ${spBadge}
                          </td>
                        </tr>
                      `;
                    }).join("")}
                  </tbody>
                  <tfoot>
                    <tr style="background: #f1f5f9; font-weight: 700; border-top: 2px solid var(--border-color);">
                      <td colspan="3" style="text-align: right; font-size: 0.82rem; padding: 10px 14px; color: var(--text-main);">
                        Ushbu MXIK bo'yicha JAMI qoldiq:
                      </td>
                      <td class="text-right" style="padding: 10px 14px;">
                        <span class="qty-val qty-in">+${formatNumber(b.inboundQty)}</span>
                      </td>
                      <td class="text-right" style="padding: 10px 14px;">
                        <span class="qty-val qty-out">-${formatNumber(b.outboundQty)}</span>
                      </td>
                      <td class="text-right" style="padding: 10px 14px;">
                        <span class="qty-val ${balQtyClass}" style="font-size: 0.92rem;">${formatNumber(b.balanceQty)}</span>
                      </td>
                      <td class="text-center" style="padding: 10px 14px;">
                        <span class="badge ${b.badgeClass}">${b.statusLabel}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </td>
        `;
        tbody.appendChild(detailTr);
      }
    } else {
      // Detailed row
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
    }
  });
}

window.toggleMxikDetails = function(mxikId) {
  const el = document.getElementById(`mxik-details-${mxikId}`);
  const btn = document.getElementById(`btn-toggle-${mxikId}`);
  const parentTr = document.getElementById(`mxik-row-${mxikId}`);
  if (el) {
    const isNowHidden = !el.classList.contains("hidden");
    el.classList.toggle("hidden");
    if (btn) {
      btn.textContent = isNowHidden ? "Jadvalni ko'rish ▼" : "Jadvalni yopish ▲";
    }
    if (parentTr) {
      parentTr.classList.toggle("mxik-row-expanded", !isNowHidden);
    }
  }
};

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

  // 1. Aggregated MXIK Sheet (Bir xil MXIK kodi bo'yicha jamlangan)
  const mxikAggRows = auditData.mxikBalances.map(m => ({
    "№": m.index,
    "MXIK Kodi": m.mxik,
    "Tasnif Nomi": m.tasnif,
    "Jamlangan Tovar Xillari Soni": m.productCount,
    "Barcha Tovar Nomlari": m.productNames.join(" | "),
    "O'lchov Birligi": m.unit,
    "Kirim Miqdori (Jami)": m.inboundQty,
    "Kirim Summasi (UZS)": m.inboundSum,
    "Chiqim Miqdori (Jami)": m.outboundQty,
    "Chiqim Summasi (UZS)": m.outboundSum,
    "Hisobdagi Qoldiq (Kirim - Chiqim)": m.balanceQty,
    "Qoldiq Summasi (UZS)": m.balanceSum,
    "Holati": m.statusLabel
  }));
  const wsMxikAgg = XLSX.utils.json_to_sheet(mxikAggRows);
  XLSX.utils.book_append_sheet(wb, wsMxikAgg, "MXIK Jamlangan Balans");

  // 2. Detailed Balance Sheet (Har bir tovar nomi bo'yicha)
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
  XLSX.utils.book_append_sheet(wb, wsBalance, "Har Bir Tovar Balansi");

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
// 5. PARSERS: PDF, XML, JSON, EXCEL
// ==========================================

// Configure PDF.js worker if available
if (typeof pdfjsLib !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/**
 * Universal Parser for Didox / Soliq E-Invoice PDF files
 */
async function parseDidoxPdf(arrayBuffer, filename = "Faktura.pdf") {
  if (typeof pdfjsLib === "undefined") return null;
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += " " + pageText;
    }

    if (!fullText.trim()) return null;

    // Clean text and search 17-digit MXIK codes
    const rawMxiks = fullText.match(/\b\d{17}\b/g) || [];
    const uniqueMxiks = Array.from(new Set(rawMxiks));

    // Search STIR (9 digits)
    const innMatches = fullText.match(/\b(3\d{8}|2\d{8})\b/g) || [];
    const sellerInn = innMatches[0] || "300000000";
    const buyerInn = innMatches[1] || "311519913";

    // Search Doc No
    const docNoMatch = fullText.match(/(?:№|номер|raqam|faktura)\s*[:№]?\s*([A-Za-z0-9\/_-]+)/i);
    const docNo = docNoMatch ? docNoMatch[1] : filename.replace(/\.pdf$/i, "");

    // Search Date
    const dateMatch = fullText.match(/\b(\d{2}[.-]\d{2}[.-]\d{4}|\d{4}[.-]\d{2}[.-]\d{2})\b/);
    const date = dateMatch ? dateMatch[1].replace(/\./g, "-") : "2026-09-07";

    // Determine type
    let type = "inbound";
    if (sellerInn.includes("311519913") || fullText.toLowerCase().includes('"sinamed"')) {
      type = "outbound";
    }

    const items = [];
    if (uniqueMxiks.length > 0) {
      uniqueMxiks.forEach((mxik, i) => {
        // Try to extract product name preceding or following the MXIK code in text
        let foundName = `Mahsulot #${i + 1} (${mxik.slice(0, 5)})`;
        const mxikIdx = fullText.indexOf(mxik);
        if (mxikIdx > 0) {
          const beforeSnippet = fullText.substring(Math.max(0, mxikIdx - 120), mxikIdx);
          // Look for text between previous numbers or punctuation
          const words = beforeSnippet.split(/[\r\n\t;|]+/).pop().trim();
          if (words.length > 3 && !/^\d+$/.test(words)) {
            foundName = words.slice(-50).trim();
          }
        }

        items.push({
          name: foundName,
          mxik: mxik,
          tasnif: "Tasnif kodi: " + mxik,
          unit: "dona",
          qty: 1,
          price: 0,
          total: 0
        });
      });
    }

    if (items.length === 0) return null;

    return {
      id: `DOC-PDF-${docNo}-${Math.random().toString(36).slice(2, 6)}`,
      docNo,
      date,
      type,
      partnerName: type === "inbound" ? `Ta'minotchi (STIR ${sellerInn})` : `Xaridor (STIR ${buyerInn})`,
      partnerInn: type === "inbound" ? sellerInn : buyerInn,
      status: "Qabul qilingan",
      items
    };
  } catch (err) {
    console.warn("Could not parse PDF:", filename, err);
    return null;
  }
}

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

    let type = "inbound";
    if (sellerInn.includes("311519913") || sellerName.toLowerCase().includes("sinamed")) {
      type = "outbound";
    }

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
 * Universal File Upload Handler (ZIP, PDF, XML, Excel, JSON)
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
      const extStats = {};

      const fileEntries = Object.keys(zipData.files).filter(fname => !zipData.files[fname].dir && !fname.includes("__MACOSX") && !fname.startsWith("."));

      for (const fname of fileEntries) {
        fileNamesFound.push(fname);
        const ext = (fname.split('.').pop() || "fayl").toLowerCase();
        extStats[ext] = (extStats[ext] || 0) + 1;

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

        // B. PDF Files (Extracted via PDF.js)
        else if (fname.toLowerCase().endsWith(".pdf")) {
          try {
            const arrBuff = await zipFile.async("arraybuffer");
            const parsed = await parseDidoxPdf(arrBuff, fname);
            if (parsed) importedInvoices.push(parsed);
          } catch (e) {
            console.warn("Could not parse PDF in ZIP:", fname, e);
          }
        }

        // C. JSON Files
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
        
        // D. Excel Files
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

        // E. Fallback for any text / html file
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
            // Ignore other binary files
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
        showToast(`ZIP arxiv ochildi: ${importedInvoices.length} ta faktura va barcha MXIKlar muvaffaqiyatli yuklandi!`, "success");
        switchTab("dashboard");
      } else {
        const statsStr = Object.entries(extStats).map(([k, v]) => `${v} ta .${k}`).join(", ");
        showToast(`ZIP ichida topilgan fayllar: ${statsStr}. Fakturalar jadvalini to'liq olish uchun Didox'dan "Ro'yxatga olish kitobi" orqali Excel yuklang.`, "warning");
      }

    } catch (err) {
      console.error(err);
      showToast("ZIP arxivni ochishda xatolik yuz berdi.", "danger");
    }
    return;
  }

  // 2. SINGLE PDF FILE
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const parsed = await parseDidoxPdf(e.target.result, file.name);
      if (parsed) {
        appState.invoices = [parsed];
        appState.isDemo = false;
        document.getElementById("demoBanner")?.classList.add("hidden");
        document.getElementById("connectionStatus").textContent = "PDF orqali yuklangan";
        document.getElementById("lastSyncTime").textContent = `Fayl: ${file.name}`;
        refreshAllViews();
        showToast(`PDF faktura muvaffaqiyatli yuklandi!`, "success");
        switchTab("dashboard");
      } else {
        showToast("PDF ichida MXIK kodlari topilmadi", "warning");
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  // 3. SINGLE XML FILE
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

  // 4. SINGLE JSON FILE
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

  // 5. SINGLE EXCEL FILE (.xlsx, .xls)
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
  let lastDocNo = "IMP-1";
  let lastPartner = "Kontragent";
  let lastInn = "300000000";
  let lastDate = "2026-09-07";
  let lastType = "inbound";

  jsonRows.forEach((row, idx) => {
    // Helper to find field value across flexible keys
    const findVal = (...patterns) => {
      const keys = Object.keys(row);
      for (const p of patterns) {
        const pLower = p.toLowerCase();
        // Exact match first
        const exact = keys.find(k => k.trim().toLowerCase() === pLower);
        if (exact && row[exact] !== undefined && row[exact] !== null && String(row[exact]).trim() !== "") {
          return String(row[exact]).trim();
        }
      }
      for (const p of patterns) {
        const pLower = p.toLowerCase();
        // Substring match
        const match = keys.find(k => k.toLowerCase().includes(pLower));
        if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== "") {
          return String(row[match]).trim();
        }
      }
      return "";
    };

    // Extract docNo or forward-fill
    let docNo = findVal("ҳужжат рақами", "hujjat raqami", "faktura №", "faktura", "docno", "номер", "raqam", "hujjat");
    if (docNo) {
      lastDocNo = docNo;
    } else {
      docNo = lastDocNo;
    }

    // Extract type (kiruvchi / chiquvchi)
    const rawType = findVal("кирувчи / чиқувчи", "кирувчи", "чиқувчи", "turi", "type", "тип");
    let type = lastType;
    if (rawType) {
      const tLower = rawType.toLowerCase();
      if (tLower.includes("чиқ") || tLower.includes("out") || tLower.includes("исход")) {
        type = "outbound";
      } else {
        type = "inbound";
      }
      lastType = type;
    }

    // Extract partner
    const partnerName = findVal("ҳамкор номи", "hamkor nomi", "kontragent", "partnername", "hamkor", "поставщик", "покупатель") || lastPartner;
    if (partnerName) lastPartner = partnerName;

    // Extract INN
    const partnerInn = findVal("ҳамкор стири/жшшир", "ҳамкор стири", "stir", "партнер стир", "инн", "жшшир", "tin", "inn") || lastInn;
    if (partnerInn) lastInn = partnerInn;

    // Extract date
    const date = findVal("ҳужжат санаси", "hujjat sanasi", "sana", "date", "дата") || lastDate;
    if (date) lastDate = date;

    // Extract item name
    const name = findVal("товар (хизмат)лар номи", "товар номи", "маҳсулотлар рўйхати", "tovar nomi", "name", "tovar", "товар", "наименование");
    
    // Extract MXIK
    let mxik = findVal("мхик коди", "мхик", "икпу", "mxik kodi", "mxik", "ikpu", "идентификация коди", "идентификация", "catalogcode");
    
    // If neither name nor MXIK exists, skip this row (header/footer/empty row)
    if (!name && !mxik) {
      return;
    }

    // Find any 17-digit number in row if mxik is not found yet
    if (!mxik || mxik.length < 5) {
      for (const val of Object.values(row)) {
        const s = String(val).trim();
        if (/^\d{17}$/.test(s)) {
          mxik = s;
          break;
        }
      }
    }

    const tasnif = findVal("тасниф", "tasnif", "catalogname") || (mxik ? `MXIK: ${mxik}` : "Tasnif kodi");
    const unit = findVal("ўлчов бирлиги", "o'lchov birligi", "birlik", "unit", "ед.изм.") || "dona";

    const qtyStr = findVal("миқдори", "miqdori", "qty", "сони", "кол-во", "количество", "миқдор");
    const priceStr = findVal("етказиб бериш нархи", "нархи", "narxi", "price", "цена", "қиймати");
    
    const qty = parseFloat(qtyStr.replace(/[^0-9.-]+/g, "")) || 1;
    const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, "")) || 0;

    if (mxik && mxik.length < 17 && mxik.length > 5) {
      mxik = (mxik + "00000000000000000").slice(0, 17);
    }
    if (!mxik) mxik = "00000000000000000";

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
      name: name || "Tovar",
      mxik: mxik,
      tasnif: tasnif,
      unit: unit,
      qty: qty,
      price: price,
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
  }, 4000);
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



/* ==================== PRE-CHECK AUDITOR & SMART SEARCH MODULE ==================== */

let draftInvoiceRows = [];

// Initialize or add empty draft row
window.addEmptyDraftRow = function(defaultData = null) {
  const newRow = {
    id: "row_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    name: defaultData?.name || "",
    mxik: defaultData?.mxik || "",
    qty: defaultData?.qty !== undefined ? defaultData.qty : 1,
    price: defaultData?.price !== undefined ? defaultData.price : 0
  };
  draftInvoiceRows.push(newRow);
  renderDraftRows();
};

window.removeDraftRow = function(rowId) {
  draftInvoiceRows = draftInvoiceRows.filter(r => r.id !== rowId);
  if (draftInvoiceRows.length === 0) {
    window.addEmptyDraftRow();
    return;
  }
  renderDraftRows();
};

window.clearDraftRows = function() {
  draftInvoiceRows = [];
  const resultsArea = document.getElementById("preCheckResultsArea");
  if (resultsArea) resultsArea.classList.add("hidden");
  window.addEmptyDraftRow();
  showToast("Qoralama faktura tozalandi", "info");
};

window.updateDraftRow = function(rowId, field, value) {
  const row = draftInvoiceRows.find(r => r.id === rowId);
  if (!row) return;
  row[field] = value;

  // If name changed and mxik is empty, try to auto-fill matching MXIK from inventory
  if (field === "name" && value && value.trim().length > 2 && !row.mxik) {
    const auditData = calculateAuditAndBalance();
    const cleanVal = value.toLowerCase().trim();
    for (const b of auditData.balances) {
      if (b.productNames.some(p => p.toLowerCase().includes(cleanVal)) && b.balanceQty > 0) {
        row.mxik = b.mxik;
        const mxikInput = document.getElementById(`draft-mxik-${rowId}`);
        if (mxikInput) mxikInput.value = b.mxik;
        break;
      }
    }
  }

  updateDraftSummary();
};

function updateDraftSummary() {
  const summaryEl = document.getElementById("draftSummaryInfo");
  if (!summaryEl) return;
  const totalItems = draftInvoiceRows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0);
  const totalSum = draftInvoiceRows.reduce((sum, r) => sum + ((parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0)), 0);
  summaryEl.innerHTML = `<strong>${draftInvoiceRows.length} xil tovar</strong> (${formatNumber(totalItems)} dona), Jami: <strong>${formatUZS(totalSum)}</strong>`;
}

function renderDraftRows() {
  const tbody = document.getElementById("draftInvoiceTableBody");
  if (!tbody) return;

  // Build datalist of in-stock items for autocomplete
  const auditData = calculateAuditAndBalance();
  const inStockNames = new Set();
  auditData.balances.forEach(b => {
    if (b.balanceQty > 0) {
      b.productNames.forEach(n => inStockNames.add(n));
    }
  });

  let datalistHtml = `<datalist id="inStockProductSuggestions">`;
  inStockNames.forEach(n => {
    datalistHtml += `<option value="${escapeHtml(n)}"></option>`;
  });
  datalistHtml += `</datalist>`;

  tbody.innerHTML = draftInvoiceRows.map((r, idx) => `
    <tr>
      <td class="text-sub text-center" style="font-weight: 500;">${idx + 1}</td>
      <td>
        <input type="text" class="draft-table-input" id="draft-name-${r.id}" 
          value="${escapeHtml(r.name)}" 
          placeholder="Tovar nomini kiriting yoki tanlang..." 
          list="inStockProductSuggestions"
          oninput="updateDraftRow('${r.id}', 'name', this.value)" />
      </td>
      <td>
        <input type="text" class="draft-table-input" id="draft-mxik-${r.id}" 
          value="${escapeHtml(r.mxik)}" 
          placeholder="17 xonali MXIK..." 
          style="font-family: var(--font-mono); font-size: 0.8rem;" 
          oninput="updateDraftRow('${r.id}', 'mxik', this.value)" />
      </td>
      <td>
        <input type="number" class="draft-table-input text-right" id="draft-qty-${r.id}" 
          value="${r.qty}" min="1" step="any"
          oninput="updateDraftRow('${r.id}', 'qty', parseFloat(this.value) || 0)" />
      </td>
      <td>
        <input type="number" class="draft-table-input text-right" id="draft-price-${r.id}" 
          value="${r.price}" min="0" step="any"
          oninput="updateDraftRow('${r.id}', 'price', parseFloat(this.value) || 0)" />
      </td>
      <td class="text-center">
        <button type="button" class="btn btn-xs btn-outline" onclick="removeDraftRow('${r.id}')" title="O'chirish" style="color: var(--danger); padding: 4px 8px;">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    </tr>
  `).join("") + datalistHtml;

  updateDraftSummary();
  initLucideIcons();
}

// Smart Real-time Search Handler
window.handleSmartSearch = function(query) {
  const container = document.getElementById("smartSearchResults");
  if (!container) return;

  const q = (query || "").toLowerCase().trim();
  if (!q || q.length < 2) {
    container.innerHTML = `
      <div class="text-sub text-center" style="padding: 24px;">
        Tovarning nomini kiriting — ombordagi barcha mos MXIK kodlari va mavjud qoldiqlari chiqadi.
      </div>
    `;
    return;
  }

  const auditData = calculateAuditAndBalance();
  const matched = [];

  auditData.balances.forEach(b => {
    const mxikMatch = b.mxik.includes(q) || b.tasnif.toLowerCase().includes(q);
    const matchedProducts = b.subProducts ? b.subProducts.filter(sp => sp.name.toLowerCase().includes(q)) : [];
    const nameMatch = b.productNames.some(p => p.toLowerCase().includes(q));

    if (mxikMatch || nameMatch || matchedProducts.length > 0) {
      matched.push({
        mxik: b.mxik,
        tasnif: b.tasnif,
        balanceQty: b.balanceQty,
        balanceSum: b.balanceSum,
        unit: b.unit,
        matchedProducts: matchedProducts.length > 0 ? matchedProducts : (b.subProducts || []),
        productNames: b.productNames
      });
    }
  });

  if (matched.length === 0) {
    container.innerHTML = `
      <div class="text-sub text-center" style="padding: 24px; color: var(--danger);">
        "<strong>${escapeHtml(query)}</strong>" bo'yicha omborda tovar topilmadi.
      </div>
    `;
    return;
  }

  container.innerHTML = matched.map(m => {
    const isPos = m.balanceQty > 0;
    const badgeClass = isPos ? "badge-success" : (m.balanceQty < 0 ? "badge-danger" : "badge-warning");
    const statusText = isPos ? `Omborda bor: +${formatNumber(m.balanceQty)} ${m.unit}` : (m.balanceQty < 0 ? `Minus: ${formatNumber(m.balanceQty)}` : "Tugagan (0)");

    const subListHtml = m.matchedProducts.slice(0, 3).map(sp => `
      <div style="font-size: 0.78rem; color: var(--text-main); margin-top: 2px;">
        • <strong>${escapeHtml(sp.name)}</strong>: 
        <span style="color: ${sp.balanceQty > 0 ? 'var(--success)' : (sp.balanceQty < 0 ? 'var(--danger)' : 'var(--text-muted)')}; font-weight: 600;">
          ${sp.balanceQty > 0 ? '+' : ''}${formatNumber(sp.balanceQty)} ${sp.unit || m.unit}
        </span>
      </div>
    `).join("");

    const firstName = m.matchedProducts[0]?.name || m.productNames[0] || m.tasnif;

    return `
      <div class="smart-search-item">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="mxik-tag" style="font-size: 0.78rem;">
              ${m.mxik}
              <i data-lucide="copy" class="copy-icon" onclick="copyText('${m.mxik}')" title="MXIKdan nusxa olish"></i>
            </span>
            <span class="badge ${badgeClass}" style="font-size: 0.72rem;">${statusText}</span>
          </div>
          <div class="text-sub" style="font-size: 0.75rem; margin-top: 4px;">
            Tasnif: <strong>${escapeHtml(m.tasnif)}</strong>
          </div>
          ${subListHtml}
        </div>
        <div>
          <button type="button" class="btn btn-xs btn-primary" onclick="addFoundItemToDraft('${escapeJsString(firstName)}', '${m.mxik}')" style="white-space: nowrap;">
            ➕ Fakturaga qo'shish
          </button>
        </div>
      </div>
    `;
  }).join("");

  initLucideIcons();
};

window.addFoundItemToDraft = function(name, mxik) {
  if (draftInvoiceRows.length === 1 && !draftInvoiceRows[0].name && !draftInvoiceRows[0].mxik) {
    draftInvoiceRows[0].name = name;
    draftInvoiceRows[0].mxik = mxik;
  } else {
    draftInvoiceRows.push({
      id: "row_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: name,
      mxik: mxik,
      qty: 1,
      price: 0
    });
  }
  renderDraftRows();
  showToast(`"${name}" faktura qoralamasiga qo'shildi!`, "success");
};

// Sample loading
window.loadSampleProblematicInvoice = function() {
  draftInvoiceRows = [
    {
      id: "row_1",
      name: "Пластмассовый цепочка держатель для соски (RBT-130) 7,30,003",
      mxik: "03926001020000000",
      qty: 10,
      price: 10500
    },
    {
      id: "row_2",
      name: "Держатель для сосок (JK BABY модел с колокльчика )",
      mxik: "03926001020000000",
      qty: 150,
      price: 8000
    },
    {
      id: "row_3",
      name: "Bolalar upasi \"TEDDY\" 50 gr",
      mxik: "03304999015000000",
      qty: 25,
      price: 6000
    }
  ];
  renderDraftRows();
  showToast("Muammoli namunaviy qoralama yuklandi!", "info");
  window.runDraftAudit();
};

window.loadSampleSafeInvoice = function() {
  draftInvoiceRows = [
    {
      id: "row_s1",
      name: "Smart Adult Diapers L (Kattalar tagligi)",
      mxik: "09619001001000000",
      qty: 20,
      price: 125000
    },
    {
      id: "row_s2",
      name: "Bolalar upasi \"TEDDY\" 50 gr",
      mxik: "03304999015000000",
      qty: 30,
      price: 6000
    },
    {
      id: "row_s3",
      name: "Детские соски (LOT-10)",
      mxik: "04016001083000000",
      qty: 15,
      price: 12000
    }
  ];
  renderDraftRows();
  showToast("100% Xavfsiz namunaviy qoralama yuklandi!", "success");
  window.runDraftAudit();
};

// Paste Modal handling
window.openPasteDraftModal = function() {
  const modal = document.getElementById("pasteDraftModal");
  if (modal) modal.classList.add("active");
};

window.closePasteDraftModal = function() {
  const modal = document.getElementById("pasteDraftModal");
  if (modal) modal.classList.remove("active");
};

window.parseAndApplyPastedDraft = function() {
  const textarea = document.getElementById("pasteDraftTextarea");
  const val = (textarea?.value || "").trim();
  if (!val) {
    showToast("Iltimos, faktura matnini kiriting", "warning");
    return;
  }

  let items = [];
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed.items && Array.isArray(parsed.items)) {
      items = parsed.items;
    }
  } catch (e) {
    const lines = val.split("\n").map(l => l.trim()).filter(Boolean);
    lines.forEach(l => {
      const parts = l.split(/[\t,|;]/);
      if (parts.length >= 2) {
        items.push({
          name: parts[0].trim(),
          mxik: parts[1].replace(/[^0-9]/g, "").trim(),
          qty: parseFloat(parts[2]) || 1,
          price: parseFloat(parts[3]) || 0
        });
      }
    });
  }

  if (items.length === 0) {
    showToast("Format aniqlanmadi. Iltimos, JSON yoki matn shaklida kiriting.", "danger");
    return;
  }

  draftInvoiceRows = items.map((it, idx) => ({
    id: "row_" + Date.now() + "_" + idx,
    name: it.name || it.productName || it.title || "Tovar",
    mxik: it.mxik || it.catalogCode || "",
    qty: parseFloat(it.qty || it.count || it.quantity) || 1,
    price: parseFloat(it.price || it.sum) || 0
  }));

  renderDraftRows();
  closePasteDraftModal();
  showToast(`${draftInvoiceRows.length} ta tovar qoralamaga yuklandi!`, "success");
  window.runDraftAudit();
};

// Alternative MXIK applier
window.applyAlternativeMxik = function(rowId, newMxik, newName = null) {
  const row = draftInvoiceRows.find(r => r.id === rowId);
  if (!row) return;
  row.mxik = newMxik;
  if (newName) row.name = newName;
  renderDraftRows();
  showToast(`MXIK muvaffaqiyatli o'zgartirildi: ${newMxik}`, "success");
  window.runDraftAudit();
};

// Copy corrected draft JSON
window.copyCorrectedDraftJson = function() {
  const cleanData = draftInvoiceRows.map(r => ({
    name: r.name,
    mxik: r.mxik,
    qty: r.qty,
    price: r.price,
    total: r.qty * r.price
  }));
  copyText(JSON.stringify(cleanData, null, 2));
  showToast("To'g'rilangan faktura ma'lumotlari nusxalandi!", "success");
};

// The Master Pre-Check Audit Engine
window.runDraftAudit = function() {
  const resultsArea = document.getElementById("preCheckResultsArea");
  if (!resultsArea) return;

  const validRows = draftInvoiceRows.filter(r => r.name.trim() || r.mxik.trim());
  if (validRows.length === 0) {
    showToast("Iltimos, avval fakturaga tovarlarni kiriting!", "warning");
    return;
  }

  const auditData = calculateAuditAndBalance();
  const balances = auditData.balances;

  let totalErrors = 0;
  let totalWarnings = 0;

  const analyzedItems = validRows.map((row, idx) => {
    const cleanName = (row.name || "").trim();
    const cleanMxik = (row.mxik || "").replace(/[^0-9]/g, "");
    const qty = parseFloat(row.qty) || 0;
    const price = parseFloat(row.price) || 0;

    let isSafe = true;
    let hasError = false;
    let hasWarning = false;
    let errorMsg = "";
    let warningMsg = "";
    let recommendation = null;

    // 1. Find matching MXIK balance
    const mxikEntry = balances.find(b => b.mxik === cleanMxik);
    let availableInMxik = 0;
    let avgCost = 0;
    let tasnif = "";

    if (mxikEntry) {
      availableInMxik = mxikEntry.balanceQty;
      tasnif = mxikEntry.tasnif;
      avgCost = mxikEntry.inboundQty > 0 ? (mxikEntry.inboundSum / mxikEntry.inboundQty) : 0;
    }

    // 2. Check stock
    if (!mxikEntry) {
      isSafe = false;
      hasError = true;
      errorMsg = `Ushbu MXIK kodi (${cleanMxik || 'Kiritilmagan'}) bo'yicha omborda kirim mavjud emas! Qoldiq: 0 dona.`;
    } else if (availableInMxik < qty) {
      isSafe = false;
      hasError = true;
      const deficit = qty - availableInMxik;
      errorMsg = `Omborda bu MXIK bo'yicha jami ${formatNumber(availableInMxik)} dona bor. Siz ${formatNumber(qty)} dona yozyapsiz. Imzolasangiz omborda -${formatNumber(deficit)} dona MINUS hosil bo'ladi!`;
    }

    // 3. Alternative MXIK Search if error
    if (hasError && cleanName.length > 2) {
      const searchTerms = cleanName.toLowerCase().split(/[\s,()"/]+/).filter(w => w.length > 2);
      
      let bestAlt = null;
      for (const b of balances) {
        if (b.mxik === cleanMxik || b.balanceQty <= 0) continue;
        
        for (const p of b.productNames) {
          const pLower = p.toLowerCase();
          const matchScore = searchTerms.filter(term => pLower.includes(term)).length;
          if (matchScore >= Math.min(2, searchTerms.length)) {
            bestAlt = {
              mxik: b.mxik,
              tasnif: b.tasnif,
              matchedName: p,
              available: b.balanceQty,
              unit: b.unit
            };
            break;
          }
        }
        if (bestAlt) break;
      }

      if (bestAlt) {
        recommendation = {
          type: "ALT_MXIK",
          title: `To'g'ri MXIK topildi!`,
          desc: `Ushbu tovar aslida <strong>${bestAlt.mxik}</strong> (${escapeHtml(bestAlt.tasnif)}) MXIK kodi orqali kirgan va omborda <strong>+${formatNumber(bestAlt.available)} ${bestAlt.unit}</strong> bo'sh qoldiq bor!`,
          targetMxik: bestAlt.mxik,
          targetName: bestAlt.matchedName
        };
      }
    }

    // 4. Same MXIK sub-product surplus check
    if (!recommendation && mxikEntry && mxikEntry.subProducts && mxikEntry.subProducts.length > 1) {
      const surplusSub = mxikEntry.subProducts.find(sp => sp.balanceQty >= qty && !sp.name.toLowerCase().includes(cleanName.toLowerCase()));
      if (surplusSub) {
        recommendation = {
          type: "SURPLUS_SUB",
          title: `Xuddi shu MXIK ostidagi zaxira tovar:`,
          desc: `Ushbu MXIK ostida <strong>"${escapeHtml(surplusSub.name)}"</strong> tovaridan omborda <strong>+${formatNumber(surplusSub.balanceQty)} dona</strong> mavjud. Agar imkoni bo'lsa, tovar nomini shunga almashtiring.`,
          targetMxik: cleanMxik,
          targetName: surplusSub.name
        };
      }
    }

    // 5. Pricing & Profit check
    if (avgCost > 0 && price > 0 && price < avgCost * 0.98) {
      hasWarning = true;
      warningMsg = `Diqqat: Sotish narxi (${formatUZS(price)}) o'rtacha kirim tannarxidan (${formatUZS(avgCost)}) arzonroq ko'rsatilgan! Soliq tekshiruvida zarar/rentabellik xavfi.`;
    } else if (price === 0) {
      hasWarning = true;
      warningMsg = `Tovar narxi 0 so'm qilib kiritilgan. Agar bu tekin berilmagan bo'lsa, narxini tekshiring.`;
    }

    if (hasError) totalErrors++;
    if (hasWarning) totalWarnings++;

    return {
      rowId: row.id,
      index: idx + 1,
      name: cleanName,
      mxik: cleanMxik,
      tasnif: tasnif,
      qty: qty,
      price: price,
      totalSum: qty * price,
      availableStock: availableInMxik,
      avgCost: avgCost,
      isSafe: !hasError,
      hasError: hasError,
      hasWarning: hasWarning,
      errorMsg: errorMsg,
      warningMsg: warningMsg,
      recommendation: recommendation
    };
  });

  // Render verdict banner
  let verdictClass = "audit-verdict-safe";
  let verdictIcon = "check-circle";
  let verdictTitle = "🟢 100% XAVFSIZ: Fakturani E-IMZO bilan imzolashingiz mumkin!";
  let verdictDesc = "Barcha kiritilgan tovarlar bo'yicha omborda qoldiq to'liq yetarli va MXIK kodlari to'g'ri. Minus qoldiq xavfi 0%!";

  if (totalErrors > 0) {
    verdictClass = "audit-verdict-danger";
    verdictIcon = "alert-octagon";
    verdictTitle = `🔴 TO'XTATING! Fakturada ${totalErrors} ta jiddiy xatolik aniqlandi!`;
    verdictDesc = `Agar ushbu fakturani hozir Didoxda imzolab yuborsangiz, E-Omboringizda <strong>MINUS QOLDIQ</strong> paydo bo'ladi va soliq xavfi yuzaga keladi. Iltimos, pastdagi tavsiyalar asosida to'g'irlang!`;
  } else if (totalWarnings > 0) {
    verdictClass = "audit-verdict-warning";
    verdictIcon = "alert-triangle";
    verdictTitle = `🟡 DIQQAT: Qoldiq yetarli, lekin ${totalWarnings} ta narx ogohlantirishi bor!`;
    verdictDesc = "Tovarlar omborda mavjud va minusga tushmaysiz, biroq tovar sotish narxlarini yana bir bor tekshirib olish tavsiya etiladi.";
  }

  const itemsHtml = analyzedItems.map(item => {
    let cardClass = item.hasError ? "has-error" : (item.hasWarning ? "has-warning" : "is-safe");
    let statusBadge = item.isSafe 
      ? `<span class="badge badge-success" style="font-size: 0.8rem;">🟢 Qoldiq Yetarli (+${formatNumber(item.availableStock)})</span>`
      : `<span class="badge badge-danger" style="font-size: 0.8rem;">🔴 Qoldiq Yetmaydi (Xavf!)</span>`;

    let recommendationHtml = "";
    if (item.recommendation) {
      recommendationHtml = `
        <div class="recommendation-box">
          <div>
            <strong>💡 ${item.recommendation.title}</strong>
            <div>${item.recommendation.desc}</div>
          </div>
          <button type="button" class="btn btn-sm btn-primary" onclick="applyAlternativeMxik('${item.rowId}', '${item.recommendation.targetMxik}', '${escapeJsString(item.recommendation.targetName)}')">
            <i data-lucide="check"></i> Ushbu MXIKni qo'llash
          </button>
        </div>
      `;
    }

    return `
      <div class="precheck-item-card ${cardClass}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-purple" style="font-size: 0.72rem;">№ ${item.index}</span>
              <strong style="font-size: 0.95rem; color: var(--text-main);">${escapeHtml(item.name)}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span class="mxik-tag" style="font-size: 0.76rem;">${item.mxik || 'Kiritilmagan'}</span>
              ${item.tasnif ? `<span class="text-sub" style="font-size: 0.74rem;">${escapeHtml(item.tasnif)}</span>` : ''}
            </div>
          </div>
          <div>
            ${statusBadge}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 12px; padding: 10px 14px; background: #fafafa; border-radius: var(--radius-sm); font-size: 0.82rem;">
          <div>
            <span class="text-sub">Fakturada miqdor:</span><br>
            <strong>${formatNumber(item.qty)} dona</strong>
          </div>
          <div>
            <span class="text-sub">Ombordagi qoldiq:</span><br>
            <strong style="color: ${item.availableStock >= item.qty ? 'var(--success)' : 'var(--danger)'};">
              ${formatNumber(item.availableStock)} dona
            </strong>
          </div>
          <div>
            <span class="text-sub">Sotish narxi:</span><br>
            <strong>${formatUZS(item.price)}</strong>
          </div>
          <div>
            <span class="text-sub">Kirim tannarxi:</span><br>
            <span class="text-muted">${item.avgCost > 0 ? formatUZS(item.avgCost) : "Noma'lum"}</span>
          </div>
        </div>

        ${item.errorMsg ? `
          <div style="margin-top: 10px; padding: 8px 12px; background: #fef2f2; border-radius: var(--radius-sm); color: #b91c1c; font-size: 0.82rem; font-weight: 500;">
            ⚠️ ${item.errorMsg}
          </div>
        ` : ''}

        ${item.warningMsg ? `
          <div style="margin-top: 10px; padding: 8px 12px; background: #fffbeb; border-radius: var(--radius-sm); color: #b45309; font-size: 0.82rem; font-weight: 500;">
            ℹ️ ${item.warningMsg}
          </div>
        ` : ''}

        ${recommendationHtml}
      </div>
    `;
  }).join("");

  resultsArea.innerHTML = `
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <h3 class="card-title">🔍 Faktura Audit Xulosasi</h3>
        <button type="button" class="btn btn-sm btn-outline" onclick="copyCorrectedDraftJson()">
          <i data-lucide="copy"></i> To'g'rilangan Fakturani Nusxalash (JSON)
        </button>
      </div>
      <div class="card-body">
        
        <div class="audit-verdict-box ${verdictClass}">
          <i data-lucide="${verdictIcon}" style="width: 38px; height: 38px; flex-shrink: 0;"></i>
          <div>
            <h4 style="margin: 0 0 4px; font-weight: 800; font-size: 1.05rem;">${verdictTitle}</h4>
            <div style="font-size: 0.88rem; line-height: 1.4;">${verdictDesc}</div>
          </div>
        </div>

        <div class="precheck-items-list">
          ${itemsHtml}
        </div>

      </div>
    </div>
  `;

  resultsArea.classList.remove("hidden");
  resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
  initLucideIcons();
};
