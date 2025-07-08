// src/data/realEstateData.js

const properties = [
  // ========== APARTAMENTOS PARA VENDA (15) ==========
  {
    id: 1,
    code: 'APV001',
    type: 'apartment',
    transaction: 'sale',
    title: 'Cobertura Duplex Vista Mar - Jurerê Internacional',
    address: 'Av. dos Búzios, 1500 - Jurerê Internacional, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Jurerê Internacional',
    price: 2000000,
    area: 280,
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    parking: 4,
    floor: '15º e 16º',
    description: 'Espetacular cobertura duplex com vista panorâmica para o mar. Acabamento de altíssimo padrão, com mármore importado, automação completa e terraço gourmet privativo com piscina aquecida.',
    features: [
      'Vista mar frontal',
      'Piscina privativa aquecida',
      'Churrasqueira e forno de pizza',
      'Adega climatizada',
      'Home theater',
      'Closet master',
      'Escritório',
      'Dependência completa',
      'Lareira',
      'Ar condicionado central'
    ],
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=SxQL3iGyvQk',
    location: { lat: -27.4376, lng: -48.4506 },
    highlights: {
      beachDistance: '200m da praia',
      sunlight: 'Sol da manhã',
      view: 'Vista mar panorâmica'
    }
  },
  {
    id: 2,
    code: 'APV002',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Garden - Lagoa da Conceição',
    address: 'Rua Afonso Delambert, 320 - Lagoa da Conceição, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Lagoa da Conceição',
    price: 850000,
    area: 120,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parking: 2,
    floor: 'Térreo',
    description: 'Lindo apartamento garden em condomínio fechado próximo à Lagoa. Jardim privativo de 80m², perfeito para pets. Localização privilegiada com fácil acesso a restaurantes e comércio.',
    features: [
      'Jardim privativo 80m²',
      'Pet friendly',
      'Churrasqueira no jardim',
      'Portaria 24h',
      'Salão de festas',
      'Playground',
      'Quadra esportiva',
      'Próximo ao Centrinho da Lagoa'
    ],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=ZmYzNjE2MDUt',
    location: { lat: -27.6032, lng: -48.4729 }
  },
  {
    id: 3,
    code: 'APV003',
    type: 'apartment',
    transaction: 'sale',
    title: 'Studio Moderno - Centro',
    address: 'Rua Felipe Schmidt, 505 - Centro, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Centro',
    price: 400000,
    area: 45,
    bedrooms: 1,
    suites: 0,
    bathrooms: 1,
    parking: 1,
    floor: '8º',
    description: 'Studio completamente mobiliado e decorado, ideal para investimento ou moradia. Excelente localização no coração da cidade, próximo a tudo.',
    features: [
      'Totalmente mobiliado',
      'Varanda',
      'Academia',
      'Coworking',
      'Lavanderia',
      'Próximo ao terminal',
      'Vista cidade'
    ],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5969, lng: -48.5495 }
  },
  {
    id: 4,
    code: 'APV004',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Frente Mar - Canasvieiras',
    address: 'Av. das Nações, 800 - Canasvieiras, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Canasvieiras',
    price: 1200000,
    area: 150,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parking: 2,
    floor: '3º',
    description: 'Apartamento de frente para o mar em Canasvieiras. Ampla sacada gourmet com vista deslumbrante. Prédio com infraestrutura completa de lazer.',
    features: [
      'Frente mar',
      'Sacada gourmet',
      'Piscina aquecida',
      'Spa',
      'Sauna',
      'Sala de jogos',
      'Cinema',
      'Espaço gourmet'
    ],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=YmI3MjQ1MzAt',
    location: { lat: -27.4262, lng: -48.4505 }
  },
  {
    id: 5,
    code: 'APV005',
    type: 'apartment',
    transaction: 'sale',
    title: 'Penthouse - Beira Mar Norte',
    address: 'Av. Beira Mar Norte, 2500 - Agronômica, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Agronômica',
    price: 1800000,
    area: 220,
    bedrooms: 4,
    suites: 3,
    bathrooms: 4,
    parking: 3,
    floor: '20º',
    description: 'Penthouse luxuoso com vista privilegiada da Baía Norte. Terraço de 100m² com piscina privativa. Projeto de interiores assinado.',
    features: [
      'Terraço 100m²',
      'Piscina privativa',
      'Vista Baía Norte',
      'Decorado',
      'Smart home',
      'Energia solar',
      'Vagas demarcadas',
      'Depósito privativo'
    ],
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=NjY5MjM0MWQt',
    location: { lat: -27.5906, lng: -48.5380 }
  },
  {
    id: 6,
    code: 'APV006',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Novo - Campeche',
    address: 'Rua Pequeno Príncipe, 450 - Campeche, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Campeche',
    price: 750000,
    area: 90,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parking: 2,
    floor: '5º',
    description: 'Apartamento novo, nunca habitado, em condomínio moderno no Campeche. A 800m da praia, com excelente infraestrutura de lazer.',
    features: [
      'Novo/Na planta',
      'Porcelanato',
      'Gesso rebaixado',
      'Preparação ar condicionado',
      'Piscina adulto e infantil',
      'Quadra poliesportiva',
      'Brinquedoteca',
      'Bicicletário'
    ],
    images: [
      'https://images.unsplash.com/photo-1560185127-6a86e55cbedf?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.6786, lng: -48.4877 }
  },
  {
    id: 7,
    code: 'APV007',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Vista Lagoa - Canto da Lagoa',
    address: 'Servidão da Capela, 200 - Canto da Lagoa, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Canto da Lagoa',
    price: 680000,
    area: 85,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parking: 1,
    floor: '2º',
    description: 'Charmoso apartamento com vista para a Lagoa da Conceição. Ambiente tranquilo e arborizado, perfeito para quem busca qualidade de vida.',
    features: [
      'Vista Lagoa',
      'Varanda ampla',
      'Área verde',
      'Trilhas ecológicas',
      'Segurança',
      'Garagem coberta',
      'Depósito'
    ],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5806, lng: -48.4673 }
  },
  {
    id: 8,
    code: 'APV008',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Duplex - Itacorubi',
    address: 'Rua Amaro Antônio Vieira, 2300 - Itacorubi, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Itacorubi',
    price: 950000,
    area: 140,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parking: 2,
    floor: '10º e 11º',
    description: 'Duplex moderno em excelente localização no Itacorubi. Próximo a empresas de tecnologia, universidades e shopping.',
    features: [
      'Duplex',
      'Sacada gourmet',
      'Vista cidade',
      'Lazer completo',
      'Próximo UFSC',
      'Próximo shopping',
      'Fácil acesso BR-101'
    ],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5879, lng: -48.5041 }
  },
  {
    id: 9,
    code: 'APV009',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Compacto - Trindade',
    address: 'Rua Lauro Linhares, 1000 - Trindade, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Trindade',
    price: 420000,
    area: 55,
    bedrooms: 2,
    suites: 0,
    bathrooms: 1,
    parking: 1,
    floor: '4º',
    description: 'Apartamento ideal para investimento, próximo à UFSC. Ótima rentabilidade com aluguel para estudantes.',
    features: [
      'Próximo UFSC',
      'Boa rentabilidade',
      'Comércio local',
      'Transporte público',
      'Segurança'
    ],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5998, lng: -48.5185 }
  },
  {
    id: 10,
    code: 'APV010',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Alto Padrão - Balneário Camboriú Centro',
    address: 'Av. Atlântica, 3000 - Centro, Balneário Camboriú',
    city: 'Balneário Camboriú',
    neighborhood: 'Centro',
    price: 1500000,
    area: 180,
    bedrooms: 3,
    suites: 3,
    bathrooms: 4,
    parking: 3,
    floor: '15º',
    description: 'Apartamento de alto padrão na principal avenida de Balneário Camboriú. Vista mar lateral, a 100m da praia.',
    features: [
      'Vista mar lateral',
      '100m da praia',
      'Varanda gourmet',
      'Lazer completo',
      'Vaga para jet ski',
      'Depósito',
      'Serviço de praia'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=ODQ3NjU0MzIt',
    location: { lat: -26.9906, lng: -48.6347 }
  },
  {
    id: 11,
    code: 'APV011',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Vista Mar - Praia Brava Itajaí',
    address: 'Rua José Honorato da Silva, 500 - Praia Brava, Itajaí',
    city: 'Itajaí',
    neighborhood: 'Praia Brava',
    price: 980000,
    area: 130,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parking: 2,
    floor: '7º',
    description: 'Apartamento com vista privilegiada do mar na Praia Brava. Condomínio com infraestrutura resort.',
    features: [
      'Vista mar frontal',
      'Condomínio resort',
      'Piscinas aquecidas',
      'Beach club',
      'Restaurante',
      'Kids club',
      'Spa'
    ],
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800'
    ],
    virtualTour: null,
    location: { lat: -26.9517, lng: -48.6295 }
  },
  {
    id: 12,
    code: 'APV012',
    type: 'apartment',
    transaction: 'sale',
    title: 'Cobertura Linear - Ingleses',
    address: 'Rua das Gaivotas, 1200 - Ingleses, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Ingleses',
    price: 1100000,
    area: 160,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parking: 2,
    floor: 'Cobertura',
    description: 'Cobertura linear com amplo terraço e vista para o mar dos Ingleses. Churrasqueira privativa e jacuzzi.',
    features: [
      'Cobertura linear',
      'Vista mar',
      'Terraço 60m²',
      'Jacuzzi',
      'Churrasqueira privativa',
      'Praia dos Ingleses',
      'Elevador'
    ],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.4333, lng: -48.3987 }
  },
  {
    id: 13,
    code: 'APV013',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Novo - João Paulo',
    address: 'Rua João Paulo, 850 - João Paulo, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'João Paulo',
    price: 580000,
    area: 75,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parking: 1,
    floor: '3º',
    description: 'Apartamento novo em bairro nobre, próximo ao mangue do Itacorubi. Excelente para famílias.',
    features: [
      'Prédio novo',
      'Área preservada',
      'Playground',
      'Salão de festas',
      'Portaria 24h',
      'Garagem coberta'
    ],
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5707, lng: -48.5134 }
  },
  {
    id: 14,
    code: 'APV014',
    type: 'apartment',
    transaction: 'sale',
    title: 'Apartamento Térreo - Cacupé',
    address: 'Rua Desembargador Pedro Silva, 400 - Cacupé, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Cacupé',
    price: 720000,
    area: 95,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parking: 2,
    floor: 'Térreo',
    description: 'Apartamento térreo com quintal privativo, ideal para pets. Vista para o mar da Baía Norte.',
    features: [
      'Térreo com quintal',
      'Pet friendly',
      'Vista mar',
      'Churrasqueira privativa',
      'Próximo à praia',
      'Segurança'
    ],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5015, lng: -48.4587 }
  },
  {
    id: 15,
    code: 'APV015',
    type: 'apartment',
    transaction: 'sale',
    title: 'Studio Luxo - Barra Sul BC',
    address: 'Av. Brasil, 1500 - Barra Sul, Balneário Camboriú',
    city: 'Balneário Camboriú',
    neighborhood: 'Barra Sul',
    price: 550000,
    area: 50,
    bedrooms: 1,
    suites: 1,
    bathrooms: 1,
    parking: 1,
    floor: '12º',
    description: 'Studio de luxo totalmente mobiliado no melhor ponto da Barra Sul. Ideal para temporada.',
    features: [
      'Mobiliado alto padrão',
      'Vista mar',
      'Serviços hoteleiros',
      'Rooftop',
      'Academia',
      'Piscina infinita',
      'Concierge'
    ],
    images: [
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.0158, lng: -48.6591 }
  },

  // ========== CASAS PARA VENDA (8) ==========
  {
    id: 16,
    code: 'CSV001',
    type: 'house',
    transaction: 'sale',
    title: 'Mansão Frente Mar - Jurerê Internacional',
    address: 'Alameda César Nascimento, 100 - Jurerê Internacional, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Jurerê Internacional',
    price: 8500000,
    area: 650,
    bedrooms: 6,
    suites: 6,
    bathrooms: 8,
    parking: 6,
    floor: null,
    description: 'Mansão espetacular de frente para o mar em Jurerê Internacional. Projeto arquitetônico premiado, com materiais nobres importados. Pé na areia com deck privativo.',
    features: [
      'Frente mar/Pé na areia',
      'Piscina aquecida com raia',
      'Home theater',
      'Adega para 500 garrafas',
      'Elevador',
      'Spa privativo',
      'Quadra de tênis',
      'Heliponto',
      'Casa de hóspedes',
      'Energia solar'
    ],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=ZmE4YjY1NjQt',
    location: { lat: -27.4362, lng: -48.4488 }
  },
  {
    id: 17,
    code: 'CSV002',
    type: 'house',
    transaction: 'sale',
    title: 'Casa em Condomínio - Santo Antônio de Lisboa',
    address: 'Rua XV de Novembro, 3000 - Santo Antônio de Lisboa, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Santo Antônio de Lisboa',
    price: 1650000,
    area: 320,
    bedrooms: 4,
    suites: 3,
    bathrooms: 4,
    parking: 3,
    floor: null,
    description: 'Casa em condomínio fechado no charmoso Santo Antônio de Lisboa. Vista para o mar, pier privativo e por do sol espetacular.',
    features: [
      'Vista mar',
      'Pier privativo',
      'Condomínio fechado',
      'Área gourmet completa',
      'Piscina',
      'Jardim',
      'Depósito náutico',
      'Segurança 24h'
    ],
    images: [
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5089, lng: -48.5297 }
  },
  {
    id: 18,
    code: 'CSV003',
    type: 'house',
    transaction: 'sale',
    title: 'Casa Contemporânea - Lagoa da Conceição',
    address: 'Rua das Rendeiras, 500 - Lagoa da Conceição, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Lagoa da Conceição',
    price: 2200000,
    area: 380,
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    parking: 4,
    floor: null,
    description: 'Casa contemporânea com design arrojado e vista para a Lagoa. Integração total com a natureza, grandes vãos e iluminação natural.',
    features: [
      'Vista Lagoa',
      'Arquitetura contemporânea',
      'Piscina com borda infinita',
      'Deck sobre a lagoa',
      'Sistema smart home',
      'Painéis solares',
      'Paisagismo Burle Marx',
      'Garagem para barco'
    ],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    virtualTour: 'https://my.matterport.com/show/?m=YTU0MzI5ODAt',
    location: { lat: -27.6047, lng: -48.4659 }
  },
  {
    id: 19,
    code: 'CSV004',
    type: 'house',
    transaction: 'sale',
    title: 'Casa Colonial - Sambaqui',
    address: 'Rua do Sambaqui, 800 - Sambaqui, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Sambaqui',
    price: 1200000,
    area: 280,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parking: 2,
    floor: null,
    description: 'Charmosa casa em estilo colonial no tradicional bairro do Sambaqui. Amplo terreno arborizado com árvores frutíferas.',
    features: [
      'Estilo colonial',
      'Terreno 1000m²',
      'Árvores frutíferas',
      'Churrasqueira',
      'Forno a lenha',
      'Poço artesiano',
      'Vista parcial mar',
      'Rua tranquila'
    ],
    images: [
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.4846, lng: -48.5323 }
  },
  {
    id: 20,
    code: 'CSV005',
    type: 'house',
    transaction: 'sale',
    title: 'Casa Moderna - Campeche',
    address: 'Rua João de Barro, 200 - Campeche, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Campeche',
    price: 980000,
    area: 200,
    bedrooms: 3,
    suites: 1,
    bathrooms: 3,
    parking: 2,
    floor: null,
    description: 'Casa moderna recém construída no Campeche. Projeto sustentável com captação de água da chuva e energia solar.',
    features: [
      'Construção nova',
      'Sustentável',
      'Energia solar',
      'Captação água chuva',
      'Piscina',
      'Próximo à praia',
      'Acabamento premium'
    ],
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.6819, lng: -48.4981 }
  },
  {
    id: 21,
    code: 'CSV006',
    type: 'house',
    transaction: 'sale',
    title: 'Casa Térrea - Rio Vermelho',
    address: 'Estrada Geral do Rio Vermelho, 1500 - Rio Vermelho, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Rio Vermelho',
    price: 750000,
    area: 180,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parking: 3,
    floor: null,
    description: 'Casa térrea em amplo terreno no Rio Vermelho. Ideal para quem busca tranquilidade e contato com a natureza.',
    features: [
      'Terreno 2000m²',
      'Mata nativa',
      'Riacho no terreno',
      'Horta orgânica',
      'Galinheiro',
      'Churrasqueira',
      'Fogão a lenha'
    ],
    images: [
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5276, lng: -48.3871 }
  },
  {
    id: 22,
    code: 'CSV007',
    type: 'house',
    transaction: 'sale',
    title: 'Sobrado Alto Padrão - Itacorubi',
    address: 'Rua Deputado Antônio Edu Vieira, 1000 - Itacorubi, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Itacorubi',
    price: 1350000,
    area: 250,
    bedrooms: 4,
    suites: 2,
    bathrooms: 4,
    parking: 3,
    floor: null,
    description: 'Sobrado de alto padrão em rua tranquila do Itacorubi. Excelente localização próxima a colégios e universidades.',
    features: [
      'Alto padrão',
      'Escritório',
      'Sala íntima',
      'Lavabo',
      'Despensa',
      'Área de serviço coberta',
      'Jardim zen',
      'Sistema de segurança'
    ],
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5754, lng: -48.5070 }
  },
  {
    id: 23,
    code: 'CSV008',
    type: 'house',
    transaction: 'sale',
    title: 'Casa Pé na Areia - Ponta das Canas',
    address: 'Rua Deserta, 50 - Ponta das Canas, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Ponta das Canas',
    price: 2800000,
    area: 300,
    bedrooms: 5,
    suites: 3,
    bathrooms: 4,
    parking: 4,
    floor: null,
    description: 'Casa pé na areia em Ponta das Canas. Acesso direto à praia, ideal para veraneio ou locação temporada.',
    features: [
      'Pé na areia',
      'Acesso direto praia',
      'Churrasqueira vista mar',
      'Ducha externa',
      'Varanda panorâmica',
      'Mobiliada',
      'Ar condicionado todos quartos',
      'Ótima rentabilidade temporada'
    ],
    images: [
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.3954, lng: -48.4294 }
  },

  // ========== APARTAMENTOS PARA ALUGUEL (4) ==========
  {
    id: 24,
    code: 'APA001',
    type: 'apartment',
    transaction: 'rent',
    title: 'Apartamento Mobiliado - Centro',
    address: 'Rua Tenente Silveira, 200 - Centro, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Centro',
    price: 2800,
    area: 70,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parking: 1,
    floor: '6º',
    description: 'Apartamento completamente mobiliado no centro da cidade. Inclui condomínio e IPTU. Ideal para executivos.',
    features: [
      'Totalmente mobiliado',
      'Condomínio incluso',
      'IPTU incluso',
      'Internet fibra',
      'Portaria 24h',
      'Próximo comércio',
      'Pet friendly'
    ],
    images: [
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5954, lng: -48.5480 },
    availableFrom: '2024-02-01'
  },
  {
    id: 25,
    code: 'APA002',
    type: 'apartment',
    transaction: 'rent',
    title: 'Cobertura Temporada - Jurerê',
    address: 'Alameda das Acácias, 500 - Jurerê Internacional, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Jurerê Internacional',
    price: 1500, // por diária
    area: 200,
    bedrooms: 4,
    suites: 3,
    bathrooms: 4,
    parking: 2,
    floor: 'Cobertura',
    description: 'Cobertura luxuosa para temporada em Jurerê. Mínimo 7 dias. Vista mar, piscina privativa.',
    features: [
      'Temporada',
      'Vista mar',
      'Piscina privativa',
      'Churrasqueira',
      'Mobiliada luxo',
      'Roupa cama/banho',
      'Serviço limpeza',
      'Mínimo 7 dias'
    ],
    images: [
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.4373, lng: -48.4519 },
    rentType: 'season',
    minimumStay: 7
  },
  {
    id: 26,
    code: 'APA003',
    type: 'apartment',
    transaction: 'rent',
    title: 'Studio Próximo UFSC - Trindade',
    address: 'Rua Delfino Conti, 450 - Trindade, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Trindade',
    price: 2200,
    area: 35,
    bedrooms: 1,
    suites: 0,
    bathrooms: 1,
    parking: 0,
    floor: '3º',
    description: 'Studio mobiliado próximo à UFSC. Perfeito para estudantes. Tudo incluso.',
    features: [
      'Mobiliado',
      'Condomínio incluso',
      'Água inclusa',
      'Internet inclusa',
      'Próximo UFSC',
      'Lavanderia compartilhada',
      'Sem vaga garagem'
    ],
    images: [
      'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.6019, lng: -48.5229 }
  },
  {
    id: 27,
    code: 'APA004',
    type: 'apartment',
    transaction: 'rent',
    title: 'Apartamento Vista Mar - Beira Mar Norte',
    address: 'Av. Beira Mar Norte, 3500 - Agronômica, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Agronômica',
    price: 5500,
    area: 120,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parking: 2,
    floor: '10º',
    description: 'Apartamento com vista espetacular da Baía Norte. Semi-mobiliado, com ar condicionado em todos ambientes.',
    features: [
      'Vista mar',
      'Semi-mobiliado',
      'Ar condicionado',
      'Lazer completo',
      'Vaga coberta',
      'Aceita pet pequeno'
    ],
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5889, lng: -48.5372 }
  },

  // ========== CASAS PARA ALUGUEL (3) ==========
  {
    id: 28,
    code: 'CSA001',
    type: 'house',
    transaction: 'rent',
    title: 'Casa Temporada - Praia do Forte',
    address: 'Rua dos Corais, 100 - Praia do Forte, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Praia do Forte',
    price: 800, // diária
    area: 150,
    bedrooms: 4,
    suites: 2,
    bathrooms: 3,
    parking: 3,
    floor: null,
    description: 'Casa para temporada a 100m da praia. Acomoda até 10 pessoas. Churrasqueira e piscina.',
    features: [
      'Temporada',
      '100m da praia',
      'Piscina',
      'Churrasqueira',
      'Acomoda 10 pessoas',
      'Wi-fi',
      'Ar condicionado',
      'Cozinha equipada'
    ],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.4329, lng: -48.3854 },
    rentType: 'season',
    capacity: 10
  },
  {
    id: 29,
    code: 'CSA002',
    type: 'house',
    transaction: 'rent',
    title: 'Casa em Condomínio - Itacorubi',
    address: 'Rua João Pio Duarte Silva, 600 - Córrego Grande, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Córrego Grande',
    price: 4500,
    area: 180,
    bedrooms: 3,
    suites: 1,
    bathrooms: 3,
    parking: 2,
    floor: null,
    description: 'Casa em condomínio fechado com segurança 24h. Área de lazer completa. IPTU e condomínio por conta do inquilino.',
    features: [
      'Condomínio fechado',
      'Segurança 24h',
      'Piscina condomínio',
      'Quadra esportiva',
      'Playground',
      'Salão de festas',
      'Próximo Angeloni'
    ],
    images: [
      'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5935, lng: -48.5000 }
  },
  {
    id: 30,
    code: 'CSA003',
    type: 'house',
    transaction: 'rent',
    title: 'Casa Comercial - SC-401',
    address: 'Rod. SC-401, 5000 - Santo Antônio de Lisboa, Florianópolis',
    city: 'Florianópolis',
    neighborhood: 'Santo Antônio de Lisboa',
    price: 8000,
    area: 300,
    bedrooms: 0,
    suites: 0,
    bathrooms: 4,
    parking: 10,
    floor: null,
    description: 'Casa adaptada para uso comercial na SC-401. Ideal para clínica, escritório ou escola. Amplo estacionamento.',
    features: [
      'Uso comercial',
      'Frente para SC-401',
      'Estacionamento amplo',
      'Adaptada PNE',
      'Ar condicionado',
      'Sistema segurança',
      'Gerador',
      'Fachada iluminada'
    ],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    ],
    virtualTour: null,
    location: { lat: -27.5112, lng: -48.5298 },
    propertyUse: 'commercial'
  }
];

