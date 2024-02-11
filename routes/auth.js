import { Router } from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import DatabaseClient from "../utilities/databaseClient.js";

const connection = new DatabaseClient();
const router = Router()

// Setup mongo store
let mongoSessionStore = new MongoDBStore(session);
const mongoStore = new mongoSessionStore({
  uri: `mongodb+srv://gurtejmalik:${process.env.MONGO_KEY}@generativeai.qqdsbwh.mongodb.net`,
  collection: "sessions",
});

mongoStore.on('error', (error) => {
  console.log("Session store error: " + error);
});

// Passport Local Strategy for authentication
let strategy = new LocalStrategy(async function(username, password, done) {
  try {
      const user = await connection.models.User.findOne({ username });
      if (!user || user.password !== password) {
          return done(null, false, { message: 'Incorrect username or password.' });
      }
      return done(null, user);
  } catch (error) {
      return done(error);
  }
});
passport.use(strategy);

// Serialization and deserialization of user
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
      const user = await connection.models.User.findById(id);
      if (!user) {
          return done(null, false);
      }
      return done(null, user);
  } catch (error) {
      return done(error);
  }
});

// Initialize passport and session middleware
router.use(passport.initialize());
router.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
  })
);
router.use(passport.authenticate("session"));

router.post(
  "/login/password",
  passport.authenticate(strategy, {
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

router.get("/signup", function (req, res) {
  res.render("signup");
  return;
});

router.post('/signup', async function(req, res) {
  try {
      const User = connection.models.User;

        // Creating a new user document
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        await newUser.save();

        // Logging in the new user
        req.login(newUser, function(err) {
            if (err) { 
                return next(err); 
            }
            res.redirect('/');
        });
  } catch (error) {
      console.error('Error signing up:', error);
      res.redirect('/signup');
  }
});

router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


export default router;