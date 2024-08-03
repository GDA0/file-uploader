const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const database = require("../database");

function controlSignUpGet(req, res) {
  res.render("sign-up", {
    title: "Sign up",
    user: null,
    errors: [],
    formData: {},
  });
}

const controlSignUpPost = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .escape(),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .escape(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters long")
    .matches(/^[a-zA-Z0-9_.]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, or periods"
    )
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be between 8 and 64 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("sign-up", {
        title: "Sign up",
        user: null,
        errors: errors.array(),
        formData: req.body,
      });
    }

    try {
      const { firstName, lastName, username, password } = req.body;
      const usernameExists = await database.checkUsernameExists(username);

      if (usernameExists) {
        return res.render("sign-up", {
          title: "Sign up",
          user: null,
          errors: [{ msg: "Username is already taken" }],
          formData: req.body,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await database.createUser(
        firstName,
        lastName,
        username,
        hashedPassword
      );

      // Create a default folder for new users
      await database.createDefaultFolder(user.id);

      req.login(user, (error) => {
        if (error) {
          console.error("Error during auto login:", error);
          return res.render("sign-up", {
            title: "Sign up",
            user: null,
            errors: [
              {
                msg: "Sign-up successful, but an error occurred during auto login. Please log in manually.",
              },
            ],
            formData: req.body,
          });
        }
        return res.redirect("/");
      });
    } catch (error) {
      console.error("Error during user sign-up:", error);
      return res.render("sign-up", {
        title: "Sign up",
        user: null,
        errors: [
          { msg: "An error occurred during sign-up. Please try again later." },
        ],
        formData: req.body,
      });
    }
  },
];

function controlLogInGet(req, res) {
  res.render("log-in", { title: "Log in", user: null });
}

function controlLogOutGet(req, res) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/");
  });
}

module.exports = {
  controlSignUpGet,
  controlSignUpPost,
  controlLogInGet,
  controlLogOutGet,
};
