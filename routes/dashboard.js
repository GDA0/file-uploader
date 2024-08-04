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
const {
  checkAuthentication,
  checkAuthorization,
} = require("../utilities/auth");

router.get("/", checkAuthentication, dashboardController.handleDashboardGet);

router.post(
  "/folders/:folderId/upload",
  checkAuthentication,
  checkAuthorization,
  upload.single("file"),
  dashboardController.handleUploadPost
);

router.get(
  "/folders/:folderId",
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleFolderGet
);

router.post(
  "/folders/:folderId/create",
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleCreatePost
);

router.get(
  "/folders/:folderId/update",
  checkAuthentication,
  checkAuthentication,
  dashboardController.handleUpdateGet
);

module.exports = router;
