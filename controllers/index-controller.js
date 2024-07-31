function controlIndexGet(req, res) {
  if (req.user) {
    return res.render("index", { title: "Home", user: req.user });
  }

  res.render("index", { title: "", user: null });
}

module.exports = {
  controlIndexGet,
};
