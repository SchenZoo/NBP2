import { hashSync } from 'bcrypt'

export const hashPassowrd = (password: string) => {
  return hashSync(password, 8)
}
