const express = require('express');
const path = require('path');
const app = express();


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', (req, res) => {
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