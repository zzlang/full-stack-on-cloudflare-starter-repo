import type { LinkSchemaType } from "@repo/data-ops/zod-schema/links";
import { initDatabase } from "@repo/data-ops/database";
import { getLink } from "@repo/data-ops/queries/links";

// 缓存 key 前缀
const CACHE_KEY_PREFIX = "link:";

/**
 * 根据国家代码获取目标 URL
 * @param linkInfo - 链接信息对象
 * @param countryCode - 可选的国家代码（如 "US", "CN", "MY"）
 * @returns 目标 URL
 */
export function getDestinationForCountry(
  linkInfo: LinkSchemaType,
  countryCode?: string
): string {
  // 如果没有提供国家代码，返回默认目的地
  if (!countryCode) {
    return linkInfo.destinations.default;
  }

  // 检查国家代码是否存在于 destinations 中
  if (linkInfo.destinations[countryCode]) {
    return linkInfo.destinations[countryCode];
  }

  // 回退到默认目的地
  return linkInfo.destinations.default;
}

/**
 * 从 KV 缓存获取链接信息，如果缓存未命中则回源数据库
 * @param cache - KV 命名空间
 * @param db - D1 数据库
 * @param linkId - 链接 ID
 * @returns 链接信息或 null
 */
export async function getLinkInfoFromKV(
  cache: KVNamespace,
  db: D1Database,
  linkId: string
): Promise<LinkSchemaType | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}${linkId}`;

  // 步骤 1：检查 KV 缓存
  const cachedData = await cache.get(cacheKey, "json");

  if (cachedData) {
    // 缓存命中，直接返回
    console.log(`Cache HIT for ${linkId}`);
    return cachedData as LinkSchemaType;
  }

  // 步骤 2：缓存未命中，回源数据库
  console.log(`Cache MISS for ${linkId}, fetching from DB`);
  initDatabase(db);
  const linkInfo = await getLink({ linkId });

  if (!linkInfo) {
    return null;
  }

  // 步骤 3：将数据存储到 KV 缓存
  // 注意：KV 使用最终一致性，适合不频繁更新的数据
  await cache.put(cacheKey, JSON.stringify(linkInfo), {
    expirationTtl: 3600, // 1 小时过期
  });

  console.log(`Cached ${linkId} to KV`);
  return linkInfo;
}
