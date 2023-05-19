const express = require("express");
const app = express();
const path = require("path");
const { Sports } = require("./models");
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/admin", (request, response) => {
  return response.render("admin");
});

app.get("/sports/new", (request, response) => {
  return response.render("sport");
});

app.post("/sports", async (request, response) => {
  console.log(request.body.sportName);
  try {
    await Sports.addSport(request.body.sportName);
  } catch (err) {
    console.error(err);
  }
  response.redirect("/sports/new");
});

module.exports = app;
