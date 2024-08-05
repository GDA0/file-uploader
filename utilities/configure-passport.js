const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const database = require('./database')

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await database.findUser('username', username)
        if (!user) {
          return done(null, false, {
            message: 'Incorrect username or password'
          })
        }
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
          return done(null, false, {
            message: 'Incorrect username or password'
          })
        }
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await database.findUser('id', id)
      done(null, user)
    } catch (error) {
      done(error)
    }
  })
}
