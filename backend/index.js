const express = require("express");
const dotenv = require("dotenv");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const fs = require('fs');
const path = require('path');

// Ensure the database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Automatically run migrations if the database file does not exist
const dbFile = path.join(dbDir, 'database.sqlite');

async function ensureMigrations() {
  await new Promise((resolve, reject) => {
    const child = require('child_process').spawn('node', ['run-migrations.js'], { stdio: 'inherit', cwd: __dirname });
    child.on('exit', code => code === 0 ? resolve() : reject(new Error('Migration failed')));
  });
}

// Import routes
const authRouter = require("./routes/api/v1/auth.js");
const importDataRouter = require("./routes/api/v1/importData.js");
const generateRouter = require("./routes/api/v1/generate.js");
const testRouter = require("./routes/api/v1/test.js");
const classroomRouter = require("./routes/api/v1/classroom.js");
const timetableFormateurRouter = require("./routes/api/v1/timetableFormateur.js");
const groupRouter = require('./routes/api/v1/group.js')
const branchRouter = require('./routes/api/v1/branch.js')
const mergeRouter = require('./routes/api/v1/merge.js')
const timetableGroupRouter = require('./routes/api/v1/timetableGroup.js')
const timetableActiveFormateurRouter = require("./routes/api/v1/timetableActiveFormateur.js");
const timetableActiveClassroomRouter = require("./routes/api/v1/timetableClassroom.js");
const historicTimetablesRouter = require("./routes/api/v1/timetableHistoric.js");
const groupsEnStageRouter = require("./routes/api/v1/groupsEnStage.js");
const formateurRouter = require("./routes/api/v1/formateur.js");
const settingRouter = require("./routes/api/v1/setting.js");

// Import database service
const databaseService = require("./services/databaseService.js");
const { initializeDefaults } = require('./controllers/SettingController.js');

const { sequelize } = require("./models/index.js");

dotenv.config();

// Performance monitoring
const startTime = Date.now();

const app = express();

// ==================== PERFORMANCE OPTIMIZATIONS ====================

// 1. Compression middleware (gzip)
app.use(compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 2. Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// 4. CORS with performance optimizations
const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight for 24 hours
};
app.use(cors(corsOptions));

// 5. Body parsing with limits
app.use(express.json({ 
  limit: '10mb', // Increase limit for large imports
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// 6. Request logging and performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  // Removed console.log statements for production
  
  // Monitor response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    if (duration > 1000) {
      // Removed console.warn statements for production
    } else {
      // Removed console.log statements for production
    }
  });
  
  next();
});

// 7. Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    const uptime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      uptime: `${Math.floor(uptime / 1000)}s`,
      database: dbHealth,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// 8. Performance metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = databaseService.getMetrics();
  res.json({
    database: metrics,
    memory: process.memoryUsage(),
    uptime: Date.now() - startTime
  });
});

// 9. Database optimization endpoint
app.post('/optimize', async (req, res) => {
  try {
    await databaseService.optimize();
    res.json({ message: 'Database optimization completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES ====================

const PORT = process.env.PORT || 8002;
const fix_path = "/api/v1";

// Apply routes with performance monitoring
app.use(fix_path, authRouter);
app.use(fix_path, importDataRouter);
app.use(fix_path, generateRouter);
app.use(fix_path, testRouter); 
app.use(fix_path, classroomRouter);
app.use(fix_path, timetableFormateurRouter);
app.use(fix_path, groupRouter);
app.use(fix_path, branchRouter);
app.use(fix_path, mergeRouter);
app.use(fix_path, timetableGroupRouter);
app.use(fix_path, timetableActiveFormateurRouter);
app.use(fix_path, timetableActiveClassroomRouter);
app.use(fix_path, historicTimetablesRouter);
app.use(fix_path, groupsEnStageRouter);
app.use(fix_path, formateurRouter);
app.use(fix_path, settingRouter);

// Serve uploaded images statically
app.use('/uploads/admin-images', express.static(path.join(__dirname, 'uploads/admin-images')));

// ==================== ERROR HANDLING ====================

// Global error handler
app.use((error, req, res, next) => {
  // Removed console.error statements for production
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// ==================== SERVER STARTUP ====================

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    // Removed console.log statements for production
    
    // Initialize database optimizations
    await databaseService.initializeOptimizations();

    // Initialize default settings
    await initializeDefaults();
    
    // Start server
    app.listen(PORT, () => {
      const startupTime = Date.now() - startTime;
      // Removed console.log statements for production
      // Removed console.log statements for production
      // Removed console.log statements for production
    });
    
  } catch (error) {
    // Removed console.error statements for production
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  // Removed console.log statements for production
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  // Removed console.log statements for production
  await sequelize.close();
  process.exit(0);
});

// Start the server after ensuring migrations
ensureMigrations().then(startServer).catch(err => {
  console.error('Failed to run migrations:', err);
  process.exit(1);
});
