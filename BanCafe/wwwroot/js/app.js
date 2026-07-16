// State Management
let cart = [];
let products = [];
let blogs = [];
let currentLang = localStorage.getItem('pureva_lang') || 'VI';
let websiteSettings = null;

// Backend API URL (for standard web browsers)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.test')
    ? 'http://localhost:5000/api'
    : 'https://bancafe-backend-api.onrender.com/api';

const langMap = {
    VI: {
        navHome: "TRANG CHỦ",
        navShop: "CỬA HÀNG",
        navCustomize: "TUỲ CHỈNH",
        navBlog: "TIN TỨC",
        hello: "Xin chào!",
        adminPanel: "Trang quản trị",
        logout: "Đăng xuất",
        login: "Đăng nhập",
        register: "Đăng ký",
        cartTitle: "Giỏ Hàng Của Bạn",
        cartTotal: "Tổng tiền:",
        checkoutBtn: "ĐẶT HÀNG NGAY",
        placeholderName: "Họ và tên",
        placeholderPhone: "Số điện thoại",
        placeholderEmail: "Email",
        placeholderAddress: "Địa chỉ nhận hàng",
        footerSlogan: "Cà phê hữu cơ, nguồn gốc minh bạch.",
        footerLinks: "Liên kết",
        footerContact: "Liên hệ",
        footerSocial: "Mạng xã hội",
        footerRights: "Bảo lưu mọi quyền.",
        footerHome: "Trang chủ",
        footerShop: "Cửa hàng",
        footerBlog: "Tin tức",
        footerCustomize: "Tuỳ chỉnh",
        footerAddressDefault: "Lâm Đồng, Việt Nam",
        toastCartAdded: "Đã thêm sản phẩm vào giỏ hàng!",
        toastCartCleared: "Giỏ hàng đã được làm trống!",
        toastCheckoutSuccess: "Đặt hàng thành công!",
    },
    EN: {
        navHome: "HOME",
        navShop: "SHOP",
        navCustomize: "CUSTOMIZE",
        navBlog: "BLOG",
        hello: "Hello!",
        adminPanel: "Admin Panel",
        logout: "Logout",
        login: "Login",
        register: "Register",
        cartTitle: "Your Cart",
        cartTotal: "Total:",
        checkoutBtn: "CHECKOUT NOW",
        placeholderName: "Full Name",
        placeholderPhone: "Phone Number",
        placeholderEmail: "Email",
        placeholderAddress: "Delivery Address",
        footerSlogan: "Organic coffee, transparent origin.",
        footerLinks: "Links",
        footerContact: "Contact",
        footerSocial: "Social Media",
        footerRights: "All rights reserved.",
        footerHome: "Home",
        footerShop: "Shop",
        footerBlog: "Blog",
        footerCustomize: "Customize",
        footerAddressDefault: "Lam Dong, Vietnam",
        toastCartAdded: "Product added to cart!",
        toastCartCleared: "Cart has been cleared!",
        toastCheckoutSuccess: "Order placed successfully!",
    }
};

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    initCommonUI();
    registerWebViewListeners();
    injectAnimationCSS();
    applyTranslation();
    
    // Request initial page-specific data
    requestPageData();
    
    // Check if redirect wants us to open auth modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAuth') === 'login') {
        openAuthModal('login');
    }
    
    // Initial scroll reveal setup
    setTimeout(initScrollReveal, 100);
});

// Common UI Elements (Navbar, Cart Drawer, Login Modal)
function initCommonUI() {
    const t = langMap[currentLang];
    
    // 1. Render Navigation Bar
    const navbar = document.getElementById('navbar-container');
    if (navbar) {
        navbar.innerHTML = `
            <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-24 items-center">
                    <!-- Mobile Hamburger Button -->
                    <div class="flex items-center md:hidden">
                        <button onclick="toggleMobileMenu(true)" class="p-2 text-coffee-accent hover:text-coffee-gold focus:outline-none" id="mobile-menu-btn">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div class="flex-shrink-0 flex items-center">
                        <a href="index.html" class="flex items-center">
                            <img src="images/logo/logo.jpg" alt="Pureva Logo" class="h-20 object-contain rounded bg-[#533E2D] p-1.5 shadow-md">
                        </a>
                    </div>
                    <div class="hidden md:flex space-x-8">
                        <a href="index.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-coffee-gold transition-colors py-2">${t.navHome}</a>
                        <a href="shop.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-coffee-gold transition-colors py-2">${t.navShop}</a>
                        <a href="customize.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-coffee-gold transition-colors py-2">${t.navCustomize}</a>
                        <a href="blog.html" class="nav-link text-[13px] tracking-wider font-semibold uppercase hover:text-coffee-gold transition-colors py-2">${t.navBlog}</a>
                    </div>
                    <div class="flex items-center space-x-4 sm:space-x-6">
                        <!-- Language Selector -->
                        <div id="lang-selector-btn" onclick="toggleLanguage(event)" class="border border-coffee-gold/60 text-coffee-gold hover:bg-coffee-gold/10 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold select-none cursor-pointer transition-colors duration-200 font-sans tracking-wide">
                            ${currentLang}
                        </div>
                        
                        <!-- Profile / Admin Link -->
                        <div class="relative inline-block text-left" id="user-menu-wrapper">
                            <button onclick="handleUserIconClick(event)" class="p-2 text-coffee-accent hover:text-coffee-gold transition-colors focus:outline-none cursor-pointer" title="Tài khoản">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                            <!-- User Dropdown Menu -->
                            <div id="user-dropdown-menu" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-coffee-light border border-coffee-lighter ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div class="py-1 text-sm font-sans" role="none">
                                    <div class="px-4 py-2 text-xs text-coffee-gold border-b border-coffee-lighter/40 font-semibold" id="dropdown-username">${t.hello}</div>
                                    <a href="admin.html" id="dropdown-admin-link" class="hidden block px-4 py-2.5 text-coffee-accent hover:bg-coffee hover:text-white transition-colors" role="menuitem">${t.adminPanel}</a>
                                    <button onclick="handleUserLogout()" class="w-full text-left block px-4 py-2.5 text-coffee-accent hover:bg-coffee hover:text-white transition-colors focus:outline-none" role="menuitem">${t.logout}</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Cart Toggle -->
                        <button onclick="toggleCartDrawer(true)" class="relative p-2 text-coffee-accent hover:text-coffee-gold transition-colors focus:outline-none">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span id="cart-badge" class="absolute -top-1 -right-1 bg-forest text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center hidden">
                                0
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
        // Render Mobile Menu Drawer directly to body to avoid stacking context parent clip/transparent bugs
        let mobileDrawer = document.getElementById('mobile-menu-drawer');
        if (!mobileDrawer) {
            mobileDrawer = document.createElement('div');
            mobileDrawer.id = 'mobile-menu-drawer';
            document.body.appendChild(mobileDrawer);
        }
        mobileDrawer.className = "fixed inset-0 z-50 bg-black/50 hidden opacity-0 transition-opacity duration-300";
        mobileDrawer.innerHTML = `
            <div class="absolute top-0 left-0 bottom-0 w-64 max-w-sm border-r p-6 flex flex-col justify-between transform -translate-x-full transition-transform duration-300 shadow-2xl" id="mobile-menu-panel" style="background-color: #533E2D !important; border-color: #7A6452 !important; opacity: 1 !important;">
                <div>
                    <div class="flex justify-between items-center mb-8">
                        <img src="images/logo/logo.jpg" alt="Pureva Logo" class="h-14 object-contain rounded bg-[#533E2D] p-1 shadow-md">
                        <button onclick="toggleMobileMenu(false)" class="text-coffee-accent hover:text-white text-2xl font-bold focus:outline-none">&times;</button>
                    </div>
                    <div class="flex flex-col space-y-4 font-sans font-medium text-sm">
                        <a href="index.html" class="nav-link-mobile text-coffee-accent hover:text-coffee-gold transition-colors py-2 border-b border-coffee-lighter/20">${t.navHome}</a>
                        <a href="shop.html" class="nav-link-mobile text-coffee-accent hover:text-coffee-gold transition-colors py-2 border-b border-coffee-lighter/20">${t.navShop}</a>
                        <a href="customize.html" class="nav-link-mobile text-coffee-accent hover:text-coffee-gold transition-colors py-2 border-b border-coffee-lighter/20">${t.navCustomize}</a>
                        <a href="blog.html" class="nav-link-mobile text-coffee-accent hover:text-coffee-gold transition-colors py-2 border-b border-coffee-lighter/20">${t.navBlog}</a>
                    </div>
                </div>
                <div class="pt-6 border-t border-coffee-lighter/20 text-xs text-coffee-accent/60 font-sans">
                    &copy; 2026 Pureva Coffee.
                </div>
            </div>
        `;
        
        // Highlight active link
        const currentPath = window.location.pathname.split("/").pop();
        const links = navbar.querySelectorAll('.nav-link');
        links.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('text-coffee-gold', 'border-b-2', 'border-coffee-gold');
            }
        });
        const mobileLinks = mobileDrawer.querySelectorAll('.nav-link-mobile');
        mobileLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('text-coffee-gold', 'font-bold');
            }
        });
        updateHeaderUserUI();
    }

    // 2. Render Footer Container
    const footer = document.getElementById('footer-container');
    if (footer) {
        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-coffee-lighter/20 pb-12 text-left">
                    <!-- Column 1: Logo & Slogan -->
                    <div class="space-y-4">
                        <img src="images/logo/logo.jpg" alt="Pureva Logo" class="h-22 object-contain rounded bg-[#533E2D] p-1.5 shadow-md">
                        <p class="text-sm italic text-coffee-accent/80 font-sans tracking-wide">${t.footerSlogan}</p>
                    </div>
                    
                    <!-- Column 2: Liên kết -->
                    <div>
                        <h4 class="font-serif text-base font-bold text-coffee-gold mb-6 tracking-wide">${t.footerLinks}</h4>
                        <ul class="space-y-3.5 text-sm font-sans">
                            <li><a href="index.html" class="text-coffee-accent/80 hover:text-white transition-colors duration-200">${t.footerHome}</a></li>
                            <li><a href="shop.html" class="text-coffee-accent/80 hover:text-white transition-colors duration-200">${t.footerShop}</a></li>
                            <li><a href="blog.html" class="text-coffee-accent/80 hover:text-white transition-colors duration-200">${t.footerBlog}</a></li>
                            <li><a href="customize.html" class="text-coffee-accent/80 hover:text-white transition-colors duration-200">${t.footerCustomize}</a></li>
                        </ul>
                    </div>
                    
                    <!-- Column 3: Liên hệ -->
                    <div>
                        <h4 class="font-serif text-base font-bold text-coffee-gold mb-6 tracking-wide">${t.footerContact}</h4>
                        <ul class="space-y-3.5 text-sm font-sans text-coffee-accent/80">
                            <li id="footer-address">${t.footerAddressDefault}</li>
                            <li id="footer-email">info@pureva.com</li>
                            <li id="footer-phone">+84 263 123 4567</li>
                        </ul>
                    </div>
                    
                    <!-- Column 4: Mạng xã hội -->
                    <div>
                        <h4 class="font-serif text-base font-bold text-coffee-gold mb-6 tracking-wide">${t.footerSocial}</h4>
                        <div class="flex space-x-3">
                            <a href="https://www.facebook.com/thepurevaproject" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full border border-coffee-lighter/40 flex items-center justify-center text-coffee-accent/80 hover:text-white hover:border-coffee-gold transition-colors duration-200">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/p/DZcXJHhPxav/?igsh=MWd2Z3dmdDUyMDdscQ%3D%3D" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full border border-coffee-lighter/40 flex items-center justify-center text-coffee-accent/80 hover:text-white hover:border-coffee-gold transition-colors duration-200">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@puvera93" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full border border-coffee-lighter/40 flex items-center justify-center text-coffee-accent/80 hover:text-white hover:border-coffee-gold transition-colors duration-200">
                                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.19 4.32-3.13 5.46-1.57.94-3.52 1.16-5.27.67-1.87-.51-3.41-1.84-4.2-3.61-.7-1.56-.81-3.37-.29-4.99.5-1.54 1.68-2.78 3.14-3.44 1.56-.71 3.42-.76 5.04-.15v4.06c-1.34-.41-2.9-.3-4.04.47-1.12.75-1.67 2.15-1.37 3.44.25 1.09 1.11 1.99 2.18 2.31 1.09.32 2.33.15 3.25-.5.92-.64 1.49-1.68 1.6-2.79.03-3.64.01-7.29.01-10.93V.02z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom row -->
                <div class="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-coffee-accent/60 font-sans space-y-4 sm:space-y-0">
                    <p>&copy; 2026 Pureva. ${t.footerRights}</p>
                    <a href="#" class="hover:text-white transition-colors duration-200">Privacy Policy</a>
                </div>
            </div>
        `;
    }

    // 3. Render Cart Drawer if target exists
    const cartDrawerContainer = document.getElementById('cart-drawer-container');
    if (cartDrawerContainer) {
        cartDrawerContainer.innerHTML = `
            <div id="cart-drawer-backdrop" onclick="toggleCartDrawer(false)" class="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 opacity-0 pointer-events-none z-50"></div>
            <div id="cart-drawer" class="fixed top-0 right-0 h-full w-full max-w-md bg-coffee-light border-l border-coffee-lighter shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col">
                <div class="p-6 border-b border-coffee-lighter flex justify-between items-center bg-coffee">
                    <h2 class="font-serif text-xl font-bold text-coffee-gold">${t.cartTitle}</h2>
                    <button onclick="toggleCartDrawer(false)" class="text-coffee-accent hover:text-white p-2">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div id="cart-items" class="flex-grow overflow-y-auto p-6 space-y-4">
                    <!-- Cart items will be loaded dynamically here -->
                </div>
                
                <div class="p-6 border-t border-coffee-lighter bg-coffee-dark space-y-6">
                    <div class="flex justify-between text-base font-medium text-coffee-accent">
                        <span>${t.cartTotal}</span>
                        <span id="cart-total" class="text-coffee-gold font-bold">0đ</span>
                    </div>
                    
                    <form id="checkout-form" onsubmit="handleCheckout(event)" class="space-y-3 pt-2">
                        <div>
                            <input type="text" id="cust-name" required placeholder="${t.placeholderName}" class="w-full bg-coffee border border-coffee-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-coffee-gold">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="tel" id="cust-phone" required placeholder="${t.placeholderPhone}" class="bg-coffee border border-coffee-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-coffee-gold">
                            <input type="email" id="cust-email" required placeholder="${t.placeholderEmail}" class="bg-coffee border border-coffee-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-coffee-gold">
                        </div>
                        <div>
                            <input type="text" id="cust-address" required placeholder="${t.placeholderAddress}" class="w-full bg-coffee border border-coffee-lighter rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-coffee-gold">
                        </div>
                        <button type="submit" class="w-full bg-forest hover:bg-forest-hover text-white font-bold py-3 px-4 rounded transition-all duration-300 mt-4 tracking-wider uppercase text-sm">
                            ${t.checkoutBtn}
                        </button>
                    </form>
                </div>
            </div>
        `;
    }
    
    renderCart();
}

// Request dynamic data for specific pages
function requestPageData() {
    const currentPath = window.location.pathname.split("/").pop();
    
    // Always request general settings for layout
    sendHostMessage({ action: 'getSettings' });
    
    if (currentPath === 'shop.html' || currentPath.startsWith('product-detail.html')) {
        sendHostMessage({ action: 'getProducts' });
    } else if (currentPath === 'blog.html' || currentPath.startsWith('blog-detail.html')) {
        sendHostMessage({ action: 'getBlogs' });
    } else if (currentPath === 'admin.html') {
        const currentUser = JSON.parse(localStorage.getItem('pureva_current_user') || 'null');
        if (currentUser && currentUser.isAdmin) {
            const dashboardSec = document.getElementById('admin-dashboard-sec');
            if (dashboardSec) dashboardSec.classList.remove('hidden');
            sendHostMessage({ action: 'getAdminData' });
        } else {
            // Redirect to home and trigger standard login modal
            window.location.href = 'index.html?openAuth=login';
        }
    }
}

// WebView communication
function sendHostMessage(message) {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(message);
    } else {
        handleBrowserFetch(message);
    }
}

