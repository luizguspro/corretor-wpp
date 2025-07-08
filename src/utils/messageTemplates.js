// src/utils/messageTemplates.js

const messageTemplates = {
  // Mensagem de boas-vindas
  getWelcomeMessage: (name = 'Cliente') => {
    const hour = new Date().getHours();
    let greeting = 'Bom dia';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde';
    } else if (hour >= 18) {
      greeting = 'Boa noite';
    }
    
    return `${greeting}, ${name}! 👋

Bem-vindo(a) à *Imobiliária XYZ*! 🏠

Sou seu assistente virtual e estou aqui para ajudar você a encontrar o imóvel perfeito ou auxiliar na venda/aluguel do seu imóvel.

Como posso te ajudar hoje? 😊`;
  },
  
  // Detalhes do imóvel
  getPropertyDetails: (property) => {
    return `🏠 *${property.title}*

📍 *Localização:* ${property.address}
💰 *Valor:* R$ ${property.price.toLocaleString('pt-BR')}
📐 *Área:* ${property.area}m²
🛏️ *Quartos:* ${property.bedrooms}
🚿 *Banheiros:* ${property.bathrooms}
🚗 *Vagas:* ${property.parking}

📝 *Descrição:*
${property.description}

✨ *Diferenciais:*
${property.features.map(f => `• ${f}`).join('\n')}

🔑 *Código:* ${property.code}`;
  },
  
  // Formulário de venda
  getSellingFormMessage: () => {
    return `🏠 *Vamos anunciar seu imóvel!*

Para começar, preciso de algumas informações:

1️⃣ *Tipo de imóvel* (casa, apartamento, terreno, etc)
2️⃣ *Endereço completo*
3️⃣ *Área em m²*
4️⃣ *Número de quartos e banheiros*
5️⃣ *Valor desejado*
6️⃣ *Seu telefone para contato*

Pode me enviar tudo em uma mensagem só! 📝

Exemplo:
"Casa na Rua das Flores 123, Centro, 150m², 3 quartos, 2 banheiros, R$ 450.000, (11) 98765-4321"`;
  },
  
  // Informações de contato
  getContactInfo: () => {
    return `📞 *Entre em contato conosco!*

🏢 *Imobiliária XYZ*

📱 *WhatsApp:* (11) 99999-9999
☎️ *Telefone:* (11) 3333-3333
📧 *E-mail:* contato@imobiliariaxyz.com.br

🕐 *Horário de atendimento:*
Segunda a Sexta: 8h às 18h
Sábado: 9h às 13h

📍 *Endereço:*
Rua Exemplo, 123 - Centro
São Paulo - SP
CEP: 01234-567

💬 Um de nossos corretores entrará em contato em breve!`;
  },
  
  // Confirmação de agendamento
  getScheduleConfirmation: (data) => {
    return `✅ *Visita Agendada com Sucesso!*

📅 *Data:* ${data.date}
🕐 *Horário:* ${data.time}
🏠 *Imóvel:* ${data.property}
📍 *Endereço:* ${data.address}

👤 *Corretor:* ${data.agent}
📱 *Contato:* ${data.agentPhone}

📝 *Observações:*
• Leve um documento com foto
• O corretor estará te esperando no local
• Em caso de imprevistos, avise com antecedência

Obrigado pela confiança! 🤝`;
  },
  
  // Mensagem de erro
  getErrorMessage: () => {
    return `❌ Ops! Ocorreu um erro ao processar sua solicitação.

Por favor, tente novamente ou digite "corretor" para falar com um de nossos atendentes.

Se preferir, ligue para: (11) 3333-3333 📞`;
  },
  
  // Mensagem de despedida
  getGoodbyeMessage: () => {
    return `Obrigado pelo contato! 🙏

Foi um prazer atender você. Esperamos ajudar a realizar seu sonho do imóvel próprio! 🏠✨

Sempre que precisar, estaremos aqui.
Digite "menu" para iniciar uma nova conversa.

Até breve! 👋`;
  }
};

module.exports = messageTemplates;