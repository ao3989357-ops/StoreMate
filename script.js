const USERS = {
  owner: {
    username: "owner",
    password: "1234",
    role: "owner",
    label: "صاحب العمل"
  },
  worker: {
    username: "worker",
    password: "0000",
    role: "worker",
    label: "عامل"
  }
};

const STORAGE_KEYS = {
  products: "products",
  logs: "logs",
  currentUser: "currentUser",
  theme: "theme",
  showProfit: "showProfit",
  showBuy: "showBuy"
};

const page = document.body.dataset.page || "dashboard";
const pathPage = window.location.pathname.split("/").pop() || "index.html";

const elements = {
  authShell: document.getElementById("authShell"),
  appShell: document.getElementById("appShell"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginBtn: document.getElementById("loginBtn"),
  loginError: document.getElementById("loginError"),
  logoutBtn: document.getElementById("logoutBtn"),
  sessionRole: document.getElementById("sessionRole"),
  installBtn: document.getElementById("installBtn"),
  exportBtn: document.getElementById("exportBtn"),
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
  modalBuy: document.getElementById("modalBuy"),
  modalSell: document.getElementById("modalSell"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  cancelConfirmBtn: document.getElementById("cancelConfirmBtn"),
  confirmActionBtn: document.getElementById("confirmActionBtn")
};

let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.products)) || [];
let logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.logs)) || [];
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)) || null;
let showProfit = localStorage.getItem(STORAGE_KEYS.showProfit) === "true";
let showBuy = localStorage.getItem(STORAGE_KEYS.showBuy) === "true";
let deferredInstallPrompt = null;
let editingIndex = null;
let pendingDeleteIndex = null;

products = products.map((product) => ({
  ...product,
  soldCount: Number(product.soldCount) || 0,
  realizedProfit: Number(product.realizedProfit) || 0
}));

if (localStorage.getItem(STORAGE_KEYS.theme) === "dark") {
  document.body.classList.add("dark");
}

if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
  document.body.classList.add("standalone");
}

function isOwner() {
  return currentUser?.role === "owner";
}

function isWorker() {
  return currentUser?.role === "worker";
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
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
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

function getCurrentPageKey() {
  if (page) return page;
  if (pathPage === "products.html") return "products";
  if (pathPage === "reports.html") return "reports";
  return "dashboard";
}

function activateNav() {
  const current = getCurrentPageKey();
  document.querySelectorAll(".main-nav a[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === current);
  });
}

function addLog(type, productName, quantity) {
  if (!currentUser) {
    return;
  }

  logs.unshift({
    type,
    product: productName,
    quantity,
    date: formatDate(),
    user: currentUser.label
  });
  logs = logs.slice(0, 300);
  saveLogs();
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

function updateAccessUI() {
  const loggedIn = Boolean(currentUser);

  if (elements.authShell) {
    elements.authShell.classList.toggle("is-hidden", loggedIn);
  }
  if (elements.appShell) {
    elements.appShell.classList.toggle("is-hidden", !loggedIn);
  }

  if (!loggedIn) {
    return;
  }

  if (!isOwner()) {
    showProfit = false;
    showBuy = false;
    saveVisibility();
  }

  if (elements.sessionRole) {
    elements.sessionRole.textContent = `الدور: ${currentUser.label}`;
  }

  if (elements.exportBtn) {
    elements.exportBtn.style.display = isOwner() ? "inline-flex" : "none";
  }
  if (elements.showBuyBtn) {
    elements.showBuyBtn.style.display = isOwner() && !showBuy ? "inline-flex" : "none";
  }
  if (elements.hideBuyBtn) {
    elements.hideBuyBtn.style.display = isOwner() && showBuy ? "inline-flex" : "none";
  }
  if (elements.showProfitBtn) {
    elements.showProfitBtn.style.display = isOwner() && !showProfit ? "inline-flex" : "none";
  }
  if (elements.hideProfitBtn) {
    elements.hideProfitBtn.style.display = isOwner() && showProfit ? "inline-flex" : "none";
  }
  if (elements.profitCard) {
    elements.profitCard.classList.toggle("is-hidden", !isOwner());
  }
  if (elements.dashboardCards) {
    elements.dashboardCards.classList.toggle("dashboard--compact", isWorker());
  }
  if (elements.formPanel) {
    elements.formPanel.classList.toggle("is-hidden", isWorker());
  }
  if (elements.floatingAdd) {
    elements.floatingAdd.classList.toggle("is-hidden", !isOwner() || getCurrentPageKey() !== "products");
  }
  if (elements.installBtn) {
    elements.installBtn.classList.toggle(
      "is-hidden",
      !deferredInstallPrompt || window.matchMedia("(display-mode: standalone)").matches
    );
  }
}

function login() {
  const username = elements.loginUsername?.value.trim().toLowerCase();
  const password = elements.loginPassword?.value.trim();
  const user = Object.values(USERS).find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    if (elements.loginError) {
      elements.loginError.textContent = "اسم المستخدم أو كلمة المرور غير صحيحة.";
    }
    return;
  }

  currentUser = {
    username: user.username,
    role: user.role,
    label: user.label
  };
  saveSession();
  if (elements.loginError) elements.loginError.textContent = "";
  if (elements.loginPassword) elements.loginPassword.value = "";
  showToast(`مرحبًا ${user.label}`, "success");
  const current = getCurrentPageKey();
  if (user.role === "worker" && current === "dashboard") {
    window.location.href = "products.html";
    return;
  }
  if (user.role === "owner" && current !== "dashboard") {
    window.location.href = "index.html";
    return;
  }
  updateAccessUI();
  renderPage();
}

