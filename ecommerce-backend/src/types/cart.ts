export interface Cart {
  id: number;
  user_id: number;
}

// One line as GET /cart returns it (joined to products for the LIVE price).
export interface CartItemView {
  id: number;
  product_id: number;
  product_name: string;
  price: string; // NUMERIC → comes back as a string
  quantity: number;
  line_total: string; // price * quantity, also a string
}
