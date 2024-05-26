const express = require("express");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require("cors");
const { Pool } = require("pg");
const morgan = require("morgan");
const winston = require("winston");
const path = require('path');
require("dotenv").config();

const algoliaSearchRouter = require('./algoliaSearch');

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Session middleware setup
app.use(
  session({
    store: new pgSession({
      pool, // Use the existing connection pool
    }),
    secret: process.env.SESSION_SECRET || 'default_secret', // Use a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: 'lax' }, // Adjust settings for development
  })
);

// Serve frontend build files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Morgan middleware for HTTP request logging
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV,
}));

app.use(express.json());

// Use the Algolia search router
app.use(algoliaSearchRouter);

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

async function fetchFilteredDocuments(documentFilter, filters) {
  // console.log('Document Filter:', documentFilter);

  const { query, page, pageSize } = constructQuery(filters, documentFilter);

  // Log the constructed query for debugging
  logger.info(`Constructed Query: ${query.text}`);
  logger.info(`Query Values: ${JSON.stringify(query.values)}`);

  const result = await pool.query(query);

  const countQuery = {
    text: "SELECT COUNT(*) FROM ai_documents",
    values: [],
  };

  if (query.values.length > 0) {
    const whereClause = query.text.split("WHERE")[1];
    if (whereClause) {
      countQuery.text += " WHERE " + whereClause.split("ORDER")[0].trim();
      countQuery.values = query.values.slice(0, -2);
    }
  }

  // Log the count query for debugging
  logger.info(`Count Query: ${countQuery.text}`);
  logger.info(`Count Query Values: ${JSON.stringify(countQuery.values)}`);

  const countResult = await pool.query(countQuery);
  const totalCount = parseInt(countResult.rows[0].count, 10);

  return {
    data: result.rows,
    total: totalCount,
    page: page,
    pageSize: pageSize,
  };
}

function constructQuery(filters, documentFilter) {
  const {
    agency_names_like,
    tags,
    type,
    comments_close_on,
    page_views_count_gte,
    search_query_like,
    _start = 0,
    _end = 10,
    _sort = "publication_date",
    _order = "desc",
  } = filters;

  const query = {
    text: "SELECT * FROM ai_documents",
    values: [],
  };

  const conditions = [];

  if (documentFilter) {
    conditions.push("document_number = ANY($" + (query.values.length + 1) + ")");
    query.values.push(documentFilter);
  } else {
    if (agency_names_like) {
      conditions.push("agency_names ILIKE $" + (query.values.length + 1));
      query.values.push(`%${agency_names_like}%`);
    }

    if (search_query_like) {
      conditions.push(
        "(llm_summary ILIKE $" + (query.values.length + 1) + 
        " OR abstract ILIKE $" + (query.values.length + 2) + 
        " OR title ILIKE $" + (query.values.length + 3) + 
        " OR document_number ILIKE $" + (query.values.length + 4) + ")"
      );
      query.values.push(`%${search_query_like}%`, `%${search_query_like}%`, `%${search_query_like}%`, `%${search_query_like}%`);
    }

    if (type === "Popular") {
      conditions.push("page_views_count >= $" + (query.values.length + 1));
      query.values.push(3000);
    } else if (type === "Open Comments") {
      conditions.push("CAST(comments_close_on AS DATE) > CURRENT_DATE");
    } else if (type) {
      conditions.push("type = $" + (query.values.length + 1));
      query.values.push(type);
    }

    if (tags) {
      conditions.push("tags ILIKE $" + (query.values.length + 1));
      query.values.push(`%${tags}%`);
    }

    if (page_views_count_gte) {
      conditions.push("page_views_count >= $" + (query.values.length + 1));
      query.values.push(parseInt(page_views_count_gte, 10));
    }
  }

  if (conditions.length > 0) {
    query.text += " WHERE " + conditions.join(" AND ");
  }

  query.text += ` ORDER BY ${_sort} ${_order}`;

  const start = parseInt(_start, 10);
  const end = parseInt(_end, 10);
  const pageSize = end - start;
  const page = Math.floor(start / pageSize) + 1;
  const offset = (page - 1) * pageSize;

  query.text += " LIMIT $" + (query.values.length + 1) + " OFFSET $" + (query.values.length + 2);
  query.values.push(pageSize, offset);

  return { query, page, pageSize };
}

// Get all documents with optional filtering and pagination
app.get("/api/ai_documents", async (req, res) => {
  try {
    const documentFilter = req.session.documentFilter;
    const result = await fetchFilteredDocuments(documentFilter, req.query);
    
    // Log the result for debugging
    // logger.info(`API Response: ${JSON.stringify(result)}`);

    res.json({
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
