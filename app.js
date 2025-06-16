import React, { useEffect, useState } from 'react';

function App() {
  const [dados, setDados] = useState([]);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("https://cdf0-186-195-60-190.ngrok-free.app/produtos", {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Erro ao buscar dados da API");
        }
        return res.json();
      })
      .then(data => {
        setDados(data);
        setCarregando(false);
      })
      .catch(err => {
        setErro(err.message);
        setCarregando(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h1>Consulta de Produtos</h1>

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: 'red' }}>Erro: {erro}</p>}

      {!carregando && !erro && (
        <pre style={{
          background: '#f4f4f4',
          padding: '10px',
          borderRadius: '4px',
          overflowX: 'auto',
          maxHeight: '600px'
        }}>
          {JSON.stringify(dados, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
