const algoliasearch = require('algoliasearch');
const { Pool } = require('pg');
require('dotenv').config();

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);
const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function getLastIndexedTime() {
  try {
    const res = await pool.query('SELECT last_indexed FROM algolia_index_metadata ORDER BY id DESC LIMIT 1');
    if (res.rows.length > 0) {
      return res.rows[0].last_indexed;
    } else {
      return new Date(0); // Return epoch start if no records found
    }
  } catch (error) {
    console.error('Error fetching last indexed time from PostgreSQL:', error);
    throw error;
  }
}

async function updateLastIndexedTime(timestamp) {
  try {
    const res = await pool.query('INSERT INTO algolia_index_metadata (last_indexed) VALUES ($1)', [timestamp]);
    return res;
  } catch (error) {
    console.error('Error updating last indexed time in PostgreSQL:', error);
    throw error;
  }
}

async function fetchDataFromPostgres(since) {
  try {
    const query = {
      text: 'SELECT * FROM ai_documents WHERE last_modified > $1',
      values: [since],
    };
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error);
    throw error;
  }
}

async function indexData() {
  try {
    // Determine the last indexed time
    const lastIndexed = await getLastIndexedTime();
    console.log(`Last indexed time: ${lastIndexed}`);

    // Fetch data from PostgreSQL
    const records = await fetchDataFromPostgres(lastIndexed);
    console.log(`Fetched ${records.length} records from PostgreSQL`);

    if (records.length > 0) {
      // Index the fetched records
      const { objectIDs } = await index.saveObjects(records, { autoGenerateObjectIDIfNotExist: true });
      console.log(`Indexed ${objectIDs.length} records to Algolia`);

      // Update last indexed time
      const newLastIndexed = new Date().toISOString();
      await updateLastIndexedTime(newLastIndexed);
    } else {
      console.log('No new records to index');
    }
  } catch (error) {
    console.error('Error indexing data:', error);
  }
}

indexData();
