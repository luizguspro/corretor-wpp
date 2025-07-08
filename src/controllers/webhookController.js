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
  
  // Lidar com novas mensagens - VERSÃO CORRIGIDA
  async handleMessageUpsert(data) {
    try {
      logger.info('handleMessageUpsert - Data recebida:', JSON.stringify(data));
      
      // Evolution API v2 envia diretamente no data
      let messageToProcess = null;
      
      if (data.key && data.message) {
        messageToProcess = data;
      }
      
      if (!messageToProcess) {
        logger.error('Estrutura de mensagem inválida');
        return;
      }
      
      // CORREÇÃO PRINCIPAL: Detectar e processar áudio corretamente
      if (messageToProcess.message?.audioMessage) {
        logger.info('🎤 Áudio detectado! Estrutura:', {
          hasBase64: !!messageToProcess.message.audioMessage.base64,
          hasUrl: !!messageToProcess.message.audioMessage.url,
          hasMediaUrl: !!messageToProcess.message.audioMessage.mediaUrl,
          mimetype: messageToProcess.message.audioMessage.mimetype,
          seconds: messageToProcess.message.audioMessage.seconds,
          // Campos adicionais para debug
          hasFileLength: !!messageToProcess.message.audioMessage.fileLength,
          hasPtt: !!messageToProcess.message.audioMessage.ptt,
          allKeys: Object.keys(messageToProcess.message.audioMessage)
        });
        
        // Evolution API v2 geralmente envia em base64
        const audioData = messageToProcess.message.audioMessage;
        
        // Log completo do audioMessage para debug
        logger.info('AudioMessage completo:', JSON.stringify(audioData, null, 2));
        
        // Garantir que temos dados de áudio
        if (!audioData.base64 && !audioData.url && !audioData.mediaUrl) {
          logger.error('Áudio sem base64 ou URL');
          await messageService.processMessage({
            ...messageToProcess,
            message: {
              conversation: '🎤 Desculpe, não consegui processar seu áudio. Por favor, tente novamente ou digite sua mensagem.'
            }
          });
          return;
        }
        
        // Estrutura limpa para o messageService
        messageToProcess.message = {
          audioMessage: {
            base64: audioData.base64 || null,
            url: audioData.url || audioData.mediaUrl || null,
            mimetype: audioData.mimetype || 'audio/ogg',
            seconds: audioData.seconds || 0,
            fileLength: audioData.fileLength || 0,
            ptt: audioData.ptt || false
          }
        };
        
        logger.info('Áudio estruturado para processamento:', {
          hasBase64: !!messageToProcess.message.audioMessage.base64,
          base64Length: messageToProcess.message.audioMessage.base64?.length || 0,
          url: messageToProcess.message.audioMessage.url,
          mimetype: messageToProcess.message.audioMessage.mimetype
        });
      }
      
      // Processar mensagem
      await messageService.processMessage(messageToProcess);
      
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