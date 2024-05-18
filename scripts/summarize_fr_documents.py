import os
import psycopg2
from psycopg2.extras import execute_values, execute_batch
import anthropic
import json
import re
from tqdm import tqdm
import logging
import datetime
import time
from anthropic import RateLimitError

DATABASE_URL = os.environ['DATABASE_URL']
FR_DOCUMENTS_TABLE_NAME = os.environ['FR_DOCUMENTS_TABLE_NAME']
AI_DOCUMENTS_TABLE_NAME = os.environ['AI_DOCUMENTS_TABLE_NAME']
CLAUDE_API_KEY = os.environ['CLAUDE_API_KEY']
CLAUDE_API_URL = 'https://api.anthropic.com/v1/complete'
BATCH_SIZE = 100
ALLOWED_TAGS = ["IP & Consumer Rights","Geopolitics & Defense","Healthcare","Policy & Standards","Capabilities & Research"]
MAX_REQUESTS_PER_MINUTE = 50
request_timestamps = []

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

PROMPT = """
Please analyze the following text and determine if it is related to AI, AI governance, AI policy, GPU, compute, machine learning, deep learning, neural networks, natural language processing, computer vision, robotics, artificial general intelligence, AI safety, AI alignment, AI regulation, AI ethics, bias in AI, explainable AI, responsible AI, superintelligence, AI risk, AI governance frameworks, AI policy recommendations, AI policy challenges, semiconductor fabrication, CHIPS act, or AI policy research organizations. Ignore 'AI' in the case of 'AI/AN' if it refers to 'American Indian/Alaskan Native'.

If the text is not related to any of these topics, please return a 0 for the 'ai_related' field in the JSON output. If the text is related to one or more of these topics, please return a 1 for the 'ai_related' field.

Additionally, please provide a concise summary of the content as it relates to these areas in the 'llm_summary' field of the JSON output. 
Focus on the key content and avoid filler phrases like "the text appears to be" or "this suggests." 
Prioritize relevance to AI policy/governance as the first or second bullet point in the summary.
Focus on the key content and present the summary as a single string with each bullet point on a new line, preceded by an asterisk and a space.

Also include a 'tags' field in the JSON output that lists only the relevant topics, as an array of strings, from the following list: ["IP & Consumer Rights","Geopolitics & Defense","Healthcare","Policy & Standards","Capabilities & Research"]

Format your response as a JSON object with 'ai_related', 'llm_summary', and 'tags' fields. The response MUST CONTAIN ALL 3 FIELDS. DO NOT RETURN ANYTHING OTHER THAN A CORRECTLY FORMATTED JSON OBJECT.

Here are three example:

Input text:
The European Union has proposed new regulations for AI systems, focusing on transparency, accountability, and human oversight. The proposed legislation aims to mitigate the risks associated with AI while fostering innovation and trust in the technology.

Example JSON output:
Input text:
The European Union has proposed new regulations for AI systems, focusing on transparency, accountability, and human oversight. The proposed legislation aims to mitigate the risks associated with AI while fostering innovation and trust in the technology.

Example JSON output:
{
  "ai_related": 1,
  "llm_summary": "` * EU proposed new AI regulations\n * Focus on transparency, accountability, and human oversight\n * Aims to mitigate AI risks and foster trust`",
  "tags": ["IP & Consumer Rights","Policy & Standards"]
}

Input text:
The National Institute of Standards and Technology (NIST) requests comments on four draft documents responsive to NIST assignment under Executive Order 14110 on Safe, Secure, and Trustworthy Development and Use of Artificial Intelligence (AI) issued on October 30, 2023 (E.O. 14110): NIST AI 600-1, Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile; NIST SP 800-218A, Secure Software Development Practices for Generative AI and Dual-Use Foundation Models; NIST AI 100-5, A Plan for Global Engagement on AI Standards; and NIST AI 100-4, Reducing Risks Posed by Synthetic Content: An Overview of Technical Approaches to Digital Content Transparency.

Example JSON output:
{
  "ai_related": 1,
  "llm_summary": "` * NIST requests comments on draft documents under E.O. 14110 on AI policy\n * Focuses on AI risk management, secure software development, and global AI standards\n * Addresses synthetic content and technical approaches to digital content transparency`",
  "tags": ["Policy & Standards", "Capabilities & Research"]
}

Input text:
The U.S. Nuclear Regulatory Commission (NRC) is requesting comment on a draft Programmatic Agreement (PA) between the NRC, Pennsylvania State Historic Preservation Office (SHPO), and TMI–2 Energy Solutions (TMI–2Solutions).

Example JSON output:
{
  "ai_related": 0,
  "llm_summary": "` * The text discusses a nuclear power plant, Three Mile Island Nuclear Station Unit 2, which is permanently shut down\n * The text does not appear to be related to AI, AI governance, AI policy, or any of the other topics listed in the instructions`",
  "tags": []
}

Now, please analyze the following text:
"""

