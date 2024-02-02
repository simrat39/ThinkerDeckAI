import { Router } from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import sqliteStore from "connect-sqlite3";
import DatabaseConnection from "../database_connection.js"

const connection = new DatabaseConnection()

const router = Router()
let SQLiteStore = sqliteStore(session);

let strat = new LocalStrategy(async function verify(username, password, cb) {
  const sqlRet = await connection
    .promise()
    .query("SELECT * FROM Accounts WHERE username = ?", [username]);

  if (!sqlRet || sqlRet.length <= 1 || sqlRet[0].length == 0) {
    return cb(null, false, { message: "Incorrect username or password." });
  }

  const user = sqlRet[0][0];

  if (user.password == password) {
    return cb(null, user);
  }

  return cb(null, false, { message: "Incorect username or password." });
});

passport.use(strat);

router.use(passport.initialize());

router.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "." }),
  })
);

router.use(passport.authenticate("session"));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

router.post(
  "/login/password",
  passport.authenticate(strat, {
    successRedirect: "/",
    failureRedirect: "/signin",
  })
);

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/signin", function (req, res) {
  res.render("signin");
  return;
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
  return;
});

router.post("/signup", async function (req, res, next) {
  connection
    .promise()
    .query("INSERT INTO Accounts (username, password) VALUES (?, ?)", [
      req.body.username,
      req.body.password,
    ])
    .then(() => {
      let user = {
        id: req.body.username,
        username: req.body.username,
      };
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    }).catch(() => {
      res.redirect("/signup")
    });
});

router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


export default router;