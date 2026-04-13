const API_BASE_URL = "http://localhost:5000";

const STORAGE_KEYS = {
  products: "products",
  logs: "logs",
  currentUser: "currentUser",
  username: "username",
  role: "role",
  theme: "theme",
  showProfit: "showProfit",
  showBuy: "showBuy"
};

const ROLE_LABELS = {
  admin: "Admin",
  employee: "Employee"
};

const page = document.body.dataset.page || "dashboard";
const pathPage = window.location.pathname.split("/").pop() || "index.html";

const elements = {
  appShell: document.getElementById("appShell"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginBtn: document.getElementById("loginBtn"),
  loginError: document.getElementById("loginError"),
  logoutBtn: document.getElementById("logoutBtn"),
  sessionUser: document.getElementById("sessionUser"),
  sessionRole: document.getElementById("sessionRole"),
  installBtn: document.getElementById("installBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataFile: document.getElementById("importDataFile"),
  importDataLabel: document.getElementById("importDataLabel"),
  printBtn: document.getElementById("printBtn"),
  darkModeBtn: document.getElementById("darkModeBtn"),
  showBuyBtn: document.getElementById("showBuyBtn"),
  hideBuyBtn: document.getElementById("hideBuyBtn"),
  showProfitBtn: document.getElementById("showProfitBtn"),
  hideProfitBtn: document.getElementById("hideProfitBtn"),
  dashboardCards: document.getElementById("dashboardCards"),
  totalProducts: document.getElementById("totalProducts"),
  totalItems: document.getElementById("totalItems"),
  totalProfit: document.getElementById("totalProfit"),
  profitCard: document.getElementById("profitCard"),
  summary: document.getElementById("summary"),
  formPanel: document.getElementById("formPanel"),
  name: document.getElementById("name"),
  qty: document.getElementById("qty"),
  unit: document.getElementById("unit"),
  boxSizeContainer: document.getElementById("boxSizeContainer"),
  boxSize: document.getElementById("boxSize"),
  buy: document.getElementById("buy"),
  sell: document.getElementById("sellPrice"),
  addProductBtn: document.getElementById("addProductBtn"),
  floatingAdd: document.getElementById("floatingAdd"),
  search: document.getElementById("search"),
  tableHead: document.getElementById("tableHead"),
  tableBody: document.getElementById("tableBody"),
  logsBody: document.getElementById("logsBody"),
  reportSearch: document.getElementById("reportSearch"),
  reportType: document.getElementById("reportType"),
  reportDateFrom: document.getElementById("reportDateFrom"),
  reportDateTo: document.getElementById("reportDateTo"),
  reportsSummary: document.getElementById("reportsSummary"),
  toastStack: document.getElementById("toastStack"),
  editModal: document.getElementById("editModal"),
  confirmModal: document.getElementById("confirmModal"),
  confirmMessage: document.getElementById("confirmMessage"),
  modalName: document.getElementById("modalName"),
  modalQty: document.getElementById("modalQty"),
  modalUnit: document.getElementById("modalUnit"),
  modalBoxSizeContainer: document.getElementById("modalBoxSizeContainer"),
  modalBoxSize: document.getElementById("modalBoxSize"),
  modalBuy: document.getElementById("modalBuy"),
  modalSell: document.getElementById("modalSell"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  cancelConfirmBtn: document.getElementById("cancelConfirmBtn"),
  confirmActionBtn: document.getElementById("confirmActionBtn")
};

let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products)) || [];
let logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.logs)) || [];
let currentUser = normalizeStoredUser(JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)) || null);
let showProfit = localStorage.getItem(STORAGE_KEYS.showProfit) === "true";
let showBuy = localStorage.getItem(STORAGE_KEYS.showBuy) === "true";
let deferredInstallPrompt = null;
let editingIndex = null;
let pendingDeleteIndex = null;

