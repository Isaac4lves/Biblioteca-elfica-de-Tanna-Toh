const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuração do Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Cria a pasta Livros dentro de public se não existir
        const livrosDir = path.join(__dirname, 'public', 'Livros');
        if (!fs.existsSync(livrosDir)) {
            fs.mkdirSync(livrosDir, { recursive: true });
        }
        cb(null, livrosDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: Infinity } // Removendo limite de tamanho
});

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página de upload
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.use(express.json({ limit: 'Infinity' }));
app.use(express.urlencoded({ limit: 'Infinity', extended: true }));

// Rota para processar o upload
app.post('/upload', upload.single('Livro'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    // Caminho do arquivo JSON dentro de public
    const jsonPath = path.join(__dirname, 'public', 'livros.json');
    
    try {
        // Lê o arquivo JSON existente ou cria um novo
        let livros = [];
        if (fs.existsSync(jsonPath)) {
            livros = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        }

        // Adiciona o novo livro ao array
        livros.push({
            nome: req.file.originalname,
            caminho: `/Livros/${req.file.originalname}`, // Caminho relativo à pasta public
            dataUpload: new Date().toISOString()
        });

        // Salva no arquivo JSON
        fs.writeFileSync(jsonPath, JSON.stringify(livros, null, 2));
        
        res.send(`Arquivo enviado com sucesso: ${req.file.originalname}`);
    } catch (err) {
        console.error('Erro ao salvar no JSON:', err);
        res.status(500).send('Erro ao registrar o arquivo.');
    }
});

// Rota para servir o JSON (opcional, já que express.static já faz isso)
app.get('/livros.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'livros.json'));
});

// Inicia o servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});