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
      agency_names,
      tags,
      type,
      comments_close_on,
      page_views_count_gte,
      search_query_like,
      _start = req.query._start || 0,
      _end = req.query._end || 10,
      sort = "publication_date:desc",
    } = req.query;

    // Check if the type or comments_close_on filter is present
    const hasFilter = type || comments_close_on;

    // Reset pagination if the filter is present
    const resetPagination = hasFilter;
    const start = resetPagination ? 0 : parseInt(_start, 10);
    const end = resetPagination ? 10 : parseInt(_end, 10);

    // Log the received query parameters and pagination values
    console.log(`Received Query Params: ${JSON.stringify(req.query)}`);
    // logger.info(`Reset Pagination: ${resetPagination}`);
    // logger.info(`Computed Pagination: Start - ${start}, End - ${end}`);

    const pageSize = parseInt(_end, 10) - parseInt(_start, 10);
    const page = Math.floor(parseInt(_start, 10) / pageSize) + 1;

    let query = "SELECT * FROM ai_documents";
    const conditions = [];
    const values = [];

    // Parse sorting
    let sortClause = '';
    if (sort) {
      const [field, order] = sort.split(':');
      sortClause = ` ORDER BY ${field} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    // Apply filtering conditions
    if (agency_names) {
      conditions.push(`agency_names ILIKE $${conditions.length + 1}`);
      values.push(`%${agency_names}%`);
    }

    if (search_query_like) {
      const insertQuery = 'INSERT INTO search_queries (query, timestamp) VALUES ($1, $2)';
      const insertValues = [search_query_like, new Date()];
      await pool.query(insertQuery, insertValues);

      conditions.push(`(llm_summary ILIKE $${conditions.length + 1} OR abstract ILIKE $${conditions.length + 2})`);
      values.push(`%${search_query_like}%`, `%${search_query_like}%`);
    }

    if (type === 'Popular') {
      conditions.push('page_views_count >= 3000');
      // console.log("Popular filter applied");
    } else if (type) {
      conditions.push(`type = $${conditions.length + 1}`);
      values.push(type);
      console.log("Type filter applied:", type);
    }

    // Log the conditions array and values array
    // console.log("Conditions:", conditions);
    // console.log("Values:", values);

    if (tags) {
      conditions.push(`tags ILIKE $${conditions.length + 1}`);
      values.push(`%${tags}%`);
    }

    if (type === "Open Comments") {
      conditions.push(`CAST(comments_close_on AS DATE) > CURRENT_DATE`);
    } else if (type && type !== 'Popular') {
      conditions.push(`type = $${conditions.length + 1}`);
      values.push(type);
    }

    if (page_views_count_gte) {
      conditions.push(`page_views_count >= $${conditions.length + 1}`);
      values.push(parseInt(page_views_count_gte, 10));
    }

    // Add conditions to query if available
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Apply sorting before pagination
    query += sortClause;

    // Pagination
    const offset = (page - 1) * pageSize;
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(pageSize, offset);

    // Log the generated SQL query and values
    console.log("Generated SQL Query:", query);
    console.log("SQL Query Values:", values);

    // Log and execute the main query
    const result = await pool.query(query, values);

    // Count query for total count
    let countQuery = "SELECT COUNT(*) FROM ai_documents";
    const countValues = [];

    if (conditions.length > 0) {
      countQuery += ` WHERE ${conditions.join(" AND ")}`;
      countValues.push(...values.slice(0, values.length - 2)); // Exclude the last two values (pageSize and offset)
    }

    // Log the count query and values
    // console.log("Count Query:", countQuery);
    // console.log("Count Query Values:", countValues);
    
    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    
    // console.log("Total Count:", totalCount);


    // console.log(`Received Parameters: Page - ${page}, PageSize - ${pageSize}, Offset - ${offset}`);
    // logger.info(`Sorted Document Numbers on Page ${page}: ${result.rows.map((doc) => doc.publication_date).slice(0, 10).join(', ')}`);


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
