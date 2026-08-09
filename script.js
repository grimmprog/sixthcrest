/* ==========================================================================
   SIXTHCREST - AGENCY & PORTFOLIO INTERACTIVE SCRIPT
   Location-Based Pricing & Lead Management Sync
   ========================================================================== */

// --- Default Regional Pricing Configuration ---
const defaultPricingConfig = {
  USD: { symbol: "$", code: "USD", shopify: 1200, webapp: 2000, seo: 800, ads: 1000, rate: 1.0 },
  INR: { symbol: "₹", code: "INR", shopify: 45000, webapp: 85000, seo: 25000, ads: 35000, rate: 85.0 },
  EUR: { symbol: "€", code: "EUR", shopify: 1100, webapp: 1850, seo: 750, ads: 920, rate: 0.92 },
  GBP: { symbol: "£", code: "GBP", shopify: 950, webapp: 1600, seo: 650, ads: 800, rate: 0.78 }
};

// Seed sample leads if none exist
const initialSeedLeads = [
  {
    id: "LEAD-101",
    name: "Dr. Rajesh Sharma",
    email: "rajesh@rxdoctor.in",
    domain: "rxdoctor.in",
    service: "webapp",
    budget: "$2,500 - $5,000",
    message: "Interested in expanding clinic EMR system and multi-branch features.",
    currency: "INR",
    estimatedPrice: "₹85,000 - ₹1,20,000",
    status: "In Progress",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "LEAD-102",
    name: "Vikram Mehta",
    email: "vikram@politico.fit",
    domain: "politico.fit",
    service: "shopify",
    budget: "$5,000 - $10,000",
    message: "Looking for Shopify CRO optimization and high-converting fashion ad campaign.",
    currency: "USD",
    estimatedPrice: "$2,500 - $3,800",
    status: "New",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "LEAD-103",
    name: "Sarah Jenkins",
    email: "sarah@uptimebunny.com",
    domain: "uptimebunny.com",
    service: "seo",
    budget: "$1,000 - $2,500",
    message: "Need technical SEO audit and core web vitals optimization for SaaS status page.",
    currency: "USD",
    estimatedPrice: "$800 - $1,200",
    status: "Contacted",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

// Active State Variables
let currentCurrency = "USD";
let pricingConfig = getPricingConfig();


// --- Portfolio Case Study Database ---
const portfolioData = {
  rxdoctor: {
    title: "RxDoctor - Clinic Management SaaS & EMR Platform",
    category: "Healthcare SaaS",
    image: "assets/rxdoctor.png",
    link: "https://rxdoctor.in",
    domain: "rxdoctor.in / app.rxdoctor.in",
    description: "Full-stack digital healthcare suite offering OPD queue management, digital EMR prescription generation, patient appointment scheduling, and automated symptom diagnostics.",
    challenge: "Doctors and clinic operators needed a lightning-fast, zero-friction system to manage OPD patient queues and generate e-prescriptions without slow load times or complex interfaces.",
    solution: "SixthCrest engineered a decoupled React frontend and high-concurrency Python/Node backend with offline-first state syncing, intuitive prescription builders, and automated WhatsApp/SMS reminders.",
    metrics: [
      "Processed over 10,000+ digital OPD patient records",
      "Reduced patient queue waiting times by 45%",
      "Sub-second e-prescription generation speed",
      "Multi-branch clinic context switching for doctors"
    ]
  },
  uptimebunny: {
    title: "Uptime Bunny - Real-time Server & API Monitor",
    category: "Monitoring SaaS",
    image: "assets/uptimebunny.png",
    link: "https://uptimebunny.com",
    domain: "uptimebunny.com",
    description: "Global website uptime, SSL certificate, and API monitoring engine with instant multi-channel alerts via Telegram, Email, and custom status pages.",
    challenge: "Modern web businesses lose thousands of dollars per minute of undetected downtime and require instant notifications when servers or SSL certificates fail.",
    solution: "Built a distributed ping agent network with 60-second ping cycles, automated Telegram bot alert integrations, SSL expiry counters, and public status page hosting.",
    metrics: [
      "Maintained 99.99% monitoring engine uptime across 50,000+ pings",
      "Instant Telegram alerts delivered in under 1.5 seconds",
      "Zero false-positive alert rate with consensus verification",
      "Automated Linux metric monitoring integration"
    ]
  },
  goroomz: {
    title: "GoRoomz - Hostel & PG Accommodation Finder",
    category: "Booking Platform",
    image: "assets/goroomz.png",
    link: "https://goroomz.in",
    domain: "goroomz.in",
    description: "Direct accommodation marketplace connecting students and working professionals with verified PG and hostel owners without middlemen brokerage fees.",
    challenge: "Room seekers in tech hubs faced high brokerage fees, inaccurate room photos, and lack of direct owner communication.",
    solution: "Designed a fast map-based search portal with direct host WhatsApp messaging, verified amenity badges, and host property management dashboards.",
    metrics: [
      "Zero-brokerage direct booking model for students & professionals",
      "Increased host inquiry conversion rate by 60%",
      "Sub-100ms search filter response times",
      "Mobile-optimized progressive web app interface"
    ]
  },
  politicofit: {
    title: "Politico Fit - Luxury Menswear Designer Storefront",
    category: "Shopify E-Commerce",
    image: "assets/politico_fit.png",
    link: "https://politico.fit",
    domain: "politico.fit",
    description: "Bespoke high-end fashion e-commerce experience showcasing premium menswear, luxury fabrics, and customized fit selections.",
    challenge: "The brand needed a high-end luxury aesthetic that matched their physical Jubilee Hills boutique while delivering blazing fast mobile performance.",
    solution: "Created a custom liquid Shopify theme with rich typography, interactive fabric zoom, streamlined single-page cart drawer, and Meta pixel tracking.",
    metrics: [
      "Boosted e-commerce conversion rate by +42%",
      "Achieved 95+ mobile Core Web Vitals score on Shopify",
      "Integrated custom size fitting algorithm for buyers",
      "Scaled ad campaign ROAS to 4.5x on Meta Ads"
    ]
  },
  bananaz: {
    title: "Bananaz - Organic Banana Fibre Luxury Apparel & Accessories",
    category: "Eco Luxury E-Commerce",
    image: "assets/bananaz.png",
    link: "https://bananaz.in",
    domain: "bananaz.in",
    description: "Production-ready eco-luxury fashion storefront specializing in sustainable designer clothing and high-end fashion accessories crafted from natural banana fibre.",
    challenge: "Showcasing the premium organic feel and luxury appeal of banana fibre textiles while building a high-converting e-commerce purchase funnel.",
    solution: "SixthCrest engineered a bespoke e-commerce experience featuring sustainable fabric storytelling, rich detail showcases, custom size fit recommenders, and seamless checkout optimization.",
    metrics: [
      "100% Organic & Sustainable Banana Fibre Showcase",
      "+55% E-Commerce Conversion Rate Improvement",
      "Sub-second page load times for luxury photo galleries",
      "Integrated multi-currency & global shipping checkout"
    ]
  }
};


// --- DOM Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initLeadsStorage();
  initTheme();
  detectUserLocationAndCurrency();
  initPortfolioFilter();
  calculateEstimate();
  initHeaderScroll();
});