def fetch_rows_with_empty_ai_related(conn, batch_size):
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT document_number, abstract, action, agency_names, raw_text_url, title, toc_doc, type, excerpts, body_html_url, 
                   comment_url, comments_close_on, dates, effective_on, full_text_xml_url, html_url, publication_date, 
                   regulations_dot_gov_comments_url, regulations_dot_gov_docket_id, regulations_dot_gov_document_id, page_views_count
            FROM {FR_DOCUMENTS_TABLE_NAME} 
            WHERE ai_related IS NULL OR ai_related = '' 
            LIMIT %s
            """,
            (batch_size,)
        )
        rows = cur.fetchall()
    return rows

def update_rows_in_postgres(conn, rows):
    with conn.cursor() as cur:
        update_query = f"""
            UPDATE {FR_DOCUMENTS_TABLE_NAME}
            SET ai_related = data.ai_related,
                llm_summary = data.llm_summary,
                tags = string_to_array(data.tags, ', ')
            FROM (VALUES %s) AS data (document_number, ai_related, llm_summary, tags)
            WHERE {FR_DOCUMENTS_TABLE_NAME}.document_number = data.document_number
        """
        values = [(row['document_number'], row['ai_related'], row['llm_summary'], row['tags']) for row in rows]
        execute_values(cur, update_query, values)
    conn.commit()


def correct_json_formatting(incorrect_json):
    # Truncate any text outside the JSON object
    match = re.search(r'({.*})', incorrect_json, re.DOTALL)
    if match:
        corrected_json = match.group(1)
    else:
        raise ValueError("No JSON object found in the response")

    # Ensure the llm_summary field is properly escaped with newline characters and enclosed in double quotes
    corrected_json = re.sub(
        r'("llm_summary":\s*)"(.*?)"',
        lambda m: m.group(1) + json.dumps(m.group(2)),
        corrected_json, flags=re.DOTALL
    )

    # Ensure tags are formatted as a list of strings
    corrected_json = re.sub(
        r'("tags":\s*)\[(\[.*?\])\]',
        lambda m: m.group(1) + m.group(2),
        corrected_json
    )

    # Remove any trailing commas before closing braces or brackets
    corrected_json = re.sub(r',\s*([\]}])', r'\1', corrected_json)

    return corrected_json

def process_batch(rows):
    processed_rows = []
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')  # Format: YYYY-MM-DD

    for row in tqdm(rows, desc="Processing rows"):
        document_number, abstract, action, agency_names, raw_text_url, title, toc_doc, type_, excerpts, body_html_url, \
        comment_url, comments_close_on, dates, effective_on, full_text_xml_url, html_url, publication_date, \
        regulations_dot_gov_comments_url, regulations_dot_gov_docket_id, regulations_dot_gov_document_id, page_views_count = row

        prompt = f"""
        Your instructions:
        {PROMPT}

        Abstract: {abstract}
        Action: {action}
        Agency Names: {agency_names}
        Title: {title}
        TOC Doc: {toc_doc}
        Type: {type_}
        Excerpts: {excerpts}
        """

        response = send_to_claude_api(prompt)
        if response:
            response_text = response[0].text.strip()
            
            # logger.info(f"Original API response for document {document_number}:")
            # logger.info(response_text)

            try:
                # Attempt to fix common JSON formatting errors
                corrected_json = correct_json_formatting(response_text)
                logger.info(f"Corrected JSON for document {document_number}:")
                # logger.info(f"Corrected JSON for document {document_number}:")
                # logger.info(corrected_json)

                response_json = json.loads(corrected_json)
                ai_related = response_json['ai_related']
                llm_summary = response_json['llm_summary']
                tags = response_json['tags']
                tags_str = ', '.join(tags)  # Convert list to comma-separated string

                processed_row = {
                    "document_number": document_number,
                    "abstract": abstract,
                    "action": action,
                    "agency_names": agency_names,
                    "raw_text_url": raw_text_url,
                    "title": title,
                    "toc_doc": toc_doc,
                    "type": type_,
                    "excerpts": excerpts,
                    "body_html_url": body_html_url,
                    "comment_url": comment_url,
                    "comments_close_on": comments_close_on,
                    "dates": dates,
                    "effective_on": effective_on,
                    "full_text_xml_url": full_text_xml_url,
                    "html_url": html_url,
                    "publication_date": publication_date,
                    "regulations_dot_gov_comments_url": regulations_dot_gov_comments_url,
                    "regulations_dot_gov_docket_id": regulations_dot_gov_docket_id,
                    "regulations_dot_gov_document_id": regulations_dot_gov_document_id,
                    "page_views_count": page_views_count,
                    "ai_related": ai_related,
                    "llm_summary": llm_summary,
                    "tags": tags_str,
                    "created_at": current_date,
                    "last_modified": current_date
                }
                processed_rows.append(processed_row)
            except (json.JSONDecodeError, ValueError, KeyError) as e:
                logger.error(f"Error processing JSON for document {document_number}: {str(e)}")
                logger.error("Skipping this row.")

    return processed_rows

def send_to_claude_api(prompt, max_attempts=3):
    global request_timestamps
    client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

    for attempt in range(max_attempts):
        try:
            # Check if the number of requests in the last minute exceeds the limit
            current_time = time.time()
            request_timestamps = [t for t in request_timestamps if t > current_time - 60]
            if len(request_timestamps) >= MAX_REQUESTS_PER_MINUTE:
                sleep_time = 60 - (current_time - request_timestamps[0])
                logger.info(f"Rate limit reached. Waiting for {sleep_time:.2f} seconds before retrying.")
                time.sleep(sleep_time)

            request_timestamps.append(current_time)

            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                temperature=0,
                system="Your task is to analyze the provided text and determine its relevance to AI, AI policy, and related topics. Provide a JSON response with 'ai_related' (0 or 1) and 'llm_summary' fields.",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )

            response_json = message.content
            return response_json
        except RateLimitError as e:
            if attempt < max_attempts - 1:
                sleep_time = 60 - (time.time() - request_timestamps[-1])
                logger.info(f"Rate limit exceeded. Waiting for {sleep_time:.2f} seconds before retrying.")
                time.sleep(sleep_time)
            else:
                raise e
        except Exception as e:
            if attempt < max_attempts - 1:
                continue
            else:
                raise e
            
def insert_rows_to_ai_documents(conn, rows):
    with conn.cursor() as cur:
        # Retrieve column names for the 'ai_documents' table dynamically
        cur.execute(f"SELECT * FROM {AI_DOCUMENTS_TABLE_NAME} LIMIT 0")
        column_names = [desc[0] for desc in cur.description]
        # logger.info(f"Column names in {AI_DOCUMENTS_TABLE_NAME} table: {column_names}")

        # Prepare data for insertion by filtering and converting to dictionaries
        ai_related_rows = [row for row in rows if row['ai_related'] == 1]
        logger.info(f"Number of AI-related rows: {len(ai_related_rows)}")
        insert_data = []
        for row in ai_related_rows:
            # Map only the keys that exist in both the row and the 'ai_documents' table
            row_data = {col: row[col] for col in column_names if col in row}
            insert_data.append(row_data)
        logger.info(f"Number of rows to be inserted: {len(insert_data)}")

        # Log the data to be inserted
        # logger.info("Data to be inserted:")
        # for data in insert_data:
        #     logger.info(data)

        # Perform batch insert using execute_batch for efficiency, handling duplicate key errors
        if insert_data:
            columns = ', '.join(insert_data[0].keys())
            placeholders = ', '.join(['%s'] * len(insert_data[0]))
            query = f"INSERT INTO {AI_DOCUMENTS_TABLE_NAME} ({columns}) VALUES ({placeholders}) ON CONFLICT (document_number) DO NOTHING RETURNING document_number"
            # logger.info(f"Insert query: {query}")
            try:
                execute_batch(cur, query, [tuple(data.values()) for data in insert_data])
                inserted_document_numbers = [row[0] for row in cur.fetchall()]
                inserted_count = len(inserted_document_numbers)
                conn.commit()
                logger.info(f"Successfully inserted {inserted_count} new rows into ai_documents")
            except psycopg2.errors.UniqueViolation:
                conn.rollback()
                inserted_count = 0
                logger.warning("Duplicate key violation occurred. Skipping insertion of duplicate rows.")
            except Exception as e:
                conn.rollback()
                inserted_count = 0
                logger.error(f"Error occurred during insertion: {str(e)}")
        else:
            inserted_count = 0
            logger.info("No rows to insert into ai_documents")

        return len(ai_related_rows), inserted_count


def main():
    logger.info("Script started")

    with psycopg2.connect(DATABASE_URL) as conn:
        rows = fetch_rows_with_empty_ai_related(conn, 999)
        logger.info(f"Fetched {len(rows)} rows")

        processed_rows = []
        total_ai_related_count = 0
        total_inserted_count = 0

        for i in range(0, len(rows), 50):
            batch_rows = rows[i:i+50]
            batch_processed_rows = process_batch(batch_rows)
            logger.info(f"Processed {len(batch_processed_rows)} rows")

            update_rows_in_postgres(conn, batch_processed_rows)
            logger.info("Updated rows in PostgreSQL")

            ai_related_count, inserted_count = insert_rows_to_ai_documents(conn, batch_processed_rows)
            total_ai_related_count += ai_related_count
            total_inserted_count += inserted_count
            logger.info(f"Found {ai_related_count} AI-related rows in this batch")
            logger.info(f"Inserted {inserted_count} new rows into ai_documents in this batch")

            processed_rows.extend(batch_processed_rows)

        logger.info(f"Processed a total of {len(processed_rows)} rows")
        logger.info(f"Found a total of {total_ai_related_count} AI-related rows")
        logger.info(f"Inserted a total of {total_inserted_count} new rows into ai_documents")

if __name__ == '__main__':
    main()