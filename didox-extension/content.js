
// Didox Auditor Extension - Content Script (V2 Enhanced)
(function() {
  console.log("[Didox Auditor V2] Content script faollashdi.");

  let cachedBalances = null;
  let detectedPageItems = [];

  // If inside iframe, listen for extraction request from top frame
  if (window.self !== window.top) {
    window.addEventListener("message", (e) => {
      if (e.data && e.data.action === "DIDOX_AUDITOR_GET_ITEMS") {
        const found = scrapeDidoxPageItems(document);
        window.top.postMessage({ action: "DIDOX_AUDITOR_ITEMS_RESULT", items: found }, "*");
      }
    });
    return; // Don't inject floating button in sub-frames
  }

  // Top Frame: Listen for iframe results
  window.addEventListener("message", (e) => {
    if (e.data && e.data.action === "DIDOX_AUDITOR_ITEMS_RESULT" && Array.isArray(e.data.items)) {
      if (e.data.items.length > 0) {
        detectedPageItems.push(...e.data.items);
        renderAuditResults(detectedPageItems);
      }
    }
  });

  // Load verified inventory data from Vercel or cache
  async function loadInventoryData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["didox_balances", "didox_last_sync"], async (result) => {
        if (result.didox_balances && result.didox_last_sync && (Date.now() - result.didox_last_sync < 3600000)) {
          cachedBalances = result.didox_balances;
          resolve(cachedBalances);
          return;
        }

        try {
          const res = await fetch("https://didox-auditor.vercel.app/data_v2.js");
          const text = await res.text();
          const match = text.match(/window\.DIDOX_REAL_INVOICES\s*=\s*(\[.*?\]);/s);
          if (match) {
            const invoices = JSON.parse(match[1]);
            cachedBalances = calculateBalances(invoices);
            chrome.storage.local.set({
              didox_balances: cachedBalances,
              didox_last_sync: Date.now()
            });
            resolve(cachedBalances);
            return;
          }
        } catch (e) {
          console.warn("[Didox Auditor] Vercel bilan aloqa xatosi, lokal kesh ishlatiladi:", e);
        }

        cachedBalances = result.didox_balances || [];
        resolve(cachedBalances);
      });
    });
  }

  function calculateBalances(invoices) {
    const valid = invoices.filter(inv => {
      const st = String(inv.status || "").toLowerCase();
      if (st.includes("bekor") || st.includes("rad") || st.includes("annul") || st.includes("cancel")) return false;
      const inn = String(inv.partnerInn || "").trim();
      const pname = String(inv.partnerName || "").toLowerCase();
      if ((inn === "311519913" || pname.includes("sinamed")) && (inv.items || []).every(it => !it.price || it.price === 0)) return false;
      return (inv.items && inv.items.length > 0);
    });

    const groups = {};
    valid.forEach(inv => {
      const key = `${inv.type}_${inv.partnerInn}_${inv.docNo}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(inv);
    });

    const active = Object.values(groups).map(grp => {
      if (grp.length === 1) return grp[0];
      return grp.sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
    });

    const mxikMap = {};
    active.forEach(inv => {
      const isIn = (inv.type === "inbound");
      (inv.items || []).forEach(it => {
        const mxik = it.mxik;
        if (!mxik) return;
        if (!mxikMap[mxik]) {
          mxikMap[mxik] = {
            mxik: mxik,
            tasnif: it.tasnif || "",
            inboundQty: 0,
            inboundSum: 0,
            outboundQty: 0,
            outboundSum: 0,
            productNames: new Set(),
            subProducts: {}
          };
        }
        const m = mxikMap[mxik];
        const qty = parseFloat(it.qty) || 0;
        const price = parseFloat(it.price) || 0;
        const total = parseFloat(it.total) || (qty * price);
        const name = (it.name || "").trim();

        m.productNames.add(name);
        if (!m.subProducts[name]) m.subProducts[name] = { name: name, in: 0, out: 0 };

        if (isIn) {
          m.inboundQty += qty;
          m.inboundSum += total;
          m.subProducts[name].in += qty;
        } else {
          m.outboundQty += qty;
          m.outboundSum += total;
          m.subProducts[name].out += qty;
        }
      });
    });

    return Object.values(mxikMap).map(m => ({
      mxik: m.mxik,
      tasnif: m.tasnif,
      balanceQty: m.inboundQty - m.outboundQty,
      avgCost: m.inboundQty > 0 ? (m.inboundSum / m.inboundQty) : 0,
      productNames: Array.from(m.productNames),
      subProducts: Object.values(m.subProducts).map(sp => ({
        name: sp.name,
        balanceQty: sp.in - sp.out
      }))
    }));
  }

  // Inject Floating Button & Modal
  function injectFloatingWidget() {
    if (document.getElementById("didox-auditor-floating-btn")) return;

    const btn = document.createElement("div");
    btn.id = "didox-auditor-floating-btn";
    btn.innerHTML = `
      <span>🛡️ Ombor Nazorati</span>
      <span class="badge-status">Faol</span>
    `;
    btn.addEventListener("click", openAuditorPanel);
    document.body.appendChild(btn);

    const overlay = document.createElement("div");
    overlay.id = "didox-auditor-overlay";
    overlay.innerHTML = `
      <div id="didox-auditor-modal">
        <div class="da-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 22px;">🛡️</span>
            <div>
              <h3 class="da-title">Didox Fakturasini Ombor Bo'yicha Tekshirish</h3>
              <div style="font-size: 11px; color: #64748b;">Imzolashdan oldin minus qoldiq va MXIK xatolarini tekshirish</div>
            </div>
          </div>
          <button class="da-close-btn" id="da-close-btn">&times;</button>
        </div>

        <!-- Mode Tabs -->
        <div class="da-tabs-nav">
          <button class="da-tab-btn active" id="da-tab-auto-btn">⚡ Avtomatik O'qish (Didoxdan)</button>
          <button class="da-tab-btn" id="da-tab-paste-btn">📋 Nusxalab Tashlash (Ctrl+V)</button>
        </div>

        <div class="da-body">
          <!-- Mode 1: Auto Read Area -->
          <div id="da-pane-auto">
            <div class="da-action-bar">
              <button class="da-btn da-btn-primary" id="da-read-page-btn">
                🔍 Didox Sahifasidagi Tovarlarni O'qish &amp; Tekshirish
              </button>
              <a href="https://didox-auditor.vercel.app" target="_blank" class="da-btn da-btn-outline">
                🌐 To'liq Auditor Saytini Ochish
              </a>
            </div>

            <div id="da-results-container">
              <div style="text-align: center; color: #64748b; padding: 24px;">
                Didoxda faktura ochilgan sahifada <strong>"Tovarlarni O'qish &amp; Tekshirish"</strong> tugmasini bosing.<br>
                Kengaytma jadvaldagi tovarlar, 17 xonali MXIKlar va miqdorlarni o'qib, ombor qoldig'i bilan solishtiradi.
              </div>
            </div>
          </div>

          <!-- Mode 2: Paste Area -->
          <div id="da-pane-paste" style="display: none;">
            <p style="font-size: 12px; color: #475569; margin: 0 0 8px;">
              Didox jadvalidan tovarlarni sichqoncha bilan belgilab (<strong>Ctrl+C</strong>) qiling va quyidagi maydonga tashlang (<strong>Ctrl+V</strong>):
            </p>
            <textarea id="da-paste-input" rows="7" placeholder="Masalan:
Держатель для сосок (JK BABY)  03926001020000000  50  8000
Пластмассовый цепочка держатель  03926001020000000  10  10500" style="width: 100%; box-sizing: border-box; padding: 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: monospace; outline: none; margin-bottom: 10px;"></textarea>
            <button class="da-btn da-btn-success" id="da-run-paste-audit-btn" style="width: 100%; justify-content: center;">
              🔍 Joylashtirilgan Matnni Tekshirish
            </button>
            <div id="da-paste-results" style="margin-top: 14px;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("da-close-btn")?.addEventListener("click", closeAuditorPanel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAuditorPanel();
    });

    document.getElementById("da-read-page-btn")?.addEventListener("click", () => {
      detectedPageItems = [];
      readAndAuditDidoxPage();
    });

    // Tab switching
    document.getElementById("da-tab-auto-btn")?.addEventListener("click", () => {
      document.getElementById("da-tab-auto-btn")?.classList.add("active");
      document.getElementById("da-tab-paste-btn")?.classList.remove("active");
      document.getElementById("da-pane-auto").style.display = "block";
      document.getElementById("da-pane-paste").style.display = "none";
    });

    document.getElementById("da-tab-paste-btn")?.addEventListener("click", () => {
      document.getElementById("da-tab-paste-btn")?.classList.add("active");
      document.getElementById("da-tab-auto-btn")?.classList.remove("active");
      document.getElementById("da-pane-auto").style.display = "none";
      document.getElementById("da-pane-paste").style.display = "block";
    });

    document.getElementById("da-run-paste-audit-btn")?.addEventListener("click", handlePastedTextAudit);
  }

  function openAuditorPanel() {
    document.getElementById("didox-auditor-overlay")?.classList.add("active");
    loadInventoryData();
  }

  function closeAuditorPanel() {
    document.getElementById("didox-auditor-overlay")?.classList.remove("active");
  }

  // Scrape Didox DOM for invoice items (Checks inputs, tables, divs, and iframes)
  function scrapeDidoxPageItems(doc = document) {
    const items = [];
    const processedElements = new Set();

    // 1. Search ALL inputs and textareas on page where value is or contains a 17-digit MXIK
    const allInputs = doc.querySelectorAll("input, textarea");
    allInputs.forEach(inp => {
      const val = (inp.value || "").trim();
      const cleanVal = val.replace(/\D/g, "");
      if (cleanVal.length === 17) {
        // This is an MXIK input field!
        const row = inp.closest("tr, .ant-table-row, [role='row'], .table-row, .row, form, div.ant-row") || inp.parentElement?.parentElement;
        if (row && !processedElements.has(row)) {
          processedElements.add(row);
          
          let name = "";
          let qty = 1;
          let price = 0;

          // Find other inputs in the same row
          const rowInputs = row.querySelectorAll("input, textarea");
          rowInputs.forEach(ri => {
            if (ri === inp) return;
            const rVal = (ri.value || "").trim();
            if (rVal.replace(/\D/g, "").length === 17) return; // another mxik
            
            if (!name && isNaN(rVal) && rVal.length > 2) {
              name = rVal;
            } else if (!isNaN(rVal) && parseFloat(rVal) > 0) {
              if (qty === 1 && parseFloat(rVal) <= 100000) {
                qty = parseFloat(rVal);
              } else {
                price = parseFloat(rVal);
              }
            }
          });

          // If name not in inputs, check cell text
          if (!name) {
            const cells = row.querySelectorAll("td, .ant-table-cell, div");
            cells.forEach(c => {
              const txt = (c.innerText || "").trim();
              if (!name && txt.length > 3 && isNaN(txt) && !txt.includes(cleanVal)) {
                name = txt;
              }
            });
          }

          items.push({
            name: name || "Tovar",
            mxik: cleanVal,
            qty: qty,
            price: price
          });
        }
      }
    });

    // 2. Search all table rows or blocks where text contains a 17-digit number (View mode)
    const rows = doc.querySelectorAll("tr, .ant-table-row, [role='row'], .table-row, div.document-row");
    rows.forEach(tr => {
      if (processedElements.has(tr)) return;

      const fullText = (tr.innerText || "") + " " + Array.from(tr.querySelectorAll("input")).map(i => i.value).join(" ");
      const match = fullText.match(/\b\d{17}\b/) || fullText.match(/\b\d{5}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{5,6}\b/);

      if (match) {
        const mxik = match[0].replace(/\D/g, "");
        if (mxik.length === 17) {
          processedElements.add(tr);

          let name = "";
          let qty = 1;
          let price = 0;

          const cells = tr.querySelectorAll("td, .ant-table-cell, div");
          cells.forEach(c => {
            const txt = (c.innerText || "").trim();
            if (!name && txt.length > 3 && isNaN(txt) && !txt.includes(mxik)) {
              name = txt;
            } else if (!isNaN(txt) && parseFloat(txt) > 0) {
              const num = parseFloat(txt);
              if (qty === 1 && num <= 100000) {
                qty = num;
              } else {
                price = num;
              }
            }
          });

          items.push({
            name: name || "Tovar",
            mxik: mxik,
            qty: qty,
            price: price
          });
        }
      }
    });

    // 3. Search accessible iframes
    const iframes = doc.querySelectorAll("iframe");
    iframes.forEach(iframe => {
      try {
        const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iDoc) {
          const iItems = scrapeDidoxPageItems(iDoc);
          items.push(...iItems);
        }
      } catch (e) {
        // Cross-origin iframe: trigger postMessage
        iframe.contentWindow?.postMessage({ action: "DIDOX_AUDITOR_GET_ITEMS" }, "*");
      }
    });

    return items;
  }

  async function readAndAuditDidoxPage() {
    const container = document.getElementById("da-results-container");
    if (!container) return;

    container.innerHTML = `<div style="text-align: center; padding: 20px;">🔎 Didox sahifasidagi tovarlar tahlil qilinmoqda...</div>`;

    const balances = await loadInventoryData();
    const items = scrapeDidoxPageItems(document);

    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding: 18px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; color: #92400e; font-size: 13px; line-height: 1.6;">
          <div style="font-weight: 700; margin-bottom: 6px;">⚠️ Didox sahifasida tovarlar jadvali avtomatik topilmadi</div>
          Buning sababi Didox sahifasi to'liq yuklanmagan yoki tovarlar alohida oynada bo'lishi mumkin.<br><br>
          👉 <strong>Yechim juda oson:</strong> Tepada <strong>"📋 Nusxalab Tashlash"</strong> tugmasini bosing va Didoxdagi tovarlar jadvalini nusxalab (Ctrl+V) qiling. Bir zumda tekshirib beramiz!
          <div style="margin-top: 12px;">
            <button class="da-btn da-btn-primary" id="da-goto-paste-btn">
              📋 Nusxalab Tashlash oynasiga o'tish &rarr;
            </button>
          </div>
        </div>
      `;
      document.getElementById("da-goto-paste-btn")?.addEventListener("click", () => {
        document.getElementById("da-tab-paste-btn")?.click();
      });
      return;
    }

    renderAuditResults(items, "da-results-container");
  }

  function handlePastedTextAudit() {
    const textarea = document.getElementById("da-paste-input");
    const container = document.getElementById("da-paste-results");
    if (!textarea || !container) return;

    const val = textarea.value.trim();
    if (!val) {
      alert("Iltimos, avval Didoxdan nusxalangan matnni tashlang!");
      return;
    }

    // Parse pasted text for 17-digit MXIKs and lines
    const items = [];
    const lines = val.split("\n").map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      const mxikMatch = line.match(/\b\d{17}\b/);
      if (mxikMatch) {
        const mxik = mxikMatch[0];
        const parts = line.split(/[\t,|;]/).map(p => p.trim()).filter(Boolean);
        let name = "";
        let qty = 1;
        let price = 0;

        parts.forEach(p => {
          if (p.includes(mxik)) return;
          if (!name && isNaN(p) && p.length > 2) {
            name = p;
          } else if (!isNaN(p) && parseFloat(p) > 0) {
            if (qty === 1 && parseFloat(p) <= 100000) {
              qty = parseFloat(p);
            } else {
              price = parseFloat(p);
            }
          }
        });

        if (!name) {
          name = line.replace(mxik, "").replace(/[0-9.,\t|;]/g, " ").trim();
        }

        items.push({
          name: name || "Tovar",
          mxik: mxik,
          qty: qty,
          price: price
        });
      }
    });

    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding: 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 12px;">
          ❌ Matnda 17 xonali MXIK kodlari aniqlanmadi. Iltimos, Didoxdagi tovarlar jadvalini to'liq nusxalab tashlang.
        </div>
      `;
      return;
    }

    renderAuditResults(items, "da-paste-results");
  }

  async function renderAuditResults(items, containerId = "da-results-container") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const balances = await loadInventoryData();
    let hasErrors = false;
    let errorCount = 0;

    const cardsHtml = items.map((it, idx) => {
      const mxikEntry = balances.find(b => b.mxik === it.mxik);
      const available = mxikEntry ? mxikEntry.balanceQty : 0;
      const isShort = available < it.qty;

      let altRecommendation = null;
      if (isShort) {
        hasErrors = true;
        errorCount++;

        // Search alternative MXIK in active balances
        const searchTerms = it.name.toLowerCase().split(/[\s,()"/]+/).filter(w => w.length > 2);
        for (const b of balances) {
          if (b.mxik === it.mxik || b.balanceQty <= 0) continue;
          for (const p of b.productNames) {
            const pLower = p.toLowerCase();
            const score = searchTerms.filter(t => pLower.includes(t)).length;
            if (score >= Math.min(2, searchTerms.length)) {
              altRecommendation = {
                mxik: b.mxik,
                tasnif: b.tasnif,
                available: b.balanceQty
              };
              break;
            }
          }
          if (altRecommendation) break;
        }
      }

      return `
        <div class="da-card ${isShort ? 'da-card-danger' : 'da-card-safe'}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <strong>#${idx + 1} ${it.name}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
                MXIK: <code style="font-weight: 600; color: #4f46e5;">${it.mxik}</code>
              </div>
            </div>
            <div>
              ${isShort 
                ? `<span class="da-badge da-badge-danger">🔴 Yetmaydi (Omborda: ${available})</span>` 
                : `<span class="da-badge da-badge-success">🟢 Yetarli (Omborda: +${available})</span>`}
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #334155;">
            Fakturada: <strong>${it.qty} dona</strong> | Ombordagi bo'sh qoldiq: <strong>${available} dona</strong>
          </div>
          ${isShort ? `
            <div style="margin-top: 8px; font-size: 11px; color: #b91c1c; font-weight: 600;">
              ⚠️ Agar imzolansa, omborda -${it.qty - available} dona MINUS paydo bo'ladi!
            </div>
          ` : ''}
          ${altRecommendation ? `
            <div style="margin-top: 10px; padding: 8px 12px; background: #ecfdf5; border: 1px dashed #10b981; border-radius: 6px; font-size: 11px; color: #065f46;">
              💡 <strong>Tavsiya etilgan to'g'ri MXIK:</strong> <code>${altRecommendation.mxik}</code> (Omborda: <strong>+${altRecommendation.available} ta</strong> mavjud!)
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    const verdictBanner = hasErrors ? `
      <div class="da-alert-box da-alert-danger">
        <span style="font-size: 26px;">🔴</span>
        <div>
          <strong style="font-size: 14px;">TO'XTATING! Fakturada ${errorCount} ta tovar bo'yicha qoldiq yetarli emas!</strong><br>
          Agar ushbu fakturani hozir Didoxda imzolab yuborsangiz, omborda minus qoldiq paydo bo'ladi.
        </div>
      </div>
    ` : `
      <div class="da-alert-box da-alert-safe">
        <span style="font-size: 26px;">🟢</span>
        <div>
          <strong style="font-size: 14px;">100% XAVFSIZ: Barcha tovarlar omborda mavjud!</strong><br>
          Fakturani Didoxda E-IMZO bilan bemalol imzolashingiz mumkin.
        </div>
      </div>
    `;

    container.innerHTML = `
      ${verdictBanner}
      <div style="font-weight: 700; margin-bottom: 10px; font-size: 13px;">Tekshirilgan tovarlar (${items.length} ta):</div>
      ${cardsHtml}
    `;
  }

  // Auto init
  window.addEventListener("load", () => {
    setTimeout(injectFloatingWidget, 1000);
  });
  setTimeout(injectFloatingWidget, 2000);
})();
