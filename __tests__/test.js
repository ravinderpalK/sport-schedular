/* eslint-disable no-undef */
const request = require("supertest");
// const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

describe("Sport Schedular Application", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Sign up", () => {});
});
