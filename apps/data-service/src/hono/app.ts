import { Hono } from "hono";
import { resolveRoute } from "../services/geo-routing";

// 定义 Hono app，绑定 Cloudflare Env 类型
export const app = new Hono<{ Bindings: Env }>();

// 地理位置信息端点
app.get("/geo", (c) => {
  // 任务 1.1：声明常量 cf 直接引用 request.cf
  const cf = c.req.raw.cf;

  // 任务 1.2：从 cf 对象中提取 latitude 和 longitude
  const latitude = cf?.latitude ?? null;
  const longitude = cf?.longitude ?? null;
  const country = cf?.country ?? null;

  // 任务 1.3：返回包含 country、lat 和 long 的 JSON 响应
  return c.json({
    country,
    lat: latitude,
    long: longitude,
  });
});

// 任务 3.3：条件路由端点 - 根据 linkId 和地理位置进行重定向
app.get("/r/:id", async (c) => {
  const linkId = c.req.param("id");

  // 获取 CF 元数据中的国家信息
  const cf = c.req.raw.cf;
  const country = (cf?.country as string) ?? null;

  // 任务 4.2：KV 缓存优先的路由解析
  const route = await resolveRoute(
    c.env.DB,
    c.env.ROUTE_CACHE,
    linkId,
    country
  );

  if (!route) {
    return c.json({ error: "Link not found" }, 404);
  }

  // 任务 3.3：执行重定向
  return c.redirect(route.destination, 302);
});

// 调试端点：查看路由解析结果（不执行重定向）
app.get("/debug/:id", async (c) => {
  const linkId = c.req.param("id");

  // 获取 CF 元数据
  const cf = c.req.raw.cf;
  const country = (cf?.country as string) ?? null;
  const latitude = cf?.latitude ?? null;
  const longitude = cf?.longitude ?? null;

  // 解析路由
  const route = await resolveRoute(
    c.env.DB,
    c.env.ROUTE_CACHE,
    linkId,
    country
  );

  return c.json({
    linkId,
    country,
    lat: latitude,
    long: longitude,
    route: route
      ? {
          destination: route.destination,
          cached: route.cached,
        }
      : null,
  });
});

// 动态路由：/:id（保留原有逻辑）
app.get("/:id", (c) => {
  const id = c.req.param("id");
  const userAgent = c.req.header("User-Agent") || "unknown";

  // 获取 CF 元数据
  const cf = c.req.raw.cf;
  const latitude = cf?.latitude ?? null;
  const longitude = cf?.longitude ?? null;
  const country = cf?.country ?? null;

  return c.json({
    id,
    userAgent,
    country,
    lat: latitude,
    long: longitude,
    message: `You requested link: ${id}`,
  });
});
