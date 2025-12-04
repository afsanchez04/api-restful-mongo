// index.js
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const itemsRouter = require('./routes/items');
const { connectMongo } = require('./db/mongo');

dotenv.config();

const app = express();

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Configuración de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: { error: 'Demasiadas peticiones, por favor intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para operaciones de escritura
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Más restrictivo para POST/PUT/DELETE
  message: { error: 'Demasiadas operaciones de escritura, por favor intenta más tarde' },
  skip: (req) => req.method === 'GET', // No aplicar a GET
});

app.use(generalLimiter);

// Parser de JSON con límite de tamaño
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Middleware para logging de peticiones (desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rutas
app.use('/api/items', writeLimiter, itemsRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'API de Items funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      items: '/api/items'
    }
  });
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: !!process.env.MONGO_URI ? 'configured' : 'not configured'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  // Manejo específico de errores de parsing JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido en la petición' });
  }
  
  res.status(err.status || 500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Conexión con MongoDB Atlas
    if (process.env.MONGO_URI) {
      try {
        await connectMongo(process.env.MONGO_URI);
        console.log('✓ Conectado a MongoDB Atlas');
      } catch (err) {
        console.error('✗ Error conectando a MongoDB:', err.message);
        console.log('⚠ La API usará solo el archivo JSON local');
      }
    } else {
      console.log('⚠ MONGO_URI no configurado, la API usará solo el archivo JSON local');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor escuchando en http://localhost:${PORT}`);
      console.log(`📝 Modo: ${process.env.NODE_ENV || 'production'}`);
      console.log(`\nEndpoints disponibles:`);
      console.log(`  GET    /api/items       - Listar items`);
      console.log(`  GET    /api/items/:id   - Obtener item`);
      console.log(`  POST   /api/items       - Crear item`);
      console.log(`  PUT    /api/items/:id   - Actualizar item`);
      console.log(`  DELETE /api/items/:id   - Eliminar item`);
      console.log(`\n✓ Servidor listo para recibir peticiones\n`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido, cerrando servidor...');
  process.exit(0);
});

start();