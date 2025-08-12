const cron = require('node-cron');
const apiService = require('./apiService');
const db = require('../models/database');
const moment = require('moment');

class SyncService {
    constructor() {
        this.isRunning = false;
        this.cronJob = null;
        this.lastSyncTime = null;
    }

    // Inicializar sincronização automática
    async initialize() {
        try {
            console.log('🔄 Inicializando serviço de sincronização...');
            
            // Carregar última sincronização
            await this.loadLastSyncTime();
            
            // Configurar sincronização automática se habilitada
            if (process.env.ENABLE_AUTO_SYNC === 'true') {
                this.startAutoSync();
            }

            // Executar sincronização inicial se nunca foi executada
            if (!this.lastSyncTime) {
                console.log('📥 Primeira sincronização...');
                await this.performSync();
            }

            console.log('✅ Serviço de sincronização inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar sincronização:', error.message);
        }
    }

    // Carregar data da última sincronização
    async loadLastSyncTime() {
        try {
            const result = await db.get(
                'SELECT valor FROM configuracoes WHERE chave = ?',
                ['ultima_sincronizacao']
            );
            
            if (result && result.valor) {
                this.lastSyncTime = new Date(result.valor);
                console.log(`📅 Última sincronização: ${moment(this.lastSyncTime).format('DD/MM/YYYY HH:mm:ss')}`);
            }
        } catch (error) {
            console.error('Erro ao carregar última sincronização:', error.message);
        }
    }

    // Salvar data da última sincronização
    async saveLastSyncTime() {
        try {
            const now = new Date().toISOString();
            await db.run(
                'UPDATE configuracoes SET valor = ?, updated_at = CURRENT_TIMESTAMP WHERE chave = ?',
                [now, 'ultima_sincronizacao']
            );
            this.lastSyncTime = new Date(now);
        } catch (error) {
            console.error('Erro ao salvar última sincronização:', error.message);
        }
    }

    // Iniciar sincronização automática
    startAutoSync() {
        try {
            const intervalMinutes = parseInt(process.env.SYNC_INTERVAL_MINUTES) || 30;
            const cronExpression = `*/${intervalMinutes} * * * *`; // A cada X minutos
            
            this.cronJob = cron.schedule(cronExpression, async () => {
                await this.performSync();
            }, {
                scheduled: false
            });

            this.cronJob.start();
            console.log(`⏰ Sincronização automática configurada para cada ${intervalMinutes} minutos`);
        } catch (error) {
            console.error('Erro ao configurar sincronização automática:', error.message);
        }
    }

    // Parar sincronização automática
    stopAutoSync() {
        if (this.cronJob) {
            this.cronJob.stop();
            console.log('⏹️ Sincronização automática parada');
        }
    }

    // Executar sincronização
    async performSync() {
        if (this.isRunning) {
            console.log('⚠️ Sincronização já está em execução');
            return { success: false, message: 'Sincronização já em execução' };
        }

        this.isRunning = true;
        const startTime = new Date();
        let logId = null;

        try {
            console.log('🔄 Iniciando sincronização...');
            
            // Registrar início da sincronização
            logId = await this.logSyncStart();
            
            // Executar sincronização via API
            const result = await apiService.syncAllParceiros();
            
            // Atualizar contadores
            await this.updateCounters();
            
            // Salvar tempo da última sincronização
            await this.saveLastSyncTime();
            
            // Registrar sucesso
            await this.logSyncSuccess(logId, result.totalProcessed, startTime);
            
            console.log(`✅ Sincronização concluída em ${moment().diff(startTime, 'seconds')} segundos`);
            
            return {
                success: true,
                totalProcessed: result.totalProcessed,
                duration: moment().diff(startTime, 'seconds')
            };

        } catch (error) {
            console.error('❌ Erro na sincronização:', error.message);
            
            // Registrar erro
            if (logId) {
                await this.logSyncError(logId, error.message);
            }
            
            return {
                success: false,
                error: error.message,
                duration: moment().diff(startTime, 'seconds')
            };
        } finally {
            this.isRunning = false;
        }
    }

    // Registrar início da sincronização
    async logSyncStart() {
        try {
            const result = await db.run(
                'INSERT INTO sync_logs (tipo_operacao, status, mensagem) VALUES (?, ?, ?)',
                ['sync_parceiros', 'iniciado', 'Sincronização iniciada']
            );
            return result.id;
        } catch (error) {
            console.error('Erro ao registrar início de sync:', error.message);
            return null;
        }
    }

    // Registrar sucesso da sincronização
    async logSyncSuccess(logId, totalProcessed, startTime) {
        try {
            const duration = moment().diff(startTime, 'seconds');
            const message = `Sincronização concluída com sucesso. ${totalProcessed} registros processados em ${duration}s`;
            
            await db.run(
                'UPDATE sync_logs SET status = ?, mensagem = ?, registros_processados = ? WHERE id = ?',
                ['concluido', message, totalProcessed, logId]
            );
        } catch (error) {
            console.error('Erro ao registrar sucesso de sync:', error.message);
        }
    }

    // Registrar erro da sincronização
    async logSyncError(logId, errorMessage) {
        try {
            const message = `Erro na sincronização: ${errorMessage}`;
            
            await db.run(
                'UPDATE sync_logs SET status = ?, mensagem = ? WHERE id = ?',
                ['erro', message, logId]
            );
        } catch (error) {
            console.error('Erro ao registrar erro de sync:', error.message);
        }
    }

    // Atualizar contadores
    async updateCounters() {
        try {
            const totalParceiros = await db.get('SELECT COUNT(*) as total FROM parceiros');
            
            await db.run(
                'UPDATE configuracoes SET valor = ?, updated_at = CURRENT_TIMESTAMP WHERE chave = ?',
                [totalParceiros.total.toString(), 'total_parceiros']
            );
        } catch (error) {
            console.error('Erro ao atualizar contadores:', error.message);
        }
    }

    // Obter logs de sincronização
    async getSyncLogs(limit = 50) {
        try {
            const logs = await db.all(
                'SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            
            return logs.map(log => ({
                ...log,
                created_at: moment(log.created_at).format('DD/MM/YYYY HH:mm:ss')
            }));
        } catch (error) {
            console.error('Erro ao obter logs:', error.message);
            return [];
        }
    }

    // Obter status da sincronização
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastSyncTime: this.lastSyncTime ? moment(this.lastSyncTime).format('DD/MM/YYYY HH:mm:ss') : 'Nunca',
            autoSyncEnabled: process.env.ENABLE_AUTO_SYNC === 'true',
            intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES) || 30,
            nextSyncTime: this.cronJob ? 'Configurado' : 'Não configurado'
        };
    }

    // Sincronização manual (forçada)
    async forcSync() {
        console.log('🔄 Sincronização manual solicitada...');
        return await this.performSync();
    }
}

module.exports = new SyncService();