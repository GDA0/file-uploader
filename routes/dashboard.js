const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard");
const checkAuthentication = require("../checkAuthentication");

router.get("/", checkAuthentication, dashboardController.controlDashboardGet);

module.exports = router;
