import { pgTable, varchar, integer, serial } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

export const cartColumns = pgTable("cartdata", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id").notNull(),
  product_id: varchar("product_id").notNull(),
  product_title: varchar("product_title").notNull(),
  product_price: varchar("product_price").notNull(),
  product_quantity: varchar("product_quantity").notNull(),
  product_category: varchar("product_category").notNull(),
  image_url: varchar("image_url").notNull(),
});

export const db = drizzle(sql);
