// --- API Response Structures ---

export interface Product {
  name: string;
  brand: string;
  description: string;
  priceRange: string;
  pros: string[];
  cons: string[];
  highlight: string;
  storeLink: string[];
}

export interface Category {
  categoryTitle: string;
  products: Product[];
}

// This is the main object returned by our backend
export interface ApiResponse {
  categories: Category[];
  // We can add more data from the DB if needed
  id?: string;
  prompt_text?: string;
  created_at?: string;
}

// --- Other Client-Side Types ---

export interface HistoryItem {
  id: string; // recommendation_set_id
  prompt_text: string;
  created_at: string;
}

export type AppPage = "home" | "results" | "history";