// Helper to read current pricing config from localStorage or default
function getPricingConfig() {
  const saved = localStorage.getItem("sixthcrest_pricing_config");
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { }
  }
  return defaultPricingConfig;
}

// Seed leads storage
function initLeadsStorage() {
  if (!localStorage.getItem("sixthcrest_leads")) {
    localStorage.setItem("sixthcrest_leads", JSON.stringify(initialSeedLeads));
  }
}


// Budget Range Mapping per Currency
const currencyBudgetMap = {
  USD: [
    { value: "$1,000 - $2,500", text: "$1,000 - $2,500" },
    { value: "$2,500 - $5,000", text: "$2,500 - $5,000", selected: true },
    { value: "$5,000 - $10,000", text: "$5,000 - $10,000" },
    { value: "$10,000+", text: "$10,000+ Enterprise" }
  ],
  INR: [
    { value: "₹50,000 - ₹1,00,000", text: "₹50,000 - ₹1,00,000" },
    { value: "₹1,00,000 - ₹2,50,000", text: "₹1,00,000 - ₹2,50,000", selected: true },
    { value: "₹2,50,000 - ₹5,00,000", text: "₹2,50,000 - ₹5,00,000" },
    { value: "₹5,00,000+", text: "₹5,00,000+ Enterprise" }
  ],
  EUR: [
    { value: "€1,000 - €2,500", text: "€1,000 - €2,500" },
    { value: "€2,500 - €5,000", text: "€2,500 - €5,000", selected: true },
    { value: "€5,000 - €10,000", text: "€5,000 - €10,000" },
    { value: "€10,000+", text: "€10,000+ Enterprise" }
  ],
  GBP: [
    { value: "£800 - £2,000", text: "£800 - £2,000" },
    { value: "£2,000 - £4,000", text: "£2,000 - £4,000", selected: true },
    { value: "£4,000 - £8,000", text: "£4,000 - £8,000" },
    { value: "£8,000+", text: "£8,000+ Enterprise" }
  ]
};