function logout() {
  currentUser = null;
  showProfit = false;
  showBuy = false;
  saveSession();
  saveVisibility();
  showToast("تم تسجيل الخروج", "info");
  updateAccessUI();
}

function getFormValues() {
  return {
    name: elements.name?.value.trim() || "",
    qty: Number(elements.qty?.value),
    buy: Number(elements.buy?.value),
    sell: Number(elements.sell?.value)
  };
}

function clearForm() {
  if (elements.name) elements.name.value = "";
  if (elements.qty) elements.qty.value = "";
  if (elements.buy) elements.buy.value = "";
  if (elements.sell) elements.sell.value = "";
  if (elements.name) elements.name.focus();
}

function addProduct() {
  if (!isOwner()) {
    showToast("إضافة المنتجات متاحة لصاحب العمل فقط.", "error");
    return;
  }

  const product = getFormValues();
  if (!product.name || product.qty < 0 || product.buy < 0 || product.sell < 0) {
    showToast("من فضلك أدخل بيانات صحيحة لكل الحقول.", "error");
    return;
  }
  if ([product.qty, product.buy, product.sell].some((value) => Number.isNaN(value))) {
    showToast("تأكد من كتابة الأرقام بشكل صحيح.", "error");
    return;
  }

  products.unshift({
    ...product,
    soldCount: 0,
    realizedProfit: 0
  });
  addLog("إضافة", product.name, product.qty);
  saveProducts();
  clearForm();
  showToast("تمت إضافة المنتج بنجاح", "success");
  renderPage();
}

function addQty(index) {
  const product = products[index];
  if (!product) return;
  product.qty += 1;
  addLog("وارد", product.name, 1);
  saveProducts();
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
  showToast("تم تسجيل حركة صادر", "success");
  renderPage();
}

function deleteProduct(index) {
  if (!isOwner()) {
    showToast("الحذف متاح لصاحب العمل فقط.", "error");
    return;
  }
  const product = products[index];
  if (!product) return;
  if (!elements.confirmModal) {
    return;
  }
  pendingDeleteIndex = index;
  elements.confirmMessage.textContent = `سيتم حذف المنتج "${product.name}" نهائيًا من القائمة.`;
  elements.confirmModal.classList.remove("is-hidden");
}

function closeConfirmModal() {
  pendingDeleteIndex = null;
  elements.confirmModal?.classList.add("is-hidden");
}

function confirmDelete() {
  if (pendingDeleteIndex === null) {
    return;
  }
  const product = products[pendingDeleteIndex];
  if (!product) {
    closeConfirmModal();
    return;
  }
  addLog("حذف", product.name, product.qty);
  products.splice(pendingDeleteIndex, 1);
  saveProducts();
  closeConfirmModal();
  showToast("تم حذف المنتج", "success");
  renderPage();
}

function editProduct(index) {
  if (!isOwner()) {
    showToast("التعديل متاح لصاحب العمل فقط.", "error");
    return;
  }

  const current = products[index];
  if (!current) return;
  if (!elements.editModal) {
    return;
  }
  editingIndex = index;
  elements.modalName.value = current.name;
  elements.modalQty.value = current.qty;
  elements.modalBuy.value = current.buy;
  elements.modalSell.value = current.sell;
  elements.editModal.classList.remove("is-hidden");
}

function showProfitInfo() {
  if (!isOwner()) {
    showToast("هذه الميزة متاحة لصاحب العمل فقط.", "error");
    return;
  }
  showProfit = true;
  saveVisibility();
  showToast("تم إظهار الربح", "success");
  renderPage();
}

