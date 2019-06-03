import passport = require('passport')

export const passportJwtMiddleware = passport.authenticate('jwt', { session: false })
