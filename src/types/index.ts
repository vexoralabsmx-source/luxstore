export type UserRole = 'owner' | 'admin' | 'support' | 'customer';

export type ProductStatus = 'active' | 'draft' | 'archived';

export type DeliveryType = 
  | 'code'
  | 'account'
  | 'profile'
  | 'license'
  | 'giftcard'
  | 'download'
  | 'link'
  | 'manual';

export type InventoryStatus = 
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'REPLACED'
  | 'DISABLED'
  | 'EXPIRED';

export type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PAYMENT_REVIEW'
  | 'PAID'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'DISPUTED';

export type PaymentMethod = 'clip' | 'spei' | 'credits';

export type TicketStatus = 
  | 'OPEN'
  | 'WAITING_CUSTOMER'
  | 'WAITING_SUPPORT'
  | 'RESOLVED'
  | 'CLOSED';

export type WalletTxType = 
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'PURCHASE'
  | 'REFUND'
  | 'BONUS'
  | 'ADJUSTMENT'
  | 'HOLD'
  | 'RELEASE';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  is_blocked: boolean;
  two_factor_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  logo_url?: string;
  favicon_url?: string;
  currency: string;
  timezone: string;
  support_email: string;
  maintenance_mode: boolean;
  show_stock: boolean;
  allow_registration: boolean;
  allow_checkout: boolean;
  discord_webhook_url?: string;
  footer_text?: string;
  terms_conditions?: string;
  privacy_policy?: string;
  refund_policy?: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price: number;
  sale_price?: number;
  warranty_days?: number;
  delivery_type?: DeliveryType;
  purchase_limit?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  category_id?: string;
  status: ProductStatus;
  is_featured: boolean;
  base_price: number;
  sale_price?: number;
  cost_price?: number;
  tags?: string[];
  region: string;
  delivery_type: DeliveryType;
  warranty_days: number;
  estimated_delivery_time: string;
  limit_per_customer: number;
  show_stock: boolean;
  pre_purchase_questions?: { question: string; required: boolean }[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: { id: string; image_url: string; sort_order: number }[];
  stock_count?: number;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  content_encrypted: string;
  status: InventoryStatus;
  expiration_date?: string;
  order_id?: string;
  customer_id?: string;
  added_by?: string;
  internal_notes?: string;
  replacement_count: number;
  sold_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_email: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  unique_cents_amount?: number;
  customer_notes?: string;
  pre_purchase_answers?: Record<string, string>;
  ip_address?: string;
  user_agent?: string;
  paid_at?: string;
  delivered_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  deliveries?: Delivery[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Delivery {
  id: string;
  order_id: string;
  order_item_id?: string;
  inventory_item_id: string;
  customer_id?: string;
  product_name?: string;
  delivered_content: string;
  revealed_at?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  customer_id: string;
  order_id?: string;
  subject: string;
  reason: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  customer?: Profile;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  held_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTxType;
  amount: number;
  description: string;
  performed_by?: string;
  order_id?: string;
  created_at: string;
}
