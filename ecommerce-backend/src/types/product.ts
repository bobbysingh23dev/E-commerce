// The shape of a product row as it exists in the database.
// Shared across layers (model, service) so they all agree on the structure.
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity?: number | null;
  category_id?: number | null;
}
