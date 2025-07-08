// src/controllers/webhookController.js
const messageService = require('../services/messageService');
const winston = require('winston');

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'webhook.log'
    })
  ]
});

class WebhookController {
  // Receber webhook da Evolution API
  async handleWebhook(req, res) {
    try {
      const { event, instance, data } = req.body;
      
      logger.info(`\n${'='.repeat(60)}`);
      logger.info(`Webhook recebido: ${event} - ${instance}`);
      logger.info('Body completo:', JSON.stringify(req.body, null, 2));
      
      // Verificar se é da instância correta
      if (instance !== process.env.INSTANCE_NAME) {
        logger.warn(`Instância diferente: ${instance} !== ${process.env.INSTANCE_NAME}`);
        return res.status(200).json({ status: 'ignored', reason: 'different instance' });
      }
      
      // Processar diferentes tipos de eventos
      switch (event) {
        case 'messages.upsert':
          logger.info('📨 Processando messages.upsert');
          await this.handleMessageUpsert(data);
          break;
          
        case 'connection.update':
          await this.handleConnectionUpdate(data);
          break;
          
        case 'qrcode.updated':
          await this.handleQRCodeUpdate(data);
          break;
          
        case 'messages.update':
          await this.handleMessageUpdate(data);
          break;
          
        case 'send.message':
          await this.handleSendMessage(data);
          break;
          
        default:
          logger.info(`Evento não tratado: ${event}`);
      }
      
      // Responder rapidamente ao webhook
      res.status(200).json({ status: 'success' });
      
    } catch (error) {
      logger.error(`Erro no webhook: ${error.message}`, error);
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
  
  // Lidar com novas mensagens
  async handleMessageUpsert(data) {
    try {
      logger.info('handleMessageUpsert - Data recebida:', JSON.stringify(data));
      
      // Evolution API envia os dados da mensagem diretamente no data
      let messageToProcess = null;
      
      // Se tem key e message, é uma mensagem completa
      if (data.key && data.message) {
        messageToProcess = data;
      } 
      // Se tem remoteJid e message no nível superior
      else if (data.remoteJid && data.message) {
        messageToProcess = {
          key: {
            remoteJid: data.remoteJid,
            fromMe: data.fromMe || false,
            id: data.id || 'msg-' + Date.now()
          },
          message: data.message,
          pushName: data.pushName || 'User',
          messageTimestamp: data.messageTimestamp
        };
      }
      // Se tem messages array
      else if (data.messages && Array.isArray(data.messages)) {
        for (const msg of data.messages) {
          await messageService.processMessage(msg);
        }
        return;
      }
      
      // Verificar se é mensagem de áudio
      if (messageToProcess && messageToProcess.message) {
        const message = messageToProcess.message;
        
        // Evolution API pode enviar áudio em diferentes formatos
        if (message.audioMessage || message.audio || message.mediaMessage) {
          logger.info('🎤 Mensagem de áudio detectada!');
          
          // Estrutura específica para áudio
          const audioData = message.audioMessage || message.audio || message.mediaMessage;
          logger.info('Estrutura do áudio:', JSON.stringify(audioData));
          
          // Evolution API geralmente envia o áudio como:
          // - base64: string base64 do arquivo
          // - url: URL para download
          // - mediaUrl: URL alternativa
          
          let audioInfo = {
            ...audioData,
            mimetype: audioData.mimetype || 'audio/ogg',
            // Se tem URL, vamos preferir ela
            url: audioData.url || audioData.mediaUrl || audioData.fileUrl
          };
          
          // Criar estrutura padronizada
          messageToProcess.message = {
            audioMessage: audioInfo
          };
        }
      }
      
      // Processar a mensagem
      if (messageToProcess) {
        logger.info('Processando mensagem estruturada:', JSON.stringify(messageToProcess));
        await messageService.processMessage(messageToProcess);
      } else {
        logger.error('Não foi possível processar mensagem. Estrutura inválida.');
      }
      
    } catch (error) {
      logger.error(`Erro ao processar mensagem: ${error.message}`, error);
    }
  }
  
  // Lidar com atualização de conexão
  async handleConnectionUpdate(data) {
    const { state } = data;
    
    logger.info(`Status da conexão: ${state}`);
    
    switch (state) {
      case 'open':
        logger.info('WhatsApp conectado com sucesso!');
        break;
        
      case 'close':
        logger.warn('Conexão com WhatsApp fechada');
        break;
        
      case 'connecting':
        logger.info('Conectando ao WhatsApp...');
        break;
    }
  }
  
  // Lidar com atualização do QR Code
  async handleQRCodeUpdate(data) {
    const { qrcode } = data;
    
    if (qrcode) {
      logger.info('Novo QR Code disponível');
      logger.info(`QR Code: ${qrcode.substring(0, 50)}...`);
      
      console.log('\n\n=== QR CODE PARA ESCANEAR ===');
      console.log('Acesse: https://www.qr-code-generator.com/');
      console.log('Cole o código abaixo para gerar o QR Code:');
      console.log(qrcode);
      console.log('===========================\n\n');
    }
  }
  
  // Lidar com atualização de mensagem
  async handleMessageUpdate(data) {
    // Implementar lógica para mensagens editadas/deletadas se necessário
    logger.info('Mensagem atualizada', data);
  }
  
  // Lidar com confirmação de envio
  async handleSendMessage(data) {
    const { key, status } = data;
    
    if (status === 'ERROR') {
      logger.error(`Erro ao enviar mensagem: ${key.id}`);
    } else {
      logger.info(`Mensagem enviada com sucesso: ${key.id}`);
    }
  }
  
  // Middleware para validar webhook
  validateWebhook(req, res, next) {
    // Verificar se tem body
    if (!req.body) {
      return res.status(400).json({ error: 'No body provided' });
    }
    
    next();
  }
}

module.exports = new WebhookController();