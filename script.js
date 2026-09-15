const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const toast = document.getElementById('toast');
const modal = document.getElementById('property-modal');
const propertyGrid = document.querySelector('.property-grid');
const WHATSAPP_NUMBER = '5511970467579';

let properties = window.PropertyCatalog.clone(window.PropertyCatalog.defaults);
let activeFilter = 'todos';
let modalProperty = null;
let modalImageIndex = 0;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
};

const propertyImage = (property) => property.images?.[0] || {
  src: 'assets/hero-moradia-v2.webp', alt: property.title
};

const renderProperties = () => {
  if (!propertyGrid) return;
  const visibleProperties = properties.filter((property) => (
    activeFilter === 'todos' || property.categories.includes(activeFilter)
  ));

  if (!visibleProperties.length) {
    propertyGrid.innerHTML = '<p class="property-empty">Nenhum imóvel nesta categoria no momento.</p>';
    return;
  }

  propertyGrid.innerHTML = visibleProperties.map((property) => {
    const originalIndex = properties.findIndex((item) => item.id === property.id);
    const image = propertyImage(property);
    const specs = property.specs.slice(0, 3).map(escapeHtml).join(' <span></span> ');
    return `
      <article class="property-card visible" id="${escapeHtml(property.id)}" data-category="${property.categories.map(escapeHtml).join(' ')}">
        <div class="property-media ${property.fit === 'contain' ? 'brand-art art-light' : ''}">
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || property.title)}" loading="lazy" decoding="async" />
          <span class="property-badge">${escapeHtml(property.badge || 'Imóvel')}</span>
          <button class="favorite" type="button" data-action="whatsapp" data-property="${escapeHtml(property.id)}" aria-label="Consultar ${escapeHtml(property.title)} pelo WhatsApp">♡</button>
          <span class="property-count">${String(originalIndex + 1).padStart(2, '0')} / ${String(properties.length).padStart(2, '0')}</span>
        </div>
        <div class="property-info">
          <div>
            <p class="property-place">${escapeHtml(property.place)}</p>
            <h3>${escapeHtml(property.title)}</h3>
            <p class="property-specs">${specs}</p>
          </div>
          <div class="property-price">
            <small>A partir de</small><strong>${escapeHtml(property.price)}</strong>
            <button class="property-open" type="button" data-action="details" data-property="${escapeHtml(property.id)}">Ver detalhes <span>↗</span></button>
          </div>
        </div>
      </article>`;
  }).join('');
};

const closeMenu = () => {
  nav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Abrir menu');
};

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (window.location.hash) {
  window.setTimeout(() => {
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    target.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
    const behavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, target.offsetTop);
    window.requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = behavior; });
  }, 250);
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    renderProperties();
  });
});

const updateModalImage = () => {
  if (!modalProperty || !modal) return;
  const images = modalProperty.images?.length ? modalProperty.images : [propertyImage(modalProperty)];
  modalImageIndex = (modalImageIndex + images.length) % images.length;
  const image = images[modalImageIndex];
  const imageElement = modal.querySelector('.modal-image img');
  imageElement.src = image.src;
  imageElement.alt = image.alt || modalProperty.title;
  modal.querySelector('.modal-gallery-count').textContent = images.length > 1 ? `${modalImageIndex + 1} / ${images.length}` : '';
  modal.querySelector('.modal-gallery-prev').hidden = images.length < 2;
  modal.querySelector('.modal-gallery-next').hidden = images.length < 2;
};

const openProperty = (id) => {
  const property = properties.find((item) => item.id === id);
  if (!property || !modal) return;
  modalProperty = property;
  modalImageIndex = 0;
  modal.querySelector('.modal-image').classList.toggle('is-contain', property.fit === 'contain');
  modal.querySelector('.modal-place').textContent = property.place;
  modal.querySelector('.modal-title').textContent = property.title;
  modal.querySelector('.modal-description').textContent = property.description;
  modal.querySelector('.modal-specs').innerHTML = property.specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join('');
  modal.querySelector('.modal-price').textContent = property.price;
  const message = encodeURIComponent(`Olá, Bruno! Tenho interesse no imóvel ${property.title}. Gostaria de receber mais informações.`);
  const whatsapp = modal.querySelector('.modal-whatsapp');
  whatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  whatsapp.target = '_blank';
  updateModalImage();
  modal.showModal();
  document.body.classList.add('modal-open');
};

propertyGrid?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const property = properties.find((item) => item.id === button.dataset.property);
  if (!property) return;
  if (button.dataset.action === 'details') {
    openProperty(property.id);
    return;
  }
  const message = encodeURIComponent(`Olá, Bruno! Vi o imóvel ${property.title} no site e gostaria de receber mais informações.`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  showToast(`Abrindo o WhatsApp para falar sobre ${property.title}…`);
});

const closeModal = () => {
  modal?.close();
  document.body.classList.remove('modal-open');
};
modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
modal?.querySelector('.modal-gallery-prev')?.addEventListener('click', () => { modalImageIndex -= 1; updateModalImage(); });
modal?.querySelector('.modal-gallery-next')?.addEventListener('click', () => { modalImageIndex += 1; updateModalImage(); });
modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
modal?.addEventListener('cancel', () => document.body.classList.remove('modal-open'));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) closeMenu();
  if (!modal?.open) return;
  if (event.key === 'ArrowLeft') { modalImageIndex -= 1; updateModalImage(); }
  if (event.key === 'ArrowRight') { modalImageIndex += 1; updateModalImage(); }
});

document.getElementById('contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = [
    `Olá, Bruno! Meu nome é ${data.get('nome')}.`,
    `Tenho interesse em: ${data.get('interesse')}.`,
    data.get('mensagem') ? `Mensagem: ${data.get('mensagem')}` : '',
    `Telefone: ${data.get('telefone')} | E-mail: ${data.get('email')}`
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  showToast('Abrindo uma conversa segura no WhatsApp…');
});

renderProperties();
window.PropertyCatalog.load()
  .then((catalog) => {
    properties = catalog;
    renderProperties();
  })
  .catch((error) => {
    console.error('Não foi possível carregar os imóveis do Firebase:', error);
    showToast('Catálogo temporariamente indisponível. Exibindo imóveis em destaque.');
  });
