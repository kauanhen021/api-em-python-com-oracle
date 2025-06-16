const express = require('express');
const axios = require('axios');
const qs = require('querystring');
const app = express();

const PORT = 3000;
const openRouterKey = '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';
const ultraToken = 'ndr63qqkzknmazd4';
const instanceId = 'instance121153';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Webhook do UltraMsg
app.post('/webhook', async (req, res) => {
  const userMessage = req.body.body;
  const phoneNumber = req.body.from;

  try {
    // 1. Chamada à API da OpenRouter (IA)
    const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente que extrai palavras-chave de fragrâncias nas perguntas. Apenas diga a palavra buscável.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json'
      }
    });

    const keyword = aiResponse.data.choices[0].message.content.trim().toLowerCase();

    // 2. Consulta à sua API de produtos
    const produtos = await axios.get('https://dfea-186-195-60-190.ngrok-free.app/produtos');
    const encontrados = produtos.data.filter(p =>
      p.PRO_ST_DESCRICAO?.toLowerCase().includes(keyword)
    );

    let resposta = '❌ Nenhuma fragrância encontrada com esse nome.';
    if (encontrados.length > 0) {
      resposta = encontrados.map(p =>
        `✅ ${p.PRO_ST_DESCRICAO} (Código: ${p.PRO_IN_CODIGO})`
      ).join('\n');
    }

    // 3. Envia resposta via UltraMsg
    await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, qs.stringify({
      token: ultraToken,
      to: phoneNumber,
      body: resposta
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro no bot:', err.message);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`🤖 Webhook rodando em http://localhost:${PORT}/webhook`);
});
