// ============ D-LAMPE admin app ============

function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2000);
}

function isFirebaseConfigured(){
  const c = window.FIREBASE_CONFIG;
  return !!(c && c.apiKey && c.projectId && c.apiKey.indexOf('REPLACE') === -1 && c.apiKey.indexOf('YOUR_') === -1);
}

document.getElementById('logoImg').src = (window.STARTER_IMAGES && window.STARTER_IMAGES.logo) || '';

if (!isFirebaseConfigured()){
  document.getElementById('configWarning').style.display = 'block';
} else {
  initAdmin();
}

async function initAdmin(){
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
  const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } =
    await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js");
  const { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, getDocs, writeBatch, serverTimestamp } =
    await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");

  const app = initializeApp(window.FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  loginScreen.style.display = 'flex';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try{
      await signInWithEmailAndPassword(auth, email, password);
    }catch(err){
      loginError.textContent = friendlyAuthError(err);
      loginError.style.display = 'block';
    }
  });

  function friendlyAuthError(err){
    const code = err && err.code || '';
    if (code.includes('user-not-found') || code.includes('invalid-credential') || code.includes('wrong-password')) {
      return "Incorrect email or password.";
    }
    if (code.includes('too-many-requests')) return "Too many attempts — please wait a moment and try again.";
    return "Couldn't sign in. Please check your details and try again.";
  }

  document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

  let products = []; // {id, name, category, desc, specs, image}
  let editingId = null;
  let pendingImageData = null;

  onAuthStateChanged(auth, (user) => {
    if (user){
      loginScreen.style.display = 'none';
      dashboard.style.display = 'block';
      watchProducts();
    } else {
      loginScreen.style.display = 'flex';
      dashboard.style.display = 'none';
    }
  });

  function watchProducts(){
    const q = query(collection(db, "products"), orderBy("category"), orderBy("name"));
    onSnapshot(q, (snap) => {
      products = [];
      snap.forEach(d => products.push({ id: d.id, ...d.data() }));
      renderTable();
    });
  }

  function renderTable(){
    const tbody = document.getElementById('productTableBody');
    const emptyState = document.getElementById('emptyState');
    const countLabel = document.getElementById('productCountLabel');
    countLabel.textContent = products.length + ' product' + (products.length===1?'':'s') + ' in your live catalogue';

    tbody.innerHTML = '';
    emptyState.style.display = products.length === 0 ? 'block' : 'none';

    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const catList = document.getElementById('categoryOptions');
    catList.innerHTML = cats.map(c => `<option value="${c}">`).join('');

    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${p.image || ''}" alt=""></td>
        <td class="cell-name">${escapeHtml(p.name||'')}</td>
        <td class="cell-cat">${escapeHtml(p.category||'')}</td>
        <td style="max-width:280px;color:var(--text-soft);">${escapeHtml((p.desc||'').slice(0,90))}${(p.desc||'').length>90?'…':''}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm edit-btn">Edit</button>
            <button class="btn btn-danger btn-sm del-btn">Delete</button>
          </div>
        </td>`;
      tr.querySelector('.edit-btn').onclick = () => openModal(p);
      tr.querySelector('.del-btn').onclick = () => deleteProduct(p);
      tbody.appendChild(tr);
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  async function deleteProduct(p){
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try{
      await deleteDoc(doc(db, "products", p.id));
      showToast('Product deleted');
    }catch(err){
      alert('Could not delete: ' + err.message);
    }
  }

  // ---------------- Modal (Add / Edit) ----------------
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const productForm = document.getElementById('productForm');
  const imgPreview = document.getElementById('imgPreview');
  const imgInput = document.getElementById('imgInput');
  const formError = document.getElementById('formError');

  function openModal(product){
    editingId = product ? product.id : null;
    pendingImageData = product ? (product.image || null) : null;
    modalTitle.textContent = product ? 'Edit Product' : 'Add Product';
    document.getElementById('fName').value = product ? product.name || '' : '';
    document.getElementById('fCategory').value = product ? product.category || '' : '';
    document.getElementById('fDesc').value = product ? product.desc || '' : '';
    document.getElementById('fSpecs').value = product ? (Array.isArray(product.specs) ? product.specs.join(', ') : (product.specs||'')) : '';
    imgInput.value = '';
    formError.style.display = 'none';
    updateImgPreview();
    modalOverlay.classList.add('open');
  }
  function closeModal(){
    modalOverlay.classList.remove('open');
    editingId = null;
    pendingImageData = null;
  }
  document.getElementById('addProductBtn').addEventListener('click', () => openModal(null));
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function updateImgPreview(){
    if (pendingImageData){
      imgPreview.classList.remove('empty');
      imgPreview.innerHTML = `<img src="${pendingImageData}" alt="">`;
    } else {
      imgPreview.classList.add('empty');
      imgPreview.textContent = 'No image selected';
    }
  }

  imgInput.addEventListener('change', async () => {
    const file = imgInput.files[0];
    if (!file) return;
    try{
      pendingImageData = await compressImageToDataUrl(file, 700, 0.72);
      updateImgPreview();
    }catch(err){
      alert('Could not process that image: ' + err.message);
    }
  });

  function compressImageToDataUrl(file, maxDim, quality){
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.style.display = 'none';
    const name = document.getElementById('fName').value.trim();
    const category = document.getElementById('fCategory').value.trim();
    const desc = document.getElementById('fDesc').value.trim();
    const specs = document.getElementById('fSpecs').value.split(',').map(s => s.trim()).filter(Boolean);

    if (!name || !category || !desc){
      formError.textContent = 'Please fill in name, category and description.';
      formError.style.display = 'block';
      return;
    }

    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try{
      const payload = {
        name, category, desc, specs,
        image: pendingImageData || '',
        updatedAt: serverTimestamp()
      };
      if (editingId){
        await updateDoc(doc(db, "products", editingId), payload);
        showToast('Product updated');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "products"), payload);
        showToast('Product added');
      }
      closeModal();
    }catch(err){
      formError.textContent = 'Could not save: ' + err.message;
      formError.style.display = 'block';
    }finally{
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Product';
    }
  });

  // ---------------- Seed starter catalogue ----------------
  const starterRaw = window.STARTER_PRODUCTS || [];
  const starterImages = window.STARTER_IMAGES || {};
  document.getElementById('seedCount').textContent = starterRaw.length;

  document.getElementById('seedBtn').addEventListener('click', async () => {
    if (products.length > 0){
      const ok = confirm(`You already have ${products.length} product(s) in your catalogue. Load the ${starterRaw.length} starter products anyway? (existing products won't be deleted)`);
      if (!ok) return;
    } else {
      const ok = confirm(`Load the ${starterRaw.length} starter D-LAMPE products into your live catalogue?`);
      if (!ok) return;
    }
    const seedBtn = document.getElementById('seedBtn');
    seedBtn.disabled = true;
    seedBtn.textContent = 'Loading…';
    try{
      const batchSize = 400; // Firestore batch limit is 500
      for (let i = 0; i < starterRaw.length; i += batchSize){
        const batch = writeBatch(db);
        const slice = starterRaw.slice(i, i + batchSize);
        slice.forEach(p => {
          const [id, name, category, desc, specs, imgKey] = p;
          const ref = doc(collection(db, "products"));
          batch.set(ref, {
            name, category, desc, specs,
            image: starterImages[imgKey] || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      }
      showToast('Starter catalogue loaded!');
    }catch(err){
      alert('Could not load starter catalogue: ' + err.message);
    }finally{
      seedBtn.disabled = false;
      seedBtn.textContent = 'Load Starter Catalogue';
    }
  });
}
