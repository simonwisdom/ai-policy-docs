-- Missing Tables Migration Script for Railway PostgreSQL

-- Create fr_documents table (the big one - 77MB)
CREATE TABLE IF NOT EXISTS fr_documents (
    abstract TEXT,
    action TEXT,
    agency_names TEXT,
    html_url TEXT,
    body_html_url TEXT,
    citation TEXT,
    comment_url TEXT,
    comments_close_on DATE,
    dates TEXT,
    docket_ids TEXT,
    document_number TEXT NOT NULL,
    effective_on DATE,
    excerpts TEXT,
    full_text_xml_url TEXT,
    json_url TEXT,
    page_views_count INTEGER,
    publication_date DATE,
    raw_text_url TEXT,
    regulations_dot_gov_comments_url TEXT,
    regulations_dot_gov_docket_id TEXT,
    regulations_dot_gov_document_id TEXT,
    regulations_dot_gov_title TEXT,
    regulations_dot_gov_url TEXT,
    significant BOOLEAN,
    subtype TEXT,
    title TEXT,
    toc_doc TEXT,
    toc_subject TEXT,
    topics TEXT,
    type TEXT,
    ai_related VARCHAR,
    llm_summary VARCHAR,
    tags TEXT[], -- ARRAY type
    page_views_count_modified_at TIMESTAMP,
    comments_count INTEGER,
    comments_count_modified_at TIMESTAMP
);

-- Create algolia_index_metadata table
CREATE TABLE IF NOT EXISTS algolia_index_metadata (
    id SERIAL PRIMARY KEY,
    last_indexed TIMESTAMP
);

-- Add primary key constraint for fr_documents
ALTER TABLE fr_documents ADD PRIMARY KEY (document_number);

-- Add indexes for fr_documents
CREATE INDEX IF NOT EXISTS idx_fr_documents_publication_date ON fr_documents(publication_date);
CREATE INDEX IF NOT EXISTS idx_fr_documents_document_number ON fr_documents(document_number);
CREATE INDEX IF NOT EXISTS idx_fr_documents_type ON fr_documents(type);
CREATE INDEX IF NOT EXISTS idx_fr_documents_ai_related ON fr_documents(ai_related);
