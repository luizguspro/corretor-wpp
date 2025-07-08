// src/services/messageService.js
const evolutionService = require('./evolutionService');
const messageTemplates = require('../utils/messageTemplates');
const { searchProperties, getPropertyById, getFeaturedProperties } = require('../data/realEstateData');

// Importar OpenAI apenas se estiver configurado
let openaiService = null;
if (process.env.OPENAI_API_KEY && process.env.ENABLE_AI_RESPONSES !== 'false') {
  try {
    openaiService = require('./openaiService');
    console.log('✅ OpenAI configurado e carregado');
  } catch (error) {
    console.log('⚠️ OpenAI não configurado, usando respostas padrão');
  }
}

// Simular banco de dados em memória
const userSessions = new Map();
const userProfiles = new Map();
const scheduledVisits = new Map();

class MessageService {
  constructor() {
    this.menuOptions = {
      MAIN: 'main',
      BUYING: 'buying',
      SELLING: 'selling',
      RENTING: 'renting',
      SCHEDULE: 'schedule',
      CONTACT: 'contact',
      VIEWING_PROPERTY: 'viewing_property',
      LOCATION_SEARCH: 'location_search',
      AUDIO_RECEIVED: 'audio_received'
    };
    
    // Lista de agentes
    this.agents = [
      { name: 'Carlos Silva', phone: '48999887766', specialty: 'Vendas Alto Padrão' },
      { name: 'Ana Costa', phone: '48999776655', specialty: 'Locação' },
      { name: 'Roberto Santos', phone: '48999665544', specialty: 'Lançamentos' }
    ];
  }
  
