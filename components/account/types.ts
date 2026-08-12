export type AccountAddress = {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  line1?: string;
  address_line1?: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
};

export type AccountOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
};

export type AccountOrder = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  items: AccountOrderItem[];
};

export type AccountNotification = {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at?: string;
};
