import { OpenAPIHono } from "@hono/zod-openapi";

import { incidentApi } from "./incident";
import { middleware } from "./middleware";
import { monitorApi } from "./monitor";
import { VercelIngest } from "./vercel";

export type Variables = {
  workspaceId: string;
};

/**
 * Base Path "/v1" for our api
 */
const app = new OpenAPIHono<{ Variables: Variables }>();
app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "OpenStatus API",
  },
});
app.get("/ping", (c) => c.text("pong"));

// Where we ingest data from Vercel
app.post("/integration/vercel", VercelIngest);
/**
 * Authentification Middleware
 */

app.use("/v1/*", middleware);
app.route("/v1/monitor", monitorApi);
app.route("/v1/incident", incidentApi);

if (process.env.NODE_ENV === "development") {
  app.showRoutes();
}
console.log("Starting server on port 3000");

export default app;