// Browser API Fallback Handler (For Vercel/Chrome)
async function handleBrowserFetch(msg) {
    console.log("Browser API Request:", msg);
    try {
        switch (msg.action) {
            case 'getSettings': {
                const res = await fetch(`${API_BASE_URL}/settings`);
                const data = await res.json();
                handleHostMessage({ action: 'getSettingsResponse', settings: data });
                break;
            }
            case 'getProducts': {
                const res = await fetch(`${API_BASE_URL}/products`);
                const data = await res.json();
                products = data;
                if (window.location.pathname.includes('product-detail.html')) {
                    renderProductDetailPage();
                } else {
                    renderShopPage();
                }
                break;
            }
            case 'getBlogs': {
                const res = await fetch(`${API_BASE_URL}/blogs`);
                const data = await res.json();
                blogs = data;
                if (window.location.pathname.includes('blog-detail.html')) {
                    renderBlogDetailPage();
                } else {
                    renderBlogPage();
                }
                break;
            }
            case 'getAdminData': {
                const res = await fetch(`${API_BASE_URL}/admin/data`);
                const data = await res.json();
                products = data.products;
                blogs = data.blogs;
                renderAdminDashboard(data);
                break;
            }
            case 'loginAdmin': {
                const res = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: msg.username || msg.email, password: msg.password })
                });
                const data = await res.json();
                handleHostMessage({ action: 'adminLoginResponse', success: data.success });
                break;
            }
            case 'checkout': {
                const res = await fetch(`${API_BASE_URL}/checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: msg.customerName,
                        customerPhone: msg.customerPhone,
                        customerEmail: msg.customerEmail,
                        shippingAddress: msg.shippingAddress,
                        totalAmount: msg.totalAmount,
                        items: msg.items
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'checkoutResponse', success: data.success, message: data.message });
                break;
            }
            case 'submitDesign': {
                const res = await fetch(`${API_BASE_URL}/designs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: msg.customerName,
                        customerPhone: msg.customerPhone,
                        customerEmail: msg.customerEmail,
                        description: msg.description,
                        designFileUrl: msg.designFileUrl || '',
                        designFileName: msg.designFileName || msg.fileName,
                        designFileBase64: msg.designFileBase64 || msg.fileBase64
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'submitDesignResponse', success: data.success, message: data.message });
                break;
            }
            case 'updateOrderStatus': {
                const res = await fetch(`${API_BASE_URL}/admin/orders/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id, status: msg.status })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteOrder': {
                const res = await fetch(`${API_BASE_URL}/admin/orders/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'updateDesignStatus': {
                const res = await fetch(`${API_BASE_URL}/admin/designs/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id, status: msg.status })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteDesign': {
                const res = await fetch(`${API_BASE_URL}/admin/designs/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveProduct': {
                const res = await fetch(`${API_BASE_URL}/admin/products/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: msg.id,
                        name: msg.name,
                        price: msg.price,
                        unit: msg.unit,
                        description: msg.description,
                        imageUrl: msg.imageUrl,
                        roastOptions: msg.roastOptions,
                        isActive: msg.isActive,
                        imgFileName: msg.imgFileName,
                        imgFileBase64: msg.imgFileBase64
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteProduct': {
                const res = await fetch(`${API_BASE_URL}/admin/products/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveBlog': {
                const res = await fetch(`${API_BASE_URL}/admin/blogs/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: msg.id,
                        title: msg.title,
                        slug: msg.slug,
                        summary: msg.summary,
                        content: msg.content,
                        imageUrl: msg.imageUrl,
                        isVideo: msg.isVideo,
                        videoUrl: msg.videoUrl,
                        isActive: msg.isActive,
                        imgFileName: msg.imgFileName,
                        imgFileBase64: msg.imgFileBase64,
                        vidFileName: msg.vidFileName,
                        vidFileBase64: msg.vidFileBase64
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'deleteBlog': {
                const res = await fetch(`${API_BASE_URL}/admin/blogs/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: msg.id })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
            case 'saveSettings': {
                const res = await fetch(`${API_BASE_URL}/admin/settings/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        settings: {
                            SeoTitle: msg.seoTitle,
                            SeoDescription: msg.seoDescription,
                            ContactPhone: msg.phone,
                            ContactEmail: msg.email,
                            ContactAddress: msg.address
                        }
                    })
                });
                const data = await res.json();
                handleHostMessage({ action: 'crudResponse', success: data.success, message: data.message });
                break;
            }
        }
    } catch (err) {
        console.error("Browser Fetch Error:", err);
        if (typeof showToast === 'function') {
            showToast(currentLang === 'EN' ? "Network/Server connection failed!" : "Không thể kết nối đến máy chủ Backend!", "error");
        }
    }
}

function registerWebViewListeners() {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.addEventListener('message', event => {
            const message = event.data;
            handleHostMessage(message);
        });
    }
}

// Handle messages received from C# backend
function handleHostMessage(msg) {
    console.log("Received from C# backend:", msg);
    
    switch (msg.action) {
        case 'getSettingsResponse':
            applyWebsiteSettings(msg.settings);
            break;
        case 'getProductsResponse':
            products = msg.products;
            if (window.location.pathname.includes('product-detail.html')) {
                renderProductDetailPage();
            } else {
                renderShopPage();
            }
            break;
        case 'getBlogsResponse':
            blogs = msg.blogs;
            if (window.location.pathname.includes('blog-detail.html')) {
                renderBlogDetailPage();
            } else {
                renderBlogPage();
            }
            break;
        case 'getAdminDataResponse':
            products = msg.products;
            blogs = msg.blogs;
            renderAdminDashboard(msg);
            break;
        case 'checkoutResponse':
            if (msg.success) {
                cart = [];
                saveCartToStorage();
                renderCart();
                toggleCartDrawer(false);
                const form = document.getElementById('checkout-form');
                if (form) form.reset();
                window.location.href = 'order-success.html';
            } else {
                sessionStorage.removeItem('lastOrder');
                showToast(currentLang === 'EN' ? ("Checkout failed: " + msg.message) : ("Đặt hàng thất bại: " + msg.message), "error");
            }
            break;
        case 'submitDesignResponse':
            if (msg.success) {
                showToast(currentLang === 'EN' ? "Design request submitted successfully! Pureva will email you the mockup." : "Gửi yêu cầu thiết kế thành công! Pureva sẽ gửi demo bao bì qua email của bạn.", "success");
                const form = document.getElementById('customize-form');
                if (form) form.reset();
                const preview = document.getElementById('file-preview-area');
                if (preview) preview.classList.add('hidden');
            } else {
                showToast(currentLang === 'EN' ? ("Design submission failed: " + msg.message) : ("Gửi thiết kế thất bại: " + msg.message), "error");
            }
            break;
        case 'adminLoginResponse':
            if (msg.success) {
                const adminUser = {
                    name: currentLang === 'EN' ? 'Administrator' : 'Quản trị viên',
                    email: document.getElementById('auth-email')?.value || 'admin@pureva.com',
                    isAdmin: true
                };
                localStorage.setItem('pureva_current_user', JSON.stringify(adminUser));
                showToast(currentLang === 'EN' ? "Logged in as Administrator!" : "Đăng nhập với quyền Quản trị viên!", "success");
                closeAuthModal();
                updateHeaderUserUI();
                window.location.href = 'admin.html';
            } else {
                // Try local user login fallback
                const email = document.getElementById('auth-email')?.value;
                const password = document.getElementById('auth-password')?.value;
                let users = JSON.parse(localStorage.getItem('pureva_users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    localStorage.setItem('pureva_current_user', JSON.stringify(user));
                    showToast(currentLang === 'EN' ? ("Login successful! Welcome " + user.name + ".") : ("Đăng nhập thành công! Chào mừng " + user.name + "."), "success");
                    closeAuthModal();
                    updateHeaderUserUI();
                } else {
                    showToast(currentLang === 'EN' ? "Incorrect email or password!" : "Email hoặc Mật khẩu không chính xác!", "error");
                }
            }
            break;
        case 'crudResponse':
            if (msg.success) {
                showToast(currentLang === 'EN' ? "Action completed successfully!" : "Thực hiện tác vụ thành công!", "success");
                // Refresh Admin dashboard
                sendHostMessage({ action: 'getAdminData' });
            } else {
                showToast(currentLang === 'EN' ? ("An error occurred: " + msg.message) : ("Có lỗi xảy ra: " + msg.message), "error");
            }
            break;
    }
}

// Apply settings dynamically (SEO Title, Footer Contacts, etc)
function applyWebsiteSettings(settings) {
    if (!settings) return;
    websiteSettings = settings;
    
    // Set title and description if elements exist
    const seoTitleVal = settings.find(s => s.SettingKey === 'SeoTitle')?.SettingValue;
    if (seoTitleVal) {
        if (currentLang === 'EN' && seoTitleVal.includes('Cà phê hữu cơ đặc sản')) {
            document.title = "Pureva Coffee - Organic specialty coffee from Lam Dong";
        } else {
            document.title = seoTitleVal;
        }
    }
    
    const phone = settings.find(s => s.SettingKey === 'ContactPhone')?.SettingValue;
    const email = settings.find(s => s.SettingKey === 'ContactEmail')?.SettingValue;
    const address = settings.find(s => s.SettingKey === 'ContactAddress')?.SettingValue;
    
    if (phone) {
        const phEl = document.getElementById('footer-phone');
        if (phEl) phEl.innerText = phone;
        const contPhEl = document.getElementById('contact-phone');
        if (contPhEl) contPhEl.innerText = phone;
    }
    if (email) {
        const emEl = document.getElementById('footer-email');
        if (emEl) emEl.innerText = email;
        const contEmEl = document.getElementById('contact-email');
        if (contEmEl) contEmEl.innerText = email;
    }
    if (address) {
        const adEl = document.getElementById('footer-address');
        const contAdEl = document.getElementById('contact-address');
        
        let displayAddress = address;
        if (currentLang === 'EN') {
            if (address.includes('Dốc Di Linh') || address.includes('Di Linh')) {
                displayAddress = "Di Linh Pass, Di Linh District, Lam Dong Province, Vietnam";
            } else {
                displayAddress = address
                    .replace(/Dốc\s+/g, '')
                    .replace(/Huyện\s+([^,]+)/g, '$1 District')
                    .replace(/Quận\s+([^,]+)/g, '$1 District')
                    .replace(/Thành phố\s+([^,]+)/g, '$1 City')
                    .replace(/Tỉnh\s+([^,]+)/g, '$1 Province')
                    .replace(/Việt Nam/g, 'Vietnam');
            }
        }
        
        if (adEl) adEl.innerText = displayAddress;
        if (contAdEl) contAdEl.innerText = displayAddress;
    }
}

// Open/Close Cart Drawer
function toggleCartDrawer(open) {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
        if (open) {
            drawer.classList.remove('translate-x-full');
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            drawer.classList.add('translate-x-full');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
        }
    }
}

// Cart Business Logic
function loadCartFromStorage() {
    const saved = localStorage.getItem('pureva_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem('pureva_cart', JSON.stringify(cart));
}

function addToCart(id, name, price, roastLevel, imageUrl) {
    // Check if item already in cart with same roast level
    const existingIndex = cart.findIndex(item => item.id === id && item.roastLevel === roastLevel);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            roastLevel: roastLevel,
            imageUrl: imageUrl,
            quantity: 1
        });
    }
    saveCartToStorage();
    renderCart();
    toggleCartDrawer(true);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCartToStorage();
    renderCart();
}

function updateQuantity(index, newQty) {
    if (newQty <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQty;
        saveCartToStorage();
        renderCart();
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function formatMoney(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const badge = document.getElementById('cart-badge');
    const totalEl = document.getElementById('cart-total');
    
    if (!container) return;
    
    // Update badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        if (totalItems > 0) {
            badge.innerText = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    // Update subtotal
    if (totalEl) {
        totalEl.innerText = formatMoney(getCartTotal());
    }
    
    const getTranslatedName = (name) => {
        if (currentLang !== 'EN') return name;
        if (name === 'Arabica Cầu Đất Organic') return 'Arabica Cau Dat Organic';
        if (name === 'Robusta Honey Di Linh') return 'Robusta Honey Di Linh';
        if (name === 'Liberica Bảo Lộc Rare') return 'Liberica Bao Loc Rare';
        if (name === 'Pureva Special Blend') return 'Pureva Special Blend';
        return name;
    };

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="h-64 flex flex-col justify-center items-center text-coffee-accent text-center space-y-3">
                <svg class="h-12 w-12 text-coffee-lighter" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p class="text-sm">${currentLang === 'EN' ? 'Your cart is empty' : 'Giỏ hàng trống'}</p>
                <a href="shop.html" onclick="toggleCartDrawer(false)" class="text-xs text-coffee-gold hover:underline">${currentLang === 'EN' ? 'Continue shopping' : 'Tiếp tục mua hàng'}</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cart.map((item, idx) => {
        const roastDisplay = item.roastLevel === 'Light' ? (currentLang === 'EN' ? 'Light' : 'Nhạt') : (item.roastLevel === 'Medium' ? (currentLang === 'EN' ? 'Medium' : 'Vừa') : (currentLang === 'EN' ? 'Dark' : 'Đậm'));
        return `
            <div class="flex items-center space-x-4 border-b border-coffee-lighter pb-4 last:border-b-0">
                <img src="${item.imageUrl}" alt="${getTranslatedName(item.name)}" class="h-16 w-16 object-cover rounded bg-coffee">
                <div class="flex-grow">
                    <h3 class="text-sm font-semibold text-white">${getTranslatedName(item.name)}</h3>
                    <p class="text-xs text-coffee-gold mb-1">${currentLang === 'EN' ? 'Roast' : 'Rang'}: ${roastDisplay}</p>
                    <div class="flex items-center space-x-2">
                        <button onclick="updateQuantity(${idx}, ${item.quantity - 1})" class="text-coffee-accent hover:text-white px-2 py-0.5 border border-coffee-lighter rounded text-xs">-</button>
                        <span class="text-xs text-white">${item.quantity}</span>
                        <button onclick="updateQuantity(${idx}, ${item.quantity + 1})" class="text-coffee-accent hover:text-white px-2 py-0.5 border border-coffee-lighter rounded text-xs">+</button>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-bold text-coffee-gold">${formatMoney(item.price * item.quantity)}</p>
                    <button onclick="removeFromCart(${idx})" class="text-xs text-red-400 hover:text-red-300 mt-2">${currentLang === 'EN' ? 'Remove' : 'Xoá'}</button>
                </div>
            </div>
        `;
    }).join('');
}

// Handle checkout form submit
function handleCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) return showToast(currentLang === 'EN' ? "Your cart is empty!" : "Giỏ hàng của bạn đang trống!", "warning");
    
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const email = document.getElementById('cust-email').value;
    const address = document.getElementById('cust-address').value;
    
    // Save to sessionStorage before sending so it's ready upon success redirect
    sessionStorage.setItem('lastOrder', JSON.stringify({
        customerName: name,
        phone: phone,
        totalAmount: getCartTotal()
    }));
    
    sendHostMessage({
        action: 'checkout',
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: address,
        totalAmount: getCartTotal(),
        items: cart
    });
}

// Render dynamic Shop Page
const translateProduct = (prod) => {
    if (!prod) return prod;
    if (currentLang !== 'EN') return prod;
    
    const translated = { ...prod };
    if (prod.Name === 'Arabica Cầu Đất Organic') {
        translated.Name = 'Arabica Cau Dat Organic';
        translated.Description = 'Premium Arabica coffee beans harvested from the heights of Cầu Đất (Đà Lạt). Elegant acidity, deep sweetness with natural fruity notes.';
    } else if (prod.Name === 'Robusta Honey Di Linh') {
        translated.Name = 'Robusta Honey Di Linh';
        translated.Description = 'Robusta coffee processed using the Honey method from Di Linh farms. Warm flavor, sweet chocolate aftertaste, mild bitterness.';
    } else if (prod.Name === 'Liberica Bảo Lộc Rare') {
        translated.Name = 'Liberica Bao Loc Rare';
        translated.Description = 'Extremely rare Liberica (jackfruit coffee) beans from Bảo Lộc. Intense tropical ripe fruit aroma with a unique sweet and sour taste.';
    } else if (prod.Name === 'Pureva Special Blend') {
        translated.Name = 'Pureva Special Blend';
        translated.Description = 'Perfect combination of bright acidic Arabica and rich Robusta Honey. Provides a beautifully balanced cup, ideal to start your day.';
    }
    translated.Unit = prod.Unit ? prod.Unit.replace('Gói', 'Bag').replace('g', 'g') : '';
    return translated;
};

const translateBlog = (b) => {
    if (!b) return b;
    if (currentLang !== 'EN') return b;
    
    const translated = { ...b };
    if (b.Title && b.Title.includes('Hành trình từ nông trại')) {
        translated.Title = 'The Journey From Organic Farm to Specialty Coffee Cup';
        translated.Summary = "Discover Pureva's closed-loop chemical-free cultivation process in the highlands of Lam Dong, bringing you the purest coffee beans.";
        translated.Content = `At Pureva Coffee farm in Lam Dong, we start by selecting the finest seeds, nurturing the soil with bio-organic fertilizer, and watering with natural mountain spring water. Each red ripe coffee cherry is 100% hand-harvested to ensure high uniformity. Next, drying beds in the greenhouse help develop the flavor notes fully without mold. Every cup of coffee you enjoy carries the dedication of Vietnamese farmers.`;
    } else if (b.Title && b.Title.includes('Cách phân biệt Arabica')) {
        translated.Title = 'How to Distinguish Arabica and Robusta Most Accurately';
        translated.Summary = 'Do you prefer bright acidity or strong bitterness? Let\'s explore the fundamental differences between the two most popular coffee beans.';
        translated.Content = `Arabica and Robusta are the two most popular coffees in the world, but they carry completely different characteristics. Arabica prefers altitudes above 1500m, oval-shaped beans, low caffeine (about 1.5%) but rich in organic acids, yielding bright acidity and floral aromas. Conversely, Robusta lives below 800m, rounder beans, double the caffeine (about 2.7%), presenting a strong bitter taste and creamy notes. Depending on your taste, you can select the most suitable blend.`;
    } else if (b.Title && b.Title.includes('Nghệ thuật rang cà phê')) {
        translated.Title = 'The Art of Handcrafted Roasting: Awakening Hidden Flavors';
        translated.Summary = 'Coffee roasting is a combination of temperature science and sensory art to release the essence of flavors.';
        translated.Content = `A green coffee bean has almost no special flavor. Only through roasting, under correct temperature, chemical reactions (like Maillard and Caramelization) happen to create hundreds of aromatic compounds. Pureva roasters closely monitor each crack, smell the smoke, and observe the color changes to decide the perfect discharge moment for Light, Medium, or Dark roast profiles.`;
    }
    return translated;
};

function renderShopPage() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-coffee-accent">${currentLang === 'EN' ? 'No products found.' : 'Không tìm thấy sản phẩm nào.'}</p>`;
        return;
    }
    
    grid.innerHTML = products.map(p => {
        const prod = translateProduct(p);
        // Roast dropdown options
        const roastOpts = prod.RoastOptions ? prod.RoastOptions.split(',') : ['Medium'];
        const optionsHtml = roastOpts.map(opt => `<option value="${opt.trim()}">${currentLang === 'EN' ? 'Roast: ' : 'Rang '}${opt.trim() === 'Light' ? (currentLang === 'EN' ? 'Light' : 'Nhạt (Light)') : (opt.trim() === 'Medium' ? (currentLang === 'EN' ? 'Medium' : 'Vừa (Medium)') : (currentLang === 'EN' ? 'Dark' : 'Đậm (Dark)'))}</option>`).join('');
        
        return `
            <div class="bg-coffee-light border border-coffee-lighter rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between hover:border-coffee-gold transition-all duration-300">
                <div class="relative overflow-hidden aspect-square bg-coffee cursor-pointer" onclick="window.location.href='product-detail.html?id=${prod.Id}'">
                    <img src="${prod.ImageUrl || 'images/blend.jpg'}" alt="${prod.Name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-2 right-2 bg-coffee-dark text-coffee-gold text-xs px-2.5 py-1 rounded-full border border-coffee-lighter font-sans">
                        ${prod.Unit}
                    </span>
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div>
                        <h3 class="font-serif text-lg font-bold text-white group-hover:text-coffee-gold transition-colors cursor-pointer" onclick="window.location.href='product-detail.html?id=${prod.Id}'">${prod.Name}</h3>
                    </div>
                    
                    <div class="space-y-4 pt-2">
                        <div class="flex justify-between items-center border-b border-coffee-lighter pb-2">
                            <span class="text-xl font-bold text-coffee-gold">${formatMoney(prod.Price)}</span>
                            <span class="text-xs text-coffee-accent font-semibold">${prod.Unit}</span>
                        </div>
                        
                        <div class="space-y-1">
                            <label class="text-[10px] uppercase tracking-wider text-coffee-accent/60 block font-sans">${currentLang === 'EN' ? 'Roast level' : 'Mức độ rang'}</label>
                            <select id="roast-${prod.Id}" class="w-full bg-coffee border border-coffee-lighter text-sm text-white rounded px-3 py-2 focus:outline-none focus:border-coffee-gold cursor-pointer transition-colors duration-200">
                                ${optionsHtml}
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <button onclick="quickAddToCart(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="border border-coffee-gold text-coffee-gold hover:bg-coffee-gold hover:text-coffee-dark text-xs font-bold py-2.5 rounded transition-all duration-300">
                                ${currentLang === 'EN' ? 'ADD TO CART' : 'THÊM GIỎ HÀNG'}
                            </button>
                            <button onclick="quickBuyNow(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="bg-forest hover:bg-forest-hover text-white text-xs font-bold py-2.5 rounded transition-all duration-300">
                                ${currentLang === 'EN' ? 'BUY NOW' : 'MUA NGAY'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    setTimeout(initScrollReveal, 100);
}

function quickAddToCart(id, name, price, imageUrl) {
    const select = document.getElementById(`roast-${id}`);
    const roastLevel = select ? select.value : 'Medium';
    addToCart(id, name, price, roastLevel, imageUrl);
}

function quickBuyNow(id, name, price, imageUrl) {
    quickAddToCart(id, name, price, imageUrl);
    toggleCartDrawer(true);
}

// Render dynamic Blog Page
function renderBlogPage() {
    const container = document.getElementById('blogs-grid');
    if (!container) return;
    
    if (blogs.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-coffee-accent">${currentLang === 'EN' ? 'No articles found.' : 'Không tìm thấy bài viết nào.'}</p>`;
        return;
    }
    
    container.innerHTML = blogs.map(bg => {
        const b = translateBlog(bg);
        const pubDate = new Date(b.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
        const videoTagHtml = b.IsVideo ? `
            <span class="absolute top-3 left-3 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase font-sans shadow-md">
                VIDEO
            </span>
        ` : '';

        return `
            <div class="bg-coffee-light border border-coffee-lighter/25 rounded-lg overflow-hidden group shadow-lg flex flex-col hover:border-coffee-gold/60 transition-all duration-300 cursor-pointer" onclick="window.location.href='blog-detail.html?id=${b.Id}'">
                <div class="relative overflow-hidden aspect-video bg-coffee">
                    <img src="${b.ImageUrl || 'images/blog1.jpg'}" alt="${b.Title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    ${videoTagHtml}
                </div>
                <div class="p-6 space-y-3 text-left">
                    <div class="text-xs text-coffee-accent/65 font-sans tracking-wide">
                        ${pubDate}
                    </div>
                    <h3 class="font-serif text-lg font-bold text-coffee-gold group-hover:text-white transition-colors duration-300 line-clamp-2 leading-snug">${b.Title}</h3>
                    <p class="text-sm text-coffee-accent/80 leading-relaxed line-clamp-2 font-sans">${b.Summary || ''}</p>
                </div>
            </div>
        `;
    }).join('');
    
    setTimeout(initScrollReveal, 100);
}

// Customize Page packaging request submit
function handleCustomizeSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value;
    const desc = document.getElementById('cust-description').value;
    const fileInput = document.getElementById('cust-file');
    
    let fileName = "";
    let fileBase64 = "";
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileName = file.name;
        
        const reader = new FileReader();
        reader.onloadend = function() {
            fileBase64 = reader.result.split(',')[1]; // get pure base64
            
            sendHostMessage({
                action: 'submitDesign',
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                description: desc,
                fileName: fileName,
                fileBase64: fileBase64
            });
        };
        reader.readAsDataURL(file);
    } else {
        sendHostMessage({
            action: 'submitDesign',
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            description: desc,
            fileName: "",
            fileBase64: ""
        });
    }
}

// Admin Panel functions
function handleAdminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    
    sendHostMessage({
        action: 'loginAdmin',
        username: user,
        password: pass
    });
}

function renderAdminDashboard(data) {
    // Stat summary
    document.getElementById('stat-orders').innerText = data.orders.length;
    document.getElementById('stat-designs').innerText = data.designs.length;
    document.getElementById('stat-products').innerText = data.products.length;
    
    // Render orders
    const ordersTbl = document.getElementById('admin-orders-table');
    if (ordersTbl) {
        if (data.orders.length === 0) {
            ordersTbl.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-coffee-accent">${currentLang === 'EN' ? 'No orders found' : 'Chưa có đơn hàng nào'}</td></tr>`;
        } else {
            ordersTbl.innerHTML = data.orders.map(o => {
                const date = new Date(o.CreatedAt).toLocaleString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
                return `
                    <tr class="border-b border-coffee-lighter/40 hover:bg-coffee/40">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#${o.Id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-coffee-accent">
                            <div class="font-bold text-white">${o.CustomerName}</div>
                            <div class="text-xs">${o.CustomerPhone} | ${o.CustomerEmail}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-coffee-accent max-w-xs truncate" title="${o.ShippingAddress}">${o.ShippingAddress}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-coffee-gold font-bold">${formatMoney(o.TotalAmount)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-coffee-accent">${date}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <select onchange="updateOrderStatus(${o.Id}, this.value)" class="bg-coffee border border-coffee-lighter text-xs text-white rounded p-1">
                                <option value="Pending" ${o.Status === 'Pending' ? 'selected' : ''}>${currentLang === 'EN' ? 'Pending' : 'Chờ duyệt'}</option>
                                <option value="Shipping" ${o.Status === 'Shipping' ? 'selected' : ''}>${currentLang === 'EN' ? 'Shipping' : 'Đang giao'}</option>
                                <option value="Delivered" ${o.Status === 'Delivered' ? 'selected' : ''}>${currentLang === 'EN' ? 'Delivered' : 'Đã giao'}</option>
                                <option value="Cancelled" ${o.Status === 'Cancelled' ? 'selected' : ''}>${currentLang === 'EN' ? 'Cancelled' : 'Đã hủy'}</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button onclick="deleteOrder(${o.Id})" class="text-red-400 hover:text-red-300 font-medium">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
    
    // Render designs
    const designsTbl = document.getElementById('admin-designs-table');
    if (designsTbl) {
        if (data.designs.length === 0) {
            designsTbl.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-coffee-accent">${currentLang === 'EN' ? 'No requests found' : 'Chưa có yêu cầu nào'}</td></tr>`;
        } else {
            designsTbl.innerHTML = data.designs.map(d => {
                const date = new Date(d.CreatedAt).toLocaleString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
                const fileLink = d.DesignFileUrl ? `
                    <div class="flex items-center space-x-3">
                        <button onclick="openImagePreviewModal('${d.DesignFileUrl}')" class="text-coffee-gold hover:underline font-medium flex items-center">
                            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> ${currentLang === 'EN' ? 'View' : 'Xem'}
                        </button>
                        <button onclick="downloadDesignFile('${d.DesignFileUrl}', '${d.DesignFileUrl.split('/').pop()}')" class="text-coffee-gold hover:underline font-medium flex items-center">
                            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> ${currentLang === 'EN' ? 'Download' : 'Tải ảnh'}
                        </button>
                    </div>
                ` : `<span class="text-gray-500">${currentLang === 'EN' ? 'None' : 'Không có'}</span>`;
                
                return `
                    <tr class="border-b border-coffee-lighter/40 hover:bg-coffee/40">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#${d.Id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-coffee-accent">
                            <div class="font-bold text-white">${d.CustomerName}</div>
                            <div class="text-xs">${d.CustomerPhone} | ${d.CustomerEmail}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-coffee-accent max-w-xs whitespace-normal">${d.Description || ''}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-coffee-accent">${fileLink}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-coffee-accent">${date}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <select onchange="updateDesignStatus(${d.Id}, this.value)" class="bg-coffee border border-coffee-lighter text-xs text-white rounded p-1">
                                <option value="Pending" ${d.Status === 'Pending' ? 'selected' : ''}>${currentLang === 'EN' ? 'Pending' : 'Chờ duyệt'}</option>
                                <option value="Designing" ${d.Status === 'Designing' ? 'selected' : ''}>${currentLang === 'EN' ? 'Designing' : 'Đang thiết kế'}</option>
                                <option value="Finished" ${d.Status === 'Finished' ? 'selected' : ''}>${currentLang === 'EN' ? 'Finished' : 'Hoàn thành'}</option>
                                <option value="Rejected" ${d.Status === 'Rejected' ? 'selected' : ''}>${currentLang === 'EN' ? 'Rejected' : 'Từ chối'}</option>
                            </select>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <button onclick="deleteDesign(${d.Id})" class="text-red-400 hover:text-red-300 font-medium">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
    
    // Render settings
    const settingsList = data.settings || [];
    const seoTitle = settingsList.find(s => s.SettingKey === 'SeoTitle')?.SettingValue || '';
    const seoDesc = settingsList.find(s => s.SettingKey === 'SeoDescription')?.SettingValue || '';
    const phone = settingsList.find(s => s.SettingKey === 'ContactPhone')?.SettingValue || '';
    const email = settingsList.find(s => s.SettingKey === 'ContactEmail')?.SettingValue || '';
    const address = settingsList.find(s => s.SettingKey === 'ContactAddress')?.SettingValue || '';
    
    const titleIn = document.getElementById('set-seo-title');
    if (titleIn) titleIn.value = seoTitle;
    
    const descIn = document.getElementById('set-seo-desc');
    if (descIn) descIn.value = seoDesc;
    
    const phoneIn = document.getElementById('set-phone');
    if (phoneIn) phoneIn.value = phone;
    
    const emailIn = document.getElementById('set-email');
    if (emailIn) emailIn.value = email;
    
    const addressIn = document.getElementById('set-address');
    if (addressIn) addressIn.value = address;
    
    // Render Products list for CRUD
    const prodsList = document.getElementById('admin-products-list');
    if (prodsList) {
        prodsList.innerHTML = data.products.map(p => `
            <div class="flex items-center justify-between p-4 bg-coffee rounded border border-coffee-lighter/40">
                <div class="flex items-center space-x-3">
                    <img src="${p.ImageUrl}" class="h-12 w-12 object-cover rounded bg-coffee-dark">
                    <div>
                        <h4 class="text-sm font-bold text-white">${p.Name} (${p.Unit})</h4>
                        <p class="text-xs text-coffee-gold">${formatMoney(p.Price)} | ${currentLang === 'EN' ? 'Roast' : 'Rang'}: ${p.RoastOptions}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editProduct(${p.Id})" class="text-xs border border-coffee-gold text-coffee-gold px-2.5 py-1 rounded hover:bg-coffee-gold hover:text-coffee-dark">${currentLang === 'EN' ? 'Edit' : 'Sửa'}</button>
                    <button onclick="deleteProduct(${p.Id})" class="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                </div>
            </div>
        `).join('');
    }

    // Render Blogs list for CRUD
    const blogsList = document.getElementById('admin-blogs-list');
    if (blogsList) {
        blogsList.innerHTML = data.blogs.map(b => `
            <div class="flex items-center justify-between p-4 bg-coffee rounded border border-coffee-lighter/40">
                <div>
                    <h4 class="text-sm font-bold text-white line-clamp-1">${b.Title}</h4>
                    <p class="text-xs text-coffee-accent">${b.IsVideo ? (currentLang === 'EN' ? 'Has Video' : 'Có Video') : (currentLang === 'EN' ? 'Text Only' : 'Chỉ văn bản')} | ${currentLang === 'EN' ? 'Published' : 'Ngày đăng'}: ${new Date(b.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN')}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editBlog(${b.Id})" class="text-xs border border-coffee-gold text-coffee-gold px-2.5 py-1 rounded hover:bg-coffee-gold hover:text-coffee-dark">${currentLang === 'EN' ? 'Edit' : 'Sửa'}</button>
                    <button onclick="deleteBlog(${b.Id})" class="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded">${currentLang === 'EN' ? 'Delete' : 'Xoá'}</button>
                </div>
            </div>
        `).join('');
    }
}

// Order & Custom Design actions
function updateOrderStatus(id, status) {
    sendHostMessage({ action: 'updateOrderStatus', id: id, status: status });
}

function deleteOrder(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this order?" : "Bạn chắc chắn muốn xoá đơn hàng này chứ?")) {
        sendHostMessage({ action: 'deleteOrder', id: id });
    }
}

function updateDesignStatus(id, status) {
    sendHostMessage({ action: 'updateDesignStatus', id: id, status: status });
}

function deleteDesign(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this design request?" : "Bạn chắc chắn muốn xoá yêu cầu này chứ?")) {
        sendHostMessage({ action: 'deleteDesign', id: id });
    }
}

// Save Settings Form
function handleSaveSettings(event) {
    event.preventDefault();
    
    const title = document.getElementById('set-seo-title').value;
    const desc = document.getElementById('set-seo-desc').value;
    const phone = document.getElementById('set-phone').value;
    const email = document.getElementById('set-email').value;
    const address = document.getElementById('set-address').value;
    
    sendHostMessage({
        action: 'saveSettings',
        seoTitle: title,
        seoDescription: desc,
        phone: phone,
        email: email,
        address: address
    });
}

// Product CRUD Forms
let editingProductId = null;

function showAddProductModal() {
    editingProductId = null;
    document.getElementById('prod-form').reset();
    document.getElementById('prod-modal-title').innerText = currentLang === 'EN' ? "Add New Product" : "Thêm Sản Phẩm Mới";
    document.getElementById('prod-modal').classList.remove('hidden');
}

function hideProductModal() {
    document.getElementById('prod-modal').classList.add('hidden');
}

function editProduct(id) {
    const prod = products.find(p => p.Id === id);
    if (!prod) return;
    
    editingProductId = id;
    document.getElementById('prod-name').value = prod.Name;
    document.getElementById('prod-price').value = prod.Price;
    document.getElementById('prod-unit').value = prod.Unit;
    document.getElementById('prod-desc').value = prod.Description || '';
    document.getElementById('prod-img').value = prod.ImageUrl || '';
    document.getElementById('prod-roast').value = prod.RoastOptions || 'Medium';
    
    document.getElementById('prod-modal-title').innerText = currentLang === 'EN' ? "Edit Product" : "Chỉnh Sửa Sản Phẩm";
    document.getElementById('prod-modal').classList.remove('hidden');
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function handleSaveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const unit = document.getElementById('prod-unit').value;
    const desc = document.getElementById('prod-desc').value;
    const img = document.getElementById('prod-img').value;
    const roast = document.getElementById('prod-roast').value;
    
    let imgFileName = '';
    let imgFileBase64 = '';
    
    const fileInput = document.getElementById('prod-img-file');
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        imgFileName = file.name;
        try {
            imgFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading product image file: ", e);
        }
    }
    
    sendHostMessage({
        action: 'saveProduct',
        id: editingProductId,
        name: name,
        price: price,
        unit: unit,
        description: desc,
        imageUrl: img,
        roastOptions: roast,
        imgFileName: imgFileName,
        imgFileBase64: imgFileBase64
    });
    
    hideProductModal();
}

function deleteProduct(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this product?" : "Bạn có chắc muốn xoá sản phẩm này?")) {
        sendHostMessage({ action: 'deleteProduct', id: id });
    }
}

// Blog CRUD Forms
let editingBlogId = null;

function showAddBlogModal() {
    editingBlogId = null;
    document.getElementById('blog-form').reset();
    document.getElementById('blog-modal-title').innerText = currentLang === 'EN' ? "Write New Blog" : "Viết Bài Mới";
    document.getElementById('blog-modal').classList.remove('hidden');
    toggleVideoUrlField();
}

function hideBlogModal() {
    document.getElementById('blog-modal').classList.add('hidden');
}

function toggleVideoUrlField() {
    const isVideo = document.getElementById('blog-is-video').checked;
    const vidSec = document.getElementById('blog-video-url-sec');
    if (isVideo) {
        vidSec.classList.remove('hidden');
    } else {
        vidSec.classList.add('hidden');
    }
}

function editBlog(id) {
    const b = blogs.find(item => item.Id === id);
    if (!b) return;
    
    editingBlogId = id;
    document.getElementById('blog-title').value = b.Title;
    document.getElementById('blog-summary').value = b.Summary || '';
    document.getElementById('blog-content').value = b.Content || '';
    document.getElementById('blog-img').value = b.ImageUrl || '';
    document.getElementById('blog-is-video').checked = b.IsVideo;
    document.getElementById('blog-video-url').value = b.VideoUrl || '';
    
    document.getElementById('blog-modal-title').innerText = currentLang === 'EN' ? "Edit Blog Post" : "Chỉnh Sửa Bài Viết";
    document.getElementById('blog-modal').classList.remove('hidden');
    toggleVideoUrlField();
}

async function handleSaveBlog(event) {
    event.preventDefault();
    
    const title = document.getElementById('blog-title').value;
    const summary = document.getElementById('blog-summary').value;
    const content = document.getElementById('blog-content').value;
    const img = document.getElementById('blog-img').value;
    const isVideo = document.getElementById('blog-is-video').checked;
    const videoUrl = document.getElementById('blog-video-url').value;
    
    // Auto-generate slug
    const slug = title.toLowerCase()
        .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
        .replace(/í|ì|ỉ|ĩ|ị/g, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
        
    let imgFileName = '';
    let imgFileBase64 = '';
    let vidFileName = '';
    let vidFileBase64 = '';
    
    const imgFileInput = document.getElementById('blog-img-file');
    if (imgFileInput && imgFileInput.files.length > 0) {
        const file = imgFileInput.files[0];
        imgFileName = file.name;
        try {
            imgFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading blog image file: ", e);
        }
    }
    
    const vidFileInput = document.getElementById('blog-video-file');
    if (isVideo && vidFileInput && vidFileInput.files.length > 0) {
        const file = vidFileInput.files[0];
        vidFileName = file.name;
        try {
            vidFileBase64 = await readFileAsBase64(file);
        } catch (e) {
            console.error("Error reading blog video file: ", e);
        }
    }
        
    sendHostMessage({
        action: 'saveBlog',
        id: editingBlogId,
        title: title,
        slug: slug,
        summary: summary,
        content: content,
        imageUrl: img,
        isVideo: isVideo,
        videoUrl: videoUrl,
        imgFileName: imgFileName,
        imgFileBase64: imgFileBase64,
        vidFileName: vidFileName,
        vidFileBase64: vidFileBase64
    });
    
    hideBlogModal();
}

function deleteBlog(id) {
    if (confirm(currentLang === 'EN' ? "Are you sure you want to delete this blog post?" : "Bạn có chắc muốn xoá bài viết này?")) {
        sendHostMessage({ action: 'deleteBlog', id: id });
    }
}

// ==========================================
// DEDICATED PRODUCT DETAIL PAGE CONTROLLER
// ==========================================
let currentDetailQty = 1;

function renderProductDetailPage() {
    const content = document.getElementById('product-detail-content');
    if (!content) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    if (!productId || products.length === 0) {
        content.innerHTML = `<p class="text-center text-coffee-accent py-16">${currentLang === 'EN' ? 'Product does not exist or has been removed.' : 'Sản phẩm không tồn tại hoặc đã bị gỡ bỏ.'}</p>`;
        return;
    }
    
    const p = products.find(p => p.Id === productId);
    if (!p) {
        content.innerHTML = `<p class="text-center text-coffee-accent py-16">${currentLang === 'EN' ? 'Requested product not found.' : 'Không tìm thấy sản phẩm yêu cầu.'}</p>`;
        return;
    }
    const prod = translateProduct(p);
    
    // Set document title
    document.title = `${prod.Name} – Pureva Craft`;
    
    // Update breadcrumb
    const breadcrumbName = document.getElementById('breadcrumb-name');
    if (breadcrumbName) breadcrumbName.innerText = prod.Name;
    
    // Roast dropdown options
    const roastOpts = prod.RoastOptions ? prod.RoastOptions.split(',') : ['Medium'];
    const optionsHtml = roastOpts.map(opt => `<option value="${opt.trim()}">${currentLang === 'EN' ? 'Roast: ' : 'Rang '}${opt.trim() === 'Light' ? (currentLang === 'EN' ? 'Light' : 'Nhạt (Light)') : (opt.trim() === 'Medium' ? (currentLang === 'EN' ? 'Medium' : 'Vừa (Medium)') : (currentLang === 'EN' ? 'Dark' : 'Đậm (Dark)'))}</option>`).join('');
    
    // Determine dynamic mock specs based on coffee type
    let origin = currentLang === 'EN' ? "Lam Dong, Vietnam" : "Lâm Đồng, Việt Nam";
    let altitude = "1.200m";
    let process = currentLang === 'EN' ? "Honey Process" : "Chế biến Honey";
    let moisture = "12.2%";
    let tastingNotes = currentLang === 'EN'
        ? "Sweet authentic aroma, clean and pleasant acidity, smooth lingering aftertaste."
        : "Hương thơm ngọt ngào nguyên bản, vị chua nhẹ nhàng thanh khiết, hậu vị êm mượt kéo dài.";
    let brewingMethods = [];
    
    const nameLower = prod.Name.toLowerCase();
    if (nameLower.includes("arabica")) {
        origin = currentLang === 'EN' ? "Cau Dat, Da Lat" : "Cầu Đất, Đà Lạt";
        altitude = "1.600m";
        process = currentLang === 'EN' ? "Washed Process" : "Chế biến Ướt (Washed)";
        moisture = "12.0%";
        tastingNotes = currentLang === 'EN'
            ? "Elegant jasmine aroma, mild acidity of ripe berries, long sweet aftertaste with warm chocolate notes."
            : "Hương thơm hoa nhài thanh lịch, vị chua nhẹ quả mọng chín, hậu vị ngọt kéo dài với hương sô-cô-la ấm áp.";
        brewingMethods = [
            { 
                name: currentLang === 'EN' ? "Pour Over Brewing (V60)" : "Pha Pour Over (V60)", 
                ratio: "1:15", 
                temp: "90-92°C", 
                grind: currentLang === 'EN' ? "Medium" : "Vừa (Medium)", 
                steps: currentLang === 'EN' ? "Bloom 30s with 50ml, then pour slowly in 3 stages up to 225ml." : "Ủ 30s với 50ml nước, rót từ từ 3 đợt đến 225ml nước." 
            },
            { 
                name: "Espresso", 
                ratio: "1:2 (18g in - 36g out)", 
                temp: "93°C", 
                grind: currentLang === 'EN' ? "Fine" : "Mịn (Fine)", 
                steps: currentLang === 'EN' ? "Extraction time around 25-30 seconds to achieve optimal flavor." : "Thời gian chiết xuất khoảng 25-30 giây để đạt hương vị tối ưu." 
            }
        ];
    } else if (nameLower.includes("robusta")) {
        origin = currentLang === 'EN' ? "Di Linh, Lam Dong" : "Di Linh, Lâm Đồng";
        altitude = "1.000m";
        process = currentLang === 'EN' ? "Honey Process" : "Chế biến Honey (Mật ong)";
        moisture = "12.1%";
        tastingNotes = currentLang === 'EN'
            ? "Mild herbal aroma, characteristic warm and rich taste, sweet deep aftertaste, low bitterness."
            : "Hương thơm thảo mộc dịu nhẹ, vị đầm ấm đậm đà đặc trưng, hậu vị ngọt đậm, ít đắng gắt.";
        brewingMethods = [
            { 
                name: currentLang === 'EN' ? "Traditional Filter (Phin)" : "Pha Phin Truyền Thống", 
                ratio: "1:4 (20g powder - 80ml water)", 
                temp: "95°C", 
                grind: currentLang === 'EN' ? "Medium-Coarse" : "Vừa thô (Medium-Coarse)", 
                steps: currentLang === 'EN' ? "Bloom 1 min with 20ml, then pour the remaining 60ml and cover." : "Ủ 1 phút với 20ml nước nóng, sau đó rót tiếp 60ml nước còn lại và đậy nắp gài." 
            },
            { 
                name: "Cold Brew", 
                ratio: "1:10", 
                temp: currentLang === 'EN' ? "Cold water" : "Nước lạnh", 
                grind: currentLang === 'EN' ? "Coarse" : "Thô (Coarse)", 
                steps: currentLang === 'EN' ? "Steep in fridge for 16-24 hours, filter out grounds and serve with orange/lemongrass." : "Ủ trong tủ mát từ 16-24 tiếng, lọc bã lấy nước cốt thưởng thức cùng cam sả." 
            }
        ];
    } else if (nameLower.includes("liberica")) {
        origin = currentLang === 'EN' ? "Bao Loc, Lam Dong" : "Bảo Lộc, Lâm Đồng";
        altitude = "900m";
        process = currentLang === 'EN' ? "Natural Process" : "Chế biến Khô (Natural)";
        moisture = "12.5%";
        tastingNotes = currentLang === 'EN'
            ? "Intense tropical ripe fruit aroma, unique delicate mild acidity, warm pine wood aftertaste."
            : "Hương thơm nồng nàn của quả chín nhiệt đới, vị chua dịu tinh tế độc đáo, hậu vị gỗ thông ấm áp.";
        brewingMethods = [
            { 
                name: "French Press", 
                ratio: "1:15", 
                temp: "92-94°C", 
                grind: currentLang === 'EN' ? "Coarse" : "Thô (Coarse)", 
                steps: currentLang === 'EN' ? "Pour hot water, steep for 4 minutes, then slowly press down the plunger." : "Đổ nước nóng vào ngâm 4 phút, sau đó nén từ từ piston xuống lọc bã." 
            }
        ];
    } else {
        origin = currentLang === 'EN' ? "Di Linh & Cau Dat" : "Di Linh & Cầu Đất";
        altitude = "1.400m";
        process = currentLang === 'EN' ? "Combined Process" : "Chế biến Phối hợp";
        moisture = "12.1%";
        tastingNotes = currentLang === 'EN'
            ? "Rich multi-layered aroma, perfect combination of bright acidity and warm, sweet aftertaste."
            : "Hương thơm phong phú đa tầng, sự kết hợp hoàn hảo giữa vị chua thanh nhẹ và hậu vị đầm ấm, ngọt ngào.";
        brewingMethods = [
            { 
                name: currentLang === 'EN' ? "Premium Filter (Phin)" : "Pha Phin Cao Cấp", 
                ratio: "1:4 (25g powder - 100ml water)", 
                temp: "93-95°C", 
                grind: currentLang === 'EN' ? "Medium-Coarse" : "Vừa thô (Medium-Coarse)", 
                steps: currentLang === 'EN' ? "Bloom 40s before pouring the rest of the water to blend flavors." : "Ủ 40 giây trước khi rót nốt lượng nước chính để hương vị quyện đều." 
            }
        ];
    }

    // Initialize Quantity State
    currentDetailQty = 1;

    // 1. Render Main Layout
    content.innerHTML = `
        <div class="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            <!-- Left Side: Product Image -->
            <div class="w-full lg:w-1/2 bg-coffee-light border border-coffee-lighter rounded-xl overflow-hidden shadow-2xl relative group">
                <img src="${prod.ImageUrl || 'images/blend.jpg'}" alt="${prod.Name}" class="w-full h-[350px] md:h-[480px] object-cover transition-transform duration-700 group-hover:scale-102">
                <div class="absolute inset-0 bg-gradient-to-t from-coffee-dark/40 to-transparent pointer-events-none"></div>
            </div>
            
            <!-- Right Side: Commercial Details -->
            <div class="w-full lg:w-1/2 space-y-6 text-left">
                <div class="space-y-3">
                    <span class="text-coffee-gold text-xs font-bold tracking-widest uppercase block font-sans">${currentLang === 'EN' ? 'ORGANIC SPECIALTY COFFEE' : 'CÀ PHÊ HỮU CƠ ĐẶC SẢN'}</span>
                    <h1 class="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">${prod.Name}</h1>
                    <div class="flex items-baseline space-x-3 pt-1">
                        <span class="text-3xl font-extrabold text-coffee-gold">${formatMoney(prod.Price)}</span>
                        <span class="text-sm text-coffee-accent/80 font-medium font-sans">/ ${currentLang === 'EN' ? 'bag' : 'gói'} ${prod.Unit}</span>
                    </div>
                </div>
                
                <hr class="border-coffee-lighter/40">
                
                <!-- Tasting Notes -->
                <div class="space-y-2">
                    <h4 class="text-[10px] font-bold text-coffee-accent/60 uppercase tracking-widest font-sans">${currentLang === 'EN' ? 'Tasting Notes' : 'Hương Vị (Tasting Notes)'}</h4>
                    <p class="text-base text-white italic leading-relaxed text-justify">"${tastingNotes}"</p>
                </div>
                
                <!-- Specifications Table -->
                <div class="grid grid-cols-2 gap-4 bg-coffee-light border border-coffee-lighter rounded-lg p-5 text-sm">
                    <div>
                        <span class="text-coffee-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Origin' : 'Vùng trồng'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${origin}</span>
                    </div>
                    <div>
                        <span class="text-coffee-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Altitude' : 'Độ cao'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${altitude}</span>
                    </div>
                    <div>
                        <span class="text-coffee-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Process' : 'Sơ chế'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${process}</span>
                    </div>
                    <div>
                        <span class="text-coffee-accent/60 block font-sans text-xs">${currentLang === 'EN' ? 'Moisture' : 'Độ ẩm'}</span>
                        <span class="text-white font-semibold font-sans mt-1 block">${moisture}</span>
                    </div>
                </div>
                
                <!-- Roast Options & Quantity -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-coffee-accent/60 uppercase tracking-widest block font-sans">${currentLang === 'EN' ? 'Desired roast level' : 'Mức độ rang mong muốn'}</label>
                        <select id="detail-roast-${prod.Id}" class="w-full bg-coffee border border-coffee-lighter text-sm text-white rounded-md px-3 py-2.5 focus:outline-none focus:border-coffee-gold cursor-pointer transition-colors duration-200">
                            ${optionsHtml}
                        </select>
                    </div>
                    
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-coffee-accent/60 uppercase tracking-widest block font-sans">${currentLang === 'EN' ? 'Quantity' : 'Số lượng mua'}</label>
                        <div class="flex items-center justify-between bg-coffee border border-coffee-lighter rounded-md h-[42px] px-3">
                            <button onclick="changeDetailQty(-1)" class="w-8 h-8 flex items-center justify-center text-coffee-accent hover:text-white font-bold text-lg cursor-pointer focus:outline-none select-none">-</button>
                            <span id="detail-qty-val" class="text-white text-sm font-semibold select-none">1</span>
                            <button onclick="changeDetailQty(1)" class="w-8 h-8 flex items-center justify-center text-coffee-accent hover:text-white font-bold text-lg cursor-pointer focus:outline-none select-none">+</button>
                        </div>
                    </div>
                </div>
                
                <!-- Purchase Actions -->
                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onclick="addDetailProductToCart(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="flex-grow border border-coffee-gold text-coffee-gold hover:bg-coffee-gold hover:text-coffee-dark text-xs font-bold py-4 rounded transition-all duration-300 tracking-widest uppercase">
                        ${currentLang === 'EN' ? 'ADD TO CART' : 'THÊM VÀO GIỎ HÀNG'}
                    </button>
                    <button onclick="buyDetailProductNow(${prod.Id}, '${prod.Name}', ${prod.Price}, '${prod.ImageUrl}')" class="flex-grow bg-forest hover:bg-forest-hover text-white text-xs font-bold py-4 rounded transition-all duration-300 tracking-widest uppercase">
                        ${currentLang === 'EN' ? 'BUY NOW' : 'MUA NGAY'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 2. Render Brewing Guide
    const brewingSec = document.getElementById('brewing-guide-section');
    if (brewingSec && brewingMethods.length > 0) {
        const methodsHtml = brewingMethods.map(m => `
            <div class="bg-coffee-light border border-coffee-lighter p-6 rounded-lg space-y-3">
                <h4 class="font-serif text-lg font-bold text-coffee-gold">${m.name}</h4>
                <div class="grid grid-cols-3 gap-2 text-xs text-coffee-accent/80 border-b border-coffee-lighter/30 pb-2 font-sans">
                    <div>${currentLang === 'EN' ? 'Ratio: ' : 'Tỉ lệ: '}<span class="text-white font-medium">${m.ratio}</span></div>
                    <div>${currentLang === 'EN' ? 'Temp: ' : 'Nhiệt độ: '}<span class="text-white font-medium">${m.temp}</span></div>
                    <div>${currentLang === 'EN' ? 'Grind: ' : 'Độ mịn: '}<span class="text-white font-medium">${m.grind}</span></div>
                </div>
                <p class="text-xs text-coffee-accent leading-relaxed mt-2 text-justify">${m.steps}</p>
            </div>
        `).join('');
        
        brewingSec.innerHTML = `
            <div class="space-y-6 text-left">
                <div class="space-y-1">
                    <span class="text-coffee-gold text-xs font-semibold tracking-wider uppercase block">${currentLang === 'EN' ? 'BREWING GUIDE' : 'HƯỚNG DẪN CÔNG THỨC'}</span>
                    <h2 class="font-serif text-2xl font-bold text-white">${currentLang === 'EN' ? 'Recommended Brewing Recipes' : 'Cách Pha Chế Khuyên Dùng'}</h2>
                    <p class="text-xs text-coffee-accent max-w-xl">${currentLang === 'EN' ? 'To preserve the authentic rustic flavor of this blend, please refer to the extraction metrics below.' : 'Để giữ lại trọn vẹn hương vị mộc mạc đặc trưng của dòng sản phẩm này, hãy tham khảo các chỉ số chiết xuất dưới đây.'}</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${methodsHtml}
                </div>
            </div>
        `;
        brewingSec.classList.remove('hidden');
    }
    
    // 3. Render Related Products
    const relatedSec = document.getElementById('related-products-section');
    if (relatedSec) {
        const relatedProds = products.filter(p => p.Id !== productId).slice(0, 4);
        if (relatedProds.length > 0) {
            const cardsHtml = relatedProds.map(p => {
                const rp = translateProduct(p);
                return `
                    <div class="bg-coffee-light border border-coffee-lighter rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between hover:border-coffee-gold transition-all duration-300">
                        <div class="relative overflow-hidden aspect-square bg-coffee cursor-pointer" onclick="window.location.href='product-detail.html?id=${rp.Id}'">
                            <img src="${rp.ImageUrl || 'images/blend.jpg'}" alt="${rp.Name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-2 right-2 bg-coffee-dark text-coffee-gold text-xs px-2.5 py-1 rounded-full border border-coffee-lighter font-sans">
                                ${rp.Unit}
                            </span>
                        </div>
                        <div class="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
                            <div>
                                <h3 onclick="window.location.href='product-detail.html?id=${rp.Id}'" class="font-serif text-base font-bold text-white group-hover:text-coffee-gold transition-colors cursor-pointer">${rp.Name}</h3>
                            </div>
                            <div class="flex justify-between items-center border-t border-coffee-lighter pb-2 pt-2">
                                <span class="text-sm font-bold text-coffee-gold">${formatMoney(rp.Price)}</span>
                                <button onclick="window.location.href='product-detail.html?id=${rp.Id}'" class="text-xs text-coffee-gold hover:underline font-semibold uppercase tracking-wider">${currentLang === 'EN' ? 'View Details' : 'Xem Chi Tiết'}</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            relatedSec.innerHTML = `
                <div class="space-y-6">
                    <div class="text-left space-y-1">
                        <span class="text-coffee-gold text-xs font-semibold tracking-wider uppercase block">${currentLang === 'EN' ? 'DISCOVER MORE' : 'KHÁM PHÁ THÊM'}</span>
                        <h2 class="font-serif text-2xl font-bold text-white">${currentLang === 'EN' ? 'Similar Products' : 'Sản Phẩm Tương Tự'}</h2>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${cardsHtml}
                    </div>
                </div>
            `;
            relatedSec.classList.remove('hidden');
        }
    }
    setTimeout(initScrollReveal, 100);
}

function changeDetailQty(amount) {
    const valEl = document.getElementById('detail-qty-val');
    if (!valEl) return;
    
    currentDetailQty += amount;
    if (currentDetailQty < 1) currentDetailQty = 1;
    valEl.innerText = currentDetailQty;
}

function addDetailProductToCart(id, name, price, imageUrl) {
    const select = document.getElementById(`detail-roast-${id}`);
    const roastLevel = select ? select.value : 'Medium';
    
    // Add to cart multiple times based on currentDetailQty
    for (let i = 0; i < currentDetailQty; i++) {
        addToCart(id, name, price, roastLevel, imageUrl);
    }
    showToast(currentLang === 'EN' ? `Added ${currentDetailQty} products to cart!` : `Đã thêm ${currentDetailQty} sản phẩm vào giỏ hàng!`, "success");
}

function buyDetailProductNow(id, name, price, imageUrl) {
    addDetailProductToCart(id, name, price, imageUrl);
    toggleCartDrawer(true);
}

// ==========================================
// DEDICATED BLOG DETAIL PAGE CONTROLLER
// ==========================================
function renderBlogDetailPage() {
    const content = document.getElementById('blog-detail-content');
    if (!content) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = parseInt(urlParams.get('id'));
    if (!blogId || blogs.length === 0) {
        content.innerHTML = `<p class="text-center text-coffee-accent py-16">${currentLang === 'EN' ? 'Article does not exist or has been removed.' : 'Bài viết không tồn tại hoặc đã bị gỡ bỏ.'}</p>`;
        return;
    }
    
    const p = blogs.find(b => b.Id === blogId);
    if (!p) {
        content.innerHTML = `<p class="text-center text-coffee-accent py-16">${currentLang === 'EN' ? 'Requested article not found.' : 'Không tìm thấy bài viết yêu cầu.'}</p>`;
        return;
    }
    const post = translateBlog(p);
    
    // Set document title & breadcrumb
    document.title = `${post.Title} – Pureva Craft`;
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (breadcrumbTitle) breadcrumbTitle.innerText = post.Title;
    
    const pubDate = new Date(post.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
    
    let mediaHtml = '';
    if (post.IsVideo && post.VideoUrl) {
        mediaHtml = `
            <div class="aspect-video w-full rounded-xl overflow-hidden border border-coffee-lighter bg-coffee-dark shadow-2xl">
                <iframe class="w-full h-full" src="${post.VideoUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
        `;
    } else {
        mediaHtml = `
            <div class="w-full aspect-video rounded-xl overflow-hidden border border-coffee-lighter bg-coffee shadow-2xl">
                <img src="${post.ImageUrl || 'images/blog1.jpg'}" alt="${post.Title}" class="w-full h-full object-cover">
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="space-y-6 text-left">
            <div class="space-y-3">
                <span class="text-coffee-gold text-xs font-semibold tracking-widest uppercase block font-sans">${currentLang === 'EN' ? 'FARM JOURNAL' : 'NHẬT KÝ NÔNG TRẠI'} • ${pubDate}</span>
                <h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">${post.Title}</h1>
            </div>
            
            ${mediaHtml}
            
            <div class="space-y-6 mt-8">
                <!-- Summary block quote -->
                <p class="text-base md:text-lg font-semibold text-coffee-gold leading-relaxed italic border-l-4 border-coffee-gold pl-4 py-1">
                    "${post.Summary || ''}"
                </p>
                <!-- Full content -->
                <div class="text-sm md:text-base text-coffee-accent/95 leading-relaxed space-y-6 text-justify whitespace-pre-line font-sans">
                    ${post.Content || ''}
                </div>
            </div>
            
            <div class="pt-8">
                <a href="blog.html" class="inline-flex items-center space-x-2 text-sm text-coffee-gold hover:text-white transition-colors font-semibold">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>${currentLang === 'EN' ? 'Back to News' : 'Quay lại Tin tức'}</span>
                </a>
            </div>
        </div>
    `;
    
    // Render related articles
    const relatedSec = document.getElementById('related-blogs-section');
    if (relatedSec) {
        const relatedPosts = blogs.filter(b => b.Id !== blogId).slice(0, 3);
        if (relatedPosts.length > 0) {
            const cardsHtml = relatedPosts.map(bg => {
                const b = translateBlog(bg);
                const dateStr = new Date(b.PublishedAt).toLocaleDateString(currentLang === 'EN' ? 'en-US' : 'vi-VN');
                const videoTag = b.IsVideo ? `
                    <span class="absolute top-3 left-3 bg-forest text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase font-sans shadow-md">VIDEO</span>
                ` : '';
                return `
                    <div class="bg-coffee-light border border-coffee-lighter/20 rounded-lg overflow-hidden group shadow-lg flex flex-col justify-between hover:border-coffee-gold/60 transition-all duration-300 cursor-pointer" onclick="window.location.href='blog-detail.html?id=${b.Id}'">
                        <div class="relative overflow-hidden aspect-video bg-coffee">
                            <img src="${b.ImageUrl || 'images/blog1.jpg'}" alt="${b.Title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            ${videoTag}
                        </div>
                        <div class="p-5 flex-grow flex flex-col justify-between space-y-3 text-left">
                            <div>
                                <span class="text-[10px] text-coffee-accent/60 font-sans block">${dateStr}</span>
                                <h4 class="font-serif text-base font-bold text-coffee-gold group-hover:text-white transition-colors mt-1 line-clamp-2">${b.Title}</h4>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            relatedSec.innerHTML = `
                <div class="border-t border-coffee-lighter/40 pt-12 space-y-6">
                    <div class="text-left space-y-1">
                        <span class="text-coffee-gold text-xs font-semibold tracking-wider uppercase block">${currentLang === 'EN' ? 'READ MORE' : 'ĐỌC THÊM'}</span>
                        <h3 class="font-serif text-2xl font-bold text-white">${currentLang === 'EN' ? 'Other Articles' : 'Tin Tức Khác'}</h3>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        ${cardsHtml}
                    </div>
                </div>
            `;
            relatedSec.classList.remove('hidden');
        }
    }
    setTimeout(initScrollReveal, 100);
}

// ==========================================
// CLIENT / USER AUTHENTICATION CONTROLLER
// ==========================================
function openAuthModal(mode = 'login') {
    let container = document.getElementById('auth-modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'auth-modal-container';
        document.body.appendChild(container);
    }
    renderAuthModal(mode);
}

function renderAuthModal(mode) {
    const container = document.getElementById('auth-modal-container');
    if (!container) return;
    
    container.className = "fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4";
    
    if (mode === 'login') {
        container.innerHTML = `
            <div class="relative bg-[#533E2D] border border-[#7A6452] rounded-xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl transition-all duration-300 transform scale-100" onclick="event.stopPropagation()">
                <!-- Close Button -->
                <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-coffee-accent/60 hover:text-white transition-colors cursor-pointer focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <!-- Heading -->
                <h2 class="font-serif text-2xl font-bold text-coffee-gold text-left">${currentLang === 'EN' ? 'Sign In' : 'Đăng nhập'}</h2>
                
                <!-- Form -->
                <form id="auth-login-form" class="space-y-4 text-left" onsubmit="handleUserLogin(event)">
                    <div class="space-y-1">
                        <input type="email" id="auth-email" required placeholder="Email" class="w-full bg-[#463325] border border-[#7A6452]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-coffee-gold placeholder-coffee-accent/40 font-sans">
                    </div>
                    <div class="space-y-1">
                        <input type="password" id="auth-password" required placeholder="${currentLang === 'EN' ? 'Password' : 'Mật khẩu'}" class="w-full bg-[#463325] border border-[#7A6452]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-coffee-gold placeholder-coffee-accent/40 font-sans">
                    </div>
                    <button type="submit" class="w-full bg-forest hover:bg-forest-hover text-white text-xs font-bold py-3.5 rounded transition-all duration-300 tracking-wider uppercase font-sans mt-2">
                        ${currentLang === 'EN' ? 'SIGN IN' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
                
                <!-- Toggle Mode link -->
                <p class="text-xs text-coffee-accent/70 font-sans">
                    ${currentLang === 'EN' 
                        ? `Don't have an account? <a href="#" onclick="event.preventDefault(); renderAuthModal('register')" class="text-coffee-gold hover:underline font-semibold">Sign Up</a>` 
                        : `Chưa có tài khoản? <a href="#" onclick="event.preventDefault(); renderAuthModal('register')" class="text-coffee-gold hover:underline font-semibold">Đăng ký</a>`}
                </p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="relative bg-[#533E2D] border border-[#7A6452] rounded-xl max-w-sm w-full p-8 text-center space-y-6 shadow-2xl transition-all duration-300 transform scale-100" onclick="event.stopPropagation()">
                <!-- Close Button -->
                <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-coffee-accent/60 hover:text-white transition-colors cursor-pointer focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <!-- Heading -->
                <h2 class="font-serif text-2xl font-bold text-coffee-gold text-left">${currentLang === 'EN' ? 'Sign Up' : 'Đăng ký'}</h2>
                
                <!-- Form -->
                <form id="auth-register-form" class="space-y-4 text-left" onsubmit="handleUserRegister(event)">
                    <div class="space-y-1">
                        <input type="text" id="reg-name" required placeholder="${currentLang === 'EN' ? 'Full Name' : 'Họ tên'}" class="w-full bg-[#463325] border border-[#7A6452]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-coffee-gold placeholder-coffee-accent/40 font-sans">
                    </div>
                    <div class="space-y-1">
                        <input type="email" id="reg-email" required placeholder="Email" class="w-full bg-[#463325] border border-[#7A6452]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-coffee-gold placeholder-coffee-accent/40 font-sans">
                    </div>
                    <div class="space-y-1">
                        <input type="password" id="reg-password" required placeholder="${currentLang === 'EN' ? 'Password' : 'Mật khẩu'}" class="w-full bg-[#463325] border border-[#7A6452]/50 text-sm text-white rounded px-4 py-3 focus:outline-none focus:border-coffee-gold placeholder-coffee-accent/40 font-sans">
                    </div>
                    <button type="submit" class="w-full bg-forest hover:bg-forest-hover text-white text-xs font-bold py-3.5 rounded transition-all duration-300 tracking-wider uppercase font-sans mt-2">
                        ${currentLang === 'EN' ? 'SIGN UP' : 'ĐĂNG KÝ'}
                    </button>
                </form>
                
                <!-- Toggle Mode link -->
                <p class="text-xs text-coffee-accent/70 font-sans">
                    ${currentLang === 'EN' 
                        ? `Already have an account? <a href="#" onclick="event.preventDefault(); renderAuthModal('login')" class="text-coffee-gold hover:underline font-semibold">Sign In</a>` 
                        : `Đã có tài khoản? <a href="#" onclick="event.preventDefault(); renderAuthModal('login')" class="text-coffee-gold hover:underline font-semibold">Đăng nhập</a>`}
                </p>
            </div>
        `;
    }
    
    // Add backdrop close click handler
    container.onclick = closeAuthModal;
    
    // Show container
    container.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

function closeAuthModal() {
    const container = document.getElementById('auth-modal-container');
    if (container) {
        container.classList.add('hidden');
    }
    document.body.classList.remove('overflow-hidden');
}

function handleUserRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    let users = JSON.parse(localStorage.getItem('pureva_users') || '[]');
    if (users.some(u => u.email === email)) {
        showToast(currentLang === 'EN' ? "This email is already registered!" : "Email này đã được đăng ký!", "warning");
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('pureva_users', JSON.stringify(users));
    
    showToast(currentLang === 'EN' ? "Account registered successfully!" : "Đăng ký tài khoản thành công!", "success");
    renderAuthModal('login');
}

function handleUserLogin(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (window.chrome && window.chrome.webview) {
        sendHostMessage({
            action: 'loginAdmin',
            username: email,
            password: password
        });
    } else {
        // Fallback for simulation outside WebView2 environment
        setTimeout(() => {
            const isMockAdmin = (email === 'admin@pureva.vn' && password === 'admin') || (email === 'admin@pureva.com' && password === 'Admin@123');
            handleHostMessage({
                action: 'adminLoginResponse',
                success: isMockAdmin
            });
        }, 100);
    }
}

function handleUserIconClick(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

function handleUserLogout() {
    localStorage.removeItem('pureva_current_user');
    showToast(currentLang === 'EN' ? "Logged out successfully." : "Đã đăng xuất tài khoản.", "info");
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');
    updateHeaderUserUI();
    if (window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

function updateHeaderUserUI() {
    const currentUser = JSON.parse(localStorage.getItem('pureva_current_user'));
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (!dropdownMenu) return;
    
    const t = langMap[currentLang];
    
    if (currentUser) {
        dropdownMenu.innerHTML = `
            <div class="py-1 text-sm font-sans" role="none">
                <div class="px-4 py-2 text-xs text-coffee-gold border-b border-coffee-lighter/40 font-semibold" id="dropdown-username">${currentLang === 'EN' ? 'Hello, ' : 'Xin chào, '}${currentUser.name}!</div>
                <a href="admin.html" id="dropdown-admin-link" class="${currentUser.isAdmin ? '' : 'hidden'} block px-4 py-2.5 text-coffee-accent hover:bg-coffee hover:text-white transition-colors" role="menuitem">${t.adminPanel}</a>
                <button onclick="handleUserLogout()" class="w-full text-left block px-4 py-2.5 text-coffee-accent hover:bg-coffee hover:text-white transition-colors focus:outline-none" role="menuitem">${t.logout}</button>
            </div>
        `;
    } else {
        dropdownMenu.innerHTML = `
            <div class="py-1 text-sm font-sans" role="none">
                <div class="px-4 py-2 text-xs text-coffee-gold border-b border-coffee-lighter/40 font-semibold" id="dropdown-username">${t.hello}</div>
                <button onclick="openAuthModal('login')" class="w-full text-left block px-4 py-2.5 text-coffee-accent hover:bg-coffee hover:text-white transition-colors focus:outline-none" role="menuitem">${t.login}</button>
                <button onclick="openAuthModal('register')" class="w-full text-left block px-4 py-2.5 text-coffee-accent hover:bg-coffee hover:text-white transition-colors focus:outline-none" role="menuitem">${t.register}</button>
            </div>
        `;
    }
}

// Global click listener to close dropdowns
document.addEventListener('click', () => {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.classList.add('hidden');
});

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'transform translate-y-2 opacity-0 pointer-events-auto flex items-center gap-3 bg-coffee-light/95 border border-coffee-lighter/60 text-white px-4 py-3.5 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 ease-out font-sans text-sm select-none border-l-4';
    
    // Customize border & icon based on type
    let icon = '';
    if (type === 'success') {
        toast.classList.add('border-l-forest');
        icon = `
            <svg class="h-5 w-5 text-forest shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
        `;
    } else if (type === 'error') {
        toast.classList.add('border-l-red-500');
        icon = `
            <svg class="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
    } else if (type === 'warning') {
        toast.classList.add('border-l-amber-500');
        icon = `
            <svg class="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        `;
    } else {
        toast.classList.add('border-l-coffee-gold');
        icon = `
            <svg class="h-5 w-5 text-coffee-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `;
    }
    
    toast.innerHTML = `
        ${icon}
        <div class="flex-grow font-medium leading-relaxed">${message}</div>
        <button class="text-coffee-accent/40 hover:text-white transition-colors focus:outline-none shrink-0" onclick="this.parentElement.remove()">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation frame
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    });
    
    // Auto remove toast after 3.5s
    setTimeout(() => {
        toast.classList.add('translate-y-[-8px]', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// ==========================================
// DYNAMIC ANIMATION SYSTEM (SCROLL REVEAL & HERO LOAD)
// ==========================================
function injectAnimationCSS() {
    if (document.getElementById('pureva-animations-style')) return;
    
    const style = document.createElement('style');
    style.id = 'pureva-animations-style';
    style.innerHTML = `
        /* Scroll reveal transition classes */
        .reveal-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.30, 1), transform 0.8s cubic-bezier(0.16, 1, 0.30, 1);
            will-change: opacity, transform;
        }
        .reveal-item.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Hero fade-in-up animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.30, 1) forwards;
        }
        
        /* Staggered animation delays */
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
    `;
    document.head.appendChild(style);
}

function initScrollReveal() {
    // 1. Hero Animation setup
    const heroSection = document.querySelector('section.relative');
    if (heroSection && !heroSection.classList.contains('hero-animated')) {
        heroSection.classList.add('hero-animated');
        const childElements = heroSection.querySelectorAll('span, h1, p, div.flex');
        childElements.forEach((el, index) => {
            el.classList.add('opacity-0', 'animate-fade-in-up');
            if (index === 0) el.classList.add('delay-100');
            else if (index === 1) el.classList.add('delay-200');
            else if (index === 2) el.classList.add('delay-300');
            else if (index === 3) el.classList.add('delay-400');
        });
    }

    // 2. Scroll Reveal Observer for other sections
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach((sec, idx) => {
        if (idx > 0 && !sec.classList.contains('reveal-item')) { // Skip Hero section
            sec.classList.add('reveal-item');
            observer.observe(sec);
        }
    });

    const cards = document.querySelectorAll('.grid > div');
    cards.forEach(card => {
        if (!card.classList.contains('reveal-item') && 
            (card.classList.contains('bg-coffee-light') || card.classList.contains('rounded-lg') || card.classList.contains('border') || card.classList.contains('rounded-xl'))) {
            card.classList.add('reveal-item');
            observer.observe(card);
        }
    });
}

// ==========================================
// TRANSLATION ENGINE (VI / EN)
// ==========================================
function toggleLanguage(event) {
    if (event) event.stopPropagation();
    currentLang = currentLang === 'VI' ? 'EN' : 'VI';
    localStorage.setItem('pureva_lang', currentLang);
    
    // Re-render core layout elements
    initCommonUI();
    applyTranslation();
    
    // Rerender page-specific modules if available
    const currentPath = window.location.pathname.split("/").pop();
    if (currentPath === 'shop.html' && typeof renderShopPage === 'function') {
        renderShopPage();
    } else if (currentPath === 'blog.html' && typeof renderBlogPage === 'function') {
        renderBlogPage();
    } else if ((currentPath.startsWith('product-detail.html') || window.location.pathname.includes('product-detail.html')) && typeof renderProductDetailPage === 'function') {
        renderProductDetailPage();
    } else if ((currentPath.startsWith('blog-detail.html') || window.location.pathname.includes('blog-detail.html')) && typeof renderBlogDetailPage === 'function') {
        renderBlogDetailPage();
    }
}

function applyTranslation() {
    const t = langMap[currentLang];
    const currentPath = window.location.pathname.split("/").pop().toLowerCase();
    const isHome = currentPath === 'index.html' || currentPath === 'index' || currentPath === '' || currentPath === 'index.aspx' || currentPath === 'index.php';
    const isShop = currentPath.startsWith('shop.html') || currentPath === 'shop';
    const isCustomize = currentPath.startsWith('customize.html') || currentPath === 'customize';
    const isContact = currentPath.startsWith('contact.html') || currentPath === 'contact';
    const isBlog = currentPath.startsWith('blog.html') || currentPath === 'blog';
    const isProductDetail = currentPath.startsWith('product-detail.html') || currentPath === 'product-detail';
    const isBlogDetail = currentPath.startsWith('blog-detail.html') || currentPath === 'blog-detail';
    const isOrderSuccess = currentPath.startsWith('order-success.html') || currentPath === 'order-success';
    const isAdmin = currentPath.startsWith('admin.html') || currentPath === 'admin';
    
    // 1. Language selector button label
    const langBtn = document.getElementById('lang-selector-btn');
    if (langBtn) {
        langBtn.innerText = currentLang;
    }
    
    // 2. Index / Home page translations
    if (isHome) {
        const heroBadge = document.querySelector('section.relative span.text-coffee-gold');
        if (heroBadge) {
            heroBadge.innerText = currentLang === 'EN'
                ? "LÂM ĐỒNG SPECIALTY ORGANIC COFFEE"
                : "CÀ PHÊ HỮU CƠ ĐẶC SẢN LÂM ĐỒNG";
        }

        const heroTitle = document.querySelector('h1');
        if (heroTitle) {
            heroTitle.innerText = currentLang === 'EN' 
                ? "Pureva – Green from roots, Pure from heart, Elevated in value" 
                : "Pureva – Xanh từ gốc, Vẹn từ tâm, Hoá nâng tầm";
        }
        
        const heroSub = document.querySelector('section.relative p');
        if (heroSub) {
            heroSub.innerText = currentLang === 'EN'
                ? "Each specialty coffee bean is grown naturally, hand-harvested ripe, and meticulously processed under sustainable standards in the highlands of Lam Dong."
                : "Từng hạt cà phê đặc sản được vun trồng tự nhiên, thu hoạch thủ công chín mọng và chế biến tỉ mỉ theo tiêu chuẩn bền vững tại vùng cao Lâm Đồng.";
        }
        
        const heroBtn1 = document.querySelector('section.relative a[href="shop.html"]');
        if (heroBtn1) {
            heroBtn1.innerText = currentLang === 'EN' ? 'SHOP NOW' : 'MUA NGAY';
        }
        
        const heroBtn2 = document.querySelector('section.relative a[href="customize.html"]');
        if (heroBtn2) {
            heroBtn2.innerText = currentLang === 'EN' ? 'CUSTOM PACKAGING' : 'BAO BÌ CÁ NHÂN HOÁ';
        }

        // Story Section Translation
        const storySpan = document.querySelector('section.bg-coffee-light span');
        if (storySpan) {
            storySpan.innerText = currentLang === 'EN' ? 'BRAND STORY' : 'CÂU CHUYỆN THƯƠNG HIỆU';
        }

        const storyTitle = document.querySelector('section.bg-coffee-light h2');
        if (storyTitle) {
            storyTitle.innerText = currentLang === 'EN' 
                ? "From pure natural springs to a perfect clean cup of coffee" 
                : "Từ vườn suối tinh khiết đến tách cà phê sạch trọn vẹn";
        }

        const storyParas = document.querySelectorAll('section.bg-coffee-light p');
        if (storyParas && storyParas.length >= 2) {
            if (currentLang === 'EN') {
                storyParas[0].innerText = "Pureva was born from a passionate love for the rich basalt land of Lam Dong. We witnessed coffee farms being overused with chemical fertilizers, losing their rustic and original flavor. That is why Pureva was established, pursuing the philosophy of pure natural organic farming.";
                storyParas[1].innerText = "At Pureva farm, Arabica and Robusta coffee trees live in harmony with wild grass and insects under shading trees. They are fertilized with self-made organic compost from coffee husks. The abundant water flows from natural mountain streams. A cup of Pureva coffee does not only carry the sweetness of honey and fruits, but also contains our heart in preserving the local ecology.";
            } else {
                storyParas[0].innerText = "Pureva được khởi nguồn từ tình yêu mãnh liệt với vùng đất đỏ bazan Lâm Đồng trù phú. Chúng tôi chứng kiến những vườn cà phê bị lạm dụng phân bón hóa học, làm mất đi hương vị mộc mạc nguyên bản. Đó là lý do Pureva ra đời, theo đuổi triết lý canh tác hữu cơ thuần tự nhiên.";
                storyParas[1].innerText = "Tại nông trại Pureva, những cây cà phê Arabica, Robusta sống hòa hợp cùng cỏ dại, côn trùng dưới tán cây che bóng mát. Chúng được chăm bón bằng phân sinh học tự chế từ vỏ cà phê ủ hoai. Nguồn nước tưới dồi dào chảy từ suối khe tự nhiên. Tách cà phê Pureva không chỉ mang hương vị ngọt ngào từ mật hoa quả, mà còn chứa đựng cả tấm lòng gìn giữ sinh thái môi trường của chúng tôi.";
            }
        }
        
        const storyLink = document.querySelector('section.bg-coffee-light a[href="shop.html"]');
        if (storyLink) {
            storyLink.innerHTML = currentLang === 'EN' ? "DISCOVER PRODUCTS &rarr;" : "KHÁM PHÁ CÁC SẢN PHẨM &rarr;";
        }

        // Vision, Mission & Core Values Translations
        const visionMissionSection = document.querySelector('section.bg-coffee-dark');
        if (visionMissionSection) {
            const vmHeaders = visionMissionSection.querySelectorAll('h3');
            const vmParas = visionMissionSection.querySelectorAll('p');
            if (vmHeaders.length >= 2 && vmParas.length >= 2) {
                vmHeaders[0].innerText = currentLang === 'EN' ? "Vision" : "Tầm Nhìn";
                vmParas[0].innerText = currentLang === 'EN'
                    ? "Become the leading organic specialty coffee icon in Vietnam, bringing Lam Dong's clean agricultural products to the global stage under a sustainable and highly socially responsible supply chain model."
                    : "Trở thành biểu tượng cà phê hữu cơ đặc sản hàng đầu Việt Nam, đưa nông sản sạch Lâm Đồng vươn tầm quốc tế dưới mô hình chuỗi cung ứng bền vững và có trách nhiệm xã hội cao.";

                vmHeaders[1].innerText = currentLang === 'EN' ? "Mission" : "Sứ Mệnh";
                vmParas[1].innerText = currentLang === 'EN'
                    ? "Delivering exceptional, pure organic coffee cups to consumers, ensuring sustainable livelihoods for minority farmers, and restoring biodiversity balance to the cultivation soil."
                    : "Đem lại ly cà phê hữu cơ tinh khiết tuyệt hảo đến tay người dùng, đảm bảo sinh kế bền vững cho người nông dân thiểu số và khôi phục sự cân bằng đa dạng sinh học cho đất trồng.";
            }

            const coreValuesTitle = visionMissionSection.querySelector('h2');
            if (coreValuesTitle) {
                coreValuesTitle.innerText = currentLang === 'EN' ? "Core Values" : "Giá trị cốt lõi";
            }

            const valCards = visionMissionSection.querySelectorAll('.grid-cols-1.md\\:grid-cols-3 > div');
            if (valCards.length >= 3) {
                const vh1 = valCards[0].querySelector('h3');
                const vp1 = valCards[0].querySelector('p');
                if (vh1) vh1.innerText = currentLang === 'EN' ? "Transparency" : "Minh Bạch";
                if (vp1) vp1.innerText = currentLang === 'EN' ? "Clear origin, from farm to coffee cup." : "Nguồn gốc rõ ràng, từ nông trại đến tách cà phê.";

                const vh2 = valCards[1].querySelector('h3');
                const vp2 = valCards[1].querySelector('p');
                if (vh2) vh2.innerText = currentLang === 'EN' ? "Sustainability" : "Bền Vững";
                if (vp2) vp2.innerText = currentLang === 'EN' ? "Organic cultivation, protecting the living environment." : "Canh tác hữu cơ, bảo vệ môi trường sống.";

                const vh3 = valCards[2].querySelector('h3');
                const vp3 = valCards[2].querySelector('p');
                if (vh3) vh3.innerText = currentLang === 'EN' ? "Artisan" : "Nghệ Thuật";
                if (vp3) vp3.innerText = currentLang === 'EN' ? "Handcrafted roasting, honoring the authentic flavor." : "Rang xay thủ công, tôn vinh hương vị đích thực.";
            }
        }

        // Live Camera Translations (Targeted using iframe proximity to avoid Brand Story collision)
        const cameraSection = Array.from(document.querySelectorAll('section')).find(s => s.querySelector('iframe'));
        if (cameraSection) {
            const cameraSpan = cameraSection.querySelector('span');
            if (cameraSpan) {
                cameraSpan.innerText = currentLang === 'EN' ? "LIVE CAMERA FROM LAM DONG FARM" : "LIVE CAMERA TỪ NÔNG TRẠI LÂM ĐỒNG";
            }
            const cameraTitle = cameraSection.querySelector('h2');
            if (cameraTitle) {
                cameraTitle.innerText = currentLang === 'EN' ? "Real-time Farm Monitoring" : "Giám sát trang trại thời gian thực";
            }
            const cameraDesc = cameraSection.querySelector('p');
            if (cameraDesc) {
                cameraDesc.innerText = currentLang === 'EN'
                    ? "We openly broadcast live camera feeds from our organic nursery and greenhouse drying racks so you can verify Pureva's transparent cultivation process at any time."
                    : "Chúng tôi công khai live feed camera tại khu vực vườn ươm hữu cơ và khu giàn phơi nhà kính để bạn luôn kiểm chứng được quy trình canh tác minh bạch của Pureva.";
            }
            const cameraCam1 = cameraSection.querySelector('.bottom-4.right-4');
            if (cameraCam1) {
                cameraCam1.innerText = currentLang === 'EN' ? "Lam Dong - Camera Gate #1" : "Lâm Đồng - Cổng Camera #1";
            }
        }

        // Lot tracking
        const lotTitle = document.querySelector('section.py-20.bg-coffee-dark h2');
        if (lotTitle) {
            lotTitle.innerText = currentLang === 'EN' ? "Lot Harvesting Tracking" : "Theo dõi theo lô";
        }
        const lotCards = document.querySelectorAll('section.py-20.bg-coffee-dark .grid-cols-2.md\\:grid-cols-4 > div');
        if (lotCards && lotCards.length >= 4) {
            const lotStatus = [
                { en: "Lot A1 - Harvesting", vi: "Lô A1 - Đang thu hoạch" },
                { en: "Lot B2 - Drying", vi: "Lô B2 - Đang phơi" },
                { en: "Lot C3 - Roasting", vi: "Lô C3 - Đang rang" },
                { en: "Lot D4 - Ready", vi: "Lô D4 - Sẵn sàng" }
            ];
            lotCards.forEach((c, idx) => {
                const span = c.querySelector('span');
                if (span) {
                    span.innerText = currentLang === 'EN' ? lotStatus[idx].en : lotStatus[idx].vi;
                }
            });
        }
    }

    // 2.3 Order Success Page translations
    if (isOrderSuccess) {
        document.title = currentLang === 'EN' ? "Order Success – Pureva Craft" : "Đặt Hàng Thành Công – Pureva Craft";

        const badge = document.querySelector('main span.text-coffee-gold');
        if (badge) {
            badge.innerText = currentLang === 'EN' ? "ORDER COMPLETE" : "ĐƠN HÀNG HOÀN TẤT";
        }
        
        const h1 = document.querySelector('main h1');
        if (h1) {
            h1.innerText = currentLang === 'EN' ? "Order Placed Successfully!" : "Đặt Hàng Thành Công!";
        }
        
        const desc = document.querySelector('main p.text-sm');
        if (desc) {
            desc.innerText = currentLang === 'EN' 
                ? "Thank you for choosing Pureva. Your pure organic coffee is on its way." 
                : "Cảm ơn bạn đã lựa chọn Pureva. Tách cà phê hữu cơ nguyên bản đang trên đường tới bạn.";
        }

        const codeLabel = document.querySelector('#order-summary-box > div:first-child > span:first-child');
        if (codeLabel) {
            codeLabel.innerText = currentLang === 'EN' ? "ORDER CODE:" : "MÃ ĐƠN HÀNG:";
        }

        const labels = document.querySelectorAll('#order-summary-box .space-y-2 > div > span:first-child');
        if (labels.length >= 4) {
            labels[0].innerText = currentLang === 'EN' ? "Customer:" : "Khách hàng:";
            labels[1].innerText = currentLang === 'EN' ? "Phone:" : "Số điện thoại:";
            labels[2].innerText = currentLang === 'EN' ? "Date/Time:" : "Thời gian:";
            labels[3].innerText = currentLang === 'EN' ? "Total payment:" : "Tổng thanh toán:";
        }

        const notice = document.querySelector('main p.text-xs');
        if (notice) {
            notice.innerText = currentLang === 'EN'
                ? "Pureva has received your order details and will call you within 10 - 15 minutes to confirm the delivery schedule."
                : "Pureva đã tiếp nhận thông tin và sẽ gọi điện thoại liên hệ trực tiếp cho bạn sau 10 - 15 phút để xác nhận đơn hàng và lịch giao.";
        }

        const contBtn = document.querySelector('main a[href="shop.html"]');
        if (contBtn) {
            contBtn.innerText = currentLang === 'EN' ? "CONTINUE SHOPPING" : "TIẾP TỤC MUA SẮM";
        }

        const homeBtn = document.querySelector('main a[href="index.html"]');
        if (homeBtn) {
            homeBtn.innerText = currentLang === 'EN' ? "BACK TO HOMEPAGE" : "VỀ TRANG CHỦ";
        }
    }

    // 2.4 Admin page translations
    if (isAdmin) {
        document.title = currentLang === 'EN' ? "Admin System – Pureva Craft" : "Hệ Thống Quản Trị – Pureva Craft";

        // (Admin Login Section removed since login is unified)

        // Admin Dashboard Section
        const dashboardSec = document.getElementById('admin-dashboard-sec');
        if (dashboardSec) {
            const h1 = dashboardSec.querySelector('h1');
            if (h1) h1.innerText = currentLang === 'EN' ? "Admin Dashboard" : "Hệ Thống Quản Trị";
            
            const p = dashboardSec.querySelector('h1 + p');
            if (p) p.innerText = currentLang === 'EN' ? "Manage content, check orders and custom packaging" : "Quản lý nội dung, kiểm tra đơn hàng và thiết kế bao bì";
            
            const logoutBtn = dashboardSec.querySelector('button[onclick="handleUserLogout()"]');
            if (logoutBtn) logoutBtn.innerText = currentLang === 'EN' ? "Logout" : "Đăng xuất";

            // Stats Cards Labels
            const statsCards = dashboardSec.querySelectorAll('.grid-cols-1.sm\\:grid-cols-3 > div');
            if (statsCards.length >= 3) {
                const p0 = statsCards[0].querySelector('p');
                if (p0) p0.innerText = currentLang === 'EN' ? "Total Orders" : "Tổng đơn hàng";
                
                const p1 = statsCards[1].querySelector('p');
                if (p1) p1.innerText = currentLang === 'EN' ? "Packaging Requests" : "Yêu cầu bao bì";
                
                const p2 = statsCards[2].querySelector('p');
                if (p2) p2.innerText = currentLang === 'EN' ? "Available Products" : "Sản phẩm hiện có";
            }

            // Tab Headers
            const tabOrders = document.getElementById('tab-btn-orders');
            if (tabOrders) tabOrders.innerText = currentLang === 'EN' ? "Orders" : "Đơn hàng";
            
            const tabDesigns = document.getElementById('tab-btn-designs');
            if (tabDesigns) tabDesigns.innerText = currentLang === 'EN' ? "Packaging Requests" : "Yêu cầu Bao Bì";
            
            const tabProducts = document.getElementById('tab-btn-products');
            if (tabProducts) tabProducts.innerText = currentLang === 'EN' ? "Products" : "Sản phẩm";
            
            const tabBlogs = document.getElementById('tab-btn-blogs');
            if (tabBlogs) tabBlogs.innerText = currentLang === 'EN' ? "Blog/News" : "Tin Tức";
            
            const tabSettings = document.getElementById('tab-btn-settings');
            if (tabSettings) tabSettings.innerText = currentLang === 'EN' ? "Web Config" : "Cấu hình Web";

            // Tab Title Headers
            const titleOrders = document.querySelector('#tab-panel-orders h3');
            if (titleOrders) titleOrders.innerText = currentLang === 'EN' ? "Order List" : "Danh sách Đơn hàng";

            const titleDesigns = document.querySelector('#tab-panel-designs h3');
            if (titleDesigns) titleDesigns.innerText = currentLang === 'EN' ? "Custom Packaging Requests" : "Yêu cầu Cá nhân hóa bao bì";

            const titleProducts = document.querySelector('#tab-panel-products h3');
            if (titleProducts) titleProducts.innerText = currentLang === 'EN' ? "Product Management" : "Quản lý Sản phẩm";

            const titleBlogs = document.querySelector('#tab-panel-blogs h3');
            if (titleBlogs) titleBlogs.innerText = currentLang === 'EN' ? "News & Blog Management" : "Quản lý Bài viết Tin tức";

            const titleSettings = document.querySelector('#tab-panel-settings h3');
            if (titleSettings) titleSettings.innerText = currentLang === 'EN' ? "System & SEO Configuration" : "Cấu hình Hệ thống & SEO";

            // Add Buttons
            const addProductBtn = document.querySelector('#tab-panel-products button[onclick="showAddProductModal()"]');
            if (addProductBtn) addProductBtn.innerText = currentLang === 'EN' ? "+ ADD NEW PRODUCT" : "+ THÊM SẢN PHẨM MỚI";

            const addBlogBtn = document.querySelector('#tab-panel-blogs button[onclick="showAddBlogModal()"]');
            if (addBlogBtn) addBlogBtn.innerText = currentLang === 'EN' ? "+ WRITE NEW BLOG" : "+ VIẾT BÀI MỚI";

            // Table Headers
            const orderHeaders = document.querySelectorAll('#tab-panel-orders table thead th');
            if (orderHeaders.length >= 7) {
                orderHeaders[0].innerText = currentLang === 'EN' ? "Order ID" : "Mã đơn";
                orderHeaders[1].innerText = currentLang === 'EN' ? "Customer" : "Khách hàng";
                orderHeaders[2].innerText = currentLang === 'EN' ? "Shipping Address" : "Địa chỉ giao hàng";
                orderHeaders[3].innerText = currentLang === 'EN' ? "Total Amount" : "Tổng tiền";
                orderHeaders[4].innerText = currentLang === 'EN' ? "Order Date" : "Ngày đặt";
                orderHeaders[5].innerText = currentLang === 'EN' ? "Status" : "Trạng thái";
                orderHeaders[6].innerText = currentLang === 'EN' ? "Actions" : "Thao tác";
            }

            const designHeaders = document.querySelectorAll('#tab-panel-designs table thead th');
            if (designHeaders.length >= 7) {
                designHeaders[0].innerText = currentLang === 'EN' ? "Request ID" : "Mã yêu cầu";
                designHeaders[1].innerText = currentLang === 'EN' ? "Customer" : "Khách hàng";
                designHeaders[2].innerText = currentLang === 'EN' ? "Design Concept" : "Ý tưởng thiết kế";
                designHeaders[3].innerText = currentLang === 'EN' ? "Sticker File" : "File nhãn dán";
                designHeaders[4].innerText = currentLang === 'EN' ? "Date Submitted" : "Ngày gửi";
                designHeaders[5].innerText = currentLang === 'EN' ? "Status" : "Trạng thái";
                designHeaders[6].innerText = currentLang === 'EN' ? "Actions" : "Thao tác";
            }

            // Config Form Labels
            const configLabels = document.querySelectorAll('#tab-panel-settings form label');
            if (configLabels.length >= 5) {
                configLabels[0].innerText = currentLang === 'EN' ? "Website SEO Title" : "Tiêu đề SEO Trang web";
                configLabels[1].innerText = currentLang === 'EN' ? "Hotline Phone" : "Số điện thoại Hotline";
                configLabels[2].innerText = currentLang === 'EN' ? "SEO Description (Meta Description)" : "Mô tả SEO (Meta Description)";
                configLabels[3].innerText = currentLang === 'EN' ? "Support Email" : "Email hỗ trợ";
                configLabels[4].innerText = currentLang === 'EN' ? "Office Address" : "Địa chỉ văn phòng";
            }
            const configSaveBtn = document.querySelector('#tab-panel-settings form button[type="submit"]');
            if (configSaveBtn) configSaveBtn.innerText = currentLang === 'EN' ? "SAVE CHANGES" : "LƯU THAY ĐỔI";
        }

        // Modals
        const prodModalTitle = document.getElementById('prod-modal-title');
        if (prodModalTitle) {
            prodModalTitle.innerText = editingProductId
                ? (currentLang === 'EN' ? "Edit Product" : "Chỉnh Sửa Sản Phẩm")
                : (currentLang === 'EN' ? "Add New Product" : "Thêm Sản Phẩm Mới");
        }
        const prodLabels = document.querySelectorAll('#prod-form label');
        if (prodLabels.length >= 5) {
            prodLabels[0].innerText = currentLang === 'EN' ? "Product Name *" : "Tên sản phẩm *";
            prodLabels[1].innerText = currentLang === 'EN' ? "Price (VND) *" : "Giá bán (VNĐ) *";
            prodLabels[2].innerText = currentLang === 'EN' ? "Unit (Package) *" : "Quy cách (đơn vị) *";
            prodLabels[3].innerText = currentLang === 'EN' ? "Product image URL (leave empty for default)" : "Đường dẫn ảnh sản phẩm (để trống sẽ dùng ảnh mặc định)";
            prodLabels[4].innerText = currentLang === 'EN' ? "Roast options (comma separated)" : "Tùy chọn rang (ngăn cách bằng dấu phẩy)";
        }
        const prodDescLabel = document.querySelector('#prod-form label[for="prod-desc"]');
        if (prodDescLabel) prodDescLabel.innerText = currentLang === 'EN' ? "Short description" : "Mô tả ngắn sản phẩm";

        const prodCancelBtn = document.querySelector('#prod-form button[type="button"]');
        if (prodCancelBtn) prodCancelBtn.innerText = currentLang === 'EN' ? "Cancel" : "Hủy";
        
        const prodSaveBtn = document.querySelector('#prod-form button[type="submit"]');
        if (prodSaveBtn) prodSaveBtn.innerText = currentLang === 'EN' ? "SAVE PRODUCT" : "LƯU SẢN PHẨM";

        // Blog Modal
        const blogModalTitle = document.getElementById('blog-modal-title');
        if (blogModalTitle) {
            blogModalTitle.innerText = editingBlogId
                ? (currentLang === 'EN' ? "Edit Blog Post" : "Chỉnh Sửa Bài Viết")
                : (currentLang === 'EN' ? "Write New Blog" : "Viết Bài Viết Mới");
        }
        const blogLabels = document.querySelectorAll('#blog-form label');
        if (blogLabels.length >= 6) {
            blogLabels[0].innerText = currentLang === 'EN' ? "Blog Title *" : "Tiêu đề bài viết *";
            blogLabels[1].innerText = currentLang === 'EN' ? "Thumbnail Image URL" : "Đường dẫn ảnh đại diện";
            blogLabels[2].innerText = currentLang === 'EN' ? "Does this post contain video?" : "Bài viết có chứa Video?";
            blogLabels[3].innerText = currentLang === 'EN' ? "YouTube Embed URL" : "Đường dẫn Nhúng video YouTube";
            blogLabels[4].innerText = currentLang === 'EN' ? "Short Summary *" : "Tóm tắt ngắn *";
            blogLabels[5].innerText = currentLang === 'EN' ? "Detailed Content" : "Nội dung chi tiết";
        }

        const blogCancelBtn = document.querySelector('#blog-form button[type="button"]');
        if (blogCancelBtn) blogCancelBtn.innerText = currentLang === 'EN' ? "Cancel" : "Hủy";
        
        const blogSaveBtn = document.querySelector('#blog-form button[type="submit"]');
        if (blogSaveBtn) blogSaveBtn.innerText = currentLang === 'EN' ? "SAVE BLOG" : "LƯU BÀI VIẾT";
    }

    // 3. Shop page translations
    if (isShop) {
        const shopTitle = document.querySelector('section.relative h1');
        if (shopTitle) {
            shopTitle.innerText = currentLang === 'EN' ? "Organic Coffee Shop" : "Cửa Hàng Cà Phê Hữu Cơ";
        }
        const shopSub = document.querySelector('section.relative p');
        if (shopSub) {
            shopSub.innerText = currentLang === 'EN' 
                ? "Handpicked finest flavors from Di Linh, Cau Dat, and Bao Loc (Standard 250g bag)" 
                : "Chọn lọc hương vị tinh tuý nhất từ Di Linh, Cầu Đất và Bảo Lộc (Gói chuẩn 250g)";
        }
        const filterSpan = document.querySelector('.flex-col.sm\\:flex-row > span');
        if (filterSpan) {
            filterSpan.innerText = currentLang === 'EN' ? "Specialty Coffee Beans" : "Hạt Cà Phê Đặc Sản";
        }
    }

    // 4. Customize page translations
    if (isCustomize) {
        const custTitle = document.querySelector('section.relative h1');
        if (custTitle) custTitle.innerText = currentLang === 'EN' ? "Custom Packaging" : "Bao Bì Cá Nhân Hoá";
        
        const custSub = document.querySelector('section.relative p');
        if (custSub) {
            custSub.innerText = currentLang === 'EN'
                ? "Design custom stickers, pack premium quality coffee beans as corporate or personal gifts."
                : "Tự thiết kế nhãn dán, đóng gói hạt cà phê ngon thượng hạng làm quà tặng doanh nghiệp hoặc cá nhân.";
        }
        
        const stepSpan = document.querySelector('main span.text-coffee-gold');
        if (stepSpan) stepSpan.innerText = currentLang === 'EN' ? "STEPS TO CREATE" : "BƯỚC THỰC HIỆN";
        
        const stepTitle = document.querySelector('main h2');
        if (stepTitle) stepTitle.innerText = currentLang === 'EN' ? "Create a coffee bag with your own brand" : "Tạo gói cà phê mang thương hiệu của riêng bạn";
        
        const stepDesc = document.querySelector('main h2 + p');
        if (stepDesc) {
            stepDesc.innerText = currentLang === 'EN'
                ? "Pureva provides professional packaging solutions for corporations, events, restaurants, hotels, or family holidays. You can print your brand logo, personal greetings, or unique design graphics onto our specialty coffee bags."
                : "Pureva cung cấp giải pháp đóng gói chuyên nghiệp cho các doanh nghiệp, sự kiện, nhà hàng, khách sạn hoặc các dịp lễ Tết gia đình. Bạn có thể in logo thương hiệu, lời chúc cá nhân, hoặc hình ảnh thiết kế riêng biệt lên túi cà phê đặc sản của chúng tôi.";
        }
        
        const stepHeaders = document.querySelectorAll('main h4');
        const stepParas = document.querySelectorAll('main h4 + p');
        if (stepHeaders.length >= 3 && stepParas.length >= 3) {
            stepHeaders[0].innerText = currentLang === 'EN' ? "Submit Info and Ideas" : "Điền thông tin và ý tưởng";
            stepParas[0].innerText = currentLang === 'EN'
                ? "Enter your personal information, describe your design concept, or upload an existing label design file (JPG, PNG)."
                : "Nhập thông tin cá nhân của bạn, mô tả ý tưởng mong muốn hoặc tải lên mẫu thiết kế nhãn dán sẵn có (định dạng JPG, PNG).";
                
            stepHeaders[1].innerText = currentLang === 'EN' ? "Approve Demo from Pureva" : "Duyệt thiết kế demo từ Pureva";
            stepParas[1].innerText = currentLang === 'EN'
                ? "Pureva's designer team will contact you, sketch a demo label on a 3D model, and send it to your email within 24 hours."
                : "Đội ngũ nghệ nhân thiết kế của Pureva sẽ liên hệ, phác thảo nhãn dán demo trên mô hình 3D gửi đến email của bạn trong vòng 24 giờ.";
                
            stepHeaders[2].innerText = currentLang === 'EN' ? "Production & Fast Delivery" : "Sản xuất và Giao hàng nhanh";
            stepParas[2].innerText = currentLang === 'EN'
                ? "Once you approve the design sample and quantity, Pureva will pack the fresh roast batch and deliver it nationwide."
                : "Sau khi bạn đồng ý bản mẫu thiết kế và số lượng đặt, Pureva sẽ đóng gói mẻ rang tươi mới nhất và giao hàng tận nơi trên toàn quốc.";
        }
        
        const hotlineLabel = document.querySelector('.p-6.bg-coffee p.text-coffee-gold');
        if (hotlineLabel) hotlineLabel.innerText = currentLang === 'EN' ? "Need a bulk quote urgently?" : "Cần tư vấn báo giá số lượng lớn gấp?";
        
        const formTitle = document.querySelector('h3.font-serif.text-xl');
        if (formTitle) formTitle.innerText = currentLang === 'EN' ? "Submit Custom Packaging Request" : "Gửi Yêu Cầu Thiết Kế Bao Bì";
        
        const labels = document.querySelectorAll('form label');
        if (labels.length >= 5) {
            labels[0].innerText = currentLang === 'EN' ? "Full Name *" : "Họ và tên *";
            labels[1].innerText = currentLang === 'EN' ? "Contact Email *" : "Email liên hệ *";
            labels[2].innerText = currentLang === 'EN' ? "Phone Number *" : "Số điện thoại *";
            labels[3].innerText = currentLang === 'EN' ? "Upload sticker design file (if any)" : "Tải lên file thiết kế nhãn dán (nếu có)";
            labels[4].innerText = currentLang === 'EN' ? "Describe your design concept" : "Mô tả ý tưởng của bạn";
        }
        
        const nameInput = document.getElementById('cust-name');
        if (nameInput) nameInput.placeholder = currentLang === 'EN' ? "Enter your full name" : "Nhập họ tên của bạn";
        
        const emailInput = document.getElementById('cust-email');
        if (emailInput) emailInput.placeholder = currentLang === 'EN' ? "Enter email address" : "Nhập địa chỉ email";
        
        const phoneInput = document.getElementById('cust-phone');
        if (phoneInput) phoneInput.placeholder = currentLang === 'EN' ? "Enter phone number" : "Nhập số điện thoại";
        
        const dragLabel = document.querySelector('.flex.text-xs.text-coffee-accent span');
        if (dragLabel) dragLabel.innerText = currentLang === 'EN' ? "Choose file" : "Chọn file";
        
        const dragText = document.querySelector('.flex.text-xs.text-coffee-accent p');
        if (dragText) dragText.innerText = currentLang === 'EN' ? "or drag and drop here" : "hoặc kéo thả vào đây";
        
        const fileHelp = document.querySelector('.space-y-1\\.text-center p.text-\\[10px\\]');
        if (fileHelp) fileHelp.innerText = currentLang === 'EN' ? "Accepts JPG, PNG under 5MB" : "Chấp nhận JPG, PNG dung lượng dưới 5MB";
        
        const descTextarea = document.getElementById('cust-description');
        if (descTextarea) {
            descTextarea.placeholder = currentLang === 'EN'
                ? "Example: I want to print logo ABC on the front, with a Happy New Year greeting on the back of the coffee bag."
                : "Ví dụ: Tôi muốn in logo doanh nghiệp ABC ở mặt trước, kèm lời chúc mừng năm mới 2027 ở mặt sau túi cà phê.";
        }
        
        const submitBtn = document.querySelector('form button[type="submit"]');
        if (submitBtn) submitBtn.innerText = currentLang === 'EN' ? "SUBMIT REQUEST" : "GỬI YÊU CẦU THIẾT KẾ";
    }

    // 5. Contact page translations
    if (isContact) {
        const contactTitle = document.querySelector('section.relative h1');
        if (contactTitle) contactTitle.innerText = currentLang === 'EN' ? "Contact Pureva Coffee" : "Liên Hệ Pureva Coffee";
        
        const contactSub = document.querySelector('section.relative p');
        if (contactSub) {
            contactSub.innerText = currentLang === 'EN'
                ? "Connect with us to share the passion for pure organic coffee."
                : "Kết nối với chúng tôi để chia sẻ niềm đam mê cà phê mộc sạch tinh khiết.";
        }
        
        const contactSpan = document.querySelector('main span.text-coffee-gold');
        if (contactSpan) contactSpan.innerText = currentLang === 'EN' ? "DIRECT CONTACT" : "LIÊN HỆ TRỰC TIẾP";
        
        const contactHeader = document.querySelector('main h2');
        if (contactHeader) contactHeader.innerText = currentLang === 'EN' ? "Come visit or chat with us" : "Hãy ghé thăm hoặc trò chuyện cùng chúng tôi";
        
        const contactDesc = document.querySelector('main h2 + p');
        if (contactDesc) {
            contactDesc.innerText = currentLang === 'EN'
                ? "If you want to wholesale high-quality coffee beans, register to visit our organic farm in Lam Dong, or simply share your experience with Pureva, please send us a message or call directly."
                : "Nếu bạn muốn hợp tác nhập sỉ cà phê hạt chất lượng cao, đăng ký tham quan nông trại canh tác hữu cơ tại Lâm Đồng, hoặc đơn giản là muốn chia sẻ trải nghiệm về Pureva, vui lòng gửi tin nhắn hoặc gọi trực tiếp cho chúng tôi.";
        }
        
        const cardHeaders = document.querySelectorAll('main h4');
        if (cardHeaders.length >= 3) {
            cardHeaders[0].innerText = currentLang === 'EN' ? "Office & Farm" : "Văn phòng & Nông trại";
            cardHeaders[1].innerText = currentLang === 'EN' ? "Hotline Phone" : "Điện thoại Hotline";
            cardHeaders[2].innerText = currentLang === 'EN' ? "Support Email" : "Email hỗ trợ";
        }
        
        const formHeader = document.querySelector('h3.font-serif.text-xl');
        if (formHeader) formHeader.innerText = currentLang === 'EN' ? "Send Feedback Message" : "Gửi tin nhắn phản hồi";
        
        const labels = document.querySelectorAll('form label');
        if (labels.length >= 4) {
            labels[0].innerText = currentLang === 'EN' ? "Full Name *" : "Họ và tên *";
            labels[1].innerText = currentLang === 'EN' ? "Email *" : "Email *";
            labels[2].innerText = currentLang === 'EN' ? "Phone Number *" : "Số điện thoại *";
            labels[3].innerText = currentLang === 'EN' ? "Your Message *" : "Lời nhắn của bạn *";
        }
        
        const nameInput = document.getElementById('cont-name');
        if (nameInput) nameInput.placeholder = currentLang === 'EN' ? "Enter your name" : "Nhập tên của bạn";
        
        const emailInput = document.getElementById('cont-email');
        if (emailInput) emailInput.placeholder = currentLang === 'EN' ? "Enter email" : "Nhập email";
        
        const phoneInput = document.getElementById('cont-phone');
        if (phoneInput) phoneInput.placeholder = currentLang === 'EN' ? "Enter phone number" : "Nhập số điện thoại";
        
        const messageTextarea = document.getElementById('cont-message');
        if (messageTextarea) {
            messageTextarea.placeholder = currentLang === 'EN'
                ? "Write your message to Pureva Coffee..."
                : "Viết lời nhắn gửi đến Pureva Coffee...";
        }
        
        const submitBtn = document.querySelector('form button[type="submit"]');
        if (submitBtn) submitBtn.innerText = currentLang === 'EN' ? "SEND CONTACT MESSAGE" : "GỬI TIN NHẮN LIÊN HỆ";
    }

    // 6. Blog page static translations
    if (isBlog) {
        const blogTitle = document.querySelector('section.relative h1');
        if (blogTitle) {
            blogTitle.innerText = currentLang === 'EN' ? "News & Farm Journal" : "Tin Tức & Nhật Ký Nông Trại";
        }
        const blogSub = document.querySelector('section.relative p');
        if (blogSub) {
            blogSub.innerText = currentLang === 'EN'
                ? "Stay updated with daily stories, organic harvesting processes, and brewing tips from the artisans."
                : "Cập nhật những câu chuyện thường nhật, quy trình thu hoạch hữu cơ và mẹo pha chế cà phê ngon từ nghệ nhân.";
        }
        const loadingText = document.querySelector('#blogs-grid span');
        if (loadingText) {
            loadingText.innerText = currentLang === 'EN' ? "Loading farm journal from database..." : "Đang tải nhật ký từ cơ sở dữ liệu...";
        }
    }

    // 7. Breadcrumbs translations for detail pages
    if (isProductDetail || isBlogDetail) {
        const breadcrumbHome = document.querySelector('main a[href="index.html"], nav a[href="index.html"]');
        if (breadcrumbHome) {
            breadcrumbHome.innerText = currentLang === 'EN' ? "Home" : "Trang chủ";
        }
        const breadcrumbShop = document.querySelector('main a[href="shop.html"]');
        if (breadcrumbShop) {
            breadcrumbShop.innerText = currentLang === 'EN' ? "Shop" : "Cửa hàng";
        }
        const breadcrumbBlog = document.querySelector('nav a[href="blog.html"]');
        if (breadcrumbBlog) {
            breadcrumbBlog.innerText = currentLang === 'EN' ? "Blog" : "Tin tức";
        }
    }

    // Apply settings translations (SEO, Address, email, phone) reactively
    if (websiteSettings) {
        applyWebsiteSettings(websiteSettings);
    }
}

// Image Preview & programmatic download helpers
function openImagePreviewModal(url) {
    const modal = document.getElementById('image-preview-modal');
    const img = document.getElementById('preview-modal-img');
    const filenameSpan = document.getElementById('preview-modal-filename');
    const downloadBtn = document.getElementById('preview-modal-download-btn');
    
    if (modal && img) {
        img.src = url;
        const filename = url.split('/').pop();
        if (filenameSpan) filenameSpan.innerText = filename;
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                downloadDesignFile(url, filename);
            };
        }
        modal.classList.remove('hidden');
    }
}

function closeImagePreviewModal() {
    const modal = document.getElementById('image-preview-modal');
    if (modal) modal.classList.add('hidden');
}

async function downloadDesignFile(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not OK");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'design_label.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error('Failed to download design file:', e);
        // Fallback: trigger standard open in new window
        window.open(url, '_blank');
    }
}

function toggleMobileMenu(open) {
    const drawer = document.getElementById('mobile-menu-drawer');
    const panel = document.getElementById('mobile-menu-panel');
    if (!drawer || !panel) return;
    
    if (open) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
            drawer.classList.remove('opacity-0');
            drawer.classList.add('opacity-100');
            panel.classList.remove('-translate-x-full');
            panel.classList.add('translate-x-0');
        }, 10);
    } else {
        drawer.classList.remove('opacity-100');
        drawer.classList.add('opacity-0');
        panel.classList.remove('translate-x-0');
        panel.classList.add('-translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    }
}
