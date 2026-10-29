// Actions describe what an actor may do to a resource.
export const ACTIONS = [
  "manage",
  "create",
  "read",
  "update",
  "delete",
] as const;

export type Action = (typeof ACTIONS)[number];

// Resource names are the subjects used in route permission checks.
// `all` is CASL's wildcard subject, so it is intentionally not a resource.
export const RESOURCES = [
  "Product",
  "Category",
  "Order",
  "Cart",
  "PaymentIntent",
  "SupportDashboard",
  "Inventory",
  "Report",
  "ContentDashboard",
  "User",
] as const;

export type Resource = (typeof RESOURCES)[number];
