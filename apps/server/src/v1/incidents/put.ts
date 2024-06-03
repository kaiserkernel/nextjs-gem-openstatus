import { createRoute, z } from "@hono/zod-openapi";

import { and, db, eq } from "@openstatus/db";
import { incidentTable } from "@openstatus/db/src/schema/incidents";

import { IncidentSchema, ParamsSchema } from "./schema";
import { openApiErrorResponses } from "../../libs/errors/openapi-error-responses";
import type { incidentsApi } from "./index";
import { HTTPException } from "hono/http-exception";

const putRoute = createRoute({
  method: "put",
  tags: ["incident"],
  description: "Update an incident",
  path: "/:id",
  request: {
    params: ParamsSchema,
    body: {
      description: "The incident to update",
      content: {
        "application/json": {
          schema: IncidentSchema.pick({
            acknowledgedAt: true,
            resolvedAt: true,
          })
            .extend({
              acknowledgedAt: z.coerce.date().optional(),
              resolvedAt: z.coerce.date().optional(),
            })
            .openapi({
              description: "The incident to update",
            }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IncidentSchema,
        },
      },
      description: "Update a monitor",
    },
    ...openApiErrorResponses,
  },
});

export function registerPutIncident(app: typeof incidentsApi) {
  return app.openapi(putRoute, async (c) => {
    const inputValues = c.req.valid("json");
    const workspaceId = c.get("workspaceId");
    const { id } = c.req.valid("param");

    const _incident = await db
      .select()
      .from(incidentTable)
      .where(
        and(
          eq(incidentTable.id, Number(id)),
          eq(incidentTable.workspaceId, Number(workspaceId))
        )
      )
      .get();

    if (!_incident) {
      throw new HTTPException(404, { message: "Not Found" });
    }

    if (Number(workspaceId) !== _incident.workspaceId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const _newIncident = await db
      .update(incidentTable)
      .set({ ...inputValues })
      .where(eq(incidentTable.id, Number(id)))
      .returning()
      .get();

    const data = IncidentSchema.parse(_newIncident);

    return c.json(data);
  });
}
