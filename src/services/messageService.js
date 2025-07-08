// src/services/messageService.js
const evolutionService = require('./evolutionService');
const messageTemplates = require('../utils/messageTemplates');

// Simular banco de dados em memória
const userSessions = new Map();
const properties = require('../models/Property').mockProperties;

class MessageService {
  constructor() {
    this.menuOptions = {
      MAIN: 'main',
      BUYING: 'buying',
      SELLING: 'selling',
      RENTING: 'renting',
      SCHEDULE: 'schedule',
      CONTACT: 'contact'
    };
  }
  
  // Processar mensagem recebida
  async processMessage(data) {
    console.log('\n🔍 processMessage chamado!');
    console.log('Data recebida:', JSON.stringify(data, null, 2));
    
    // Verificar se tem a estrutura mínima necessária
    if (!data) {
      console.log('❌ Data vazia');
      return;
    }
    
    const { key, message, pushName } = data;
    
    if (!key || !key.remoteJid) {
      console.log('❌ Sem key.remoteJid');
      return;
    }
    
    const from = key.remoteJid;
    
    console.log('From:', from);
    console.log('FromMe:', key.fromMe);
    console.log('Message:', message);
    console.log('PushName:', pushName);
    
    // TEMPORARIAMENTE permitir mensagens próprias para teste
    // Remover esta condição depois dos testes
    /*
    if (key.fromMe) {
      console.log('❌ Ignorando mensagem própria');
      return;
    }
    */
    
    // Ignorar mensagens de grupo
    if (from.includes('@g.us')) {
      console.log('❌ Ignorando mensagem de grupo');
      return;
    }
    
    // Obter ou criar sessão do usuário
    const session = this.getUserSession(from);
    console.log('Sessão:', session);
    
    // Processar diferentes tipos de mensagem
    if (message) {
      if (message.conversation || message.extendedTextMessage?.text) {
        const text = message.conversation || message.extendedTextMessage.text;
        console.log('Texto recebido:', text);
        await this.handleTextMessage(from, text, session, pushName);
      } else if (message.listResponseMessage) {
        await this.handleListResponse(from, message.listResponseMessage, session);
      } else if (message.buttonsResponseMessage) {
        await this.handleButtonResponse(from, message.buttonsResponseMessage, session);
      } else {
        console.log('⚠️ Tipo de mensagem não reconhecido:', Object.keys(message));
      }
    } else {
      console.log('⚠️ Sem objeto message');
    }
  }
  
  // Lidar com mensagens de texto
  async handleTextMessage(from, text, session, pushName) {
    const lowerText = text.toLowerCase().trim();
    
    // Primeira interação ou comando de reset
    if (!session.started || lowerText === 'menu' || lowerText === 'início' || lowerText === 'inicio') {
      await this.sendWelcomeMessage(from, pushName);
      session.started = true;
      session.state = this.menuOptions.MAIN;
      return;
    }
    
    // Processar baseado no estado atual
    switch (session.state) {
      case this.menuOptions.MAIN:
        await this.handleMainMenu(from, lowerText, session);
        break;
        
      case this.menuOptions.BUYING:
        await this.handleBuyingFlow(from, text, session);
        break;
        
      case this.menuOptions.SELLING:
        await this.handleSellingFlow(from, text, session);
        break;
        
      case this.menuOptions.RENTING:
        await this.handleRentingFlow(from, text, session);
        break;
        
      case this.menuOptions.SCHEDULE:
        await this.handleScheduleFlow(from, text, session);
        break;
        
      case this.menuOptions.CONTACT:
        await this.handleContactFlow(from, text, session);
        break;
        
      default:
        await this.sendDefaultMessage(from);
    }
  }
  
  // Enviar mensagem de boas-vindas
  async sendWelcomeMessage(from, pushName) {
    const welcomeText = messageTemplates.getWelcomeMessage(pushName);
    await evolutionService.sendTextMessage(from, welcomeText);
    
    // Aguardar um pouco antes de enviar o menu
    await this.delay(2000);
    
    // Enviar menu principal
    await this.sendMainMenu(from);
  }
  
