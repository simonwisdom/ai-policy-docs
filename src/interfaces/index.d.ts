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
  abstract: string;
  action: string;
  agencies: string; // If agencies is an array of strings, use string[]
  agency_names: string; // Similarly, use string[] if this is an array
  body_html_url: string;
  // ... include other document fields here as properties of the interface
  // Ensure the types match what you expect (e.g., string, number, boolean, string[], etc.)
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
