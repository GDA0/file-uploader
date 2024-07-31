const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controllers/auth-controller");
const configurePassport = require("../configure-passport");

configurePassport(passport);

// Sign-up routes
router.get("/sign-up", authController.controlSignUpGet);
router.post("/sign-up", authController.controlSignUpPost);

// Log-in routes
router.get("/log-in", authController.controlLogInGet);
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);

module.exports = router;
