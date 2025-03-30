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
    limits: { fileSize: 10 * 1024 * 1024 * 1024 } // Limite de 10GB
});

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para aumentar o limite do Express (10GB)
app.use(express.json({ limit: '10gb' }));
app.use(express.urlencoded({ limit: '10gb', extended: true }));

// Rota para a página de upload
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Rota para processar o upload
app.post('/upload', upload.single('Livro'), (req, res) => {
    try {
        if (!req.file) {
            console.error('❌ Nenhum arquivo foi enviado.');
            return res.status(400).send('Nenhum arquivo foi enviado.');
        }

        // Caminho do arquivo JSON dentro de public
        const jsonPath = path.join(__dirname, 'public', 'livros.json');
        let livros = [];

        // Tenta ler o JSON existente
        if (fs.existsSync(jsonPath)) {
            try {
                const jsonData = fs.readFileSync(jsonPath, 'utf-8');
                livros = JSON.parse(jsonData);
            } catch (jsonErr) {
                console.error('❌ Erro ao ler livros.json:', jsonErr);
                return res.status(500).send('Erro ao ler o arquivo de livros.');
            }
        }

        // Adiciona o novo livro
        const novoLivro = {
            nome: req.file.originalname,
            caminho: `/Livros/${req.file.originalname}`,
            dataUpload: new Date().toISOString()
        };
        livros.push(novoLivro);

        // Tenta salvar no JSON
        try {
            fs.writeFileSync(jsonPath, JSON.stringify(livros, null, 2));
        } catch (writeErr) {
            console.error('❌ Erro ao salvar no JSON:', writeErr);
            return res.status(500).send('Erro ao registrar o arquivo.');
        }

        console.log('✅ Arquivo salvo com sucesso:', novoLivro);
        res.send(`Arquivo enviado com sucesso: ${req.file.originalname}`);
    } catch (err) {
        console.error('❌ Erro inesperado no upload:', err);
        res.status(500).send('Erro inesperado no servidor.');
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
