// src/utils/messageTemplates.js

const messageTemplates = {
  // Mensagem de boas-vindas
  getWelcomeMessage: (name = 'Cliente') => {
    const hour = new Date().getHours();
    let greeting = 'Bom dia';
    let emoji = '☀️';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde';
      emoji = '🌤️';
    } else if (hour >= 18 || hour < 6) {
      greeting = 'Boa noite';
      emoji = '🌙';
    }
    
    return `${emoji} *${greeting}, ${name}!*

Seja muito bem-vindo(a) à *Imobiliária Premium Floripa* 🏠✨

Sou *Carlos Silva*, seu corretor virtual com mais de 15 anos de experiência no mercado imobiliário de Florianópolis e região.

📊 *Números que impressionam:*
• 30+ imóveis exclusivos disponíveis
• 95% de satisfação dos clientes
• Resposta em menos de 2 minutos
• Tours virtuais em 360°

🎯 *Como posso ajudar você hoje?*`;
  },
  
  // Card de imóvel otimizado para WhatsApp
  getPropertyCard: (property) => {
    const type = property.type === 'house' ? '🏡 Casa' : 
                 property.type === 'apartment' ? '🏢 Apartamento' :
                 property.type === 'land' ? '🌍 Terreno' : '🏠 Imóvel';
                 
    const transaction = property.transaction === 'sale' ? 'VENDA' : 'ALUGUEL';
    const price = property.transaction === 'sale' 
      ? `R$ ${property.price.toLocaleString('pt-BR')}`
      : `R$ ${property.price.toLocaleString('pt-BR')}/mês`;
      
    // Emojis para features
    const featureEmojis = {
      'piscina': '🏊',
      'churrasqueira': '🍖',
      'academia': '💪',
      'playground': '🎮',
      'vista mar': '🌊',
      'pet friendly': '🐕',
      'varanda': '🌿',
      'segurança 24h': '🔒'
    };
    
    return `━━━━━━━━━━━━━━━━━
${type} *${property.title}*
📍 ${property.neighborhood} • ${property.city}
━━━━━━━━━━━━━━━━━

💰 *${transaction}*
💵 *${price}*

📐 *${property.area}m²* | 🛏️ *${property.bedrooms} quartos* | 🚗 *${property.parking} vagas*
${property.suites ? `🚿 *${property.suites} suítes*` : ''}

📝 *Sobre o imóvel:*
_${property.description}_

✨ *Destaques:*
${property.features.slice(0, 6).map(f => {
  const emoji = Object.keys(featureEmojis).find(key => f.toLowerCase().includes(key));
  return `${emoji ? featureEmojis[emoji] : '•'} ${f}`;
}).join('\n')}

${property.highlights ? `
🎯 *Diferenciais:*
${Object.entries(property.highlights).map(([key, value]) => `• ${value}`).join('\n')}
` : ''}

🔑 *Cód:* ${property.code}
${property.virtualTour ? `\n🎬 *Tour Virtual disponível!*` : ''}

💬 _Digite o código do imóvel para mais detalhes_`;
  },
  
  // Resumo de busca
  getSearchSummary: (filters, resultCount) => {
    let summary = '🔍 *Sua busca:*\n';
    
    if (filters.type) {
      const types = {
        'house': '🏡 Casas',
        'apartment': '🏢 Apartamentos',
        'land': '🌍 Terrenos'
      };
      summary += `• Tipo: ${types[filters.type] || filters.type}\n`;
    }
    
    if (filters.transaction) {
      summary += `• ${filters.transaction === 'sale' ? 'Para comprar' : 'Para alugar'}\n`;
    }
    
    if (filters.city) {
      summary += `• Localização: ${filters.city}\n`;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      summary += `• Faixa de preço: `;
      if (filters.minPrice && filters.maxPrice) {
        summary += `R$ ${filters.minPrice.toLocaleString()} a R$ ${filters.maxPrice.toLocaleString()}`;
      } else if (filters.minPrice) {
        summary += `Acima de R$ ${filters.minPrice.toLocaleString()}`;
      } else {
        summary += `Até R$ ${filters.maxPrice.toLocaleString()}`;
      }
      summary += '\n';
    }
    
    if (filters.bedrooms) {
      summary += `• Mínimo ${filters.bedrooms} quartos\n`;
    }
    
    summary += `\n📊 *Encontrados: ${resultCount} imóveis*`;
    
    return summary;
  },
  
  // Mensagem de agendamento
  getScheduleMessage: (property, date, time) => {
    return `✅ *Visita Agendada com Sucesso!*

🏠 *Imóvel:* ${property.title}
📍 *Local:* ${property.address}
📅 *Data:* ${date}
⏰ *Horário:* ${time}

👨‍💼 *Corretor:* Roberto Santos
📱 *WhatsApp:* (48) 99966-5544

📋 *Checklist para a visita:*
✓ Documento com foto
✓ Comprovante de renda (se financiar)
✓ Lista de perguntas
✓ Máscara (opcional)

⚠️ *Importante:*
• Chegue 10 min antes
• O corretor estará com camisa azul da imobiliária
• Em caso de imprevistos, avise com antecedência

🗺️ _Enviaremos a localização exata 1 hora antes_

Obrigado pela confiança! 🤝`;
  },
  
  // Mensagem de qualificação
  getQualificationMessage: () => {
    return `🎯 *Vamos encontrar o imóvel perfeito para você!*

Para personalizar melhor sua busca, me conte:

1️⃣ *Finalidade:* Moradia própria ou investimento?

2️⃣ *Prazo:* Quando pretende mudar?
   • Imediato (até 30 dias)
   • Curto prazo (1-3 meses)
   • Médio prazo (3-6 meses)
   • Apenas pesquisando

3️⃣ *Forma de pagamento:*
   • À vista
   • Financiamento
   • Entrada + Financiamento

4️⃣ *Já visitou imóveis?* Quais mais gostou?

_Suas respostas me ajudam a selecionar as melhores opções! 😊_`;
  },
  
  // Informações sobre regiões
  getRegionInfo: (region) => {
    const regions = {
      'jurerê internacional': {
        title: 'Jurerê Internacional',
        emoji: '🏖️',
        description: 'O bairro mais luxuoso de Florianópolis',
        highlights: [
          'Praia de águas calmas e cristalinas',
          'Beach clubs renomados',
          'Alta gastronomia internacional',
          'Mansões e imóveis de altíssimo padrão',
          'Vida noturna sofisticada',
          'Segurança privada 24h'
        ],
        profile: 'Ideal para quem busca exclusividade e sofisticação',
        averagePrice: 'R$ 2M a R$ 20M (venda)',
        infrastructure: '⭐⭐⭐⭐⭐'
      },
      'lagoa da conceição': {
        title: 'Lagoa da Conceição',
        emoji: '🌊',
        description: 'O coração boêmio da ilha',
        highlights: [
          'Lagoa com 20km² para esportes náuticos',
          'Vida noturna agitada',
          'Gastronomia diversificada',
          'Trilhas e natureza preservada',
          'Comunidade internacional',
          'Centralidade na ilha'
        ],
        profile: 'Perfeito para jovens e amantes da natureza',
        averagePrice: 'R$ 600k a R$ 2M (venda)',
        infrastructure: '⭐⭐⭐⭐'
      },
      'campeche': {
        title: 'Campeche',
        emoji: '🏄',
        description: 'A praia dos surfistas e famílias',
        highlights: [
          'Praia de 5km de extensão',
          'Ondas perfeitas para surf',
          'Bairro em forte valorização',
          'Ilha do Campeche próxima',
          'Ambiente familiar',
          'Fácil acesso ao aeroporto'
        ],
        profile: 'Ideal para famílias e investidores',
        averagePrice: 'R$ 500k a R$ 1.5M (venda)',
        infrastructure: '⭐⭐⭐⭐'
      }
    };
    
    const info = regions[region.toLowerCase()] || {
      title: region,
      emoji: '📍',
      description: 'Região em desenvolvimento',
      highlights: ['Boa localização', 'Em crescimento'],
      profile: 'Diversas opções disponíveis',
      averagePrice: 'Consulte-nos',
      infrastructure: '⭐⭐⭐'
    };
    
    return `${info.emoji} *${info.title}*
_${info.description}_

🏆 *Destaques:*
${info.highlights.map(h => `• ${h}`).join('\n')}

👥 *Perfil:* ${info.profile}
💰 *Faixa de preço:* ${info.averagePrice}
🏗️ *Infraestrutura:* ${info.infrastructure}

Gostaria de ver imóveis disponíveis nesta região? 🏠`;
  },
  
  // Dicas de financiamento
  getFinancingTips: () => {
    return `💳 *Guia de Financiamento Imobiliário*

📊 *Condições atuais do mercado:*
• Taxa média: 9,5% a 12% ao ano
• Financiamento até 80% do valor
• Prazo máximo: 35 anos (420 meses)

✅ *Documentos necessários:*
• RG e CPF
• Comprovante de renda (3 últimos)
• Comprovante de residência
• Carteira de trabalho
• Declaração de IR
• Extrato bancário (3 meses)

💡 *Dicas importantes:*
1️⃣ O ideal é comprometer até 30% da renda
2️⃣ Tenha 20-30% de entrada + custos
3️⃣ FGTS pode ser usado na entrada
4️⃣ Compare taxas entre bancos
5️⃣ Considere a TR na composição

🏦 *Principais bancos:*
• Caixa Econômica (menores taxas)
• Banco do Brasil
• Santander
• Bradesco
• Itaú

📱 *Simule agora:* Envie "simular financiamento" e o valor desejado

_Posso conectar você com nosso especialista em crédito imobiliário?_ 🤝`;
  },
  
  // Call to action para fechar negócio
  getClosingCTA: (property) => {
    return `🎯 *Oportunidade Imperdível!*

Você demonstrou interesse no imóvel:
📍 *${property.title}*

⚡ *Por que agir agora:*
• Este imóvel teve 47 visualizações esta semana
• 3 pessoas já agendaram visita
• Preço ${Math.floor(Math.random() * 5 + 5)}% abaixo do mercado
• Proprietário motivado a negociar

🎁 *Benefícios exclusivos hoje:*
✓ Documentação gratuita
✓ Mudança por nossa conta
✓ IPTU 2024 quitado
✓ Possibilidade de parcelamento da entrada

⏰ *Próximos horários disponíveis:*
• Hoje às 16h30 ✅
• Amanhã às 10h ✅
• Amanhã às 14h ⚠️ (último horário)

💬 Digite *"QUERO VISITAR"* para garantir seu horário!

_"Não perca tempo, os melhores negócios são fechados por quem age rápido!"_ 🚀`;
  },
  
  // Erro amigável
  getErrorMessage: () => {
    const messages = [
      '😅 Ops! Parece que algo não saiu como planejado...',
      '🤖 Até os robôs erram às vezes! ',
      '🔧 Houston, temos um probleminha...'
    ];
    
    const random = messages[Math.floor(Math.random() * messages.length)];
    
    return `${random}

Mas não se preocupe! Você pode:

1️⃣ Tentar novamente 
2️⃣ Digitar *"menu"* para recomeçar
3️⃣ Falar com um humano: *"corretor"*

💡 *Dica:* Tente ser mais específico na sua busca!

_Estamos sempre melhorando para servi-lo melhor_ 🛠️`;
  },
  
  // Despedida
  getGoodbyeMessage: (name = 'Cliente') => {
    const hour = new Date().getHours();
    let farewell = 'Tenha um ótimo dia';
    
    if (hour >= 18) {
      farewell = 'Tenha uma excelente noite';
    } else if (hour >= 12) {
      farewell = 'Tenha uma ótima tarde';
    }
    
    return `👋 Foi um prazer atender você, ${name}!

🙏 *Obrigado por escolher a Imobiliária Premium Floripa*

📱 Salve nosso contato para:
• Receber lançamentos exclusivos
• Oportunidades antes do mercado
• Dicas sobre o mercado imobiliário

🎁 *Bônus:* Mostre esta conversa em sua visita e ganhe um brinde especial!

${farewell}! 🌟

_Para recomeçar, envie "menu" a qualquer momento_`;
  }
};

module.exports = messageTemplates;