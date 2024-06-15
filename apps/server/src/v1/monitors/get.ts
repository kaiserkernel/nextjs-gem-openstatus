import { createRoute, z } from "@hono/zod-openapi";

import { and, db, eq, isNull } from "@openstatus/db";
import { monitor } from "@openstatus/db/src/schema";

import { HTTPException } from "hono/http-exception";
import { openApiErrorResponses } from "../../libs/errors/openapi-error-responses";
import type { monitorsApi } from "./index";
import { MonitorSchema, ParamsSchema } from "./schema";

const getRoute = createRoute({
  method: "get",
  tags: ["monitor"],
  description: "Get a monitor",
  path: "/:id",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MonitorSchema,
        },
      },
      description: "The monitor",
    },
    ...openApiErrorResponses,
  },
});

export function registerGetMonitor(api: typeof monitorsApi) {
  return api.openapi(getRoute, async (c) => {
    const workspaceId = c.get("workspaceId");
    const { id } = c.req.valid("param");

    const _monitor = await db
      .select()
      .from(monitor)
      .where(
        and(
          eq(monitor.id, Number(id)),
          eq(monitor.workspaceId, Number(workspaceId)),
          isNull(monitor.deletedAt)
        )
      )
      .get();

    if (!_monitor) {
      throw new HTTPException(404, { message: "Not Found" });
    }

    const data = MonitorSchema.parse(_monitor);

    return c.json(data, 200);
  });
}
