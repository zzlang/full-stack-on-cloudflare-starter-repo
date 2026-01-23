import { Hono } from "hono";
import {
  getDestinationForCountry,
  getLinkInfoFromKV,
} from "@/helpers/routing-ops";
import { cloudflareInfoSchema } from "@repo/data-ops/zod-schema/links";

// 定义 Hono app，绑定 Cloudflare Env 类型
export const app = new Hono<{ Bindings: Env }>();

// 地理位置信息端点
app.get("/geo", (c) => {
  const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);

  if (!cfHeader.success) {
    return c.text("Invalid Cloudflare headers", 400);
  }

  const headers = cfHeader.data;

  return c.json({
    country: headers.country ?? null,
    lat: headers.latitude ?? null,
    long: headers.longitude ?? null,
  });
});

// 主路由端点：根据 linkId 和地理位置进行重定向
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  // 从 KV 缓存获取链接信息（缓存未命中时回源数据库）
  const linkInfo = await getLinkInfoFromKV(
    c.env.ROUTE_CACHE,
    c.env.DB,
    id
  );

  if (!linkInfo) {
    return c.text("Destination not found", 404);
  }

  // 使用 Zod schema 解析 Cloudflare 头信息
  const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
  if (!cfHeader.success) {
    return c.text("Invalid Cloudflare headers", 400);
  }

  const headers = cfHeader.data;
  console.log("CF Headers:", headers);

  // 根据国家获取目标 URL
  const destination = getDestinationForCountry(linkInfo, headers.country);

  // 执行重定向
  return c.redirect(destination);
});
