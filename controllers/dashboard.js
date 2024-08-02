const database = require("../database");
const formatSize = require("../utilities/format-size");
const formatPath = require("../utilities/format-path");
const sortFolderContents = require("../utilities/sort-folder-contents");
const formatUpdatedAt = require("../utilities/format-updatedAt");

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

  // Format file sizes and updatedAt
  if (folder.files.length) {
    folder.files = folder.files.map((file) => ({
      ...file,
      formattedSize: formatSize(file.size),
      formattedUpdatedAt: formatUpdatedAt(file.updatedAt),
    }));
  }

  if (folder.subfolders.length) {
    folder.subfolders = folder.subfolders.map((subfolder) => ({
      ...subfolder,
      formattedUpdatedAt: formatUpdatedAt(subfolder.updatedAt),
    }));
  }

  const sortedFolder = sortFolderContents(folder);

  res.render("dashboard", {
    title: "Folder",
    user: req.user,
    folder: sortedFolder,
  });
}

module.exports = {
  controlDashboardGet,
  controlUploadPost,
  controlFolderGet,
};
