// debugAudio.js - Script completo de diagnóstico e correção
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Cores para o console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const color = type === 'error' ? colors.red : 
                type === 'success' ? colors.green :
                type === 'warning' ? colors.yellow : colors.blue;
  
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

// 1. Verificar configuração do webhook
async function checkWebhookConfig() {
  log('\n🔍 VERIFICANDO WEBHOOK...', 'info');
  
  try {
    // Primeiro, tentar buscar webhook existente
    let webhookExists = false;
    try {
      const findResponse = await axios.get(
        `${process.env.EVOLUTION_API_URL}/webhook/find/${process.env.INSTANCE_NAME}`,
        {
          headers: { 'apikey': process.env.EVOLUTION_API_KEY }
        }
      );
      
      if (findResponse.data) {
        webhookExists = true;
        log('Webhook encontrado:', 'success');
        console.log(JSON.stringify(findResponse.data, null, 2));
      }
    } catch (e) {
      log('Webhook não encontrado, será criado', 'warning');
    }

    // Configuração correta do webhook para Evolution v2
    const webhookConfig = {
      enabled: true,
      url: `http://localhost:${process.env.PORT || 3000}/webhook`,
      webhookByEvents: false,
      webhookBase64: true, // IMPORTANTE para receber base64 dos áudios
      events: [
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'CONNECTION_UPDATE',
        'QRCODE_UPDATED'
      ]
    };

    // Tentar configurar/atualizar webhook
    try {
      const setResponse = await axios.put(
        `${process.env.EVOLUTION_API_URL}/webhook/set/${process.env.INSTANCE_NAME}`,
        webhookConfig,
        {
          headers: {
            'apikey': process.env.EVOLUTION_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      log('✅ Webhook configurado corretamente!', 'success');
      return true;
    } catch (error) {
      log(`Erro ao configurar webhook: ${error.message}`, 'error');
      
      // Tentar método alternativo
      try {
        const altResponse = await axios.post(
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
        log('✅ Webhook configurado (método alternativo)!', 'success');
        return true;
      } catch (altError) {
        log('Falha total ao configurar webhook', 'error');
        return false;
      }
    }
  } catch (error) {
    log(`Erro geral no webhook: ${error.message}`, 'error');
    return false;
  }
}

// 2. Verificar configuração da Evolution
async function checkEvolutionSettings() {
  log('\n🔧 VERIFICANDO CONFIGURAÇÕES DA EVOLUTION API...', 'info');
  
  try {
    // Verificar configurações globais
    const globalSettings = await axios.get(
      `${process.env.EVOLUTION_API_URL}/settings/find`,
      {
        headers: { 'apikey': process.env.EVOLUTION_API_KEY }
      }
    );
    
    if (globalSettings.data) {
      log('Configurações globais:', 'info');
      console.log(JSON.stringify(globalSettings.data, null, 2));
    }
  } catch (error) {
    log('Não foi possível obter configurações globais', 'warning');
  }

  // Verificar configurações da instância
  try {
    const instanceSettings = await axios.get(
      `${process.env.EVOLUTION_API_URL}/settings/find/${process.env.INSTANCE_NAME}`,
      {
        headers: { 'apikey': process.env.EVOLUTION_API_KEY }
      }
    );
    
    if (instanceSettings.data) {
      log('Configurações da instância:', 'info');
      console.log(JSON.stringify(instanceSettings.data, null, 2));
    }
  } catch (error) {
    log('Não foi possível obter configurações da instância', 'warning');
  }
}

// 3. Testar recepção de mensagem normal
async function testTextMessage() {
  log('\n📝 TESTANDO MENSAGEM DE TEXTO...', 'info');
  
  try {
    const testNumber = process.env.TEST_PHONE || '554891399832';
    
    const response = await axios.post(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.INSTANCE_NAME}`,
      {
        number: `${testNumber}@s.whatsapp.net`,
        textMessage: {
          text: '🧪 TESTE DE ÁUDIO - EVOLUTION API\n\n' +
                '1. Responda com uma mensagem de texto\n' +
                '2. Depois envie um áudio\n' +
                '3. Observe os logs do terminal\n\n' +
                'Se funcionar, você verá:\n' +
                '✅ Texto: "conversation" no webhook\n' +
                '✅ Áudio: "audioMessage" com base64'
        }
      },
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    log('✅ Mensagem de teste enviada!', 'success');
    log(`Verifique seu WhatsApp: ${testNumber}`, 'info');
    
  } catch (error) {
    log(`Erro ao enviar mensagem: ${error.response?.data?.message || error.message}`, 'error');
  }
}

// 4. Monitorar webhook em tempo real
async function monitorWebhook() {
  log('\n👂 MONITORANDO WEBHOOK (Ctrl+C para parar)...', 'info');
  
  // Criar servidor Express temporário para debug
  const express = require('express');
  const app = express();
  const debugPort = 4000;
  
  app.use(express.json({ limit: '50mb' }));
  
  app.post('/webhook-debug', (req, res) => {
    const { event, data } = req.body;
    
    log(`\n📨 WEBHOOK RECEBIDO: ${event}`, 'success');
    
    if (event === 'messages.upsert' && data?.message) {
      const message = data.message;
      
      // Detectar tipo de mensagem
      if (message.conversation) {
        log('Tipo: TEXTO', 'info');
        log(`Conteúdo: ${message.conversation}`, 'info');
      } else if (message.audioMessage) {
        log('Tipo: ÁUDIO DETECTADO! 🎤', 'success');
        
        // Análise detalhada do áudio
        const audio = message.audioMessage;
        log('\nEstrutura do áudio:', 'info');
        log(`- Base64 presente: ${!!audio.base64}`, audio.base64 ? 'success' : 'error');
        log(`- Tamanho base64: ${audio.base64?.length || 0} caracteres`, 'info');
        log(`- URL presente: ${!!audio.url}`, 'info');
        log(`- Mimetype: ${audio.mimetype}`, 'info');
        log(`- Duração: ${audio.seconds} segundos`, 'info');
        log(`- PTT (voice note): ${audio.ptt}`, 'info');
        log(`- Tamanho arquivo: ${audio.fileLength} bytes`, 'info');
        
        // Salvar áudio para análise
        if (audio.base64) {
          try {
            const audioDir = path.join(__dirname, 'audio_debug');
            if (!fs.existsSync(audioDir)) {
              fs.mkdirSync(audioDir);
            }
            
            const filename = `audio_${Date.now()}.ogg`;
            const filepath = path.join(audioDir, filename);
            
            let base64Data = audio.base64;
            if (base64Data.includes('base64,')) {
              base64Data = base64Data.split('base64,')[1];
            }
            
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filepath, buffer);
            
            log(`✅ Áudio salvo em: ${filepath}`, 'success');
            log(`Tamanho do arquivo: ${buffer.length} bytes`, 'info');
            
            // Testar transcrição
            await testTranscription(filepath, audio.mimetype);
            
          } catch (saveError) {
            log(`Erro ao salvar áudio: ${saveError.message}`, 'error');
          }
        }
      } else if (message.imageMessage) {
        log('Tipo: IMAGEM', 'info');
      } else {
        log('Tipo: OUTRO', 'warning');
        log('Estrutura:', 'info');
        console.log(JSON.stringify(message, null, 2));
      }
    }
    
    res.json({ status: 'ok' });
  });
  
  app.listen(debugPort, () => {
    log(`\n🖥️ Servidor de debug rodando na porta ${debugPort}`, 'success');
    log('Configure o webhook para: http://localhost:4000/webhook-debug', 'warning');
  });
  
  // Atualizar webhook para o servidor de debug
  try {
    await axios.put(
      `${process.env.EVOLUTION_API_URL}/webhook/set/${process.env.INSTANCE_NAME}`,
      {
        enabled: true,
        url: `http://localhost:${debugPort}/webhook-debug`,
        webhookByEvents: false,
        webhookBase64: true,
        events: ['MESSAGES_UPSERT']
      },
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    log('✅ Webhook redirecionado para debug!', 'success');
  } catch (error) {
    log('Erro ao redirecionar webhook', 'error');
  }
}

// 5. Testar transcrição com OpenAI
async function testTranscription(filepath, mimetype) {
  log('\n🎯 TESTANDO TRANSCRIÇÃO COM OPENAI...', 'info');
  
  if (!process.env.OPENAI_API_KEY) {
    log('OpenAI API Key não configurada!', 'error');
    return;
  }
  
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('file', fs.createReadStream(filepath));
    formData.append('model', process.env.WHISPER_MODEL || 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'json');
    formData.append('prompt', 'Transcreva o áudio em português brasileiro.');
    
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000
      }
    );
    
    log('✅ TRANSCRIÇÃO REALIZADA COM SUCESSO!', 'success');
    log(`Texto: "${response.data.text}"`, 'info');
    
  } catch (error) {
    log('❌ ERRO NA TRANSCRIÇÃO:', 'error');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'error');
      log(`Erro: ${JSON.stringify(error.response.data)}`, 'error');
    } else {
      log(error.message, 'error');
    }
  }
}

