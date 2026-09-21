const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Passport and Auth
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const postsRoutes = require('./routes/posts.routes');
const profilePostsRoutes = require('./routes/profilePosts.routes');
const profileSettingsRoutes = require('./routes/profileSettings.routes');
const savedPlacesRoutes = require('./routes/savedPlaces.routes');
const { authRequired } = require('./middleware/auth.middleware');

// Shared utilities
const { connectToDatabase, initUsersTable, initPostsTable, initProfilePostsTable, initSavedPlacesTable } = require('./utils/db');

// Embedding service for vector search (with graceful fallback)
let embeddingService = null;
try {
  embeddingService = require('./services/embeddingService');
} catch (err) {
  console.error('Failed to load embedding service:', err.message);
}

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * SECURITY: Validate required environment variables at startup
 */
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0 && isProduction) {
  console.error(`FATAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

/**
 * SECURITY: Helmet middleware for HTTP security headers
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://knowindia.aryankr.in", "https://knowindia.vercel.app", "https://know-india.vercel.app", "https://know-india-final.vercel.app", "https://*.vercel.app"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  frameguard: { action: 'deny' },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

/**
 * SECURITY: Rate limiting to prevent abuse
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP (higher for public site)
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});

/**
 * SECURITY: Auth rate limiter with environment-aware settings
 * - Production: Strict limits to prevent abuse
 * - Development: Relaxed limits for testing
 * - Skips non-abuse endpoints like /auth/status, /auth/csrf-token
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // SECURITY: Stricter in production, relaxed in development
  max: isProduction ? 10 : 50,
  message: { 
    success: false, 
    message: 'Too many authentication attempts. Please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // SECURITY: Skip rate limiting for read-only auth endpoints
  // These don't initiate OAuth flows and are needed for normal app operation
  skip: (req) => {
    const safePaths = ['/status', '/csrf-token', '/me'];
    return safePaths.some(path => req.path === path || req.path.endsWith(path));
  },
  // SECURITY: Use IP + User-Agent for better identification
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  }
});

app.use(generalLimiter);

/**
 * SECURITY: Strict CORS configuration
 * Allows production domains and Vercel preview deployments
 */
const allowedOrigins = [
  'https://knowindia.aryankr.in',
  'https://knowindia.vercel.app',
  'https://know-india.vercel.app',
  'https://know-india-final.vercel.app'
];

// SECURITY: Pattern for Vercel preview deployments
// Only allows specific project preview URLs, not arbitrary origins
const vercelPreviewPattern = /^https:\/\/know-india-final-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/;

if (!isProduction) {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://localhost:5173');
}

app.use(cors({
  origin: (origin, callback) => {
    // SECURITY: Allow requests with no origin header (browser navigations, OAuth redirects)
    // This is safe because:
    // 1. OAuth endpoints use redirects, not AJAX responses
    // 2. API endpoints still require valid auth tokens
    // 3. CSRF protection is enforced separately for state-changing operations
    if (!origin) {
      return callback(null, true);
    }
    // Check exact matches first
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Check Vercel preview deployment pattern
    if (vercelPreviewPattern.test(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  // SECURITY: Include X-CSRF-Token for CSRF protection
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

/**
 * SECURITY: Reasonable body size limits
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * SECURITY: Cookie parser for HttpOnly JWT cookie support
 * Enables reading JWT from secure cookies instead of localStorage
 */
app.use(cookieParser());

// Initialize Passport (no session)
app.use(passport.initialize());

// SECURITY: Mount auth routes with stricter rate limiting
app.use('/auth', authLimiter, authRoutes);

// Mount posts routes
app.use('/api/posts', postsRoutes);

// Database initialization flag for serverless
let dbTablesInitialized = false;

/**
 * Middleware to ensure database tables exist (serverless-compatible)
 * Runs once per cold start
 */
const ensureTablesExist = async (req, res, next) => {
  if (dbTablesInitialized) {
    return next();
  }
  
  try {
    console.log('Initializing database tables for profile posts...');
    // Initialize tables in dependency order
    await initUsersTable();
    console.log('Users table initialized');
    await initProfilePostsTable();
    console.log('Profile posts table initialized');
    dbTablesInitialized = true;
    next();
  } catch (err) {
    console.error('Error initializing database tables:', err.message, err.code);
    // Mark as initialized to prevent retry loops, but continue
    dbTablesInitialized = true;
    next();
  }
};

// Mount profile posts routes with table initialization
app.use('/api/profile/posts', ensureTablesExist, profilePostsRoutes);

// Mount profile settings routes
app.use('/api/profile/settings', profileSettingsRoutes);

// Mount saved places routes
app.use('/api/saved-places', savedPlacesRoutes);

// Add explicit handling for preflight requests
app.options('*', cors());

/**
 * SECURITY: Database connection middleware
 * Uses centralized connection pool from db.js for better resource management
 */
const ensureDatabaseConnected = async (req, res, next) => {
  // Skip for non-database endpoints
  if (req.path.includes('-mock') || req.path === '/api/health' || req.path === '/api/debug') {
    return next();
  }
  
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable'
    });
  }
};

// Apply the middleware to relevant routes
app.use('/api/feedback', ensureDatabaseConnected);
app.use('/api/db-test', ensureDatabaseConnected);

// Health check endpoint - no database connection needed
app.get('/api/health', async (req, res) => {
  try {
    let dbStatus = 'not connected';
    
    // Test database connection using pool
    try {
      const pool = await connectToDatabase();
      await pool.execute('SELECT 1');
      dbStatus = 'connected';
    } catch (err) {
      dbStatus = 'connection failed';
    }

    res.status(200).json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db_connection: dbStatus
    });
  } catch (err) {
    console.error('Health check error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Health check error',
      db_connection: 'unknown'
    });
  }
});

// Feedback submission endpoint - Protected route (JWT required)
app.post('/api/feedback', authRequired, async (req, res) => {
  try {
    // Get user info from JWT (never trust frontend for email)
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name || userEmail.split('@')[0];
    
    // Validate required fields from request body
    const { rating, feedback, suggestions } = req.body;
    
    // SECURITY: Validate rating is a number between 1-5
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ 
        success: false,
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // SECURITY: Validate feedback is a non-empty string with length limit
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Feedback content is required' 
      });
    }
    
    if (feedback.length > 5000) {
      return res.status(400).json({ 
        success: false,
        error: 'Feedback is too long (max 5000 characters)' 
      });
    }
    
    // SECURITY: Validate suggestions length if provided
    if (suggestions && suggestions.length > 5000) {
      return res.status(400).json({ 
        success: false,
        error: 'Suggestions are too long (max 5000 characters)' 
      });
    }
    
    // Connect to database
    let connection;
    try {
      connection = await connectToDatabase();
      await connection.execute('SELECT 1');
    } catch (dbErr) {
      console.error('Database connection failed:', dbErr.message);
      return res.status(503).json({ 
        success: false,
        error: 'Service temporarily unavailable'
      });
    }
    
    // Insert feedback into the database - email always comes from JWT
    try {
      const query = `
        INSERT INTO Feedback (name, email, rating, liked_content, improvement_suggestions)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      // SECURITY: Sanitize inputs
      const sanitizedFeedback = feedback.trim().substring(0, 5000);
      const sanitizedSuggestions = suggestions ? suggestions.trim().substring(0, 5000) : null;
      const sanitizedName = userName.substring(0, 255);
      
      const [results] = await connection.execute(query, [
        sanitizedName, 
        userEmail, 
        numRating, 
        sanitizedFeedback, 
        sanitizedSuggestions
      ]);
      
      return res.status(201).json({ 
        success: true,
        message: 'Feedback submitted successfully', 
        id: results.insertId
      });
    } catch (queryErr) {
      console.error('Database query failed:', queryErr.message);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to save feedback'
      });
    }
  } catch (err) {
    // SECURITY: Don't expose internal error details
    console.error('Error submitting feedback:', err.message);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const [results] = await pool.execute('SELECT 1 as connected');
    
    res.status(200).json({
      status: 'ok',
      message: 'Database connection successful',
      connected: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database test error:', err.message);
    
    res.status(503).json({
      status: 'error',
      message: 'Failed to connect to database',
      connected: false,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * SECURITY: Debug endpoints only available in development
 * These expose sensitive server information and must be disabled in production
 */
if (!isProduction) {
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is working!' });
  });

  app.get('/api/package-status', (req, res) => {
    const status = {
      timestamp: new Date().toISOString(),
      packages: {}
    };
    
    const packagesToCheck = [
      '@aryanjsx/knowindia',
      'faiss-node',
      '@huggingface/transformers',
      'pdfkit',
      'uuid',
      'axios'
    ];
    
    for (const pkg of packagesToCheck) {
      try {
        require.resolve(pkg);
        status.packages[pkg] = 'available';
      } catch (err) {
        status.packages[pkg] = 'not available: ' + err.message;
      }
    }
    
    status.embeddingService = embeddingService ? 'loaded' : 'not loaded';
    
    res.json(status);
  });
  // Debug endpoint that doesn't require database connection
  app.get('/api/debug', (req, res) => {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodejs_version: process.version,
      env_vars: {
        db_host: process.env.DB_HOST ? 'set' : 'not set',
        db_port: process.env.DB_PORT ? 'set' : 'not set',
        db_username: process.env.DB_USERNAME ? 'set' : 'not set',
        db_password: process.env.DB_PASSWORD ? 'set' : 'not set',
        db_database: process.env.DB_DATABASE ? 'set' : 'not set',
      },
      certificate_search: {
        certs_dir_exists: fs.existsSync(path.join(__dirname, 'certs')),
        certs_dir_cert_exists: fs.existsSync(path.join(__dirname, 'certs', 'isrgrootx1.pem'))
      }
    };
    
    res.json(debug);
  });

  // Debug endpoint to check database tables
  app.get('/api/debug/tables', async (req, res) => {
    try {
      const pool = await connectToDatabase();
      const [tables] = await pool.execute('SHOW TABLES');
      
      res.json({
        tables: tables.map(t => t[Object.keys(t)[0]])
      });
    } catch (error) {
      console.error('Error getting database structure:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Debug endpoint to check profile posts status distribution
  // This helps verify if approved posts exist and if both systems share the same DB
  app.get('/api/debug/posts-status', async (req, res) => {
    try {
      const pool = await connectToDatabase();
      
      // Get status counts
      const [statusCounts] = await pool.execute(`
        SELECT 
          status, 
          COUNT(*) as count 
        FROM profile_posts 
        GROUP BY status
      `);
      
      // Get recent posts with their status
      const [recentPosts] = await pool.execute(`
        SELECT id, place_name, state, status, created_at 
        FROM profile_posts 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      // Get database name to verify connection
      const [dbInfo] = await pool.execute('SELECT DATABASE() as db_name');
      
      res.json({
        database: dbInfo[0].db_name,
        statusCounts: statusCounts,
        recentPosts: recentPosts,
        message: 'Use this to verify the dashboard and main site share the same database'
      });
    } catch (error) {
      console.error('Error checking posts status:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });
}

/**
 * SECURITY: Mock feedback endpoints only available in development
 * These write to filesystem and should never be enabled in production
 */
if (!isProduction) {
  // Add a mock feedback endpoint that doesn't require database connection
  app.post('/api/feedback-mock', (req, res) => {
    try {
      // Validate required fields
      const { name, email, rating, feedback, suggestions } = req.body;
      
      if (!name || !email || !rating) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required fields' 
        });
      }

      // SECURITY: Validate rating is a number between 1-5
      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return res.status(400).json({ 
          success: false,
          error: 'Rating must be between 1 and 5' 
        });
      }
      
      // SECURITY: Generate safe numeric ID only
      const fakeId = Date.now();
      
      // Store in file system as fallback
      try {
        const feedbackData = {
          id: fakeId,
          name: String(name).substring(0, 100), // Limit length
          email: String(email).substring(0, 100),
          rating: numRating,
          feedback: String(feedback || '').substring(0, 5000),
          suggestions: String(suggestions || '').substring(0, 5000),
          timestamp: new Date().toISOString()
        };
        
        const feedbackDir = path.join(__dirname, 'feedback-data');
        if (!fs.existsSync(feedbackDir)) {
          fs.mkdirSync(feedbackDir, { recursive: true });
        }
        
        // SECURITY: Filename uses only numeric ID
        fs.writeFileSync(
          path.join(feedbackDir, `feedback-${fakeId}.json`),
          JSON.stringify(feedbackData, null, 2)
        );
      } catch (fileErr) {
        console.error('Error saving mock feedback:', fileErr.message);
      }
      
      res.status(201).json({ 
        success: true,
        message: 'Feedback submitted successfully (MOCK)',
        id: fakeId
      });
    } catch (err) {
      console.error('Error in mock feedback:', err.message);
      res.status(500).json({ 
        success: false,
        error: 'Failed to submit feedback' 
      });
    }
  });

  // Add a GET endpoint to retrieve all mock feedback submissions
  app.get('/api/feedback-mock', (req, res) => {
    try {
      const feedbackDir = path.join(__dirname, 'feedback-data');
      
      if (!fs.existsSync(feedbackDir)) {
        return res.status(200).json({ 
          success: true,
          feedbacks: [],
          message: 'No feedback data found'
        });
      }
      
      // SECURITY: Only read files matching expected pattern
      const files = fs.readdirSync(feedbackDir)
        .filter(file => /^feedback-\d+\.json$/.test(file));
      const feedbacks = [];
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(feedbackDir, file), 'utf8');
          const data = JSON.parse(content);
          feedbacks.push(data);
        } catch (err) {
          // Skip malformed files
        }
      }
      
      feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.status(200).json({ 
        success: true,
        feedbacks, 
        count: feedbacks.length
      });
    } catch (err) {
      console.error('Error retrieving mock feedback:', err.message);
      res.status(500).json({ 
        success: false,
        error: 'Failed to retrieve feedback' 
      });
    }
  });

  // Add a GET endpoint to retrieve a specific mock feedback by ID
  app.get('/api/feedback-mock/:id', (req, res) => {
    try {
      const feedbackId = req.params.id;
      
      // SECURITY: Validate ID is numeric only (prevent path traversal)
      if (!/^\d+$/.test(feedbackId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid feedback ID'
        });
      }

      const feedbackDir = path.join(__dirname, 'feedback-data');
      const filePath = path.join(feedbackDir, `feedback-${feedbackId}.json`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          success: false,
          error: 'Feedback not found'
        });
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      res.status(200).json({ 
        success: true,
        feedback: data
      });
    } catch (err) {
      console.error('Error retrieving mock feedback:', err.message);
      res.status(500).json({ 
        success: false,
        error: 'Failed to retrieve feedback' 
      });
    }
  });
}

// Places endpoint - Get places by state
app.get('/api/places/state/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    
    // SECURITY: Basic validation - state name should be a reasonable string
    if (!stateName || typeof stateName !== 'string' || stateName.length > 100) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid state name'
      });
    }

    const connection = await connectToDatabase();
    
    // First get the places with their categories
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE LOWER(p.state) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, p.created_at, p.updated_at, p.map_link, c.name
    `;
    
    const [places] = await connection.execute(query, [stateName]);
    
    // For each place, get its key information
    for (const place of places) {
      const [keyInfo] = await connection.execute(
        `SELECT question, answer 
         FROM place_key_information 
         WHERE place_id = ?`,
        [place.id]
      );
      
      // Convert images string to array
      place.images = place.images ? place.images.split(',') : [];
      place.key_info = keyInfo;
    }
    
    res.json(places);
  } catch (error) {
    // SECURITY: Don't expose internal error details
    console.error('Error fetching places:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch places'
    });
  }
});

// Get a single place by ID and state
app.get('/api/state/:stateName/place/:placeId', async (req, res) => {
  const { stateName, placeId } = req.params;

  // SECURITY: Validate placeId is a positive integer
  const numericPlaceId = parseInt(placeId, 10);
  if (isNaN(numericPlaceId) || numericPlaceId <= 0 || String(numericPlaceId) !== String(placeId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid place ID'
    });
  }

  try {
    const connection = await connectToDatabase();

    // Query to get place details including category and images
    const query = `
      SELECT p.*, c.name as category_name, GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE p.id = ? AND LOWER(TRIM(p.state)) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, p.created_at, p.updated_at, p.map_link, c.name
    `;

    const formattedStateName = stateName.split('-').join(' ').trim();
    const [places] = await connection.execute(query, [numericPlaceId, formattedStateName]);

    if (!places || places.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Place not found'
      });
    }

    // Get key information for the place
    const keyInfoQuery = `
      SELECT question, answer
      FROM place_key_information
      WHERE place_id = ?
      ORDER BY id ASC
    `;

    const [keyInfo] = await connection.execute(keyInfoQuery, [numericPlaceId]);

    // Process the place data
    const placeData = {
      ...places[0],
      images: places[0].images ? places[0].images.split(',') : [],
      keyInformation: keyInfo
    };

    res.json(placeData);
  } catch (error) {
    // SECURITY: Don't expose internal error details in production
    console.error('Error fetching place:', error.message);
    res.status(500).json({ 
      success: false,
      error: isProduction ? 'Failed to fetch place data' : error.message
    });
  }
});

// Get a place by city name and state
app.get('/api/places/:stateName/:cityName', async (req, res) => {
  const { stateName, cityName } = req.params;

  // SECURITY: Basic validation
  if (!stateName || !cityName || stateName.length > 100 || cityName.length > 100) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid parameters' 
    });
  }

  try {
    const connection = await connectToDatabase();
    
    // Query to get place details including category and images
    const query = `
      SELECT p.*, c.name as category_name, GROUP_CONCAT(pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE LOWER(p.state) = LOWER(?)
      AND LOWER(p.city) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, p.map_link, c.name
    `;

    const [place] = await connection.execute(query, [
      stateName.split('-').join(' '), 
      cityName.split('-').join(' ')
    ]);

    if (!place || place.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Place not found' 
      });
    }

    // Get key information for the place
    const keyInfoQuery = `
      SELECT question, answer
      FROM place_key_information
      WHERE place_id = ?
      ORDER BY id ASC
    `;

    const [keyInfo] = await connection.execute(keyInfoQuery, [place[0].id]);

    // Process the place data
    const placeData = {
      ...place[0],
      images: place[0].images ? place[0].images.split(',') : [],
      keyInformation: keyInfo
    };

    res.json(placeData);
  } catch (error) {
    // SECURITY: Don't expose internal error details
    console.error('Error fetching place:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch place data' 
    });
  }
});

