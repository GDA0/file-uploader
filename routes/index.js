const express = require("express");
const router = express.Router();

const indexController = require("../controllers/index");

router.get("/", indexController.controlIndexGet);

router.get("/share/:shareLinkId", indexController.controlShareLinkGet);

module.exports = router;
