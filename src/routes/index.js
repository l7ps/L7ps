const express = require('express');
const router = express.Router();

// Importar rotas
const parceirosRoutes = require('./parceiros');

// Configurar rotas
router.use('/parceiros', parceirosRoutes);

// Rota de teste da API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando corretamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Rota de informações da API
router.get('/', (req, res) => {
    res.json({
        name: 'Vida Cotidiana Dashboard API',
        version: '1.0.0',
        description: 'API para gerenciamento e análise de parceiros',
        endpoints: {
            health: '/api/health',
            parceiros: '/api/parceiros',
            stats: '/api/parceiros/stats',
            sync: '/api/parceiros/sync'
        }
    });
});

module.exports = router;