  // Processar mensagem recebida
  async processMessage(data) {
    console.log('\n🔍 Processando mensagem...');
    
    if (!data || !data.key || !data.key.remoteJid) {
      console.log('❌ Dados inválidos');
      return;
    }
    
    const { key, message, pushName } = data;
    const from = key.remoteJid;
    
    // Ignorar mensagens próprias em produção
    if (key.fromMe && process.env.NODE_ENV === 'production') {
      return;
    }
    
    // Ignorar grupos
    if (from.includes('@g.us')) {
      return;
    }
    
    // Obter sessão e perfil
    const session = this.getUserSession(from);
    const profile = this.getUserProfile(from, pushName);
    
    // Processar diferentes tipos de mensagem
    if (message) {
      try {
        if (message.audioMessage) {
          await this.handleAudioMessage(from, message.audioMessage, session, profile);
        } else if (message.conversation || message.extendedTextMessage?.text) {
          const text = message.conversation || message.extendedTextMessage.text;
          await this.handleTextMessage(from, text, session, profile);
        } else if (message.listResponseMessage) {
          await this.handleListResponse(from, message.listResponseMessage, session, profile);
        } else if (message.buttonsResponseMessage) {
          await this.handleButtonResponse(from, message.buttonsResponseMessage, session, profile);
        } else if (message.locationMessage) {
          await this.handleLocationMessage(from, message.locationMessage, session, profile);
        } else {
          console.log('⚠️ Tipo de mensagem não reconhecido:', Object.keys(message));
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await this.sendErrorMessage(from);
      }
    }
  }
  
  // Lidar com mensagens de áudio
  async handleAudioMessage(from, audioMessage, session, profile) {
    try {
      await evolutionService.sendTextMessage(from, '🎤 Recebendo seu áudio...');
      
      // Verificar se OpenAI está disponível
      if (!openaiService) {
        await evolutionService.sendTextMessage(
          from,
          '😔 Desculpe, a transcrição de áudio está temporariamente indisponível. Por favor, digite sua mensagem.'
        );
        return;
      }
      
      // Baixar áudio
      const audioBuffer = Buffer.from(audioMessage.fileEncSha256, 'base64');
      
      // Transcrever com OpenAI
      const transcription = await openaiService.transcribeAudio(audioBuffer, 'ogg');
      
      await evolutionService.sendTextMessage(
        from, 
        `📝 Entendi: "${transcription}"\n\nProcessando sua solicitação...`
      );
      
      // Processar como texto
      await this.handleTextMessage(from, transcription, session, profile);
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      await evolutionService.sendTextMessage(
        from,
        '😔 Desculpe, não consegui processar seu áudio. Pode digitar sua mensagem?'
      );
    }
  }
  
  // Lidar com mensagens de texto com IA
  async handleTextMessage(from, text, session, profile) {
    const lowerText = text.toLowerCase().trim();
    
    // Analisar intenção com OpenAI (se disponível)
    let intent = { intent: 'other', propertyType: 'any', sentiment: 'neutral' };
    if (openaiService) {
      try {
        intent = await openaiService.analyzeIntent(text, { userId: from });
        console.log('Intenção detectada:', intent);
      } catch (error) {
        console.log('Erro ao analisar intenção, usando padrão:', error.message);
      }
    }
    
    // Atualizar perfil com base na análise
    if (intent && intent.intent !== 'other') {
      this.updateUserProfile(from, intent);
    }
    
    // Primeira interação ou reset
    if (!session.started || lowerText === 'menu' || lowerText === 'início' || lowerText === 'inicio') {
      await this.sendWelcomeMessage(from, profile.name);
      session.started = true;
      session.state = this.menuOptions.MAIN;
      return;
    }
    
    // Roteamento inteligente baseado em intenção
    if (intent.intent === 'buy' && session.state === this.menuOptions.MAIN) {
      session.state = this.menuOptions.BUYING;
      await this.handleBuyingIntent(from, text, intent, session, profile);
      return;
    }
    
    if (intent.intent === 'rent' && session.state === this.menuOptions.MAIN) {
      session.state = this.menuOptions.RENTING;
      await this.handleRentingIntent(from, text, intent, session, profile);
      return;
    }
    
    // Processar baseado no estado atual
    switch (session.state) {
      case this.menuOptions.MAIN:
        await this.handleMainMenu(from, lowerText, session);
        break;
        
      case this.menuOptions.BUYING:
      case this.menuOptions.RENTING:
        await this.handlePropertySearch(from, text, intent, session, profile);
        break;
        
      case this.menuOptions.VIEWING_PROPERTY:
        await this.handlePropertyViewing(from, text, session, profile);
        break;
        
      case this.menuOptions.SCHEDULE:
        await this.handleScheduleFlow(from, text, session, profile);
        break;
        
      case this.menuOptions.SELLING:
        await this.handleSellingFlow(from, text, session, profile);
        break;
        
      case this.menuOptions.CONTACT:
        await this.handleContactFlow(from, text, session);
        break;
        
      default:
        await this.handleGeneralQuery(from, text, profile);
    }
  }
  
  // Lidar com intenção de compra
  async handleBuyingIntent(from, text, intent, session, profile) {
    // Buscar imóveis baseado na análise
    const filters = {
      transaction: 'sale',
      type: intent.propertyType !== 'any' ? intent.propertyType : null,
      minPrice: intent.priceRange?.min,
      maxPrice: intent.priceRange?.max,
      bedrooms: intent.bedrooms,
      city: intent.location
    };
    
    const properties = searchProperties(filters);
    
    if (properties.length > 0) {
      // Gerar sugestões personalizadas com IA
      let suggestions = null;
      if (openaiService) {
        try {
          suggestions = await openaiService.generatePersonalizedSuggestions(
            profile,
            properties.slice(0, 6)
          );
        } catch (error) {
          console.log('Erro ao gerar sugestões personalizadas');
        }
      }
      
      const introMessage = `🎯 Excelente! Baseado no que você me disse, encontrei ${properties.length} imóveis que podem te interessar.\n\n${suggestions || 'Vou te mostrar os melhores:'}`;
      
      await evolutionService.sendTextMessage(from, introMessage);
      
      // Enviar top 3 imóveis
      await this.delay(1500);
      await this.sendPropertyCarousel(from, properties.slice(0, 3), profile);
      
    } else {
      await this.sendNoResultsMessage(from, filters);
    }
  }
  
  // Lidar com intenção de aluguel
  async handleRentingIntent(from, text, intent, session, profile) {
    // Similar ao buying mas com transaction: 'rent'
    const filters = {
      transaction: 'rent',
      type: intent.propertyType !== 'any' ? intent.propertyType : null,
      minPrice: intent.priceRange?.min,
      maxPrice: intent.priceRange?.max,
      bedrooms: intent.bedrooms,
      city: intent.location
    };
    
    const properties = searchProperties(filters);
    
    if (properties.length > 0) {
      await evolutionService.sendTextMessage(
        from,
        `🔑 Encontrei ${properties.length} imóveis para alugar com suas características!`
      );
      
      await this.delay(1500);
      await this.sendPropertyCarousel(from, properties.slice(0, 3), profile);
    } else {
      await this.sendNoResultsMessage(from, filters);
    }
  }
  
  // Busca inteligente de imóveis
  async handlePropertySearch(from, text, intent, session, profile) {
    // Se já tem filtros na sessão, refinar busca
    if (session.searchFilters) {
      // Atualizar filtros com nova informação
      if (intent.priceRange?.max) session.searchFilters.maxPrice = intent.priceRange.max;
      if (intent.bedrooms) session.searchFilters.bedrooms = intent.bedrooms;
      if (intent.location) session.searchFilters.city = intent.location;
    } else {
      // Criar novos filtros
      session.searchFilters = {
        transaction: session.state === this.menuOptions.BUYING ? 'sale' : 'rent',
        type: intent.propertyType !== 'any' ? intent.propertyType : null,
        minPrice: intent.priceRange?.min,
        maxPrice: intent.priceRange?.max,
        bedrooms: intent.bedrooms,
        city: intent.location
      };
    }
    
    const properties = searchProperties(session.searchFilters);
    
    if (properties.length === 0) {
      await this.sendNoResultsMessage(from, session.searchFilters);
      return;
    }
    
    // Enviar resultados
    const responseBase = `Encontrei ${properties.length} imóveis com suas características! 🏠`;
    let enhancedResponse = responseBase;
    
    if (openaiService) {
      try {
        enhancedResponse = await openaiService.enhanceResponse(text, responseBase, { userId: from });
      } catch (error) {
        console.log('Usando resposta padrão');
      }
    }
    
    await evolutionService.sendTextMessage(from, enhancedResponse);
    await this.delay(1000);
    
    // Enviar carrossel de imóveis
    await this.sendPropertyCarousel(from, properties.slice(0, 3), profile);
  }
  
  // Enviar carrossel de imóveis
  async sendPropertyCarousel(from, properties, profile) {
    for (const property of properties) {
      // Gerar descrição melhorada com IA
      let enhancedDescription = null;
      if (openaiService) {
        try {
          enhancedDescription = await openaiService.generatePropertyDescription(property);
        } catch (error) {
          console.log('Usando descrição padrão');
        }
      }
      
      // Criar card do imóvel
      const card = this.createPropertyCard(property, enhancedDescription);
      
      // Enviar imagem
      if (property.images && property.images[0]) {
        await evolutionService.sendImageMessage(from, property.images[0], card);
      } else {
        await evolutionService.sendTextMessage(from, card);
      }
      
      await this.delay(2000);
    }
    
    // Opções após mostrar imóveis
    await this.sendPropertyActions(from, properties);
  }
  
  // Criar card de imóvel
  createPropertyCard(property, enhancedDescription = null) {
    const transaction = property.transaction === 'sale' ? 'Venda' : 'Aluguel';
    const price = property.transaction === 'sale' 
      ? `R$ ${property.price.toLocaleString('pt-BR')}`
      : `R$ ${property.price.toLocaleString('pt-BR')}/mês`;
      
    return `🏠 *${property.title}*
📍 ${property.neighborhood}, ${property.city}

💰 *${transaction}:* ${price}
📐 *Área:* ${property.area}m²
🛏️ *Quartos:* ${property.bedrooms} (${property.suites || 0} suítes)
🚗 *Vagas:* ${property.parking}

${enhancedDescription || property.description}

✨ *Destaques:*
${property.features.slice(0, 5).map(f => `• ${f}`).join('\n')}

🔑 *Código:* ${property.code}
${property.virtualTour ? `\n🎬 *Tour Virtual:* ${property.virtualTour}` : ''}`;
  }
  
  // Enviar ações após mostrar imóveis
  async sendPropertyActions(from, properties) {
    const actions = {
      title: '💡 O que você gostaria de fazer?',
      buttons: [
        {
          buttonId: 'schedule_visit',
          buttonText: { displayText: '📅 Agendar Visita' }
        },
        {
          buttonId: 'see_more',
          buttonText: { displayText: '🔍 Ver Mais Imóveis' }
        },
        {
          buttonId: 'talk_agent',
          buttonText: { displayText: '💬 Falar com Corretor' }
        }
      ]
    };
    
    await evolutionService.sendButtonMessage(from, actions);
  }
  
  // Lidar com menu principal
  async handleMainMenu(from, text, session) {
    if (text.includes('1') || text.includes('comprar')) {
      session.state = this.menuOptions.BUYING;
      await this.sendBuyingOptions(from);
    } else if (text.includes('2') || text.includes('vender')) {
      session.state = this.menuOptions.SELLING;
      await this.sendSellingForm(from);
    } else if (text.includes('3') || text.includes('alugar')) {
      session.state = this.menuOptions.RENTING;
      await this.sendRentingOptions(from);
    } else if (text.includes('4') || text.includes('agendar')) {
      session.state = this.menuOptions.SCHEDULE;
      await this.sendScheduleForm(from);
    } else if (text.includes('5') || text.includes('corretor')) {
      session.state = this.menuOptions.CONTACT;
      await this.sendContactInfo(from);
    } else {
      await evolutionService.sendTextMessage(
        from, 
        'Desculpe, não entendi sua opção. Por favor, escolha um número de 1 a 5 ou digite "menu" para ver as opções novamente.'
      );
    }
  }
  
  // Enviar opções de compra
  async sendBuyingOptions(from) {
    const buyingContent = {
      title: '🏠 Comprar Imóvel',
      description: 'Que tipo de imóvel você procura?',
      buttons: [
        {
          buttonId: 'house',
          buttonText: { displayText: '🏡 Casa' }
        },
        {
          buttonId: 'apartment',
          buttonText: { displayText: '🏢 Apartamento' }
        },
        {
          buttonId: 'land',
          buttonText: { displayText: '🌍 Terreno' }
        }
      ]
    };
    
    await evolutionService.sendButtonMessage(from, buyingContent);
  }
  
  // Enviar opções de aluguel
  async sendRentingOptions(from) {
    const rentingContent = {
      title: '🔑 Alugar Imóvel',
      description: 'Que tipo de imóvel você procura para alugar?',
      buttons: [
        {
          buttonId: 'rent_house',
          buttonText: { displayText: '🏡 Casa' }
        },
        {
          buttonId: 'rent_apartment',
          buttonText: { displayText: '🏢 Apartamento' }
        },
        {
          buttonId: 'rent_commercial',
          buttonText: { displayText: '🏪 Comercial' }
        }
      ]
    };
    
    await evolutionService.sendButtonMessage(from, rentingContent);
  }
  
  // Enviar formulário de venda
  async sendSellingForm(from) {
    const message = messageTemplates.getSellingFormMessage();
    await evolutionService.sendTextMessage(from, message);
  }
  
  // Enviar formulário de agendamento
  async sendScheduleForm(from) {
    await evolutionService.sendTextMessage(
      from,
      `📅 *Vamos agendar sua visita!*\n\nPor favor, me informe:\n\n1️⃣ Código do imóvel\n2️⃣ Dia preferido\n3️⃣ Horário preferido\n4️⃣ Seu nome completo\n5️⃣ Telefone para contato\n\nExemplo:\n"APV001, próxima terça, 14h, João Silva, 48999887766"`
    );
  }
  
  // Enviar informações de contato
  async sendContactInfo(from) {
    const contactInfo = messageTemplates.getContactInfo();
    await evolutionService.sendTextMessage(from, contactInfo);
  }
  
  // Lidar com fluxos específicos
  async handleSellingFlow(from, text, session, profile) {
    // Aqui você implementaria a lógica para processar dados do vendedor
    await evolutionService.sendTextMessage(
      from,
      '✅ Recebi suas informações! Um de nossos corretores entrará em contato em até 24h para agendar a avaliação gratuita do seu imóvel.'
    );
    session.state = this.menuOptions.MAIN;
  }
  
  async handleScheduleFlow(from, text, session, profile) {
    // Processar agendamento
    await evolutionService.sendTextMessage(
      from,
      '✅ Visita agendada com sucesso! Você receberá uma confirmação por WhatsApp.'
    );
    session.state = this.menuOptions.MAIN;
  }
  
  async handleContactFlow(from, text, session) {
    // Já enviou as informações, voltar ao menu
    session.state = this.menuOptions.MAIN;
  }
  
  async handlePropertyViewing(from, text, session, profile) {
    // Implementar visualização detalhada de imóvel
    await this.handleMainMenu(from, text, session);
  }
  
  // Lidar com localização
  async handleLocationMessage(from, location, session, profile) {
    const { latitude, longitude } = location;
    
    // Buscar imóveis próximos
    const nearbyProperties = this.findNearbyProperties(latitude, longitude, 5); // 5km raio
    
    if (nearbyProperties.length > 0) {
      await evolutionService.sendTextMessage(
        from,
        `📍 Encontrei ${nearbyProperties.length} imóveis próximos a esta localização!`
      );
      
      await this.sendPropertyCarousel(from, nearbyProperties.slice(0, 3), profile);
    } else {
      await evolutionService.sendTextMessage(
        from,
        '😔 Não encontrei imóveis próximos a esta localização. Que tal ampliarmos a busca?'
      );
    }
  }
  
  // Buscar imóveis próximos
  findNearbyProperties(lat, lon, radiusKm) {
    const { properties } = require('../data/realEstateData');
    
    return properties.filter(property => {
      if (!property.location) return false;
      
      const distance = this.calculateDistance(
        lat, lon,
        property.location.lat,
        property.location.lng
      );
      
      return distance <= radiusKm;
    });
  }
  
  // Calcular distância entre coordenadas
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Lidar com consultas gerais
  async handleGeneralQuery(from, text, profile) {
    // Tentar responder perguntas sobre a região
    if (text.includes('bairro') || text.includes('região') || text.includes('onde')) {
      let answer = 'Posso te ajudar com informações sobre os bairros! Temos imóveis em Jurerê Internacional, Lagoa da Conceição, Centro, Campeche e muito mais. Qual região te interessa?';
      
      if (openaiService) {
        try {
          answer = await openaiService.answerLocationQuestion(text);
        } catch (error) {
          console.log('Usando resposta padrão para localização');
        }
      }
      
      await evolutionService.sendTextMessage(from, answer);
      
      await this.delay(2000);
      await evolutionService.sendTextMessage(
        from,
        'Gostaria de ver imóveis disponíveis nesta região? Digite "sim" ou "menu" para voltar.'
      );
    } else {
      await this.sendDefaultMessage(from);
    }
  }
  
  // Enviar mensagem de boas-vindas melhorada
  async sendWelcomeMessage(from, name) {
    const hour = new Date().getHours();
    let greeting = 'Bom dia';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde';
    } else if (hour >= 18) {
      greeting = 'Boa noite';
    }
    
    const welcomeText = `${greeting}, ${name}! 👋

Bem-vindo à *Imobiliária Premium Floripa*! 🏠✨

Sou Carlos Silva, seu corretor virtual com 15 anos de experiência no mercado imobiliário de Florianópolis e região.

Temos *30 imóveis exclusivos* disponíveis, desde studios modernos até mansões de frente para o mar! 🌊

Como posso ajudar você hoje?`;
    
    await evolutionService.sendTextMessage(from, welcomeText);
    await this.delay(2000);
    
    // Menu interativo
    await this.sendInteractiveMenu(from);
  }
  
