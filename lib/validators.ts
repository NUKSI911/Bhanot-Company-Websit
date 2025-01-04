import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

export const currency = z
  .string()
  .refine((val) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(val))));

export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(255),
  category: z.string().min(3,"Category must be at least 3 characters").max(255),
  brand: z.string().min(3,"Brand must be at least 3 characters").max(255),
  description: z.string().min(3,"Description must be at least 3 characters").max(255),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  price: currency,
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
});