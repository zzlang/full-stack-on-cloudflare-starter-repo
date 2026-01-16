import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  createLinkSchema,
  destinationsSchema,
} from "@repo/data-ops/zod-schema/links";
import {
  createLink,
  getLinks,
  getLink,
  updateLinkName,
  updateLinkDestinations,
  deleteLink,
} from "@repo/data-ops/queries/links";

import { TRPCError } from "@trpc/server";
import {
  ACTIVE_LINKS_LAST_HOUR,
  LAST_30_DAYS_BY_COUNTRY,
} from "./dummy-data";

export const linksTrpcRoutes = t.router({
  linkList: t.procedure
    .input(
      z.object({
        offset: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const links = await getLinks({
        accountId: ctx.userInfo.userId,
        offset: input.offset,
        limit: 25,
      });
      return links;
    }),
  createLink: t.procedure.input(createLinkSchema).mutation(async ({ ctx, input }) => {
    const linkId = await createLink({
      accountId: ctx.userInfo.userId,
      name: input.name,
      destinations: input.destinations,
    });
    return linkId;
  }),
  updateLinkName: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        name: z.string().min(1).max(300),
      }),
    )
    .mutation(async ({ input }) => {
      await updateLinkName({
        linkId: input.linkId,
        name: input.name,
      });
    }),
  getLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const link = await getLink({ linkId: input.linkId });
      if (!link) throw new TRPCError({ code: "NOT_FOUND" });
      return link;
    }),
  updateLinkDestinations: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        destinations: destinationsSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await updateLinkDestinations({
        linkId: input.linkId,
        destinations: input.destinations,
      });
    }),
  deleteLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await deleteLink({ linkId: input.linkId });
    }),
  activeLinks: t.procedure.query(async () => {
    return ACTIVE_LINKS_LAST_HOUR;
  }),
  totalLinkClickLastHour: t.procedure.query(async () => {
    return 13;
  }),
  last24HourClicks: t.procedure.query(async () => {
    return {
      last24Hours: 56,
      previous24Hours: 532,
      percentChange: 12,
    };
  }),
  last30DaysClicks: t.procedure.query(async () => {
    return 78;
  }),
  clicksByCountry: t.procedure.query(async () => {
    return LAST_30_DAYS_BY_COUNTRY;
  }),
});
