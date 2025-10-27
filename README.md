<h1 align="center" style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  Letícia Pereira
</h1>
<p align="center" style="font-size: 1.1rem;">
  <i>Dev Full Stack em formação | Acadêmica de ADS | Analista de Suporte Computacional</i>
</p>

<p align="center">
  <img src="https://media.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif" width="100"/>
</p>

---

## ✨ Sobre mim

Olá! Sou apaixonada por tecnologia, inovação e design. Atualmente curso **Análise e Desenvolvimento de Sistemas** e trabalho como **Analista de Suporte**, unindo teoria, prática e criatividade para resolver problemas reais com soluções eficientes.

Me aventuro também com **WordPress e criação de websites**. Ainda estou explorando.

> **Adoro transformar desafios em projetos reais. Se você tiver uma ideia fora da caixa, pode me chamar:**  
> **✨ Vamos criar algo incrível juntos!**

---

## 🛠️ Tecnologias e Ferramentas

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js,py,java,nodejs,postgres,mysql,git,wordpress" />
</p>

---

## Alguns Projetos

### 📦 **[DataStock]** *(em andamento)*  
Sistema completo de gestão de estoque com dashboard visual, controle de solicitações, movimentações, inventário e geração de relatórios CSV.

> **Tecnologias**: HTML, CSS, JavaScript, Next.js, MySQL  
> **Destaques**: App `.msi`, múltiplos estoques, histórico de produtos, visualização por unidade e filtros avançados.

---

### 📄 **Sistema de Controle de Versões Documentais** *(em desenvolvimento)*  
Aplicação local para controle de documentos e versões com rastreabilidade, segurança e backup local.

> **Tecnologias**: HTML, CSS (Bootstrap), JavaScript  
> **Destaques**: Armazenamento em `.txt/.json`, dashboard por setor, usuários e setores.

---

### 🔐 **SGAE - Acessos e Equipamentos** *(em desenvolvimento)*  
Plataforma interna para controle de ativos e permissões. Ideal para rastrear dispositivos, acessos e uso por setor.

> **Tecnologias**: HTML, CSS, JavaScript  
> **Destaques previstos**: Cadastro de equipamentos, rastreabilidade, painel de controle e relatórios.

---

### ✂️ **[pdf-splitter]**  
Aplicativo simples em Python para dividir arquivos PDF em partes menores e gerar log em planilha Excel.

> **Tecnologias**: Python, PyPDF, OpenPyXL  
> **Destaques**: Interface funcional, registro de separações, automação de documentos.

---


## Contato e Redes

