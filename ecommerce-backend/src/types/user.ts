export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: "customer" | "admin";
  created_at?: Date;
  updated_at?: Date;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}
