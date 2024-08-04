const database = require("./database");

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

async function checkAuthorization(req, res, next) {
  try {
    const { folderId } = req.params;
    const userId = await database.findFolderUserId(folderId);

    if (userId !== req.user.id) {
      return res.redirect("/dashboard");
    }

    next();
  } catch (error) {
    console.error("Authorization check error:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  checkAuthentication,
  checkAuthorization,
};
