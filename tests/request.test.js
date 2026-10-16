const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const Task = require("../src/models/Task");
const config = require("../src/config/env");

const accessToken = jwt.sign(
  { id: new mongoose.Types.ObjectId().toString(), role: "admin" },
  config.jwt.accessTokenSecret,
  { expiresIn: "15m" }
);

describe("POST /api/tasks", () => {
  afterEach(async () => {
    await Task.deleteMany({});
  });

  test("should create a task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Learn Jest",
        description: "Testing Node.js APIs",
        priority: "MEDIUM",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("Success");
    expect(response.body.data.title).toBe("Learn Jest");
  });

  test("should reject unauthenticated request", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Learn Jest",
      });

    expect(response.status).toBe(401);
  });
});
