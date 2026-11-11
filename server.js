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
// (/health mantido para o health check do render; /api/health para o frontend)
const health_handler = (req, res) => {
    res.json({ status: 'ok', message: 'api do knodori collect rodando!' });
};
app.get('/health', health_handler);

// todas as rotas da api ficam aninhadas sob /api
const api_router = express.Router();
api_router.get('/health', health_handler);
api_router.use('/mercari', require('./routes/mercari.routes'));
api_router.use('/claim', require('./routes/claim.routes'));
api_router.use('/ceg', require('./routes/ceg.routes'));
api_router.use('/pricing', require('./routes/pricing.routes'));

// qualquer /api/* não mapeado devolve 404 em json (em vez da página html do express)
api_router.use((req, res) => {
    res.status(404).json({ message: 'não encontrado.' });
});

app.use('/api', api_router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`);
});

app.use(cors({
    origin: [
        'http://localhost:4200', 
        'https://knodoriapp.vercel.app',
        'https://www.knodori.com.br',
        'https://knodori.com.br'
    ]
}));