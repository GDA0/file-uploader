async function controlDashboardGet(req, res) {
  res.redirect("/dashboard/folders/1");
}

function controlUploadPost(req, res) {
  req.flash("success", "File uploaded successfully");
  res.redirect("/dashboard");
}

module.exports = {
  controlDashboardGet,
  controlUploadPost,
};
