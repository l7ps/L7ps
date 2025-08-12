require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar módulos da aplicação
const db = require('./src/models/database');
const syncService = require('./src/services/syncService');
const apiRoutes = require('./src/routes');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddlewares() {
        // Segurança
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
                    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
                    imgSrc: ["'self'", "data:", "https:"]
                }
            }
        }));

        // CORS
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? false : true,
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100, // máximo 100 requests per windowMs
            message: {
                error: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
            }
        });
        this.app.use('/api/', limiter);

        // Compression
        this.app.use(compression());

        // Logging
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('combined'));
        }

        // Parse JSON and URL-encoded data
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Servir arquivos estáticos
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // Rota principal - servir o dashboard
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        // API routes
        this.app.use('/api', apiRoutes);

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: Math.floor(process.uptime()),
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Catch-all para SPA (retornar index.html para todas as rotas não encontradas)
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    setupErrorHandling() {
        // 404 handler para API routes
        this.app.use('/api/*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint não encontrado',
                path: req.path
            });
        });

        // Global error handler
        this.app.use((err, req, res, next) => {
            console.error('Erro interno:', err);

            // Se já enviou resposta, delegar para o handler padrão do Express
            if (res.headersSent) {
                return next(err);
            }

            // Erro de validação
            if (err.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: err.errors
                });
            }

            // Erro de sintaxe JSON
            if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
                return res.status(400).json({
                    success: false,
                    message: 'JSON inválido'
                });
            }

            // Erro genérico
            res.status(err.status || 500).json({
                success: false,
                message: process.env.NODE_ENV === 'production' 
                    ? 'Erro interno do servidor' 
                    : err.message,
                ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
            });
        });
    }

    async initialize() {
        try {
            console.log('🚀 Inicializando servidor...');

            // Conectar ao banco de dados
            await db.connect();
            console.log('✅ Banco de dados conectado');

            // Inicializar serviço de sincronização
            await syncService.initialize();
            console.log('✅ Serviço de sincronização inicializado');

            console.log('✅ Servidor inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar servidor:', error);
            throw error;
        }
    }

    async start() {
        try {
            await this.initialize();

            const server = this.app.listen(this.port, () => {
                console.log(`\n🌟 Servidor rodando em http://localhost:${this.port}`);
                console.log(`📊 Dashboard disponível em: http://localhost:${this.port}`);
                console.log(`🔗 API disponível em: http://localhost:${this.port}/api`);
                console.log(`💫 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
            });

            // Graceful shutdown
            process.on('SIGTERM', () => this.shutdown(server));
            process.on('SIGINT', () => this.shutdown(server));

            return server;
        } catch (error) {
            console.error('❌ Erro ao iniciar servidor:', error);
            process.exit(1);
        }
    }

    async shutdown(server) {
        console.log('\n🔄 Iniciando shutdown graceful...');

        // Parar sincronização automática
        syncService.stopAutoSync();

        // Fechar servidor HTTP
        server.close(() => {
            console.log('🔌 Servidor HTTP fechado');
        });

        // Fechar conexão com banco de dados
        try {
            await db.close();
            console.log('🗄️ Banco de dados desconectado');
        } catch (error) {
            console.error('❌ Erro ao fechar banco de dados:', error);
        }

        console.log('✅ Shutdown concluído');
        process.exit(0);
    }
}

// Inicializar e executar servidor
if (require.main === module) {
    const server = new Server();
    server.start().catch(error => {
        console.error('❌ Falha crítica na inicialização:', error);
        process.exit(1);
    });
}

module.exports = Server;