// 6. Verificar modelos disponíveis na OpenAI
async function checkOpenAIModels() {
  log('\n🤖 VERIFICANDO MODELOS OPENAI...', 'info');
  
  if (!process.env.OPENAI_API_KEY) {
    log('OpenAI API Key não configurada!', 'error');
    return;
  }
  
  try {
    const response = await axios.get(
      'https://api.openai.com/v1/models',
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    const audioModels = response.data.data.filter(m => 
      m.id.includes('whisper') || 
      m.id.includes('gpt-4o') ||
      m.id.includes('transcribe')
    );
    
    log('Modelos de áudio disponíveis:', 'info');
    audioModels.forEach(model => {
      log(`- ${model.id}`, 'success');
    });
    
    // Testar modelo configurado
    const configuredModel = process.env.WHISPER_MODEL || 'whisper-1';
    const isAvailable = audioModels.some(m => m.id === configuredModel);
    
    if (isAvailable) {
      log(`\n✅ Modelo configurado (${configuredModel}) está disponível!`, 'success');
    } else {
      log(`\n❌ Modelo configurado (${configuredModel}) NÃO está disponível!`, 'error');
      log('Use um dos modelos listados acima', 'warning');
    }
    
  } catch (error) {
    log(`Erro ao verificar modelos: ${error.response?.data?.error?.message || error.message}`, 'error');
  }
}

// Menu principal
async function showMenu() {
  console.clear();
  log('🔧 DIAGNÓSTICO DE ÁUDIO - EVOLUTION API + OPENAI\n', 'info');
  
  console.log('Escolha uma opção:\n');
  console.log('1. Verificar e corrigir webhook');
  console.log('2. Verificar configurações da Evolution');
  console.log('3. Enviar mensagem de teste');
  console.log('4. Monitorar webhook em tempo real');
  console.log('5. Verificar modelos OpenAI disponíveis');
  console.log('6. Executar diagnóstico completo');
  console.log('0. Sair\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Opção: ', async (answer) => {
    console.clear();
    
    switch(answer) {
      case '1':
        await checkWebhookConfig();
        break;
      case '2':
        await checkEvolutionSettings();
        break;
      case '3':
        await testTextMessage();
        break;
      case '4':
        await monitorWebhook();
        return; // Não voltar ao menu
      case '5':
        await checkOpenAIModels();
        break;
      case '6':
        await runCompleteDiagnostic();
        break;
      case '0':
        process.exit(0);
      default:
        log('Opção inválida!', 'error');
    }
    
    readline.question('\nPressione ENTER para continuar...', () => {
      readline.close();
      showMenu();
    });
  });
}

// Diagnóstico completo
async function runCompleteDiagnostic() {
  log('🚀 INICIANDO DIAGNÓSTICO COMPLETO...\n', 'info');
  
  // 1. Verificar variáveis de ambiente
  log('1️⃣ Verificando variáveis de ambiente...', 'info');
  const requiredEnvs = ['EVOLUTION_API_URL', 'EVOLUTION_API_KEY', 'INSTANCE_NAME', 'OPENAI_API_KEY'];
  let envOk = true;
  
  requiredEnvs.forEach(env => {
    if (process.env[env]) {
      log(`✅ ${env}: Configurado`, 'success');
    } else {
      log(`❌ ${env}: NÃO configurado`, 'error');
      envOk = false;
    }
  });
  
  if (!envOk) {
    log('\n⚠️ Configure as variáveis faltantes no arquivo .env', 'error');
    return;
  }
  
  // 2. Verificar conexão com Evolution API
  log('\n2️⃣ Verificando conexão com Evolution API...', 'info');
  try {
    const testResponse = await axios.get(
      `${process.env.EVOLUTION_API_URL}/instance/fetchInstances`,
      {
        headers: { 'apikey': process.env.EVOLUTION_API_KEY }
      }
    );
    log('✅ Conexão com Evolution API OK', 'success');
  } catch (error) {
    log('❌ Erro ao conectar com Evolution API', 'error');
    return;
  }
  
  // 3. Verificar webhook
  log('\n3️⃣ Verificando webhook...', 'info');
  await checkWebhookConfig();
  
  // 4. Verificar OpenAI
  log('\n4️⃣ Verificando OpenAI...', 'info');
  await checkOpenAIModels();
  
  // 5. Verificar configurações
  log('\n5️⃣ Verificando configurações da Evolution...', 'info');
  await checkEvolutionSettings();
  
  log('\n✅ DIAGNÓSTICO COMPLETO FINALIZADO!', 'success');
  log('\nPróximos passos:', 'info');
  log('1. Use a opção 3 para enviar mensagem de teste', 'info');
  log('2. Use a opção 4 para monitorar o webhook', 'info');
  log('3. Envie um áudio e verifique os logs', 'info');
}

// Iniciar
if (require.main === module) {
  showMenu();
}

module.exports = {
  checkWebhookConfig,
  checkEvolutionSettings,
  testTextMessage,
  monitorWebhook,
  checkOpenAIModels,
  runCompleteDiagnostic
};