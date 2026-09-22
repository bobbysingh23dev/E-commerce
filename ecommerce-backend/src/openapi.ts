import path from "path";
import YAML from "yamljs";
import { z } from "zod";
import { addCartItemSchema, quantitySchema } from "./schemas/cart";

/**
 * The OpenAPI document served at /docs.
 *
 * We start from the hand-written openapi.yaml (still the source for resources
 * not yet migrated to Zod), then GENERATE the cart input schemas from the very
 * same Zod schemas the validation middleware uses. Change a Zod schema and this
 * document — and the /docs page — update themselves. One source, so no drift.
 */
const document = YAML.load(path.join(process.cwd(), "openapi.yaml"));

document.components.schemas.AddCartItemInput = z.toJSONSchema(
  addCartItemSchema,
  {
    target: "openapi-3.0",
  },
);
document.components.schemas.QuantityInput = z.toJSONSchema(quantitySchema, {
  target: "openapi-3.0",
});

export const openapiDocument = document;
