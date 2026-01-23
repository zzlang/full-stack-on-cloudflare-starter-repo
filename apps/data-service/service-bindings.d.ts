interface Env extends Cloudflare.Env {
  // D1 数据库绑定
  DB: D1Database;
  // KV 命名空间绑定（用于路由缓存）
  ROUTE_CACHE: KVNamespace;
}
