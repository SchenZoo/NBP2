import { ExtractJwt, StrategyOptions } from 'passport-jwt'

export const jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}
