
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("quickSearchInput");
  const resultsContainer = document.getElementById("quickSearchResults");

  let balances = [];

  chrome.storage.local.get(["didox_balances"], (res) => {
    if (res.didox_balances) {
      balances = res.didox_balances;
    } else {
      fetchBalances();
    }
  });

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
            outboundQty: 0,
            productNames: new Set()
          };
        }
        const m = mxikMap[mxik];
        const qty = parseFloat(it.qty) || 0;
        const name = (it.name || "").trim();
        if (name) m.productNames.add(name);
        if (isIn) {
          m.inboundQty += qty;
        } else {
          m.outboundQty += qty;
        }
      });
    });

    return Object.values(mxikMap).map(m => ({
      mxik: m.mxik,
      tasnif: m.tasnif,
      balanceQty: m.inboundQty - m.outboundQty,
      productNames: Array.from(m.productNames)
    }));
  }

  async function fetchBalances() {
    try {
      const res = await fetch("https://didox-auditor.vercel.app/data_v2.js");
      const text = await res.text();
      const match = text.match(/window\.DIDOX_REAL_INVOICES\s*=\s*(\[.*?\]);/s);
      if (match) {
        const invoices = JSON.parse(match[1]);
        balances = calculateBalances(invoices);
        chrome.storage.local.set({
          didox_balances: balances,
          didox_last_sync: Date.now()
        });
        document.getElementById("syncStatus").textContent = "Yangilandi";
      }
    } catch (e) {
      console.error(e);
    }
  }

  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q || q.length < 2) {
      resultsContainer.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">Tovar nomini yozing — ombordagi qoldig\'i chiqadi.</div>';
      return;
    }

    const matched = balances.filter(b => 
      b.mxik.includes(q) || 
      b.tasnif.toLowerCase().includes(q) || 
      b.productNames.some(p => p.toLowerCase().includes(q))
    ).slice(0, 8);

    if (matched.length === 0) {
      resultsContainer.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 15px;">Omborda tovar topilmadi</div>';
      return;
    }

    resultsContainer.innerHTML = matched.map(m => `
      <div class="res-item">
        <div style="font-weight: 600; color: #1e293b;">${m.productNames[0] || m.tasnif}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
          <code style="color: #4f46e5;">${m.mxik}</code>
          <strong style="color: ${m.balanceQty > 0 ? '#10b981' : '#ef4444'};">
            ${m.balanceQty > 0 ? '+' : ''}${m.balanceQty} dona
          </strong>
        </div>
      </div>
    `).join("");
  });
});
