const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth-controller");

// Signup routes
router.get("/sign-up", authController.controlSignUpGet);

module.exports = router;
