const cards = [...document.querySelectorAll(".art-card")];
const cartButton = document.querySelector(".cart-icon");
const cartCount = document.querySelector(".cart-icon span");
const cartDrawer = document.querySelector(".cart-drawer");
const cartClose = document.querySelector(".cart-close");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const checkoutButton = document.querySelector(".checkout-btn");
const pageOverlay = document.querySelector(".page-overlay");
const filterButtons = [...document.querySelectorAll(".filters button")];
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const modal = document.getElementById("lightbox");
const modalImage = document.getElementById("full-img");
const modalTitle = document.getElementById("modal-title");
const modalMedium = document.getElementById("modal-medium");
const modalSize = document.getElementById("modal-size");
const modalPrice = document.getElementById("modal-price");
const modalAdd = document.querySelector(".modal-add");
const closeModalButton = document.querySelector(".close");

let cart = [];
let selectedArtwork = null;
const contactEmail = "shuklashreya5123@gmail.com";

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

function getArtwork(card) {
    const image = card.dataset.image || card.querySelector("img").src;

    return {
        title: card.dataset.title,
        price: Number(card.dataset.price),
        medium: card.dataset.medium,
        size: card.dataset.size,
        image
    };
}

function updateCart() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    cartCount.textContent = cart.length;
    cartTotal.textContent = currency.format(total);

    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Your collection is waiting.</p>';
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
        <article class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div>
                <h3>${item.title}</h3>
                <p>${item.medium}</p>
                <strong>${currency.format(item.price)}</strong>
            </div>
            <button class="cart-remove" type="button" data-index="${index}" aria-label="Remove ${item.title}">Remove</button>
        </article>
    `).join("");
}

function addToCart(artwork, button) {
    cart.push(artwork);
    updateCart();

    if (button) {
        const originalText = button.textContent;
        button.textContent = "Added";
        button.disabled = true;
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1200);
    }

    openCart();
}

function openCart() {
    cartDrawer.classList.add("is-open");
    pageOverlay.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
}

function closeCart() {
    cartDrawer.classList.remove("is-open");
    pageOverlay.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
}

function openModal(artwork) {
    selectedArtwork = artwork;
    modalImage.src = artwork.image;
    modalImage.alt = artwork.title;
    modalTitle.textContent = artwork.title;
    modalMedium.textContent = artwork.medium;
    modalSize.textContent = artwork.size;
    modalPrice.textContent = currency.format(artwork.price);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
}

function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    selectedArtwork = null;
    if (!cartDrawer.classList.contains("is-open")) {
        document.body.classList.remove("no-scroll");
    }
}

cards.forEach((card) => {
    const artwork = getArtwork(card);

    card.querySelector(".add-to-cart").addEventListener("click", (event) => {
        addToCart(artwork, event.currentTarget);
    });

    card.querySelector(".quick-view").addEventListener("click", () => {
        openModal(artwork);
    });
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        cards.forEach((card) => {
            const isVisible = filter === "all" || card.dataset.category === filter;
            card.classList.toggle("is-hidden", !isVisible);
        });
    });
});

cartButton.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
pageOverlay.addEventListener("click", closeCart);

cartItems.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".cart-remove");

    if (!removeButton) {
        return;
    }

    cart.splice(Number(removeButton.dataset.index), 1);
    updateCart();
});

checkoutButton.addEventListener("click", () => {
    const subject = "Artwork Purchase Inquiry";
    const body = cart.length
        ? [
            "Hello Shreya,",
            "",
            "I am interested in these artworks:",
            ...cart.map((item) => `- ${item.title} (${item.medium}) - ${currency.format(item.price)}`),
            "",
            `Total: ${cartTotal.textContent}`,
            "",
            "Please share the next steps."
        ].join("\n")
        : [
            "Hello Shreya,",
            "",
            "I would like to inquire about available artworks and commissions.",
            "",
            "Please share the next steps."
        ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

modalAdd.addEventListener("click", () => {
    if (selectedArtwork) {
        addToCart(selectedArtwork, modalAdd);
        closeModal();
    }
});

closeModalButton.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal();
        closeCart();
    }
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.16 });

document.querySelectorAll(".art-card, .journal-grid article, .service-list div").forEach((element) => {
    element.classList.add("reveal-item");
    observer.observe(element);
});

updateCart();
