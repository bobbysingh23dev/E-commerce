import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import type { AuthUser } from "../types/express";
import type { Action, Resource } from "./permissions";

export type { Action, Resource } from "./permissions";

// A tagged subject gives CASL TypeScript the real fields it can condition on.
// Without this shape, the "Order" string alone has no known `user_id` field.
type OrderSubject = {
  __typename: "Order";
  user_id: number;
};

export type Subject = "all" | Resource | OrderSubject;

export type AppAbility = MongoAbility<[Action, Subject]>;

export function defineAbilityFor(user: Pick<AuthUser, "userId" | "role">) {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (user.role) {
    case "admin":
      can("manage", "all");
      break;

    case "support":
      can("read", "SupportDashboard");
      can("read", "Order");
      break;

    case "inventory_manager":
      can("read", "Inventory");
      can("update", "Inventory");
      break;

    case "order_manager":
      can("read", "Order");
      can("update", "Order");
      break;

    case "finance":
      can("read", "Report");
      break;

    case "content_editor":
      can("read", "ContentDashboard");
      can(["create", "read", "update"], "Product");
      can(["create", "read", "update", "delete"], "Category");
      break;

    case "customer":
      can("read", ["Product", "Category"]);
      can("create", "Order");
      can("read", "Order", { user_id: user.userId });
      can("update", "Order", { user_id: user.userId });
      can("manage", "Cart");
      can("create", "PaymentIntent");
      break;
  }

  return build();
}
