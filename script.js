
// ===================================
// STUDENT SUPPLIES ORDERING SYSTEM
// PRODUCT AND CART FUNCTIONALITY
// ===================================

// Available school supplies
const products = [
    { id: 1, name: "Ballpen", price: 12 },
    { id: 2, name: "Pencil", price: 10 },
    { id: 3, name: "Notebook", price: 35 },
    { id: 4, name: "Yellow Pad", price: 45 },
    { id: 5, name: "Eraser", price: 8 },
    { id: 6, name: "Ruler", price: 15 }
];

// Cart data
let cart = [];
let paymentCompleted = false;

// HTML elements
const cartItems = document.getElementById("cart-items");
const totalElement = document.getElementById("total");
const cashInput = document.getElementById("cash");
const paymentMessage = document.getElementById("payment-message");
const receiptElement = document.getElementById("receipt");
const payButton = document.getElementById("pay-btn");
const newButton = document.getElementById("new-btn");

// Format amounts as Philippine pesos
function peso(amount) {
    return "₱" + amount.toFixed(2);
}

// Get overall total
function calculateTotal() {
    return cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

// Add a product
function addToCart(id) {
    if (paymentCompleted) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    renderCart();
}

// Increase or decrease quantity
function changeQuantity(id, amount) {
    if (paymentCompleted) return;

    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += amount;

    // Remove the item if its quantity reaches zero
    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    renderCart();
}

// Remove a product
function removeItem(id) {
    if (paymentCompleted) return;

    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// Display cart contents and total
function renderCart() {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const details = document.createElement("p");
        details.textContent =
            `${peso(item.price)} × ${item.quantity} = ${peso(subtotal)}`;

        const controls = document.createElement("div");
        controls.className = "cart-controls";

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.disabled = paymentCompleted;
        minus.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = `Qty: ${item.quantity}`;

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.disabled = paymentCompleted;
        plus.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.disabled = paymentCompleted;
        remove.addEventListener("click", () => {
            removeItem(item.id);
        });

        controls.append(minus, quantity, plus, remove);
        row.append(name, details, controls);
        cartItems.appendChild(row);
    });

    totalElement.textContent = peso(calculateTotal());

    // Clear any pending payment after changing the cart
    if (!paymentCompleted) {
        cashInput.value = "";
        paymentMessage.textContent = "";
    }
}

// Connect product buttons to JavaScript
document.querySelectorAll(".add-btn").forEach(button => {
    button.addEventListener("click", () => {
        const id = Number(button.dataset.id);
        addToCart(id);
    });
});

// Display the initial empty cart
renderCart();


// ===================================
// CASH PAYMENT AND RECEIPT
// ===================================

// Confirm customer's cash payment
function confirmPayment() {
    if (paymentCompleted) return;

    const input = cashInput.value.trim();
    const total = calculateTotal();

    // Check empty cart
    if (cart.length === 0) {
        showPaymentError("Please add products to your cart.");
        return;
    }

    // Check blank payment
    if (input === "") {
        showPaymentError("Please enter your cash payment.");
        return;
    }

    // Check negative payment
    if (input.startsWith("-")) {
        showPaymentError("Cash payment cannot be negative.");
        return;
    }

    // Check invalid numbers and decimal format
    if (!/^\d+(\.\d{1,2})?$/.test(input)) {
        showPaymentError("Please enter a valid amount (up to 2 decimal places).");
        return;
    }

    const amountPaid = Number(input);

    // Convert to centavos for accurate comparison
    const paidCents = Math.round(amountPaid * 100);
    const totalCents = Math.round(total * 100);

    // Check insufficient cash
    if (!Number.isSafeInteger(paidCents)) {
        showPaymentError("Please enter a smaller valid amount.");
        return;
    }

    if (paidCents < totalCents) {
        showPaymentError("Insufficient payment. Please enter enough cash.");
        return;
    }

    const change = (paidCents - totalCents) / 100;

    // Successful payment
    paymentCompleted = true;
    paymentMessage.textContent =
        `Payment successful! Your change is ${peso(change)}.`;
    paymentMessage.style.color = "green";

    // Prevent changing the completed order
    cashInput.disabled = true;
    payButton.disabled = true;

    document.querySelectorAll(".add-btn").forEach(button => {
        button.disabled = true;
    });

    renderCart();

    // Generate digital receipt
    generateReceipt(amountPaid, change);
}

// Display payment error
function showPaymentError(message) {
    paymentMessage.textContent = message;
    paymentMessage.style.color = "red";
}

// Generate transaction receipt
function generateReceipt(amountPaid, change) {
    const now = new Date();

    const reference =
        "TXN-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 10000).toString().padStart(4, "0");

    receiptElement.innerHTML = "";

    function addReceiptLine(text, heading = false) {
        const element = document.createElement(
            heading ? "h3" : "p"
        );

        element.textContent = text;
        receiptElement.appendChild(element);
    }

    addReceiptLine("CAMPUS SCHOOL SUPPLIES", true);
    addReceiptLine(`Reference: ${reference}`);
    addReceiptLine(`Date: ${now.toLocaleString("en-PH")}`);

    receiptElement.appendChild(document.createElement("hr"));

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;

        addReceiptLine(
            `${item.name} | ${item.quantity} × ${peso(item.price)} | ${peso(subtotal)}`
        );
    });

    receiptElement.appendChild(document.createElement("hr"));

    addReceiptLine(`Total Amount: ${peso(calculateTotal())}`);
    addReceiptLine(`Amount Paid: ${peso(amountPaid)}`);
    addReceiptLine(`Change: ${peso(change)}`);
    addReceiptLine("PAYMENT CONFIRMED. THANK YOU!", true);
}

// Start another transaction
function newTransaction() {
    cart = [];
    paymentCompleted = false;

    cashInput.value = "";
    cashInput.disabled = false;
    payButton.disabled = false;

    paymentMessage.textContent = "";
    paymentMessage.style.color = "";

    receiptElement.innerHTML =
        "<p>No completed transaction yet.</p>";

    document.querySelectorAll(".add-btn").forEach(button => {
        button.disabled = false;
    });

    renderCart();
}

// Connect buttons
payButton.addEventListener("click", confirmPayment);
newButton.addEventListener("click", newTransaction);
