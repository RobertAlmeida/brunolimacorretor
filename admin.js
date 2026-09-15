const ACCESS_PASSWORD = 'bruno';
const SESSION_KEY = 'bruno-lima-admin-authenticated';

const loginScreen = document.getElementById('login-screen');
const adminShell = document.getElementById('admin-shell');
const loginForm = document.getElementById('login-form');
const propertyForm = document.getElementById('property-form');
const editorEmpty = document.getElementById('editor-empty');
const propertyList = document.getElementById('property-list');
const toast = document.getElementById('admin-toast');

let properties = [];
let catalogPromise = null;
let activeId = null;
let editingImages = [];

const loadCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = window.PropertyCatalog.load().then((catalog) => {
      properties = catalog;
      return catalog;
    });
  }
  return catalogPromise;
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
};

const showAdmin = async () => {
  loginScreen.hidden = true;
  adminShell.hidden = false;
  document.getElementById('catalog-count').textContent = 'Carregando imóveis…';
  try {
    await loadCatalog();
    renderList();
  } catch (error) {
    console.error('Erro ao carregar imóveis do Firebase:', error);
    document.getElementById('catalog-count').textContent = 'Não foi possível carregar os imóveis.';
    showToast('Falha ao conectar ao Firebase.');
  }
};

const showLogin = () => {
  adminShell.hidden = true;
  loginScreen.hidden = false;
  loginForm.reset();
  document.getElementById('password').focus();
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get('password');
  if (password !== ACCESS_PASSWORD) {
    document.getElementById('login-error').textContent = 'Senha incorreta. Tente novamente.';
    document.getElementById('password').select();
    return;
  }
  document.getElementById('login-error').textContent = '';
  sessionStorage.setItem(SESSION_KEY, 'true');
  await showAdmin();
});

document.getElementById('toggle-password').addEventListener('click', (event) => {
  const input = document.getElementById('password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  event.currentTarget.textContent = show ? 'Ocultar' : 'Mostrar';
  event.currentTarget.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
});

document.getElementById('logout-button').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  activeId = null;
  closeEditor();
  showLogin();
});

const firstImage = (property) => property.images?.[0]?.src || 'assets/hero-moradia-v2.webp';

function renderList() {
  document.getElementById('catalog-count').textContent = `${properties.length} ${properties.length === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'}`;
  if (!properties.length) {
    propertyList.innerHTML = '<p class="catalog-count">O catálogo está vazio. Adicione o primeiro imóvel.</p>';
    return;
  }
  propertyList.innerHTML = properties.map((property) => `
    <button class="admin-property ${property.id === activeId ? 'active' : ''}" type="button" data-id="${escapeHtml(property.id)}">
      <img class="${property.fit === 'contain' ? 'contain' : ''}" src="${escapeHtml(firstImage(property))}" alt="" />
      <span><strong>${escapeHtml(property.title)}</strong><small>${escapeHtml(property.place)} · ${escapeHtml(property.price)}</small></span>
      <span>→</span>
    </button>`).join('');
}

propertyList.addEventListener('click', (event) => {
  const item = event.target.closest('[data-id]');
  if (item) openEditor(item.dataset.id);
});

const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `imovel-${Date.now()}`;

const uniqueId = (title) => {
  const base = slugify(title);
  let id = base;
  let suffix = 2;
  while (properties.some((property) => property.id === id)) id = `${base}-${suffix++}`;
  return id;
};

const closeEditor = () => {
  propertyForm.hidden = true;
  editorEmpty.hidden = false;
  activeId = null;
  editingImages = [];
  renderList();
};

const openEditor = (id = null) => {
  activeId = id;
  const property = id ? properties.find((item) => item.id === id) : null;
  propertyForm.reset();
  editingImages = window.PropertyCatalog.clone(property?.images || []);
  editorEmpty.hidden = true;
  propertyForm.hidden = false;
  document.getElementById('form-mode').textContent = property ? 'Editando imóvel' : 'Novo imóvel';
  document.getElementById('form-title').textContent = property ? property.title : 'Adicionar imóvel';
  document.getElementById('delete-property').hidden = !property;
  document.getElementById('form-error').textContent = '';
  document.getElementById('upload-status').textContent = '';

  if (property) {
    propertyForm.elements.title.value = property.title;
    propertyForm.elements.place.value = property.place;
    propertyForm.elements.price.value = property.price;
    propertyForm.elements.badge.value = property.badge || '';
    propertyForm.elements.fit.value = property.fit;
    propertyForm.elements.description.value = property.description;
    propertyForm.elements.specs.value = property.specs.join(', ');
    propertyForm.querySelectorAll('[name="categories"]').forEach((checkbox) => {
      checkbox.checked = property.categories.includes(checkbox.value);
    });
  }
  renderImages();
  renderList();
  if (window.innerWidth < 851) propertyForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

document.getElementById('new-property').addEventListener('click', () => openEditor());
document.getElementById('cancel-edit').addEventListener('click', closeEditor);

const renderImages = () => {
  const list = document.getElementById('image-list');
  if (!editingImages.length) {
    list.innerHTML = '<p class="catalog-count">Nenhuma imagem adicionada.</p>';
    return;
  }
  list.innerHTML = editingImages.map((image, index) => `
    <div class="image-item ${index === 0 ? 'is-cover' : ''}">
      ${index === 0 ? '<span class="cover-label">Capa</span>' : ''}
      <img src="${escapeHtml(image.src)}" alt="Prévia da imagem ${index + 1}" />
      <div class="image-item-actions">
        ${index === 0 ? '<span></span>' : `<button type="button" data-cover="${index}">Usar como capa</button>`}
        <button class="remove-image" type="button" data-remove="${index}">Remover</button>
      </div>
    </div>`).join('');
};

document.getElementById('image-list').addEventListener('click', (event) => {
  const coverButton = event.target.closest('[data-cover]');
  const removeButton = event.target.closest('[data-remove]');
  if (coverButton) {
    const [image] = editingImages.splice(Number(coverButton.dataset.cover), 1);
    editingImages.unshift(image);
    renderImages();
  }
  if (removeButton) {
    editingImages.splice(Number(removeButton.dataset.remove), 1);
    renderImages();
  }
});

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(`Não foi possível ler ${file.name}.`));
  reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('A imagem selecionada não pôde ser processada.'));
  image.src = src;
});

