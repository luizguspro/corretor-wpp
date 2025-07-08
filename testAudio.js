// testAudio.js - Script para testar recepção de áudio
const axios = require('axios');
require('dotenv').config();

async function checkWebhookConfig() {
  console.log('🔍 Verificando configuração do webhook...\n');
  
  try {
    // Verificar webhook atual
    const response = await axios.get(
      `${process.env.EVOLUTION_API_URL}/webhook/find/${process.env.INSTANCE_NAME}`,
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      }
    );
    
    console.log('📋 Configuração atual do webhook:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Verificar se messages.upsert está habilitado
    const webhook = response.data;
    if (webhook && webhook.events) {
      console.log('\n✅ Eventos habilitados:');
      webhook.events.forEach(event => console.log(`  - ${event}`));
      
      if (!webhook.events.includes('MESSAGES_UPSERT')) {
        console.log('\n❌ ERRO: MESSAGES_UPSERT não está habilitado!');
        console.log('Isso explica porque áudios não são recebidos.\n');
        
        // Corrigir configuração
        console.log('🔧 Tentando corrigir configuração...');
        await fixWebhook();
      } else {
        console.log('\n✅ MESSAGES_UPSERT está habilitado');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error.response?.data || error.message);
  }
}

async function fixWebhook() {
  try {
    const webhookConfig = {
      enabled: true,
      url: `http://localhost:${process.env.PORT}/webhook`,
      webhookByEvents: false,
      webhookBase64: true,
      events: [
        'APPLICATION_STARTUP',
        'QRCODE_UPDATED',
        'MESSAGES_SET',
        'MESSAGES_UPSERT',  // IMPORTANTE para receber mensagens
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'SEND_MESSAGE',
        'CONTACTS_SET',
        'CONTACTS_UPSERT',
        'CONTACTS_UPDATE',
        'PRESENCE_UPDATE',
        'CHATS_SET',
        'CHATS_UPSERT',
        'CHATS_UPDATE',
        'CHATS_DELETE',
        'GROUPS_UPSERT',
        'GROUPS_UPDATE',
        'GROUP_PARTICIPANTS_UPDATE',
        'CONNECTION_UPDATE',
        'LABELS_EDIT',
        'LABELS_ASSOCIATION',
        'CALL',
        'NEW_JWT_TOKEN'
      ]
    };
    
    // Tentar primeiro método PUT
    try {
      const response = await axios.put(
        `${process.env.EVOLUTION_API_URL}/webhook/set/${process.env.INSTANCE_NAME}`,
        webhookConfig,
        {
          headers: {
            'apikey': process.env.EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Webhook atualizado com sucesso!');
      console.log('Resposta:', response.data);
    } catch (putError) {
      // Se PUT falhar, tentar POST
      console.log('PUT falhou, tentando POST...');
      
      const postResponse = await axios.post(
        `${process.env.EVOLUTION_API_URL}/webhook/instance`,
        {
          instanceName: process.env.INSTANCE_NAME,
          ...webhookConfig
        },
        {
          headers: {
            'apikey': process.env.EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Webhook configurado via POST!');
      console.log('Resposta:', postResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir webhook:', error.response?.data || error.message);
  }
}

async function testInstance() {
  console.log('\n🔍 Verificando status da instância...\n');
  
  try {
    const response = await axios.get(
      `${process.env.EVOLUTION_API_URL}/instance/fetchInstances`,
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      }
    );
    
    let instance = null;
    if (Array.isArray(response.data)) {
      instance = response.data.find(i => i.instance.instanceName === process.env.INSTANCE_NAME);
    } else if (response.data.instance) {
      instance = response.data;
    }
    
    if (instance) {
      console.log('📱 Instância:', instance.instance.instanceName);
      console.log('📊 Status:', instance.instance.status || 'desconhecido');
      console.log('🔌 Conectada:', instance.instance.status === 'open' ? 'Sim' : 'Não');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar instância:', error.message);
  }
}

async function sendTestMessage() {
  console.log('\n📤 Enviando mensagem de teste...\n');
  
  try {
    const response = await axios.post(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.INSTANCE_NAME}`,
      {
        number: '554891399832@s.whatsapp.net', // Seu número
        textMessage: {
          text: '🧪 Teste de áudio:\n\n1. Envie um áudio agora\n2. Verifique os logs do bot\n3. O webhook deve mostrar "messages.upsert"'
        }
      },
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Mensagem enviada!');
    console.log('Agora envie um áudio e observe os logs.\n');
    
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando diagnóstico do webhook de áudio...\n');
  console.log('Configurações:');
  console.log('- API URL:', process.env.EVOLUTION_API_URL);
  console.log('- Instance:', process.env.INSTANCE_NAME);
  console.log('- Webhook URL:', `http://localhost:${process.env.PORT}/webhook`);
  console.log('- OpenAI Key:', process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Não configurada');
  console.log('\n' + '='.repeat(60) + '\n');
  
  await testInstance();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await checkWebhookConfig();
  console.log('\n' + '='.repeat(60) + '\n');
  
  await sendTestMessage();
}

runTests();