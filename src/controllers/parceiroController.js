const Parceiro = require('../models/Parceiro');
const syncService = require('../services/syncService');

class ParceiroController {
    // Listar todos os parceiros
    async index(req, res) {
        try {
            const { page = 1, limit = 50, nome, cidade, estado, status } = req.query;
            const offset = (page - 1) * limit;

            const filters = {};
            if (nome) filters.nome = nome;
            if (cidade) filters.cidade = cidade;
            if (estado) filters.estado = estado;
            if (status) filters.status = status;
            filters.limit = parseInt(limit);

            const parceiros = await Parceiro.search(filters);
            const total = await Parceiro.count();

            res.json({
                success: true,
                data: parceiros,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Erro ao listar parceiros:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Buscar parceiro por ID
    async show(req, res) {
        try {
            const { id } = req.params;
            const parceiro = await Parceiro.findById(id);

            if (!parceiro) {
                return res.status(404).json({
                    success: false,
                    message: 'Parceiro não encontrado'
                });
            }

            res.json({
                success: true,
                data: parceiro
            });
        } catch (error) {
            console.error('Erro ao buscar parceiro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Obter estatísticas dos parceiros
    async stats(req, res) {
        try {
            const stats = await Parceiro.getStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Buscar parceiros (com filtros avançados)
    async search(req, res) {
        try {
            const filters = req.body;
            const parceiros = await Parceiro.search(filters);

            res.json({
                success: true,
                data: parceiros,
                total: parceiros.length
            });
        } catch (error) {
            console.error('Erro na busca:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Sincronizar parceiros manualmente
    async sync(req, res) {
        try {
            const result = await syncService.forcSync();

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Sincronização concluída com sucesso',
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erro na sincronização',
                    error: result.error
                });
            }
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Obter status da sincronização
    async syncStatus(req, res) {
        try {
            const status = syncService.getStatus();
            const logs = await syncService.getSyncLogs(10);

            res.json({
                success: true,
                data: {
                    status,
                    recentLogs: logs
                }
            });
        } catch (error) {
            console.error('Erro ao obter status:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Exportar dados para CSV
    async export(req, res) {
        try {
            const { format = 'json' } = req.query;
            const parceiros = await Parceiro.findAll();

            if (format === 'csv') {
                const csv = this.convertToCSV(parceiros);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=parceiros.csv');
                res.send(csv);
            } else {
                res.json({
                    success: true,
                    data: parceiros
                });
            }
        } catch (error) {
            console.error('Erro ao exportar:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    // Converter para CSV
    convertToCSV(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }
}

module.exports = new ParceiroController();