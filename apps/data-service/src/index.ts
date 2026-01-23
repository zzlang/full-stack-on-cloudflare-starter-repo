import { WorkerEntrypoint } from "cloudflare:workers";
import { app } from "./hono/app";

export default class DataService extends WorkerEntrypoint<Env> {
  fetch(request: Request) {
    // 将请求透传给 Hono app 处理
    return app.fetch(request, this.env, this.ctx);
  }
}
