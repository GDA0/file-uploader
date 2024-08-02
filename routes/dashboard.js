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

router.get("/", checkAuthentication, dashboardController.handleDashboardGet);

router.post(
  "/folders/:folderId/upload",
  checkAuthentication,
  upload.single("file"),
  dashboardController.handleUploadPost
);

router.get(
  "/folders/:folderId",
  checkAuthentication,
  dashboardController.handleFolderGet
);

router.post(
  "/folders/:folderId/create",
  checkAuthentication,
  dashboardController.handleCreatePost
);

module.exports = router;
