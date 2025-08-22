-- Database Migration Script for Railway PostgreSQL
-- This script creates the necessary tables and structures

-- Create ai_documents table
CREATE TABLE IF NOT EXISTS ai_documents (
    document_number VARCHAR,
    created_at VARCHAR,
    llm_summary VARCHAR,
    ai_related INTEGER,
    llm_summary_full VARCHAR,
    last_modified VARCHAR,
    abstract VARCHAR,
    action VARCHAR,
    agency_names VARCHAR,
    body_html_url VARCHAR,
    comment_url VARCHAR,
    comments_close_on DATE,
    dates VARCHAR,
    effective_on VARCHAR,
    full_text_xml_url VARCHAR,
    html_url VARCHAR,
    publication_date DATE,
    raw_text_url VARCHAR,
    title VARCHAR,
    toc_doc VARCHAR,
    type VARCHAR,
    regulations_dot_gov_comments_url VARCHAR,
    regulations_dot_gov_docket_id VARCHAR,
    regulations_dot_gov_document_id VARCHAR,
    page_views_count INTEGER,
    tags VARCHAR,
    page_views_count_modified_at TIMESTAMP,
    comments_count INTEGER,
    comments_count_modified_at TIMESTAMP
);

-- Create search_queries table
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    timestamp TIMESTAMP
);

-- Create session table for express-session
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default",
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_documents_publication_date ON ai_documents(publication_date);
CREATE INDEX IF NOT EXISTS idx_ai_documents_document_number ON ai_documents(document_number);
CREATE INDEX IF NOT EXISTS idx_ai_documents_type ON ai_documents(type);
CREATE INDEX IF NOT EXISTS idx_ai_documents_agency_names ON ai_documents(agency_names);
CREATE INDEX IF NOT EXISTS idx_search_queries_timestamp ON search_queries(timestamp);
