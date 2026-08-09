/* ==========================================================================
   SIXTHCREST - ADMIN PORTAL MANAGEMENT SCRIPT
   ========================================================================== */

const defaultPricingConfig = {
  USD: { symbol: "$", code: "USD", shopify: 1200, webapp: 2000, seo: 800, ads: 1000, rate: 1.0 },
  INR: { symbol: "₹", code: "INR", shopify: 45000, webapp: 85000, seo: 25000, ads: 35000, rate: 85.0 },
  EUR: { symbol: "€", code: "EUR", shopify: 1100, webapp: 1850, seo: 750, ads: 920, rate: 0.92 },
  GBP: { symbol: "£", code: "GBP", shopify: 950, webapp: 1600, seo: 650, ads: 800, rate: 0.78 }
};

let currentEditingCurrency = "USD";
let leadsData = [];
let pricingConfigData = {};


document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  loadAdminDashboard();
});


// --- 1. Authentication Logic ---
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem("sixthcrest_admin_authenticated");
  const modal = document.getElementById("auth-modal");
  if (isAuth === "true") {
    modal.style.display = "none";
  } else {
    modal.style.display = "flex";
  }
}

function authenticateAdmin(e) {
  e.preventDefault();
  const inputPass = document.getElementById("admin-passcode-input").value;
  const errorMsg = document.getElementById("auth-error-msg");

  if (inputPass === "admin123" || inputPass === "sixthcrest2026") {
    sessionStorage.setItem("sixthcrest_admin_authenticated", "true");
    document.getElementById("auth-modal").style.display = "none";
    loadAdminDashboard();
  } else {
    errorMsg.style.display = "block";
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("sixthcrest_admin_authenticated");
  checkAdminAuth();
}


// --- 2. Dashboard Loading & Metrics ---
function loadAdminDashboard() {
  leadsData = JSON.parse(localStorage.getItem("sixthcrest_leads") || "[]");
  pricingConfigData = JSON.parse(localStorage.getItem("sixthcrest_pricing_config") || JSON.stringify(defaultPricingConfig));

  renderOverviewMetrics();
  renderLeadsTable();
  loadCurrencyConfig(currentEditingCurrency);
}

function renderOverviewMetrics() {
  const totalLeads = leadsData.length;
  const newLeads = leadsData.filter(l => l.status === "New").length;
  const progressLeads = leadsData.filter(l => l.status === "In Progress").length;

  document.getElementById("stat-total-leads").innerText = totalLeads;
  document.getElementById("stat-new-leads").innerText = newLeads;
  document.getElementById("stat-progress-leads").innerText = progressLeads;
  document.getElementById("leads-count-badge").innerText = totalLeads;

  // Pipeline estimation sum approximation
  let estSumUSD = totalLeads * 3500;
  document.getElementById("stat-pipeline-val").innerText = `$${estSumUSD.toLocaleString()}`;
}


// --- 3. Tab Navigation ---
function switchAdminTab(panelId, btnElem) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

  btnElem.classList.add("active");
  document.getElementById(panelId).classList.add("active");
}


