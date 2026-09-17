// ============ D-LAMPE storefront app ============
const WHATSAPP_NUMBER = "919749011226";

function isFirebaseConfigured(){
  const c = window.FIREBASE_CONFIG;
  return !!(c && c.apiKey && c.projectId && c.apiKey.indexOf('REPLACE') === -1 && c.apiKey.indexOf('YOUR_') === -1);
}

function waLink(text){
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
}

function slug(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-'); }

function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1800);
}

// ---------------- Cart ----------------
let cart = {};
try{
  const saved = localStorage.getItem('dlampe_cart');
  if (saved) cart = JSON.parse(saved);
}catch(e){}
function saveCart(){ try{ localStorage.setItem('dlampe_cart', JSON.stringify(cart)); }catch(e){} }

let currentProducts = []; // flat array of {id,name,category,desc,specs,img}

function productById(id){
  return currentProducts.find(p => p.id === id) || null;
}

window.openCart = function(){
  document.getElementById('drawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
};
window.closeCart = function(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
};

function renderCart(){
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  const totalQty = ids.reduce((sum,id) => sum + cart[id], 0);

  const cartCount = document.getElementById('cartCount');
  const fabCart = document.getElementById('fabCart');
  const fabCount = document.getElementById('fabCount');
  const bnBadge = document.getElementById('bnCartBadge');

  if (totalQty > 0){
    cartCount.style.display = 'flex'; cartCount.textContent = totalQty;
    fabCart.style.display = 'flex'; fabCount.textContent = totalQty;
    bnBadge.style.display = 'flex'; bnBadge.textContent = totalQty;
  } else {
    cartCount.style.display = 'none';
    fabCart.style.display = 'none';
    bnBadge.style.display = 'none';
  }

  const drawerItems = document.getElementById('drawerItems');
  drawerItems.innerHTML = '';
  if (ids.length === 0){
    drawerItems.innerHTML = '<div class="drawer-empty">Your order list is empty.<br>Tap "+ Add" on any product to build a wholesale enquiry.</div>';
  } else {
    ids.forEach(id => {
      const p = productById(id);
      if(!p) return;
      const row = document.createElement('div');
      row.className = 'drawer-item';
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <h4>${p.name}</h4>
          <div class="qty-row">
            <button class="qty-dec">−</button>
            <span>${cart[id]}</span>
            <button class="qty-inc">+</button>
            <button class="remove-link">Remove</button>
          </div>
        </div>`;
      row.querySelector('.qty-inc').onclick = () => { cart[id]++; saveCart(); renderCart(); };
      row.querySelector('.qty-dec').onclick = () => { cart[id]--; if(cart[id] <= 0) delete cart[id]; saveCart(); renderCart(); };
      row.querySelector('.remove-link').onclick = () => { delete cart[id]; saveCart(); renderCart(); };
      drawerItems.appendChild(row);
    });
  }

  const lines = ["Hi D-LAMPE, I'd like to order the following (please confirm wholesale pricing):", ""];
  ids.forEach(id => { const p = productById(id); if(p) lines.push("• " + p.name + " x " + cart[id]); });
  lines.push("", "Please share rate & availability. Thank you!");
  document.getElementById('sendOrderBtn').href = waLink(lines.join("\n"));
}

// ---------------- Rendering products ----------------
function buildCard(p){
  const card = document.createElement('div');
  card.className = 'card';
  const specs = (p.specs || []).map(s => `<span class="spec-chip">${s}</span>`).join('');
  card.innerHTML = `
    <div class="card-img"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="card-body">
      <div class="card-cat">${p.category}</div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="spec-row">${specs}</div>
      <div class="price-note">Wholesale price on request</div>
      <div class="card-actions">
        <button class="add-btn" data-id="${p.id}">+ Add</button>
        <a class="wa-btn" target="_blank" rel="noopener" href="${waLink('Hi D-LAMPE, I would like to enquire about: ' + p.name)}">💬 Enquire</a>
      </div>
    </div>`;
  const addBtn = card.querySelector('.add-btn');
  addBtn.onclick = () => {
    cart[p.id] = (cart[p.id] || 0) + 1;
    saveCart(); renderCart();
    addBtn.textContent = 'Added ✓'; addBtn.classList.add('added');
    showToast(p.name + ' added to order');
    setTimeout(() => { addBtn.textContent = '+ Add'; addBtn.classList.remove('added'); }, 900);
  };
  return card;
}

function renderCatalogue(products){
  currentProducts = products;
  document.getElementById('productCountStat').textContent = products.length;

  const categories = [];
  products.forEach(p => { if (!categories.includes(p.category)) categories.push(p.category); });

  const catScroll = document.getElementById('catScroll');
  catScroll.innerHTML = '';
  const allPill = document.createElement('button');
  allPill.className = 'cat-pill active';
  allPill.textContent = 'All Products';
  allPill.onclick = () => { scrollToCat('all'); setActivePill(allPill); };
  catScroll.appendChild(allPill);
  categories.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = 'cat-pill';
    pill.textContent = cat;
    pill.onclick = () => { scrollToCat(cat); setActivePill(pill); };
    catScroll.appendChild(pill);
  });
  function setActivePill(active){
    catScroll.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    active.classList.add('active');
  }
  function scrollToCat(cat){
    const el = cat === 'all' ? document.getElementById('products') : document.getElementById('sec-' + slug(cat));
    if (el){
      const y = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({top:y, behavior:'smooth'});
    }
  }

  const container = document.getElementById('productSections');
  container.innerHTML = '';
  if (products.length === 0){
    container.innerHTML = '<p class="empty-note">No products yet — add some from the admin panel.</p>';
    return;
  }
  categories.forEach(cat => {
    const items = products.filter(p => p.category === cat);
    const section = document.createElement('section');
    section.id = 'sec-' + slug(cat);
    const titleDiv = document.createElement('div');
    titleDiv.className = 'section-title';
    titleDiv.innerHTML = `<h2>${cat}</h2><p>${items.length} item${items.length===1?'':'s'} · wholesale pricing on request</p>`;
    section.appendChild(titleDiv);
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    items.forEach(p => grid.appendChild(buildCard(p)));
    section.appendChild(grid);
    container.appendChild(section);
  });
}

// ---------------- Static assets (logo/banner) + WhatsApp links ----------------
function wireStaticStuff(){
  const images = window.STARTER_IMAGES || {};
  const logo = document.getElementById('logoImg');
  const banner = document.getElementById('bannerImg');
  if (logo && images.logo) logo.src = images.logo;
  if (banner && images.banner) banner.src = images.banner;

  const genericMsg = "Hi D-LAMPE, I'd like to know more about your products and wholesale pricing.";
  const link = waLink(genericMsg);
  ['waNavBtn','waHeroBtn','waContactLink'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = link;
  });
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ---------------- Data source: Firebase (live) or bundled starter data ----------------
async function boot(){
  wireStaticStuff();
  renderCart();

  if (isFirebaseConfigured()){
    try{
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
      const { getFirestore, collection, onSnapshot, query, orderBy } =
        await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");

      const app = initializeApp(window.FIREBASE_CONFIG);
      const db = getFirestore(app);
      const q = query(collection(db, "products"), orderBy("category"), orderBy("name"));

      onSnapshot(q, (snap) => {
        const products = [];
        snap.forEach(docSnap => {
          const d = docSnap.data();
          products.push({
            id: docSnap.id,
            name: d.name || 'Untitled product',
            category: d.category || 'Other',
            desc: d.desc || '',
            specs: Array.isArray(d.specs) ? d.specs : (d.specs ? String(d.specs).split(',').map(s=>s.trim()).filter(Boolean) : []),
            img: d.image || ''
          });
        });
        if (products.length > 0){
          renderCatalogue(products);
        } else {
          renderCatalogue(getStarterProducts());
        }
      }, (err) => {
        console.error('Firestore error, falling back to starter catalogue', err);
        renderCatalogue(getStarterProducts());
      });
      return;
    }catch(err){
      console.error('Firebase failed to load, using starter catalogue', err);
    }
  }
  renderCatalogue(getStarterProducts());
}

function getStarterProducts(){
  const raw = window.STARTER_PRODUCTS || [];
  const images = window.STARTER_IMAGES || {};
  return raw.map(p => ({
    id: p[0], name: p[1], category: p[2], desc: p[3], specs: p[4] || [], img: images[p[5]] || ''
  }));
}

boot();
