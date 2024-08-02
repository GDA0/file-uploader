const database = require("../database");
const formatSize = require("../utilities/format-size");
const formatPath = require("../utilities/format-path");

async function controlDashboardGet(req, res) {
  res.redirect("/dashboard/folders/1");
}

function controlUploadPost(req, res) {
  const { originalname, path, size } = req.file;
  const { folderId } = req.params;
  const formattedPath = formatPath(path);

  database.createFile(originalname, formattedPath, +folderId, size);

  res.redirect(`/dashboard/folders/${folderId}`);
}

async function controlFolderGet(req, res) {
  const { folderId } = req.params;
  const folder = await database.findFolder(+folderId);

  // Format file sizes
  if (folder.files) {
    folder.files = folder.files.map((file) => ({
      ...file,
      formattedSize: formatSize(file.size),
    }));
  }

  res.render("dashboard", { title: "Folder", user: req.user, folder });
}

module.exports = {
  controlDashboardGet,
  controlUploadPost,
  controlFolderGet,
};
