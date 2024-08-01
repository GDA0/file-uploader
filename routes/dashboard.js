const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const router = express.Router();
const upload = multer({ storage });

const dashboardController = require("../controllers/dashboard");
const checkAuthentication = require("../checkAuthentication");

router.get("/", checkAuthentication, dashboardController.controlDashboardGet);

router.post(
  "/upload",
  checkAuthentication,
  upload.single("file"),
  dashboardController.controlUploadPost
);

module.exports = router;
