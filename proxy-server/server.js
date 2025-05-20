const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..'))); // Serve arquivos da raiz do projeto

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Configuração do proxy
const qeduProxy = createProxyMiddleware('/api/qedu', {
  target: 'https://api.qedu.org.br/v1',
  changeOrigin: true,
  secure: false, // Ignora erros de certificado (apenas para desenvolvimento)
  pathRewrite: {
    '^/api/qedu': '', // Remove /api/qedu do caminho
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Requisição proxy para QEdu:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
    });
    proxyReq.setHeader('Authorization', 'Bearer IKAzGMYh8vURvvKBhdDco33Cb5LOUerL94hndC46');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Resposta da API QEdu antes de modificação:', {
      status: proxyRes.statusCode,
      headers: proxyRes.headers,
    });
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    console.log('Resposta da API QEdu após modificação:', {
      status: proxyRes.statusCode,
      headers: res.getHeaders(),
    });
  },
  onError: (err, req, res) => {
    console.error('Erro no proxy:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
    });
    res.status(500).send('Erro interno no proxy');
  },
});

app.use(qeduProxy);

// Middleware para lidar com requisições OPTIONS (pré-vôo CORS)
app.options('/api/qedu/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.sendStatus(200);
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor proxy rodando em http://localhost:${port}`);
});