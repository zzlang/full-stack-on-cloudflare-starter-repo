import { initDatabase } from "@repo/data-ops/database";
import { getLink } from "@repo/data-ops/queries/links";

// 路由结果类型
export interface RouteResult {
  destination: string;
  linkId: string;
  cached: boolean;
}

// 缓存 TTL（秒）- 默认 1 小时
const CACHE_TTL_SECONDS = 3600;

/**
 * 任务 3.2：根据位置信息（linkId + country）查找目标路由
 * 从数据库查询 link 的 destinations，并根据 country 选择对应目标
 */
export async function getRouteFromDatabase(
  db: D1Database,
  linkId: string,
  country: string | null
): Promise<RouteResult | null> {
  // 初始化数据库连接
  initDatabase(db);

  // 使用 data-ops 中的查询方法
  const link = await getLink({ linkId });

  if (!link) {
    return null;
  }

  // destinations 格式：{ "default": "https://...", "US": "https://...", "CN": "https://..." }
  const destinations = link.destinations as Record<string, string>;

  // 根据 country 查找目标，如果没有对应国家则使用 default
  const destination = (country && destinations[country]) || destinations.default || Object.values(destinations)[0];

  if (!destination) {
    return null;
  }

  return {
    destination,
    linkId,
    cached: false,
  };
}

/**
 * 任务 4.2 Step A：从 KV 缓存中检查路由
 */
export async function getRouteFromCache(
  kvCache: KVNamespace,
  linkId: string,
  country: string | null
): Promise<RouteResult | null> {
  const cacheKey = buildCacheKey(linkId, country);
  const cachedDestination = await kvCache.get(cacheKey);

  if (cachedDestination) {
    return {
      destination: cachedDestination,
      linkId,
      cached: true,
    };
  }

  return null;
}

/**
 * 任务 4.3：将路由结果写入 KV 缓存
 */
export async function writeRouteToCache(
  kvCache: KVNamespace,
  linkId: string,
  country: string | null,
  destination: string,
  ttlSeconds: number = CACHE_TTL_SECONDS
): Promise<void> {
  const cacheKey = buildCacheKey(linkId, country);
  await kvCache.put(cacheKey, destination, {
    expirationTtl: ttlSeconds,
  });
}

/**
 * 构建缓存 key
 */
function buildCacheKey(linkId: string, country: string | null): string {
  return `route:${linkId}:${country || "default"}`;
}

/**
 * 任务 4.2：完整的路由解析逻辑（KV 缓存优先）
 * Step A：优先检查 KV 缓存
 * Step B：若缓存命中，直接返回
 * Step C：若缓存未命中，回源数据库查询
 * 任务 4.3：查询成功后回写缓存
 */
export async function resolveRoute(
  db: D1Database,
  kvCache: KVNamespace,
  linkId: string,
  country: string | null
): Promise<RouteResult | null> {
  // Step A & B：优先检查 KV 缓存
  const cachedRoute = await getRouteFromCache(kvCache, linkId, country);
  if (cachedRoute) {
    return cachedRoute; // 缓存命中，直接返回
  }

  // Step C：缓存未命中，回源数据库查询
  const dbRoute = await getRouteFromDatabase(db, linkId, country);
  if (dbRoute) {
    // 任务 4.3：回写缓存
    await writeRouteToCache(kvCache, linkId, country, dbRoute.destination);
  }

  return dbRoute;
}
