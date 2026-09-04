/**
 * NGOPI LOER — Interactive Application Logic
 * Full functionality: Cart Drawer, Extended Menu Modal, Modals, Newsletter, Mobile Nav & Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ==========================================
  // 1. EXTENDED MENU DATABASE
  // ==========================================
  const fullCoffeeMenu = [
    {
      id: 'americano',
      name: 'Americano Coffee',
      category: 'hot',
      rating: 5.0,
      price: 13.6,
      desc: 'Rich double espresso diluted with hot water, offering a clean, bold coffee aroma.',
      img: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'espresso',
      name: 'Espresso Coffee',
      category: 'hot',
      rating: 5.0,
      price: 18.1,
      desc: 'Pure, concentrated single-origin Ethiopian extraction with thick golden crema.',
      img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'latte',
      name: 'Latte Coffee',
      category: 'hot',
      rating: 5.0,
      price: 15.5,
      desc: 'Silky steamed milk poured over rich espresso with delicate microfoam art.',
      img: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'cappuccino',
      name: 'Classic Cappuccino',
      category: 'hot',
      rating: 4.9,
      price: 16.0,
      desc: 'Equal balance of robust espresso, steamed milk, and a thick airy foam dusting.',
      img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'mocha',
      name: 'Cacao Mocha',
      category: 'specialty',
      rating: 4.8,
      price: 17.5,
      desc: 'Artisanal dark chocolate infused with double espresso and velvety textured milk.',
      img: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'caramel-macchiato',
      name: 'Caramel Macchiato',
      category: 'specialty',
      rating: 4.9,
      price: 18.5,
      desc: 'Vanilla steamed milk marked with espresso and drizzled with buttery caramel sauce.',
      img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'cold-brew',
      name: 'Ethiopian Cold Brew',
      category: 'cold',
      rating: 5.0,
      price: 16.5,
      desc: '18-hour cold steeped Yirgacheffe coffee delivering refreshing floral and citrus notes.',
      img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'flat-white',
      name: 'Velvet Flat White',
      category: 'hot',
      rating: 4.9,
      price: 16.8,
      desc: 'Ristretto shots blended with silky microfoam for an intensely smooth coffee flavor.',
      img: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 'iced-latte',
      name: 'Iced Vanilla Latte',
      category: 'cold',
      rating: 4.8,
      price: 17.0,
      desc: 'Chilled organic milk, Madagascar vanilla, and fresh espresso served over ice.',
      img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop'
    }
  ];

  // ==========================================
  // 2. SHOPPING CART STATE
  // ==========================================
  let cart = [];
  try {
    const savedCart = localStorage.getItem('ngopi_cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
  } catch (e) {
    cart = [];
  }

  const saveCart = () => {
    localStorage.setItem('ngopi_cart', JSON.stringify(cart));
    updateCartUI();
  };

  // Add Item to Cart
  const addToCart = (product) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        img: product.img,
        quantity: 1
      });
    }
    saveCart();
    showToast(`Added "${product.name}" to cart! ☕`);
  };

  // Update Cart UI
  const updateCartUI = () => {
    const cartBadge = document.getElementById('cartBadge');
    const drawerCartCount = document.getElementById('drawerCartCount');
    const cartDrawerCount = document.getElementById('cartDrawerCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    if (cartBadge) cartBadge.textContent = totalCount;
    if (drawerCartCount) drawerCartCount.textContent = totalCount;
    if (cartDrawerCount) cartDrawerCount.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''}`;

    if (cartSubtotal) cartSubtotal.textContent = `$ ${subtotal.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$ ${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$ ${total.toFixed(2)}`;

    // Render Cart Drawer Body
    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="empty-cart-view">
          <i data-lucide="shopping-bag"></i>
          <h4>Your cart is empty</h4>
          <p>Explore our menu and add your favorite Ethiopian coffee!</p>
          <button class="primary-btn" id="emptyCartExploreBtn">Browse Menu</button>
        </div>
      `;
      const exploreBtn = document.getElementById('emptyCartExploreBtn');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          toggleCartDrawer(false);
          const menuSec = document.getElementById('menu');
          if (menuSec) menuSec.scrollIntoView({ behavior: 'smooth' });
        });
      }
    } else {
      cartItemsList.innerHTML = cart.map((item, idx) => `
        <div class="cart-item-card" data-id="${item.id}">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <span class="cart-item-price">$ ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn dec-qty" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-count">${item.quantity}</span>
            <button class="qty-btn inc-qty" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-delete" data-id="${item.id}" aria-label="Remove item">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `).join('');

      // Attach item quantity handlers
      cartItemsList.querySelectorAll('.inc-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const it = cart.find(i => i.id === id);
          if (it) {
            it.quantity += 1;
            saveCart();
          }
        });
      });

      cartItemsList.querySelectorAll('.dec-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const it = cart.find(i => i.id === id);
          if (it) {
            if (it.quantity > 1) {
              it.quantity -= 1;
            } else {
              cart = cart.filter(i => i.id !== id);
            }
            saveCart();
          }
        });
      });

      cartItemsList.querySelectorAll('.cart-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          cart = cart.filter(i => i.id !== id);
          saveCart();
          showToast('Item removed from cart');
        });
      });
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  };

  // Cart Drawer open/close
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const drawerCartBtn = document.getElementById('drawerCartBtn');

  const toggleCartDrawer = (open) => {
    if (cartDrawer && cartBackdrop) {
      if (open) {
        cartDrawer.classList.add('active');
        cartBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        cartDrawer.classList.remove('active');
        cartBackdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  };

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
  if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCartDrawer(false));
  if (cartBackdrop) cartBackdrop.addEventListener('click', () => toggleCartDrawer(false));
  if (drawerCartBtn) {
    drawerCartBtn.addEventListener('click', () => {
      toggleMobileMenu(false);
      toggleCartDrawer(true);
    });
  }

  // ==========================================
  // 3. ADD TO CART BUTTONS ON LANDING PAGE
  // ==========================================
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productData = JSON.parse(e.currentTarget.getAttribute('data-product'));
      addToCart(productData);
    });
  });

  // ==========================================
  // 4. "SEE ALL PRODUCTS" MODAL & FILTERING
  // ==========================================
  const productsModal = document.getElementById('productsModal');
  const seeAllProductsBtn = document.getElementById('seeAllProductsBtn');
  const closeProductsModalBtn = document.getElementById('closeProductsModalBtn');
  const fullMenuGrid = document.getElementById('fullMenuGrid');

  const renderFullMenu = (filter = 'all') => {
    if (!fullMenuGrid) return;
    const filtered = filter === 'all' 
      ? fullCoffeeMenu 
      : fullCoffeeMenu.filter(item => item.category === filter);

    fullMenuGrid.innerHTML = filtered.map(item => `
      <div class="product-card" data-id="${item.id}">
        <div class="product-img-wrap" style="height: 160px;">
          <img src="${item.img}" alt="${item.name}" class="product-img" />
        </div>
        <div class="product-info" style="padding: 16px;">
          <h3 class="product-title" style="font-size: 1.05rem;">${item.name}</h3>
          <div class="product-rating" style="margin-bottom: 6px;">
            <span class="star-icon">⭐</span>
            <span class="rating-val">${item.rating}</span>
          </div>
          <p class="product-desc" style="font-size: 0.8rem; margin-bottom: 14px; min-height: 48px;">
            ${item.desc}
          </p>
          <div class="product-footer" style="padding-top: 10px;">
            <span class="product-price" style="font-size: 1.15rem;">$ ${item.price.toFixed(2)}</span>
            <button class="add-to-cart-btn modal-add-btn" data-product='${JSON.stringify(item)}'>
              <i data-lucide="shopping-cart"></i> Add
            </button>
          </div>
        </div>
      </div>
    `).join('');

    fullMenuGrid.querySelectorAll('.modal-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productData = JSON.parse(e.currentTarget.getAttribute('data-product'));
        addToCart(productData);
      });
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  };

  const toggleModal = (modalElement, show) => {
    if (!modalElement) return;
    if (show) {
      modalElement.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      modalElement.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (seeAllProductsBtn) {
    seeAllProductsBtn.addEventListener('click', () => {
      renderFullMenu('all');
      toggleModal(productsModal, true);
    });
  }

  if (closeProductsModalBtn) {
    closeProductsModalBtn.addEventListener('click', () => toggleModal(productsModal, false));
  }

  if (productsModal) {
    productsModal.addEventListener('click', (e) => {
      if (e.target === productsModal) toggleModal(productsModal, false);
    });
  }

  // Filter Tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const filter = e.currentTarget.getAttribute('data-filter');
      renderFullMenu(filter);
    });
  });

  // ==========================================
  // 5. "LEARN MORE" & PROFILE MODALS
  // ==========================================
  const learnMoreBtn = document.getElementById('learnMoreBtn');
  const aboutModal = document.getElementById('aboutModal');
  const closeAboutModalBtn = document.getElementById('closeAboutModalBtn');

  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', () => toggleModal(aboutModal, true));
  }
  if (closeAboutModalBtn) {
    closeAboutModalBtn.addEventListener('click', () => toggleModal(aboutModal, false));
  }
  if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) toggleModal(aboutModal, false);
    });
  }

  const profileBtn = document.getElementById('profileBtn');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const closeProfileModalDone = document.getElementById('closeProfileModalDone');

  if (profileBtn) {
    profileBtn.addEventListener('click', () => toggleModal(profileModal, true));
  }
  if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener('click', () => toggleModal(profileModal, false));
  }
  if (closeProfileModalDone) {
    closeProfileModalDone.addEventListener('click', () => toggleModal(profileModal, false));
  }
  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) toggleModal(profileModal, false);
    });
  }

  // ==========================================
  // 6. CHECKOUT PROCESS
  // ==========================================
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutSuccessModal = document.getElementById('checkoutSuccessModal');
  const checkoutReceipt = document.getElementById('checkoutReceipt');
  const closeCheckoutSuccessBtn = document.getElementById('closeCheckoutSuccessBtn');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Please add items to your cart first! ☕');
        return;
      }

      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.05;
      const total = subtotal + tax;

      if (checkoutReceipt) {
        checkoutReceipt.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 700;">
            <span>Order #NL-${orderNumber}</span>
            <span style="color: #0E9F6E;">Preparing</span>
          </div>
          <p style="color: #6B7280; font-size: 0.8rem; margin-bottom: 12px;">Estimated Pickup: ~12 mins</p>
          <div style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-bottom: 8px;">
            ${cart.map(i => `
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                <span>${i.quantity}x ${i.name}</span>
                <span>$ ${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; border-top: 1px dashed #D1D5DB; padding-top: 8px;">
            <span>Paid Total</span>
            <span style="color: #EAA023;">$ ${total.toFixed(2)}</span>
          </div>
        `;
      }

      toggleCartDrawer(false);
      toggleModal(checkoutSuccessModal, true);

      // Clear Cart
      cart = [];
      saveCart();
    });
  }

  if (closeCheckoutSuccessBtn) {
    closeCheckoutSuccessBtn.addEventListener('click', () => toggleModal(checkoutSuccessModal, false));
  }
  if (checkoutSuccessModal) {
    checkoutSuccessModal.addEventListener('click', (e) => {
      if (e.target === checkoutSuccessModal) toggleModal(checkoutSuccessModal, false);
    });
  }

  // ==========================================
  // 7. NEWSLETTER SUBSCRIPTION
  // ==========================================
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail ? newsletterEmail.value.trim() : '';
      if (email) {
        showToast(`🎉 Subscribed with ${email}! Check your inbox for 15% off code.`);
        if (newsletterEmail) newsletterEmail.value = '';
      }
    });
  }

  // ==========================================
  // 8. MOBILE DRAWER NAVIGATION
  // ==========================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerBackdrop = document.getElementById('drawerBackdrop');

  const toggleMobileMenu = (open) => {
    if (mobileDrawer && drawerBackdrop) {
      if (open) {
        mobileDrawer.classList.add('open');
        drawerBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        mobileDrawer.classList.remove('open');
        drawerBackdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  };

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => toggleMobileMenu(true));
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => toggleMobileMenu(false));
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => toggleMobileMenu(false));

  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // ==========================================
  // 9. NAVBAR SCROLL EFFECT & ACTIVE LINKS
  // ==========================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      if (navbar) navbar.classList.add('scrolled');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
    }
  });

  // Active Link Observer
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // 10. TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 3200);
  }

  // Initial cart rendering
  updateCartUI();
});
