import { eq, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { links, linkClicks, destinationEvaluations } from "../drizzle-out/schema";
import { nanoid } from "nanoid";
import type { DestinationsSchemaType } from "../zod/links";

/**
 * Create a new link
 */
export async function createLink(params: {
  accountId: string;
  name: string;
  destinations: DestinationsSchemaType;
}) {
  const db = getDb();
  const linkId = nanoid(10);

  await db.insert(links).values({
    linkId,
    accountId: params.accountId,
    name: params.name,
    destinations: JSON.stringify(params.destinations),
  });

  return linkId;
}

/**
 * Get links by account ID
 */
export async function getLinks(params: {
  accountId: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const limit = params.limit ?? 25;
  const offset = params.offset ?? 0;

  const result = await db
    .select({
      linkId: links.linkId,
      name: links.name,
      destinations: links.destinations,
      created: links.created,
      updated: links.updated,
    })
    .from(links)
    .where(eq(links.accountId, params.accountId))
    .orderBy(desc(links.created))
    .limit(limit)
    .offset(offset);

  return result.map((row) => ({
    ...row,
    destinations: JSON.parse(row.destinations) as DestinationsSchemaType,
  }));
}

/**
 * Get a single link by ID
 */
export async function getLink(params: { linkId: string }) {
  const db = getDb();

  const result = await db
    .select()
    .from(links)
    .where(eq(links.linkId, params.linkId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return {
    ...row,
    destinations: JSON.parse(row.destinations) as DestinationsSchemaType,
  };
}

/**
 * Update link name
 */
export async function updateLinkName(params: {
  linkId: string;
  name: string;
}) {
  const db = getDb();

  await db
    .update(links)
    .set({ name: params.name, updated: new Date().toISOString() })
    .where(eq(links.linkId, params.linkId));
}

/**
 * Update link destinations
 */
export async function updateLinkDestinations(params: {
  linkId: string;
  destinations: DestinationsSchemaType;
}) {
  const db = getDb();

  await db
    .update(links)
    .set({
      destinations: JSON.stringify(params.destinations),
      updated: new Date().toISOString(),
    })
    .where(eq(links.linkId, params.linkId));
}

/**
 * Delete a link
 */
export async function deleteLink(params: { linkId: string }) {
  const db = getDb();

  // Delete related records first
  await db.delete(linkClicks).where(eq(linkClicks.id, params.linkId));
  await db.delete(destinationEvaluations).where(eq(destinationEvaluations.linkId, params.linkId));

  // Delete the link
  await db.delete(links).where(eq(links.linkId, params.linkId));
}
