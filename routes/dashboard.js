const express = require('express')
const multer = require('multer')

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

const dashboardController = require('../controllers/dashboard')
const {
  checkAuthentication,
  checkAuthorization
} = require('../utilities/auth')

router.get('/', checkAuthentication, dashboardController.handleDashboardGet)

router.post(
  '/folders/:folderId/upload',
  checkAuthentication,
  checkAuthorization,
  upload.single('file'),
  dashboardController.handleUploadPost
)

router.get(
  '/folders/:folderId',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleFolderGet
)

router.post(
  '/folders/:folderId/create',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleCreatePost
)

router.get(
  '/folders/:folderId/update',
  checkAuthentication,
  checkAuthentication,
  dashboardController.handleUpdateGet
)
router.post(
  '/folders/:folderId/update',
  checkAuthentication,
  checkAuthentication,
  dashboardController.handleUpdatePost
)

router.get(
  '/folders/:folderId/delete',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleDeleteGet
)
router.post(
  '/folders/:folderId/delete',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleDeletePost
)

router.get(
  '/folders/:folderId/files/:fileId',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleFileGet
)

router.get(
  '/folders/:folderId/files/:fileId/download',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleDownloadGet
)

router.get(
  '/folders/:folderId/share',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleShareGet
)
router.post(
  '/folders/:folderId/share',
  checkAuthentication,
  checkAuthorization,
  dashboardController.handleSharePost
)

module.exports = router
