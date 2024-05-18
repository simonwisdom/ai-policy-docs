import json
import requests
import logging
from datetime import datetime, timedelta
from federal_register.client import FederalRegister
import re
import os
from dateutil.parser import parse
import psycopg2
from psycopg2.extras import execute_values
from tqdm import tqdm

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


DATABASE_URL = os.environ['DATABASE_URL']
TABLE_NAME = os.environ['TABLE_NAME']
TERMS = []
# TERMS = ['GPU','machine learning','artificial intelligence','compute','semiconductors','CHIPS']


# Initialize the Federal Register client
federal_register_client = FederalRegister()

def fetch_documents(terms, start_date, end_date, limit):
    """Fetch documents from the Federal Register API for a given date and parse them correctly."""
    response = federal_register_client.documents(
        terms=terms,
        publication_date_greater_than=start_date,
        publication_date_less_than=end_date,
        per_page=limit,
        order=['newest']
    )
    if isinstance(response, str):
        response = json.loads(response)  # Make sure it's parsed to a dictionary if it's a string
    
    documents = response.get('results', [])  # Access the 'results' key that contains the actual documents
    if documents:
        logging.info(f"Fetched {len(documents)} documents from Federal Register.")
    else:
        logging.warning("No documents found in the Federal Register response.")
    
    # Handle missing fields in the documents
    valid_documents = []
    for doc in tqdm(documents, desc="Processing documents"):
        try:
            doc.setdefault('abstract', '')
            doc.setdefault('action', '')
            doc.setdefault('agency_names', [])
            doc.setdefault('html_url', '')
            doc.setdefault('body_html_url', '')
            doc.setdefault('citation', '')
            doc.setdefault('comment_url', '')
            doc.setdefault('comments_close_on', None)
            doc.setdefault('dates', '')
            doc.setdefault('docket_ids', [])
            doc.setdefault('document_number', '')
            doc.setdefault('effective_on', None)
            doc.setdefault('excerpts', '')
            doc.setdefault('full_text_xml_url', '')
            doc.setdefault('json_url', '')
            doc.setdefault('page_views', {})
            doc.setdefault('publication_date', '')
            doc.setdefault('raw_text_url', '')
            doc.setdefault('regulations_dot_gov_info', {})
            doc.setdefault('regulations_dot_gov_url', '')
            doc.setdefault('significant', None)
            doc.setdefault('subtype', '')
            doc.setdefault('title', '')
            doc.setdefault('toc_doc', '')
            doc.setdefault('toc_subject', '')
            doc.setdefault('topics', [])
            doc.setdefault('type', '')
            
            valid_documents.append(doc)

        except AttributeError as e:
            logging.warning(f"Skipping document due to missing attributes: {e}")
            # documents.remove(doc)  # Remove the problematic document from the list
    
    
    return documents

def transform_regulations_url(document_id, docket_ids):
    """Transforms the regulations_dot_gov_comments_url to the desired format."""

    if document_id:
        return f"https://www.regulations.gov/document/{document_id}"
    else:
        # Search 'docket_ids' for a pattern like 'XXX-XXXX-anything'
        match = re.search(r'\b[A-Z]{3}-\d{4}-[\w-]+', docket_ids)
        if match:
            # Check if the found docket ID already matches the required URL base format:
            url_pattern = r'https://www.regulations.gov/document/([A-Z]{3}-\d{4}-[\w-]+)'
            url_match = re.match(url_pattern, f"https://www.regulations.gov/document/{match.group(0)}")
            if url_match:
                return f"https://www.regulations.gov/document/{url_match.group(1)}-0001"
            else:
                return f"https://www.regulations.gov/document/{match.group(0)}"
        else:
            return ""  # Leave blank if nothing is found

def fetch_existing_document_numbers(conn):
    with conn.cursor() as cur:
        cur.execute(f"SELECT document_number FROM {TABLE_NAME}")
        existing_numbers = {row[0] for row in cur.fetchall()}
    logging.info(f"Fetched {len(existing_numbers)} existing document numbers from PostgreSQL.")
    return existing_numbers

