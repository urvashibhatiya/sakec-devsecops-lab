"use strict";

const request = require("supertest");
const app = require("../src/server");

describe("SafeCampus Emergency System - DevSecOps CI Test Suite", () => {
  let createdIncidentId = "";

  test("GET /health returns 200 OK and UP status with SDG 9 alignment", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.service).toContain("SafeCampus");
    expect(res.body.sdgAlignment).toContain("SDG 9");
  });

  test("POST /api/incidents rejects invalid payload (empty category or short desc)", async () => {
    const res = await request(app)
      .post("/api/incidents")
      .send({
        category: "invalid_category",
        zone: "Main Gate",
        description: "123"
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test("POST /api/incidents creates high priority medical incident with proper triage score", async () => {
    const payload = {
      category: "medical",
      zone: "Hostel B",
      description: "Student fainted in the common corridor, breathing shallow.",
      flags: { life: true, multi: false, ongoing: true },
      anonymous: false,
      reporter: "Student Council Member"
    };

    const res = await request(app).post("/api/incidents").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^INC-\d{3}$/);
    expect(res.body.data.priority).toBe("Critical");
    expect(res.body.data.slaMinutes).toBe(2);
    expect(res.body.data.score).toBeGreaterThanOrEqual(80);

    createdIncidentId = res.body.data.id;
  });

  test("GET /api/incidents lists created incidents", async () => {
    const res = await request(app).get("/api/incidents?showAll=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test("PUT /api/incidents/:id/status requires team assignment before Dispatched status", async () => {
    // 1. Advance to Acknowledged
    const ackRes = await request(app)
      .put(`/api/incidents/${createdIncidentId}/status`)
      .send({ actor: "TestResponder" });
    expect(ackRes.statusCode).toBe(200);
    expect(ackRes.body.data.status).toBe("Acknowledged");

    // 2. Try advancing to Dispatched without team (must fail)
    const failDispatch = await request(app)
      .put(`/api/incidents/${createdIncidentId}/status`)
      .send({ actor: "TestResponder" });
    expect(failDispatch.statusCode).toBe(400);
    expect(failDispatch.body.error).toContain("Must assign a response team");

    // 3. Assign team
    const assignRes = await request(app)
      .put(`/api/incidents/${createdIncidentId}/assign`)
      .send({ team: "Medical", actor: "TestDispatcher" });
    expect(assignRes.statusCode).toBe(200);
    expect(assignRes.body.data.team).toBe("Medical");

    // 4. Now dispatch should succeed
    const passDispatch = await request(app)
      .put(`/api/incidents/${createdIncidentId}/status`)
      .send({ actor: "TestResponder" });
    expect(passDispatch.statusCode).toBe(200);
    expect(passDispatch.body.data.status).toBe("Dispatched");
  });

  test("POST /api/alerts broadcasts emergency alert across campus", async () => {
    const res = await request(app)
      .post("/api/alerts")
      .send({
        level: "warning",
        message: "Severe thunderstorm approaching campus. Stay indoors.",
        actor: "Campus Safety Admin"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.active).toBe(true);
  });

  test("GET /api/audit confirms tamper-evident hash chain integrity", async () => {
    const res = await request(app).get("/api/audit");
    expect(res.statusCode).toBe(200);
    expect(res.body.chainIntact).toBe(true);
    expect(res.body.brokenIndex).toBe(-1);
    expect(res.body.totalEntries).toBeGreaterThan(0);
  });

  test("GET /api/metrics calculates MTTA and SLA breaches accurately", async () => {
    const res = await request(app).get("/api/metrics");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.totalIncidents).toBeGreaterThan(0);
  });
});