products = products.map((product) => ({
  ...product,
  qty: Number(product.qty) || 0,
  unit: product.unit || "piece",
  boxSize: Number(product.boxSize) || 0,
  buy: Number(product.buy) || 0,
  sell: Number(product.sell) || 0,
  soldCount: Number(product.soldCount) || 0,
  realizedProfit: Number(product.realizedProfit) || 0,
  addedBy: product.addedBy || product.user || "admin"
}));

logs = logs.map((log) => ({
  ...log,
  quantity: Number(log.quantity) || 0,
  user: log.user || "admin",
  role: log.role || "admin"
}));

if (currentUser) {
  saveSession();
}

if (localStorage.getItem(STORAGE_KEYS.theme) === "dark") {
  document.body.classList.add("dark");
}

if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
  document.body.classList.add("standalone");
}

function normalizeStoredUser(user) {
  if (!user) return null;

  const role = user.role === "owner" ? "admin" : user.role === "worker" ? "employee" : user.role;
  const username =
    user.username === "owner" ? "admin" : user.username === "worker" ? "user1" : user.username;

  return {
    username,
    role,
    label: ROLE_LABELS[role] || user.label || "User"
  };
}

function isLoginPage() {
  return getCurrentPageKey() === "login";
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function getCurrentPageKey() {
  if (page) return page;
  if (pathPage === "login.html") return "login";
  if (pathPage === "products.html") return "products";
  if (pathPage === "reports.html") return "reports";
  return "dashboard";
}

function getDefaultPageForRole(role) {
  return role === "admin" ? "index.html" : "products.html";
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function saveLogs() {
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEYS.username, currentUser.username);
    localStorage.setItem(STORAGE_KEYS.role, currentUser.role);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.username);
    localStorage.removeItem(STORAGE_KEYS.role);
  }
}

function saveVisibility() {
  localStorage.setItem(STORAGE_KEYS.showProfit, String(showProfit));
  localStorage.setItem(STORAGE_KEYS.showBuy, String(showBuy));
}