// Função para buscar imóveis com filtros
function searchProperties(filters = {}) {
  let results = [...properties];
  
  if (filters.type) {
    results = results.filter(p => p.type === filters.type);
  }
  
  if (filters.transaction) {
    results = results.filter(p => p.transaction === filters.transaction);
  }
  
  if (filters.city) {
    results = results.filter(p => 
      p.city.toLowerCase().includes(filters.city.toLowerCase())
    );
  }
  
  if (filters.neighborhood) {
    results = results.filter(p => 
      p.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())
    );
  }
  
  if (filters.minPrice) {
    results = results.filter(p => p.price >= filters.minPrice);
  }
  
  if (filters.maxPrice) {
    results = results.filter(p => p.price <= filters.maxPrice);
  }
  
  if (filters.bedrooms) {
    results = results.filter(p => p.bedrooms >= filters.bedrooms);
  }
  
  if (filters.minArea) {
    results = results.filter(p => p.area >= filters.minArea);
  }
  
  if (filters.maxArea) {
    results = results.filter(p => p.area <= filters.maxArea);
  }
  
  return results;
}

// Função para obter imóvel por ID
function getPropertyById(id) {
  return properties.find(p => p.id === id);
}

// Função para obter imóveis em destaque
function getFeaturedProperties() {
  // Retorna 6 imóveis variados
  return [
    properties[0],  // Cobertura Jurerê
    properties[15], // Mansão Jurerê
    properties[9],  // Apt BC
    properties[1],  // Garden Lagoa
    properties[17], // Casa contemporânea
    properties[24]  // Apt aluguel centro
  ];
}

// Função para formatar preço
function formatPrice(price, transaction = 'sale') {
  if (transaction === 'rent') {
    return `R$ ${price.toLocaleString('pt-BR')}/mês`;
  }
  return `R$ ${price.toLocaleString('pt-BR')}`;
}

module.exports = {
  properties,
  searchProperties,
  getPropertyById,
  getFeaturedProperties,
  formatPrice
};