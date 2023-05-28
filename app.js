const express = require("express");
const app = express();
const path = require("path");
const { Sports, Users, Sessions } = require("./models");
var bodyParser = require("body-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStratergy = require("passport-local");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "my-super-secret-key-23458730948391274",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStratergy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Users.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          console.log(error);
          return done(null, false, { message: "Invalid email" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    res.redirect("/login");
  }
}

app.get("/", async (request, response) => {
  return response.render("index");
});

app.get(
  "/sports",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const sports = await Sports.getAllSports();
      return response.render("sports", {
        sports: sports,
        user: request.user,
      });
    } catch (err) {
      console.error(err);
    }
  }
);

app.get("/signup", (request, response) => {
  response.render("signup");
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  async (request, response) => {
    response.redirect("/sports");
  }
);

app.post("/users", async (request, response) => {
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const email = request.body.email;
  // const password = request.body.password;
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const user = await Users.addUser(firstName, lastName, email, hashedPwd);
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/sports");
    });
  } catch (err) {
    console.log(err);
  }
});

app.get(
  "/sports/new",
  // connectEnsureLogin.ensureLoggedIn(),
  requireAdmin,
  (request, response) => {
    return response.render("new_sport");
  }
);

app.post("/sports", async (request, response) => {
  console.log(request.body.sportName);
  try {
    await Sports.addSport(request.body.sportName);
  } catch (err) {
    console.error(err);
  }
  response.redirect("/sports/new");
});

app.get(
  "/sport/:id",
  // connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const sport = await Sports.getSport(request.params.id);
      const sessions = await Sessions.getSportSessions(request.params.id);
      response.render("sport", { sport, sessions });
    } catch (err) {
      console.error(err);
    }
  }
);

app.get(
  "/sport/:id/new_session",
  // connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const sport = await Sports.getSport(request.params.id);
      response.render("new_session", { sport });
    } catch (err) {
      console.error(err);
    }
  }
);

app.post(
  "/new_session/:id",
  // connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const date = request.body.date;
    const address = request.body.address;
    const players_name = request.body.playersName;
    const req_players = request.body.nPlayers;
    const organiser = request.user.email;
    const sportId = request.params.id;
    try {
      const session = await Sessions.addSession(
        date,
        address,
        players_name,
        req_players,
        organiser,
        sportId
      );
      response.redirect(`/sessions/${session.id}`);
    } catch (err) {
      console.error(err);
    }
  }
);

app.get("/sessions/:id", async (request, response) => {
  try {
    const session = await Sessions.getSession(request.params.id);
    const sport = await Sports.getSport(session.sportId);
    response.render("sessions", { sport, session });
  } catch (err) {
    console.error(err);
  }
});

module.exports = app;
