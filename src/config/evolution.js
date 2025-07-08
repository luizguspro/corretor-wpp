// src/config/evolution.js
require('dotenv').config();

const evolutionConfig = {
  apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
  apiKey: process.env.EVOLUTION_API_KEY,
  instanceName: process.env.INSTANCE_NAME || 'bot-corretor',
  
  // Configurações de webhook
  webhook: {
    url: `http://localhost:${process.env.PORT}/webhook`,
    enabled: true,
    events: [
      'messages.upsert',
      'messages.update',
      'messages.delete',
      'send.message',
      'connection.update',
      'qrcode.updated'
    ]
  },
  
  // Configurações de timeout e retry
  timeout: 60000, // 60 segundos
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
  
  // Headers padrão
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.EVOLUTION_API_KEY
  }
};

module.exports = evolutionConfig;