import passport = require("passport");

export const passportJwtMiddleware = passport.authenticate("jwt", {
  session: false,
});

export const passportJwtAnonymousMiddleware = passport.authenticate(
  ["jwt", "anonymous"],
  {
    session: false,
  }
);