  // Menu interativo melhorado
  async sendInteractiveMenu(from) {
    const menu = {
      title: '🏡 Como posso ajudar?',
      description: 'Escolha uma opção ou me conte o que procura:',
      buttonText: 'Ver Opções',
      sections: [
        {
          title: '🔍 Encontrar Imóveis',
          rows: [
            {
              rowId: 'buy_house',
              title: '🏠 Comprar Casa',
              description: 'Casas à venda em toda região'
            },
            {
              rowId: 'buy_apartment',
              title: '🏢 Comprar Apartamento',
              description: 'Apartamentos com a sua cara'
            },
            {
              rowId: 'rent',
              title: '🔑 Alugar Imóvel',
              description: 'Para morar ou temporada'
            }
          ]
        },
        {
          title: '📋 Outros Serviços',
          rows: [
            {
              rowId: 'sell',
              title: '💰 Vender Meu Imóvel',
              description: 'Avaliação gratuita'
            },
            {
              rowId: 'featured',
              title: '⭐ Imóveis em Destaque',
              description: 'Oportunidades imperdíveis'
            },
            {
              rowId: 'regions',
              title: '📍 Conhecer Regiões',
              description: 'Informações sobre bairros'
            }
          ]
        }
      ]
    };
    
    await evolutionService.sendListMessage(from, menu);
  }
  
