import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const destination = sqliteTable("destination", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description"),
});
