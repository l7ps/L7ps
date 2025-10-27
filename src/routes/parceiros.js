const express = require('express');
const router = express.Router();
const parceiroController = require('../controllers/parceiroController');

// GET /api/parceiros - Listar parceiros
router.get('/', parceiroController.index);

// GET /api/parceiros/stats - Estatísticas
router.get('/stats', parceiroController.stats);

// GET /api/parceiros/export - Exportar dados
router.get('/export', parceiroController.export);

// GET /api/parceiros/sync - Status da sincronização
router.get('/sync', parceiroController.syncStatus);

// POST /api/parceiros/sync - Sincronizar manualmente
router.post('/sync', parceiroController.sync);

// POST /api/parceiros/search - Busca avançada
router.post('/search', parceiroController.search);

// GET /api/parceiros/:id - Buscar parceiro por ID
router.get('/:id', parceiroController.show);

module.exports = router;