  // Lidar com respostas de lista
  async handleListResponse(from, listResponse, session, profile) {
    const selectedId = listResponse.singleSelectReply?.selectedRowId;
    
    if (!selectedId) return;
    
    switch (selectedId) {
      case 'buy_house':
        session.state = this.menuOptions.BUYING;
        session.searchFilters = { type: 'house', transaction: 'sale' };
        await this.handleBuyingIntent(from, 'quero comprar casa', { propertyType: 'house' }, session, profile);
        break;
        
      case 'buy_apartment':
        session.state = this.menuOptions.BUYING;
        session.searchFilters = { type: 'apartment', transaction: 'sale' };
        await this.handleBuyingIntent(from, 'quero comprar apartamento', { propertyType: 'apartment' }, session, profile);
        break;
        
      case 'rent':
        session.state = this.menuOptions.RENTING;
        await this.sendRentingOptions(from);
        break;
        
      case 'sell':
        session.state = this.menuOptions.SELLING;
        await this.sendSellingForm(from);
        break;
        
      case 'featured':
        const featured = getFeaturedProperties();
        await evolutionService.sendTextMessage(from, '⭐ *Imóveis em Destaque desta Semana!*');
        await this.sendPropertyCarousel(from, featured.slice(0, 3), profile);
        break;
        
      case 'regions':
        await evolutionService.sendTextMessage(
          from,
          '📍 *Sobre qual região você gostaria de saber mais?*\n\n• Jurerê Internacional\n• Lagoa da Conceição\n• Centro\n• Campeche\n• Balneário Camboriú\n• Ou digite o nome de outro bairro!'
        );
        break;
    }
  }
  
