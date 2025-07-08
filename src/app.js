// src/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const evolutionService = require('./services/evolutionService');
const webhookController = require('./controllers/webhookController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

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