function hideProfitInfo() {
  showProfit = false;
  saveVisibility();
  showToast("تم إخفاء الربح", "info");
  renderPage();
}

function showBuyInfo() {
  if (!isOwner()) {
    showToast("هذه الميزة متاحة لصاحب العمل فقط.", "error");
    return;
  }
  showBuy = true;
  saveVisibility();
  showToast("تم إظهار سعر الشراء", "success");
  renderPage();
}

function hideBuyInfo() {
  showBuy = false;
  saveVisibility();
  showToast("تم إخفاء سعر الشراء", "info");
  renderPage();
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
    name: elements.modalName.value.trim(),
    qty: Number(elements.modalQty.value),
    buy: Number(elements.modalBuy.value),
    sell: Number(elements.modalSell.value),
    soldCount: current.soldCount,
    realizedProfit: current.realizedProfit
  };

  if (
    !updated.name ||
    [updated.qty, updated.buy, updated.sell].some((value) => Number.isNaN(value)) ||
    updated.qty < 0 ||
    updated.buy < 0 ||
    updated.sell < 0
  ) {
    showToast("البيانات الجديدة غير صالحة.", "error");
    return;
  }

  products[editingIndex] = updated;
  addLog("تعديل", updated.name, updated.qty);
  saveProducts();
  closeEditModal();
  showToast("تم حفظ التعديل", "success");
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
  elements.summary.textContent =
    `تم بيع ${totalSold} قطعة حتى الآن، ويوجد ${lowStock} منتج يحتاج متابعة للمخزون.`;
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
    elements.totalProfit.textContent = isOwner() && showProfit ? formatMoney(totalProfit) : "مخفي";
  }
  renderSummary();
}

function renderProductsPage() {
  if (!elements.tableHead || !elements.tableBody) return;

  const keyword = elements.search?.value.trim().toLowerCase() || "";
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(keyword)
  );

  elements.tableHead.innerHTML = `
    <tr>
      <th>ID</th>
      <th>المنتج</th>
      <th>الكمية</th>
      ${isOwner() && showBuy ? "<th>سعر الشراء</th>" : ""}
      <th>سعر البيع</th>
      ${isOwner() && showProfit ? "<th>الربح</th>" : ""}
      <th>الحالة</th>
      <th>إجراءات</th>
    </tr>
  `;

  if (filteredProducts.length === 0) {
    const colSpan = 6 + (isOwner() && showBuy ? 1 : 0) + (isOwner() && showProfit ? 1 : 0);
    elements.tableBody.innerHTML = `<tr><td colspan="${colSpan}">لا توجد منتجات لعرضها.</td></tr>`;
    renderSummary();
    return;
  }

  elements.tableBody.innerHTML = filteredProducts
    .map((product) => {
      const index = products.indexOf(product);
      const stockLabel =
        product.qty === 0 ? "نفد" : product.qty <= 3 ? "منخفض" : "متوفر";
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${product.name}</td>
          <td>${product.qty}</td>
          ${isOwner() && showBuy ? `<td>${formatMoney(product.buy)}</td>` : ""}
          <td>${formatMoney(product.sell)}</td>
          ${isOwner() && showProfit ? `<td>${formatMoney(product.realizedProfit)}</td>` : ""}
          <td><span class="badge">${stockLabel}</span></td>
          <td class="actions-cell">
            <button class="icon-btn" data-action="addQty" data-index="${index}" title="وارد">+</button>
            <button class="icon-btn" data-action="sell" data-index="${index}" title="صادر">-</button>
            <button class="icon-btn ${!isOwner() ? "is-hidden" : ""}" data-action="edit" data-index="${index}" title="تعديل">ت</button>
            <button class="icon-btn danger ${!isOwner() ? "is-hidden" : ""}" data-action="delete" data-index="${index}" title="حذف">×</button>
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
          <td>${log.type}</td>
          <td>${log.product}</td>
          <td>${log.quantity}</td>
          <td>${log.date}</td>
          <td>${log.user}</td>
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

function exportExcel() {
  if (!isOwner()) {
    alert("تصدير التقرير متاح لصاحب العمل فقط.");
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
}

async function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  if (elements.installBtn) {
    elements.installBtn.classList.add("is-hidden");
  }
}

function printPage() {
  window.print();
}

function renderPage() {
  if (!currentUser) {
    updateAccessUI();
    return;
  }

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
  elements.floatingAdd?.addEventListener("click", addProduct);
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
      if (event.key === "Enter") login();
    });
  });

  [elements.name, elements.qty, elements.buy, elements.sell].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addProduct();
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
updateAccessUI();
renderPage();
