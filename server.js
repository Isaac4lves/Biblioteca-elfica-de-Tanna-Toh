require('dotenv').config(); // Carrega variáveis do .env
const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const app = express();

if (!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
    console.error('❌ Erro: Credenciais não configuradas no arquivo .env');
    process.exit(1);
}

// Middleware de autenticação
const auth = basicAuth({
    users: { [process.env.AUTH_USER]: process.env.AUTH_PASSWORD },
    challenge: true,
    realm: 'Área Restrita',
    unauthorizedResponse: getUnauthorizedResponse
});

function getUnauthorizedResponse(req) {
    return req.auth
        ? `Credenciais rejeitadas para o usuário: ${req.auth.user}`
        : 'Por favor, insira suas credenciais de acesso';
}

// Servir arquivos estáticos (deve vir antes das rotas específicas)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', auth, (req, res) => {
    const filePath = path.join(__dirname, 'public', 'home.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Erro ao enviar home.html:', err);
            res.status(500).send('Erro interno ao carregar a página');
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor protegido rodando na porta ${PORT}`);
});