function formatMoney(value) {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function formatDate(dateString = new Date().toISOString()) {
  return dateString.slice(0, 10);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function showToast(message, type = "info") {
  if (!elements.toastStack) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastStack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function redirectTo(url) {
  if (window.location.pathname.endsWith(url)) return;
  window.location.href = url;
}

function enforceAuthorization() {
  const current = getCurrentPageKey();

  if (!currentUser && current !== "login") {
    redirectTo("login.html");
    return false;
  }

  if (currentUser && current === "login") {
    redirectTo(getDefaultPageForRole(currentUser.role));
    return false;
  }

  if (currentUser && currentUser.role === "employee" && current === "dashboard") {
    redirectTo("products.html");
    return false;
  }

  return true;
}

function activateNav() {
  const current = getCurrentPageKey();
  document.querySelectorAll(".main-nav a[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === current);
  });
}

function updateSessionUI() {
  if (elements.sessionUser) {
    elements.sessionUser.textContent = `المستخدم: ${currentUser?.username || "-"}`;
  }

  if (elements.sessionRole) {
    elements.sessionRole.textContent = `الصلاحية: ${currentUser?.label || "-"}`;
  }
}

function updateAccessUI() {
  if (!currentUser) return;

  if (!isAdmin()) {
    showProfit = false;
    showBuy = false;
    saveVisibility();
  }

  updateSessionUI();

  if (elements.exportBtn) {
    elements.exportBtn.style.display = isAdmin() ? "inline-flex" : "none";
  }
  if (elements.exportDataBtn) {
    elements.exportDataBtn.style.display = isAdmin() ? "inline-flex" : "none";
  }
  if (elements.importDataLabel) {
    elements.importDataLabel.style.display = isAdmin() ? "inline-flex" : "none";
  }
  if (elements.showBuyBtn) {
    elements.showBuyBtn.style.display = isAdmin() && !showBuy ? "inline-flex" : "none";
  }
  if (elements.hideBuyBtn) {
    elements.hideBuyBtn.style.display = isAdmin() && showBuy ? "inline-flex" : "none";
  }
  if (elements.showProfitBtn) {
    elements.showProfitBtn.style.display = isAdmin() && !showProfit ? "inline-flex" : "none";
  }
  if (elements.hideProfitBtn) {
    elements.hideProfitBtn.style.display = isAdmin() && showProfit ? "inline-flex" : "none";
  }
  if (elements.profitCard) {
    elements.profitCard.classList.toggle("is-hidden", !isAdmin());
  }
  if (elements.dashboardCards) {
    elements.dashboardCards.classList.toggle("dashboard--compact", !isAdmin());
  }
  if (elements.formPanel) {
    elements.formPanel.classList.toggle("is-hidden", !isAdmin());
  }
  if (elements.floatingAdd) {
    elements.floatingAdd.classList.toggle("is-hidden", !isAdmin() || getCurrentPageKey() !== "products");
  }
  if (elements.installBtn) {
    elements.installBtn.classList.toggle(
      "is-hidden",
      !deferredInstallPrompt || window.matchMedia("(display-mode: standalone)").matches
    );
  }
}

function addLog(type, productName, quantity) {
  if (!currentUser) return;

  logs.unshift({
    type,
    product: productName,
    quantity,
    date: formatDate(),
    user: currentUser.username,
    role: currentUser.role
  });

  logs = logs.slice(0, 500);
  saveLogs();
}

async function login() {
  const username = elements.loginUsername?.value.trim();
  const password = elements.loginPassword?.value.trim();

  if (!username || !password) {
    if (elements.loginError) {
      elements.loginError.textContent = "أدخل اسم المستخدم وكلمة المرور.";
    }
    showToast("أدخل اسم المستخدم وكلمة المرور.", "error");
    return;
  }

  if (elements.loginBtn) {
    elements.loginBtn.disabled = true;
    elements.loginBtn.textContent = "جارٍ التحقق...";
  }

  // Local authentication based on the details in login.html
  setTimeout(() => {
    let success = false;
    let role = null;

    if (username === "admin" && password === "1234") {
      success = true;
      role = "owner";
    } else if (username === "user1" && password === "1111") {
      success = true;
      role = "worker";
    }

    if (!success) {
      if (elements.loginError) {
        elements.loginError.textContent = "بيانات غير صحيحة.";
      }
      showToast("بيانات غير صحيحة.", "error");
      if (elements.loginBtn) {
        elements.loginBtn.disabled = false;
        elements.loginBtn.textContent = "دخول";
      }
      return;
    }

    currentUser = normalizeStoredUser({
      username: username,
      role: role,
      label: ROLE_LABELS[role === "owner" ? "admin" : "employee"]
    });

    saveSession();

    if (elements.loginError) elements.loginError.textContent = "";
    if (elements.loginPassword) elements.loginPassword.value = "";

    showToast(`مرحبًا ${currentUser.username}`, "success");
    redirectTo(getDefaultPageForRole(currentUser.role));
  }, 400); // 400ms delay to simulate loading
}

function logout() {
  currentUser = null;
  showProfit = false;
  showBuy = false;
  saveSession();
  saveVisibility();
  showToast("تم تسجيل الخروج", "info");
  redirectTo("login.html");
}

function toggleBoxInput() {
  const unitVal = elements.unit?.value;
  if (elements.boxSizeContainer) {
    elements.boxSizeContainer.style.display = (unitVal === "piece" || unitVal === "box") ? "flex" : "none";
  }
  if (unitVal !== "piece" && unitVal !== "box" && elements.boxSize) elements.boxSize.value = "";
}

function toggleModalBoxInput() {
  const unitVal = elements.modalUnit?.value;
  if (elements.modalBoxSizeContainer) {
    elements.modalBoxSizeContainer.style.display = (unitVal === "piece" || unitVal === "box") ? "flex" : "none";
  }
  if (unitVal !== "piece" && unitVal !== "box" && elements.modalBoxSize) elements.modalBoxSize.value = "";
}

function getFormValues() {
  return {
    name: elements.name?.value.trim() || "",
    qty: Number(elements.qty?.value),
    unit: elements.unit?.value || "box",
    boxSize: (elements.unit?.value === "piece" || elements.unit?.value === "box") ? Number(elements.boxSize?.value) : 0,
    buy: Number(elements.buy?.value),
    sell: Number(elements.sell?.value)
  };
}

function clearForm() {
  if (elements.name) elements.name.value = "";
  if (elements.qty) elements.qty.value = "";
  if (elements.unit) elements.unit.value = "box";
  if (elements.boxSize) elements.boxSize.value = "";
  if (elements.buy) elements.buy.value = "";
  if (elements.sell) elements.sell.value = "";
  toggleBoxInput();
  elements.name?.focus();
}

function addProduct() {
  if (!isAdmin()) {
    showToast("إضافة المنتجات متاحة للمدير فقط.", "error");
    return;
  }

  const product = getFormValues();
  if (!product.name || [product.qty, product.buy, product.sell].some(Number.isNaN)) {
    showToast("أدخل بيانات صحيحة لكل الحقول.", "error");
    return;
  }

  if (product.qty < 0 || product.buy < 0 || product.sell < 0 || product.boxSize < 0) {
    showToast("لا يمكن إدخال أرقام سالبة.", "error");
    return;
  }

  products.unshift({
    ...product,
    soldCount: 0,
    realizedProfit: 0,
    addedBy: currentUser.username
  });

  addLog("إضافة", product.name, product.qty);
  saveProducts();
  clearForm();
  showToast("تمت إضافة المنتج بنجاح.", "success");
  renderPage();
}

function addQty(index) {
  const product = products[index];
  if (!product) return;

  product.qty += 1;
  addLog("وارد", product.name, 1);
  saveProducts();
  showToast("تم تسجيل حركة وارد.", "success");
  renderPage();
}

function sell(index) {
  const product = products[index];
  if (!product) return;

  if (product.qty <= 0) {
    showToast("الكمية الحالية صفر.", "error");
    return;
  }

  product.qty -= 1;
  product.soldCount += 1;
  product.realizedProfit += product.sell - product.buy;
  addLog("صادر", product.name, 1);
  saveProducts();
  showToast("تم تسجيل حركة صادر.", "success");
  renderPage();
}

function deleteProduct(index) {
  if (!isAdmin()) {
    showToast("الحذف متاح للمدير فقط.", "error");
    return;
  }

  const product = products[index];
  if (!product || !elements.confirmModal) return;

  pendingDeleteIndex = index;
  if (elements.confirmMessage) {
    elements.confirmMessage.textContent = `سيتم حذف المنتج "${product.name}" نهائيًا من القائمة.`;
  }
  elements.confirmModal.classList.remove("is-hidden");
}

function closeConfirmModal() {
  pendingDeleteIndex = null;
  elements.confirmModal?.classList.add("is-hidden");
}

function confirmDelete() {
  if (pendingDeleteIndex === null) return;

  const product = products[pendingDeleteIndex];
  if (!product) {
    closeConfirmModal();
    return;
  }

  addLog("حذف", product.name, product.qty);
  products.splice(pendingDeleteIndex, 1);
  saveProducts();
  closeConfirmModal();
  showToast("تم حذف المنتج.", "success");
  renderPage();
}

function editProduct(index) {
  if (!isAdmin()) {
    showToast("التعديل متاح للمدير فقط.", "error");
    return;
  }

  const product = products[index];
  if (!product || !elements.editModal) return;

  editingIndex = index;
  elements.modalName.value = product.name;
  elements.modalQty.value = product.qty;
  if (elements.modalUnit) elements.modalUnit.value = product.unit || "box";
  if (elements.modalBoxSize) elements.modalBoxSize.value = product.boxSize || 0;
  elements.modalBuy.value = product.buy;
  elements.modalSell.value = product.sell;
  setTimeout(toggleModalBoxInput, 0);
  elements.editModal.classList.remove("is-hidden");
}

function closeEditModal() {
  editingIndex = null;
  elements.editModal?.classList.add("is-hidden");
}

function saveEditFromModal() {
  if (editingIndex === null) return;

  const current = products[editingIndex];
  if (!current) return;

  const updated = {
    ...current,
    name: elements.modalName.value.trim(),
    qty: Number(elements.modalQty.value),
    unit: elements.modalUnit?.value || "box",
    boxSize: (elements.modalUnit?.value === "piece" || elements.modalUnit?.value === "box") ? Number(elements.modalBoxSize?.value || 0) : 0,
    buy: Number(elements.modalBuy.value),
    sell: Number(elements.modalSell.value)
  };

  if (!updated.name || [updated.qty, updated.buy, updated.sell].some(Number.isNaN)) {
    showToast("البيانات الجديدة غير صالحة.", "error");
    return;
  }

  if (updated.qty < 0 || updated.buy < 0 || updated.sell < 0 || updated.boxSize < 0) {
    showToast("لا يمكن إدخال أرقام سالبة.", "error");
    return;
  }

  products[editingIndex] = updated;
  addLog("تعديل", updated.name, updated.qty);
  saveProducts();
  closeEditModal();
  showToast("تم حفظ التعديل.", "success");
  renderPage();
}

function showProfitInfo() {
  if (!isAdmin()) {
    showToast("هذه الميزة متاحة للمدير فقط.", "error");
    return;
  }

  showProfit = true;
  saveVisibility();
  renderPage();
}

function hideProfitInfo() {
  showProfit = false;
  saveVisibility();
  renderPage();
}

function showBuyInfo() {
  if (!isAdmin()) {
    showToast("هذه الميزة متاحة للمدير فقط.", "error");
    return;
  }

  showBuy = true;
  saveVisibility();
  renderPage();
}

function hideBuyInfo() {
  showBuy = false;
  saveVisibility();
  renderPage();
}

function renderSummary() {
  if (!elements.summary) return;

  if (products.length === 0) {
    elements.summary.textContent = "ابدأ بإضافة أول منتج ليظهر الملخص هنا.";
    return;
  }

  const totalSold = products.reduce((sum, product) => sum + product.soldCount, 0);
  const lowStock = products.filter((product) => product.qty <= 3).length;
  elements.summary.textContent = `تم بيع ${totalSold} قطعة حتى الآن، ويوجد ${lowStock} منتج يحتاج متابعة للمخزون.`;
}

function renderDashboardPage() {
  const totalQty = products.reduce((sum, product) => sum + product.qty, 0);
  const totalItems = products.length;
  const totalProfit = products.reduce((sum, product) => sum + product.realizedProfit, 0);

  if (elements.totalProducts) {
    elements.totalProducts.textContent = totalQty.toLocaleString("ar-EG");
  }
  if (elements.totalItems) {
    elements.totalItems.textContent = totalItems.toLocaleString("ar-EG");
  }
  if (elements.totalProfit) {
    elements.totalProfit.textContent = isAdmin() && showProfit ? formatMoney(totalProfit) : "مخفي";
  }

  renderSummary();
}

function renderProductsPage() {
  if (!elements.tableHead || !elements.tableBody) return;

  const keyword = elements.search?.value.trim().toLowerCase() || "";
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(keyword));

  elements.tableHead.innerHTML = `
    <tr>
      <th>ID</th>
      <th>المنتج</th>
      <th>الكمية</th>
      ${isAdmin() && showBuy ? "<th>سعر الشراء</th>" : ""}
      ${isAdmin() ? "<th>سعر البيع</th>" : ""}
      ${isAdmin() && showProfit ? "<th>الربح</th>" : ""}
      <th>أضيف بواسطة</th>
      <th>الحالة</th>
      <th>إجراءات</th>
    </tr>
  `;

  if (filteredProducts.length === 0) {
    const colSpan =
      6 + (isAdmin() ? 1 : 0) + (isAdmin() && showBuy ? 1 : 0) + (isAdmin() && showProfit ? 1 : 0);
    elements.tableBody.innerHTML = `<tr><td colspan="${colSpan}">لا توجد منتجات لعرضها.</td></tr>`;
    renderSummary();
    return;
  }

  elements.tableBody.innerHTML = filteredProducts
    .map((product) => {
      const index = products.indexOf(product);
      const stockLabel = product.qty === 0 ? "نفد" : product.qty <= 3 ? "منخفض" : "متوفر";
      const unitLabel = product.unit === "kg" ? "كجم" : product.unit === "g" ? "جم" : product.unit === "box" ? "كرتونة" : "قطعة";
      
      let qtyText = `${product.qty} ${unitLabel}`;
      if (product.unit === "piece" && product.boxSize > 0) {
        let boxes = Math.floor(product.qty / product.boxSize);
        qtyText += ` (${boxes} كرتونة)`;
      } else if (product.unit === "box" && product.boxSize > 0) {
        let pieces = product.qty * product.boxSize;
        qtyText += ` (${pieces} قطعة الإجمالي)`;
      }

      return `
        <tr>
          <td data-label="ID">${index + 1}</td>
          <td data-label="المنتج">${product.name}</td>
          <td data-label="الكمية">${qtyText}</td>
          ${isAdmin() && showBuy ? `<td data-label="سعر الشراء">${formatMoney(product.buy)}</td>` : ""}
          ${isAdmin() ? `<td data-label="سعر البيع">${formatMoney(product.sell)}</td>` : ""}
          ${isAdmin() && showProfit ? `<td data-label="الربح">${formatMoney(product.realizedProfit)}</td>` : ""}
          <td data-label="أضيف بواسطة">${product.addedBy}</td>
          <td data-label="الحالة"><span class="badge">${stockLabel}</span></td>
          <td class="actions-cell" data-label="إجراءات">
            <button class="icon-btn" data-action="addQty" data-index="${index}" title="وارد">+</button>
            <button class="icon-btn" data-action="sell" data-index="${index}" title="صادر">-</button>
            <button class="icon-btn ${!isAdmin() ? "is-hidden" : ""}" data-action="edit" data-index="${index}" title="تعديل">ت</button>
            <button class="icon-btn danger ${!isAdmin() ? "is-hidden" : ""}" data-action="delete" data-index="${index}" title="حذف">×</button>
          </td>
        </tr>
      `;
    })
    .join("");

  renderSummary();
}

function renderReportsPage() {
  if (!elements.logsBody) return;

  const searchValue = elements.reportSearch?.value.trim().toLowerCase() || "";
  const typeValue = elements.reportType?.value || "";
  const dateFrom = elements.reportDateFrom?.value || "";
  const dateTo = elements.reportDateTo?.value || "";

  const filteredLogs = logs.filter((log) => {
    const matchesName = log.product.toLowerCase().includes(searchValue);
    const matchesType = !typeValue || log.type === typeValue;
    const matchesFrom = !dateFrom || log.date >= dateFrom;
    const matchesTo = !dateTo || log.date <= dateTo;
    return matchesName && matchesType && matchesFrom && matchesTo;
  });

  if (elements.reportsSummary) {
    elements.reportsSummary.textContent =
      filteredLogs.length > 0
        ? `تم العثور على ${filteredLogs.length} عملية مطابقة للفلاتر الحالية.`
        : "لا توجد عمليات مطابقة للفلاتر الحالية.";
  }

  if (filteredLogs.length === 0) {
    elements.logsBody.innerHTML = `<tr><td colspan="5">لا توجد عمليات لعرضها.</td></tr>`;
    return;
  }

  elements.logsBody.innerHTML = filteredLogs
    .map(
      (log) => `
        <tr>
          <td data-label="النوع">${log.type}</td>
          <td data-label="المنتج">${log.product}</td>
          <td data-label="الكمية">${log.quantity}</td>
          <td data-label="التاريخ">${log.date}</td>
          <td data-label="المستخدم">${log.user}</td>
        </tr>
      `
    )
    .join("");
}

function createCell(value, type = "String", formula = "") {
  const formulaAttr = formula ? ` ss:Formula="${escapeXml(formula)}"` : "";
  return `<Cell${formulaAttr}><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
}

function buildExcelXml() {
  const productRows = products
    .map((product, index) => {
      const rowNumber = index + 2;
      return `
        <Row>
          ${createCell(index + 1, "Number")}
          ${createCell(product.name)}
          ${createCell(product.qty, "Number")}
          ${createCell(product.buy, "Number")}
          ${createCell(product.sell, "Number")}
          ${createCell("", "Number", `=E${rowNumber}-D${rowNumber}`)}
          ${createCell("", "Number", `=(E${rowNumber}-D${rowNumber})*C${rowNumber}`)}
          ${createCell(product.addedBy)}
        </Row>
      `;
    })
    .join("");

  const logRows = logs
    .map(
      (log) => `
        <Row>
          ${createCell(log.type)}
          ${createCell(log.product)}
          ${createCell(log.quantity, "Number")}
          ${createCell(log.date)}
          ${createCell(log.user)}
        </Row>
      `
    )
    .join("");

  return `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Styles>
      <Style ss:ID="Header">
        <Font ss:Bold="1" ss:Color="#FFFFFF"/>
        <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
      </Style>
    </Styles>
    <Worksheet ss:Name="Products">
      <Table>
        <Row ss:StyleID="Header">
          <Cell><Data ss:Type="String">ID</Data></Cell>
          <Cell><Data ss:Type="String">اسم المنتج</Data></Cell>
          <Cell><Data ss:Type="String">الكمية</Data></Cell>
          <Cell><Data ss:Type="String">سعر الشراء</Data></Cell>
          <Cell><Data ss:Type="String">سعر البيع</Data></Cell>
          <Cell><Data ss:Type="String">الربح للوحدة</Data></Cell>
          <Cell><Data ss:Type="String">إجمالي الربح</Data></Cell>
          <Cell><Data ss:Type="String">أضيف بواسطة</Data></Cell>
        </Row>
        ${productRows}
      </Table>
    </Worksheet>
    <Worksheet ss:Name="Logs">
      <Table>
        <Row ss:StyleID="Header">
          <Cell><Data ss:Type="String">النوع</Data></Cell>
          <Cell><Data ss:Type="String">المنتج</Data></Cell>
          <Cell><Data ss:Type="String">الكمية</Data></Cell>
          <Cell><Data ss:Type="String">التاريخ</Data></Cell>
          <Cell><Data ss:Type="String">المستخدم</Data></Cell>
        </Row>
        ${logRows}
      </Table>
    </Worksheet>
    <Worksheet ss:Name="Dashboard">
      <Table>
        <Row ss:StyleID="Header">
          <Cell><Data ss:Type="String">البيان</Data></Cell>
          <Cell><Data ss:Type="String">القيمة</Data></Cell>
        </Row>
        <Row>
          ${createCell("إجمالي المنتجات")}
          ${createCell("", "Number", "=SUM(Products!C:C)")}
        </Row>
        <Row>
          ${createCell("إجمالي الأرباح")}
          ${createCell("", "Number", "=SUM(Products!G:G)")}
        </Row>
      </Table>
    </Worksheet>
  </Workbook>`;
}

function exportDataJSON() {
  if (!isAdmin()) {
    showToast("تصدير البيانات متاح للمدير فقط.", "error");
    return;
  }

  try {
    const data = {
      products: JSON.parse(localStorage.getItem(STORAGE_KEYS.products) || "[]"),
      logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.logs) || "[]")
    };

    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "inventory-backup.json";
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    showToast("تم تصدير نسخة احتياطية للبيانات", "success");
  } catch (error) {
    console.error("Export error:", error);
    showToast("حدث خطأ أثناء التصدير", "error");
  }
}

function importDataJSON(event) {
  if (!isAdmin()) {
    showToast("استيراد البيانات متاح للمدير فقط.", "error");
    return;
  }

  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.products) {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(data.products));
      }

      if (data.logs) {
        localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(data.logs));
      }

      showToast("تم استيراد البيانات بنجاح", "success");
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      showToast("ملف غير صالح", "error");
    } finally {
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

function exportExcel() {
  if (!isAdmin()) {
    showToast("تصدير التقرير متاح للمدير فقط.", "error");
    return;
  }

  const xml = buildExcelXml();
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-report-${formatDate()}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("تم تصدير ملف Excel.", "success");
}

async function installApp() {
  if (!deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  elements.installBtn?.classList.add("is-hidden");
}

function printPage() {
  window.print();
}

function renderPage() {
  if (!currentUser && !isLoginPage()) return;

  activateNav();
  updateAccessUI();

  const current = getCurrentPageKey();
  if (current === "dashboard") {
    renderDashboardPage();
  } else if (current === "products") {
    renderProductsPage();
  } else if (current === "reports") {
    renderReportsPage();
  }
}

function handleProductsTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (action === "addQty") addQty(index);
  if (action === "sell") sell(index);
  if (action === "edit") editProduct(index);
  if (action === "delete") deleteProduct(index);
}

function registerEvents() {
  elements.loginBtn?.addEventListener("click", login);
  elements.logoutBtn?.addEventListener("click", logout);
  elements.installBtn?.addEventListener("click", installApp);
  elements.exportBtn?.addEventListener("click", exportExcel);
  elements.exportDataBtn?.addEventListener("click", exportDataJSON);
  elements.importDataFile?.addEventListener("change", importDataJSON);
  elements.printBtn?.addEventListener("click", printPage);
  elements.darkModeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      STORAGE_KEYS.theme,
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });
  elements.showBuyBtn?.addEventListener("click", showBuyInfo);
  elements.hideBuyBtn?.addEventListener("click", hideBuyInfo);
  elements.showProfitBtn?.addEventListener("click", showProfitInfo);
  elements.hideProfitBtn?.addEventListener("click", hideProfitInfo);
  elements.addProductBtn?.addEventListener("click", addProduct);
  elements.floatingAdd?.addEventListener("click", () => {
    elements.name?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  elements.search?.addEventListener("input", renderProductsPage);
  elements.reportSearch?.addEventListener("input", renderReportsPage);
  elements.reportType?.addEventListener("change", renderReportsPage);
  elements.reportDateFrom?.addEventListener("change", renderReportsPage);
  elements.reportDateTo?.addEventListener("change", renderReportsPage);
  elements.tableBody?.addEventListener("click", handleProductsTableClick);
  elements.saveEditBtn?.addEventListener("click", saveEditFromModal);
  elements.cancelEditBtn?.addEventListener("click", closeEditModal);
  elements.confirmActionBtn?.addEventListener("click", confirmDelete);
  elements.cancelConfirmBtn?.addEventListener("click", closeConfirmModal);

  elements.unit?.addEventListener("change", toggleBoxInput);
  elements.modalUnit?.addEventListener("change", toggleModalBoxInput);
  setTimeout(() => {
    toggleBoxInput();
    toggleModalBoxInput();
  }, 0);

  elements.editModal?.addEventListener("click", (event) => {
    if (event.target === elements.editModal) {
      closeEditModal();
    }
  });

  elements.confirmModal?.addEventListener("click", (event) => {
    if (event.target === elements.confirmModal) {
      closeConfirmModal();
    }
  });

  [elements.loginUsername, elements.loginPassword].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        login();
      }
    });
  });

  [elements.name, elements.qty, elements.buy, elements.sell].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        addProduct();
      }
    });
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateAccessUI();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    elements.installBtn?.classList.add("is-hidden");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }
}

registerEvents();

if (enforceAuthorization()) {
  updateSessionUI();
  renderPage();
}
