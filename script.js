/* =====================================================
   CK BREW CO. — FINAL JAVASCRIPT
===================================================== */

/* PAGE LOAD + SMOOTH PAGE TRANSITIONS */
document.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));

    setupMobileNavigation();
    setupNavbarScroll();
    setupInternalLinks();
    setupMenuCards();
    setupHomeDrinkCards();
    updateCartDisplay();
    setupOrderForm();
    setupBackToTop();
});

window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-leaving");
    document.body.classList.add("is-loaded");
});

/* MOBILE NAVIGATION */
function setupMobileNavigation() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.querySelector(".nav-links");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("show");
        toggle.innerHTML = open ? "✕" : "☰";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("show");
            toggle.innerHTML = "☰";
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

/* NAVBAR SHADOW ON SCROLL */
function setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const update = () => {
        navbar.classList.toggle("scrolled", window.scrollY > 30);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
}

/* SMOOTH TRANSITION WHEN MOVING BETWEEN HTML PAGES */
function setupInternalLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
        if (link.target === "_blank" || link.hasAttribute("download")) return;

        link.addEventListener("click", event => {
            const url = new URL(href, window.location.href);

            if (url.origin !== window.location.origin) return;

            const current = window.location.pathname.split("/").pop() || "index.html";
            const target = url.pathname.split("/").pop() || "index.html";

            if (current === target && !url.hash) return;

            event.preventDefault();
            document.body.classList.add("is-leaving");

            setTimeout(() => {
                window.location.href = url.href;
            }, 280);
        });
    });

    /* Smooth scrolling for same-page anchors */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

/* =====================================================
   CART
===================================================== */

let cart = JSON.parse(localStorage.getItem("ckBrewCart")) || [];

function saveCart() {
    localStorage.setItem("ckBrewCart", JSON.stringify(cart));
}

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            name,
            price: Number(price),
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
    showAddedMessage(name);
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartDisplay();
}

function changeQuantity(name, amount) {
    const item = cart.find(item => item.name === name);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(name);
        return;
    }

    saveCart();
    updateCartDisplay();
}

/* TOAST */
function showAddedMessage(name) {
    let message = document.getElementById("cartMessage");

    if (!message) {
        message = document.createElement("div");
        message.id = "cartMessage";
        Object.assign(message.style, {
            position: "fixed",
            bottom: "25px",
            right: "25px",
            zIndex: "9999",
            padding: "14px 20px",
            borderRadius: "12px",
            background: "#3B241A",
            color: "#F7F0E3",
            fontFamily: "Poppins, sans-serif",
            fontSize: "12px",
            boxShadow: "0 12px 30px rgba(59,36,26,.18)",
            transition: "opacity .3s ease, transform .3s ease",
            opacity: "0"
        });
        document.body.appendChild(message);
    }

    message.textContent = `✓ ${name} added to your order`;
    message.style.opacity = "1";
    message.style.transform = "translateY(0)";

    clearTimeout(window.cartMessageTimeout);
    window.cartMessageTimeout = setTimeout(() => {
        message.style.opacity = "0";
        message.style.transform = "translateY(10px)";
    }, 1800);
}

/* MENU PAGE ADD BUTTONS */
function setupMenuCards() {
    document.querySelectorAll(".menu-card").forEach(card => {
        if (card.querySelector(".add-btn")) return;

        const title = card.querySelector("h3");
        const price = card.querySelector(".menu-price");
        const bottom = card.querySelector(".menu-card-bottom");

        if (!title || !price || !bottom) return;

        const name = title.textContent.trim();
        const value = parseFloat(price.textContent.replace(/[₱,]/g, ""));
        if (Number.isNaN(value)) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "add-btn";
        button.setAttribute("aria-label", `Add ${name}`);
        button.textContent = "+";

        button.addEventListener("click", () => {
            addToCart(name, value);
            button.textContent = "✓";
            setTimeout(() => button.textContent = "+", 900);
        });

        bottom.appendChild(button);
    });
}

