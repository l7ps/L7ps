const db = require('./database');

class Parceiro {
    constructor(data) {
        this.id = data.id;
        this.codigo_parceiro = data.codigo_parceiro;
        this.nome = data.nome;
        this.cpf_cnpj = data.cpf_cnpj;
        this.email = data.email;
        this.telefone = data.telefone;
        this.endereco = data.endereco;
        this.cidade = data.cidade;
        this.estado = data.estado;
        this.cep = data.cep;
        this.status = data.status;
        this.data_cadastro = data.data_cadastro;
        this.data_atualizacao = data.data_atualizacao;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Salvar parceiro no banco
    async save() {
        try {
            const sql = `
                INSERT OR REPLACE INTO parceiros 
                (codigo_parceiro, nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, status, data_cadastro, data_atualizacao, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            
            const params = [
                this.codigo_parceiro,
                this.nome,
                this.cpf_cnpj,
                this.email,
                this.telefone,
                this.endereco,
                this.cidade,
                this.estado,
                this.cep,
                this.status,
                this.data_cadastro,
                this.data_atualizacao
            ];

            const result = await db.run(sql, params);
            this.id = result.id;
            return result;
        } catch (error) {
            console.error('Erro ao salvar parceiro:', error);
            throw error;
        }
    }

    // Buscar todos os parceiros
    static async findAll(limit = null, offset = 0) {
        try {
            let sql = 'SELECT * FROM parceiros ORDER BY created_at DESC';
            let params = [];
            
            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params = [limit, offset];
            }

            const rows = await db.all(sql, params);
            return rows.map(row => new Parceiro(row));
        } catch (error) {
            console.error('Erro ao buscar parceiros:', error);
            throw error;
        }
    }

    // Buscar parceiro por ID
    static async findById(id) {
        try {
            const sql = 'SELECT * FROM parceiros WHERE id = ?';
            const row = await db.get(sql, [id]);
            return row ? new Parceiro(row) : null;
        } catch (error) {
            console.error('Erro ao buscar parceiro por ID:', error);
            throw error;
        }
    }

    // Buscar parceiro por código
    static async findByCodigoParceiro(codigo) {
        try {
            const sql = 'SELECT * FROM parceiros WHERE codigo_parceiro = ?';
            const row = await db.get(sql, [codigo]);
            return row ? new Parceiro(row) : null;
        } catch (error) {
            console.error('Erro ao buscar parceiro por código:', error);
            throw error;
        }
    }

    // Contar total de parceiros
    static async count() {
        try {
            const sql = 'SELECT COUNT(*) as total FROM parceiros';
            const result = await db.get(sql);
            return result.total;
        } catch (error) {
            console.error('Erro ao contar parceiros:', error);
            throw error;
        }
    }

    // Buscar parceiros por filtros
    static async search(filters = {}) {
        try {
            let sql = 'SELECT * FROM parceiros WHERE 1=1';
            let params = [];

            if (filters.nome) {
                sql += ' AND nome LIKE ?';
                params.push(`%${filters.nome}%`);
            }

            if (filters.cidade) {
                sql += ' AND cidade LIKE ?';
                params.push(`%${filters.cidade}%`);
            }

            if (filters.estado) {
                sql += ' AND estado = ?';
                params.push(filters.estado);
            }

            if (filters.status) {
                sql += ' AND status = ?';
                params.push(filters.status);
            }

            sql += ' ORDER BY created_at DESC';

            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await db.all(sql, params);
            return rows.map(row => new Parceiro(row));
        } catch (error) {
            console.error('Erro ao buscar parceiros com filtros:', error);
            throw error;
        }
    }

    // Estatísticas dos parceiros
    static async getStats() {
        try {
            const queries = {
                total: 'SELECT COUNT(*) as value FROM parceiros',
                ativos: 'SELECT COUNT(*) as value FROM parceiros WHERE status = "ativo"',
                inativos: 'SELECT COUNT(*) as value FROM parceiros WHERE status = "inativo"',
                porEstado: `
                    SELECT estado, COUNT(*) as total 
                    FROM parceiros 
                    WHERE estado IS NOT NULL AND estado != '' 
                    GROUP BY estado 
                    ORDER BY total DESC 
                    LIMIT 10
                `,
                recentes: `
                    SELECT COUNT(*) as value 
                    FROM parceiros 
                    WHERE created_at >= datetime('now', '-30 days')
                `
            };

            const [total, ativos, inativos, porEstado, recentes] = await Promise.all([
                db.get(queries.total),
                db.get(queries.ativos),
                db.get(queries.inativos),
                db.all(queries.porEstado),
                db.get(queries.recentes)
            ]);

            return {
                total: total.value,
                ativos: ativos.value,
                inativos: inativos.value,
                recentes: recentes.value,
                porEstado
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
    }
}

module.exports = Parceiro;