  // Lidar com respostas de botão
  async handleButtonResponse(from, buttonResponse, session, profile) {
    const selectedId = buttonResponse.selectedButtonId;
    
    switch (selectedId) {
      case 'house':
      case 'apartment':
      case 'land':
        session.searchFilters = { 
          ...session.searchFilters, 
          type: selectedId,
          transaction: 'sale'
        };
        await this.handlePropertySearch(from, `procuro ${selectedId}`, { propertyType: selectedId }, session, profile);
        break;
        
      case 'rent_house':
      case 'rent_apartment':
      case 'rent_commercial':
        const type = selectedId.replace('rent_', '');
        session.searchFilters = { 
          type: type,
          transaction: 'rent'
        };
        await this.handlePropertySearch(from, `alugar ${type}`, { propertyType: type }, session, profile);
        break;
        
      case 'schedule_visit':
        session.state = this.menuOptions.SCHEDULE;
        await this.sendScheduleForm(from);
        break;
        
      case 'see_more':
        await evolutionService.sendTextMessage(
          from,
          'Claro! Me conta mais detalhes do que você procura:\n\n• Localização preferida?\n• Faixa de preço?\n• Quantidade de quartos?\n• Alguma característica especial?'
        );
        break;
        
      case 'talk_agent':
        session.state = this.menuOptions.CONTACT;
        await this.sendContactInfo(from);
        break;
    }
  }
  
