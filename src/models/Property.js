// src/models/Property.js

// Mock de imóveis para teste
const mockProperties = [
  {
    id: 1,
    code: 'IMV001',
    type: 'house',
    title: 'Casa em Condomínio Fechado',
    address: 'Rua das Palmeiras, 500 - Jardim Europa',
    price: 850000,
    area: 250,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    description: 'Linda casa em condomínio fechado com segurança 24h. Acabamento de alto padrão, área gourmet completa e piscina.',
    features: [
      'Piscina privativa',
      'Churrasqueira',
      'Área gourmet',
      'Segurança 24h',
      'Playground'
    ],
    image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
    location: {
      lat: -23.5505,
      lng: -46.6333
    }
  },
  {
    id: 2,
    code: 'IMV002',
    type: 'apartment',
    title: 'Apartamento Alto Padrão',
    address: 'Av. Paulista, 1500 - Bela Vista',
    price: 1200000,
    area: 180,
    bedrooms: 3,
    bathrooms: 4,
    parking: 3,
    description: 'Apartamento de luxo com vista panorâmica da cidade. Varanda gourmet, home office e acabamentos importados.',
    features: [
      'Vista panorâmica',
      'Varanda gourmet',
      'Home office',
      'Academia',
      'Spa',
      'Salão de festas'
    ],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    location: {
      lat: -23.5614,
      lng: -46.6559
    }
  },
  {
    id: 3,
    code: 'IMV003',
    type: 'apartment',
    title: 'Apartamento Compact',
    address: 'Rua Augusta, 2000 - Consolação',
    price: 450000,
    area: 65,
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    description: 'Apartamento moderno e funcional, perfeito para jovens profissionais. Próximo ao metrô e toda infraestrutura.',
    features: [
      'Próximo ao metrô',
      'Área de lazer completa',
      'Pet friendly',
      'Coworking'
    ],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    location: {
      lat: -23.5529,
      lng: -46.6612
    }
  },
  {
    id: 4,
    code: 'IMV004',
    type: 'land',
    title: 'Terreno em Condomínio',
    address: 'Condomínio Green Valley - Cotia',
    price: 350000,
    area: 500,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    description: 'Terreno plano em condomínio fechado de alto padrão. Infraestrutura completa, pronto para construir.',
    features: [
      'Terreno plano',
      'Infraestrutura completa',
      'Segurança 24h',
      'Área de lazer do condomínio'
    ],
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    location: {
      lat: -23.6035,
      lng: -46.9195
    }
  }
];

// Classe Property para futuro uso com banco de dados
class Property {
  constructor(data) {
    this.id = data.id;
    this.code = data.code;
    this.type = data.type;
    this.title = data.title;
    this.address = data.address;
    this.price = data.price;
    this.area = data.area;
    this.bedrooms = data.bedrooms;
    this.bathrooms = data.bathrooms;
    this.parking = data.parking;
    this.description = data.description;
    this.features = data.features || [];
    this.images = data.images || [];
    this.location = data.location;
    this.status = data.status || 'available';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
  
  // Métodos para futuro CRUD
  async save() {
    // Implementar salvamento no banco
  }
  
  static async findById(id) {
    // Implementar busca por ID
  }
  
  static async findByFilters(filters) {
    // Implementar busca com filtros
  }
}

module.exports = {
  Property,
  mockProperties
};