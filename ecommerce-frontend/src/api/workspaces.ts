import { apiFetch } from "./client";
import type { OrderStatus, OrderSummary, ReportSummary, StaffOrder } from "../types";

export interface SupportWorkspace {
  summary: {
    total_orders: number;
    pending_orders: number;
    paid_orders: number;
    completed_orders: number;
    cancelled_orders: number;
  };
  recentOrders: StaffOrder[];
}

export interface InventoryProduct {
  id: number;
  name: string;
  stock_quantity: number;
  version: number;
  category_name: string | null;
}

export interface InventoryWorkspace {
  summary: {
    product_count: number;
    total_units: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  attentionProducts: InventoryProduct[];
}

export interface ContentWorkspace {
  product_count: number;
  category_count: number;
  missing_descriptions: number;
  missing_images: number;
}

export function getSupportWorkspace(): Promise<SupportWorkspace> {
  return apiFetch<SupportWorkspace>("/workspaces/support");
}

export function getInventoryWorkspace(): Promise<InventoryWorkspace> {
  return apiFetch<InventoryWorkspace>("/workspaces/inventory");
}

export function updateInventoryStock(
  id: number,
  stock_quantity: number,
  version: number,
): Promise<InventoryProduct> {
  return apiFetch<InventoryProduct>(`/workspaces/inventory/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stock_quantity, version }),
  });
}

export function getOrderManagementWorkspace(): Promise<StaffOrder[]> {
  return apiFetch<StaffOrder[]>("/workspaces/orders");
}

export function updateManagedOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderSummary> {
  return apiFetch<OrderSummary>(`/workspaces/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getFinanceWorkspace(): Promise<ReportSummary> {
  return apiFetch<ReportSummary>("/workspaces/finance");
}

export function getContentWorkspace(): Promise<ContentWorkspace> {
  return apiFetch<ContentWorkspace>("/workspaces/content");
}
