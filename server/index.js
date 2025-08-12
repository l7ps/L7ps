const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cron = require('node-cron');
require('dotenv').config();

const apiService = require('./services/apiService');
const databaseService = require('./services/databaseService');
const syncService = require('./services/syncService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Inicializar banco de dados
databaseService.initializeDatabase();

// Rotas da API
app.use('/api', require('./routes'));

// Rota de status
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Sincronização manual
app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncService.syncAllData();
    res.json({ success: true, message: 'Sincronização concluída', data: result });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ success: false, message: 'Erro na sincronização', error: error.message });
  }
});

// Agendar sincronização automática (a cada 6 horas)
cron.schedule('0 */6 * * *', async () => {
  console.log('Iniciando sincronização automática...');
  try {
    await syncService.syncAllData();
    console.log('Sincronização automática concluída');
  } catch (error) {
    console.error('Erro na sincronização automática:', error);
  }
});

// Sincronização inicial ao iniciar o servidor
setTimeout(async () => {
  console.log('Iniciando sincronização inicial...');
  try {
    await syncService.syncAllData();
    console.log('Sincronização inicial concluída');
  } catch (error) {
    console.error('Erro na sincronização inicial:', error);
  }
}, 5000);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});