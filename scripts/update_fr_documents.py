import json
import logging
import os
import psycopg2
import time
from datetime import datetime, timedelta
from federal_register.client import FederalRegister
from multiprocessing import Pool
from tqdm import tqdm
import requests
from time to sleep

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATABASE_URL = os.environ['DATABASE_URL']
FR_DOCUMENTS_TABLE_NAME = os.environ['FR_DOCUMENTS_TABLE_NAME']
AI_DOCUMENTS_TABLE_NAME = os.environ['AI_DOCUMENTS_TABLE_NAME']

# Initialize the Federal Register client
federal_register_client = FederalRegister()


def fetch_page_views(document_number):
    retries = 5
    for attempt in range(retries):
        try:
            logger.debug(f"Fetching page views for document {document_number}")
            document = federal_register_client.document_by_id(
                document_id=document_number,
                fields='page_views'
            )

            if document is None:
                logger.warning(f"API returned None for document {document_number}")
                return None

            if 'page_views' in document:
                page_views_data = document['page_views']
                if 'count' in page_views_data:
                    page_views_count = page_views_data['count']
                    logger.debug(f"Page views count for document {document_number}: {page_views_count}")
                    return page_views_count
                else:
                    logger.warning(f"Missing 'count' key in page_views data for document {document_number}: {page_views_data}")
                    return None
            else:
                logger.warning(f"Unexpected response structure for document {document_number}: {document}")
                return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching page views for document {document_number}: {e}")
            if attempt < retries - 1:
                sleep(2 ** attempt)  # Exponential backoff
            else:
                return None


def update_page_views(args):
    document_number, previous_page_views_count, page_views_count_modified_at, table_name = args
    page_views_count = fetch_page_views(document_number)
        
    if page_views_count is not None:
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {table_name} SET page_views_count = %s, page_views_count_modified_at = NOW() WHERE document_number = %s",
                            (page_views_count, document_number))
                conn.commit()
                return 1

    return 0

def update_page_views_in_postgres(table_name):
    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT document_number, page_views_count, page_views_count_modified_at FROM {table_name}")
            documents = cur.fetchall()

    total_documents = len(documents)
    logger.info(f"Total documents in {table_name}: {total_documents}")

    with Pool() as pool:
        args = [(doc[0], doc[1], doc[2], table_name) for doc in documents]
        updated_counts = list(tqdm(pool.imap(update_page_views, args), total=len(args), desc=f"Updating page views for {table_name}"))

    updated_count = sum(updated_counts)
    logger.info(f"Updated page views for {updated_count} out of {total_documents} documents in {table_name}")

def main():
    logger.info("Starting page views update process")
    start_time = time.time()
    
    try:
        # Update page views for FR_DOCUMENTS_TABLE_NAME
        update_page_views_in_postgres(FR_DOCUMENTS_TABLE_NAME)

        # Update page views for AI_DOCUMENTS_TABLE_NAME
        update_page_views_in_postgres(AI_DOCUMENTS_TABLE_NAME)

        logger.info("Process completed successfully")
    except Exception as e:
        logger.exception(f"An error occurred: {e}")

    end_time = time.time()
    execution_time = end_time - start_time
    logger.info(f"Page views update process finished in {execution_time:.2f} seconds")

if __name__ == '__main__':
    main()
