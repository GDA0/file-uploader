const database = require("../utilities/database");
const formatSize = require("../utilities/format-size");
const formatPath = require("../utilities/format-path");
const sortFolderContents = require("../utilities/sort-folder-contents");
const formatUpdatedAt = require("../utilities/format-updatedAt");

async function handleDashboardGet(req, res) {
  try {
    const homeFolderId = await database.findHomeFolderId(req.user.id);
    res.redirect(`/dashboard/folders/${homeFolderId}`);
  } catch (error) {
    console.error("Error redirecting to dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function handleUploadPost(req, res) {
  try {
    const { originalname, path, size } = req.file;
    const { folderId } = req.params;
    const formattedPath = formatPath(path);

    const filenameExists = await database.checkFilenameExist(
      originalname,
      +folderId
    );

    if (!filenameExists) {
      await database.createFile(originalname, formattedPath, +folderId, size);
    }

    res.redirect(`/dashboard/folders/${folderId}`);
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function handleFolderGet(req, res) {
  try {
    const { folderId } = req.params;
    const folder = await database.findFolder(+folderId);

    // Create breadcrumb path
    let breadcrumbs = [];
    let currentFolder = folder;
    while (currentFolder) {
      breadcrumbs.unshift({
        name: currentFolder.name,
        id: currentFolder.id,
      });
      currentFolder = currentFolder.parent;
    }

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
      breadcrumbs,
    });
  } catch (error) {
    console.error("Error finding folder:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function handleCreatePost(req, res) {
  try {
    const { name } = req.body;
    const { folderId } = req.params;

    const foldernameExists = await database.checkFoldernameExist(
      name,
      +folderId
    );

    if (!foldernameExists) {
      await database.createFolder(name, req.user.id, +folderId);
    }

    res.redirect(`/dashboard/folders/${folderId}`);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  handleDashboardGet,
  handleUploadPost,
  handleFolderGet,
  handleCreatePost,
};
