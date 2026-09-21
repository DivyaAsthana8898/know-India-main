const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * SECURITY: Connection pool for better performance and connection management
 * - Prevents connection exhaustion under load
 * - Automatically handles connection lifecycle
 * - Better for concurrent requests
 */
let pool = null;
const isProduction = process.env.NODE_ENV === 'production';

/**
 * SECURITY: Get SSL configuration based on environment
 */
function getSSLConfig() {
  // SECURITY: In production, always use SSL
  if (isProduction) {
    // Try to load certificate
    let ca = null;
    const certLocations = [
      path.join(__dirname, '..', 'certs', 'isrgrootx1.pem'),
      path.join(__dirname, '..', 'isrgrootx1.pem'),
      '/var/task/certs/isrgrootx1.pem',
    ];

    if (process.env.CA_PATH) {
      certLocations.unshift(process.env.CA_PATH);
    }

    for (const certPath of certLocations) {
      if (fs.existsSync(certPath)) {
        ca = fs.readFileSync(certPath);
        console.log(`Using certificate from: ${certPath}`);
        break;
      }
    }

    if (!ca && (process.env.DB_CA_CERT || process.env.CA_CERT)) {
      const certBase64 = process.env.DB_CA_CERT || process.env.CA_CERT;
      ca = Buffer.from(certBase64, 'base64');
    }

    // SECURITY: Use SSL with certificate if available
    return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false };
  }

  // Development: allow non-SSL for local databases
  return false;
}

/**
 * SECURITY: Create connection pool with secure defaults
 */
function createPool() {
  if (pool) return pool;

  const poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    // Support both env var naming conventions (DB_USERNAME/DB_USER, DB_DATABASE/DB_NAME)
    user: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || process.env.DB_NAME,
    ssl: getSSLConfig(),
    // SECURITY: Connection pool settings
    waitForConnections: true,
    connectionLimit: 10, // Max connections in pool
    queueLimit: 0, // Unlimited queue
    connectTimeout: 20000,
    // SECURITY: Prevent hanging connections
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };

  pool = mysql.createPool(poolConfig);
  console.log('Database connection pool created');
  return pool;
}

/**
 * Connect to MySQL database using connection pool
 * SECURITY: Uses pooled connections for better resource management
 */
async function connectToDatabase() {
  const connectionPool = createPool();
  
  try {
    // Test connection
    const connection = await connectionPool.getConnection();
    await connection.execute('SELECT 1');
    connection.release();
    return connectionPool;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

/**
 * Initialize the users table if it doesn't exist
 */
async function initUsersTable() {
  const connection = await connectToDatabase();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      avatar VARCHAR(500),
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.execute(createTableQuery);
  console.log('Users table ready');
}

/**
 * Initialize travel posts table
 */
async function initPostsTable() {
  const connection = await connectToDatabase();
  
  // Create posts table
  const createPostsQuery = `
    CREATE TABLE IF NOT EXISTS travel_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      images JSON,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createPostsQuery);
  
  // Create votes table to track user votes
  const createVotesQuery = `
    CREATE TABLE IF NOT EXISTS post_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      vote_type ENUM('upvote', 'downvote') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_vote (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES travel_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createVotesQuery);
  
  console.log('Posts and votes tables ready');
}

/**
 * Initialize profile posts table with place information
 */
async function initProfilePostsTable() {
  const connection = await connectToDatabase();
  
  // Create profile_posts table with status field for approval workflow
  const createProfilePostsQuery = `
    CREATE TABLE IF NOT EXISTS profile_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      place_name VARCHAR(255) NOT NULL,
      state VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      rating INT NOT NULL,
      images JSON,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createProfilePostsQuery);
  
  // Add status column if it doesn't exist (for existing tables)
  try {
    await connection.execute(`
      ALTER TABLE profile_posts 
      ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
    `);
  } catch (err) {
    // Column might already exist or ALTER not supported - ignore
    console.log('Status column check:', err.message);
  }
  
  // MIGRATION: Update any posts with NULL status to 'pending'
  // This handles posts created before the status column was added
  try {
    const [result] = await connection.execute(`
      UPDATE profile_posts 
      SET status = 'pending' 
      WHERE status IS NULL
    `);
    if (result.affectedRows > 0) {
      console.log(`Migration: Updated ${result.affectedRows} posts with NULL status to 'pending'`);
    }
  } catch (err) {
    console.log('Status migration check:', err.message);
  }
  
  // Create profile_post_votes table
  const createProfileVotesQuery = `
    CREATE TABLE IF NOT EXISTS profile_post_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      vote_type ENUM('upvote', 'downvote') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_profile_vote (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES profile_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createProfileVotesQuery);
  
  console.log('Profile posts and votes tables ready');
}

/**
 * Initialize saved places table for user bookmarks
 */
async function initSavedPlacesTable() {
  const connection = await connectToDatabase();
  
  const createSavedPlacesQuery = `
    CREATE TABLE IF NOT EXISTS saved_places (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      place_id INT NOT NULL,
      place_name VARCHAR(255) NOT NULL,
      state VARCHAR(100) NOT NULL,
      state_slug VARCHAR(100),
      category VARCHAR(100),
      image TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_place (user_id, place_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createSavedPlacesQuery);
  
  console.log('Saved places table ready');
}

module.exports = {
  connectToDatabase,
  initUsersTable,
  initPostsTable,
  initProfilePostsTable,
  initSavedPlacesTable,
};

