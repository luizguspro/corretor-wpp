// src/services/evolutionService.js
const axios = require('axios');
const evolutionConfig = require('../config/evolution');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class EvolutionService {
  constructor() {
    this.api = axios.create({
      baseURL: evolutionConfig.apiUrl,
      timeout: evolutionConfig.timeout,
      headers: evolutionConfig.headers
    });
    
    // Interceptor para log de requisições
    this.api.interceptors.request.use(
      config => {
        logger.info(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        logger.error(`API Request Error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }
  
  // Criar instância
  async createInstance() {
    try {
      const response = await this.api.post('/instance/create', {
        instanceName: evolutionConfig.instanceName,
        qrcode: true
      });
      
      logger.info('Instância criada com sucesso');
      return response.data;
    } catch (error) {
      logger.error(`Erro ao criar instância: ${error.message}`);
      throw error;
    }
  }
  
  // Conectar instância - Evolution API v1 usa GET e retorna QR Code
  async connectInstance() {
    try {
      const response = await this.api.get(`/instance/connect/${evolutionConfig.instanceName}`);
      logger.info('Conectando instância...');
      
      // O QR Code vem direto na resposta do connect!
      if (response.data && response.data.code) {
        this.lastQRCode = {
          code: response.data.code,
          base64: response.data.base64,
          count: response.data.count
        };
      }
      
      return response.data;
    } catch (error) {
      logger.error(`Erro ao conectar instância: ${error.message}`);
      throw error;
    }
  }
  
  // Obter QR Code - Primeiro tenta o último QR Code salvo, depois busca na lista
  async getQRCode() {
    try {
      // Se temos um QR Code salvo do connect, retornar ele
      if (this.lastQRCode && this.lastQRCode.code) {
        const qr = this.lastQRCode;
        this.lastQRCode = null; // Limpar após uso
        return qr;
      }
      
      // Senão, buscar na lista de instâncias
      const response = await this.api.get('/instance/fetchInstances');
      
      if (response.data) {
        let instance = null;
        
        // Se for array, procurar nossa instância
        if (Array.isArray(response.data)) {
          instance = response.data.find(
            inst => inst.instance.instanceName === evolutionConfig.instanceName
          );
        } else if (response.data.instance && response.data.instance.instanceName === evolutionConfig.instanceName) {
          // Se retornar objeto direto
          instance = response.data;
        }
        
        // Verificar QR Code do debug - pode estar em lugares diferentes
        if (instance) {
          // Primeiro tentar no lugar padrão
          if (instance.instance && instance.instance.qrcode) {
            return { 
              code: instance.instance.qrcode.code,
              base64: instance.instance.qrcode.base64 
            };
          }
          // Tentar no nível superior
          if (instance.qrcode) {
            return {
              code: instance.qrcode.code,
              base64: instance.qrcode.base64
            };
          }
        }
      }
      
      throw new Error('QR Code não disponível');
    } catch (error) {
      logger.error(`Erro ao obter QR Code: ${error.message}`);
      throw error;
    }
  }
  
  // Verificar status da conexão
  async getConnectionStatus() {
    try {
      const response = await this.api.get('/instance/fetchInstances');
      
      if (response.data) {
        // Se for array, procurar nossa instância
        if (Array.isArray(response.data)) {
          const instance = response.data.find(
            inst => inst.instance.instanceName === evolutionConfig.instanceName
          );
          
          if (instance) {
            return { 
              state: instance.instance.status || 'close',
              status: instance.instance.status || 'disconnected'
            };
          }
        } else if (response.data.instance) {
          // Se retornar objeto direto
          return {
            state: response.data.instance.status || 'close',
            status: response.data.instance.status || 'disconnected'
          };
        }
      }
      
      throw new Error('Instância não encontrada');
    } catch (error) {
      logger.error(`Erro ao verificar status: ${error.message}`);
      throw error;
    }
  }
  
  // Enviar mensagem de texto
  async sendTextMessage(number, text, options = {}) {
    try {
      const response = await this.api.post(`/message/sendText/${evolutionConfig.instanceName}`, {
        number: this.formatPhoneNumber(number),
        textMessage: {
          text: text
        },
        options: {
          delay: options.delay || 1000,
          presence: 'composing',
          ...options
        }
      });
      
      logger.info(`Mensagem enviada para ${number}`);
      return response.data;
    } catch (error) {
      logger.error(`Erro ao enviar mensagem: ${error.message}`);
      throw error;
    }
  }
  
  // Enviar mensagem com botões
  async sendButtonMessage(number, content) {
    try {
      // Estrutura correta para Evolution API v1
      const buttonMessage = {
        number: this.formatPhoneNumber(number),
        options: {
          delay: 1200,
          presence: 'composing'
        },
        buttonMessage: {
          title: content.title,
          description: content.description,
          footer: content.footer || 'Powered by Bot Corretor',
          buttons: content.buttons.map(button => ({
            buttonText: {
              displayText: button.buttonText?.displayText || button.buttonText
            },
            buttonId: button.buttonId
          }))
        }
      };
      
      logger.info(`Enviando botões para ${number}:`, JSON.stringify(buttonMessage, null, 2));
      
      const response = await this.api.post(`/message/sendButtons/${evolutionConfig.instanceName}`, buttonMessage);
      
      return response.data;
    } catch (error) {
      logger.error(`Erro ao enviar mensagem com botões: ${error.message}`);
      
      // Se falhar, tentar enviar como mensagem de texto
      if (error.response?.status === 400) {
        logger.info('Botões falharam, enviando como texto...');
        
        let textMessage = `${content.title}\n\n${content.description}\n\n`;
        
        content.buttons.forEach((button, index) => {
          const text = button.buttonText?.displayText || button.buttonText;
          textMessage += `${index + 1}. ${text}\n`;
        });
        
        textMessage += `\n_${content.footer || 'Digite o número da opção desejada'}_`;
        
        return await this.sendTextMessage(number, textMessage);
      }
      
      throw error;
    }
  }
  
  // Enviar lista
  async sendListMessage(number, content) {
    try {
      // Estrutura correta para Evolution API v1
      const listMessage = {
        number: this.formatPhoneNumber(number),
        options: {
          delay: 1200,
          presence: 'composing'
        },
        listMessage: {
          title: content.title,
          description: content.description,
          buttonText: content.buttonText || 'Ver opções',
          footerText: content.footer || 'Powered by Bot Corretor',
          sections: content.sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              title: row.title,
              rowId: row.rowId,
              description: row.description || ''
            }))
          }))
        }
      };
      
      logger.info(`Enviando lista para ${number}:`, JSON.stringify(listMessage, null, 2));
      
      const response = await this.api.post(`/message/sendList/${evolutionConfig.instanceName}`, listMessage);
      
      return response.data;
    } catch (error) {
      logger.error(`Erro ao enviar lista: ${error.message}`);
      
      // Se falhar, tentar enviar como mensagem de texto com botões
      if (error.response?.status === 400) {
        logger.info('Lista falhou, tentando enviar como mensagem com botões...');
        
        // Converter lista em mensagem de texto formatada
        let textMessage = `${content.title}\n\n${content.description}\n\n`;
        
        content.sections.forEach(section => {
          textMessage += `*${section.title}*\n`;
          section.rows.forEach(row => {
            textMessage += `• ${row.title}\n`;
            if (row.description) {
              textMessage += `  _${row.description}_\n`;
            }
          });
          textMessage += '\n';
        });
        
        textMessage += `_${content.footer || 'Powered by Bot Corretor'}_`;
        
        return await this.sendTextMessage(number, textMessage);
      }
      
      throw error;
    }
  }
  
  // Enviar imagem
  async sendImageMessage(number, media, caption = '') {
    try {
      // Estrutura correta para Evolution API v1
      const mediaMessage = {
        number: this.formatPhoneNumber(number),
        options: {
          delay: 1200,
          presence: 'composing'
        },
        mediaMessage: {
          mediatype: 'image',
          media: media,
          caption: caption
        }
      };
      
      logger.info(`Enviando imagem para ${number}:`, JSON.stringify(mediaMessage, null, 2));
      
      const response = await this.api.post(`/message/sendMedia/${evolutionConfig.instanceName}`, mediaMessage);
      
      return response.data;
    } catch (error) {
      logger.error(`Erro ao enviar imagem: ${error.message}`);
      
      // Se falhar, tentar estrutura alternativa
      if (error.response?.status === 400) {
        logger.info('Primeira tentativa falhou, tentando estrutura alternativa...');
        
        try {
          // Estrutura alternativa
          const altMediaMessage = {
            number: this.formatPhoneNumber(number),
            media: media,
            mediatype: 'image',
            caption: caption
          };
          
          const altResponse = await this.api.post(`/message/sendMedia/${evolutionConfig.instanceName}`, altMediaMessage);
          return altResponse.data;
        } catch (altError) {
          logger.error('Estrutura alternativa também falhou');
          
          // Última tentativa: enviar só o texto com link
          logger.info('Enviando como texto com link da imagem...');
          const textMessage = `${caption}\n\n🔗 Veja a imagem: ${media}`;
          return await this.sendTextMessage(number, textMessage);
        }
      }
      
      throw error;
    }
  }
  
  // Enviar localização
  async sendLocationMessage(number, latitude, longitude, name = '', address = '') {
    try {
      const response = await this.api.post(`/message/sendLocation/${evolutionConfig.instanceName}`, {
        number: this.formatPhoneNumber(number),
        latitude: latitude,
        longitude: longitude,
        name: name,
        address: address
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Erro ao enviar localização: ${error.message}`);
      throw error;
    }
  }
  
  // Configurar webhook
  async setWebhook() {
    try {
      const response = await this.api.put(`/webhook/set/${evolutionConfig.instanceName}`, {
        enabled: true,
        url: evolutionConfig.webhook.url,
        webhookByEvents: false,
        webhookBase64: true,
        events: [
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE', 
          'MESSAGES_DELETE',
          'CONNECTION_UPDATE',
          'QRCODE_UPDATED'
        ]
      });
      
      logger.info('Webhook configurado com sucesso');
      return response.data;
    } catch (error) {
      logger.error(`Erro ao configurar webhook: ${error.message}`);
      // Tentar método alternativo
      try {
        const altResponse = await this.api.post(`/webhook/instance`, {
          instanceName: evolutionConfig.instanceName,
          enabled: true,
          url: evolutionConfig.webhook.url,
          events: ['all']
        });
        logger.info('Webhook configurado (método alternativo)');
        return altResponse.data;
      } catch (altError) {
        throw error;
      }
    }
  }
  
  // Formatar número de telefone
  formatPhoneNumber(number) {
    // Remove caracteres não numéricos
    let cleaned = number.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    // Adiciona @s.whatsapp.net
    return cleaned + '@s.whatsapp.net';
  }
  
  // Verificar se é número válido
  async checkNumberExists(number) {
    try {
      const response = await this.api.get(
        `/chat/whatsappNumbers/${evolutionConfig.instanceName}?numbers=${this.formatPhoneNumber(number)}`
      );
      
      return response.data && response.data.length > 0;
    } catch (error) {
      logger.error(`Erro ao verificar número: ${error.message}`);
      return false;
    }
  }
}

module.exports = new EvolutionService();