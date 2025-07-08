// src/services/openaiService.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1';
    
    // Verificar se a API key existe
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API Key não configurada');
      return;
    }
    
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Contexto do assistente
    this.systemPrompt = `Você é um corretor de imóveis experiente e amigável da região de Florianópolis e Balneário Camboriú. 
    
Suas características:
- Nome: Carlos Silva
- Experiência: 15 anos no mercado imobiliário
- Especialidade: Imóveis de médio e alto padrão
- Personalidade: Profissional, atencioso, conhece bem a região

Diretrizes:
1. Sempre seja cordial e profissional
2. Use emojis moderadamente para tornar a conversa mais amigável
3. Entenda as necessidades do cliente fazendo perguntas relevantes
4. Forneça informações detalhadas sobre os imóveis
5. Destaque os pontos fortes de cada região
6. Seja honesto sobre prós e contras
7. Sempre tente agendar uma visita presencial
8. Se não souber algo, admita e ofereça buscar a informação

Conhecimento local:
- Jurerê Internacional: Bairro nobre, praias calmas, alta gastronomia
- Lagoa da Conceição: Boêmio, jovem, ótima vida noturna
- Centro: Prático, comércio, fácil acesso
- Campeche: Familiar, praia extensa, em valorização
- Balneário Camboriú: Urbano, arranha-céus, vida noturna intensa
- Santo Antônio de Lisboa: Histórico, pôr do sol, gastronomia

Sempre mencione que temos 30 imóveis disponíveis e personalize as sugestões baseado no perfil do cliente.`;
    
    // Cache de conversas para contexto
    this.conversationCache = new Map();
  }
  
  // Transcrever áudio para texto - CORRIGIDO
  async transcribeAudio(audioData, mimeType = 'audio/ogg') {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API Key não configurada');
      }
      
      console.log('🎤 Iniciando transcrição de áudio...');
      
      // Criar diretório temporário se não existir
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Determinar extensão baseada no mimeType
      let extension = 'ogg';
      if (mimeType.includes('mp4')) extension = 'mp4';
      if (mimeType.includes('mpeg')) extension = 'mp3';
      if (mimeType.includes('wav')) extension = 'wav';
      if (mimeType.includes('webm')) extension = 'webm';
      
      const tempPath = path.join(tempDir, `audio_${Date.now()}.${extension}`);
      
      // Salvar áudio
      if (Buffer.isBuffer(audioData)) {
        fs.writeFileSync(tempPath, audioData);
      } else if (typeof audioData === 'string') {
        // Se for base64
        const buffer = Buffer.from(audioData, 'base64');
        fs.writeFileSync(tempPath, buffer);
      } else {
        throw new Error('Formato de áudio não reconhecido');
      }
      
      console.log(`📁 Áudio salvo em: ${tempPath}`);
      console.log(`📊 Tamanho: ${fs.statSync(tempPath).size} bytes`);
      
      // Criar FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempPath));
      formData.append('model', 'whisper-1');
      formData.append('language', 'pt');
      formData.append('response_format', 'json');
      
      // Fazer requisição
      console.log('📤 Enviando para OpenAI Whisper...');
      const response = await axios.post(
        `${this.apiUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      // Limpar arquivo temporário
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        console.warn('Não foi possível deletar arquivo temporário');
      }
      
      console.log('✅ Transcrição concluída:', response.data.text);
      return response.data.text;
      
    } catch (error) {
      console.error('❌ Erro ao transcrever áudio:', error.response?.data || error.message);
      
      // Log mais detalhado do erro
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      
      throw new Error('Não foi possível transcrever o áudio. ' + (error.response?.data?.error?.message || error.message));
    }
  }
  
  // Melhorar resposta usando GPT
  async enhanceResponse(userMessage, botResponse, context = {}) {
    try {
      if (!this.apiKey) return botResponse;
      
      const messages = this.buildConversationContext(context.userId, userMessage, botResponse);
      
      const response = await this.api.post('/chat/completions', {
        model: 'gpt-3.5-turbo', // Use gpt-4 se tiver acesso
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      });
      
      const enhancedResponse = response.data.choices[0].message.content;
      
      // Atualizar cache de conversa
      this.updateConversationCache(context.userId, userMessage, enhancedResponse);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Erro ao melhorar resposta:', error.message);
      return botResponse;
    }
  }
  
  // Analisar intenção do usuário
  async analyzeIntent(userMessage, context = {}) {
    try {
      if (!this.apiKey) {
        return {
          intent: 'other',
          propertyType: 'any',
          sentiment: 'neutral'
        };
      }
      
      const response = await this.api.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analise a mensagem do usuário e identifique a intenção relacionada a imóveis.
            Responda APENAS com um JSON no formato:
            {
              "intent": "buy|rent|sell|visit|info|other",
              "propertyType": "house|apartment|land|commercial|any",
              "location": "nome do bairro ou cidade se mencionado",
              "priceRange": { "min": null, "max": null },
              "bedrooms": null,
              "features": ["features mencionadas"],
              "urgency": "high|medium|low",
              "sentiment": "positive|neutral|negative"
            }`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });
      
      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Erro ao analisar intenção:', error);
      return {
        intent: 'other',
        propertyType: 'any',
        sentiment: 'neutral'
      };
    }
  }
  
  // Gerar descrição criativa para imóvel
  async generatePropertyDescription(property) {
    try {
      if (!this.apiKey) return property.description;
      
      const prompt = `Crie uma descrição atraente e vendedora para este imóvel:
      
Tipo: ${property.type === 'house' ? 'Casa' : 'Apartamento'}
Localização: ${property.address}
Área: ${property.area}m²
Quartos: ${property.bedrooms} (${property.suites} suítes)
Valor: R$ ${property.price.toLocaleString('pt-BR')}
Características: ${property.features.join(', ')}

A descrição deve:
1. Ter no máximo 3 parágrafos
2. Destacar os pontos fortes
3. Criar desejo no cliente
4. Ser honesta mas persuasiva
5. Usar linguagem elegante mas acessível`;
      
      const response = await this.api.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um redator especializado em imóveis de alto padrão.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      return property.description;
    }
  }
  
  // Gerar sugestões personalizadas
  async generatePersonalizedSuggestions(userProfile, availableProperties) {
    try {
      if (!this.apiKey) return null;
      
      const prompt = `Baseado no perfil do cliente e nos imóveis disponíveis, sugira os 3 melhores:
      
Perfil do Cliente:
${JSON.stringify(userProfile, null, 2)}

Imóveis Disponíveis:
${availableProperties.map(p => `- ${p.title}: ${p.bedrooms} quartos, ${p.area}m², R$ ${p.price.toLocaleString('pt-BR')}`).join('\n')}

Forneça:
1. Os 3 imóveis mais adequados com justificativa
2. Um argumento de venda personalizado para cada um
3. Ordem de prioridade para apresentação`;
      
      const response = await this.api.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 500
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      return null;
    }
  }
  
  // Responder perguntas sobre a região
  async answerLocationQuestion(question) {
    try {
      if (!this.apiKey) {
        return 'Desculpe, não consegui processar sua pergunta no momento.';
      }
      
      const prompt = `Responda esta pergunta sobre a região de Florianópolis/Balneário Camboriú:
      
"${question}"

Forneça informações precisas e úteis sobre:
- Características do local
- Infraestrutura
- Pontos de interesse
- Perfil dos moradores
- Valorização imobiliária
- Prós e contras

Seja objetivo mas completo.`;
      
      const response = await this.api.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em imóveis da região de Florianópolis e Balneário Camboriú com 15 anos de experiência.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 400
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
      return 'Desculpe, não consegui processar sua pergunta no momento.';
    }
  }
  
  // Construir contexto da conversa
  buildConversationContext(userId, userMessage, botResponse) {
    const messages = [
      { role: 'system', content: this.systemPrompt }
    ];
    
    // Adicionar histórico se existir
    if (this.conversationCache.has(userId)) {
      const history = this.conversationCache.get(userId);
      // Pegar apenas as últimas 5 interações
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);
    }
    
    // Adicionar mensagem atual
    messages.push(
      { role: 'user', content: userMessage },
      { 
        role: 'assistant', 
        content: `Resposta atual do bot: ${botResponse}\n\nPor favor, melhore esta resposta mantendo a mesma intenção mas tornando-a mais natural, amigável e persuasiva.` 
      }
    );
    
    return messages;
  }
  
  // Atualizar cache de conversa
  updateConversationCache(userId, userMessage, assistantResponse) {
    if (!this.conversationCache.has(userId)) {
      this.conversationCache.set(userId, []);
    }
    
    const history = this.conversationCache.get(userId);
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantResponse }
    );
    
    // Limitar histórico para economizar tokens
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }
  
  // Limpar cache de conversa antiga (chamar periodicamente)
  cleanOldConversations() {
    const now = Date.now();
    for (const [userId, data] of this.conversationCache.entries()) {
      if (now - data.lastUpdate > 3600000) { // 1 hora
        this.conversationCache.delete(userId);
      }
    }
  }
}

module.exports = new OpenAIService();