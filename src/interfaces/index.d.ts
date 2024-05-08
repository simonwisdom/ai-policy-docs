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

export interface IDocument {
  id: string;
  type: string;
  publication_date: string;
  document_number: string;
  agency_names: string;
  llm_summary: string;
  llm_summary_full: string;
  dates: string;
  docket_id: string;
  page_views: number;
  html_url: string;
  comment_url: string;
  comments_close_on: string;
  comments_count: number;
  abstract: string;
  regulations_dot_gov_comments_url: string;
  effective_on: string;
  tags: string[];
  title: string;
  page_views_count: number; 
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
