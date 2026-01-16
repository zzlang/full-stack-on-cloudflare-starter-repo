import { sqliteTable, text, real, numeric } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const links = sqliteTable("links", {
  link_id: text("link_id").primaryKey().notNull(),
  account_id: text("account_id").notNull(),
  destinations: text("destinations").notNull(),
  created: numeric("created").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updated: numeric("updated").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  name: text("name").notNull(),
});

export const linkClicks = sqliteTable("link_clicks", {
  id: text("id").notNull(),
  account_id: text("account_id").notNull(),
  country: text("country"),
  destination: text("destination").notNull(),
  clicked_time: numeric("clicked_time").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const destinationEvaluations = sqliteTable("destination_evaluations", {
  id: text("id").primaryKey(),
  link_id: text("link_id").notNull(),
  account_id: text("account_id").notNull(),
  destination_url: text("destination_url").notNull(),
  status: text("status").notNull(),
  reason: text("reason").notNull(),
  created_at: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});
