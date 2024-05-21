const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const morgan = require("morgan");
const winston = require("winston");
const path = require('path');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Serve frontend build files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

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

// Morgan middleware for HTTP request logging
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

// PostgreSQL Pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Utility function to format the SQL query with values
const formatQuery = (query, values) => {
  return query.replace(/\$\d+/g, (match) => {
    const index = parseInt(match.substring(1), 10) - 1;
    return JSON.stringify(values[index]) || match;
  });
};

// Utility function for logging queries
const logQuery = (query, values) => {
  logger.info(`Executing query: ${formatQuery(query, values)}`);
};

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://aipolicydocs.org' : 'http://localhost:5173',
}));

app.use(express.json());

// Simple route to test connection
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Get all documents with optional filtering and pagination
app.get("/api/ai_documents", async (req, res) => {
  try {
    const {
      agency_names_like,
      tags,
      type,
      comments_close_on,
      page_views_count_gte,
      search_query_like,
      _start = 0,
      _end = 10,
      sort = "publication_date:desc",
    } = req.query;

    const hasFilter = type || comments_close_on;
    const resetPagination = hasFilter;
    const start = resetPagination ? 0 : parseInt(_start, 10);
    const end = resetPagination ? 10 : parseInt(_end, 10);

    const pageSize = end - start;
    const page = Math.floor(start / pageSize) + 1;

    const query = {
      text: "SELECT * FROM ai_documents",
      values: [],
    };

    console.log("Received query parameters:", req.query);

    const conditions = [];

    if (agency_names_like) {
      conditions.push("agency_names ILIKE $1");
      query.values.push(`%${agency_names_like}%`);
    }

    if (search_query_like) {
      const insertQuery = {
        text: "INSERT INTO search_queries (query, timestamp) VALUES ($1, $2)",
        values: [search_query_like, new Date()],
      };
      await pool.query(insertQuery);

      conditions.push("(llm_summary ILIKE $" + (query.values.length + 1) + " OR abstract ILIKE $" + (query.values.length + 2) + ")");
      query.values.push(`%${search_query_like}%`, `%${search_query_like}%`);
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

    if (conditions.length > 0) {
      query.text += " WHERE " + conditions.join(" AND ");
    }

    if (sort) {
      const [field, order] = sort.split(":");
      query.text += " ORDER BY " + field + (order === "desc" ? " DESC" : " ASC");
    }

    const offset = (page - 1) * pageSize;
    query.text += " LIMIT $" + (query.values.length + 1) + " OFFSET $" + (query.values.length + 2);
    query.values.push(pageSize, offset);

    console.log("Constructed SQL query:", query.text);
    console.log("Query values:", query.values);

    const result = await pool.query(query);

    // console.log("Query result rows:", result.rows);

    const countQuery = {
      text: "SELECT COUNT(*) FROM ai_documents",
      values: [],
    };

    if (conditions.length > 0) {
      countQuery.text += " WHERE " + conditions.join(" AND ");
      countQuery.values = query.values.slice(0, -2);
    }

    const countResult = await pool.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: result.rows,
      total: totalCount,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Catch-all route to serve the frontend's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
});
