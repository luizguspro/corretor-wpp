// src/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const axios = require('axios');
const evolutionService = require('./services/evolutionService');
const webhookController = require('./controllers/webhookController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// MIDDLEWARE DE DEBUG PARA ÁUDIO
app.use((req, res, next) => {
  if (req.path === '/webhook' && req.body.event === 'messages.upsert') {
    const data = req.body.data;
    if (data?.message?.audioMessage) {
      console.log('\n🎙️ ========== ÁUDIO RECEBIDO ==========');
      console.log('📊 Informações do Áudio:');
      console.log('- Tem base64?', !!data.message.audioMessage.base64);
      console.log('- Tamanho base64:', data.message.audioMessage.base64?.length || 0);
      console.log('- Tem URL?', !!data.message.audioMessage.url);
      console.log('- Mimetype:', data.message.audioMessage.mimetype);
      console.log('- Duração:', data.message.audioMessage.seconds, 'segundos');
      console.log('- Tamanho arquivo:', data.message.audioMessage.fileLength, 'bytes');
      console.log('- É PTT?', data.message.audioMessage.ptt);
      console.log('- Campos disponíveis:', Object.keys(data.message.audioMessage));
      console.log('=====================================\n');
    }
  }
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'WhatsApp Bot Corretor',
    timestamp: new Date().toISOString()
  });
});

// Rota do webhook
app.post(
  '/webhook',
  webhookController.validateWebhook,
  webhookController.handleWebhook.bind(webhookController)
);

