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
  id: string;  // assuming an 'id' is used as the unique identifier and row key
  type: string;
  publication_date: string;
  document_number: string;
  agency_names: string;
  llm_summary: string;
  llm_summary_full: string;
  dates: string;  // Assuming dates are represented as a string
  docket_id: string;
  page_views: number;  // Assuming page views are stored as a number
  html_url: string;
  comment_url: string;
  comments_close_on: string;
  comments_count: number;  // Assuming comments count is a number
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
