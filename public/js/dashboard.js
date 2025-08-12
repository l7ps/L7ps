// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.estadoChart = null;
        this.filters = {};
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando Dashboard...');
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar dados iniciais
        await this.loadInitialData();
        
        // Configurar atualização automática
        this.setupAutoRefresh();
        
        console.log('✅ Dashboard inicializado');
    }

    setupEventListeners() {
        // Formulário de busca
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        // Modal de parceiro
        const parceiroModal = document.getElementById('parceiroModal');
        parceiroModal.addEventListener('shown.bs.modal', () => {
            // Focus no modal quando aberto
        });
    }

    async loadInitialData() {
        try {
            // Mostrar loading
            this.showLoading();

            // Carregar dados em paralelo
            const [stats, syncStatus, parceiros] = await Promise.all([
                this.loadStats(),
                this.loadSyncStatus(),
                this.loadParceiros()
            ]);

            // Atualizar UI
            this.updateStatsDisplay(stats);
            this.updateSyncStatusDisplay(syncStatus);
            this.renderParceirosTable(parceiros.data, parceiros.pagination);
            
            // Carregar gráficos
            await this.loadCharts(stats);
            
            // Carregar estados para filtro
            await this.loadEstadosFilter();

        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showError('Erro ao carregar dados iniciais');
        } finally {
            this.hideLoading();
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/parceiros/stats');
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            return {
                total: 0,
                ativos: 0,
                inativos: 0,
                recentes: 0,
                porEstado: []
            };
        }
    }

    async loadSyncStatus() {
        try {
            const response = await fetch('/api/parceiros/sync');
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao carregar status de sync:', error);
            return {
                status: { isRunning: false, lastSyncTime: 'Nunca' },
                recentLogs: []
            };
        }
    }

    async loadParceiros(page = 1, filters = {}) {
        try {
            const params = new URLSearchParams({
                page: page,
                limit: this.itemsPerPage,
                ...filters
            });

            const response = await fetch(`/api/parceiros?${params}`);
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao carregar parceiros:', error);
            return {
                data: [],
                pagination: { page: 1, pages: 1, total: 0 }
            };
        }
    }

    updateStatsDisplay(stats) {
        document.getElementById('totalParceiros').textContent = this.formatNumber(stats.total);
        document.getElementById('parceirosAtivos').textContent = this.formatNumber(stats.ativos);
        document.getElementById('parceirosInativos').textContent = this.formatNumber(stats.inativos);
        document.getElementById('parceirosRecentes').textContent = this.formatNumber(stats.recentes);
    }

    updateSyncStatusDisplay(syncData) {
        const statusElement = document.getElementById('syncStatus');
        const lastUpdateElement = document.getElementById('lastUpdate');
        
        const { status, recentLogs } = syncData;
        
        // Atualizar status
        if (status.isRunning) {
            statusElement.innerHTML = `
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                <span class="sync-status running">Sincronizando...</span>
            `;
        } else {
            const lastLog = recentLogs.length > 0 ? recentLogs[0] : null;
            const statusClass = lastLog && lastLog.status === 'erro' ? 'error' : 'success';
            
            statusElement.innerHTML = `
                <div class="status-indicator ${lastLog ? 'online' : 'offline'}"></div>
                <span class="sync-status ${statusClass}">
                    ${status.autoSyncEnabled ? 'Sincronização automática ativa' : 'Sincronização manual'}
                </span>
            `;
        }
        
        // Atualizar última sincronização
        lastUpdateElement.textContent = `Última sync: ${status.lastSyncTime}`;
        
        // Atualizar logs
        this.renderSyncLogs(recentLogs);
    }

    renderParceirosTable(parceiros, pagination) {
        const tbody = document.getElementById('parceirosTable');
        
        if (!parceiros || parceiros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <div>Nenhum parceiro encontrado</div>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = parceiros.map(parceiro => `
            <tr class="fade-in">
                <td>
                    <div class="fw-medium">${this.escapeHtml(parceiro.nome || '-')}</div>
                    <small class="text-muted">${this.escapeHtml(parceiro.codigo_parceiro || '')}</small>
                </td>
                <td>${this.formatDocument(parceiro.cpf_cnpj)}</td>
                <td>
                    ${parceiro.email ? `<a href="mailto:${parceiro.email}" class="text-decoration-none">${this.escapeHtml(parceiro.email)}</a>` : '-'}
                </td>
                <td>${this.escapeHtml(parceiro.cidade || '-')}</td>
                <td>
                    <span class="badge bg-secondary">${this.escapeHtml(parceiro.estado || '-')}</span>
                </td>
                <td>
                    <span class="badge ${parceiro.status === 'ativo' ? 'bg-success' : 'bg-secondary'}">
                        ${parceiro.status || 'N/A'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-outline-primary btn-action" onclick="dashboard.viewParceiro(${parceiro.id})" title="Ver detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Atualizar paginação
        this.renderPagination(pagination);
    }

    renderPagination(pagination) {
        const paginationElement = document.getElementById('pagination');
        
        if (pagination.pages <= 1) {
            paginationElement.innerHTML = '';
            return;
        }

        const { page, pages } = pagination;
        let paginationHTML = '';

        // Botão anterior
        paginationHTML += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="dashboard.changePage(${page - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        // Páginas
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);

        if (startPage > 1) {
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="dashboard.changePage(1)">1</a></li>`;
            if (startPage > 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="dashboard.changePage(${i})">${i}</a>
                </li>
            `;
        }

        if (endPage < pages) {
            if (endPage < pages - 1) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="dashboard.changePage(${pages})">${pages}</a></li>`;
        }

        // Botão próximo
        paginationHTML += `
            <li class="page-item ${page === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="dashboard.changePage(${page + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        paginationElement.innerHTML = paginationHTML;
    }

    renderSyncLogs(logs) {
        const tbody = document.getElementById('syncLogsTable');
        
        if (!logs || logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3 text-muted">
                        Nenhum log de sincronização encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${log.created_at}</td>
                <td>${this.escapeHtml(log.tipo_operacao)}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(log.status)}">
                        ${log.status}
                    </span>
                </td>
                <td>${log.registros_processados || 0}</td>
                <td>
                    <small>${this.escapeHtml(log.mensagem || '')}</small>
                </td>
            </tr>
        `).join('');
    }

    async loadCharts(stats) {
        // Gráfico de distribuição por estado
        this.renderEstadoChart(stats.porEstado);
    }

    renderEstadoChart(estadoData) {
        const ctx = document.getElementById('estadoChart').getContext('2d');
        
        if (this.estadoChart) {
            this.estadoChart.destroy();
        }

        if (!estadoData || estadoData.length === 0) {
            ctx.fillStyle = '#6c757d';
            ctx.textAlign = 'center';
            ctx.font = '14px sans-serif';
            ctx.fillText('Nenhum dado disponível', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        const labels = estadoData.slice(0, 10).map(item => item.estado);
        const data = estadoData.slice(0, 10).map(item => item.total);
        
        this.estadoChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#FF6384'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    async loadEstadosFilter() {
        try {
            const response = await fetch('/api/parceiros/stats');
            const data = await response.json();
            
            if (data.success && data.data.porEstado) {
                const select = document.getElementById('searchEstado');
                const currentValue = select.value;
                
                select.innerHTML = '<option value="">Todos os estados</option>';
                
                data.data.porEstado.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.estado;
                    option.textContent = `${item.estado} (${item.total})`;
                    select.appendChild(option);
                });
                
                select.value = currentValue;
            }
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
        }
    }

    async performSearch() {
        const filters = {
            nome: document.getElementById('searchNome').value.trim(),
            cidade: document.getElementById('searchCidade').value.trim(),
            estado: document.getElementById('searchEstado').value,
            status: document.getElementById('searchStatus').value
        };

        // Remover filtros vazios
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        this.filters = filters;
        this.currentPage = 1;

        try {
            this.showTableLoading();
            const result = await this.loadParceiros(1, filters);
            this.renderParceirosTable(result.data, result.pagination);
        } catch (error) {
            console.error('Erro na busca:', error);
            this.showError('Erro ao realizar busca');
        }
    }

    async changePage(page) {
        if (page < 1) return;
        
        this.currentPage = page;
        
        try {
            this.showTableLoading();
            const result = await this.loadParceiros(page, this.filters);
            this.renderParceirosTable(result.data, result.pagination);
        } catch (error) {
            console.error('Erro ao mudar página:', error);
            this.showError('Erro ao carregar página');
        }
    }

    async viewParceiro(id) {
        try {
            const response = await fetch(`/api/parceiros/${id}`);
            const data = await response.json();
            
            if (data.success) {
                this.showParceiroModal(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro ao carregar parceiro:', error);
            this.showError('Erro ao carregar detalhes do parceiro');
        }
    }

    showParceiroModal(parceiro) {
        const modalBody = document.getElementById('parceiroModalBody');
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informações Básicas</h6>
                    <table class="table table-borderless table-sm">
                        <tr><td><strong>Nome:</strong></td><td>${this.escapeHtml(parceiro.nome || '-')}</td></tr>
                        <tr><td><strong>Código:</strong></td><td>${this.escapeHtml(parceiro.codigo_parceiro || '-')}</td></tr>
                        <tr><td><strong>CPF/CNPJ:</strong></td><td>${this.formatDocument(parceiro.cpf_cnpj)}</td></tr>
                        <tr><td><strong>Email:</strong></td><td>${parceiro.email || '-'}</td></tr>
                        <tr><td><strong>Telefone:</strong></td><td>${this.escapeHtml(parceiro.telefone || '-')}</td></tr>
                        <tr><td><strong>Status:</strong></td><td>
                            <span class="badge ${parceiro.status === 'ativo' ? 'bg-success' : 'bg-secondary'}">
                                ${parceiro.status || 'N/A'}
                            </span>
                        </td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Endereço</h6>
                    <table class="table table-borderless table-sm">
                        <tr><td><strong>Endereço:</strong></td><td>${this.escapeHtml(parceiro.endereco || '-')}</td></tr>
                        <tr><td><strong>Cidade:</strong></td><td>${this.escapeHtml(parceiro.cidade || '-')}</td></tr>
                        <tr><td><strong>Estado:</strong></td><td>${this.escapeHtml(parceiro.estado || '-')}</td></tr>
                        <tr><td><strong>CEP:</strong></td><td>${this.escapeHtml(parceiro.cep || '-')}</td></tr>
                    </table>
                    
                    <h6 class="mt-3">Datas</h6>
                    <table class="table table-borderless table-sm">
                        <tr><td><strong>Cadastro:</strong></td><td>${this.formatDate(parceiro.data_cadastro)}</td></tr>
                        <tr><td><strong>Atualização:</strong></td><td>${this.formatDate(parceiro.data_atualizacao)}</td></tr>
                        <tr><td><strong>Criado em:</strong></td><td>${this.formatDate(parceiro.created_at)}</td></tr>
                    </table>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('parceiroModal'));
        modal.show();
    }

    clearFilters() {
        document.getElementById('searchForm').reset();
        this.filters = {};
        this.currentPage = 1;
        this.loadParceiros(1, {}).then(result => {
            this.renderParceirosTable(result.data, result.pagination);
        });
    }

    async forceSync() {
        try {
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Sincronizando...';
            
            const response = await fetch('/api/parceiros/sync', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.showSuccess('Sincronização concluída com sucesso!');
                await this.loadInitialData();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
            this.showError('Erro ao sincronizar dados');
        } finally {
            const button = event.target.closest('button');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Sincronizar';
        }
    }

    async exportData(format) {
        try {
            const response = await fetch(`/api/parceiros/export?format=${format}`);
            
            if (format === 'csv') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `parceiros_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `parceiros_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
            
            this.showSuccess(`Dados exportados em ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Erro ao exportar:', error);
            this.showError('Erro ao exportar dados');
        }
    }

    setupAutoRefresh() {
        // Atualizar dados a cada 5 minutos
        setInterval(() => {
            this.loadStats().then(stats => {
                this.updateStatsDisplay(stats);
            });
            
            this.loadSyncStatus().then(syncData => {
                this.updateSyncStatusDisplay(syncData);
            });
        }, 5 * 60 * 1000);
    }

    // Utility methods
    showLoading() {
        document.body.classList.add('loading');
    }

    hideLoading() {
        document.body.classList.remove('loading');
    }

    showTableLoading() {
        const tbody = document.getElementById('parceirosTable');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status"></div>
                    <div class="mt-2">Carregando...</div>
                </td>
            </tr>
        `;
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'danger');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num || 0);
    }

    formatDocument(doc) {
        if (!doc) return '-';
        
        // Remove caracteres não numéricos
        const numbers = doc.replace(/\D/g, '');
        
        if (numbers.length === 11) {
            // CPF
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (numbers.length === 14) {
            // CNPJ
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        
        return doc;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
        } catch {
            return dateString;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'concluido': return 'bg-success';
            case 'erro': return 'bg-danger';
            case 'iniciado': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }
}

// Funções globais para compatibilidade
window.forceSync = () => dashboard.forceSync();
window.clearFilters = () => dashboard.clearFilters();
window.exportData = (format) => dashboard.exportData(format);

// Inicializar dashboard quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});