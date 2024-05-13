export interface ICategory {
  id: string;
  title: string;
}

export interface IPost {
  id: string;
  title: string;
  status: "published" | "draft" | "rejected";
  category: string[];
  content: string;
  image: IImage[];
}

export interface IDataResponse {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}


export interface IDocument {
  document_number: string;
  created_at: string;
  llm_summary: string;
  ai_related: number;
  llm_summary_full: string;
  'Last Modified': string;
  abstract: string;
  action: string;
  agency_names: string;
  body_html_url: string;
  comment_url: string;
  comments_close_on: Date;
  dates: string;
  effective_on: Date;
  full_text_xml_url: string;
  html_url: string;
  publication_date: Date;
  raw_text_url: string;
  title: string;
  toc_doc: string;
  type: string;
  regulations_dot_gov_comments_url: string;
  regulations_dot_gov_docket_id: string;
  regulations_dot_gov_document_id: string;
  page_views_count: number;
  tags: string;
}

interface IImage {
  id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  thumbnails: {
    full: IImageThumbnails;
    large: IImageThumbnails;
    small: IImageThumbnails;
  };
}

interface IImageThumbnails {
  height: number;
  url: string;
  width: number;
}
