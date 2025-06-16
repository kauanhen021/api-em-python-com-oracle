const express = require('express');
const oracledb = require('oracledb');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware para ignorar o aviso do ngrok
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// Página principal para testar visualmente no navegador
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>API Test</title></head>
      <body style="font-family:sans-serif;padding:20px">
        <h2>Testar API de Produtos</h2>
        <pre id="output">Carregando...</pre>
        <script>
          fetch("/produtos", {
            headers: { "ngrok-skip-browser-warning": "true" }
          })
          .then(res => res.json())
          .then(data => {
            document.getElementById("output").textContent = JSON.stringify(data, null, 2);
          })
          .catch(err => {
            document.getElementById("output").textContent = "Erro: " + err.message;
          });
        </script>
      </body>
    </html>
  `);
});

// Endpoint da API de produtos com filtro "pr"
app.get('/produtos', async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: 'GINGER',
      password: 'SF6QxMuKe_',
      connectString: 'dbconnect.megaerp.online:4221/xepdb1'
    });

    const result = await connection.execute(
      `SELECT * FROM MEGA.gg_vw_produtos@GINGER WHERE LOWER(PRO_IN_CODIGO) LIKE '%pr%'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.setHeader('ngrok-skip-browser-warning', 'true');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro Oracle:', err);
    res.status(500).json({ erro: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
  }
});

// Rodar servidor em todas as interfaces (para funcionar com ngrok ou rede local)
app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).forEach(iface => {
    iface.forEach(config => {
      if (config.family === 'IPv4' && !config.internal) {
        console.log(`✅ API acessível em: http://${config.address}:${PORT}/`);
      }
    });
  });
});
