const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controllers/auth");
const configurePassport = require("../utilities/configure-passport");

configurePassport(passport);

// Check if the user is authenticated
function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

// Sign-up routes
router.get("/sign-up", authController.controlSignUpGet);
router.post("/sign-up", authController.controlSignUpPost);

// Log-in routes
router.get("/log-in", checkAuthentication, authController.controlLogInGet);
router.post(
  "/log-in",
  checkAuthentication,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);

// Log-out route
router.get("/log-out", authController.controlLogOutGet);

module.exports = router;
