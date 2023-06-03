const express = require("express");
const app = express();
const path = require("path");
const { Sports, Users, Sessions } = require("./models");
var bodyParser = require("body-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStratergy = require("passport-local");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

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
  if (request.isAuthenticated()) {
    return response.redirect("/sports");
  }
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
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
        csrfToken: request.csrfToken(),
      });
    } catch (err) {
      console.error(err);
    }
  }
);

app.get("/signup", (request, response) => {
  response.render("signup", { csrfToken: request.csrfToken() });
});

app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken() });
});

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) return next(err);
    response.redirect("/");
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (request, response) => {
    response.redirect("/sports");
  }
);

app.post("/users", async (request, response) => {
  const firstName = request.body.firstName;
  const lastName = request.body.lastName;
  const email = request.body.email;
  const password = request.body.password;
  const hashedPwd = password
    ? await bcrypt.hash(request.body.password, saltRounds)
    : "";
  try {
    const user = await Users.addUser(firstName, lastName, email, hashedPwd);
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/sports");
    });
  } catch (err) {
    if (err.name == "SequelizeValidationError") {
      if (!firstName) request.flash("firstName", "User Name cannot be empty");
      if (!email) request.flash("email", "Email cannot be empty");
      if (!password) request.flash("password", "Password cannot be empty");
      response.redirect("/signup");
    } else if (err.name == "SequelizeUniqueConstraintError") {
      request.flash("email", "email is already used");
      response.redirect("/signup");
    } else console.log(err.name);
  }
});

app.get(
  "/sports/new",
  connectEnsureLogin.ensureLoggedIn(),
  requireAdmin,
  (request, response) => {
    return response.render("new_sport", { csrfToken: request.csrfToken() });
  }
);

app.post("/sport/new", async (request, response) => {
  const sportName = request.body.sportName;
  try {
    const sport = await Sports.addSport(sportName);
    response.redirect(`/sport/${sport.id}`);
  } catch (err) {
    if (err.name == "SequelizeValidationError") {
      if (!sportName) request.flash("error", "Sport name cannot be empty");
      response.redirect("/sports/new");
    } else if (err.name == "SequelizeUniqueConstraintError") {
      request.flash("error", "Sport is already added");
      response.redirect("/sports/new");
    }
  }
});

app.get(
  "/sport/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const sport = await Sports.getSport(request.params.id);
      const upcomingSessions = await Sessions.getUpcomingSportSessions(
        request.params.id
      );
      const previousSessions = await Sessions.getPreviousSportSessions(
        request.params.id
      );
      response.render("sport", {
        sport,
        upcomingSessions,
        previousSessions,
        user: request.user,
        csrfToken: request.csrfToken(),
      });
    } catch (err) {
      console.error(err);
    }
  }
);

app.get(
  "/sport/:id/new_session",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const sport = await Sports.getSport(request.params.id);
      const users = await Users.findAll();
      response.render("new_session", {
        sport,
        users,
        csrfToken: request.csrfToken(),
      });
    } catch (err) {
      console.error(err);
    }
  }
);

app.post(
  "/new_session/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const date = request.body.date;
    const address = request.body.address;
    let joinedPlayers = request.body.playersName
      ? request.body.playersName.split(",")
      : [];
    const reqPlayers = request.body.nPlayers;
    const organiser = request.user.email;
    const sportId = request.params.id;
    try {
      const session = await Sessions.addSession(
        date,
        address,
        joinedPlayers,
        reqPlayers,
        organiser,
        sportId
      );
      response.redirect(`/sessions/${session.id}`);
    } catch (err) {
      if (err.name == "SequelizeValidationError") {
        if (!date) request.flash("date", "Add Date and Time of the session");
        if (!address) request.flash("address", "Add location of the session");
        if (!reqPlayers)
          request.flash(
            "req_players",
            "Add No. of required players for the session"
          );
        response.redirect(`/sport/${request.params.id}/new_session`);
      } else {
        console.log(err.name);
      }
    }
  }
);

app.get(
  "/sessions/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const session = await Sessions.getSession(request.params.id);
      const sport = await Sports.getSport(session.sportId);
      response.render("sessions", {
        sport,
        session,
        user: request.user,
        csrfToken: request.csrfToken(),
      });
    } catch (err) {
      console.error(err);
    }
  }
);

app.put(
  "/sessions/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const session = await Sessions.getSession(request.params.id);
      if (session.req_players < 1) return;
      let joinedPlayers = session.joinedPlayers;
      joinedPlayers.push(request.user.firstName);
      const updatedSession = await Sessions.updateSession(
        request.params.id,
        joinedPlayers,
        parseInt(session.reqPlayers) - 1
      );
      return response.json(updatedSession);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);
app.delete(
  "/sessions/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const session = await Sessions.getSession(request.params.id);
      let joinedPlayers = session.joinedPlayers;
      console.log(joinedPlayers);
      let index = joinedPlayers.indexOf(request.user.firstName);
      joinedPlayers.splice(index, 1);
      console.log(joinedPlayers);
      const updatedSession = await Sessions.updateSession(
        request.params.id,
        joinedPlayers,
        parseInt(session.reqPlayers) + 1
      );
      return response.json(updatedSession);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

module.exports = app;