// ========================================
// FESTIVALS API ENDPOINTS (Public)
// ========================================

// Get all festivals
app.get('/api/festivals', async (req, res) => {
  try {
    const { search, month } = req.query;
    const connection = await connectToDatabase();
    
    let query = 'SELECT * FROM festivals WHERE 1=1';
    const params = [];
    
    // Search filter
    if (search && typeof search === 'string' && search.length <= 100) {
      query += ' AND (name LIKE ? OR main_states LIKE ? OR best_places LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Month filter
    if (month && typeof month === 'string' && month.length <= 50) {
      query += ' AND month = ?';
      params.push(month);
    }
    
    query += ' ORDER BY name ASC';
    
    const [festivals] = await connection.execute(query, params);
    
    res.json({
      success: true,
      data: festivals
    });
  } catch (error) {
    console.error('Error fetching festivals:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch festivals'
    });
  }
});

// Get a single festival by ID
app.get('/api/festivals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // SECURITY: Validate ID is a positive integer
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId < 1 || String(numId) !== String(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid festival ID'
      });
    }
    
    const connection = await connectToDatabase();
    const [festivals] = await connection.execute(
      'SELECT * FROM festivals WHERE id = ?',
      [numId]
    );
    
    if (!festivals || festivals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Festival not found'
      });
    }
    
    res.json({
      success: true,
      data: festivals[0]
    });
  } catch (error) {
    console.error('Error fetching festival:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch festival'
    });
  }
});