def insert_to_postgres(conn, documents, existing_numbers):
    new_documents = [doc for doc in documents if doc['document_number'] not in existing_numbers]
    if not new_documents:
        logging.info("No new documents to insert, all duplicates.")
        return

    columns = ['abstract', 'action', 'agency_names', 'html_url', 'body_html_url', 'citation', 'comment_url',
               'comments_close_on', 'dates', 'docket_ids', 'document_number', 'effective_on', 'excerpts',
               'full_text_xml_url', 'json_url', 'page_views_count', 'publication_date', 'raw_text_url',
               'regulations_dot_gov_comments_url', 'regulations_dot_gov_docket_id', 'regulations_dot_gov_document_id',
               'regulations_dot_gov_title', 'regulations_dot_gov_url', 'significant', 'subtype', 'title', 'toc_doc',
               'toc_subject', 'topics', 'type']

    values = []
    skipped_documents = []
    for doc in tqdm(new_documents, desc="Preparing documents for insertion"):
        try:
            value = (
                doc.get('abstract', ''),
                doc.get('action', ''),
                ', '.join(doc.get('agency_names', [])),
                doc.get('html_url', ''),
                doc.get('body_html_url', ''),
                doc.get('citation', ''),
                doc.get('comment_url', ''),
                doc.get('comments_close_on'),
                doc.get('dates', ''),
                ', '.join(doc.get('docket_ids', [])),
                doc.get('document_number', ''),
                doc.get('effective_on'),
                doc.get('excerpts', ''),
                doc.get('full_text_xml_url', ''),
                doc.get('json_url', ''),
                doc.get('page_views', {}).get('count'),
                doc.get('publication_date', ''),
                doc.get('raw_text_url', ''),
                transform_regulations_url(doc.get('regulations_dot_gov_info', {}).get('document_id', ''), ', '.join(doc.get('docket_ids', []))),
                doc.get('regulations_dot_gov_info', {}).get('docket_id', ''),
                doc.get('regulations_dot_gov_info', {}).get('document_id', ''),
                doc.get('regulations_dot_gov_info', {}).get('title', ''),
                doc.get('regulations_dot_gov_url', ''),
                doc.get('significant'),
                doc.get('subtype', ''),
                doc.get('title', ''),
                doc.get('toc_doc', ''),
                doc.get('toc_subject', ''),
                ', '.join(doc.get('topics', [])),
                doc.get('type', '')
            )
            values.append(value)
        except AttributeError as e:
            logging.warning(f"Skipping document {doc.get('document_number', '')} due to missing attributes: {e}")
            skipped_documents.append(doc)
            
    if skipped_documents:
        logging.info(f"Skipped {len(skipped_documents)} documents due to missing attributes.")
    
    if values:
            with conn.cursor() as cur:
                try:
                    execute_values(cur, f"INSERT INTO {TABLE_NAME} ({', '.join(columns)}) VALUES %s", values)
                    conn.commit()
                    logging.info(f"Inserted {len(values)} new records into PostgreSQL.")
                except psycopg2.IntegrityError as e:
                    conn.rollback()
                    if "duplicate key value violates unique constraint" in str(e):
                        logging.warning("Duplicate documents found. Skipping insertion of duplicate records.")
                        # Remove the duplicate documents from the list
                        unique_documents = [doc for doc in documents if doc['document_number'] not in existing_numbers]
                        logging.info(f"Removed {len(documents) - len(unique_documents)} duplicate documents.")
                        # Retry the insertion with unique documents only
                        values = [(
                            doc.get('abstract', ''),
                            doc.get('action', ''),
                            ', '.join(doc.get('agency_names', [])),
                            # ... (rest of the doc.get calls)
                        ) for doc in unique_documents]
                        execute_values(cur, f"INSERT INTO {TABLE_NAME} ({', '.join(columns)}) VALUES %s", values)
                        conn.commit()
                        logging.info(f"Inserted {len(unique_documents)} unique records into PostgreSQL.")
                    else:
                        logging.error(f"PostgreSQL Integrity Error: {e}")
                        raise
    else:
        logging.info("No valid documents to insert.")


    with conn.cursor() as cur:
        execute_values(cur, f"INSERT INTO {TABLE_NAME} ({', '.join(columns)}) VALUES %s", values)
    conn.commit()
    logging.info(f"Inserted {len(new_documents)} new records into PostgreSQL.")

def main(terms, start_date, end_date, limit):
    try:
        with psycopg2.connect(DATABASE_URL) as conn:
            logging.info("Connected to PostgreSQL database.")
            existing_numbers = fetch_existing_document_numbers(conn)
            documents = fetch_documents(terms, start_date, end_date, limit)
            logging.info(f"Fetched {len(documents)} valid documents")
            insert_to_postgres(conn, documents, existing_numbers)
        logging.info("Process completed successfully.")
    except psycopg2.Error as e:
        logging.error(f"PostgreSQL error: {e}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching data from Federal Register API: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        logging.warning("Attempting to continue execution...")

if __name__ == '__main__':
    today_date = datetime.now().strftime('%Y-%m-%d')
    yesterday_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
    main(terms=TERMS, start_date=yesterday_date, end_date=today_date, limit=1000)