const packagePricingMap = {
  USD: { starter: "$2,500", growth: "$4,800", enterprise: "$8,500<span style='font-size: 1rem; font-weight: 500;'>/mo</span>" },
  INR: { starter: "₹1,85,000", growth: "₹3,50,000", enterprise: "₹6,50,000<span style='font-size: 1rem; font-weight: 500;'>/mo</span>" },
  EUR: { starter: "€2,300", growth: "€4,400", enterprise: "€7,800<span style='font-size: 1rem; font-weight: 500;'>/mo</span>" },
  GBP: { starter: "£1,950", growth: "£3,800", enterprise: "£6,800<span style='font-size: 1rem; font-weight: 500;'>/mo</span>" }
};

function updatePackagePricingCards(currCode) {
  const pkgs = packagePricingMap[currCode] || packagePricingMap.USD;
  const starterEl = document.getElementById("pkg-price-starter");
  const growthEl = document.getElementById("pkg-price-growth");
  const enterpriseEl = document.getElementById("pkg-price-enterprise");

  if (starterEl) starterEl.innerHTML = pkgs.starter;
  if (growthEl) growthEl.innerHTML = pkgs.growth;
  if (enterpriseEl) enterpriseEl.innerHTML = pkgs.enterprise;
}

function updateContactFormBudgetOptions(currCode) {
  const budgetSelect = document.getElementById("client-budget");
  if (!budgetSelect) return;

  const options = currencyBudgetMap[currCode] || currencyBudgetMap.USD;
  budgetSelect.innerHTML = "";

  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt.value;
    el.innerText = opt.text;
    if (opt.selected) el.selected = true;
    budgetSelect.appendChild(el);
  });
}

// --- 1. Location & Currency Switcher Logic ---
function detectUserLocationAndCurrency() {
  const savedCurrency = localStorage.getItem("sixthcrest_currency");
  const currencySelect = document.getElementById("currency-select");

  if (savedCurrency && pricingConfig[savedCurrency]) {
    currentCurrency = savedCurrency;
    if (currencySelect) currencySelect.value = savedCurrency;
    updateContactFormBudgetOptions(currentCurrency);
    updatePackagePricingCards(currentCurrency);
    calculateEstimate();
    return;
  }

  // Attempt auto-location detection via lightweight IP API
  fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) })
    .then(res => res.json())
    .then(data => {
      if (data && data.country_code) {
        if (data.country_code === "IN") {
          currentCurrency = "INR";
        } else if (["DE", "FR", "ES", "IT", "NL", "BE", "AT", "IE"].includes(data.country_code)) {
          currentCurrency = "EUR";
        } else if (data.country_code === "GB") {
          currentCurrency = "GBP";
        } else {
          currentCurrency = "USD";
        }
      }
      if (currencySelect) currencySelect.value = currentCurrency;
      localStorage.setItem("sixthcrest_currency", currentCurrency);
      updateContactFormBudgetOptions(currentCurrency);
      updatePackagePricingCards(currentCurrency);
      calculateEstimate();
    })
    .catch(() => {
      // Fallback default
      currentCurrency = "USD";
      if (currencySelect) currencySelect.value = currentCurrency;
      updateContactFormBudgetOptions(currentCurrency);
      updatePackagePricingCards(currentCurrency);
      calculateEstimate();
    });
}