// Get places by city name
app.get('/api/places/city/:cityName', async (req, res) => {
  const { cityName } = req.params;

  // SECURITY: Basic validation
  if (!cityName || typeof cityName !== 'string' || cityName.length > 100) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid city name'
    });
  }

  try {
    const formattedCityName = cityName.split('-').join(' ');
    
    const query = `
      SELECT p.*, c.name as category_name, GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE LOWER(p.city) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, p.map_link, c.name
    `;

    const connection = await connectToDatabase();
    const [places] = await connection.execute(query, [formattedCityName]);

    if (!places || places.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Places not found'
      });
    }

    // Get key information for all places
    const placesWithInfo = await Promise.all(places.map(async (place) => {
      const keyInfoQuery = `
        SELECT question, answer
        FROM place_key_information
        WHERE place_id = ?
        ORDER BY id ASC
      `;
      const [keyInfo] = await connection.execute(keyInfoQuery, [place.id]);
      
      return {
        ...place,
        images: place.images ? place.images.split(',') : [],
        keyInformation: keyInfo
      };
    }));

    res.json(placesWithInfo);
  } catch (error) {
    // SECURITY: Don't expose internal error details
    console.error('Error fetching places:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch place data'
    });
  }
});

/**
 * SECURITY: 404 handler - don't leak information about non-existent routes
 */
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Resource not found' 
  });
});

