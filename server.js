const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Permite que o frontend na Vercel e o seu ambiente local acessem a API
app.use(cors({
    origin: ['https://knodoriapp.vercel.app', 'http://localhost:4200']
}));

app.use(express.json());

// Rota de teste para garantir que a API está no ar
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'api do knodori collect rodando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`);
});