function changeCurrency(newCurrency) {
  if (pricingConfig[newCurrency]) {
    currentCurrency = newCurrency;
    localStorage.setItem("sixthcrest_currency", newCurrency);
    updateContactFormBudgetOptions(currentCurrency);
    updatePackagePricingCards(currentCurrency);
    calculateEstimate();
  }
}


// --- 2. Theme Switcher Logic ---
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const savedTheme = localStorage.getItem("sixthcrest_theme") || "dark";

  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("sixthcrest_theme", newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById("theme-icon");
  if (themeIcon) {
    themeIcon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }
}


// --- 3. Portfolio Filtering ---
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      projectCards.forEach(card => {
        const category = card.getAttribute("data-category");
        if (filterValue === "all" || category === filterValue) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}


// --- 4. Case Study Modal Logic ---
function openProjectModal(projectKey) {
  const project = portfolioData[projectKey];
  if (!project) return;

  const modalImg = document.getElementById("modal-img");
  const modalTitle = document.getElementById("modal-title");
  const modalCategory = document.getElementById("modal-category");
  const modalDesc = document.getElementById("modal-desc");
  const modalChallenge = document.getElementById("modal-challenge");
  const modalSolution = document.getElementById("modal-solution");
  const linkElem = document.getElementById("modal-link");
  const metricsList = document.getElementById("modal-metrics");

  if (modalImg) modalImg.src = project.image;
  if (modalTitle) modalTitle.innerText = project.title;
  if (modalCategory) modalCategory.innerText = project.category;
  if (modalDesc) modalDesc.innerText = project.description;
  if (modalChallenge) modalChallenge.innerText = project.challenge;
  if (modalSolution) modalSolution.innerText = project.solution;
  
  if (linkElem) {
    linkElem.href = project.link;
    linkElem.innerText = project.domain;
  }

  if (metricsList) {
    metricsList.innerHTML = "";
    project.metrics.forEach(m => {
      const li = document.createElement("li");
      li.innerText = m;
      metricsList.appendChild(li);
    });
  }

  const modal = document.getElementById("project-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeProjectModal() {
  const modal = document.getElementById("project-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function closeModalOnOverlay(e) {
  if (e.target.id === "project-modal") {
    closeProjectModal();
  }
}

// Lead Magnet Modal Functions
function openLeadMagnetModal() {
  const modal = document.getElementById("lead-magnet-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeLeadMagnetModal() {
  const modal = document.getElementById("lead-magnet-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function handleLeadMagnetSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("lm-name").value;
  const email = document.getElementById("lm-email").value;

  fetch("https://formsubmit.co/ajax/chandchv@gmail.com", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      _subject: `📥 Free Lead Magnet Request: ${name} (${email})`,
      "Name": name,
      "Email": email,
      "Resource Requested": "Shopify Speed & Technical SEO Checklist 2026"
    })
  }).catch(e => console.log("Lead magnet error:", e));

  alert(`Thank you, ${name}!\n\nYour 2026 Shopify Speed & Technical SEO Checklist has been emailed to ${email}. Check your inbox!`);
  closeLeadMagnetModal();
  e.target.reset();
}


// --- 5. Dynamic Location-Aware Cost Estimator ---
function calculateEstimate() {
  const calcShopify = document.getElementById("calc-shopify");
  if (!calcShopify) return; // Not on page with estimator

  // Reload fresh pricing config from storage (in case admin updated it)
  pricingConfig = getPricingConfig();

  const activeRates = pricingConfig[currentCurrency] || defaultPricingConfig.USD;
  const symbol = activeRates.symbol;

  const shopifyChecked = document.getElementById("calc-shopify").checked;
  const webappChecked = document.getElementById("calc-webapp").checked;
  const seoChecked = document.getElementById("calc-seo").checked;
  const adsChecked = document.getElementById("calc-ads").checked;
  const scopeVal = parseInt(document.getElementById("scope-slider").value);

  // Sync checkbox card visuals
  syncCardSelectedState("card-calc-shopify", shopifyChecked);
  syncCardSelectedState("card-calc-webapp", webappChecked);
  syncCardSelectedState("card-calc-seo", seoChecked);
  syncCardSelectedState("card-calc-ads", adsChecked);

  let baseSum = 0;
  let serviceCount = 0;

  if (shopifyChecked) { baseSum += activeRates.shopify; serviceCount++; }
  if (webappChecked) { baseSum += activeRates.webapp; serviceCount++; }
  if (seoChecked) { baseSum += activeRates.seo; serviceCount++; }
  if (adsChecked) { baseSum += activeRates.ads; serviceCount++; }

  if (serviceCount === 0) {
    baseSum = activeRates.seo; // default baseline fallback
    serviceCount = 1;
  }

  // Scope Multiplier
  let scopeMultiplier = 1.0;
  let scopeText = "Growth Level";
  let weeksText = "2 - 3 Weeks";

  if (scopeVal === 1) {
    scopeMultiplier = 0.8;
    scopeText = "Starter MVP";
    weeksText = "1 - 2 Weeks";
  } else if (scopeVal === 2) {
    scopeMultiplier = 1.25;
    scopeText = "Growth Custom (Recommended)";
    weeksText = "2 - 4 Weeks";
  } else if (scopeVal === 3) {
    scopeMultiplier = 2.0;
    scopeText = "Enterprise Scale";
    weeksText = "4 - 8 Weeks";
  }

  const roundUnit = currentCurrency === "INR" ? 1000 : 100;
  const minPrice = Math.round((baseSum * scopeMultiplier * 0.9) / roundUnit) * roundUnit;
  const maxPrice = Math.round((baseSum * scopeMultiplier * 1.35) / roundUnit) * roundUnit;

  const formattedEstimate = `${symbol}${minPrice.toLocaleString()} - ${symbol}${maxPrice.toLocaleString()}`;

  document.getElementById("estimate-price-display").innerText = formattedEstimate;
  document.getElementById("estimate-timeline-display").innerHTML = `<i class="fa-solid fa-clock"></i> Estimated Delivery: ${weeksText}`;
  document.getElementById("breakdown-service-count").innerText = `${serviceCount} Service${serviceCount > 1 ? 's' : ''}`;
  document.getElementById("breakdown-scope-level").innerText = scopeText;
}

function syncCardSelectedState(cardId, isChecked) {
  const card = document.getElementById(cardId);
  if (card) {
    if (isChecked) card.classList.add("selected");
    else card.classList.remove("selected");
  }
}

function applyEstimateToForm() {
  const priceText = document.getElementById("estimate-price-display").innerText;
  const messageArea = document.getElementById("client-message");

  messageArea.value = `Hi SixthCrest Team,\n\nI calculated an estimated project investment of ${priceText} (${currentCurrency}). I'd like to get a formal quote and audit for my project.`;
  
  const contactSection = document.getElementById("contact");
  contactSection.scrollIntoView({ behavior: "smooth" });
}


// --- 6. Preselect Service ---
function preselectService(serviceKey) {
  const selectService = document.getElementById("client-service");
  if (selectService) {
    selectService.value = serviceKey;
  }
}


// --- 7. Form Submission & Dual Email + WhatsApp Dispatch Handler ---
function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("client-name").value;
  const email = document.getElementById("client-email").value;
  const domain = document.getElementById("client-domain").value || "N/A";
  const service = document.getElementById("client-service").value;
  const budget = document.getElementById("client-budget").value;
  const message = document.getElementById("client-message").value || "No additional notes provided.";
  const estimatedPrice = document.getElementById("estimate-price-display").innerText;

  const newLead = {
    id: "LEAD-" + Date.now(),
    name,
    email,
    domain,
    service,
    budget,
    message,
    currency: currentCurrency,
    estimatedPrice,
    status: "New",
    createdAt: new Date().toISOString()
  };

  // 1. Save to Local Storage for Admin Management Portal
  const existingLeads = JSON.parse(localStorage.getItem("sixthcrest_leads") || "[]");
  existingLeads.unshift(newLead);
  localStorage.setItem("sixthcrest_leads", JSON.stringify(existingLeads));

  // 2. Dispatch Email Notification to chandchv@gmail.com via FormSubmit AJAX API
  fetch("https://formsubmit.co/ajax/chandchv@gmail.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      _subject: `🚀 New Project Quote Request: ${name} (${service.toUpperCase()})`,
      _replyto: email,
      "Inquiry ID": newLead.id,
      "Client Name": name,
      "Client Email": email,
      "Domain / Brand": domain,
      "Requested Service": service.toUpperCase(),
      "Selected Budget": budget,
      "Currency": currentCurrency,
      "Estimated Price": estimatedPrice,
      "Project Details": message,
      "_template": "table"
    })
  }).then(res => res.json())
    .then(data => console.log("Email dispatch status:", data))
    .catch(err => console.error("Email dispatch failed:", err));

  // 3. Format WhatsApp Message for +91 7013891760
  const waMessageText = 
    `🚀 *New Quote Request on SixthCrest!*\n\n` +
    `📌 *Inquiry ID:* ${newLead.id}\n` +
    `👤 *Name:* ${name}\n` +
    `📧 *Email:* ${email}\n` +
    `🌐 *Brand/Domain:* ${domain}\n` +
    `🛠️ *Service:* ${service.toUpperCase()}\n` +
    `💵 *Budget:* ${budget}\n` +
    `💰 *Estimated Price:* ${estimatedPrice}\n` +
    `💬 *Notes:* ${message}`;

  const waUrl = `https://wa.me/917013891760?text=${encodeURIComponent(waMessageText)}`;

  // 4. Show Success Modal & Direct WhatsApp Link
  showQuoteSuccessModal(newLead, waUrl);

  e.target.reset();
}