| Rede       | Link                                                                 |
|------------|----------------------------------------------------------------------|
| **Email**      | leticia7pereira@gmail.com                                             |
| **LinkedIn**   | [linkedin.com/in/leticia7pereira](https://www.linkedin.com/in/leticia7pereira?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app) |
| **Instagram**  | [@leticia7pereira](https://www.instagram.com/leticia7pereira)         |
| **Skoob**      | [@leticia7pereira](https://www.skoob.com.br/usuario/leticia7pereira) |
| **GitHub**     | [github.com/l7ps](https://github.com/l7ps)                           |

---

<p align="center" style="font-size:1.05rem">
  <i>Desenvolvido com café, criatividade e muito código. ☕</i>
</p>

# Dashboard Vida Cotidiana - Sistema de Análise de Parceiros

Uma aplicação web completa para conectar, sincronizar e analisar dados de parceiros da API Vida Cotidiana. O sistema coleta informações da API, armazena localmente em SQLite e apresenta um dashboard interativo para análises.

## 🚀 Características

- **Sincronização Automática**: Conecta com a API da Vida Cotidiana e sincroniza dados automaticamente
- **Armazenamento Local**: Dados armazenados em SQLite para acesso offline
- **Dashboard Interativo**: Interface web moderna com gráficos e tabelas
- **Busca Avançada**: Filtros por nome, cidade, estado e status
- **Exportação de Dados**: Exportar dados em JSON e CSV
- **Logs de Sincronização**: Histórico detalhado de todas as operações
- **Interface Responsiva**: Funciona em desktop e mobile

## 📋 Pré-requisitos

- Node.js 16+ 
- NPM ou Yarn
- Acesso à internet para conectar com a API

## 🛠️ Instalação

### 1. Clone o repositório e instale dependências

```bash
# Clone o projeto
git clone <url-do-repositorio>
cd vida-cotidiana-dashboard

# Instale as dependências
npm install
```

### 2. Configure as credenciais

Edite o arquivo `.env` com suas credenciais da API:

```env
# Credenciais da API Vida Cotidiana
API_EMAIL=acesso-api@vidacotidiana.com.br
API_PASSWORD=Wp59121535#

# Configurações opcionais
PORT=3000
SYNC_INTERVAL_MINUTES=30
ENABLE_AUTO_SYNC=true
```

### 3. Execute o setup inicial

```bash
npm run setup
```

Este comando irá:
- Instalar todas as dependências
- Criar o banco de dados SQLite
- Configurar as tabelas necessárias
- Inserir configurações padrão

### 4. Inicie o servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

## 🌐 Acesso

Após iniciar o servidor, acesse:

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📊 Funcionalidades do Dashboard

### Estatísticas Principais
- Total de parceiros cadastrados
- Parceiros ativos vs inativos
- Novos parceiros (últimos 30 dias)
- Distribuição geográfica por estado

### Sincronização
- Status da sincronização em tempo real
- Sincronização manual sob demanda
- Logs detalhados de todas as operações
- Configuração de intervalos automáticos

### Busca e Filtros
- Busca por nome do parceiro
- Filtros por cidade, estado e status
- Paginação dos resultados
- Ordenação por data de cadastro

### Visualização de Dados
- Tabela interativa com todos os parceiros
- Gráfico de distribuição por estado
- Modal com detalhes completos do parceiro
- Formatação automática de CPF/CNPJ

### Exportação
- Exportar dados em formato JSON
- Exportar dados em formato CSV
- Download automático dos arquivos

## 🔧 API Endpoints

### Parceiros
- `GET /api/parceiros` - Listar parceiros com paginação
- `GET /api/parceiros/:id` - Buscar parceiro específico
- `GET /api/parceiros/stats` - Estatísticas gerais
- `POST /api/parceiros/search` - Busca avançada
- `GET /api/parceiros/export` - Exportar dados

### Sincronização
- `GET /api/parceiros/sync` - Status da sincronização
- `POST /api/parceiros/sync` - Forçar sincronização manual

### Sistema
- `GET /api/health` - Status da API
- `GET /health` - Health check do sistema

## 🗃️ Estrutura do Banco de Dados

### Tabela: parceiros
```sql
- id (INTEGER PRIMARY KEY)
- codigo_parceiro (TEXT UNIQUE)
- nome (TEXT NOT NULL)
- cpf_cnpj (TEXT)
- email (TEXT)
- telefone (TEXT)
- endereco (TEXT)
- cidade (TEXT)
- estado (TEXT)
- cep (TEXT)
- status (TEXT)
- data_cadastro (TEXT)
- data_atualizacao (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Tabela: sync_logs
```sql
- id (INTEGER PRIMARY KEY)
- tipo_operacao (TEXT NOT NULL)
- status (TEXT NOT NULL)
- mensagem (TEXT)
- registros_processados (INTEGER)
- created_at (DATETIME)
```

### Tabela: configuracoes
```sql
- id (INTEGER PRIMARY KEY)
- chave (TEXT UNIQUE NOT NULL)
- valor (TEXT)
- descricao (TEXT)
- updated_at (DATETIME)
```

## 📁 Estrutura do Projeto

```
vida-cotidiana-dashboard/
├── data/                    # Banco de dados SQLite
├── public/                  # Arquivos estáticos (Frontend)
│   ├── css/
│   ├── js/
│   └── index.html
├── src/                     # Código fonte (Backend)
│   ├── controllers/         # Controladores da API
│   ├── models/             # Modelos de dados
│   ├── routes/             # Rotas da API
│   └── services/           # Serviços (API, Sync, etc.)
├── .env                    # Configurações de ambiente
├── .gitignore
├── package.json
├── server.js              # Servidor principal
├── setup.js               # Script de inicialização
└── README.md
```

## ⚙️ Configurações

### Variáveis de Ambiente (.env)

```env
# Porta do servidor
PORT=3000

# Ambiente de execução
NODE_ENV=development

# Credenciais da API Vida Cotidiana
API_BASE_URL=https://apiredecredenciada.vidacotidiana.com.br/api
API_EMAIL=acesso-api@vidacotidiana.com.br
API_PASSWORD=Wp59121535#

# Configurações do banco de dados
DB_PATH=./data/database.sqlite

# Configurações de segurança
JWT_SECRET=sua_chave_secreta_super_segura_aqui_12345
SESSION_SECRET=outra_chave_secreta_para_sessoes_67890

# Configurações de sincronização
SYNC_INTERVAL_MINUTES=30
ENABLE_AUTO_SYNC=true
```

## 🔒 Segurança

- Helmet.js para headers de segurança
- Rate limiting nas rotas da API
- Validação e sanitização de inputs
- Credenciais protegidas em variáveis de ambiente
- CORS configurado adequadamente

## 📈 Performance

- Compressão gzip habilitada
- Cache de arquivos estáticos
- Paginação eficiente no banco de dados
- Índices otimizados nas tabelas
- Pooling de conexões SQLite

## 🐛 Logs e Monitoramento

### Logs de Sistema
- Logs de requisições HTTP (Morgan)
- Logs de erro detalhados
- Logs de sincronização com timestamps

### Logs de Sincronização
- Status de cada operação
- Número de registros processados
- Tempo de execução
- Mensagens de erro detalhadas

## 🚀 Deploy

### Ambiente de Produção

1. Configure as variáveis de ambiente:
```bash
NODE_ENV=production
PORT=80
```

2. Execute o build:
```bash
npm install --production
npm run setup
```

3. Inicie com PM2 (recomendado):
```bash
npm install -g pm2
pm2 start server.js --name "vida-cotidiana-dashboard"
pm2 save
pm2 startup
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run setup
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 Manutenção

### Backup do Banco de Dados
```bash
# Criar backup
cp data/database.sqlite data/backup_$(date +%Y%m%d_%H%M%S).sqlite

# Restaurar backup
cp data/backup_YYYYMMDD_HHMMSS.sqlite data/database.sqlite
```

### Limpeza de Logs
```bash
# Limpar logs antigos (SQL)
DELETE FROM sync_logs WHERE created_at < datetime('now', '-30 days');
```

### Atualização da Aplicação
```bash
git pull origin main
npm install
npm run setup  # Se necessário
pm2 restart vida-cotidiana-dashboard
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com a API**
   - Verifique as credenciais no arquivo `.env`
   - Confirme se a API está acessível
   - Verifique logs de sincronização

2. **Banco de dados não encontrado**
   - Execute `npm run setup` novamente
   - Verifique permissões da pasta `data/`

3. **Sincronização não funcionando**
   - Verifique a configuração `ENABLE_AUTO_SYNC`
   - Consulte os logs na seção "Histórico de Sincronizações"
   - Force uma sincronização manual

4. **Dashboard não carrega**
   - Verifique se o servidor está rodando
   - Confirme a porta configurada
   - Verifique logs do console do navegador

### Logs Úteis

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Ver logs de erro
grep ERROR logs/app.log

# Ver logs de sincronização
grep sync logs/app.log
```

## 📞 Suporte

Para problemas técnicos ou dúvidas:

1. Consulte este README
2. Verifique os logs de erro
3. Consulte a seção de troubleshooting
4. Entre em contato com o desenvolvedor

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## 🔄 Atualizações

### Versão 1.0.0
- Primeira versão estável
- Sincronização automática
- Dashboard completo
- Exportação de dados
- Sistema de logs

---

**Desenvolvido para integração com a API Vida Cotidiana**
