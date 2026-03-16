const phoneAdmin = "628170014177"; 

const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';

const restaurants = [
    { id: 3, display: "Bolosego", type: "multi", menus: ["Sego Meteyor", "Iga Mercon", "Sop Iga Sapi"] },
    { id: 12, display: "Sambel Colek Perumnas", type: "multi", menus: ["Udang", "Cumi"] },
    { id: 14, display: "Kedai Lombok Bunda", type: "multi", menus: ["Ayam Taliwang", "Sate Rembige"] },
    { id: 4, display: "Amanda Brownies", type: "multi", menus: ["Original", "Pink Marble", "Strawberry"] },
    { id: 6, display: "Sate Taichan Senayan", type: "multi", menus: ["Sate Ayam", "Nasi Ayam Rica"] },
    { id: 8, display: "Sego Sambel Tongkol", type: "multi", menus: ["Cumi", "Udang", "Ayam Suwir", "Ati"] },
    { id: 13, display: "Sop Buntut", type: "multi", menus: ["Sop Daging", "Sop Iga", "Sop Buntut"] },
    { id: 11, display: "Nasi Goreng Gila", type: "multi", menus: ["Nasi Goreng Ati Ampela", "Ketoprak Telor"] },
    { id: 1, display: "Olive Chicken", type: "single", autoMenu: "Paha Atas" },
    { id: 5, display: "Bihun Rebus", type: "single", autoMenu: "Porsi Biasa" },
    { id: 7, display: "Pisang Nugget", type: "single", autoMenu: "Cokelat Keju" },
    { id: 10, display: "Hokben", type: "single", autoMenu: "Egg Chicken Roll" },
    { id: 15, display: "Dimsum", type: "single", autoMenu: "Mentai" },
    { id: 16, display: "Risoles", type: "single", autoMenu: "Mayo" },
    { id: 17, display: "JCO", type: "single", autoMenu: "Alcapone" },
    { id: 18, display: "Cilok Kriwil", type: "single", autoMenu: "Campur" }
];

let globalCart = JSON.parse(localStorage.getItem('userCart')) || {};
let restaurantStatus = JSON.parse(localStorage.getItem('foodStatus')) || {};

function init() {
    const gridEl = document.getElementById('main-grid');
    if (!gridEl) return;
    gridEl.innerHTML = ""; 

    restaurants.forEach(resto => {
        if (restaurantStatus[resto.id] === undefined) restaurantStatus[resto.id] = true;
        const isOpen = restaurantStatus[resto.id];
        const card = document.createElement('div');
        
        const isSelectedCard = globalCart[resto.display] ? 'selected' : '';
        card.className = `card ${isOpen ? 'open' : 'closed'} ${isSelectedCard}`;
        
        let content = `
            <div class="food-header">
                <div class="food-title">${resto.display}</div>
                <span class="status-badge ${isOpen ? 'open-bg' : 'closed-bg'}">${isOpen ? 'READY' : 'HABIS'}</span>
            </div>
        `;

        if (resto.type === "multi" && isOpen) {
            content += `<div class="menu-container">`;
            resto.menus.forEach(m => {
                const isItemSelected = (globalCart[resto.display] || []).includes(m) ? "selected" : "";
                content += `<div class="menu-item ${isItemSelected}" onclick="event.stopPropagation(); toggleMulti('${resto.display}', '${m}', this)">${m}</div>`;
            });
            content += `</div>`;
        }

        if (isAdmin) {
            content += `<div class="admin-panel"><button class="btn-admin" onclick="event.stopPropagation(); toggleStatus(${resto.id})">Kelola Stok</button></div>`;
        }

        card.innerHTML = content;

        if (resto.type === "single" && isOpen) {
            card.onclick = () => toggleSingle(resto.display, resto.autoMenu, card);
        }

        gridEl.appendChild(card);
    });
    renderFloatingButton();
}

function clearAll() {
    if (confirm("Hapus semua pilihan makanan, sayang?")) {
        globalCart = {};
        localStorage.removeItem('userCart');
        init();
    }
}

function toggleSingle(display, menu, card) {
    if (globalCart[display]) {
        delete globalCart[display];
        card.classList.remove('selected');
    } else {
        globalCart[display] = [menu];
        card.classList.add('selected');
    }
    saveAndRender();
}

function toggleMulti(display, menu, element) {
    if (!globalCart[display]) globalCart[display] = [];
    const index = globalCart[display].indexOf(menu);
    
    if (index === -1) {
        globalCart[display].push(menu);
        element.classList.add('selected');
    } else {
        globalCart[display].splice(index, 1);
        element.classList.remove('selected');
        if (globalCart[display].length === 0) delete globalCart[display];
    }
    
    const card = element.closest('.card');
    if (globalCart[display]) card.classList.add('selected');
    else card.classList.remove('selected');
    
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('userCart', JSON.stringify(globalCart));
    renderFloatingButton();
}

function renderFloatingButton() {
    const floatingDiv = document.getElementById('floating-cart-container');
    if (!floatingDiv) return;
    let totalItems = 0;
    for (let r in globalCart) totalItems += globalCart[r].length;

    if (totalItems > 0) {
        floatingDiv.style.display = 'block';
        floatingDiv.innerHTML = `
            <div class="cart-actions">
                <button class="btn-clear-floating" onclick="clearAll()">🗑️</button>
                <button class="btn-wa-floating" onclick="sendWhatsApp()">Kirim ke Ayang ❤️</button>
            </div>
        `;
    } else {
        floatingDiv.style.display = 'none';
    }
}

function toggleStatus(id) {
    restaurantStatus[id] = !restaurantStatus[id];
    localStorage.setItem('foodStatus', JSON.stringify(restaurantStatus));
    init();
}

function sendWhatsApp() {
    if (Object.keys(globalCart).length === 0) return;
    let message = "Halo sayang! Geisha mau makan ini: \n\n";
    for (let resto in globalCart) {
        message += `*📍 ${resto}*\n- ${globalCart[resto].join('\n- ')}\n\n`;
    }
    message += "Beliin ya sayang! 🥰❤️";
    window.open(`https://wa.me/${phoneAdmin}?text=${encodeURIComponent(message)}`, '_blank');
}

// --- LOGIKA DEKORASI TERBANG ---
const emojis = ["🦋", "❤️", "✨", "🌸", "🍭"];

function spawnDecor() {
    const decor = document.createElement('div');
    decor.className = 'flying-decor';
    decor.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    
    const startX = Math.random() * 100; // Posisi horizontal acak (0-100vw)
    const duration = 5 + Math.random() * 5; // Durasi terbang (5-10 detik)
    const size = 20 + Math.random() * 20; // Ukuran (20-40px)

    decor.style.left = startX + 'vw';
    decor.style.fontSize = size + 'px';
    decor.style.animation = `flyUp ${duration}s linear forwards`;

    document.body.appendChild(decor);

    // Hapus elemen setelah animasi selesai
    setTimeout(() => {
        decor.remove();
    }, duration * 1000);
}

// Mulai spawn secara berkala
setInterval(spawnDecor, 1500);

// Inisialisasi saat window load
window.onload = init;