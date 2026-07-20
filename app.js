(function () {
  'use strict';

  /* ============ CLAVES DE ALMACENAMIENTO LOCAL ============ */
  const LS_USERS = 'elstock_users';
  const LS_SESSION = 'elstock_session';
  const LS_ARTICULOS = 'elstock_articulos';

  /* ============ HELPERS DE ALMACENAMIENTO ============ */
  const storage = {
    getUsers: () => JSON.parse(localStorage.getItem(LS_USERS) || '[]'),
    saveUsers: (users) => localStorage.setItem(LS_USERS, JSON.stringify(users)),
    getSession: () => JSON.parse(localStorage.getItem(LS_SESSION) || 'null'),
    saveSession: (session) => localStorage.setItem(LS_SESSION, JSON.stringify(session)),
    clearSession: () => localStorage.removeItem(LS_SESSION),
    getArticulos: () => JSON.parse(localStorage.getItem(LS_ARTICULOS) || '[]'),
    saveArticulos: (arts) => localStorage.setItem(LS_ARTICULOS, JSON.stringify(arts)),
  };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ============ ESTADO ============ */
  let currentUser = null;

  /* ============ NAVEGACIÓN ============ */
  const screens = {
    landing: document.getElementById('screen-landing'),
    login: document.getElementById('screen-login'),
    register: document.getElementById('screen-register'),
    home: document.getElementById('screen-home'),
    sell: document.getElementById('screen-sell'),
    catalog: document.getElementById('screen-catalog'),
    mine: document.getElementById('screen-mine'),
  };
  const appHeader = document.getElementById('app-header');
  const bottomNav = document.getElementById('bottom-nav');
  const headerUsername = document.getElementById('header-username');

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle('hidden', key !== name);
    });
    document.querySelectorAll('.nav-btn[data-navkey]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.navkey === name);
    });
    window.scrollTo(0, 0);

    if (name === 'home') renderHome();
    if (name === 'catalog') renderCatalog();
    if (name === 'mine') renderMine();
    if (name === 'sell') resetSellForm();
  }

  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) {
      e.preventDefault();
      const target = navBtn.dataset.nav;
      if (['home', 'sell', 'catalog', 'mine'].includes(target) && !currentUser) {
        showScreen('login');
        return;
      }
      showScreen(target);
    }
  });

  /* ============ AUTENTICACIÓN ============ */
  function updateAuthUI() {
    const loggedIn = !!currentUser;
    appHeader.classList.toggle('hidden', !loggedIn);
    bottomNav.classList.toggle('hidden', !loggedIn);
    document.body.style.paddingBottom = loggedIn ? '0' : '0';
    if (loggedIn) headerUsername.textContent = currentUser.nombre;
  }

  function login(email, password) {
    const users = storage.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    return user || null;
  }

  function register({ nombre, email, telefono, password }) {
    const users = storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Ya existe una cuenta registrada con ese email.' };
    }
    const newUser = { id: uid(), nombre, email, telefono, password };
    users.push(newUser);
    storage.saveUsers(users);
    return { user: newUser };
  }

  function startSession(user) {
    currentUser = user;
    storage.saveSession({ userId: user.id });
    updateAuthUI();
    showScreen('home');
  }

  function restoreSession() {
    const session = storage.getSession();
    if (!session) return;
    const users = storage.getUsers();
    const user = users.find((u) => u.id === session.userId);
    if (user) {
      currentUser = user;
      updateAuthUI();
      showScreen('home');
    } else {
      storage.clearSession();
    }
  }

  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email').trim();
    const password = fd.get('password');
    const errorEl = document.getElementById('login-error');
    const user = login(email, password);
    if (!user) {
      errorEl.textContent = 'Email o contraseña incorrectos.';
      return;
    }
    errorEl.textContent = '';
    e.target.reset();
    startSession(user);
  });

  document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const errorEl = document.getElementById('register-error');
    const payload = {
      nombre: fd.get('nombre').trim(),
      email: fd.get('email').trim(),
      telefono: fd.get('telefono').trim(),
      password: fd.get('password'),
    };
    const result = register(payload);
    if (result.error) {
      errorEl.textContent = result.error;
      return;
    }
    errorEl.textContent = '';
    e.target.reset();
    startSession(result.user);
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    currentUser = null;
    storage.clearSession();
    updateAuthUI();
    showScreen('landing');
  });

  /* ============ HOME ============ */
  function renderHome() {
    document.getElementById('greeting-text').textContent = `¡Hola, ${currentUser.nombre}!`;
    const articulos = storage.getArticulos();
    const mine = articulos.filter((a) => a.vendedorId === currentUser.id);
    document.getElementById('stat-mine').textContent = mine.length;
    document.getElementById('stat-total').textContent = articulos.length;
  }

  /* ============ VENDER (formulario) ============ */
  const formSell = document.getElementById('form-sell');
  const inputImagen = document.getElementById('input-imagen');
  const imagePreview = document.getElementById('image-preview');
  let pendingImageDataUrl = '';

  inputImagen.addEventListener('change', () => {
    const file = inputImagen.files[0];
    if (!file) {
      pendingImageDataUrl = '';
      imagePreview.innerHTML = '<span class="image-preview__placeholder">Sin imagen seleccionada</span>';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      pendingImageDataUrl = reader.result;
      imagePreview.innerHTML = `<img src="${pendingImageDataUrl}" alt="Vista previa">`;
    };
    reader.readAsDataURL(file);
  });

  function resetSellForm() {
    formSell.reset();
    pendingImageDataUrl = '';
    imagePreview.innerHTML = '<span class="image-preview__placeholder">Sin imagen seleccionada</span>';
    document.getElementById('sell-error').textContent = '';
    if (currentUser && !formSell.contacto.value) {
      formSell.contacto.value = currentUser.telefono || '';
    }
  }

  formSell.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(formSell);
    const errorEl = document.getElementById('sell-error');

    if (!pendingImageDataUrl) {
      errorEl.textContent = 'Subí una foto del repuesto.';
      return;
    }
    const estado = fd.get('estado');
    if (!estado) {
      errorEl.textContent = 'Seleccioná el estado del repuesto.';
      return;
    }

    const articulo = {
      id: uid(),
      tipo: fd.get('tipo'),
      marcaModelo: fd.get('marcaModelo').trim(),
      estado,
      precio: Number(fd.get('precio')),
      imagen: pendingImageDataUrl,
      detalles: fd.get('detalles').trim(),
      contacto: fd.get('contacto').trim(),
      vendedorId: currentUser.id,
      vendedorNombre: currentUser.nombre,
      fecha: new Date().toISOString(),
    };

    const articulos = storage.getArticulos();
    articulos.unshift(articulo);
    storage.saveArticulos(articulos);

    errorEl.textContent = '';
    showToast('¡Repuesto publicado en el catálogo!');
    showScreen('mine');
  });

  /* ============ CATÁLOGO ============ */
  const TIPOS_REPUESTO = [
    'Paragolpes', 'Capot', 'Puerta', 'Guardabarros', 'Espejo',
    'Óptica delantera', 'Óptica trasera', 'Parabrisas / Vidrio', 'Zócalo / Umbral',
    'Baúl / Portón trasero', 'Motor', 'Caja de cambios', 'Embrague', 'Alternador',
    'Batería', 'Amortiguador', 'Freno / Pastillas', 'Rueda / Llanta',
    'Tapizado / Interior', 'Escape', 'Radiador', 'Otro',
  ];
  (function populateFilterTipo() {
    const select = document.getElementById('filter-tipo');
    TIPOS_REPUESTO.forEach((tipo) => {
      const opt = document.createElement('option');
      opt.value = tipo;
      opt.textContent = tipo;
      select.appendChild(opt);
    });
  })();

  const catalogGrid = document.getElementById('catalog-grid');
  const catalogEmpty = document.getElementById('catalog-empty');
  const filterSearch = document.getElementById('filter-search');
  const filterTipo = document.getElementById('filter-tipo');
  const filterEstado = document.getElementById('filter-estado');

  function formatPrecio(n) {
    return '$' + Number(n).toLocaleString('es-AR');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function buildPartCard(art, { owner = false } = {}) {
    const card = document.createElement('div');
    card.className = 'part-card';
    card.innerHTML = `
      <img class="part-card__img" src="${art.imagen}" alt="${escapeHtml(art.tipo)}">
      <div class="part-card__body">
        <span class="part-card__tipo">${escapeHtml(art.tipo)}</span>
        <span class="part-card__modelo">${escapeHtml(art.marcaModelo)}</span>
        <div class="part-card__bottom">
          <span class="part-card__precio">${formatPrecio(art.precio)}</span>
          <span class="badge ${art.estado === 'Nuevo' ? 'badge--nuevo' : 'badge--usado'}">${art.estado}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openDetail(art));

    if (owner) {
      const actions = document.createElement('div');
      actions.className = 'part-card__owner-actions';
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.textContent = 'Eliminar publicación';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteArticulo(art.id);
      });
      actions.appendChild(delBtn);
      card.appendChild(actions);
    }
    return card;
  }

  function renderCatalog() {
    const articulos = storage.getArticulos();
    const search = filterSearch.value.trim().toLowerCase();
    const tipo = filterTipo.value;
    const estado = filterEstado.value;

    const filtered = articulos.filter((a) => {
      const matchSearch = !search || a.marcaModelo.toLowerCase().includes(search) || a.tipo.toLowerCase().includes(search);
      const matchTipo = !tipo || a.tipo === tipo;
      const matchEstado = !estado || a.estado === estado;
      return matchSearch && matchTipo && matchEstado;
    });

    catalogGrid.innerHTML = '';
    catalogEmpty.classList.toggle('hidden', filtered.length > 0);
    filtered.forEach((art) => catalogGrid.appendChild(buildPartCard(art)));
  }

  [filterSearch, filterTipo, filterEstado].forEach((el) => {
    el.addEventListener('input', renderCatalog);
    el.addEventListener('change', renderCatalog);
  });

  /* ============ MIS PUBLICACIONES ============ */
  const mineGrid = document.getElementById('mine-grid');
  const mineEmpty = document.getElementById('mine-empty');

  function renderMine() {
    const articulos = storage.getArticulos().filter((a) => a.vendedorId === currentUser.id);
    mineGrid.innerHTML = '';
    mineEmpty.classList.toggle('hidden', articulos.length > 0);
    articulos.forEach((art) => mineGrid.appendChild(buildPartCard(art, { owner: true })));
  }

  function deleteArticulo(id) {
    const articulos = storage.getArticulos().filter((a) => a.id !== id);
    storage.saveArticulos(articulos);
    renderMine();
    showToast('Publicación eliminada.');
  }

  /* ============ MODAL DE DETALLE ============ */
  const detailModal = document.getElementById('detail-modal');
  const detailBody = document.getElementById('detail-body');

  function openDetail(art) {
    const detallesHtml = art.detalles
      ? `<div class="detail-extra">
           <span class="detail-extra__label">Información adicional del vendedor</span>
           <p>${escapeHtml(art.detalles)}</p>
         </div>`
      : '';
    detailBody.innerHTML = `
      <img class="detail-img" src="${art.imagen}" alt="${escapeHtml(art.tipo)}">
      <span class="badge ${art.estado === 'Nuevo' ? 'badge--nuevo' : 'badge--usado'}">${art.estado}</span>
      <h2 style="margin-top:10px;">${escapeHtml(art.tipo)}</h2>
      <div class="detail-price">${formatPrecio(art.precio)}</div>
      <div class="detail-row"><span>Compatible con</span><span>${escapeHtml(art.marcaModelo)}</span></div>
      <div class="detail-row"><span>Vendedor</span><span>${escapeHtml(art.vendedorNombre)}</span></div>
      <div class="detail-row"><span>Contacto</span><span>${escapeHtml(art.contacto)}</span></div>
      ${detallesHtml}
      <a class="btn btn--primary btn--lg btn--block detail-contact-btn" target="_blank" rel="noopener"
         href="https://wa.me/${art.contacto.replace(/\D/g, '')}">Contactar por WhatsApp</a>
    `;
    detailModal.classList.remove('hidden');
  }

  document.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => detailModal.classList.add('hidden'));
  });

  /* ============ TOAST ============ */
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2400);
  }

  /* ============ INIT ============ */
  updateAuthUI();
  restoreSession();
})();
