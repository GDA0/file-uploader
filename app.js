const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const engine = require("ejs-mate");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
require("dotenv").config();

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const dashboardRouter = require("./routes/dashboard");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", engine);

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session management
const prisma = new PrismaClient();
app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Clean up expired sessions every 2 minutes
      dbRecordIdIsSessionId: true, // Use session ID as record ID
    }),
    secret: process.env.SESSION_SECRET,
    resave: false, // Avoid resaving sessions that haven't been modified
    saveUninitialized: false, // Only save sessions that are initialized
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Session cookie expires in 1 day
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent client-side JavaScript from accessing cookies
    },
  })
);
app.use(passport.session());

// Message handling middleware
app.use((req, res, next) => {
  const messages = req.session.messages || [];
  res.locals.messages = messages;
  res.locals.hasMessages = messages.length > 0;
  req.session.messages = [];
  next();
});

// Route handling
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/dashboard", dashboardRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
