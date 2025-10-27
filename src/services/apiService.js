const axios = require('axios');
const Parceiro = require('../models/Parceiro');

class ApiService {
    constructor() {
        this.baseURL = process.env.API_BASE_URL;
        this.email = process.env.API_EMAIL;
        this.password = process.env.API_PASSWORD;
        this.token = null;
        this.axiosInstance = null;
        this.initializeAxios();
    }

    initializeAxios() {
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Interceptor para adicionar token automaticamente
        this.axiosInstance.interceptors.request.use((config) => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        });

        // Interceptor para tratar erros de autenticação
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401 && !error.config._retry) {
                    error.config._retry = true;
                    await this.authenticate();
                    error.config.headers.Authorization = `Bearer ${this.token}`;
                    return this.axiosInstance.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    // Autenticar na API
    async authenticate() {
        try {
            console.log('🔐 Autenticando na API...');
            
            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: this.email,
                password: this.password
            });

            if (response.data && response.data.token) {
                this.token = response.data.token;
                console.log('✅ Autenticação realizada com sucesso');
                return this.token;
            } else {
                throw new Error('Token não encontrado na resposta da API');
            }
        } catch (error) {
            console.error('❌ Erro na autenticação:', error.message);
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
            }
            throw error;
        }
    }

    // Buscar todos os parceiros da API
    async fetchParceiros(page = 1, limit = 100) {
        try {
            if (!this.token) {
                await this.authenticate();
            }

            console.log(`📥 Buscando parceiros - Página ${page}...`);
            
            const response = await this.axiosInstance.get('/parceiros', {
                params: { page, limit }
            });

            if (response.data) {
                console.log(`✅ ${response.data.data?.length || 0} parceiros encontrados`);
                return response.data;
            }

            return { data: [], total: 0, page, limit };
        } catch (error) {
            console.error('❌ Erro ao buscar parceiros:', error.message);
            throw error;
        }
    }

    // Buscar parceiro específico por ID
    async fetchParceiroById(id) {
        try {
            if (!this.token) {
                await this.authenticate();
            }

            const response = await this.axiosInstance.get(`/parceiros/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao buscar parceiro ${id}:`, error.message);
            throw error;
        }
    }

    // Sincronizar todos os parceiros
    async syncAllParceiros() {
        try {
            console.log('🔄 Iniciando sincronização completa...');
            
            let page = 1;
            let totalProcessed = 0;
            let hasMoreData = true;
            const limit = 100;

            while (hasMoreData) {
                try {
                    const response = await this.fetchParceiros(page, limit);
                    
                    if (!response.data || response.data.length === 0) {
                        hasMoreData = false;
                        break;
                    }

                    // Processar e salvar parceiros
                    for (const parceiroData of response.data) {
                        try {
                            await this.processParceiro(parceiroData);
                            totalProcessed++;
                        } catch (error) {
                            console.error(`Erro ao processar parceiro ${parceiroData.id}:`, error.message);
                        }
                    }

                    // Verificar se há mais páginas
                    if (response.data.length < limit) {
                        hasMoreData = false;
                    } else {
                        page++;
                    }

                    // Pequena pausa entre requisições para não sobrecarregar a API
                    await this.sleep(1000);

                } catch (error) {
                    console.error(`Erro na página ${page}:`, error.message);
                    break;
                }
            }

            console.log(`✅ Sincronização concluída. ${totalProcessed} parceiros processados.`);
            return { success: true, totalProcessed };

        } catch (error) {
            console.error('❌ Erro na sincronização:', error.message);
            throw error;
        }
    }

    // Processar e salvar um parceiro individual
    async processParceiro(parceiroData) {
        try {
            // Mapear os dados da API para o formato do banco
            const parceiro = new Parceiro({
                codigo_parceiro: parceiroData.codigo || parceiroData.id,
                nome: parceiroData.nome || parceiroData.razao_social,
                cpf_cnpj: parceiroData.cpf || parceiroData.cnpj,
                email: parceiroData.email,
                telefone: parceiroData.telefone || parceiroData.celular,
                endereco: this.formatEndereco(parceiroData),
                cidade: parceiroData.cidade,
                estado: parceiroData.estado || parceiroData.uf,
                cep: parceiroData.cep,
                status: parceiroData.status || parceiroData.ativo ? 'ativo' : 'inativo',
                data_cadastro: parceiroData.created_at || parceiroData.data_cadastro,
                data_atualizacao: parceiroData.updated_at || parceiroData.data_atualizacao
            });

            await parceiro.save();
            return parceiro;
        } catch (error) {
            console.error('Erro ao processar parceiro:', error.message);
            throw error;
        }
    }

    // Formatar endereço completo
    formatEndereco(data) {
        const parts = [];
        
        if (data.endereco) parts.push(data.endereco);
        if (data.numero) parts.push(`nº ${data.numero}`);
        if (data.complemento) parts.push(data.complemento);
        if (data.bairro) parts.push(data.bairro);
        
        return parts.join(', ');
    }

    // Função utilitária para pausas
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Verificar status da API
    async checkApiStatus() {
        try {
            const response = await axios.get(`${this.baseURL}/health`);
            return { status: 'online', data: response.data };
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    }

    // Obter estatísticas da API
    async getApiStats() {
        try {
            if (!this.token) {
                await this.authenticate();
            }

            const response = await this.axiosInstance.get('/parceiros/stats');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter estatísticas da API:', error.message);
            return null;
        }
    }
}

module.exports = new ApiService();