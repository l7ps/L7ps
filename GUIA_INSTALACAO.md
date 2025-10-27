# 🚀 Guia Rápido de Instalação - Dashboard Vida Cotidiana

## ⚡ Instalação Rápida (5 minutos)

### 1. Pré-requisitos
- Node.js 16+ instalado
- Conexão com internet

### 2. Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
node setup.js

# 3. Iniciar servidor
npm start
```

### 3. Acesso
- Dashboard: http://localhost:3000
- API: http://localhost:3000/api

## ✅ O que a aplicação faz:

1. **Conecta automaticamente** com a API da Vida Cotidiana
2. **Sincroniza dados** dos parceiros a cada 30 minutos
3. **Armazena localmente** em banco SQLite (pasta `data/`)
4. **Apresenta dashboard** com:
   - Estatísticas dos parceiros
   - Gráficos de distribuição
   - Tabela interativa com busca
   - Histórico de sincronizações
   - Exportação de dados (JSON/CSV)

## 🔄 Comandos Úteis

```bash
# Desenvolvimento (auto-reload)
npm run dev

# Produção
npm start

# Reconfigurar banco
node setup.js

# Parar servidor
Ctrl + C
```

## 📊 Funcionalidades Principais

### Dashboard Interativo
- ✅ Estatísticas em tempo real
- ✅ Gráfico de distribuição por estado
- ✅ Busca e filtros avançados
- ✅ Paginação automática
- ✅ Exportação de dados

### Sincronização Automática
- ✅ Conecta com API da Vida Cotidiana
- ✅ Sincronização a cada 30 minutos
- ✅ Logs detalhados de cada operação
- ✅ Sincronização manual sob demanda

### Armazenamento Local
- ✅ Banco SQLite local
- ✅ Dados persistem mesmo offline
- ✅ Backup automático
- ✅ Performance otimizada

## 🆘 Problemas Comuns

### Erro "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Banco não criado
```bash
node setup.js
```

### Porta já em uso
Edite `.env` e mude `PORT=3000` para outra porta.

### API não conecta
Verifique as credenciais no arquivo `.env`.

## 📱 Como Usar

1. **Acesse**: http://localhost:3000
2. **Aguarde**: A primeira sincronização (automática)
3. **Explore**: Use filtros e busca
4. **Exporte**: Dados em JSON ou CSV
5. **Monitore**: Logs de sincronização

## 🔧 Configurações (arquivo .env)

```env
PORT=3000                           # Porta do servidor
SYNC_INTERVAL_MINUTES=30           # Intervalo de sincronização
ENABLE_AUTO_SYNC=true              # Habilitar sync automática
API_EMAIL=acesso-api@vidacotidiana.com.br
API_PASSWORD=Wp59121535#
```

## 📈 Estrutura de Dados

A aplicação coleta e organiza:
- Nome do parceiro
- CPF/CNPJ
- Email e telefone
- Endereço completo
- Status (ativo/inativo)
- Datas de cadastro/atualização

## 🎯 Resumo

✅ **Instalação**: `npm install && node setup.js && npm start`  
✅ **Acesso**: http://localhost:3000  
✅ **Funcionamento**: Automático após inicialização  
✅ **Dados**: Sincronizados e armazenados localmente  
✅ **Interface**: Dashboard completo e responsivo  

---

**Pronto! Sua aplicação está funcionando! 🎉**