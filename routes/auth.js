const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth-controller");

// Sign-up routes
router.get("/sign-up", authController.controlSignUpGet);
router.post("/sign-up", authController.controlSignUpPost);

// Log-in routes
router.get("/log-in", authController.controlLogInGet);

module.exports = router;