// Success Modal Display Function
function showQuoteSuccessModal(lead, waUrl) {
  const modal = document.getElementById("quote-success-modal");
  const waBtn = document.getElementById("modal-wa-btn");
  const modalDetails = document.getElementById("modal-lead-details");

  if (modal && waBtn && modalDetails) {
    waBtn.href = waUrl;
    modalDetails.innerHTML = `
      <p style="margin-bottom: 0.5rem;"><strong>Inquiry ID:</strong> <span style="color: var(--accent-primary);">${lead.id}</span></p>
      <p style="margin-bottom: 0.5rem;"><strong>Client:</strong> ${lead.name} (${lead.email})</p>
      <p style="margin-bottom: 0.5rem;"><strong>Service:</strong> ${lead.service.toUpperCase()}</p>
      <p style="margin-bottom: 0.5rem;"><strong>Budget / Estimate:</strong> ${lead.budget} (${lead.estimatedPrice})</p>
    `;
    modal.classList.add("active");

    // Automatically open WhatsApp in a new tab for seamless user experience
    setTimeout(() => {
      window.open(waUrl, "_blank");
    }, 600);
  } else {
    alert(`Thank you, ${lead.name}!\n\nYour quote request (ID: ${lead.id}) has been emailed to chandchv@gmail.com.\n\nClick OK to open WhatsApp and connect directly with our lead engineer.`);
    window.open(waUrl, "_blank");
  }
}

function closeQuoteSuccessModal() {
  const modal = document.getElementById("quote-success-modal");
  if (modal) {
    modal.classList.remove("active");
  }
}


// --- 8. Header Scroll Behavior & Mobile Toggle ---
function initHeaderScroll() {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.style.padding = "0.75rem 0";
        navbar.style.boxShadow = "var(--shadow-sm)";
      } else {
        navbar.style.padding = "1rem 0";
        navbar.style.boxShadow = "none";
      }
    });
  }

  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("active");
      const icon = mobileBtn.querySelector("i");
      if (icon) {
        if (navLinks.classList.contains("active")) {
          icon.className = "fa-solid fa-xmark";
        } else {
          icon.className = "fa-solid fa-bars";
        }
      }
    });

    // Close mobile menu when clicking any navigation button link
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        const icon = mobileBtn.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars";
      });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
        navLinks.classList.remove("active");
        const icon = mobileBtn.querySelector("i");
        if (icon) icon.className = "fa-solid fa-bars";
      }
    });
  }
}
