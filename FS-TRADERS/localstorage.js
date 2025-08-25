/* ========= Utility: Local Storage Handler ========= */
function getItems() {
  return JSON.parse(localStorage.getItem("items")) || [];
}
function saveItems(items) {
  localStorage.setItem("items", JSON.stringify(items));
}

/* ========= Shop Value (homepage.html) ========= */
function updateShopValue() {
  const items = getItems();
  let total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const valueBox = document.getElementById("shop-value");
  if (valueBox) valueBox.textContent = `Shop Value: ₹${total}`;
}

/* ========= Items Info Page (itemsinfo.html) ========= */
function renderItemsInfo(searchText = "") {
  const container = document.getElementById("itemsList");
  if (!container) return;

  let items = getItems();
  if (searchText) {
    items = items.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()));
  }

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p class="no-items">No items found.</p>`;
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <span class="col name">${item.name}</span>
      <span class="col price">₹${item.price}</span>
      <span class="col qty">${item.quantity}</span>
      <button onclick="removeItem(${index})" class="remove-btn">×</button>
    `;

    // if item has image, attach hover preview
    if (item.image) {
      attachHoverPreview(row, item.image);
    }

    container.appendChild(row);
  });
}

/* ========= Set Quantity Page (setquantity.html) ========= */
function renderSetQuantity(searchText = "") {
  const container = document.getElementById("quantity-list");
  if (!container) return;

  let items = getItems();
  if (searchText) {
    items = items.filter(i => i.name.toLowerCase().includes(searchText.toLowerCase()));
  }

  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = `<p class="no-items">No items found.</p>`;
    return;
  }

  items.forEach((item, index) => {
    let row = document.createElement("div");
    row.className = "quantity-row";
    row.innerHTML = `
      <div class="q-name">${item.name}</div>
      <div class="q-controls">
        <button onclick="changeQuantity(${index}, -1)">-</button>
        <span onclick="editQuantity(${index})">${item.quantity}</span>
        <button onclick="changeQuantity(${index}, 1)">+</button>
      </div>
      <button onclick="editPrice(${index})">Set Price</button>
      <button onclick="removeItem(${index})" class="remove-btn">×</button>
    `;
    container.appendChild(row);
  });
}

function changeQuantity(index, delta) {
  let items = getItems();
  items[index].quantity = Math.max(0, items[index].quantity + delta);
  saveItems(items);
  renderSetQuantity();
  renderItemsInfo();
  updateShopValue();
}

function editQuantity(index) {
  openModal("Set Quantity", getItems()[index].quantity, (val) => {
    let items = getItems();
    items[index].quantity = parseInt(val, 10) || 0;
    saveItems(items);
    renderSetQuantity();
    renderItemsInfo();
    updateShopValue();
  });
}

function editPrice(index) {
  openModal("Set Price (₹)", getItems()[index].price, (val) => {
    let items = getItems();
    items[index].price = parseFloat(val) || 0;
    saveItems(items);
    renderSetQuantity();
    renderItemsInfo();
    updateShopValue();
  });
}

/* ========= New Item Page (newitem.html) ========= */
function addNewItem() {
  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const image = document.getElementById("preview")?.src || "";

  if (!name || isNaN(price)) {
    alert("Please enter valid name and price.");
    return;
  }

  let items = getItems();
  if (items.some(i => i.name.toLowerCase() === name.toLowerCase())) {
    alert("Item already exists!");
    return;
  }

  items.push({ name, price, quantity: 0, image });
  saveItems(items);

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  if (document.getElementById("preview")) document.getElementById("preview").style.display = "none";

  const msg = document.getElementById("successMsg");
  if (msg) {
    msg.style.display = "block";
    setTimeout(() => (msg.style.display = "none"), 1500);
  }

  updateShopValue();
}

/* ========= Remove Item (shared) ========= */
function removeItem(index) {
  let items = getItems();
  if (confirm(`Remove "${items[index].name}"?`)) {
    items.splice(index, 1);
    saveItems(items);
    renderItemsInfo();
    renderSetQuantity();
    updateShopValue();
  }
}

/* ========= Modal Input Box (instead of prompt) ========= */
function openModal(title, value, onConfirm) {
  let modal = document.getElementById("inputModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "inputModal";
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-box">
        <h3 id="modalTitle"></h3>
        <input type="number" id="modalInput" />
        <div class="modal-actions">
          <button id="modalOk">OK</button>
          <button id="modalCancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";
  document.getElementById("modalTitle").innerText = title;
  const input = document.getElementById("modalInput");
  input.value = value;
  input.focus();

  const okBtn = document.getElementById("modalOk");
  const cancelBtn = document.getElementById("modalCancel");

  okBtn.onclick = () => {
    onConfirm(input.value);
    modal.style.display = "none";
  };
  cancelBtn.onclick = () => (modal.style.display = "none");
  modal.querySelector(".modal-overlay").onclick = () => (modal.style.display = "none");
}

/* ========= Sidebar Menu (shared) ========= */
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
    sidebar.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
      });
    });
  }

  // Search binding for pages
  const searchInfo = document.getElementById("searchInput");
  if (searchInfo) {
    searchInfo.addEventListener("input", e => renderItemsInfo(e.target.value));
    renderItemsInfo();
  }

  const searchQuantity = document.getElementById("search-quantity");
  if (searchQuantity) {
    searchQuantity.addEventListener("input", e => renderSetQuantity(e.target.value));
    renderSetQuantity();
  }

  updateShopValue();
});

/* ========= Hover Image Follow Cursor ========= */
let hoverPreview = null;
let hoverTimeout = null;

function attachHoverPreview(element, imgSrc) {
  element.addEventListener("mousemove", (e) => {
    if (hoverPreview) {
      hoverPreview.style.left = e.pageX + 15 + "px";
      hoverPreview.style.top = e.pageY + 15 + "px";
    }
  });

  element.addEventListener("mouseenter", () => {
    hoverTimeout = setTimeout(() => {
      if (!hoverPreview) {
        hoverPreview = document.createElement("div");
        hoverPreview.className = "img-preview";
        hoverPreview.innerHTML = `<img src="${imgSrc}" alt="Item Image">`;
        hoverPreview.style.position = "absolute";
        hoverPreview.style.pointerEvents = "none";
        hoverPreview.style.transition = "opacity 0.2s";
        hoverPreview.style.opacity = "0";
        hoverPreview.style.zIndex = "9999";
        document.body.appendChild(hoverPreview);

        requestAnimationFrame(() => { hoverPreview.style.opacity = "1"; });
      }
      hoverPreview.style.display = "block";
    }, 1000); // 1 sec delay
  });

  element.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    if (hoverPreview) {
      hoverPreview.remove();
      hoverPreview = null;
    }
  });
}
