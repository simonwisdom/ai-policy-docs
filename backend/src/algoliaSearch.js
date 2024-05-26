const express = require('express');
const algoliasearch = require('algoliasearch');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();
const fetch = require('node-fetch');

const router = express.Router();

// Initialize Algolia client
const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

// Initialize Claude client
const claudeClient = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const KEYWORD_EXTRACTION_PROMPT = `
Please extract the most relevant keywords from the given user query for searching in a document database. Provide the keywords as a comma-separated list. Exclude intro/outro.

Example 1:
User Query: "What kind of regulations apply to frontier labs like OpenAI?"
Keywords: frontier, regulations, OpenAI

Example 2:
User Query: "Are there export controls specifically targeted to China?"
Keywords: export controls, China
----

User Query: {USER_QUERY}
Keywords:
`;

const PROMPT_TEMPLATE = `
You are an AI assistant knowledgeable about AI policy documents. 

Please analyze the following documents and provide a high level summary of the relevant documents. 
Format your response in Markdown. Keep the response to 200 tokens or less.

Example User Query: Are there export controls specifically targeted to China?
Example Response: 
**Summary:** 
Yes, there are specific export controls on AI hardware targeted at China, primarily implemented by the United States. These controls aim to prevent China from acquiring advanced technology that could enhance its AI and military capabilities.

**Key Points:**
- **Advanced Semiconductors:** Restrictions on cutting-edge semiconductors.
- **AI-specific Chips:** Controls on AI-specific hardware.
- **High-performance Computing Technologies:** Limitations on high-performance computing technologies.
- **Entity List:** Certain Chinese companies added, restricting access to U.S.-origin technology and components.

**Purpose:** 
These measures address concerns over:
- National security
- Technological competition

User Query: {USER_QUERY}

Documents:
{DOCUMENTS}

Response:
`;


async function extractKeywords(query) {
  const prompt = KEYWORD_EXTRACTION_PROMPT.replace('{USER_QUERY}', query);

  const response = await claudeClient.messages.create({
    model: 'claude-3-haiku-20240307',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100
  });

  if (response && response.content && response.content.length > 0) {
    const keywordsText = response.content.map(part => part.text).join(' ').trim();
    return keywordsText.split(',').map(keyword => keyword.trim());
  } else {
    console.error('Unexpected response structure:', response);
    throw new Error('Unexpected response structure from Claude API');
  }
}

router.get('/api/algolia_search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log('User Query:', query);

    // Extract keywords from the user's query
    let keywords = await extractKeywords(query);
    keywords = keywords.map(keyword => keyword.replace('Keywords:', '').trim());
    console.log('Extracted Keywords:', keywords);

    let searchData = [];
    while (keywords.length > 0) {
      // Perform the Algolia search using the current keywords
      const searchResults = await index.search(keywords.join(' '));
      searchData = searchResults.hits;

      if (searchData.length > 0) {
        break;
      }

      // Remove the first keyword and try again
      keywords.shift();
    }

    if (searchData.length === 0) {
      const finalResponse = { message: 'No relevant documents found.' };
      res.json(finalResponse);
      return res.end();
    }

    // Format the documents for the prompt
    searchData = searchData.map(doc => ({
      ...doc,
      publication_date: new Date(doc.publication_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      page_views_count: doc.page_views_count.toLocaleString(),
    }));

    // Sort by page views descending
    // searchData.sort((a, b) => b.page_views_count - a.page_views_count);

    const documentsText = searchData.map(doc => `
        Title: ${doc.title}
        Document Number: ${doc.document_number}

        Publication Date: ${doc.publication_date}

        Page Views: ${doc.page_views_count}
    `).join('\n\n');

    // Create the prompt for Claude
    const prompt = PROMPT_TEMPLATE.replace('{USER_QUERY}', query).replace('{DOCUMENTS}', documentsText);

    // Send the prompt to Claude
    const response = await claudeClient.messages.create({
      model: 'claude-3-haiku-20240307',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    });

    // Ensure response has the expected structure and extract text
    if (response && response.content && response.content.length > 0) {
      const responseText = response.content.map(part => part.text).join(' ').trim();
      const finalResponse = { searchResults: searchData, llmResponse: responseText };
      res.json(finalResponse);

      // Call set_document_filter API endpoint
      try {
        const setDocumentFilterUrl = process.env.NODE_ENV === 'production'
        ? `${process.env.VITE_BACKEND_URL_PROD}/api/set_document_filter`
        : `${process.env.VITE_BACKEND_URL_DEV}/api/set_document_filter`;
      
        const documentNumbers = searchData.map(doc => doc.document_number);
        await fetch(setDocumentFilterUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentNumbers }),
        });
      } catch (error) {
        console.error('Error setting document filter:', error);
      }

      res.end();
    } else {
      console.error('Unexpected response structure:', response);
      res.status(500).json({ error: 'Unexpected response structure from Claude API' });
    }
  } catch (error) {
    console.error('Error during Algolia or Claude processing:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;