import { expect, test } from "bun:test";

import { api } from "../index";

test("GET one status report", async () => {
  const res = await api.request("/status_report/1", {
    headers: {
      "x-openstatus-key": "1",
    },
  });
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({
    id: 1,
    title: "Test Status Report",
    status: "monitoring",
    statusReportUpdateIds: expect.arrayContaining([1, 3]), // depending on the order of the updates
    monitorIds: null,
    pageIds: [1],
  });
});

test("Get all status report", async () => {
  const res = await api.request("/status_report", {
    headers: {
      "x-openstatus-key": "1",
    },
  });
  expect(res.status).toBe(200);
  expect({ data: await res.json() }).toMatchObject({
    data: [
      {
        id: 1,
        title: "Test Status Report",
        status: "monitoring",
        statusReportUpdateIds: expect.arrayContaining([1, 3]), // depending on the order of the updates
        monitorIds: [],
        pageIds: [1],
      },
      {
        id: 2,
        title: "Test Status Report",
        status: "investigating",
        statusReportUpdateIds: expect.arrayContaining([2]), // depending on the order of the updates
        monitorIds: [1, 2],
        pageIds: [1],
      },
    ],
  });
});

test("Create one status report including passing optional fields", async () => {
  const res = await api.request("/status_report", {
    method: "POST",
    headers: {
      "x-openstatus-key": "1",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      status: "investigating",
      title: "New Status Report",
      message: "Message",
      monitorIds: [1],
      pageIds: [1],
    }),
  });
  const json = await res.json();

  expect(res.status).toBe(200);

  expect(json).toMatchObject({
    id: expect.any(Number),
    title: "New Status Report",
    status: "investigating",
    statusReportUpdateIds: [expect.any(Number)],
    monitorIds: [1],
    pageIds: [1],
  });
});

test("Create one status report without auth key should return 401", async () => {
  const res = await api.request("/status_report", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      status: "investigating",
      title: "Test Status Report",
    }),
  });
  expect(res.status).toBe(401); //unauthenticated
});

test("Create one status report with invalid data should return 403", async () => {
  const res = await api.request("/status_report", {
    method: "POST",
    headers: {
      "x-openstatus-key": "1",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      //passing incompelete body
      title: "Test Status Report",
    }),
  });
  expect(res.status).toBe(400);
});

test("Create status report with non existing monitor ids should return 400", async () => {
  const res = await api.request("/status_report", {
    method: "POST",
    headers: {
      "x-openstatus-key": "1",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      status: "investigating",
      title: "New Status Report",
      message: "Message",
      monitorIds: [100],
      pageIds: [1],
    }),
  });

  expect(res.status).toBe(400);
});

test("Create status report with non existing page ids should return 400", async () => {
  const res = await api.request("/status_report", {
    method: "POST",
    headers: {
      "x-openstatus-key": "1",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      status: "investigating",
      title: "New Status Report",
      message: "Message",
      monitorIds: [1],
      pageIds: [100],
    }),
  });

  expect(res.status).toBe(400);
});

test("Delete a status report", async () => {
  const res = await api.request("/status_report/3", {
    method: "DELETE",
    headers: {
      "x-openstatus-key": "1",
    },
  });
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({});
});