  // Enviar menu principal
  async sendMainMenu(from) {
    const menuContent = {
      title: '📋 Menu Principal',
      description: 'Escolha uma das opções abaixo:',
      buttonText: 'Ver Opções',
      sections: [
        {
          title: 'Serviços Disponíveis',
          rows: [
            {
              rowId: 'buy',
              title: '🏠 Comprar Imóvel',
              description: 'Encontre o imóvel dos seus sonhos'
            },
            {
              rowId: 'sell',
              title: '💰 Vender Imóvel',
              description: 'Anuncie seu imóvel conosco'
            },
            {
              rowId: 'rent',
              title: '🔑 Alugar Imóvel',
              description: 'Encontre imóveis para alugar'
            },
            {
              rowId: 'schedule',
              title: '📅 Agendar Visita',
              description: 'Agende uma visita a um imóvel'
            },
            {
              rowId: 'contact',
              title: '📞 Falar com Corretor',
              description: 'Entre em contato com um corretor'
            }
          ]
        }
      ]
    };
    
    await evolutionService.sendListMessage(from, menuContent);
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
  
  // Lidar com fluxo de compra
  async handleBuyingFlow(from, text, session) {
    if (!session.propertyType) {
      // Primeira etapa: tipo de imóvel
      if (text.includes('casa')) {
        session.propertyType = 'house';
      } else if (text.includes('apartamento') || text.includes('apto')) {
        session.propertyType = 'apartment';
      } else if (text.includes('terreno')) {
        session.propertyType = 'land';
      }
      
      if (session.propertyType) {
        await evolutionService.sendTextMessage(
          from,
          'Ótima escolha! 🎯\n\nAgora me diga:\n💵 Qual seu orçamento máximo?\n📍 Em qual região você prefere?\n🛏️ Quantos quartos precisa?\n\nPode responder tudo junto, exemplo:\n"Até 500 mil, região Sul, 3 quartos"'
        );
        session.step = 'details';
      }
    } else if (session.step === 'details') {
      // Segunda etapa: detalhes
      session.searchCriteria = text;
      
      // Buscar imóveis (simulado)
      const availableProperties = this.searchProperties(session.propertyType, text);
      
      if (availableProperties.length > 0) {
        await evolutionService.sendTextMessage(
          from,
          `Encontrei ${availableProperties.length} imóveis que podem te interessar! 🏠✨`
        );
        
        // Enviar até 3 imóveis
        for (let i = 0; i < Math.min(3, availableProperties.length); i++) {
          await this.delay(1500);
          await this.sendPropertyDetails(from, availableProperties[i]);
        }
        
        await this.delay(2000);
        await evolutionService.sendTextMessage(
          from,
          'Gostaria de:\n1️⃣ Ver mais imóveis\n2️⃣ Agendar visita\n3️⃣ Voltar ao menu\n\nDigite o número da opção desejada.'
        );
        
        session.step = 'property_action';
      } else {
        await evolutionService.sendTextMessage(
          from,
          'No momento não encontrei imóveis com essas características. 😔\n\nPosso cadastrar seu interesse para te avisar quando surgir algo?\n\nDigite "sim" para cadastrar ou "menu" para voltar.'
        );
      }
    }
  }
  
  // Enviar detalhes do imóvel
  async sendPropertyDetails(from, property) {
    const details = messageTemplates.getPropertyDetails(property);
    
    // Enviar imagem se disponível
    if (property.image) {
      await evolutionService.sendImageMessage(from, property.image, details);
    } else {
      await evolutionService.sendTextMessage(from, details);
    }
    
    // Enviar localização se disponível
    if (property.location) {
      await this.delay(1000);
      await evolutionService.sendLocationMessage(
        from,
        property.location.lat,
        property.location.lng,
        property.title,
        property.address
      );
    }
  }
  
  // Buscar imóveis (simulado)
  searchProperties(type, criteria) {
    // Aqui você implementaria a busca real no banco de dados
    // Por enquanto, retorna imóveis mockados
    return properties.filter(p => p.type === type).slice(0, 3);
  }
  
  // Gerenciar sessão do usuário
  getUserSession(userId) {
    if (!userSessions.has(userId)) {
      userSessions.set(userId, {
        started: false,
        state: null,
        data: {},
        timestamp: Date.now()
      });
    }
    return userSessions.get(userId);
  }
  
  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Enviar mensagem padrão
  async sendDefaultMessage(from) {
    await evolutionService.sendTextMessage(
      from,
      'Desculpe, não entendi sua mensagem. 🤔\n\nDigite "menu" para ver as opções disponíveis ou "corretor" para falar com um de nossos corretores.'
    );
  }
}

module.exports = new MessageService();