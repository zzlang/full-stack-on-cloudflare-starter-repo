import { relations } from "drizzle-orm";
import { links, linkClicks, destinationEvaluations } from "./schema";

export const linksRelations = relations(links, ({ many }) => ({
  clicks: many(linkClicks),
  evaluations: many(destinationEvaluations),
}));

export const linkClicksRelations = relations(linkClicks, ({ one }) => ({
  link: one(links, {
    fields: [linkClicks.id],
    references: [links.link_id],
  }),
}));

export const destinationEvaluationsRelations = relations(destinationEvaluations, ({ one }) => ({
  link: one(links, {
    fields: [destinationEvaluations.link_id],
    references: [links.link_id],
  }),
}));
