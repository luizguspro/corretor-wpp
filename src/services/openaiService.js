// src/services/openaiService.js - VERSÃO ATUALIZADA COM NOVOS MODELOS
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API Key não configurada');
      return;
    }
    
    // MODELOS ATUALIZADOS - Documentação oficial OpenAI
    this.chatModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    // Novos modelos de transcrição (escolha um):
    // - gpt-4o-transcribe (mais qualidade)
    // - gpt-4o-mini-transcribe (mais rápido e barato)
    // - whisper-1 (modelo clássico com mais opções)
    this.whisperModel = process.env.WHISPER_MODEL || 'gpt-4o-mini-transcribe';
    
    console.log(`🤖 OpenAI Service inicializado`);
    console.log(`📊 Modelo de chat: ${this.chatModel}`);
    console.log(`🎤 Modelo de transcrição: ${this.whisperModel}`);
    
    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
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
8. Se não souber algo, admita e ofereça buscar a informação`;
    
    this.conversationCache = new Map();
  }
  
  // Transcrever áudio - VERSÃO COM NOVOS MODELOS
  async transcribeAudio(audioData, mimeType = 'audio/ogg') {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API Key não configurada');
      }
      
      console.log('🎤 [OpenAI] Iniciando transcrição...');
      console.log(`📊 [OpenAI] Modelo: ${this.whisperModel}`);
      console.log(`📊 [OpenAI] Dados:`, {
        tipo: Buffer.isBuffer(audioData) ? 'Buffer' : typeof audioData,
        tamanho: audioData.length,
        mimeType: mimeType
      });
      
      // Criar diretório temporário
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Mapear mime types para extensões
      const extensionMap = {
        'audio/ogg': 'ogg',
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
        'audio/mp4': 'm4a',
        'audio/x-m4a': 'm4a',
        'audio/wav': 'wav',
        'audio/webm': 'webm',
        'audio/opus': 'opus',
        'audio/x-opus+ogg': 'opus'
      };
      
      const extension = extensionMap[mimeType] || 'ogg';
      
      // Nome único para o arquivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `audio_${timestamp}_${random}.${extension}`;
      const filepath = path.join(tempDir, filename);
      
      console.log(`📁 [OpenAI] Salvando áudio: ${filename}`);
      
      // Converter e salvar áudio
      let audioBuffer;
      if (Buffer.isBuffer(audioData)) {
        audioBuffer = audioData;
      } else if (typeof audioData === 'string') {
        // Remover header data:audio se existir
        let base64Data = audioData;
        if (base64Data.includes('base64,')) {
          base64Data = base64Data.split('base64,')[1];
        }
        audioBuffer = Buffer.from(base64Data, 'base64');
      } else {
        throw new Error('Formato de áudio não suportado');
      }
      
      // Verificar tamanho (limite: 25MB)
      const fileSizeMB = audioBuffer.length / (1024 * 1024);
      console.log(`📊 [OpenAI] Tamanho: ${fileSizeMB.toFixed(2)}MB`);
      
      if (fileSizeMB > 25) {
        throw new Error('Arquivo muito grande. Máximo: 25MB');
      }
      
      // Salvar arquivo
      fs.writeFileSync(filepath, audioBuffer);
      
      // Verificar se foi salvo
      const stats = fs.statSync(filepath);
      if (stats.size === 0) {
        throw new Error('Arquivo salvo está vazio');
      }
      
      console.log(`✅ [OpenAI] Arquivo salvo: ${stats.size} bytes`);
      
      // Criar FormData
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filepath), {
        filename: filename,
        contentType: mimeType || 'audio/ogg'
      });
      
      formData.append('model', this.whisperModel);
      
      // Configurações baseadas no modelo
      if (this.whisperModel.includes('gpt-4o')) {
        // Novos modelos só suportam json ou text
        formData.append('response_format', 'json');
        
        // Prompt melhorado para os novos modelos
        const prompt = 'Transcreva fielmente este áudio em português brasileiro. ' +
                      'Contexto: cliente procurando imóveis para comprar, vender ou alugar em Florianópolis. ' +
                      'Preserve a forma natural de falar, incluindo pausas e hesitações. ' +
                      'Termos comuns do mercado: kitnet, quitinete, JK, studio, cobertura, duplex, sobrado, ' +
                      'geminado, garden, loft, flat, home office, pet friendly, vista mar, pé na areia.';
        
        formData.append('prompt', prompt);
        
      } else {
        // whisper-1 tem mais opções
        formData.append('response_format', 'json');
        formData.append('language', 'pt');
        formData.append('prompt', 'Transcreva o áudio em português brasileiro sobre imóveis.');
      }
      
      console.log('📤 [OpenAI] Enviando para API...');
      
      // Fazer requisição
      const startTime = Date.now();
      const response = await axios.post(
        `${this.apiUrl}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000 // 2 minutos
        }
      );
      
      const processingTime = Date.now() - startTime;
      console.log(`⏱️ [OpenAI] Tempo: ${processingTime}ms`);
      
      // Limpar arquivo temporário
      try {
        fs.unlinkSync(filepath);
        console.log('🗑️ [OpenAI] Arquivo temporário removido');
      } catch (cleanupError) {
        console.warn('⚠️ [OpenAI] Não foi possível remover arquivo temporário');
      }
      
      // Validar resposta
      if (!response.data || typeof response.data.text !== 'string') {
        console.error('❌ [OpenAI] Resposta inválida:', response.data);
        throw new Error('Resposta inválida da API');
      }
      
      const transcription = response.data.text.trim();
      
      if (!transcription || transcription.length < 2) {
        throw new Error('Transcrição vazia ou muito curta');
      }
      
      console.log('✅ [OpenAI] Transcrição:', transcription);
      
      return transcription;
      
    } catch (error) {
      console.error('❌ [OpenAI] Erro na transcrição:', error);
      
      // Limpar arquivo temporário em caso de erro
      if (filepath && fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
        } catch (e) {}
      }
      
      // Tratamento detalhado de erros
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        console.error('[OpenAI] Status:', status);
        console.error('[OpenAI] Resposta:', JSON.stringify(errorData, null, 2));
        
        if (status === 401) {
          throw new Error('API Key inválida. Verifique sua chave OpenAI.');
        } else if (status === 413) {
          throw new Error('Áudio muito grande. Máximo: 25MB.');
        } else if (status === 415) {
          throw new Error('Formato não suportado. Use: mp3, mp4, mpeg, mpga, m4a, wav, webm.');
        } else if (status === 429) {
          throw new Error('Limite de requisições. Aguarde um momento.');
        } else if (status === 400) {
          const errorMessage = errorData?.error?.message || 'Requisição inválida';
          
          // Verificar se é erro de modelo
          if (errorMessage.includes('model')) {
            throw new Error(`Modelo "${this.whisperModel}" não disponível. Use: whisper-1, gpt-4o-transcribe ou gpt-4o-mini-transcribe`);
          }
          
          throw new Error(`Erro: ${errorMessage}`);
        } else {
          throw new Error(`Erro ${status}: ${errorData?.error?.message || 'Desconhecido'}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Tempo limite. Áudio muito longo.');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Sem conexão com OpenAI.');
      } else {
        throw error;
      }
    }
  }
  
  // Melhorar resposta usando GPT
  async enhanceResponse(userMessage, botResponse, context = {}) {
    try {
      if (!this.apiKey) return botResponse;
      
      const messages = this.buildConversationContext(context.userId, userMessage, botResponse);
      
      const response = await this.api.post('/chat/completions', {
        model: this.chatModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      });
      
      const enhancedResponse = response.data.choices[0].message.content;
      
      this.updateConversationCache(context.userId, userMessage, enhancedResponse);
      
      return enhancedResponse;
    } catch (error) {
      console.error('[OpenAI] Erro ao melhorar resposta:', error.response?.data || error.message);
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
        model: this.chatModel,
        messages: [
          {
            role: 'system',
            content: `Analise a mensagem e retorne APENAS um JSON válido com a intenção do usuário sobre imóveis.`
          },
          {
            role: 'user',
            content: `Analise: "${userMessage}"\n\nRetorne JSON: {"intent": "buy|rent|sell|visit|info|other", "propertyType": "house|apartment|land|commercial|any", "location": "bairro/cidade se mencionado", "priceRange": {"min": null, "max": null}, "bedrooms": null, "features": [], "urgency": "high|medium|low", "sentiment": "positive|neutral|negative"}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });
      
      const content = response.data.choices[0].message.content;
      
      // Extrair JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('[OpenAI] Erro ao analisar intenção:', error.message);
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
        model: this.chatModel,
        messages: [
          { role: 'system', content: 'Você é um redator especializado em imóveis de alto padrão.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('[OpenAI] Erro ao gerar descrição:', error.response?.data || error.message);
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
2. Um argumento de venda personalizado
3. Ordem de prioridade`;
      
      const response = await this.api.post('/chat/completions', {
        model: this.chatModel,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 500
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('[OpenAI] Erro ao gerar sugestões:', error.response?.data || error.message);
      return null;
    }
  }
  
  // Responder perguntas sobre a região
  async answerLocationQuestion(question) {
    try {
      if (!this.apiKey) {
        return 'Desculpe, não consegui processar sua pergunta.';
      }
      
      const response = await this.api.post('/chat/completions', {
        model: this.chatModel,
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em imóveis de Florianópolis e Balneário Camboriú.' 
          },
          { 
            role: 'user', 
            content: `Responda sobre a região: "${question}"\n\nInclua: características, infraestrutura, perfil dos moradores, valorização.`
          }
        ],
        temperature: 0.5,
        max_tokens: 400
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('[OpenAI] Erro ao responder:', error.response?.data || error.message);
      return 'Desculpe, não consegui processar sua pergunta.';
    }
  }
  
  // Construir contexto da conversa
  buildConversationContext(userId, userMessage, botResponse) {
    const messages = [
      { role: 'system', content: this.systemPrompt }
    ];
    
    if (this.conversationCache.has(userId)) {
      const history = this.conversationCache.get(userId);
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);
    }
    
    messages.push(
      { role: 'user', content: userMessage },
      { 
        role: 'assistant', 
        content: `Resposta atual: ${botResponse}\n\nMelhore mantendo a mesma intenção mas tornando-a mais natural e persuasiva.` 
      }
    );
    
    return messages;
  }
  
  // Atualizar cache
  updateConversationCache(userId, userMessage, assistantResponse) {
    if (!this.conversationCache.has(userId)) {
      this.conversationCache.set(userId, []);
    }
    
    const history = this.conversationCache.get(userId);
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantResponse }
    );
    
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }
  
  // Limpar conversas antigas
  cleanOldConversations() {
    const now = Date.now();
    for (const [userId, data] of this.conversationCache.entries()) {
      if (now - data.lastUpdate > 3600000) {
        this.conversationCache.delete(userId);
      }
    }
  }
}

module.exports = new OpenAIService();