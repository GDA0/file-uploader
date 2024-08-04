const database = require("../utilities/database");
const formatSize = require("../utilities/format-size");

function controlIndexGet(req, res) {
  if (req.user) {
    return res.render("index", { title: "Home", user: req.user });
  }

  res.render("index", { title: "", user: null });
}

async function controlShareLinkGet(req, res) {
  const { shareLinkId } = req.params;

  try {
    const shareLink = await database.findShareLink(shareLinkId);

    // Check if the share link has expired
    if (new Date() > new Date(shareLink.expiresAt)) {
      return res.status(410).send("Share link has expired");
    }

    const folder = await database.findFolder(shareLink.folderId);

    // Format file sizes
    if (folder.files.length) {
      folder.files = folder.files.map((file) => ({
        ...file,
        formattedSize: formatSize(file.size),
      }));
    }

    res.render("shared-folder", { title: "", user: null, folder });
  } catch (error) {
    console.error("Error accessing shared folder:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = {
  controlIndexGet,
  controlShareLinkGet,
};