/* HOME PAGE FEATURED DRINK BUTTONS */
function setupHomeDrinkCards() {
    document.querySelectorAll(".drink-card").forEach(card => {
        const button = card.querySelector(".add-btn");
        const title = card.querySelector("h3");
        const price = card.querySelector("strong");

        if (!button || !title || !price || button.dataset.ready === "true") return;

        button.dataset.ready = "true";

        const name = title.textContent.trim();
        const value = parseFloat(price.textContent.replace(/[₱,]/g, ""));

        if (Number.isNaN(value)) return;

        button.addEventListener("click", () => {
            addToCart(name, value);
            button.textContent = "✓";
            setTimeout(() => button.textContent = "+", 900);
        });
    });
}

/* ORDER SUMMARY */
function updateCartDisplay() {
    const orderItems = document.getElementById("orderItems");
    const emptyOrder = document.getElementById("emptyOrder");
    const subtotalElement = document.getElementById("subtotal");
    const serviceFeeElement = document.getElementById("serviceFee");
    const totalElement = document.getElementById("total");

    if (!orderItems) return;

    if (cart.length === 0) {
        orderItems.innerHTML = "";
        if (emptyOrder) emptyOrder.style.display = "block";
        if (subtotalElement) subtotalElement.textContent = "₱0.00";
        if (serviceFeeElement) serviceFeeElement.textContent = "₱0.00";
        if (totalElement) totalElement.textContent = "₱0.00";
        return;
    }

    if (emptyOrder) emptyOrder.style.display = "none";

    orderItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement("div");
        row.className = "order-item";
        row.innerHTML = `
            <div class="order-item-info">
                <h4>${escapeHtml(item.name)}</h4>
                <p>₱${item.price.toFixed(2)} each</p>
            </div>
            <div class="order-item-controls">
                <button type="button" class="quantity-btn" data-action="decrease" data-name="${escapeAttribute(item.name)}">−</button>
                <span>${item.quantity}</span>
                <button type="button" class="quantity-btn" data-action="increase" data-name="${escapeAttribute(item.name)}">+</button>
                <strong>₱${itemTotal.toFixed(2)}</strong>
                <button type="button" class="remove-item" data-name="${escapeAttribute(item.name)}">×</button>
            </div>
        `;

        orderItems.appendChild(row);
    });

    const serviceFee = subtotal > 0 ? 10 : 0;
    const total = subtotal + serviceFee;

    if (subtotalElement) subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    if (serviceFeeElement) serviceFeeElement.textContent = `₱${serviceFee.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₱${total.toFixed(2)}`;

    orderItems.querySelectorAll(".quantity-btn").forEach(button => {
        button.addEventListener("click", () => {
            changeQuantity(button.dataset.name, button.dataset.action === "increase" ? 1 : -1);
        });
    });

    orderItems.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", () => removeFromCart(button.dataset.name));
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;"
    }[char]));
}