  // Mensagem quando não há resultados
  async sendNoResultsMessage(from, filters) {
    const response = `😔 No momento não encontrei imóveis com essas características específicas.

Mas não desanime! Posso:
1️⃣ Ampliar a busca com critérios similares
2️⃣ Cadastrar seu interesse para avisar quando surgir
3️⃣ Mostrar opções próximas ao que procura

O que prefere?`;
    
    await evolutionService.sendTextMessage(from, response);
  }
  
  // Gerenciar perfil do usuário
  getUserProfile(userId, name = 'Cliente') {
    if (!userProfiles.has(userId)) {
      userProfiles.set(userId, {
        name: name,
        searchHistory: [],
        preferences: {
          type: null,
          priceRange: {},
          locations: [],
          features: []
        },
        interactions: 0,
        lastInteraction: Date.now()
      });
    }
    
    const profile = userProfiles.get(userId);
    profile.interactions++;
    profile.lastInteraction = Date.now();
    
    return profile;
  }
  
  // Atualizar perfil com base em intenções
  updateUserProfile(userId, intent) {
    const profile = userProfiles.get(userId);
    if (!profile) return;
    
    if (intent.propertyType && intent.propertyType !== 'any') {
      profile.preferences.type = intent.propertyType;
    }
    
    if (intent.priceRange) {
      profile.preferences.priceRange = intent.priceRange;
    }
    
    if (intent.location && !profile.preferences.locations.includes(intent.location)) {
      profile.preferences.locations.push(intent.location);
    }
    
    if (intent.features && intent.features.length > 0) {
      profile.preferences.features = [...new Set([...profile.preferences.features, ...intent.features])];
    }
  }
  
  // Gerenciar sessão do usuário
  getUserSession(userId) {
    if (!userSessions.has(userId)) {
      userSessions.set(userId, {
        started: false,
        state: null,
        data: {},
        searchFilters: null,
        viewingProperty: null,
        timestamp: Date.now()
      });
    }
    return userSessions.get(userId);
  }
  
  // Helpers
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async sendErrorMessage(from) {
    await evolutionService.sendTextMessage(
      from,
      '❌ Ops! Ocorreu um erro. Por favor, tente novamente ou digite "menu" para reiniciar.'
    );
  }
  
  async sendDefaultMessage(from) {
    await evolutionService.sendTextMessage(
      from,
      '🤔 Não entendi sua mensagem. Você pode:\n\n' +
      '• Digitar "menu" para ver opções\n' +
      '• Me contar o que procura (ex: "quero alugar apartamento na Lagoa")\n' +
      '• Enviar um áudio com sua necessidade 🎤'
    );
  }
}

module.exports = new MessageService();