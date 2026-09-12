// Didox Auditor Extension - Content Script (V2.1 Enhanced)
(function() {
  console.log("[Didox Auditor V2.1] Faollashdi. Fakturalar va Shartnomalar qo'llab-quvvatlanadi.");

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
        e.data.items.forEach(it => {
          if (!detectedPageItems.some(existing => existing.mxik === it.mxik && existing.qty === it.qty && existing.name === it.name)) {
            detectedPageItems.push(it);
          }
        });
        renderAuditResults(detectedPageItems, "da-results-container");
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

  // Clean numeric string (handles "1 000.00" -> 1000, "89 285.71" -> 89285.71)
  function parseCleanNumber(val) {
    if (!val) return 0;
    const s = String(val).trim().replace(/\s/g, "").replace(/,/g, ".");
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  }

  // Extract 17-digit MXIK from string (even with spaces or formatting)
  function extract17DigitMxik(str) {
    if (!str) return null;
    const m1 = str.match(/\b\d{17}\b/);
    if (m1) return m1[0];
    const candidates = str.match(/\b(?:\d[\s.-]?){17}\b/g);
    if (candidates) {
      for (const c of candidates) {
        const clean = c.replace(/\D/g, "");
        if (clean.length === 17) return clean;
      }
    }
    const cleanAll = str.replace(/\D/g, "");
    if (cleanAll.length === 17) return cleanAll;
    return null;
  }

  // Inject Floating Button & Modal
  function injectFloatingWidget() {
    if (document.getElementById("didox-auditor-floating-btn")) return;

    const btn = document.createElement("div");
    btn.id = "didox-auditor-floating-btn";
    btn.innerHTML = `
      <span>🛡️ Ombor Nazorati</span>
      <span class="badge-status">v2.1</span>
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
              <h3 class="da-title">Didox Ombor Nazorati (Faktura &amp; Shartnoma) <span style="font-size: 11px; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-weight: 700;">v2.1</span></h3>
              <div style="font-size: 11px; color: #64748b;">Imzolashdan oldin ombor qoldig'i va MXIK xatolarini tekshirish</div>
            </div>
          </div>
          <button class="da-close-btn" id="da-close-btn">&times;</button>
        </div>

        <!-- Mode Tabs -->
        <div class="da-tabs-nav">
          <button class="da-tab-btn active" id="da-tab-auto-btn">⚡ Avtomatik O'qish (Didox sahifasidan)</button>
          <button class="da-tab-btn" id="da-tab-paste-btn">📋 Nusxalab Tashlash (Ctrl+V)</button>
        </div>

        <div class="da-body">
          <!-- Mode 1: Auto Read Area -->
          <div id="da-pane-auto">
            <div class="da-action-bar">
              <button class="da-btn da-btn-primary" id="da-read-page-btn">
                🔍 Sahifadagi Tovarlarni O'qish &amp; Tekshirish
              </button>
              <a href="https://didox-auditor.vercel.app" target="_blank" class="da-btn da-btn-outline">
                🌐 To'liq Auditor Veb-Saytini Ochish
              </a>
            </div>

            <div id="da-results-container">
              <div style="text-align: center; color: #64748b; padding: 20px; line-height: 1.6;">
                Didoxda faktura yoki shartnoma ochilgan sahifada <strong>"🔍 Sahifadagi Tovarlarni O'qish &amp; Tekshirish"</strong> tugmasini bosing.<br>
                Kengaytma jadvaldagi tovarlar, 17 xonali MXIKlar va miqdorlarni o'qib, ombordagi qoldiq bilan solishtiradi.
              </div>
            </div>
          </div>

          <!-- Mode 2: Paste Area -->
          <div id="da-pane-paste" style="display: none;">
            <p style="font-size: 12px; color: #475569; margin: 0 0 8px; line-height: 1.5;">
              Didox jadvalidagi tovarlar qatorlarini sichqoncha bilan belgilab nusxalang (<strong>Ctrl+C</strong>) va quyidagi maydonga tashlang (<strong>Ctrl+V</strong>):
            </p>
            <textarea id="da-paste-input" rows="7" placeholder="Masalan, jadvaldan nusxalab tashlang:
Посуда фарфоровая столовая  04104013002000000  1000  89285
Держатель для сосок (JK BABY)  03926001020000000  50  8000" style="width: 100%; box-sizing: border-box; padding: 10px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: monospace; outline: none; margin-bottom: 10px;"></textarea>
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

  // Scrape Didox DOM for invoice and contract items
  function scrapeDidoxPageItems(doc = document) {
    const items = [];
    const processedRows = new Set();

    // 1. Search ALL inputs and textareas on page (Draft Creation / Edit Mode)
    const allInputs = doc.querySelectorAll("input, textarea");
    allInputs.forEach(inp => {
      const val = (inp.value || "").trim();
      const mxik = extract17DigitMxik(val);
      if (mxik) {
        const row = inp.closest("tr, .ant-table-row, [role='row'], .table-row, .row, form, div.ant-row") || inp.parentElement?.parentElement;
        if (row && !processedRows.has(row)) {
          processedRows.add(row);
          
          let name = "";
          let qty = 1;
          let price = 0;

          const rowInputs = row.querySelectorAll("input, textarea");
          rowInputs.forEach(ri => {
            if (ri === inp) return;
            const rVal = (ri.value || "").trim();
            if (extract17DigitMxik(rVal)) return; // another mxik
            
            const num = parseCleanNumber(rVal);
            if (!name && isNaN(num) && rVal.length > 2) {
              name = rVal;
            } else if (num > 0) {
              if (qty === 1 && num <= 100000) {
                qty = num;
              } else {
                price = num;
              }
            }
          });

          if (!name) {
            const cells = row.querySelectorAll("td, .ant-table-cell, div");
            cells.forEach(c => {
              const txt = (c.innerText || "").trim();
              if (!name && txt.length > 3 && isNaN(parseCleanNumber(txt)) && !txt.includes(mxik)) {
                name = txt;
              }
            });
          }

          items.push({
            name: name || "Tovar",
            mxik: mxik,
            qty: qty,
            price: price
          });
        }
      }
    });

    // 2. Search all table rows (View Mode: Invoices, Contracts, Specifications)
    const rows = doc.querySelectorAll("tr, .ant-table-row, [role='row'], .table-row, div.document-row");
    rows.forEach(tr => {
      if (processedRows.has(tr)) return;

      const cells = Array.from(tr.querySelectorAll("td, th, .ant-table-cell, div"));
      if (cells.length < 2) return;

      let mxik = null;
      let mxikCellIndex = -1;

      for (let i = 0; i < cells.length; i++) {
        const cText = (cells[i].innerText || "").trim();
        const foundMxik = extract17DigitMxik(cText);
        if (foundMxik) {
          mxik = foundMxik;
          mxikCellIndex = i;
          break;
        }
      }

      // If MXIK found in this row
      if (mxik) {
        processedRows.add(tr);

        // A) Find product name: check cell before MXIK or inside MXIK cell
        let name = "";
        if (mxikCellIndex > 0) {
          const prevText = (cells[mxikCellIndex - 1].innerText || "").trim();
          if (prevText.length > 2 && isNaN(parseCleanNumber(prevText))) {
            name = prevText;
          }
        }
        if (!name && cells[mxikCellIndex]) {
          const mText = cells[mxikCellIndex].innerText || "";
          const lines = mText.split(/[\n\r-]+/).map(l => l.trim()).filter(Boolean);
          const nonDigit = lines.find(l => l.length > 3 && isNaN(parseCleanNumber(l)));
          if (nonDigit) name = nonDigit;
        }
        if (!name) {
          for (let i = 0; i < cells.length; i++) {
            if (i === mxikCellIndex) continue;
            const t = (cells[i].innerText || "").trim();
            if (t.length > 3 && isNaN(parseCleanNumber(t)) && !t.includes(mxik) && !t.includes("дона") && !t.includes("штук") && !t.includes("кг")) {
              name = t;
              break;
            }
          }
        }

        // B) Find Quantity & Price in cells following MXIK
        let qty = 1;
        let price = 0;
        const numbersFound = [];

        for (let i = 0; i < cells.length; i++) {
          if (i === mxikCellIndex) continue;
          const raw = (cells[i].innerText || "").trim();
          if (!raw || raw.endsWith("%")) continue;
          if (i === 0 && cells.length > 3 && parseInt(raw) < 100) continue;

          const num = parseCleanNumber(raw);
          if (num > 0) {
            numbersFound.push(num);
          }
        }

        if (numbersFound.length >= 1) {
          qty = numbersFound[0];
        }
        if (numbersFound.length >= 2) {
          price = numbersFound[1];
        }

        items.push({
          name: name || "Tovar",
          mxik: mxik,
          qty: qty,
          price: price
        });
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
        iframe.contentWindow?.postMessage({ action: "DIDOX_AUDITOR_GET_ITEMS" }, "*");
      }
    });

    return items;
  }

  async function readAndAuditDidoxPage() {
    const container = document.getElementById("da-results-container");
    if (!container) return;

    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #4f46e5; font-size: 13px;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔎</div>
        Didox sahifasidagi tovarlar va jadvallar tahlil qilinmoqda...
      </div>
    `;

    const balances = await loadInventoryData();
    detectedPageItems = [];

    // 1. Direct document scrape
    const directItems = scrapeDidoxPageItems(document);
    detectedPageItems.push(...directItems);

    // 2. Broadcast to all iframes and wait briefly
    const iframes = document.querySelectorAll("iframe");
    if (iframes.length > 0) {
      iframes.forEach(iframe => {
        try {
          iframe.contentWindow?.postMessage({ action: "DIDOX_AUDITOR_GET_ITEMS" }, "*");
        } catch (e) {}
      });
      await new Promise(r => setTimeout(r, 400));
    }

    if (detectedPageItems.length === 0) {
      container.innerHTML = `
        <div style="padding: 18px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; color: #92400e; font-size: 13px; line-height: 1.6;">
          <div style="font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>⚠️</span> Didox sahifasida tovarlar jadvali avtomatik aniqlanmadi
          </div>
          Buning sababi sahifa himoyasi yoki tovarlar alohida freymda ekanligi bo'lishi mumkin.<br><br>
          👉 <strong>100% ishlaydigan eng oson usul:</strong> Tepada <strong>"📋 Nusxalab Tashlash"</strong> tugmasini bosing va Didoxdagi tovarlar jadvalini nusxalab (Ctrl+C &rarr; Ctrl+V) tashlang. Bir soniyada tekshirib beradi!
          <div style="margin-top: 14px;">
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

    renderAuditResults(detectedPageItems, "da-results-container");
  }

  function handlePastedTextAudit() {
    const textarea = document.getElementById("da-paste-input");
    const container = document.getElementById("da-paste-results");
    if (!textarea || !container) return;

    const val = textarea.value.trim();
    if (!val) {
      alert("Iltimos, avval Didoxdan nusxalangan jadval matnini tashlang!");
      return;
    }

    const items = [];
    const lines = val.split("\n").map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      const mxik = extract17DigitMxik(line);
      if (mxik) {
        const parts = line.split(/[\t,|;]/).map(p => p.trim()).filter(Boolean);
        let name = "";
        let qty = 1;
        let price = 0;

        parts.forEach(p => {
          if (p.includes(mxik)) return;
          const num = parseCleanNumber(p);
          if (!name && isNaN(num) && p.length > 2 && !p.includes("дона") && !p.includes("штук")) {
            name = p;
          } else if (num > 0) {
            if (qty === 1 && num <= 100000) {
              qty = num;
            } else {
              price = num;
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

    const balances = cachedBalances || await loadInventoryData();
    const balanceMap = {};
    balances.forEach(b => {
      balanceMap[b.mxik] = b;
    });

    let hasErrors = false;
    let errorCount = 0;

    const cardsHtml = items.map((it, idx) => {
      const stock = balanceMap[it.mxik];
      const available = stock ? stock.balanceQty : 0;
      const isShort = (available < it.qty);

      if (isShort) {
        hasErrors = true;
        errorCount++;
      }

      let altRecommendation = null;
      if (isShort) {
        const itWords = it.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const alt = balances.find(b => {
          if (b.mxik === it.mxik || b.balanceQty <= 0) return false;
          return itWords.some(w => 
            b.tasnif.toLowerCase().includes(w) || 
            b.productNames.some(pn => pn.toLowerCase().includes(w))
          );
        });
        if (alt) {
          altRecommendation = {
            mxik: alt.mxik,
            available: alt.balanceQty,
            name: alt.productNames[0] || alt.tasnif
          };
        }
      }

      return `
        <div class="da-card" style="margin-bottom: 12px; padding: 12px 14px; border: 1px solid ${isShort ? '#fca5a5' : '#86efac'}; background: ${isShort ? '#fff5f5' : '#f0fdf4'}; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <strong style="font-size: 13px; color: #1e293b;">${idx + 1}. ${it.name}</strong>
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
            Hujjatda: <strong>${it.qty} dona</strong> | Ombordagi bo'sh qoldiq: <strong>${available} dona</strong>
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
          <strong style="font-size: 14px;">TO'XTATING! Hujjatda ${errorCount} ta tovar bo'yicha ombor qoldig'i yetarli emas!</strong><br>
          Agar ushbu hujjatni hozir Didoxda imzolab yuborsangiz, omborda minus qoldiq paydo bo'ladi.
        </div>
      </div>
    ` : `
      <div class="da-alert-box da-alert-safe">
        <span style="font-size: 26px;">🟢</span>
        <div>
          <strong style="font-size: 14px;">100% XAVFSIZ: Barcha tovarlar omborda mavjud!</strong><br>
          Hujjatni Didoxda E-IMZO bilan bemalol imzolashingiz mumkin.
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
