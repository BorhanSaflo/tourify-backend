import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const destination = sqliteTable("destination", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  country: text("country").notNull(),
  description: text("description"),
  googlePlaceId: text("google_place_id"),
});

export const review = sqliteTable("review", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  userId: integer("user_id", { mode: "number" }).notNull().references(() => user.id),
  comment: text("comment"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(sql`CURRENT_DATE`),
});

export const favorite = sqliteTable("favorite", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  userId: integer("user_id", { mode: "number" }).notNull().references(() => user.id),
});

export const view = sqliteTable("view", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  userId: integer("user_id", { mode: "number" }).notNull().references(() => user.id),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(sql`CURRENT_DATE`),
});

export const rating = sqliteTable("rating", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  userId: integer("user_id", { mode: "number" }).notNull().references(() => user.id),
  like: integer("like", { mode: "boolean" }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(sql`CURRENT_DATE`),
});