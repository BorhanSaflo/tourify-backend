import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
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
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$default(() => new Date()),
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
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$default(() => new Date()),

});

export const rating = sqliteTable("rating", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  userId: integer("user_id", { mode: "number" }).notNull().references(() => user.id),
  like: integer("like", { mode: "boolean" }).notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().$default(() => new Date()),

});

export const tag = sqliteTable("tag", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const destinationTag = sqliteTable("destination_tag", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  tagId: integer("tag_id", { mode: "number" }).notNull().references(() => tag.id)
});

export const savedDestination = sqliteTable("saved_destination", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  destinationId: integer("destination_id", { mode: "number" }).notNull().references(() => destination.id),
  userId: integer("user_id", { mode: "number" }).notNull().references(() => user.id),
});