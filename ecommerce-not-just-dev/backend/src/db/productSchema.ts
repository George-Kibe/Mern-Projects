import {
    integer,
    pgTable,
    varchar,
    text,
    doublePrecision,
  } from 'drizzle-orm/pg-core';
  import { createInsertSchema } from 'drizzle-zod';
  
  export const productsTable = pgTable('products', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    image: varchar({ length: 255 }),
    price: doublePrecision().notNull(),
  });
  // disbale ability to add id since its generated automatically
  export const createProductSchema = createInsertSchema(productsTable).omit({
    id: true,
  });
  
  // diable ability to edit id
  export const updateProductSchema = createInsertSchema(productsTable)
    .omit({
      id: true,
    })
    .partial();