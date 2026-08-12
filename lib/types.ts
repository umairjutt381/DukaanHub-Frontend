export type ApiList<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_featured: boolean;
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  is_featured: boolean;
};

export type ProductImage = {
  id: number;
  url: string;
  is_primary: boolean;
  sort_order: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  specifications?: string | null;
  tags?: string | null;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_deal: boolean;
  is_active: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  images: ProductImage[];
  category?: Category | null;
  brand?: Brand | null;
};

export type Order = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  shipping_charges: number;
  discount_amount: number;
  total_amount: number;
  items?: Array<{ id: number; product_name: string; quantity: number; unit_price: number }>;
};
