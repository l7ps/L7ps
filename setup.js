const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando setup da aplicação...');

// Criar diretório data se não existir
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Diretório data criado');
}

// Criar banco de dados SQLite
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao criar banco de dados:', err.message);
        return;
    }
    console.log('✅ Banco de dados SQLite criado/conectado');
});

// Criar tabelas
db.serialize(() => {
    // Tabela de parceiros
    db.run(`
        CREATE TABLE IF NOT EXISTS parceiros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo_parceiro TEXT UNIQUE,
            nome TEXT NOT NULL,
            cpf_cnpj TEXT,
            email TEXT,
            telefone TEXT,
            endereco TEXT,
            cidade TEXT,
            estado TEXT,
            cep TEXT,
            status TEXT,
            data_cadastro TEXT,
            data_atualizacao TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela parceiros:', err.message);
        } else {
            console.log('✅ Tabela parceiros criada');
        }
    });

    // Tabela de logs de sincronização
    db.run(`
        CREATE TABLE IF NOT EXISTS sync_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_operacao TEXT NOT NULL,
            status TEXT NOT NULL,
            mensagem TEXT,
            registros_processados INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela sync_logs:', err.message);
        } else {
            console.log('✅ Tabela sync_logs criada');
        }
    });

    // Tabela de configurações
    db.run(`
        CREATE TABLE IF NOT EXISTS configuracoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chave TEXT UNIQUE NOT NULL,
            valor TEXT,
            descricao TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela configuracoes:', err.message);
        } else {
            console.log('✅ Tabela configuracoes criada');
            
            // Inserir configurações padrão
            const configs = [
                ['ultima_sincronizacao', '', 'Data/hora da última sincronização com a API'],
                ['total_parceiros', '0', 'Total de parceiros cadastrados'],
                ['auto_sync_enabled', 'true', 'Sincronização automática habilitada']
            ];
            
            const stmt = db.prepare('INSERT OR IGNORE INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?)');
            configs.forEach(config => {
                stmt.run(config);
            });
            stmt.finalize();
            
            console.log('✅ Configurações padrão inseridas');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('❌ Erro ao fechar banco de dados:', err.message);
    } else {
        console.log('✅ Setup concluído com sucesso!');
        console.log('\n📝 Próximos passos:');
        console.log('1. Execute: npm start');
        console.log('2. Acesse: http://localhost:3000');
        console.log('3. A sincronização iniciará automaticamente\n');
    }
});