/**
 * SECURITY: Centralized error handling middleware
 * - Logs full error for debugging
 * - Returns sanitized error to client
 * - Prevents information leakage in production
 */
app.use((err, req, res, next) => {
  // Log full error for server-side debugging
  console.error('Error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      success: false,
      message: 'Cross-origin request blocked' 
    });
  }

  // SECURITY: Don't expose internal error details in production
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({ 
    success: false,
    message: isProduction 
      ? 'An error occurred processing your request' 
      : err.message
  });
});

// For local development
if (!isProduction) {
  // Initialize database connection on startup
  (async () => {
    try {
      console.log('Initializing database connection on startup...');
      await connectToDatabase();
      console.log('Database initialized successfully!');

      // Initialize users table for auth
      await initUsersTable();
      
      // Initialize posts table
      await initPostsTable();
      
      // Initialize profile posts table
      await initProfilePostsTable();
      
      // Initialize saved places table
      await initSavedPlacesTable();
      
      // Initialize embedding service for vector search (async, non-blocking)
      if (embeddingService) {
        console.log('Starting embedding service initialization...');
        embeddingService.initializeIndex()
          .then(() => console.log('Embedding service ready for vector search!'))
          .catch(err => console.error('Failed to initialize embedding service:', err.message));
      } else {
        console.log('Embedding service not available, skipping vector search initialization');
      }
    } catch (err) {
      console.error('Failed to initialize database on startup:', err.message);
    }
  })();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app; 