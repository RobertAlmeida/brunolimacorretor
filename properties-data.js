(function () {
  const COLLECTION = 'properties';
  const LEGACY_STORAGE_KEY = 'bruno-lima-imoveis-catalogo-v1';

  const defaults = [
    {
      id: 'jardim-tropical', title: 'Jardim Tropical', place: 'Loteamento · Salto/SP',
      categories: ['lote'], badge: 'Loteamento', price: 'R$ 105.000,00',
      description: 'Uma opção acessível para construir seu projeto em Salto. Fale com Bruno para consultar lotes disponíveis, condições e formas de pagamento.',
      specs: ['Lotes residenciais', 'Salto/SP', 'Consulte metragens', 'Condições facilitadas'],
      images: [{ src: 'assets/jardim_tropical.png', alt: 'Logo do loteamento Jardim Tropical' }], fit: 'contain'
    },
    {
      id: 'jardim-mirante', title: 'Jardim Mirante', place: 'Em frente à Heineken',
      categories: ['lote'], badge: 'Investimento', price: 'R$ 170.000,00',
      description: 'Lotes em uma das regiões mais promissoras da cidade, em frente à Heineken. Uma oportunidade para quem busca investir com segurança e potencial de valorização.',
      specs: ['Lotes residenciais', 'Região em crescimento', 'Potencial de valorização', 'Consulte condições'],
      images: [{ src: 'assets/Jardim Mirante.png', alt: 'Logo do loteamento Jardim Mirante' }], fit: 'contain'
    },
    {
      id: 'ilha-de-malta', title: 'Ilha de Malta', place: 'Itu · São Paulo',
      categories: ['apartamento'], badge: 'Minha Casa Minha Vida', price: 'R$ 210.000,00',
      description: 'Ilha de Malta MRV: uma opção com ótimo custo-benefício na região e as vantagens do Programa Minha Casa Minha Vida.',
      specs: ['Apartamentos MRV', 'Minha Casa Minha Vida', 'Itu/SP', 'Bom custo-benefício'],
      images: [{ src: 'assets/Ilha de Malta.webp', alt: 'Residencial Ilha de Malta em Itu' }], fit: 'cover'
    },
    {
      id: 'parque-das-aguas', title: 'Parque das Águas', place: 'Indaiatuba · São Paulo',
      categories: ['apartamento'], badge: 'Clube completo', price: 'R$ 287.612,57',
      description: 'Um verdadeiro clube dentro de casa, com mais de 35 opções de lazer, plantas personalizáveis e entrada facilitada pelo Minha Casa Minha Vida.',
      specs: ['2 dormitórios', 'Opção de suíte', 'Varanda gourmet', '35+ opções de lazer'],
      images: [{ src: 'assets/parquedasaguasindaiatuba.png', alt: 'Residencial Parque das Águas em Indaiatuba' }], fit: 'contain'
    },
    {
      id: 'estacao-real', title: 'Estação Real', place: 'Itu · São Paulo',
      categories: ['apartamento'], badge: 'Oportunidade', price: 'R$ 391.800,00',
      description: 'Uma oportunidade residencial em Itu. Entre em contato para consultar plantas, unidades disponíveis e condições atualizadas.',
      specs: ['Apartamentos', 'Itu/SP', 'Consulte plantas', 'Consulte condições'],
      images: [{ src: 'assets/estacaoreal.png', alt: 'Estação Real Garden Club em Itu' }], fit: 'contain'
    },
    {
      id: 'bella-roma', title: 'Bella Roma', place: 'Lançamento · Itu/SP',
      categories: ['apartamento', 'lancamento'], badge: 'Cadastre-se', price: 'R$ 200.000,00',
      description: 'Cadastre-se para o lançamento do Bella Roma. Apartamentos de 2 a 3 dormitórios com suíte em Itu.',
      specs: ['2 a 3 dormitórios', 'Com suíte', 'Lançamento', 'Cadastro antecipado'],
      images: [{ src: 'assets/bellaroma.png', alt: 'Bella Roma Residencial em Itu' }], fit: 'contain'
    },
    {
      id: 'maxim-home-clube', title: 'Máxim Home Clube', place: 'Parque N. Sra. Aparecida · Itu/SP',
      categories: ['apartamento', 'lancamento'], badge: 'Última fase', price: 'R$ 252.900,00',
      description: 'Última fase: apartamentos de 2 e 3 dormitórios com suíte e mais de 30 itens de lazer para toda a família, atrás do UPA.',
      specs: ['2 e 3 dormitórios', 'Com suíte', '30+ itens de lazer', 'Última fase'],
      images: [{ src: 'assets/maxim.png', alt: 'Máxim Home Clube em Itu' }], fit: 'contain'
    },
    {
      id: 'bella-verona', title: 'Bella Verona', place: 'Parque N. Sra. Candelária · Itu/SP',
      categories: ['apartamento', 'lancamento'], badge: 'Minha Casa Minha Vida', price: 'R$ 211.400,00',
      description: 'Apartamentos de 42 e 44 m², com 2 dormitórios, varanda e lazer completo. Entrada facilitada em até 60 vezes pelo Minha Casa Minha Vida.',
      specs: ['42 e 44 m²', '2 dormitórios', 'Com varanda', 'Entrada em até 60x'],
      images: [{ src: 'assets/belaverona.png', alt: 'Bella Verona Residencial em Itu' }], fit: 'contain'
    }
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalize = (property) => ({
    id: property.id,
    title: property.title || '',
    place: property.place || '',
    price: property.price || '',
    badge: property.badge || 'Imóvel',
    description: property.description || '',
    categories: Array.isArray(property.categories) && property.categories.length ? property.categories : ['apartamento'],
    specs: Array.isArray(property.specs) ? property.specs.filter(Boolean) : [],
    images: Array.isArray(property.images) ? property.images.filter((image) => image && image.src) : [],
    fit: property.fit === 'contain' ? 'contain' : 'cover'
  });

  const database = () => firebase.firestore();

  const loadLegacyCatalog = () => {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      return Array.isArray(parsed) && parsed.length ? parsed.map(normalize) : clone(defaults);
    } catch (error) {
      console.warn('Não foi possível migrar o catálogo local anterior.', error);
      return clone(defaults);
    }
  };

  const load = async () => {
    const snapshot = await database().collection(COLLECTION).get();
    if (snapshot.empty) {
      const initialCatalog = loadLegacyCatalog();
      return save(initialCatalog);
    }
    const loaded = await Promise.all(snapshot.docs.map(async (document) => {
      const data = document.data();
      const imagesSnapshot = await document.ref.collection('images').get();
      const storedImages = imagesSnapshot.docs
        .map((imageDocument) => imageDocument.data())
        .sort((a, b) => a.position - b.position)
        .map(({ src, alt }) => ({ src, alt }));
      return {
        ...normalize({ id: document.id, ...data, images: storedImages.length ? storedImages : data.images }),
        position: data.position ?? 9999
      };
    }));
    return loaded
      .sort((a, b) => a.position - b.position)
      .map(({ position, ...property }) => property);
  };

  const save = async (properties) => {
    const prepared = properties.map(normalize);

    const collection = database().collection(COLLECTION);
    const current = await collection.get();
    const ids = new Set(prepared.map((property) => property.id));
    const batch = database().batch();
    const removedDocuments = current.docs.filter((document) => !ids.has(document.id));
    prepared.forEach((property, position) => {
      const { id, images, ...data } = property;
      batch.set(collection.doc(id), {
        ...data,
        position,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();

    for (const document of removedDocuments) {
      const imagesSnapshot = await document.ref.collection('images').get();
      await Promise.all(imagesSnapshot.docs.map((imageDocument) => imageDocument.ref.delete()));
      await document.ref.delete();
    }

    for (const property of prepared) {
      const imagesCollection = collection.doc(property.id).collection('images');
      const existingImages = await imagesCollection.get();
      const currentImageIds = new Set(
        property.images.map((image, position) => `image-${String(position).padStart(3, '0')}`)
      );
      const imageWrites = existingImages.docs
        .filter((imageDocument) => !currentImageIds.has(imageDocument.id))
        .map((imageDocument) => imageDocument.ref.delete());
      property.images.forEach((image, position) => {
        imageWrites.push(imagesCollection.doc(`image-${String(position).padStart(3, '0')}`).set({
          src: image.src,
          alt: image.alt || property.title,
          position
        }));
      });
      await Promise.all(imageWrites);
    }

    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return prepared;
  };

  window.PropertyCatalog = { defaults: clone(defaults), load, save, clone };
})();