// --- 4. Render Leads Table ---
function renderLeadsTable(filteredLeads = null) {
  const tbody = document.getElementById("leads-table-body");
  tbody.innerHTML = "";

  const listToRender = filteredLeads || leadsData;

  if (listToRender.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-text-muted); padding: 3rem;">No project inquiries found.</td></tr>`;
    return;
  }

  listToRender.forEach(lead => {
    const tr = document.createElement("tr");

    const dateStr = new Date(lead.createdAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });

    const statusClass = getStatusClass(lead.status);

    tr.innerHTML = `
      <td><strong style="color: var(--admin-accent-cyan); font-size: 0.82rem;">${lead.id}</strong></td>
      <td><strong>${escapeHtml(lead.name)}</strong></td>
      <td>
        <div>${escapeHtml(lead.email)}</div>
        <div style="font-size: 0.8rem; color: var(--admin-text-muted);">${escapeHtml(lead.domain || 'N/A')}</div>
      </td>
      <td><span class="admin-badge" style="display: inline-block;">${getServiceName(lead.service)}</span></td>
      <td>
        <div>${escapeHtml(lead.budget)}</div>
        <div style="font-size: 0.78rem; color: #10b981; font-weight: 600;">Est: ${escapeHtml(lead.estimatedPrice || 'N/A')}</div>
      </td>
      <td>
        <select class="status-select ${statusClass}" onchange="updateLeadStatus('${lead.id}', this.value)">
          <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
          <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed / Won</option>
        </select>
      </td>
      <td style="font-size: 0.85rem; color: var(--admin-text-muted);">${dateStr}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-admin btn-admin-secondary" style="padding: 0.35rem 0.65rem;" onclick="viewLeadDetails('${lead.id}')" title="View Details">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn-admin btn-admin-danger" style="padding: 0.35rem 0.65rem;" onclick="deleteLead('${lead.id}')" title="Delete Inquiry">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function getServiceName(code) {
  const map = {
    shopify: "Shopify Dev & CRO",
    webapp: "Custom SaaS / Web App",
    seo: "Advanced SEO Audit",
    ads: "Meta & Google Ads",
    all: "Full Retainer"
  };
  return map[code] || code;
}

function getStatusClass(status) {
  if (status === "New") return "status-new";
  if (status === "Contacted") return "status-contacted";
  if (status === "In Progress") return "status-progress";
  if (status === "Closed") return "status-closed";
  return "";
}

function updateLeadStatus(leadId, newStatus) {
  const target = leadsData.find(l => l.id === leadId);
  if (target) {
    target.status = newStatus;
    localStorage.setItem("sixthcrest_leads", JSON.stringify(leadsData));
    renderOverviewMetrics();
  }
}

function deleteLead(leadId) {
  if (confirm(`Are you sure you want to delete inquiry ${leadId}?`)) {
    leadsData = leadsData.filter(l => l.id !== leadId);
    localStorage.setItem("sixthcrest_leads", JSON.stringify(leadsData));
    renderOverviewMetrics();
    renderLeadsTable();
  }
}

function viewLeadDetails(leadId) {
  const lead = leadsData.find(l => l.id === leadId);
  if (!lead) return;

  document.getElementById("modal-lead-id").innerText = lead.id;
  document.getElementById("modal-lead-name").innerText = lead.name;
  document.getElementById("modal-lead-email").innerText = lead.email;
  document.getElementById("modal-lead-domain").innerText = lead.domain || "N/A";
  document.getElementById("modal-lead-service").innerText = getServiceName(lead.service);
  document.getElementById("modal-lead-budget").innerText = lead.budget;
  document.getElementById("modal-lead-estimate").innerText = lead.estimatedPrice || "N/A";
  document.getElementById("modal-lead-message").innerText = lead.message || "No custom message provided.";

  document.getElementById("lead-modal").style.display = "flex";
}

function closeLeadModal() {
  document.getElementById("lead-modal").style.display = "none";
}

function filterLeadsTable() {
  const query = document.getElementById("lead-search-input").value.toLowerCase();
  const statusFilter = document.getElementById("status-filter-select").value;

  const filtered = leadsData.filter(lead => {
    const matchesQuery = lead.name.toLowerCase().includes(query) ||
                         lead.email.toLowerCase().includes(query) ||
                         (lead.domain && lead.domain.toLowerCase().includes(query)) ||
                         lead.id.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  renderLeadsTable(filtered);
}


// --- 5. Export Leads CSV ---
function exportLeadsCSV() {
  if (leadsData.length === 0) {
    alert("No leads to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Name,Email,Domain,Service,Budget,EstimatedPrice,Status,CreatedAt,Message\n";

  leadsData.forEach(l => {
    const row = [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.domain || '').replace(/"/g, '""')}"`,
      `"${getServiceName(l.service)}"`,
      `"${l.budget}"`,
      `"${(l.estimatedPrice || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.createdAt}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `sixthcrest_leads_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// --- 6. Pricing Configurator Logic ---
function loadCurrencyConfig(currCode) {
  currentEditingCurrency = currCode;
  document.getElementById("editing-currency-code").innerText = currCode;

  const config = pricingConfigData[currCode] || defaultPricingConfig[currCode] || defaultPricingConfig.USD;

  document.getElementById("config-symbol").value = config.symbol;
  document.getElementById("config-shopify").value = config.shopify;
  document.getElementById("config-webapp").value = config.webapp;
  document.getElementById("config-seo").value = config.seo;
  document.getElementById("config-ads").value = config.ads;
}

function savePricingConfig(e) {
  e.preventDefault();

  const symbol = document.getElementById("config-symbol").value;
  const shopify = parseFloat(document.getElementById("config-shopify").value);
  const webapp = parseFloat(document.getElementById("config-webapp").value);
  const seo = parseFloat(document.getElementById("config-seo").value);
  const ads = parseFloat(document.getElementById("config-ads").value);

  if (!pricingConfigData[currentEditingCurrency]) {
    pricingConfigData[currentEditingCurrency] = {};
  }

  pricingConfigData[currentEditingCurrency] = {
    symbol,
    code: currentEditingCurrency,
    shopify,
    webapp,
    seo,
    ads
  };

  localStorage.setItem("sixthcrest_pricing_config", JSON.stringify(pricingConfigData));
  alert(`Pricing settings for ${currentEditingCurrency} saved successfully!\n\nThe live public cost estimator on index.html has been updated.`);
}

function resetPricingToDefault() {
  if (confirm("Reset all currency pricing configurations to factory defaults?")) {
    pricingConfigData = JSON.parse(JSON.stringify(defaultPricingConfig));
    localStorage.setItem("sixthcrest_pricing_config", JSON.stringify(pricingConfigData));
    loadCurrencyConfig(currentEditingCurrency);
    alert("Pricing configurations reset to defaults.");
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
