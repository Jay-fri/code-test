// Enhanced app.js with more robust error handling
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

// Improved middleware and error logging
app.use(cors({
  origin: '*', // More permissive for debugging
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Detailed database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'videodb_user', // Use the new user
  password: process.env.DB_PASSWORD || 'your_secure_password',
  database: 'videodb'
};

// Enhanced error logging middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: true, 
    message: 'Internal server error',
    details: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// API endpoint with comprehensive error handling
app.post('/v1/api/rest/video/PAGINATE', async (req, res, next) => {
  let connection;
  try {
    console.log('Received pagination request:', req.body);
    
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const offset = (page - 1) * limit;

    // Log database configuration (remove sensitive info in production)
    console.log('DB Config:', { 
      host: dbConfig.host, 
      user: dbConfig.user, 
      database: dbConfig.database 
    });

    // Establish database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection established');

    // Get total count
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM videos'
    );
    const total = countResult[0].total;
    console.log('Total videos:', total);

    // Get paginated videos with user info
    const [rows] = await connection.query(
      `SELECT 
        v.id, 
        v.title, 
        v.photo, 
        v.user_id,
        u.username,
        v.created_at, 
        v.updated_at, 
        v.likes
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.likes DESC
      LIMIT ?, ?`,
      [offset, limit]
    );

    console.log('Fetched rows:', rows.length);

    // Always close the connection
    await connection.end();

    res.json({
      error: false,
      list: rows,
      page: page,
      limit: limit,
      total,
      num_pages: Math.ceil(total / limit)
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('Detailed Error:', error);

    // Close connection if it was opened
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }

    // Pass to error handling middleware
    next(error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});