function escapeAttribute(value) {
    return String(value).replace(/"/g, "&quot;");
}

/* ORDER FORM */
function setupOrderForm() {
    const form = document.getElementById("orderForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (cart.length === 0) {
            alert("Please add at least one item to your order.");
            return;
        }

        const name = document.getElementById("customerName")?.value.trim();
        const phone = document.getElementById("customerPhone")?.value.trim();
        const orderType = document.getElementById("orderType")?.value;
        const preferredTime = document.getElementById("pickupTime")?.value;

        if (!name || !phone || !orderType || !preferredTime) {
            alert("Please complete all required order details.");
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const serviceFee = 10;
        const total = subtotal + serviceFee;

        /* FORMAL CK BREW CO. RECEIPT */

        const orderNumber = "CK-" + Math.floor(1000 + Math.random() * 9000);

        const orderDate = new Date().toLocaleDateString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const orderTypeText =
            orderType === "pickup" ? "Pick Up" : "Dine In";

        const specialRequest =
            document.getElementById("specialRequest")?.value.trim() || "";

        const receiptItems = cart.map(item => {
            const itemTotal = item.price * item.quantity;

            return `
                <div class="receipt-item">
                    <div class="receipt-item-name">
                        <strong>${escapeHtml(item.name)}</strong>
                        <small>${item.quantity} × ₱${item.price.toFixed(2)}</small>
                    </div>
                    <strong class="receipt-item-total">₱${itemTotal.toFixed(2)}</strong>
                </div>
            `;
        }).join("");

        const receipt = document.createElement("div");
        receipt.className = "receipt-overlay";

        receipt.innerHTML = `
            <div class="receipt-modal" role="dialog" aria-modal="true" aria-label="CK Brew Co. Order Receipt">

                <button type="button" class="receipt-close" aria-label="Close receipt">×</button>

                <div class="receipt-brand">
                    <div class="receipt-cup">☕</div>
                    <h2>CK BREW CO.</h2>
                    <p>BREWED FOR YOUR EVERYDAY.</p>
                </div>

                <div class="receipt-title-row">
                    <span>ORDER RECEIPT</span>
                    <span>#${orderNumber}</span>
                </div>

                <div class="receipt-meta">
                    <div>
                        <span>DATE</span>
                        <strong>${orderDate}</strong>
                    </div>
                    <div>
                        <span>ORDER TYPE</span>
                        <strong>${orderTypeText}</strong>
                    </div>
                    <div>
                        <span>CUSTOMER</span>
                        <strong>${escapeHtml(name)}</strong>
                    </div>
                    <div>
                        <span>CONTACT</span>
                        <strong>${escapeHtml(phone)}</strong>
                    </div>
                    <div class="receipt-meta-full">
                        <span>PREFERRED TIME</span>
                        <strong>${escapeHtml(preferredTime)}</strong>
                    </div>
                </div>

                <div class="receipt-section-title">YOUR ORDER</div>

                <div class="receipt-items">
                    ${receiptItems}
                </div>

                <div class="receipt-summary">
                    <div>
                        <span>Subtotal</span>
                        <strong>₱${subtotal.toFixed(2)}</strong>
                    </div>
                    <div>
                        <span>Service Fee</span>
                        <strong>₱${serviceFee.toFixed(2)}</strong>
                    </div>
                    <div class="receipt-grand-total">
                        <span>TOTAL</span>
                        <strong>₱${total.toFixed(2)}</strong>
                    </div>
                </div>

                ${specialRequest ? `
                    <div class="receipt-note">
                        <span>SPECIAL REQUEST</span>
                        <p>${escapeHtml(specialRequest)}</p>
                    </div>
                ` : ""}

                <div class="receipt-thank-you">
                    <strong>Thank you for choosing CK Brew Co.</strong>
                    <span>We’ll prepare your order with care. 🤎</span>
                </div>

                <div class="receipt-actions">
                    <button type="button" class="receipt-print">PRINT RECEIPT</button>
                    <button type="button" class="receipt-done">DONE</button>
                </div>

            </div>
        `;

        document.body.appendChild(receipt);

        const closeReceipt = () => {
            receipt.classList.add("receipt-closing");
            setTimeout(() => receipt.remove(), 220);
        };

        receipt.querySelector(".receipt-close").addEventListener("click", closeReceipt);
        receipt.querySelector(".receipt-done").addEventListener("click", closeReceipt);

        receipt.querySelector(".receipt-print").addEventListener("click", () => {
            window.print();
        });

        cart = [];
        saveCart();
        updateCartDisplay();
        form.reset();

        cart = [];
        saveCart();
        updateCartDisplay();
        form.reset();
    });
}

/* BACK TO TOP */
function setupBackToTop() {
    const button = document.getElementById("backToTop");
    if (!button) return;

    window.addEventListener("scroll", () => {
        button.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}
