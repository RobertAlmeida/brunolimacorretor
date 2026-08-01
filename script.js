const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const toast = document.getElementById('toast');
const modal = document.getElementById('property-modal');

const WHATSAPP_NUMBER = '5511970467579';

const properties = {
  'jardim-tropical': {
    title: 'Jardim Tropical',
    place: 'Loteamento · Salto/SP',
    image: 'assets/jardim_tropical.png',
    alt: 'Logo do loteamento Jardim Tropical',
    fit: 'contain',
    description: 'Uma opção acessível para construir seu projeto em Salto. Fale com Bruno para consultar lotes disponíveis, condições e formas de pagamento.',
    specs: ['Lotes residenciais', 'Salto/SP', 'Consulte metragens', 'Condições facilitadas'],
    price: 'R$ 105.000,00'
  },
  'jardim-mirante': {
    title: 'Jardim Mirante',
    place: 'Em frente à Heineken',
    image: 'assets/Jardim Mirante.png',
    alt: 'Logo do loteamento Jardim Mirante',
    fit: 'contain',
    description: 'Lotes em uma das regiões mais promissoras da cidade, em frente à Heineken. Uma oportunidade para quem busca investir com segurança e potencial de valorização.',
    specs: ['Lotes residenciais', 'Região em crescimento', 'Potencial de valorização', 'Consulte condições'],
    price: 'R$ 170.000,00'
  },
  'ilha-de-malta': {
    title: 'Ilha de Malta',
    place: 'Itu/SP',
    image: 'assets/Ilha de Malta.webp',
    alt: 'Residencial Ilha de Malta',
    description: 'Ilha de Malta MRV: uma opção com ótimo custo-benefício na região e as vantagens do Programa Minha Casa Minha Vida.',
    specs: ['Apartamentos MRV', 'Minha Casa Minha Vida', 'Itu/SP', 'Bom custo-benefício'],
    price: 'R$ 210.000,00'
  },
  'parque-das-aguas': {
    title: 'Parque das Águas',
    place: 'Indaiatuba/SP',
    image: 'assets/parquedasaguasindaiatuba.png',
    alt: 'Residencial Parque das Águas em Indaiatuba',
    fit: 'contain',
    description: 'Um verdadeiro clube dentro de casa, com mais de 35 opções de lazer, plantas personalizáveis e entrada facilitada pelo Minha Casa Minha Vida.',
    specs: ['2 dormitórios', 'Opção de suíte', 'Varanda gourmet', '35+ opções de lazer'],
    price: 'R$ 287.612,57'
  },
  'estacao-real': {
    title: 'Estação Real',
    place: 'Itu/SP',
    image: 'assets/estacaoreal.png',
    alt: 'Estação Real Garden Club',
    fit: 'contain',
    description: 'Uma oportunidade residencial em Itu. Entre em contato para consultar plantas, unidades disponíveis e condições atualizadas.',
    specs: ['Apartamentos', 'Itu/SP', 'Consulte plantas', 'Consulte condições'],
    price: 'R$ 391.800,00'
  },
  'bella-roma': {
    title: 'Bella Roma',
    place: 'Lançamento · Itu/SP',
    image: 'assets/bellaroma.png',
    alt: 'Bella Roma Residencial',
    fit: 'contain',
    description: 'Cadastre-se para o lançamento do Bella Roma. Apartamentos de 2 a 3 dormitórios com suíte em Itu.',
    specs: ['2 a 3 dormitórios', 'Com suíte', 'Lançamento', 'Cadastro antecipado'],
    price: 'R$ 200.000,00'
  },
  'maxim-home-clube': {
    title: 'Máxim Home Clube',
    place: 'Parque N. Sra. Aparecida · Itu/SP',
    image: 'assets/maxim.png',
    alt: 'Máxim Home Clube',
    fit: 'contain',
    description: 'Última fase: apartamentos de 2 e 3 dormitórios com suíte e mais de 30 itens de lazer para toda a família, atrás do UPA.',
    specs: ['2 e 3 dormitórios', 'Com suíte', '30+ itens de lazer', 'Última fase'],
    price: 'R$ 252.900,00'
  },
  'bella-verona': {
    title: 'Bella Verona',
    place: 'Parque N. Sra. Candelária · Itu/SP',
    image: 'assets/belaverona.png',
    alt: 'Bella Verona Residencial',
    fit: 'contain',
    description: 'Apartamentos de 42 e 44 m², com 2 dormitórios, varanda e lazer completo. Entrada facilitada em até 60 vezes pelo Minha Casa Minha Vida.',
    specs: ['42 e 44 m²', '2 dormitórios', 'Com varanda', 'Entrada em até 60x'],
    price: 'R$ 211.400,00'
  }
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
};

const closeMenu = () => {
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
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

// Garante que links diretos para seções mantenham a posição após o carregamento das imagens.
if (window.location.hash) {
  window.setTimeout(() => {
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    target.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
    const behavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, target.offsetTop);
    window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = behavior;
    });
  }, 250);
}

document.getElementById('year').textContent = new Date().getFullYear();

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
    const filter = button.dataset.filter;
    document.querySelectorAll('.property-card').forEach((card) => {
      const categories = card.dataset.category.split(' ');
      const visible = filter === 'todos' || categories.includes(filter);
      card.classList.toggle('hidden', !visible);
    });
  });
});

document.querySelectorAll('.favorite').forEach((button) => {
  button.addEventListener('click', () => {
    const propertyId = button.closest('.property-card')?.querySelector('.property-open')?.dataset.property;
    const property = properties[propertyId];
    if (!property) return;
    const message = encodeURIComponent(`Olá, Bruno! Vi o imóvel ${property.title} no site e gostaria de receber mais informações.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
    showToast(`Abrindo o WhatsApp para falar sobre ${property.title}…`);
  });
});

const openProperty = (id) => {
  const property = properties[id];
  if (!property || !modal) return;
  modal.querySelector('.modal-image img').src = property.image;
  modal.querySelector('.modal-image img').alt = property.alt;
  modal.querySelector('.modal-image').classList.toggle('is-contain', property.fit === 'contain');
  modal.querySelector('.modal-place').textContent = property.place;
  modal.querySelector('.modal-title').textContent = property.title;
  modal.querySelector('.modal-description').textContent = property.description;
  modal.querySelector('.modal-specs').innerHTML = property.specs.map((spec) => `<span>${spec}</span>`).join('');
  modal.querySelector('.modal-price').textContent = property.price;
  const message = encodeURIComponent(`Olá, Bruno! Tenho interesse no imóvel ${property.title}. Gostaria de receber mais informações.`);
  modal.querySelector('.modal-whatsapp').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  modal.querySelector('.modal-whatsapp').target = '_blank';
  modal.showModal();
  document.body.classList.add('modal-open');
};

document.querySelectorAll('.property-open').forEach((button) => {
  button.addEventListener('click', () => openProperty(button.dataset.property));
});

const closeModal = () => {
  modal?.close();
  document.body.classList.remove('modal-open');
};
modal?.querySelector('.modal-close').addEventListener('click', closeModal);
modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});
modal?.addEventListener('cancel', () => document.body.classList.remove('modal-open'));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) closeMenu();
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
