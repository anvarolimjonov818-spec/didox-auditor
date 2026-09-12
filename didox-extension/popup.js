
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

  async function fetchBalances() {
    try {
      const res = await fetch("https://didox-auditor.vercel.app/data_v2.js");
      const text = await res.text();
      const match = text.match(/window\.DIDOX_REAL_INVOICES\s*=\s*(\[.*?\]);/s);
      if (match) {
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
