// Check if the user is authenticated
module.exports = function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};
