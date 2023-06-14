/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
const bcrypt = require("bcrypt");
const saltRounds = 10;

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async (agent, email, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email,
    password,
    _csrf: csrfToken,
  });
};

describe("Sport Schedular Application", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("Sign up as admin", async () => {
    const firstName = "admin";
    const lastName = "";
    const email = "admin@gmail.com";
    const password = "admin";
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const role = "admin";
    const user = await db.Users.addUser(
      firstName,
      lastName,
      email,
      hashedPwd,
      role
    );
    expect(user.role).toBe("admin");
  });

  test("Sign in and sign out", async () => {
    const agent = request.agent(server);
    await login(agent, "admin@gmail.com", "admin");
    let res = await agent.get("/sports");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/sports");
    expect(res.statusCode).toBe(302);
  });

  test("Create a sport", async () => {
    const agent = request.agent(server);
    await login(agent, "admin@gmail.com", "admin");
    let res = await agent.get("/sport/new");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/sport/new").send({
      sportName: "cricket",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Sign up as user", async () => {
    let res = await agent.get("/signup");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "test 1",
      lastName: "",
      email: "test1@gmail.com",
      password: "test1",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
  });

  test("create a sport session", async () => {
    const agent = request.agent(server);
    await login(agent, "test1@gmail.com", "test1");
    let response = await agent.get("/sports").set("Accept", "application/json");
    const parsedResponse = JSON.parse(response.text);
    const latestSport = parsedResponse.sports[parsedResponse.sports.length - 1];
    const latestSportId = latestSport.id;
    response = await agent.get(`/sport/${latestSportId}/new_session`);
    const csrfToken = extractCsrfToken(response);
    const newSessionResponse = await agent
      .post(`/new_session/${latestSportId}`)
      .send({
        date: new Date(
          new Date().setMonth(new Date().getMonth() + 1)
        ).toISOString(),
        address: "ground",
        joinedPlayers: "",
        reqPlayers: "10",
        _csrf: csrfToken,
      });
    expect(newSessionResponse.statusCode).toBe(302);
  });

  test("join a sport session", async () => {
    const agent = request.agent(server);
    await login(agent, "test1@gmail.com", "test1");
    let sportsResponse = await agent
      .get("/sports")
      .set("Accept", "application/json");
    const parsedSportsResponse = JSON.parse(sportsResponse.text);
    const latestSport =
      parsedSportsResponse.sports[parsedSportsResponse.sports.length - 1];
    const latestSportId = latestSport.id;

    const groupedSessionResponse = await agent
      .get(`/sport/${latestSportId}`)
      .set("Accept", "application/json");
    const parsedGroupedSessionResponse = JSON.parse(
      groupedSessionResponse.text
    );
    const upcomingSessions = parsedGroupedSessionResponse.upcomingSessions;

    const latestSession = upcomingSessions[upcomingSessions.length - 1];
    const latestSessionId = latestSession.id;

    const response = await agent.get(`/sessions/${latestSessionId}`);
    const csrfToken = extractCsrfToken(response);
    const updatSessionResponse = await agent
      .put(`/sessions/${latestSessionId}`)
      .send({
        _csrf: csrfToken,
      });
    expect(updatSessionResponse.statusCode).toBe(200);
  });

  test("leave joined sport session", async () => {
    const agent = request.agent(server);
    const userEmail = "test1@gmail.com";
    await login(agent, userEmail, "test1");
    let sportsResponse = await agent
      .get("/sports")
      .set("Accept", "application/json");
    const parsedSportsResponse = JSON.parse(sportsResponse.text);
    const latestSport =
      parsedSportsResponse.sports[parsedSportsResponse.sports.length - 1];
    const latestSportId = latestSport.id;

    const groupedSessionResponse = await agent
      .get(`/sport/${latestSportId}`)
      .set("Accept", "application/json");
    const parsedGroupedSessionResponse = JSON.parse(
      groupedSessionResponse.text
    );
    const upcomingSessions = parsedGroupedSessionResponse.upcomingSessions;

    const latestSession = upcomingSessions[upcomingSessions.length - 1];
    const latestSessionId = latestSession.id;

    const response = await agent.get(`/sessions/${latestSessionId}`);
    const csrfToken = extractCsrfToken(response);
    const updatSessionResponse = await agent
      .delete(`/sessions/${latestSessionId}&${userEmail}`)
      .send({
        _csrf: csrfToken,
      });
    expect(updatSessionResponse.statusCode).toBe(200);
  });
});
