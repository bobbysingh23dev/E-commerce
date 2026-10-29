import { subject as caslSubject } from "@casl/ability";
import type { AuthUser } from "../types/express";
import { defineAbilityFor, type Action, type AppAbility } from "./ability";
import type { Resource } from "./permissions";

export type Actor = Pick<AuthUser, "userId" | "role">;

// These are fields used to evaluate resource-specific rules, such as the
// `user_id` ownership condition on Order.
export interface Scope {
  readonly user_id?: number;
}

/** Build an ability and ask whether this actor can do this action here. */
export function can(
  actor: Actor,
  action: Action,
  resource: Resource,
  scope: Scope = {},
): boolean {
  return canWith(defineAbilityFor(actor), action, resource, scope);
}

/** Reuse an already-built ability when checking several actions in a request. */
export function canWith(
  ability: AppAbility,
  action: Action,
  resource: Resource,
  scope: Scope = {},
): boolean {
  // CASL's subject() adds its runtime subject tag. The app's typed Order
  // subject uses __typename, so bridge the two representations at this edge.
  const abilitySubject = caslSubject(resource, {
    ...scope,
  }) as unknown as Parameters<AppAbility["can"]>[1];
  return ability.can(action, abilitySubject);
}
