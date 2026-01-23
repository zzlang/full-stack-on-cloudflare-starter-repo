import { Hono } from "hono";

// 定义 Hono app，绑定 Cloudflare Env 类型
export const app = new Hono<{ Bindings: Env }>();

// 动态路由：/:id
app.get("/:id", (c) => {
  const id = c.req.param("id");
  const userAgent = c.req.header("User-Agent") || "unknown";

  return c.json({
    id,
    userAgent,
    message: `You requested link: ${id}`,
  });
});