// Rota para obter QR Code manualmente
app.get('/qrcode', async (req, res) => {
  try {
    const qrcode = await evolutionService.getQRCode();
    res.json(qrcode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para verificar status
app.get('/status', async (req, res) => {
  try {
    const status = await evolutionService.getConnectionStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para reiniciar conexão
app.post('/restart', async (req, res) => {
  try {
    await evolutionService.connectInstance();
    res.json({ message: 'Reconectando instância...' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para desconectar WhatsApp atual
app.post('/disconnect', async (req, res) => {
  try {
    // Desconectar a instância atual
    const response = await axios.delete(
      `${process.env.EVOLUTION_API_URL}/instance/logout/${process.env.INSTANCE_NAME}`,
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      }
    );
    
    res.json({ 
      message: 'WhatsApp desconectado! Reinicie o bot para conectar outro número.',
      response: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao desconectar',
      details: error.response?.data || error.message
    });
  }
});

// Rota para deletar instância completamente
app.delete('/instance', async (req, res) => {
  try {
    const response = await axios.delete(
      `${process.env.EVOLUTION_API_URL}/instance/delete/${process.env.INSTANCE_NAME}`,
      {
        headers: {
          'apikey': process.env.EVOLUTION_API_KEY
        }
      }
    );
    
    res.json({ 
      message: 'Instância deletada! Reinicie o bot para criar uma nova.',
      response: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao deletar instância',
      details: error.response?.data || error.message
    });
  }
});

// Rota para forçar reconexão
app.post('/force-reconnect', async (req, res) => {
  try {
    const result = await evolutionService.forceReconnect();
    
    if (result && result.code) {
      res.json({ 
        message: 'QR Code gerado! Escaneie com seu WhatsApp',
        qrcode: result.code 
      });
    } else {
      res.json({ 
        message: 'Reconexão iniciada. Verifique o terminal para o QR Code',
        result 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao forçar reconexão',
      details: error.message 
    });
  }
});

// Rota para resetar instância completamente
app.post('/reset-instance', async (req, res) => {
  try {
    const result = await evolutionService.resetInstance();
    
    res.json({ 
      message: 'Instância resetada! Novo QR Code disponível',
      result 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao resetar instância',
      details: error.message 
    });
  }
});

// Rota para teste de lista
app.post('/test/list', async (req, res) => {
  try {
    const { phone } = req.body;
    
    const testList = {
      title: '🧪 Teste de Lista',
      description: 'Esta é uma lista de teste',
      buttonText: 'Clique Aqui',
      sections: [
        {
          title: 'Seção 1',
          rows: [
            {
              rowId: 'test1',
              title: 'Opção 1',
              description: 'Descrição da opção 1'
            },
            {
              rowId: 'test2',
              title: 'Opção 2',
              description: 'Descrição da opção 2'
            }
          ]
        }
      ]
    };
    
    const result = await evolutionService.sendListMessage(phone, testList);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: err.message 
  });
});

// Função para inicializar o bot
async function initializeBot() {
  try {
    console.log('🤖 Iniciando Bot Corretor WhatsApp...\n');
    
    // CONFIGURAÇÃO DE RESET - Mude para true se precisar forçar reset
    const FORCE_RESET = false; // Mude para true se estiver com problemas de conexão
    
    if (FORCE_RESET) {
      console.log('⚠️ FORÇANDO RESET DA INSTÂNCIA...');
      try {
        await evolutionService.resetInstance();
        console.log('✅ Instância resetada com sucesso!');
      } catch (error) {
        console.log('Continuando mesmo com erro no reset...');
      }
    }
    
    // Verificar/criar instância
    console.log('1️⃣ Verificando instância...');
    let instanceExists = false;
    
    try {
      const status = await evolutionService.getConnectionStatus();
      console.log('✅ Instância encontrada:', status.state);
      instanceExists = true;
      
      // Se já está conectada, pular para configuração do webhook
      if (status.state === 'open') {
        connected = true;
      }
    } catch (error) {
      console.log('📦 Criando nova instância...');
      try {
        await evolutionService.createInstance();
        console.log('✅ Instância criada com sucesso!');
      } catch (createError) {
        // Se erro 403, a instância já existe
        if (createError.response?.status === 403) {
          console.log('✅ Instância já existe, continuando...');
          instanceExists = true;
        } else {
          throw createError;
        }
      }
    }
    
    // Conectar instância - GET connect já inicia o processo
    console.log('\n2️⃣ Iniciando conexão com WhatsApp...');
    let connectResponse = null;
    try {
      connectResponse = await evolutionService.connectInstance();
      
      // Se já tem QR Code na resposta, exibir imediatamente
      if (connectResponse && connectResponse.code) {
        console.log('\n📱 ESCANEIE O QR CODE NO SEU WHATSAPP:');
        console.log('=====================================');
        console.log('1. Abra o WhatsApp no seu celular');
        console.log('2. Vá em Configurações > Dispositivos conectados > Conectar dispositivo');
        console.log('3. Escaneie o código abaixo:\n');
        
        // Tentar exibir QR Code visual
        try {
          const qrcode = require('qrcode-terminal');
          qrcode.generate(connectResponse.code, { small: true });
        } catch (e) {
          // Se não tiver a biblioteca, exibir código para copiar
          console.log('📋 Copie o código abaixo e cole em:');
          console.log('https://www.qr-code-generator.com/\n');
          console.log(connectResponse.code);
        }
        
        console.log('\n=====================================');
        console.log('⏳ Aguardando você escanear o código...\n');
      }
    } catch (error) {
      // Ignorar erro se já estiver conectado
      console.log('⚠️ Instância pode já estar em processo de conexão');
    }
    
    // Aguardar um pouco para instância inicializar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar status e obter QR Code se necessário
    let connected = false;
    let attempts = 0;
    const maxAttempts = 30;
    let qrCodeShown = false;
    
    console.log('\n3️⃣ Verificando conexão...');
    
    while (!connected && attempts < maxAttempts) {
      try {
        const connectionStatus = await evolutionService.getConnectionStatus();
        
        if (connectionStatus.state === 'open') {
          connected = true;
          console.log('\n✅ WhatsApp conectado com sucesso!');
          break;
        } else if (!qrCodeShown && !connectResponse) {
          // Se não mostrou QR Code ainda e não tem da resposta do connect
          try {
            const qrCodeData = await evolutionService.getQRCode();
            
            if (qrCodeData.code) {
              console.log('\n📱 ESCANEIE O QR CODE NO SEU WHATSAPP:');
              console.log('=====================================');
              console.log('1. Abra o WhatsApp no seu celular');
              console.log('2. Vá em Configurações > Dispositivos conectados');
              console.log('3. Escaneie o código abaixo:\n');
              
              try {
                const qrcode = require('qrcode-terminal');
                qrcode.generate(qrCodeData.code, { small: true });
              } catch (e) {
                console.log('📋 Copie o código abaixo e cole em:');
                console.log('https://www.qr-code-generator.com/\n');
                console.log(qrCodeData.code);
              }
              
              console.log('\n=====================================');
              console.log('⏳ Aguardando você escanear o código...\n');
              qrCodeShown = true;
            }
          } catch (qrError) {
            // QR Code não disponível ainda
          }
        }
      } catch (error) {
        // Erro ao verificar status
      }
      
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
      
      // Mostrar progresso a cada 5 tentativas
      if (!connected && attempts % 5 === 0) {
        process.stdout.write('.');
      }
    }
    
    if (!connected) {
      console.log('\n❌ Timeout ao aguardar conexão.');
      console.log('💡 Dicas:');
      console.log('1. Reinicie o bot e tente novamente');
      console.log('2. Verifique se seu WhatsApp está funcionando');
      console.log('3. Tente acessar http://localhost:8080 no navegador\n');
      process.exit(1);
    }
    
    // Configurar webhook
    console.log('\n4️⃣ Configurando webhook...');
    try {
      await evolutionService.setWebhook();
      console.log('✅ Webhook configurado!');
    } catch (error) {
      console.log('⚠️ Erro ao configurar webhook:', error.message);
      console.log('O bot funcionará mesmo assim, mas pode ter limitações.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Bot Corretor rodando na porta ${PORT}`);
      console.log(`📡 Webhook disponível em: http://localhost:${PORT}/webhook`);
      console.log(`🔍 Status disponível em: http://localhost:${PORT}/status`);
      console.log(`📱 QR Code disponível em: http://localhost:${PORT}/qrcode`);
      console.log('\n✨ Bot pronto para receber mensagens!');
      console.log('📱 Envie "menu" no WhatsApp para começar!\n');
      console.log('\n🛠️ Comandos úteis:');
      console.log('- Forçar reconexão: http://localhost:' + PORT + '/force-reconnect');
      console.log('- Resetar instância: http://localhost:' + PORT + '/reset-instance');
      console.log('- Desconectar: http://localhost:' + PORT + '/disconnect\n');
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar bot:', error.message);
    console.error('Detalhes:', error.response?.data || error);
    process.exit(1);
  }
}

// Tratamento de sinais para desconexão limpa
process.on('SIGINT', async () => {
  console.log('\n\n👋 Desconectando bot...');
  process.exit(0);
});

// Iniciar bot
initializeBot();