const compressImage = async (file) => {
  const original = await readFile(file);
  const image = await loadImage(original);
  const maxSize = 1400;
  const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const compressed = canvas.toDataURL('image/webp', 0.8);
  return compressed.length < original.length ? compressed : original;
};

document.getElementById('image-files').addEventListener('change', async (event) => {
  const files = [...event.target.files];
  if (!files.length) return;
  const status = document.getElementById('upload-status');
  status.textContent = `Processando ${files.length} ${files.length === 1 ? 'imagem' : 'imagens'}…`;
  try {
    for (const file of files) {
      const src = await compressImage(file);
      editingImages.push({ src, alt: propertyForm.elements.title.value || file.name.replace(/\.[^.]+$/, '') });
    }
    renderImages();
    status.textContent = 'Imagens prontas para salvar.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    event.target.value = '';
  }
});

document.getElementById('add-image-url').addEventListener('click', () => {
  const input = document.getElementById('image-url');
  try {
    const url = new URL(input.value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    editingImages.push({ src: url.href, alt: propertyForm.elements.title.value || 'Imagem do imóvel' });
    input.value = '';
    document.getElementById('upload-status').textContent = 'URL adicionada. Salve as alterações para publicar.';
    renderImages();
  } catch (error) {
    document.getElementById('upload-status').textContent = 'Informe uma URL válida começando com http:// ou https://.';
  }
});

const persist = async () => {
  try {
    properties = await window.PropertyCatalog.save(properties);
    return true;
  } catch (error) {
    console.error('Erro ao salvar no Firebase:', error);
    const permissionDenied = error?.code === 'permission-denied' || error?.code === 'storage/unauthorized';
    document.getElementById('form-error').textContent = permissionDenied
      ? 'O Firebase recusou a gravação. Verifique as regras do Firestore e do Storage.'
      : 'Não foi possível salvar no Firebase. Verifique sua conexão e tente novamente.';
    return false;
  }
};

propertyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(propertyForm);
  const categories = data.getAll('categories');
  const error = document.getElementById('form-error');
  error.textContent = '';
  if (!categories.length) {
    error.textContent = 'Selecione pelo menos uma categoria.';
    return;
  }
  if (!editingImages.length) {
    error.textContent = 'Adicione pelo menos uma imagem ao imóvel.';
    return;
  }
  const previous = activeId ? properties.find((item) => item.id === activeId) : null;
  const title = data.get('title').trim();
  const property = {
    id: previous?.id || uniqueId(title),
    title,
    place: data.get('place').trim(),
    price: data.get('price').trim(),
    badge: data.get('badge').trim() || 'Imóvel',
    fit: data.get('fit'),
    categories,
    description: data.get('description').trim(),
    specs: data.get('specs').split(',').map((item) => item.trim()).filter(Boolean),
    images: editingImages.map((image) => ({ ...image, alt: image.alt || title }))
  };

  if (previous) properties[properties.findIndex((item) => item.id === activeId)] = property;
  else properties.push(property);
  const submitButton = propertyForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  submitButton.firstChild.textContent = 'Salvando… ';
  if (!await persist()) {
    submitButton.disabled = false;
    submitButton.firstChild.textContent = 'Salvar alterações ';
    return;
  }
  submitButton.disabled = false;
  submitButton.firstChild.textContent = 'Salvar alterações ';
  activeId = property.id;
  renderList();
  openEditor(property.id);
  showToast(previous ? 'Imóvel atualizado com sucesso.' : 'Imóvel adicionado com sucesso.');
});

document.getElementById('delete-property').addEventListener('click', async () => {
  const property = properties.find((item) => item.id === activeId);
  if (!property || !window.confirm(`Remover “${property.title}” do catálogo? Esta ação não pode ser desfeita.`)) return;
  const backup = properties;
  properties = properties.filter((item) => item.id !== activeId);
  if (!await persist()) { properties = backup; return; }
  closeEditor();
  showToast('Imóvel removido do catálogo.');
});

if (sessionStorage.getItem(SESSION_KEY) === 'true') void showAdmin();
else showLogin();
