
// Didox Auditor Extension - Content Script
(function() {
  console.log("[Didox Auditor] Kengaytma ishga tushdi.");

  let cachedBalances = null;

  // Fetch or get cached inventory from vercel site
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
          console.warn("[Didox Auditor] Vercel bilan aloqa xatosi, saqlangan ma'lumot ishlatiladi:", e);
        }

        if (result.didox_balances) {
          cachedBalances = result.didox_balances;
        } else {
          cachedBalances = [];
        }
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

  // Create UI elements
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
          <h3 class="da-title">🛡️ Didox Fakturasini Ombor Bo'yicha Tekshirish</h3>
          <button class="da-close-btn" id="da-close-btn">&times;</button>
        </div>
        <div class="da-body">
          <div class="da-action-bar">
            <button class="da-btn da-btn-primary" id="da-read-page-btn">
              ⚡ Didox Sahifasidagi Tovarlarni O'qish &amp; Tekshirish
            </button>
            <a href="https://didox-auditor.vercel.app" target="_blank" class="da-btn da-btn-outline">
              🌐 To'liq Auditor Veb-Saytini Ochish
            </a>
          </div>
          <div id="da-results-container">
            <div style="text-align: center; color: #64748b; padding: 30px;">
              Didoxda faktura ochilgan sahifada <strong>"Tovarlarni O'qish &amp; Tekshirish"</strong> tugmasini bosing.<br>
              Kengaytma jadvaldagi tovarlar, MXIKlar va miqdorlarni o'qib, ombor qoldig'i bilan solishtiradi.
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("da-close-btn")?.addEventListener("click", closeAuditorPanel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAuditorPanel();
    });
    document.getElementById("da-read-page-btn")?.addEventListener("click", readAndAuditDidoxPage);
  }

  function openAuditorPanel() {
    document.getElementById("didox-auditor-overlay")?.classList.add("active");
    loadInventoryData();
  }

  function closeAuditorPanel() {
    document.getElementById("didox-auditor-overlay")?.classList.remove("active");
  }

  // Scrape items from Didox active web page
  function scrapeDidoxPageItems() {
    const items = [];
    
    // Search table rows in Didox document
    const rows = document.querySelectorAll("table tr, .ant-table-row, [role='row']");
    rows.forEach(tr => {
      const text = tr.innerText || "";
      // Check if row has a 17-digit number (MXIK)
      const mxikMatch = text.match(/\b\d{17}\b/);
      if (mxikMatch) {
        const mxik = mxikMatch[0];
        
        // Find inputs in this row
        const inputs = tr.querySelectorAll("input, textarea");
        let name = "";
        let qty = 1;
        let price = 0;

        inputs.forEach(inp => {
          const val = inp.value.trim();
          if (/^\d{17}$/.test(val)) return; // MXIK
          if (!name && val.length > 2 && isNaN(val)) {
            name = val;
          } else if (!isNaN(val) && parseFloat(val) > 0) {
            if (qty === 1 && parseFloat(val) <= 100000) {
              qty = parseFloat(val);
            } else {
              price = parseFloat(val);
            }
          }
        });

        if (!name) {
          // Fallback to text inside cells
          const cells = tr.querySelectorAll("td");
          cells.forEach(td => {
            const txt = td.innerText.trim();
            if (txt.length > 3 && isNaN(txt) && !txt.includes(mxik)) {
              if (!name) name = txt;
            }
          });
        }

        items.push({
          name: name || "Tovar",
          mxik: mxik,
          qty: qty,
          price: price,
          domElement: tr
        });
      }
    });

    return items;
  }

  async function readAndAuditDidoxPage() {
    const container = document.getElementById("da-results-container");
    if (!container) return;

    container.innerHTML = `<div style="text-align: center; padding: 20px;">🔎 Didox sahifasi tahlil qilinmoqda...</div>`;

    const balances = await loadInventoryData();
    const items = scrapeDidoxPageItems();

    if (items.length === 0) {
      container.innerHTML = `
        <div style="padding: 20px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; color: #92400e;">
          ⚠️ Didox sahifasida tovarlar jadvali aniqlanmadi.<br>
          Iltimos, Didoxda faktura tuzish (yoki ko'rish) sahifasida ekanligingizni tekshiring.<br><br>
          <a href="https://didox-auditor.vercel.app" target="_blank" style="color: #4f46e5; font-weight: 600;">
            Yoki saytimizdagi "Fakturani Tekshirish" bo'limidan foydalaning &rarr;
          </a>
        </div>
      `;
      return;
    }

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

        // Search alternative MXIK
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
                ? `<span class="da-badge da-badge-danger">🔴 Yetmaydi (Qoldiq: ${available})</span>` 
                : `<span class="da-badge da-badge-success">🟢 Yetarli (Qoldiq: +${available})</span>`}
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #334155;">
            Fakturada: <strong>${it.qty} dona</strong> | Omborda: <strong>${available} dona</strong>
          </div>
          ${isShort ? `
            <div style="margin-top: 8px; font-size: 11px; color: #b91c1c;">
              ⚠️ Imzolansa, omborda -${it.qty - available} dona MINUS paydo bo'ladi!
            </div>
          ` : ''}
          ${altRecommendation ? `
            <div style="margin-top: 10px; padding: 8px 12px; background: #ecfdf5; border: 1px dashed #10b981; border-radius: 6px; font-size: 11px; color: #065f46;">
              💡 <strong>Tavsiya etilgan to'g'ri MXIK:</strong> ${altRecommendation.mxik} (Omborda: +${altRecommendation.available} ta bor!)
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    const verdictBanner = hasErrors ? `
      <div class="da-alert-box da-alert-danger">
        <span style="font-size: 24px;">🔴</span>
        <div>
          <strong>TO'XTATING! Fakturada ${errorCount} ta tovar bo'yicha qoldiq yetarli emas!</strong><br>
          Agar hozir Didoxda imzolab yuborsangiz, omboringizda minus qoldiq paydo bo'ladi.
        </div>
      </div>
    ` : `
      <div class="da-alert-box da-alert-safe">
        <span style="font-size: 24px;">🟢</span>
        <div>
          <strong>100% XAVFSIZ: Barcha tovarlar omborda mavjud!</strong><br>
          Fakturani Didoxda E-IMZO bilan bemalol imzolashingiz mumkin.
        </div>
      </div>
    `;

    container.innerHTML = `
      ${verdictBanner}
      <div style="font-weight: 700; margin-bottom: 10px; font-size: 14px;">Didoxdan topilgan tovarlar (${items.length} ta):</div>
      ${cardsHtml}
    `;
  }

  // Initialize widget on page load
  window.addEventListener("load", () => {
    setTimeout(injectFloatingWidget, 1500);
  });
  setTimeout(injectFloatingWidget, 2000);
})();
